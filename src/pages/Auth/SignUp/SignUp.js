import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";
import { auth, db } from "../../../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import styles from "./SignUp.module.css";

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const sendEmail = async (data) => {
    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': process.env.REACT_APP_BREVO_API_KEY, // Use environment variable for security
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            setMessage('Thank you for signing up to Campus Blogs!');
        } else {
            setMessage('Sign-up successful, but there was an issue sending the email.');
        }
    } catch (error) {
        setMessage('Sign-up successful, but email could not be sent.');
    }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    const { email, name, password } = formData;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const createdAt = new Date();

      await setDoc(doc(db, 'users', user.uid), {
        email,
        name,
        createdAt,
        photoURL: '',
      });

      const emailData = {
        sender: { name: 'Campus Blogs', email: 'krishhmail01@gmail.com' },
        to: [{ email, name }],
        subject: 'Welcome to Campus Blogs!',
        htmlContent: `
          <html>
            <body>
              <p style="font-size:40px; text-align:center;">CAMPUS BLOGS</p> <br>
              <h1>Welcome, ${name}!</h1>
              <p>Thank you for joining Campus Blogs. We are excited to have you here!</p>
              <br>
              <p>Regards,</p>
              <p>Krishna Paul</p>
              <p>Campus Blogs</p>
            </body>
          </html>`,
      };

      await sendEmail(emailData); // Implement sendEmail method to use Brevo API

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Sign-up error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
      <div className={`card p-4 ${styles.signUpCard}`}>
        <h2 className="text-center mb-4">Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className={`mb-3 ${styles.inputGroup}`}>
            <FaUser className={styles.icon} />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          <div className={`mb-3 ${styles.inputGroup}`}>
            <FaEnvelope className={styles.icon} />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          <div className={`mb-4 ${styles.inputGroup}`}>
            <FaLock className={styles.icon} />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className={styles.input}
              required
            />
          </div>
          <button type="submit" className={`btn w-100 ${styles.submitButton}`} disabled={loading}>
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        {error && <p className="text-danger text-center mt-3">{error}</p>}
        {success && <p className="text-success text-center mt-3">Sign-up successful!</p>}
        <p className="text-center mt-3">
          Already have an account? <Link to="/signin" className={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
