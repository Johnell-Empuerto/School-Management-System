import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  FaTachometerAlt,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaSchool,
  FaBook,
  FaBookOpen,
  FaUserPlus,
  FaClipboardCheck,
  FaGraduationCap,
  FaClipboardList,
  FaChartLine,
  FaFileAlt,
  FaCalendarAlt,
  FaUsers,
} from "react-icons/fa";

import { MdMoreTime } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import styles from "../assets/styles/Sidebar.module.css";

function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // 🔹 Close sidebar automatically on mobile when route changes
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setCollapsed(true);
    }
  }, [location.pathname]);

  const menu = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <FaTachometerAlt />,
      roles: ["admin", "teacher", "student"],
    },
    {
      name: "Students",
      path: "/students",
      icon: <FaUserGraduate />,
      roles: ["admin", "teacher"],
    },
    {
      name: "Teachers",
      path: "/teachers",
      icon: <FaChalkboardTeacher />,
      roles: ["admin"],
    },
    {
      name: "Classes",
      path: "/classes",
      icon: <FaSchool />,
      roles: ["admin", "teacher"],
    },
    {
      name: "Subjects",
      path: "/subjects",
      icon: <FaBook />,
      roles: ["admin", "teacher"],
    },
    {
      name: "Class Subjects",
      path: "/class-subjects",
      icon: <FaBookOpen />,
      roles: ["admin", "teacher"],
    },
    {
      name: "Enrollment",
      path: "/enrollment",
      icon: <FaUserPlus />,
      roles: ["admin", "teacher", "student"],
    },
    {
      name: "Enrollment Request",
      path: "/enrollment-requests",
      icon: <FaClipboardCheck />,
      roles: ["admin", "teacher"],
    },
    {
      name: "Grades",
      path: "/grades",
      icon: <FaGraduationCap />,
      roles: ["teacher", "admin"],
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: <FaClipboardList />,
      roles: ["teacher", "admin"],
    },
    {
      name: "Activity",
      path: "/activity",
      icon: <FaChartLine />,
      roles: ["teacher", "admin", "student"],
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <FaFileAlt />,
      roles: ["teacher", "admin"],
    },
    {
      name: "Calendar",
      path: "/calendar",
      icon: <FaCalendarAlt />,
      roles: ["teacher", "admin"],
    },
    {
      name: "School Year",
      path: "/school-years",
      icon: <MdMoreTime />,
      roles: ["admin"],
    },
    {
      name: "Users",
      path: "/users",
      icon: <FaUsers />,
      roles: ["admin"],
    },
    {
      name: "Profile",
      path: "/profile",
      icon: <CgProfile />,
      roles: ["admin", "teacher", "student"],
    },
  ];

  const filteredMenu = menu.filter((item) => item.roles.includes(user?.role));

  return (
    <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""}`}>
      <div className={styles.userProfile}>
        <div className={styles.userAvatar}>
          {user?.firstName?.charAt(0) || "U"}
        </div>

        {!collapsed && (
          <div className={styles.userInfo}>
            <div className={styles.userName}>
              {user?.firstName} {user?.lastName}
            </div>
            <div className={styles.userRole}>
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </div>
          </div>
        )}
      </div>

      <nav className={styles.navMenu}>
        {filteredMenu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${
              location.pathname === item.path ? styles.active : ""
            }`}
          >
            <span className={styles.icon}>{item.icon}</span>

            {!collapsed && <span className={styles.text}>{item.name}</span>}

            {!collapsed && location.pathname === item.path && (
              <span className={styles.activeIndicator}></span>
            )}
          </Link>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        {!collapsed && (
          <div className={styles.versionInfo}>v1.0.0 • School Management</div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
