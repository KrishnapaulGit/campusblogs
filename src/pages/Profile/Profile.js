import React, { useEffect, useState } from "react";
import { auth, db, storage } from "../../services/firebase"; 
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaUserEdit, FaEnvelope } from "react-icons/fa";
import styles from "./Profile.module.css"; 

const Profile = () => {
  const user = auth.currentUser;
  const [name, setName] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [signupTime, setSignupTime] = useState('');
  const [isEditing, setIsEditing] = useState(false); 
  const [imgURL, setImgUrl] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setName(data.name);
          setImgUrl(data.photoURL || '');  
          setSignupTime(new Date(data.createdAt.seconds * 1000).toLocaleString()); 
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;
      if (file) {
        const storageRef = ref(storage, `profileImages/${user.uid}`);
        await uploadBytes(storageRef, file);
        imageUrl = await getDownloadURL(storageRef);
        setImgUrl(imageUrl);  // Update the imgURL state
      }

      // Update Firestore document
      await setDoc(doc(db, 'users', user.uid), {
        name,
        ...(imageUrl && { photoURL: imageUrl }), 
      }, { merge: true });

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile: ' + error.message);
    } finally {
      setLoading(false);
      setIsEditing(false); 
    }
  };

  return (
    <>
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className={`card p-4 ${styles.profileCard}`}>
          <div className="text-center">
            <img
              src={imgURL || 'https://static.vecteezy.com/system/resources/previews/019/879/186/non_2x/user-icon-on-transparent-background-free-png.png'}
              alt="Profile"
              className={`${styles.profileImage} mb-3`}
            />
            <h3 className="fw-bold mb-1">{name}</h3>
          </div>
          <div className="mt-4">
            <div className={`d-flex align-items-center mb-3 ${styles.infoGroup}`}>
              <FaEnvelope className={styles.icon} />
              <span className={styles.infoText}>{user?.email}</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className={`btn ${styles.editButton}`}
              >
                <FaUserEdit /> Edit Profile
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col items-center mt-4">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Update Name"
                  className="mb-2 p-2 border rounded"
                  required
                />
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="mb-2"
                  accept="image/*" 
                />
                <button type="submit" disabled={loading} className={`${styles.updateButton}`}>
                  {loading ? 'Updating...' : 'Update Now'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 text-black p-2 rounded mt-2"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
