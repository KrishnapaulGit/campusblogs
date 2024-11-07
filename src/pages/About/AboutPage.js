import React from 'react';
import styles from "./AboutPage.module.css"


const AboutPage = () => {
    return (
        <>
        <div className={styles.mainContainer}>
        <div className={styles.titleWrapper}>
                <h2 className={styles.title}>Why Campus <span>Blogs</span></h2>
                <div className={styles.decorativeLine}></div>
            </div>
            <h2 className="text-xl text-center mb-4 text-gray-600">Sharing Resources, Inspiring Minds, Interview Experiences</h2>
            <div>
                <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
                <p className="text-gray-700 mb-4">
                    At Campus Blog, we aim to create a vibrant community where students can share their experiences, knowledge, and insights.
                    We believe that every voice matters and that through sharing our stories, we can inspire and support each other on our academic journeys.
                </p>

                <h2 className="text-2xl font-semibold mb-4">Who We Are</h2>
                <p className="text-gray-700 mb-4">
                    We are a group of passionate students dedicated to providing a platform for open dialogue and learning. Our backgrounds range from various fields of study, but we all share a common goal: to foster a supportive community for all students.
                </p>

                <h2 className="text-2xl font-semibold mb-4">Join Us!</h2>
                <p className="text-gray-700 mb-4">
                    Whether you want to share your own stories, learn from others, or simply connect with fellow students, Campus Blog is the place for you.
                    We invite you to explore our blogs, engage with the content, and be a part of our community.
                </p>

            </div>
        </div>

        </>
    );
};

export default AboutPage;