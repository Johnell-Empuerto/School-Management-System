import React from "react";
import styles from "../assets/styles/LoadingScreen.module.css";

const LoadingScreen = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingContent}>
        {/* School Logo - replace with your actual logo path */}
        <img
          src="/school-logo.png"
          alt="School Logo"
          className={styles.schoolLogo}
          onError={(e) => {
            // Fallback if logo doesn't exist
            e.target.style.display = "none";
            // Show fallback icon
            e.target.nextElementSibling.style.display = "flex";
          }}
        />

        {/* Fallback icon if no logo */}
        <div className={styles.fallbackIcon}>
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3ZM18 9L12 12.68L6 9L12 5.32L18 9ZM12 21.5L6.34 18.5L5 20.66L12 24L19 20.66L17.66 18.5L12 21.5Z"
              fill="#2e7d32"
            />
          </svg>
        </div>

        <h2 className={styles.loadingTitle}>School Management System</h2>

        <p className={styles.loadingText}>Starting server... please wait</p>

        <div className={styles.spinner}></div>

        <p className={styles.loadingNote}>
          This may take up to 30 seconds on first load
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
