import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import styles from "../assets/styles/ClassSubjects.module.css";
import { Helmet } from "react-helmet-async";

import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaSync,
  FaPlus,
  FaTrash,
  FaEdit,
  FaChalkboardTeacher,
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

function ClassSubjects() {
  const [classSubjects, setClassSubjects] = useState([]);
  const [filteredClassSubjects, setFilteredClassSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");

  // Pagination and Sorting
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("grade_level");
  const [order, setOrder] = useState("asc");

  const [formData, setFormData] = useState({
    class_id: "",
    subject_id: "",
    teacher_id: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  // Search and Filter effect
  useEffect(() => {
    let result = classSubjects;

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (item) =>
          item.grade_level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.subject_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.teacher_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Class filter
    if (filterClass !== "all") {
      result = result.filter((item) => item.class_id === filterClass);
    }

    // Subject filter
    if (filterSubject !== "all") {
      result = result.filter(
        (item) => item.subject_id === parseInt(filterSubject),
      );
    }

    setFilteredClassSubjects(result);
    setPage(0);
  }, [searchTerm, filterClass, filterSubject, classSubjects]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchAssignments(),
        fetchClasses(),
        fetchSubjects(),
        fetchTeachers(),
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    const res = await api.get("/class-subjects");
    setClassSubjects(res.data);
    setFilteredClassSubjects(res.data);
  };

  const fetchClasses = async () => {
    const res = await api.get("/classes");
    setClasses(res.data);
  };

  const fetchSubjects = async () => {
    const res = await api.get("/subjects");
    setSubjects(res.data);
  };

  const fetchTeachers = async () => {
    const res = await api.get("/teachers");
    setTeachers(res.data);
  };

  // Sorting function
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Sort class subjects
  const sortedClassSubjects = useMemo(() => {
    return [...filteredClassSubjects].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle nested or computed fields
      if (orderBy === "class") {
        aValue = `${a.grade_level} ${a.section}`;
        bValue = `${b.grade_level} ${b.section}`;
      } else if (orderBy === "teacher") {
        aValue = a.teacher_name || "";
        bValue = b.teacher_name || "";
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
  }, [filteredClassSubjects, orderBy, order]);

  // Pagination
  const paginatedClassSubjects = sortedClassSubjects.slice(
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/class-subjects", formData);

      setFormData({
        class_id: "",
        subject_id: "",
        teacher_id: "",
      });

      setShowModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };

  const handleDelete = async (id) => {
    try {
      if (!window.confirm("Are you sure you want to delete this assignment?"))
        return;

      await api.delete(`/class-subjects/${id}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete assignment");
    }
  };

  const updateTeacher = async (id, teacher_id) => {
    try {
      await api.put(`/class-subjects/${id}`, {
        teacher_id,
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update teacher");
    }
  };

  // Get unique values for filters
  const classOptions = classes.map((c) => ({
    id: c.id,
    name: `${c.grade_level} - ${c.section}`,
  }));

  const subjectOptions = subjects.map((s) => ({
    id: s.id,
    name: s.subject_name,
  }));

  // Table columns
  const headCells = [
    { id: "class", label: "Class", sortable: true },
    { id: "subject_name", label: "Subject", sortable: true },
    { id: "teacher", label: "Teacher", sortable: true },
    { id: "actions", label: "Action", sortable: false },
  ];

  return (
    <>
      <Helmet>
        <title>Class Subjects | School Management System</title>
      </Helmet>

      <ThemeProvider theme={theme}>
        <div className={styles.classSubjectsContainer}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <h1>Class Subject Assignment</h1>
              <p>Manage subject assignments for each class section</p>
            </div>

            <div className={styles.headerActions}>
              <button
                className={styles.addBtn}
                onClick={() => {
                  setFormData({
                    class_id: "",
                    subject_id: "",
                    teacher_id: "",
                  });
                  setShowModal(true);
                }}
              >
                <FaPlus /> Assign Subject
              </button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by class, subject, or teacher..."
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
                  onChange={(e) =>
                    setFilterClass(
                      e.target.value === "all" ? "all" : Number(e.target.value),
                    )
                  }
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

            {subjectOptions.length > 0 && (
              <div className={styles.filterBox}>
                <FaFilter className={styles.filterIcon} />
                <select
                  value={filterSubject}
                  onChange={(e) =>
                    setFilterSubject(
                      e.target.value === "all" ? "all" : Number(e.target.value),
                    )
                  }
                >
                  <option value="all">All Subjects</option>
                  {subjectOptions.map((subj) => (
                    <option key={subj.id} value={subj.id}>
                      {subj.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button className={styles.refreshBtn} onClick={fetchData}>
              <FaSync /> Refresh
            </button>
          </div>

          {/* Table */}
          <StyledTableContainer component={Paper}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading assignments...</p>
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
                    {paginatedClassSubjects.length > 0 ? (
                      paginatedClassSubjects.map((item) => (
                        <TableRow key={item.id} hover>
                          <TableCell>
                            <div className={styles.classBadge}>
                              <span className={styles.gradeLevel}>
                                {item.grade_level}
                              </span>
                              <span className={styles.sectionBadge}>
                                {item.section}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={item.subject_name}
                              size="small"
                              sx={{
                                backgroundColor: "#e3f2fd",
                                color: "#1976d2",
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <select
                              className={styles.teacherSelect}
                              value={item.teacher_id || ""}
                              onChange={(e) =>
                                updateTeacher(item.id, e.target.value)
                              }
                            >
                              <option value="">Select Teacher</option>
                              {teachers.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.first_name} {t.last_name}
                                </option>
                              ))}
                            </select>
                          </TableCell>

                          <TableCell>
                            <Tooltip title="Delete Assignment">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(item.id)}
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
                            <h3>No assignments found</h3>
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
                  count={filteredClassSubjects.length}
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
                  <h2>Assign Subject to Class</h2>
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
                      <label>Subject</label>
                      <select
                        name="subject_id"
                        value={formData.subject_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.subject_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Teacher</label>
                      <select
                        name="teacher_id"
                        value={formData.teacher_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Teacher</option>
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.first_name} {t.last_name}
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
                      Assign Subject
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </ThemeProvider>
    </>
  );
}

export default ClassSubjects;
