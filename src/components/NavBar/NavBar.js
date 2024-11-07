import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaBlog,
  FaUsers,
  FaEnvelope,
  FaBars,
  FaTimes,
  FaSearch,
} from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { MdDashboard } from "react-icons/md";
import styles from "./NavBar.module.css";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../services/firebase"; 
import { signOut } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

const NavBar = ({user}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userImage, setUserImage] = useState("");
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserData(user ? user.uid : null);
    });

    return () => unsubscribe(); 
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [userData]);

  // useEffect(() => {
  //   if (userData != null) {
  //     setUserImage(userData.photoURL || "https://static.vecteezy.com/system/resources/previews/019/879/186/non_2x/user-icon-on-transparent-background-free-png.png"); 
  //     setUserImage("https://static.vecteezy.com/system/resources/previews/019/879/186/non_2x/user-icon-on-transparent-background-free-png.png");
  //   }

  //   console.log(userImage)
  // }, [userData]);

  const navItems = [
    { title: "Home", icon: <FaHome />, path: "/" },
    { title: "Blogs", icon: <FaBlog />, path: "/blogs" },
    { title: "About", icon: <FaUsers />, path: "/about" },
  ];

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        localStorage.removeItem("token");
        navigate("/"); // Navigate to home after logging out
      })
      .catch((error) => console.error("Sign out error:", error));
  };

  return (
    <nav
      className={`${styles.navbar} ${isScrolled ? styles.scrolled : ""} ${isOpen ? styles.navbarOpen : ""}`}
    >
      <div className="container">
        <div className={styles.navbarContent}>
          <div className={styles.logo}>
            <Link to="/" className={styles.logoLink}>
              Campus<span className={styles.logoAccent}>Blogs</span>
            </Link>
          </div>

          <div className={`${styles.navMenu} ${isOpen ? styles.show : ""}`}>
            <ul className={styles.navList}>
              {navItems.map((item, index) => (
                <li key={index} className={styles.navItem}>
                  <Link
                    to={item.path}
                    className={styles.navLink}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className={styles.navIcon}>{item.icon}</span>
                    <span className={styles.navText}>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className={styles.searchBar}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search..."
                className={styles.searchInput}
              />
            </div>

            <div className={styles.authButtons}>
              {userData != null ? (
                <>
                  <Link
                    to="/dashboard"
                    className={`btn ${styles.authButton} btn-outline-success me-2`}
                    onClick={toggleMenu}

                  >
                    <MdDashboard size={24} className="me-2" />
                    Dashboard
                  </Link>
                  {/* <img
                    src={userImage}
                    alt="User"
                    className={`rounded-circle ${styles.userImage}`}
                  /> */}
                  <button
                    className={`btn ${styles.authButton} btn-danger ms-2`}
                    onClick={()=>{
                      handleLogout()
                      toggleMenu()
                    }}
                  >
                    <FiLogOut /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className={`btn ${styles.authButton} btn-outline-primary`}
                    onClick={toggleMenu}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className={`btn ${styles.authButton} btn-primary ms-2`}
                    onClick={toggleMenu}

                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          <button
            className={`${styles.toggleButton} d-lg-none`}
            onClick={toggleMenu}
            aria-label="Toggle navigation"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
