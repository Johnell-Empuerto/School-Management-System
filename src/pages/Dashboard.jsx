import { useEffect, useState } from "react";
import api from "../services/api";
import styles from "../assets/styles/Dashboard.module.css";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import LoadingScreen from "../components/LoadingScreen";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([
          fetchDashboard(),
          fetchActivities(),
          fetchAttendanceChart(),
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false); // Set loading to false when all data is fetched
      }
    };

    fetchAllData();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      setStats(res.data.data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await api.get("/activities");

      if (Array.isArray(res.data)) {
        setActivities(res.data); // old format
      } else {
        setActivities(res.data.data || []); // paginated format
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const fetchAttendanceChart = async () => {
    try {
      let endpoint = "/dashboard/attendance-chart";

      if (user.role === "student") {
        endpoint = "/dashboard/student-attendance";
      }

      const res = await api.get(endpoint);
      setAttendanceData(res.data);
    } catch (error) {
      console.error("Error fetching attendance chart:", error);
    }
  };

  // Show loading screen while data is being fetched
  if (loading) return <LoadingScreen />;

  const studentChartData = attendanceData.map((item) => ({
    status: item.status
      ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
      : "Unknown",
    total: item.total,
  }));

  const overviewChartData = [
    { name: "Students", total: stats?.students || 0 },
    { name: "Teachers", total: stats?.teachers || 0 },
    { name: "Classes", total: stats?.classes || 0 },
    { name: "Subjects", total: stats?.subjects || 0 },
    { name: "Enrolled", total: stats?.enrolled || 0 },
    { name: "Requests", total: stats?.pending_requests || 0 },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard | School Management System</title>
      </Helmet>

      <div className={styles.dashboardContainer}>
        <h1>Dashboard</h1>
        <div className={styles.schoolYearBadge}>
          School Year: {stats?.school_year}
        </div>

        {/* ================= ADMIN DASHBOARD ================= */}

        {user.role === "admin" && (
          <div className={styles.dashboardCards}>
            <div className={styles.card}>
              <h3>Total Students</h3>
              <p>{stats?.students}</p>
            </div>

            <div className={styles.card}>
              <h3>Total Teachers</h3>
              <p>{stats?.teachers}</p>
            </div>

            <div className={styles.card}>
              <h3>Total Classes</h3>
              <p>{stats?.classes}</p>
            </div>

            <div className={styles.card}>
              <h3>Total Subjects</h3>
              <p>{stats?.subjects}</p>
            </div>

            <div className={styles.card}>
              <h3>Enrolled Students</h3>
              <p>{stats?.enrolled}</p>
            </div>

            <div className={styles.card}>
              <h3>Pending Requests</h3>
              <p>{stats?.pending_requests}</p>
            </div>
          </div>
        )}

        {/* ================= TEACHER DASHBOARD ================= */}

        {user.role === "teacher" && (
          <div className={styles.dashboardTeacher}>
            <h2>Teacher Panel</h2>

            <div className={styles.dashboardActions}>
              <a href="/grades" className={styles.dashboardBtn}>
                Manage Grades
              </a>

              <a href="/attendance" className={styles.dashboardBtn}>
                Manage Attendance
              </a>

              <a href="/classes" className={styles.dashboardBtn}>
                View Classes
              </a>
            </div>
          </div>
        )}

        {/* ================= ADMIN / TEACHER CHART ================= */}

        {user.role !== "student" && (
          <div className={styles.dashboardChartCard}>
            <h3>System Overview</h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={overviewChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#09680a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ================= STUDENT ATTENDANCE CHART ================= */}

        {user.role === "student" && attendanceData.length > 0 && (
          <div className={styles.dashboardChartCard}>
            <h3>My Attendance</h3>

            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={studentChartData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis type="category" dataKey="status" />
                <Tooltip />
                <Bar dataKey="total" fill="#09680a" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ================= ACTIVITIES ================= */}

        <div className={styles.dashboardActivities}>
          <div className={styles.dashboardActivitiesHeader}>
            <h2>School Activities and Announcement</h2>

            <button
              className={styles.viewMoreBtn}
              onClick={() => navigate("/activity")}
            >
              View More
            </button>
          </div>

          {activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div
                className={`${styles.activityType} ${styles[activity.type]}`}
              >
                {activity.type === "announcement" ? "Announcement" : "Activity"}
              </div>

              <strong
                style={{ display: "block" }}
                className={styles.activityTitle}
              >
                {activity.title}
              </strong>

              <p className={styles.activityDescription}>
                {activity.description}
              </p>

              <small className={styles.activityDate}>
                📅 {new Date(activity.activity_date).toLocaleDateString()}
              </small>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Dashboard;
