import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import styles from "../assets/styles/Enrollment.module.css";
import { Helmet } from "react-helmet-async";

import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaSync,
  FaPlus,
  FaTrash,
  FaUserGraduate,
  FaBookOpen,
  FaCalendarAlt,
  FaUserCheck,
  FaUserTimes,
  FaHistory,
} from "react-icons/fa";

// MUI Imports
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  TableSortLabel,
  Chip,
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
  ThemeProvider,
  createTheme,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Badge,
  Tab,
  Tabs,
  Alert,
  Snackbar,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Create theme to match your design
const theme = createTheme({
  palette: {
    primary: {
      main: "#2e7d32",
      light: "#4caf50",
      dark: "#1b5e20",
    },
    secondary: {
      main: "#4caf50",
    },
    error: {
      main: "#f44336",
    },
    warning: {
      main: "#ff9800",
    },
    success: {
      main: "#4caf50",
    },
    info: {
      main: "#2196f3",
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Arial", sans-serif',
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: "#2e7d32",
          color: "white",
          fontWeight: 600,
          fontSize: "0.9rem",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        },
        body: {
          fontSize: "0.95rem",
          color: "#2c3e50",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "#f5f5f5",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "30px",
          textTransform: "none",
          fontWeight: 600,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          fontSize: "1rem",
        },
      },
    },
  },
});

// Styled Table Container
const StyledTableContainer = styled(TableContainer)({
  borderRadius: "24px",
  boxShadow: "0 15px 35px rgba(0, 100, 0, 0.1)",
  border: "1px solid rgba(0, 150, 0, 0.1)",
  marginTop: "20px",
});

// Styled Tabs
const StyledTabs = styled(Tabs)({
  marginBottom: "20px",
  "& .MuiTabs-indicator": {
    backgroundColor: "#2e7d32",
    height: "3px",
    borderRadius: "3px",
  },
  "& .MuiTab-root": {
    color: "#666",
    "&.Mui-selected": {
      color: "#2e7d32",
    },
  },
});

