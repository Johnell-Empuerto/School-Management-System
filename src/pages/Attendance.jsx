import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../assets/styles/Attendance.module.css";
import { Helmet } from "react-helmet-async";

import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaSync,
  FaCalendarAlt,
  FaUserGraduate,
  FaBookOpen,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

function Attendance() {
  const [classSubjects, setClassSubjects] = useState([]);
  const [classSubjectId, setClassSubjectId] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  const [subjectSearch, setSubjectSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year] = useState(new Date().getFullYear());
  const [selectedClass, setSelectedClass] = useState(null);

  const API = "http://localhost:3001/api";

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    fetchClassSubjects();
  }, []);

  useEffect(() => {
    if (classSubjectId) {
      fetchAttendance();
      // Find selected class subject details
      const selected = classSubjects.find(
        (cs) => cs.id === parseInt(classSubjectId),
      );
      setSelectedClass(selected);
    }
  }, [classSubjectId, month]);

  const fetchClassSubjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/class-subjects`);
      setClassSubjects(res.data);
    } catch (error) {
      console.error("Error fetching class subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API}/attendance/${classSubjectId}/${month}/${year}`,
      );
      setAttendance(res.data);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const toggleStatus = async (student, day) => {
    const date = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const statusCycle = ["", "present", "late", "absent"];
    const current = student.attendance[day] || "";
    const next =
      statusCycle[(statusCycle.indexOf(current) + 1) % statusCycle.length];

    await axios.post(`${API}/attendance`, {
      enrollment_id: student.enrollment_id,
      class_subject_id: classSubjectId,
      date,
      status: next || null,
    });

    fetchAttendance();
  };

  const filteredClassSubjects = classSubjects.filter((cs) =>
    `${cs.grade_level} ${cs.section} ${cs.subject_name}`
      .toLowerCase()
      .includes(subjectSearch.toLowerCase()),
  );

  const filteredAttendance = attendance.filter((s) =>
    `${s.first_name} ${s.last_name}`
      .toLowerCase()
      .includes(studentSearch.toLowerCase()),
  );

  // Calculate attendance statistics
  const getAttendanceStats = () => {
    if (!filteredAttendance.length) return null;

    let totalPresent = 0;
    let totalLate = 0;
    let totalAbsent = 0;
    let totalDays = days.length;
    let totalStudents = filteredAttendance.length;

    filteredAttendance.forEach((student) => {
      days.forEach((day) => {
        const status = student.attendance[day];
        if (status === "present") totalPresent++;
        else if (status === "late") totalLate++;
        else if (status === "absent") totalAbsent++;
      });
    });

    const totalRecords = totalStudents * totalDays;
    const attendanceRate = (
      ((totalPresent + totalLate) / totalRecords) *
      100
    ).toFixed(1);

    return {
      totalPresent,
      totalLate,
      totalAbsent,
      attendanceRate,
      totalRecords,
    };
  };

  const stats = getAttendanceStats();

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case "present":
        return {
          icon: <FaCheckCircle />,
          color: "#4caf50",
          bgColor: "#e8f5e8",
        };
      case "absent":
        return {
          icon: <FaTimesCircle />,
          color: "#f44336",
          bgColor: "#ffebee",
        };
      case "late":
        return { icon: <FaClock />, color: "#ff9800", bgColor: "#fff3e0" };
      default:
        return { icon: null, color: "#999", bgColor: "#f5f5f5" };
    }
  };

  // Navigate months
  const goToPreviousMonth = () => {
    setMonth((prev) => (prev === 1 ? 12 : prev - 1));
  };

  const goToNextMonth = () => {
    setMonth((prev) => (prev === 12 ? 1 : prev + 1));
  };

  return (
    <>
      <Helmet>
        <title>Attendance | School Management System</title>
      </Helmet>

      <div className={styles.attendanceContainer}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <h1>Attendance Sheet</h1>
            <p>Track student attendance for each class subject</p>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.refreshBtn} onClick={fetchAttendance}>
              <FaSync /> Refresh
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className={styles.filterCard}>
          <div className={styles.filterGrid}>
            {/* Class Subject Search */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <FaBookOpen className={styles.labelIcon} />
                Search Class Subject
              </label>
              <div className={styles.searchBox}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search grade, section, subject..."
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  className={styles.searchInput}
                />
                {subjectSearch && (
                  <button
                    className={styles.clearSearch}
                    onClick={() => setSubjectSearch("")}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
              <select
                value={classSubjectId}
                onChange={(e) => setClassSubjectId(e.target.value)}
                className={styles.selectInput}
              >
                <option value="">Select Class Subject</option>
                {filteredClassSubjects.map((cs) => (
                  <option key={cs.id} value={cs.id}>
                    {cs.grade_level} - {cs.section} | {cs.subject_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Month Selection */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <FaCalendarAlt className={styles.labelIcon} />
                Month
              </label>
              <div className={styles.monthSelector}>
                <button
                  className={styles.monthNavBtn}
                  onClick={goToPreviousMonth}
                  type="button"
                >
                  <FaChevronLeft />
                </button>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className={styles.monthSelect}
                >
                  {months.map((m, i) => (
                    <option key={i + 1} value={i + 1}>
                      {m} {year}
                    </option>
                  ))}
                </select>
                <button
                  className={styles.monthNavBtn}
                  onClick={goToNextMonth}
                  type="button"
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>

            {/* Student Search */}
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>
                <FaUserGraduate className={styles.labelIcon} />
                Search Student
              </label>
              <div className={styles.searchBox}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className={styles.searchInput}
                />
                {studentSearch && (
                  <button
                    className={styles.clearSearch}
                    onClick={() => setStudentSearch("")}
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Selected Class Info */}
          {selectedClass && (
            <div className={styles.selectedClassInfo}>
              <div className={styles.infoItem}>
                <FaBookOpen className={styles.infoIcon} />
                <span>
                  {selectedClass.grade_level} - {selectedClass.section}
                </span>
              </div>
              <div className={styles.infoItem}>
                <FaUserGraduate className={styles.infoIcon} />
                <span>{selectedClass.subject_name}</span>
              </div>
              <div className={styles.infoItem}>
                <FaCalendarAlt className={styles.infoIcon} />
                <span>
                  {months[month - 1]} {year}
                </span>
              </div>
              <div className={styles.infoItem}>
                <FaUserGraduate className={styles.infoIcon} />
                <span>{filteredAttendance.length} Students</span>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        {stats && selectedClass && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#e8f5e8", color: "#4caf50" }}
              >
                <FaCheckCircle />
              </div>
              <div className={styles.statInfo}>
                <h3>Present</h3>
                <p>{stats.totalPresent}</p>
                <small>
                  {((stats.totalPresent / stats.totalRecords) * 100).toFixed(1)}
                  %
                </small>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#fff3e0", color: "#ff9800" }}
              >
                <FaClock />
              </div>
              <div className={styles.statInfo}>
                <h3>Late</h3>
                <p>{stats.totalLate}</p>
                <small>
                  {((stats.totalLate / stats.totalRecords) * 100).toFixed(1)}%
                </small>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#ffebee", color: "#f44336" }}
              >
                <FaTimesCircle />
              </div>
              <div className={styles.statInfo}>
                <h3>Absent</h3>
                <p>{stats.totalAbsent}</p>
                <small>
                  {((stats.totalAbsent / stats.totalRecords) * 100).toFixed(1)}%
                </small>
              </div>
            </div>

            <div className={styles.statCard}>
              <div
                className={styles.statIcon}
                style={{ background: "#e3f2fd", color: "#2196f3" }}
              >
                <FaCalendarAlt />
              </div>
              <div className={styles.statInfo}>
                <h3>Attendance Rate</h3>
                <p>{stats.attendanceRate}%</p>
                <small>{stats.totalRecords} total records</small>
              </div>
            </div>
          </div>
        )}

        {/* Table Card */}
        <div className={styles.tableCard}>
          {loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Loading attendance...</p>
            </div>
          ) : (
            <>
              {/* Table Header with Day Numbers */}
              <div className={styles.tableHeader}>
                <div className={styles.studentColumn}>Student</div>
                <div className={styles.daysHeader}>
                  {days.map((d) => (
                    <div key={d} className={styles.dayCell}>
                      {d}
                      <span className={styles.dayWeek}>
                        {new Date(year, month - 1, d).toLocaleDateString(
                          "en-US",
                          { weekday: "short" },
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Table Body */}
              <div className={styles.tableBody}>
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map((student) => (
                    <div
                      key={student.enrollment_id}
                      className={styles.tableRow}
                    >
                      <div className={styles.studentInfo}>
                        <div className={styles.studentAvatar}>
                          <FaUserGraduate />
                        </div>
                        <div className={styles.studentName}>
                          {student.first_name} {student.last_name}
                        </div>
                      </div>
                      <div className={styles.attendanceRow}>
                        {days.map((day) => {
                          const status = student.attendance[day] || "";
                          const statusInfo = getStatusInfo(status);

                          return (
                            <div
                              key={day}
                              onClick={() => toggleStatus(student, day)}
                              className={`${styles.attendanceCell} ${status ? styles[status] : ""}`}
                              style={{
                                backgroundColor: status
                                  ? statusInfo.bgColor
                                  : "transparent",
                              }}
                            >
                              {status === "present" && "✓"}
                              {status === "absent" && "✗"}
                              {status === "late" && "L"}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateContent}>
                      <h3>No attendance records found</h3>
                      <p>
                        {classSubjectId
                          ? "Select a different class subject or month"
                          : "Select a class subject to view attendance"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className={styles.legend}>
                <div className={styles.legendItem}>
                  <div
                    className={styles.legendColor}
                    style={{ background: "#e8f5e8" }}
                  ></div>
                  <span>Present (✓)</span>
                </div>
                <div className={styles.legendItem}>
                  <div
                    className={styles.legendColor}
                    style={{ background: "#fff3e0" }}
                  ></div>
                  <span>Late (L)</span>
                </div>
                <div className={styles.legendItem}>
                  <div
                    className={styles.legendColor}
                    style={{ background: "#ffebee" }}
                  ></div>
                  <span>Absent (✗)</span>
                </div>
                <div className={styles.legendItem}>
                  <span className={styles.legendNote}>
                    Click on any cell to toggle status
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default Attendance;
