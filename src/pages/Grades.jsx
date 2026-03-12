import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import styles from "../assets/styles/Grades.module.css";
import { Helmet } from "react-helmet-async";

import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaSync,
  FaSave,
  FaChartLine,
  FaUserGraduate,
  FaBookOpen,
  FaCalendarAlt,
  FaGraduationCap,
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
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
  LinearProgress,
  Card,
  CardContent,
  Typography,
  Grid,
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
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "24px",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06)",
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

// Styled Card
const StyledCard = styled(Card)({
  borderRadius: "24px !important",
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.06) !important",
  marginBottom: "25px",
  padding: "20px",
});

function Grades() {
  const [grades, setGrades] = useState([]);
  const [classSubjects, setClassSubjects] = useState([]);
  const [classSubjectId, setClassSubjectId] = useState("");
  const [gradingPeriod, setGradingPeriod] = useState("1st");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [search, setSearch] = useState("");
  const [selectedClassSubject, setSelectedClassSubject] = useState(null);

  // Pagination and Sorting
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("student_name");
  const [order, setOrder] = useState("asc");

  // Grading periods
  const gradingPeriods = [
    { value: "1st", label: "1st Grading", color: "#4caf50" },
    { value: "2nd", label: "2nd Grading", color: "#2196f3" },
    { value: "3rd", label: "3rd Grading", color: "#ff9800" },
    { value: "4th", label: "4th Grading", color: "#9c27b0" },
  ];

  useEffect(() => {
    fetchClassSubjects();
  }, []);

  useEffect(() => {
    if (classSubjectId) {
      fetchGrades();
      // Find selected class subject details
      const selected = classSubjects.find(
        (cs) => cs.id === parseInt(classSubjectId),
      );
      setSelectedClassSubject(selected);
    }
  }, [classSubjectId, gradingPeriod]);

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchClassSubjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/class-subjects/teacher");
      setClassSubjects(res.data);
    } catch (error) {
      console.error("Error fetching class subjects:", error);
      showSnackbar("Failed to fetch class subjects", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/grades/${classSubjectId}/${gradingPeriod}`);
      setGrades(res.data);
    } catch (error) {
      console.error("Error fetching grades:", error);
      showSnackbar("Failed to fetch grades", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, value) => {
    const updated = [...grades];
    updated[index].grade = value;
    setGrades(updated);
  };

  const saveGrade = async (g) => {
    setSaving(true);
    try {
      await api.post("/grades", {
        enrollment_id: g.enrollment_id,
        class_subject_id: classSubjectId,
        grading_period: gradingPeriod,
        grade: g.grade,
      });

      showSnackbar(`Grade saved for ${g.first_name} ${g.last_name}`, "success");
    } catch (error) {
      console.error("Error saving grade:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to save grade",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveAllGrades = async () => {
    setSaving(true);
    try {
      // Save all grades that have values
      const savePromises = grades
        .filter((g) => g.grade && g.grade.trim() !== "")
        .map((g) =>
          api.post("/grades", {
            enrollment_id: g.enrollment_id,
            class_subject_id: classSubjectId,
            grading_period: gradingPeriod,
            grade: g.grade,
          }),
        );

      await Promise.all(savePromises);
      showSnackbar("All grades saved successfully", "success");
    } catch (error) {
      console.error("Error saving grades:", error);
      showSnackbar("Failed to save some grades", "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredClassSubjects = classSubjects.filter((cs) =>
    `${cs.grade_level} ${cs.section} ${cs.subject_name}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // Sorting function
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Sort grades
  const sortedGrades = useMemo(() => {
    return [...grades].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      if (orderBy === "student_name") {
        aValue = `${a.first_name} ${a.last_name}`;
        bValue = `${b.first_name} ${b.last_name}`;
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
  }, [grades, orderBy, order]);

  // Pagination
  const paginatedGrades = sortedGrades.slice(
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

  // Calculate class statistics
  const classStats = useMemo(() => {
    if (grades.length === 0) return null;

    const validGrades = grades.filter(
      (g) => g.grade && !isNaN(parseFloat(g.grade)),
    );
    if (validGrades.length === 0) return null;

    const numericGrades = validGrades.map((g) => parseFloat(g.grade));
    const sum = numericGrades.reduce((acc, val) => acc + val, 0);
    const average = sum / numericGrades.length;
    const highest = Math.max(...numericGrades);
    const lowest = Math.min(...numericGrades);
    const passingCount = numericGrades.filter((g) => g >= 75).length;
    const failingCount = numericGrades.filter((g) => g < 75).length;
    const passingRate = (passingCount / numericGrades.length) * 100;

    return {
      average: average.toFixed(2),
      highest,
      lowest,
      passingCount,
      failingCount,
      passingRate: passingRate.toFixed(2),
      totalStudents: grades.length,
      gradedStudents: validGrades.length,
    };
  }, [grades]);

  // Get color based on grade value
  const getGradeColor = (grade) => {
    if (!grade) return "#999";
    const numGrade = parseFloat(grade);
    if (numGrade >= 90) return "#4caf50";
    if (numGrade >= 80) return "#2196f3";
    if (numGrade >= 75) return "#ff9800";
    return "#f44336";
  };

  return (
    <>
      <Helmet>
        <title>Grades Management | School Management System</title>
      </Helmet>

      <ThemeProvider theme={theme}>
        <div className={styles.gradesContainer}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <h1>Grades Management</h1>
              <p>Record and manage student grades across grading periods</p>
            </div>

            <div className={styles.headerActions}>
              <button
                className={styles.refreshBtn}
                onClick={fetchClassSubjects}
              >
                <FaSync /> Refresh
              </button>
            </div>
          </div>

          {/* Filter Section */}
          <StyledCard>
            <CardContent>
              <div className={styles.filterSection}>
                <div className={styles.searchBox}>
                  <FaSearch className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search class or subject..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button
                      className={styles.clearSearch}
                      onClick={() => setSearch("")}
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>

                <div className={styles.selectWrapper}>
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

                <div className={styles.gradingPeriodWrapper}>
                  <div className={styles.gradingPeriodIcons}>
                    {gradingPeriods.map((period) => (
                      <button
                        key={period.value}
                        className={`${styles.periodBtn} ${
                          gradingPeriod === period.value
                            ? styles.activePeriod
                            : ""
                        }`}
                        style={{
                          backgroundColor:
                            gradingPeriod === period.value
                              ? period.color
                              : "#f5f5f5",
                          color:
                            gradingPeriod === period.value ? "white" : "#666",
                        }}
                        onClick={() => setGradingPeriod(period.value)}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Class Info */}
              {selectedClassSubject && (
                <div className={styles.selectedClassInfo}>
                  <div className={styles.infoItem}>
                    <FaBookOpen className={styles.infoIcon} />
                    <span>
                      {selectedClassSubject.grade_level} -{" "}
                      {selectedClassSubject.section}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <FaGraduationCap className={styles.infoIcon} />
                    <span>{selectedClassSubject.subject_name}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <FaCalendarAlt className={styles.infoIcon} />
                    <span>
                      {
                        gradingPeriods.find((p) => p.value === gradingPeriod)
                          ?.label
                      }
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <FaUserGraduate className={styles.infoIcon} />
                    <span>{grades.length} Students</span>
                  </div>
                </div>
              )}
            </CardContent>
          </StyledCard>

          {/* Statistics Cards */}
          {classStats && selectedClassSubject && (
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.averageCard}`}>
                <div className={styles.statIcon}>
                  <FaChartLine />
                </div>
                <div className={styles.statInfo}>
                  <h3>Class Average</h3>
                  <p>{classStats.average}</p>
                  <small>
                    {classStats.gradedStudents} of {classStats.totalStudents}{" "}
                    graded
                  </small>
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.highestCard}`}>
                <div className={styles.statIcon}>
                  <FaChartLine />
                </div>
                <div className={styles.statInfo}>
                  <h3>Highest Grade</h3>
                  <p>{classStats.highest}</p>
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.lowestCard}`}>
                <div className={styles.statIcon}>
                  <FaChartLine />
                </div>
                <div className={styles.statInfo}>
                  <h3>Lowest Grade</h3>
                  <p>{classStats.lowest}</p>
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.passingCard}`}>
                <div className={styles.statIcon}>
                  <FaChartLine />
                </div>
                <div className={styles.statInfo}>
                  <h3>Passing Rate</h3>
                  <p>{classStats.passingRate}%</p>
                  <small>
                    {classStats.passingCount} passed, {classStats.failingCount}{" "}
                    failed
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Save All Button */}
          {grades.length > 0 && (
            <div className={styles.saveAllSection}>
              <button
                className={styles.saveAllBtn}
                onClick={saveAllGrades}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className={styles.smallSpinner}></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave /> Save All Grades
                  </>
                )}
              </button>
            </div>
          )}

          {/* Table */}
          <StyledTableContainer component={Paper}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading grades...</p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === "student_name"}
                          direction={orderBy === "student_name" ? order : "asc"}
                          onClick={() => handleRequestSort("student_name")}
                          sx={{ color: "white !important" }}
                        >
                          Student
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === "grade"}
                          direction={orderBy === "grade" ? order : "asc"}
                          onClick={() => handleRequestSort("grade")}
                          sx={{ color: "white !important" }}
                        >
                          Grade
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedGrades.length > 0 ? (
                      paginatedGrades.map((g, index) => {
                        const globalIndex = grades.findIndex(
                          (grade) => grade.enrollment_id === g.enrollment_id,
                        );
                        const gradeColor = getGradeColor(g.grade);

                        return (
                          <TableRow key={g.enrollment_id} hover>
                            <TableCell>
                              <div className={styles.studentInfo}>
                                <div className={styles.studentAvatar}>
                                  <FaUserGraduate />
                                </div>
                                <div>
                                  <div className={styles.studentName}>
                                    {g.first_name} {g.last_name}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className={styles.gradeInputWrapper}>
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={g.grade || ""}
                                  onChange={(e) =>
                                    handleChange(globalIndex, e.target.value)
                                  }
                                  className={styles.gradeInput}
                                  style={{
                                    borderColor: g.grade
                                      ? gradeColor
                                      : "#e0e0e0",
                                    boxShadow: g.grade
                                      ? `0 0 0 2px ${gradeColor}20`
                                      : "none",
                                  }}
                                />
                                {g.grade && (
                                  <Chip
                                    label={`${parseFloat(g.grade).toFixed(2)}%`}
                                    size="small"
                                    sx={{
                                      backgroundColor: `${gradeColor}20`,
                                      color: gradeColor,
                                      fontWeight: 600,
                                      marginLeft: "8px",
                                    }}
                                  />
                                )}
                              </div>
                            </TableCell>

                            <TableCell>
                              <Tooltip title="Save Grade">
                                <button
                                  className={styles.saveBtn}
                                  onClick={() => saveGrade(g)}
                                  disabled={saving}
                                >
                                  {saving ? (
                                    <div className={styles.smallSpinner}></div>
                                  ) : (
                                    <FaSave />
                                  )}
                                  Save
                                </button>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className={styles.emptyState}>
                          <div className={styles.emptyStateContent}>
                            <h3>No students found</h3>
                            <p>
                              {classSubjectId
                                ? "Select a different class subject or grading period"
                                : "Select a class subject to view students"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {grades.length > 0 && (
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={grades.length}
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
                )}
              </>
            )}
          </StyledTableContainer>
        </div>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
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

export default Grades;
