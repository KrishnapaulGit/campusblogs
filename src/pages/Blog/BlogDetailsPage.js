import React, { useState, useEffect } from "react";
import styles from "./BlogDetails.module.css";
import { db, auth } from '../../services/firebase';
import {
    doc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    Timestamp,
    addDoc,
    updateDoc,
    deleteDoc,
} from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { FaUserAlt, FaRegCalendarAlt, FaRegCommentAlt, FaThumbsUp,FaHeart } from "react-icons/fa";
import DOMPurify from 'dompurify';

const BlogDetails = () => {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [editCommentId, setEditCommentId] = useState(null);
    const [user, setUser] = useState(null);
    const [imgURL, setImgUrl] = useState('');

    useEffect(() => {
        const fetchBlogDetails = async () => {
            try {
                const docRef = doc(db, 'blogs', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setBlog({
                        id: docSnap.id,
                        ...docSnap.data(),
                        createdAt: docSnap.data().createdAt?.toDate() || new Date(),
                    });
                } else {
                    setError('Blog not found.');
                }
            } catch (err) {
                console.error('Error fetching blog details:', err);
                setError('Failed to load blog details.');
            } finally {
                setLoading(false);
            }
        };

        const fetchComments = async () => {
            try {
                const commentsQuery = query(
                    collection(db, 'comments'),
                    where('blogId', '==', id)
                );
                const commentsSnapshot = await getDocs(commentsQuery);

                const commentsData = commentsSnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt?.toDate() || new Date(),
                }));
                setComments(commentsData);
            } catch (error) {
                console.error('Error fetching comments:', error);
            }
        };

        const fetchUserData = async () => {
            if (user) {
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              if (userDoc.exists()) {
                const data = userDoc.data();
                setImgUrl(data.photoURL || '');  
              }
            }
          };
      
        fetchUserData();

        fetchBlogDetails();
        fetchComments();

        const unsubscribe = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setUserName(currentUser.displayName || 'Anonymous');
                setUserEmail(currentUser.email);
            }
        });
        return () => unsubscribe();
    }, [id]);

    const sanitizedContent = blog ? DOMPurify.sanitize(blog.content) : '';

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            alert("Comment cannot be empty.");
            return;
        }

        const commentData = {
            name: userName || 'Anonymous',
            email: userEmail,
            comment: newComment,
            blogId: blog.id,
            userId: user ? user.uid : null,
            createdAt: Timestamp.now(),
        };

        try {
            const commentRef = await addDoc(collection(db, 'comments'), commentData);
            setComments([...comments, { ...commentData, id: commentRef.id }]);
            await updateDoc(doc(db, 'blogs', blog.id), {
                commentsCount: (blog.commentsCount || 0) + 1,
            });
            setBlog((prevBlog) => ({
                ...prevBlog,
                commentsCount: (prevBlog.commentsCount || 0) + 1,
            }));
            setNewComment('');
            setUserName('');
            setUserEmail('');
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    };

    const handleEditComment = (comment) => {
        setEditCommentId(comment.id);
        setNewComment(comment.comment);
    };

    const handleUpdateComment = async (e) => {
        e.preventDefault();
        const commentRef = doc(db, 'comments', editCommentId);
        try {
            await updateDoc(commentRef, { comment: newComment });
            setComments((prevComments) =>
                prevComments.map((c) =>
                    c.id === editCommentId ? { ...c, comment: newComment } : c
                )
            );
            setEditCommentId(null);
            setNewComment('');
        } catch (error) {
            console.error("Error updating comment:", error);
        }
    };

    const handleDeleteComment = async (commentId) => {
        const commentRef = doc(db, 'comments', commentId);
        try {
            await deleteDoc(commentRef);
            setComments((prevComments) => prevComments.filter((c) => c.id !== commentId));
            await updateDoc(doc(db, 'blogs', blog.id), {
                commentsCount: blog.commentsCount - 1,
            });
            setBlog((prevBlog) => ({
                ...prevBlog,
                commentsCount: prevBlog.commentsCount - 1,
            }));
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    };

    const handleLike = async () => {
        if (blog && user) {
            const newLikesCount = (blog.likesCount || 0) + 1;
            const blogRef = doc(db, 'blogs', blog.id);
            await updateDoc(blogRef, { likesCount: newLikesCount });
            setBlog((prevBlog) => ({ ...prevBlog, likesCount: newLikesCount }));
        }
    };

    return (
      
        <div className="container py-5 mt-5">
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-danger">{error}</p>
            ) : blog ? (
                <div className={`${styles.mainCard} shadow-lg`}>
                    {/* Hero Section */}
                    <div className={styles.heroSection}>
                        <img
                            src={blog.bannerUrl}
                            className={styles.bannerImage}
                            alt={blog.title}
                        />
                        <div className={styles.heroOverlay}>
                            <h1 className="display-4 fw-bold text-white mb-4">
                                {blog.title}
                            </h1>
                            <div className="d-flex gap-4 text-white">
                                <div className="d-flex align-items-center">
                                    <FaUserAlt className="me-2" size={16} />
                                    <span>{blog.authorName}</span>
                                </div>
                                <div className="d-flex align-items-center">
                                    <FaRegCalendarAlt className="me-2" size={16} />
                                    <span>{blog.createdAt.toLocaleDateString()}</span>
                                </div>
                                <div className="d-flex align-items-center " onClick={handleLike}>
                                <FaThumbsUp className="me-2" size={16} />
                                <span className="ml-2 text-white bg-blue-500 px-2 py-1 rounded">
                                 {blog.likesCount || 0}
                                </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Section */}
                    
                    <div className="container py-5">
                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                            <div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
                                {/* Comments Section */}
                                <div className="mt-5">
                                    <div className="d-flex align-items-center mb-4">
                                        <h2 className="h4 mb-0">Comments ({blog.commentsCount || 0})</h2>
                                    </div>

                                    {/* Comments List */}
                                    <div className={styles.commentsSection}>
                                        {comments.length === 0 ? (
                                            <div className={styles.emptyComments}>
                                                <FaRegCommentAlt size={32} className="text-muted mb-2" />
                                                <p className="text-muted mb-0">
                                                    Be the first to comment!
                                                </p>
                                            </div>
                                        ) : (
                                            comments.map((comment) => (
                                                <div key={comment.id} className={styles.commentCard}>
                                                    <div className="d-flex">
                                                        
                                                        <img src={imgURL || 'https://static.vecteezy.com/system/resources/previews/019/879/186/non_2x/user-icon-on-transparent-background-free-png.png'}
                                                            className={styles.commentAvatar}
                                                        />
                    
                                                        <div className="ms-3 flex-grow-1">
                                                            <div className="fw-bold">{comment.name}</div>
                                                            <small className="text-muted">
                                                                {comment.timestamp}
                                                            </small>
                                                            <p className="mt-2 mb-0">{comment.comment}</p>
                                                            {user && user.uid === comment.userId && (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleEditComment(comment)}
                                                                        className="text-blue-500 mr-2"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteComment(comment.id)}
                                                                        className="text-red-500"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Comment Form */}
                                    <div className={`${styles.commentForm}`}>
                                        <h3 className="h5 mb-4">Leave a Comment</h3>
                                        <form onSubmit={editCommentId ? handleUpdateComment : handleAddComment} className="mb-4">
                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <input
                                                        type="text"
                                                        className={`form-control ${styles.formInput}`}
                                                        placeholder="Your Name"
                                                        value={userName}
                                                        onChange={(e) => setUserName(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-md-6">
                                                    <input
                                                        type="email"
                                                        className={`form-control ${styles.formInput}`}
                                                        placeholder="Your Email"
                                                        value={userEmail}
                                                        onChange={(e) => setUserEmail(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="col-12">
                                                    <textarea
                                                        className={`form-control ${styles.formInput}`}
                                                        rows="4"
                                                        value={newComment}
                                                        onChange={(e) => setNewComment(e.target.value)}
                                                        placeholder="Your Comment"
                                                        required
                                                    />
                                                </div>
                                                <div className="col-12">
                                                    <button type="submit" className={styles.submitButton}>
                                                        {editCommentId ? 'Update Comment' : 'Post Comment'}
                                                    </button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <p>No blog found.</p>
            )}
        </div>
    );
};

export default BlogDetails;
