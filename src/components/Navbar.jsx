import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaUserCircle,
  FaSignOutAlt,
  FaBell,
  FaEnvelope,
  FaCog,
  FaUser,
  FaChevronDown,
  FaMoon,
  FaSun,
} from "react-icons/fa";
import styles from "../assets/styles/Navbar.module.css";
import api from "../services/api";

const Navbar = ({ toggleSidebar, collapsed }) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = async () => {
    try {
      await api.post("/logout");

      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

  // Mock notifications
  const notifications = [
    { id: 1, text: "New enrollment request", time: "5 min ago", unread: true },
    {
      id: 2,
      text: "Grade submission deadline",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      text: "Parent meeting scheduled",
      time: "2 hours ago",
      unread: false,
    },
  ];

  // Mock messages
  const messages = [
    { id: 1, text: "You have 3 unread messages", time: "Just now" },
  ];

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
    }
    return user?.school_id?.charAt(0) || "U";
  };

  return (
    <nav
      className={`${styles.navbar} ${collapsed ? styles.navbarExpanded : ""}`}
    >
      {/* LEFT SIDE - Logo and Toggle */}
      <div className={styles.navbarLeft}>
        <button
          className={styles.toggleBtn}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <FaBars />
          <span className={styles.tooltip}>Toggle Menu</span>
        </button>

        <div
          className={styles.logoWrapper}
          onClick={() => navigate("/dashboard")}
          style={{ cursor: "pointer" }}
        >
          <span className={styles.logoIcon}>🏫</span>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>SMS</span>
            <span className={styles.logoSubtitle}>
              School Management System
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - Icons and User Menu */}
      <div className={styles.navbarRight}>
        {/* User Profile Dropdown */}
        <div className={styles.userMenu} ref={dropdownRef}>
          <button
            className={styles.userBtn}
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className={styles.userAvatar}>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user?.firstName} />
              ) : (
                <span className={styles.avatarPlaceholder}>
                  {getInitials()}
                </span>
              )}
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>
                {user?.firstName} {user?.lastName}
              </span>
              <span className={styles.userRole}>
                {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
              </span>
            </div>
            <FaChevronDown
              className={`${styles.arrow} ${showDropdown ? styles.arrowUp : ""}`}
            />
          </button>

          {showDropdown && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownList}>
                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/profile");
                  }}
                >
                  <FaUser className={styles.itemIcon} />
                  <span>My Profile</span>
                </button>

                <button
                  className={styles.dropdownItem}
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/settings");
                  }}
                >
                  <FaCog className={styles.itemIcon} />
                  <span>Settings</span>
                </button>

                <div className={styles.divider}></div>

                <button
                  className={`${styles.dropdownItem} ${styles.logoutItem}`}
                  onClick={logout}
                >
                  <FaSignOutAlt className={styles.itemIcon} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
