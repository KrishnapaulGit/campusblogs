import React, { useEffect, useState } from 'react';
import { db, auth, storage } from '../../services/firebase';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import styles from "./EditBlog.module.css";

const EditBlog = () => {
    const { id } = useParams(); // Get the blog ID from the URL
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [bannerImage, setBannerImage] = useState(null);
    const [bannerUrl, setBannerUrl] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // Hook for navigation

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                console.log('Fetching blog with ID:', id);
                const blogRef = doc(db, 'blogs', id);
                const blogSnap = await getDoc(blogRef);

                if (blogSnap.exists()) {
                    const blogData = blogSnap.data();
                    console.log('Blog data:', blogData);
                    setTitle(blogData.title);
                    setContent(blogData.content);
                    setBannerUrl(blogData.bannerUrl); 
                } else {
                    console.log('Blog not found');
                    setError('Blog not found');
                }
            } catch (error) {
                console.error('Error fetching blog:', error);
                setError('Failed to fetch blog.');
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id]);

    const handleUpdateBlog = async (e) => {
        e.preventDefault();
        if (!title || !content) {
            setError('Title and content are required.');
            return;
        }

        setLoading(true); // Set loading to true when update starts
        try {
            let imageUrl = bannerUrl;

            if (bannerImage) {
                const bannerRef = ref(storage, `banners/${auth.currentUser.uid}_${Date.now()}`);
                await uploadBytes(bannerRef, bannerImage);
                imageUrl = await getDownloadURL(bannerRef);
            }

            const blogRef = doc(db, 'blogs', id);
            await updateDoc(blogRef, {
                title,
                content,
                bannerUrl: imageUrl,
            });
            navigate('/');
        } catch (err) {
            console.error('Error updating blog:', err);
            setError('Failed to update blog.');
        } finally {
            setLoading(false); // Set loading to false once update is done
        }
    };

    const handleBannerChange = (e) => {
        if (e.target.files[0]) {
            setBannerImage(e.target.files[0]);
            setBannerUrl(URL.createObjectURL(e.target.files[0]));
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className={`${styles.mainContainer} p-4`}>
            <div className={styles.titleWrapper}>
                <h2 className={styles.title}>Edit <span>Post</span></h2>
                <div className={styles.decorativeLine}></div>
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}

            <form onSubmit={handleUpdateBlog}>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={styles.formInput}
                    required
                />

                <input
                    type="file"
                    accept="image/*"
                    onChange={handleBannerChange}
                    className={styles.formInput}
                />

                {bannerUrl && (
                    <img
                        src={bannerUrl}
                        alt="Banner Preview"
                        className={styles.formInput}
                    />
                )}

                <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={{
                        toolbar: [
                            [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
                            [{ size: [] }],
                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                            ['link', 'image'],
                            ['clean']
                        ],
                    }}
                    formats={[
                        'header', 'font', 'size',
                        'bold', 'italic', 'underline', 'strike', 'blockquote',
                        'list', 'bullet',
                        'link', 'image'
                    ]}
                    style={{ height: '300px' }}
                />

                <div className={`${styles.buttonContainer} p-4`}>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`${styles.button} p-2`}
                    >
                        {loading ? 'Updating...' : 'Update Blog'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditBlog;
