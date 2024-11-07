

import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import styles from "./BlogPosts.module.css";
import { FaThumbsUp, FaComment, FaShareAlt } from "react-icons/fa";

const BlogPosts = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'blogs'));
                const blogsData = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setBlogs(blogsData);
            } catch (err) {
                console.error('Error fetching blogs:', err);
                setError('Failed to load blogs.');
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    // Function to format Firestore timestamp to readable date
    const formatDate = (timestamp) => {
        if (timestamp) {
            const date = timestamp.toDate(); 
            return date.toLocaleDateString(); 
        }
        return '';
    };
    

    return (
        <>
            <div id="blogSection" className={`${styles.gradient} p-4`}>
                <div className={styles.titleWrapper}>
                    <h2 className={styles.title}>All <span>Blogs</span></h2>
                    <div className={styles.decorativeLine}></div>
                </div>

                <div className="container">
                    {loading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p className="text-danger">{error}</p>
                    ) : (
                        <>
                            <div className="row g-4">
                                {blogs.map((blog) => (
                                    <div key={blog.id} className="col-md-4">
                                        <div className={`card h-100 ${styles.card}`}>
                                            <img
                                                src={blog.bannerUrl}
                                                className={`${styles.banner}`}
                                                alt={blog.title}
                                            />
                                            <div className="card-body">
                                                <h5 className="card-title fw-bold">
                                                    <Link
                                                        to={`/blog/${blog.id}`} // Navigate to the blog details page using blog ID
                                                        className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden no-underline"
                                                    >
                                                        {blog.title}
                                                    </Link>
                                                </h5>
                                                <p className="card-text m-0 text-muted">
                                                    <small><strong>Author:</strong> {blog.authorName}</small>
                                                </p>
                                                <p className="card-text m-0 text-muted mb-3">
                                                    <small><strong>Published:</strong> {formatDate(blog.createdAt)}</small>
                                                </p>
                                                <div className="d-flex justify-content-between mt-auto">
                                                    <button className={`btn btn-outline-danger ${styles.actionButton}`}>
                                                        <FaThumbsUp /> {blog.likesCount}
                                                    </button>
                                                    <button className={`btn btn-outline-info ${styles.actionButton}`}>
                                                        <FaComment /> {blog.commentsCount}
                                                    </button>
                                                    <button className={`btn btn-outline-success ${styles.actionButton}`}>
                                                        <FaShareAlt /> Share
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default BlogPosts;
