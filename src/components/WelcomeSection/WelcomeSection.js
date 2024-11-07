import React from "react";
import styles from "./WelcomeSection.module.css";

const WelcomeSection = () => {
  return (
    <div className={`${styles.welcomeSection} d-flex flex-column justify-content-center align-items-center`}>
      <h1 className="display-3 text-light mb-3">Welcome to Our Campus Blogs!</h1>
      <p className="text-light text-center fs-5">
        Discover insightful articles, stay updated on trending topics, and engage with your colleagues .
      </p>
      <button
        className="btn btn-primary mt-4"
        onClick={() => {
          document.getElementById("blogSection").scrollIntoView({ behavior: "smooth" });
        }}
      >
        Explore Blogs
      </button>
    </div>
  );
};

export default WelcomeSection;
