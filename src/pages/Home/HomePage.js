import React, { useState, useMemo, useEffect } from "react";
import styles from "./HomePage.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaThumbsUp, FaComment, FaShareAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import WelcomeSection from "../../components/WelcomeSection/WelcomeSection";
import { query, collection, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';

const ITEMS_PER_PAGE = 6;

const HomePage = () => {
  const [blog, setBlogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestBlogs = async () => {
        try {
            const q = query(
                collection(db, 'blogs'),
                orderBy('createdAt', 'desc'),
                limit(20)
            );
            const querySnapshot = await getDocs(q);
            const blogsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate().toLocaleDateString() || 'Unknown',
                likes: doc.data().likes || 0,
                comments: doc.data().comments || 0,
            }));
            setBlogs(blogsData);
        } catch (err) {
            console.error('Error fetching blogs:', err);
            setError('Failed to load blogs.');
        } finally {
            setLoading(false);
        }
    };

    fetchLatestBlogs();
  }, []);

  const sortedBlogs = useMemo(() => {
    return [...blog].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [blog]);

  const totalPages = Math.ceil(sortedBlogs.length / ITEMS_PER_PAGE);

  const getCurrentBlogs = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sortedBlogs.slice(startIndex, endIndex);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <WelcomeSection />

      <div id="blogSection" className={`${styles.gradient} p-4`}>
        <div className={styles.titleWrapper}>
          <h2 className={styles.title}>Latest <span>Blogs</span></h2>
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
                {getCurrentBlogs().map((blog) => (
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
                     key={blog.id}
                    className="block bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden no-underline"
                    >
                   {blog.title}
                    </Link>
                    </h5>
                        <p className="card-text m-0 text-muted">
                          <small><strong>Author:</strong> {blog.authorName}</small>
                        </p>
                        <p className="card-text m-0 text-muted mb-3">
                          <small><strong>Published:</strong> {blog.createdAt}</small>
                        </p>
                        {/* <p className="card-text"
                        >
                          {blog.content.length > 100 ? `${blog.content.substring(0, 100)}...` : blog.content}
                        </p> */}
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

              <div className={styles.pagination}>
                <button 
                  className={styles.pageButton}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <FaChevronLeft />
                </button>

                {getPageNumbers().map((number, index) => (
                  number === '...' ? (
                    <span key={`dots-${index}`} className={styles.paginationDots}>...</span>
                  ) : (
                    <button
                      key={number}
                      className={`${styles.pageButton} ${currentPage === number ? styles.activeButton : ''}`}
                      onClick={() => handlePageChange(number)}
                    >
                      {number}
                    </button>
                  )
                ))}

                <button 
                  className={styles.pageButton}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <FaChevronRight />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default HomePage;