function Enrollment() {
  const [enrollments, setEnrollments] = useState([]);
  const [filteredEnrollments, setFilteredEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [activeTab, setActiveTab] = useState(0);

  const user = JSON.parse(localStorage.getItem("user")) || {};

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterSchoolYear, setFilterSchoolYear] = useState("all");

  // Pagination and Sorting
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("enrollment_status");
  const [order, setOrder] = useState("asc");

  const [formData, setFormData] = useState({
    student_id: "",
    class_id: "",
    school_year_id: "",
  });

  const API = "http://localhost:3001/api";

  useEffect(() => {
    fetchData();
  }, []);

  // Search and Filter effect
  useEffect(() => {
    let result = enrollments;

    // Filter by status tab
    if (activeTab === 0) {
      result = result.filter((e) => e.enrollment_status === "enrolled");
    } else if (activeTab === 1) {
      result = result.filter((e) => e.enrollment_status === "completed");
    } else if (activeTab === 2) {
      result = result.filter((e) => e.enrollment_status === "dropped");
    }

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (enrollment) =>
          `${enrollment.first_name} ${enrollment.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          `${enrollment.grade_level} ${enrollment.section}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          `${enrollment.year_start} ${enrollment.year_end}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Class filter
    if (filterClass !== "all") {
      result = result.filter(
        (enrollment) => enrollment.class_id === parseInt(filterClass),
      );
    }

    // School Year filter
    if (filterSchoolYear !== "all") {
      result = result.filter(
        (enrollment) =>
          enrollment.school_year_id === parseInt(filterSchoolYear),
      );
    }

    setFilteredEnrollments(result);
    setPage(0);
  }, [searchTerm, filterClass, filterSchoolYear, activeTab, enrollments]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchEnrollments(),
        fetchStudents(),
        fetchClasses(),
        fetchSchoolYears(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      showSnackbar("Error fetching data", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    const res = await axios.get(`${API}/enrollments`, {
      withCredentials: true,
    });
    setEnrollments(res.data);
    setFilteredEnrollments(
      res.data.filter((e) => e.enrollment_status === "enrolled"),
    );
  };

  const fetchStudents = async () => {
    const res = await axios.get(`${API}/students`, {
      withCredentials: true,
    });
    setStudents(res.data);
  };

  const fetchClasses = async () => {
    const res = await axios.get(`${API}/classes`, {
      withCredentials: true,
    });
    setClasses(res.data);
  };

  const fetchSchoolYears = async () => {
    const res = await axios.get(`${API}/school-years`, {
      withCredentials: true,
    });
    setSchoolYears(res.data);
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/enrollment-requests`, formData, {
        withCredentials: true,
      });

      showSnackbar("Enrollment request submitted successfully", "success");

      setFormData({
        student_id: "",
        class_id: "",
        school_year_id: "",
      });

      setShowModal(false);
      fetchData();
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to submit enrollment request",
        "error",
      );
    }
  };

  const handleDrop = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to drop this student?"))
        return;

      await axios.put(
        `${API}/enrollments/drop/${id}`,
        {},
        { withCredentials: true },
      );

      showSnackbar("Student dropped successfully", "success");
      fetchData();
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to drop student",
        "error",
      );
    }
  };

  const handleRestore = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to restore this student?"))
        return;

      await axios.put(
        `${API}/enrollments/restore/${id}`,
        {},
        { withCredentials: true },
      );

      showSnackbar("Student restored successfully", "success");
      fetchData();
    } catch (err) {
      showSnackbar(
        err.response?.data?.message || "Failed to restore student",
        "error",
      );
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Sorting function
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Sort enrollments
  const sortedEnrollments = useMemo(() => {
    return [...filteredEnrollments].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle special cases
      if (orderBy === "student_name") {
        aValue = `${a.first_name} ${a.last_name}`;
        bValue = `${b.first_name} ${b.last_name}`;
      } else if (orderBy === "class") {
        aValue = `${a.grade_level} ${a.section}`;
        bValue = `${b.grade_level} ${b.section}`;
      } else if (orderBy === "school_year") {
        aValue = `${a.year_start} ${a.year_end}`;
        bValue = `${b.year_start} ${b.year_end}`;
      }

      if (order === "asc") {
        return (aValue || "")
          .toString()
          .localeCompare((bValue || "").toString());
      } else {
        return (bValue || "")
          .toString()
          .localeCompare((aValue || "").toString());
      }
    });
  }, [filteredEnrollments, orderBy, order]);

  // Pagination
  const paginatedEnrollments = sortedEnrollments.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get unique values for filters
  const classOptions = classes.map((c) => ({
    id: c.id,
    name: `${c.grade_level} - ${c.section}`,
  }));

  const schoolYearOptions = schoolYears.map((sy) => ({
    id: sy.id,
    name: sy.year,
  }));

  // Get counts for badges
  const enrolledCount = enrollments.filter(
    (e) => e.enrollment_status === "enrolled",
  ).length;
  const completedCount = enrollments.filter(
    (e) => e.enrollment_status === "completed",
  ).length;
  const droppedCount = enrollments.filter(
    (e) => e.enrollment_status === "dropped",
  ).length;

  // Table columns
  const getHeadCells = () => {
    const baseCells = [
      { id: "student_name", label: "Student", sortable: true },
      { id: "class", label: "Class", sortable: true },
      { id: "school_year", label: "School Year", sortable: true },
      { id: "enrollment_status", label: "Status", sortable: true },
    ];

    if (user.role !== "student") {
      baseCells.push({ id: "actions", label: "Action", sortable: false });
    }

    return baseCells;
  };

  const headCells = getHeadCells();

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case "enrolled":
        return {
          color: "#4caf50",
          bgColor: "#e8f5e8",
          icon: <FaUserCheck />,
          label: "Enrolled",
        };
      case "completed":
        return {
          color: "#2196f3",
          bgColor: "#e3f2fd",
          icon: <FaHistory />,
          label: "Completed",
        };
      case "dropped":
        return {
          color: "#f44336",
          bgColor: "#ffebee",
          icon: <FaUserTimes />,
          label: "Dropped",
        };
      default:
        return { color: "#999", bgColor: "#f5f5f5", icon: null, label: status };
    }
  };

  return (
    <>
      <Helmet>
        <title>Student Enrollment | School Management System</title>
      </Helmet>

      <ThemeProvider theme={theme}>
        <div className={styles.enrollmentContainer}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <h1>Student Enrollment</h1>
              <p>Manage student enrollments and track academic status</p>
            </div>

            <div className={styles.headerActions}>
              <button
                className={styles.addBtn}
                onClick={() => {
                  setFormData({
                    student_id: "",
                    class_id: "",
                    school_year_id: "",
                  });
                  setShowModal(true);
                }}
              >
                <FaPlus /> New Enrollment
              </button>
              <button className={styles.refreshBtn} onClick={fetchData}>
                <FaSync /> Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.enrolledCard}`}>
              <div className={styles.statIcon}>
                <FaUserCheck />
              </div>
              <div className={styles.statInfo}>
                <h3>Enrolled</h3>
                <p>{enrolledCount}</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.completedCard}`}>
              <div className={styles.statIcon}>
                <FaHistory />
              </div>
              <div className={styles.statInfo}>
                <h3>Completed</h3>
                <p>{completedCount}</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.droppedCard}`}>
              <div className={styles.statIcon}>
                <FaUserTimes />
              </div>
              <div className={styles.statInfo}>
                <h3>Dropped</h3>
                <p>{droppedCount}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <StyledTabs value={activeTab} onChange={handleTabChange}>
            <Tab
              label={
                <Badge badgeContent={enrolledCount} color="success" max={99}>
                  Enrolled
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={completedCount} color="info" max={99}>
                  Completed
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={droppedCount} color="error" max={99}>
                  Dropped
                </Badge>
              }
            />
          </StyledTabs>

          {/* Search and Filter Controls */}
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by student name, class, or school year..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  className={styles.clearSearch}
                  onClick={() => setSearchTerm("")}
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {classOptions.length > 0 && (
              <div className={styles.filterBox}>
                <FaFilter className={styles.filterIcon} />
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                >
                  <option value="all">All Classes</option>
                  {classOptions.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {schoolYearOptions.length > 0 && (
              <div className={styles.filterBox}>
                <FaFilter className={styles.filterIcon} />
                <select
                  value={filterSchoolYear}
                  onChange={(e) => setFilterSchoolYear(e.target.value)}
                >
                  <option value="all">All School Years</option>
                  {schoolYearOptions.map((sy) => (
                    <option key={sy.id} value={sy.id}>
                      {sy.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Table */}
          <StyledTableContainer component={Paper}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading enrollments...</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHead>
                    <TableRow>
                      {headCells.map((headCell) => (
                        <TableCell key={headCell.id}>
                          {headCell.sortable ? (
                            <TableSortLabel
                              active={orderBy === headCell.id}
                              direction={
                                orderBy === headCell.id ? order : "asc"
                              }
                              onClick={() => handleRequestSort(headCell.id)}
                              sx={{ color: "white !important" }}
                            >
                              {headCell.label}
                            </TableSortLabel>
                          ) : (
                            headCell.label
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedEnrollments.length > 0 ? (
                      paginatedEnrollments.map((enrollment) => {
                        const statusInfo = getStatusInfo(
                          enrollment.enrollment_status,
                        );
                        return (
                          <TableRow key={enrollment.id} hover>
                            <TableCell>
                              <div className={styles.studentInfo}>
                                <div className={styles.studentAvatar}>
                                  <FaUserGraduate />
                                </div>
                                <div>
                                  <div className={styles.studentName}>
                                    {enrollment.first_name}{" "}
                                    {enrollment.last_name}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className={styles.classBadge}>
                                <span className={styles.gradeLevel}>
                                  {enrollment.grade_level}
                                </span>
                                <span className={styles.sectionBadge}>
                                  {enrollment.section}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className={styles.schoolYearInfo}>
                                <FaCalendarAlt
                                  className={styles.calendarIcon}
                                />
                                <span>
                                  {enrollment.year_start} -{" "}
                                  {enrollment.year_end}
                                </span>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Chip
                                icon={statusInfo.icon}
                                label={statusInfo.label}
                                size="small"
                                sx={{
                                  backgroundColor: statusInfo.bgColor,
                                  color: statusInfo.color,
                                  fontWeight: 600,
                                  "& .MuiChip-icon": {
                                    color: statusInfo.color,
                                  },
                                }}
                              />
                            </TableCell>

                            {user.role !== "student" && (
                              <TableCell>
                                <div className={styles.actionButtons}>
                                  {enrollment.enrollment_status ===
                                    "enrolled" && (
                                    <Tooltip title="Drop Student">
                                      <button
                                        className={styles.dropBtn}
                                        onClick={() =>
                                          handleDrop(enrollment.id)
                                        }
                                      >
                                        <FaUserTimes /> Drop
                                      </button>
                                    </Tooltip>
                                  )}

                                  {enrollment.enrollment_status ===
                                    "dropped" && (
                                    <Tooltip title="Restore Student">
                                      <button
                                        className={styles.restoreBtn}
                                        onClick={() =>
                                          handleRestore(enrollment.id)
                                        }
                                      >
                                        <FaUserCheck /> Restore
                                      </button>
                                    </Tooltip>
                                  )}
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={user.role !== "student" ? 5 : 4}
                          className={styles.emptyState}
                        >
                          <div className={styles.emptyStateContent}>
                            <h3>
                              No{" "}
                              {activeTab === 0
                                ? "enrolled"
                                : activeTab === 1
                                  ? "completed"
                                  : "dropped"}{" "}
                              students found
                            </h3>
                            <p>
                              {activeTab === 0
                                ? "There are no enrolled students at this time"
                                : activeTab === 1
                                  ? "No completed enrollments to display"
                                  : "No dropped students to display"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <TablePagination
                  rowsPerPageOptions={[10, 20, 50]}
                  component="div"
                  count={filteredEnrollments.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{
                    borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                    ".MuiTablePagination-select": {
                      borderRadius: "20px",
                    },
                  }}
                />
              </>
            )}
          </StyledTableContainer>
        </div>

        {/* Modal */}
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>New Enrollment Request</h2>
                <button
                  className={styles.closeBtn}
                  onClick={() => setShowModal(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label>Student</label>
                    <select
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Student</option>
                      {(user.role === "student"
                        ? students.filter((s) => s.user_id === user.id)
                        : students
                      ).map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.first_name} {s.last_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Class</label>
                    <select
                      name="class_id"
                      value={formData.class_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Class</option>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.grade_level} - {c.section}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>School Year</label>
                    <select
                      name="school_year_id"
                      value={formData.school_year_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select School Year</option>
                      {schoolYears.map((sy) => (
                        <option key={sy.id} value={sy.id}>
                          {sy.year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className={styles.saveBtn}>
                    Submit Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </>
  );
}

export default Enrollment;
