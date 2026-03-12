import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import styles from "../assets/styles/Subjects.module.css";
import { Helmet } from "react-helmet-async";
import {
  FaSearch,
  FaTimes,
  FaSync,
  FaPlus,
  FaTrash,
  FaBook,
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
  },
});

// Styled Table Container
const StyledTableContainer = styled(TableContainer)({
  borderRadius: "24px",
  boxShadow: "0 15px 35px rgba(0, 100, 0, 0.1)",
  border: "1px solid rgba(0, 150, 0, 0.1)",
  marginTop: "20px",
});

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Pagination and Sorting
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("subject_name");
  const [order, setOrder] = useState("asc");

  const [formData, setFormData] = useState({
    subject_name: "",
    subject_code: "",
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Search effect
  useEffect(() => {
    let result = subjects;

    if (searchTerm) {
      result = result.filter(
        (subject) =>
          subject.subject_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          subject.subject_code
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredSubjects(result);
    setPage(0);
  }, [searchTerm, subjects]);

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const res = await api.get("/subjects");
      setSubjects(res.data);
      setFilteredSubjects(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Sorting function
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Sort subjects
  const sortedSubjects = useMemo(() => {
    return [...filteredSubjects].sort((a, b) => {
      const aValue = a[orderBy] || "";
      const bValue = b[orderBy] || "";

      if (order === "asc") {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });
  }, [filteredSubjects, orderBy, order]);

  // Pagination
  const paginatedSubjects = sortedSubjects.slice(
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

  const addSubject = async () => {
    try {
      await api.post("/subjects", formData);

      setFormData({
        subject_name: "",
        subject_code: "",
      });

      setShowModal(false);
      fetchSubjects();
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      alert(message);
    }
  };

  const deleteSubject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject?"))
      return;

    try {
      await api.delete(`/subjects/${id}`);
      fetchSubjects();
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to delete subject";
      alert(message);
    }
  };

  // Table columns
  const headCells = [
    { id: "subject_name", label: "Subject Name", sortable: true },
    { id: "subject_code", label: "Subject Code", sortable: true },
    { id: "actions", label: "Action", sortable: false },
  ];

  return (
    <>
      <Helmet>
        <title>Subject | School Management System</title>
      </Helmet>

      <ThemeProvider theme={theme}>
        <div className={styles.subjectsContainer}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <h1>Subjects Management</h1>
              <p>Manage and track all academic subjects</p>
            </div>

            <div className={styles.headerActions}>
              <button
                className={styles.addBtn}
                onClick={() => {
                  setFormData({
                    subject_name: "",
                    subject_code: "",
                  });
                  setShowModal(true);
                }}
              >
                <FaPlus /> Add Subject
              </button>
            </div>
          </div>

          {/* Search Control */}
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by subject name or code..."
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

            <button className={styles.refreshBtn} onClick={fetchSubjects}>
              <FaSync /> Refresh
            </button>
          </div>

          {/* Table */}
          <StyledTableContainer component={Paper}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading subjects...</p>
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
                    {paginatedSubjects.length > 0 ? (
                      paginatedSubjects.map((subject) => (
                        <TableRow key={subject.id} hover>
                          <TableCell>
                            <div className={styles.subjectNameCell}>
                              <FaBook className={styles.subjectIcon} />
                              <span>{subject.subject_name}</span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={subject.subject_code}
                              size="small"
                              sx={{
                                backgroundColor: "#e8f5e8",
                                color: "#2e7d32",
                                fontWeight: 600,
                                fontFamily: "monospace",
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <Tooltip title="Delete Subject">
                              <IconButton
                                size="small"
                                onClick={() => deleteSubject(subject.id)}
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
                        <TableCell colSpan={3} className={styles.emptyState}>
                          <div className={styles.emptyStateContent}>
                            <FaBook size={48} color="#ccc" />
                            <h3>No subjects found</h3>
                            <p>
                              Try adjusting your search or add a new subject
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
                  count={filteredSubjects.length}
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
                  <h2>Add New Subject</h2>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setShowModal(false)}
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label>Subject Name</label>
                    <input
                      type="text"
                      name="subject_name"
                      placeholder="e.g., Mathematics, Science, English"
                      value={formData.subject_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Subject Code</label>
                    <input
                      type="text"
                      name="subject_code"
                      placeholder="e.g., MATH101, SCI202, ENG103"
                      value={formData.subject_code}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button className={styles.saveBtn} onClick={addSubject}>
                    Save Subject
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

export default Subjects;
