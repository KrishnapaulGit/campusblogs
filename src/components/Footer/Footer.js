import React, { useState } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { db } from '../../services/firebase'; // Import Firebase services
import { doc, setDoc } from 'firebase/firestore';
import styles from './Footer.module.css';

// Function to send email via Brevo API
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
      return 'Thank you for subscribing!';
    } else {
      const responseBody = await response.json();
      console.error('Brevo API error:', responseBody); // Log the error from Brevo API
      return 'Subscription successful, but there was an issue sending the email.';
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return 'Subscription successful, but email could not be sent.';
  }
};

const Footer = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter a valid email.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Add email to the subscribers collection in Firestore
      await setDoc(doc(db, 'subscribers', email), {
        email,
        subscribedAt: new Date(),
      });

      // Prepare email data for Brevo
      const emailData = {
        sender: { name: 'Campus Blogs', email: 'krishhmail01@gmail.com' },
        to: [{ email }],
        subject: 'Thank you for subscribing!',
        htmlContent: `
          <html>
            <body>
              <p style="font-size:40px; text-align:center;">CAMPUS BLOGS</p> <br>
              <h1>Thank you for subscribing to Campus Blogs!</h1>
              <p>We are excited to keep you updated with the latest posts and stories!</p>

              <br>
              <p>Regards,</p>
              <br>
              <p>Krishna Paul</p>
              <p>Campus Blogs</p>
            </body>
          </html>`,
      };

      // Send the email using Brevo API
      const responseMessage = await sendEmail(emailData);
      setMessage(responseMessage);

      setEmail(''); // Clear email input after subscription

    } catch (error) {
      console.error('Error subscribing:', error);
      setMessage('There was an issue with the subscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className="row">
          {/* Brand Section */}
          <div className="col-lg-4 col-md-6 mb-4 mb-lg-0">
            <div className={styles.brandName}>CampusBlog</div>
            <p>Discover amazing stories and insights from our community of writers and thinkers.</p>
            <div className="mt-3">
            <a href='https://www.facebook.com/profile.php?id=100030945284496' target='_blank'>

              <FaFacebookF className={styles.socialIcon} size={20}/>
            </a>

            <a href='#'>
              <FaTwitter className={styles.socialIcon} size={20} />
            </a>
            <a href='#'>
              <FaInstagram className={styles.socialIcon} size={20} />
            </a>
            <a href='https://www.linkedin.com/in/krishna-paul-2465a31bb/' target='_blank'>
              <FaLinkedinIn className={styles.socialIcon} size={20} />
            </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4 mb-lg-0">
            <h5 className={styles.sectionTitle}>Quick Links</h5>
            <a href="/" className={styles.footerLink}>Home</a>
            <a href="/about" className={styles.footerLink}>About</a>
            <a href="/blogs" className={styles.footerLink}>Blogs</a>
          </div>

          {/* Categories */}
          <div className="col-lg-2 col-md-6 mb-4 mb-lg-0">
            <h5 className={styles.sectionTitle}>Categories</h5>
            <a href="#" className={styles.footerLink}>Technology</a>
            <a href="#" className={styles.footerLink}>Lifestyle</a>
            <a href="#" className={styles.footerLink}>Travel</a>
            <a href="#" className={styles.footerLink}>Food</a>
          </div>

          {/* Newsletter */}
          <div className="col-lg-4 col-md-6">
            <h5 className={styles.sectionTitle}>Newsletter</h5>
            <p>Subscribe to our newsletter for the latest updates and stories.</p>
            <div className="mt-3 d-flex flex-column flex-md-row">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                className={styles.subscribeInput}
              />
              <button 
                className={styles.subscribeButton} 
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </div>
            {message && <p className="mt-3">{message}</p>}
          </div>
        </div>

        {/* Copyright */}
        <div className={styles.copyright}>
          <p className="mb-0">
            © {new Date().getFullYear()} Campus Blogs.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
