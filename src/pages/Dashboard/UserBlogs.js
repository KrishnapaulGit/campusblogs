import styles from "./Dashboard.module.css";
import { FaPlus, FaEdit, FaTrash,FaThumbsUp, FaComment } from "react-icons/fa";
import React, { useEffect, useState } from 'react';
import { db,auth } from '../../services/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const UserBlogs = ()=>{
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const formatDate = (timestamp) => {
        if (timestamp) {
            const date = timestamp.toDate(); 
            return date.toLocaleDateString(); 
        }
        return '';
    };

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) {
            setLoading(false);
            return;
        }
        

        const userId = user.uid;
        const q = query(collection(db, 'blogs'), where('authorId', '==', userId));

        const unsubscribe = onSnapshot(q, async (querySnapshot) => {
            const blogsData = await Promise.all(
                querySnapshot.docs.map(async (doc) => {
                    const blogData = { id: doc.id, ...doc.data() };

                    // Fetch comments count for each blog
                    const commentsQuery = query(
                        collection(db, 'comments'),
                        where('blogId', '==', doc.id)
                    );
                    const commentsSnapshot = await getDocs(commentsQuery);
                    blogData.commentsCount = commentsSnapshot.size; // Set comments count

                    return blogData;
                })
            );

            setBlogs(blogsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching blogs: ", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this blog?");
        if (confirmDelete) {
            try {
                await deleteDoc(doc(db, 'blogs', id));
            } catch (error) {
                console.error("Error deleting blog: ", error);
            }
        }
    };

    const handleCreateBlog = ()=>{
      navigate(`/dashboard/:create-blog`);
    }
    const handleEdit = (id) => {
      navigate(`/edit-blog/${id}`);
  };

    if (loading) {
        return <p>Loading...</p>;
    }
    return(
        <div className={`${styles.dashboard} container mt-5`}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className={`${styles.dashboardTitle} fw-bold`}>My Blogs</h2>
        <button className={`btn ${styles.addButton}`} onClick={handleCreateBlog}>
          <FaPlus /> Add Blog
        </button>
      </div>

      <div className="row g-4">
        {blogs.map((blog) => (
          <div key={blog.id} className="col-md-4">
            <div className={`card h-100 ${styles.blogCard}`}>
              <div className="card-body">
                <h5 className={`card-title ${styles.cardTitle}`}>{blog.title}</h5>
                <p className={`card-text ${styles.cardContent}`}>
                {formatDate(blog.createdAt)}
                </p>
                <div className="d-flex ">
                <p >
                    <FaComment /> {blog.commentsCount || 0 }
                  </p>
                  <p className="px-4">
                    <FaThumbsUp /> {blog.likesCount || 0 }
                  </p>
                </div>
                <div className="d-flex justify-content-end">
                  <button className={`btn ${styles.actionButton} me-2`} onClick={()=>handleEdit(blog.id)}>
                    <FaEdit /> Edit
                  </button>
                  <button className={`btn ${styles.actionButton}`} onClick={() => handleDelete(blog.id)} >
                    <FaTrash /> Delete
                  </button>
                </div>
                </div>
                </div>
              </div>
        ))}
      </div>
    </div>
    )
}

export default UserBlogs;