import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import styles from "../assets/styles/Classes.module.css";
import { Helmet } from "react-helmet-async";

import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaSync,
  FaPlus,
  FaTrash,
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
  },
});

// Styled Table Container
const StyledTableContainer = styled(TableContainer)({
  borderRadius: "24px",
  boxShadow: "0 15px 35px rgba(0, 100, 0, 0.1)",
  border: "1px solid rgba(0, 150, 0, 0.1)",
  marginTop: "20px",
});

function Classes() {
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");

  // Pagination and Sorting
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("grade_level");
  const [order, setOrder] = useState("asc");

  const [formData, setFormData] = useState({
    grade_level: "",
    section: "",
    school_year_id: "",
  });

  const API = "http://localhost:3001/api";

  useEffect(() => {
    fetchClasses();
    fetchSchoolYears();
  }, []);

  // Search and Filter effect
  useEffect(() => {
    let result = classes;

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (cls) =>
          cls.grade_level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cls.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cls.school_year?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Grade filter
    if (filterGrade !== "all") {
      result = result.filter((cls) => cls.grade_level === filterGrade);
    }

    setFilteredClasses(result);
    setPage(0);
  }, [searchTerm, filterGrade, classes]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/classes`);
      setClasses(res.data);
      setFilteredClasses(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolYears = async () => {
    const res = await axios.get(`${API}/school-years`);
    setSchoolYears(res.data);
  };

  // Sorting function
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Sort classes
  const sortedClasses = useMemo(() => {
    return [...filteredClasses].sort((a, b) => {
      const aValue = a[orderBy] || "";
      const bValue = b[orderBy] || "";

      if (order === "asc") {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });
  }, [filteredClasses, orderBy, order]);

  // Pagination
  const paginatedClasses = sortedClasses.slice(
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addClass = async () => {
    try {
      await axios.post(`${API}/classes`, formData);

      setFormData({
        grade_level: "",
        section: "",
        school_year_id: "",
      });

      setShowModal(false);
      fetchClasses();
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      alert(message);
    }
  };

  const deleteClass = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to delete this class?"))
        return;

      await axios.delete(`${API}/classes/${id}`);
      fetchClasses();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete class";
      alert(message);
    }
  };

  // Get unique grades for filter
  const grades = [
    ...new Set(classes.map((c) => c.grade_level).filter(Boolean)),
  ];

  // Table columns
  const headCells = [
    { id: "grade_level", label: "Grade", sortable: true },
    { id: "section", label: "Section", sortable: true },
    { id: "school_year", label: "School Year", sortable: true },
    { id: "actions", label: "Action", sortable: false },
  ];

  return (
    <>
      <Helmet>
        <title>Classes | School Management System</title>
      </Helmet>

      <ThemeProvider theme={theme}>
        <div className={styles.classesContainer}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <h1>Classes Management</h1>
              <p>Manage and track all class sections</p>
            </div>

            <div className={styles.headerActions}>
              <button
                className={styles.addBtn}
                onClick={() => {
                  setFormData({
                    grade_level: "",
                    section: "",
                    school_year_id: "",
                  });
                  setShowModal(true);
                }}
              >
                <FaPlus /> Add Class
              </button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by grade, section, or school year..."
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

            {grades.length > 0 && (
              <div className={styles.filterBox}>
                <FaFilter className={styles.filterIcon} />
                <select
                  value={filterGrade}
                  onChange={(e) => setFilterGrade(e.target.value)}
                >
                  <option value="all">All Grades</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button className={styles.refreshBtn} onClick={fetchClasses}>
              <FaSync /> Refresh
            </button>
          </div>

          {/* Table */}
          <StyledTableContainer component={Paper}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading classes...</p>
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
                    {paginatedClasses.length > 0 ? (
                      paginatedClasses.map((cls) => (
                        <TableRow key={cls.id} hover>
                          <TableCell>
                            <Chip
                              label={cls.grade_level}
                              size="small"
                              sx={{
                                backgroundColor: "#e8f5e8",
                                color: "#2e7d32",
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <span className={styles.sectionBadge}>
                              {cls.section}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className={styles.schoolYear}>
                              {cls.school_year}
                            </span>
                          </TableCell>

                          <TableCell>
                            <Tooltip title="Delete Class">
                              <IconButton
                                size="small"
                                onClick={() => deleteClass(cls.id)}
                                sx={{
                                  color: "#f44336",
                                  "&:hover": { backgroundColor: "#ffebee" },
                                }}
                              >
                                <FaTrash />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className={styles.emptyState}>
                          <div className={styles.emptyStateContent}>
                            <h3>No classes found</h3>
                            <p>Try adjusting your search or filter criteria</p>
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
                  count={filteredClasses.length}
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

          {/* Modal */}
          {showModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h2>Add New Class</h2>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setShowModal(false)}
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label>Grade Level</label>
                    <select
                      name="grade_level"
                      value={formData.grade_level}
                      onChange={handleChange}
                    >
                      <option value="">Select Grade</option>
                      <option value="Grade 1">Grade 1</option>
                      <option value="Grade 2">Grade 2</option>
                      <option value="Grade 3">Grade 3</option>
                      <option value="Grade 4">Grade 4</option>
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Section</label>
                    <select
                      name="section"
                      value={formData.section}
                      onChange={handleChange}
                    >
                      <option value="">Select Section</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>School Year</label>
                    <select
                      name="school_year_id"
                      value={formData.school_year_id}
                      onChange={handleChange}
                    >
                      <option value="">Select School Year</option>
                      {schoolYears.map((year) => (
                        <option key={year.id} value={year.id}>
                          {year.year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button className={styles.saveBtn} onClick={addClass}>
                    Save Class
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </ThemeProvider>
    </>
  );
}

export default Classes;
