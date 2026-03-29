import { useEffect, useState } from "react";
import api from "../services/api";
import styles from "../assets/styles/Promotion.module.css";
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
  FaArrowRight,
  FaUsers,
  FaCheckCircle,
  FaExclamationTriangle,
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
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: "30px",
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

function Promotion() {
  const [students, setStudents] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [gradeFilter, setGradeFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [nextYearClasses, setNextYearClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Pagination and Sorting
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("student_name");
  const [order, setOrder] = useState("asc");

  // Search
  const [search, setSearch] = useState("");

  // Load school years
  const loadSchoolYears = async () => {
    try {
      const res = await api.get("/school-years");

      const years = res.data;
      setSchoolYears(years);

      const active = years.find((y) => y.is_active);

      if (active) {
        setSelectedYear(Number(active.id));
      } else if (years.length > 0) {
        setSelectedYear(Number(years[0].id));
      }
    } catch (error) {
      console.error("Error loading school years:", error);
      showSnackbar("Failed to load school years", "error");
    }
  };

  // Load students eligible for promotion
  const loadStudents = async () => {
    if (!selectedYear) return;

    setLoading(true);
    try {
      const res = await api.get("/promotion", {
        params: {
          school_year_id: selectedYear,
          grade: gradeFilter || undefined,
          section: sectionFilter || undefined,
        },
      });

      const data = res.data.map((s) => ({
        ...s,
        action: "promote",
        next_class_id: "",
      }));

      setStudents(data);
    } catch (error) {
      console.error("Error loading promotion students:", error);
      showSnackbar("Failed to load students", "error");
    } finally {
      setLoading(false);
    }
  };

  // Load next school year classes
  const loadNextYearClasses = async () => {
    if (!selectedYear) return;

    try {
      const currentIndex = schoolYears.findIndex(
        (y) => Number(y.id) === Number(selectedYear),
      );

      const nextYear = schoolYears[currentIndex + 1];

      if (!nextYear) return;

      const res = await api.get("/next-classes", {
        params: {
          school_year_id: nextYear.id,
        },
      });

      setNextYearClasses(res.data);
    } catch (error) {
      console.error("Error loading next year classes:", error);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    loadSchoolYears();
  }, []);

  useEffect(() => {
    loadStudents();
  }, [selectedYear, gradeFilter, sectionFilter]);

  useEffect(() => {
    if (schoolYears.length > 0 && selectedYear) {
      loadNextYearClasses();
    }
  }, [schoolYears, selectedYear]);

  const updateAction = (index, action) => {
    const updated = [...students];
    updated[index].action = action;
    setStudents(updated);
  };

  const updateNextClass = (index, classId) => {
    const updated = [...students];
    updated[index].next_class_id = Number(classId);
    setStudents(updated);
  };

  // Run promotion
  const runPromotion = async () => {
    try {
      const currentIndex = schoolYears.findIndex(
        (y) => Number(y.id) === Number(selectedYear),
      );

      const nextYear = schoolYears[currentIndex + 1];

      if (!nextYear) {
        showSnackbar("Next school year not found", "error");
        return;
      }

      setProcessing(true);
      await api.post("/promotion/run", {
        next_year_id: nextYear.id,
        students,
      });

      showSnackbar("Promotion completed successfully!", "success");
      loadStudents();
    } catch (error) {
      console.error("Promotion error:", error);
      showSnackbar("Promotion failed", "error");
    } finally {
      setProcessing(false);
    }
  };

  const clearFilters = () => {
    setGradeFilter("");
    setSectionFilter("");
    setSearch("");
  };

  // Filter students based on search
  const filteredStudents = students.filter((s) =>
    `${s.first_name} ${s.last_name} ${s.grade_level} ${s.section}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // Sorting function
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let aValue = a[orderBy];
    let bValue = b[orderBy];

    if (orderBy === "student_name") {
      aValue = `${a.first_name} ${a.last_name}`;
      bValue = `${b.first_name} ${b.last_name}`;
    }

    if (order === "asc") {
      return (aValue || "").toString().localeCompare((bValue || "").toString());
    } else {
      return (bValue || "").toString().localeCompare((aValue || "").toString());
    }
  });

  // Pagination
  const paginatedStudents = sortedStudents.slice(
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

  // Get action color
  const getActionColor = (action) => {
    switch (action) {
      case "promote":
        return "#4caf50";
      case "retain":
        return "#ff9800";
      case "graduate":
        return "#9c27b0";
      case "transfer":
        return "#2196f3";
      case "not_enroll":
        return "#f44336";
      default:
        return "#999";
    }
  };

  // Get action label
  const getActionLabel = (action) => {
    switch (action) {
      case "promote":
        return "Promote";
      case "retain":
        return "Retain";
      case "graduate":
        return "Graduate";
      case "transfer":
        return "Transfer";
      case "not_enroll":
        return "Not Enroll";
      default:
        return action;
    }
  };

  // Calculate statistics
  const stats = {
    total: students.length,
    promote: students.filter((s) => s.action === "promote").length,
    retain: students.filter((s) => s.action === "retain").length,
    graduate: students.filter((s) => s.action === "graduate").length,
    transfer: students.filter((s) => s.action === "transfer").length,
    not_enroll: students.filter((s) => s.action === "not_enroll").length,
  };

  return (
    <>
      <Helmet>
        <title>Student Promotion | School Management System</title>
      </Helmet>

      <ThemeProvider theme={theme}>
        <div className={styles.promotionContainer}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <h1>Student Promotion</h1>
              <p>Manage student promotion to the next grade level</p>
            </div>

            <div className={styles.headerActions}>
              <button
                className={styles.refreshBtn}
                onClick={loadStudents}
                disabled={loading}
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
                    placeholder="Search students..."
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
                    value={selectedYear ?? ""}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className={styles.selectInput}
                  >
                    <option value="">Select School Year</option>

                    {schoolYears.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.year ? y.year : `${y.year_start}-${y.year_end}`}
                        {y.is_active ? " (Active)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.selectWrapper}>
                  <input
                    type="text"
                    placeholder="Grade Level"
                    value={gradeFilter}
                    onChange={(e) => setGradeFilter(e.target.value)}
                    className={styles.selectInput}
                  />
                </div>

                <div className={styles.selectWrapper}>
                  <input
                    type="text"
                    placeholder="Section"
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    className={styles.selectInput}
                  />
                </div>

                {(gradeFilter || sectionFilter || search) && (
                  <button
                    className={styles.clearFiltersBtn}
                    onClick={clearFilters}
                  >
                    <FaTimes /> Clear Filters
                  </button>
                )}
              </div>

              {/* Selected Year Info */}
              {selectedYear && (
                <div className={styles.selectedClassInfo}>
                  <div className={styles.infoItem}>
                    <FaCalendarAlt className={styles.infoIcon} />
                    <span>
                      School Year:{" "}
                      {schoolYears.find(
                        (y) => Number(y.id) === Number(selectedYear),
                      )?.year ||
                        `${schoolYears.find((y) => Number(y.id) === Number(selectedYear))?.year_start}-${schoolYears.find((y) => Number(y.id) === Number(selectedYear))?.year_end}`}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <FaUsers className={styles.infoIcon} />
                    <span>{students.length} Students</span>
                  </div>
                </div>
              )}
            </CardContent>
          </StyledCard>

          {/* Statistics Cards */}
          {students.length > 0 && (
            <div className={styles.statsGrid}>
              <div className={`${styles.statCard} ${styles.totalCard}`}>
                <div className={styles.statIcon}>
                  <FaUsers />
                </div>
                <div className={styles.statInfo}>
                  <h3>Total Students</h3>
                  <p>{stats.total}</p>
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.promoteCard}`}>
                <div className={styles.statIcon}>
                  <FaArrowRight />
                </div>
                <div className={styles.statInfo}>
                  <h3>Promote</h3>
                  <p>{stats.promote}</p>
                  <small>
                    {((stats.promote / stats.total) * 100 || 0).toFixed(1)}%
                  </small>
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.retainCard}`}>
                <div className={styles.statIcon}>
                  <FaExclamationTriangle />
                </div>
                <div className={styles.statInfo}>
                  <h3>Retain</h3>
                  <p>{stats.retain}</p>
                  <small>
                    {((stats.retain / stats.total) * 100 || 0).toFixed(1)}%
                  </small>
                </div>
              </div>

              <div className={`${styles.statCard} ${styles.graduateCard}`}>
                <div className={styles.statIcon}>
                  <FaGraduationCap />
                </div>
                <div className={styles.statInfo}>
                  <h3>Graduate</h3>
                  <p>{stats.graduate}</p>
                  <small>
                    {((stats.graduate / stats.total) * 100 || 0).toFixed(1)}%
                  </small>
                </div>
              </div>
            </div>
          )}

          {/* Run Promotion Button */}
          {students.length > 0 && (
            <div className={styles.promotionSection}>
              <button
                className={styles.runPromotionBtn}
                onClick={runPromotion}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <div className={styles.smallSpinner}></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FaSave /> Run Promotion
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
                <p>Loading students...</p>
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
                          active={orderBy === "grade_level"}
                          direction={orderBy === "grade_level" ? order : "asc"}
                          onClick={() => handleRequestSort("grade_level")}
                          sx={{ color: "white !important" }}
                        >
                          Grade
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === "section"}
                          direction={orderBy === "section" ? order : "asc"}
                          onClick={() => handleRequestSort("section")}
                          sx={{ color: "white !important" }}
                        >
                          Section
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Next Class</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {paginatedStudents.length > 0 ? (
                      paginatedStudents.map((s, index) => {
                        const globalIndex = students.findIndex(
                          (student) =>
                            student.enrollment_id === s.enrollment_id,
                        );
                        const actionColor = getActionColor(s.action);

                        return (
                          <TableRow key={s.enrollment_id} hover>
                            <TableCell>
                              <div className={styles.studentInfo}>
                                <div className={styles.studentAvatar}>
                                  <FaUserGraduate />
                                </div>
                                <div>
                                  <div className={styles.studentName}>
                                    {s.first_name} {s.last_name}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Chip
                                label={`Grade ${s.grade_level}`}
                                size="small"
                                sx={{
                                  backgroundColor: "#e8f5e8",
                                  color: "#2e7d32",
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>

                            <TableCell>
                              <Chip
                                label={s.section}
                                size="small"
                                sx={{
                                  backgroundColor: "#e3f2fd",
                                  color: "#1976d2",
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>

                            <TableCell>
                              <div className={styles.actionWrapper}>
                                <select
                                  value={s.action}
                                  onChange={(e) =>
                                    updateAction(globalIndex, e.target.value)
                                  }
                                  className={styles.actionSelect}
                                  style={{
                                    borderColor: actionColor,
                                    backgroundColor: `${actionColor}10`,
                                  }}
                                >
                                  <option value="promote">Promote</option>
                                  <option value="retain">Retain</option>
                                  <option value="not_enroll">Not Enroll</option>
                                  <option value="transfer">Transfer</option>
                                  <option value="graduate">Graduate</option>
                                </select>
                                <Chip
                                  label={getActionLabel(s.action)}
                                  size="small"
                                  sx={{
                                    backgroundColor: `${actionColor}20`,
                                    color: actionColor,
                                    fontWeight: 600,
                                    ml: 1,
                                  }}
                                />
                              </div>
                            </TableCell>

                            <TableCell>
                              {(s.action === "promote" ||
                                s.action === "retain") && (
                                <select
                                  value={s.next_class_id}
                                  onChange={(e) =>
                                    updateNextClass(globalIndex, e.target.value)
                                  }
                                  className={styles.classSelect}
                                >
                                  <option value="">Select Class</option>

                                  {nextYearClasses.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      Grade {c.grade_level} - {c.section}
                                    </option>
                                  ))}
                                </select>
                              )}
                              {s.action === "graduate" && (
                                <Chip
                                  label="Graduated"
                                  size="small"
                                  sx={{
                                    backgroundColor: "#9c27b020",
                                    color: "#9c27b0",
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                              {s.action === "transfer" && (
                                <Chip
                                  label="Transfer"
                                  size="small"
                                  sx={{
                                    backgroundColor: "#2196f320",
                                    color: "#2196f3",
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                              {s.action === "not_enroll" && (
                                <Chip
                                  label="Not Enrolling"
                                  size="small"
                                  sx={{
                                    backgroundColor: "#f4433620",
                                    color: "#f44336",
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className={styles.emptyState}>
                          <div className={styles.emptyStateContent}>
                            <h3>No students found</h3>
                            <p>
                              {selectedYear
                                ? "Try adjusting your filters"
                                : "Select a school year to view students"}
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {filteredStudents.length > 0 && (
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredStudents.length}
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

export default Promotion;
