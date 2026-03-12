import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import styles from "../assets/styles/SchoolYears.module.css";
import { Helmet } from "react-helmet-async";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaSync,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaCalendarAlt,
  FaPlayCircle,
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
      main: "#ff9800",
    },
    success: {
      main: "#28a745",
    },
    error: {
      main: "#f44336",
    },
    warning: {
      main: "#ff9800",
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
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: "30px",
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

function SchoolYears() {
  const [years, setYears] = useState([]);
  const [filteredYears, setFilteredYears] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editYear, setEditYear] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination and Sorting
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("year_start");
  const [order, setOrder] = useState("asc");

  const [formData, setFormData] = useState({
    year_start: "",
    year_end: "",
  });

  const API = "http://localhost:3001/api";

  useEffect(() => {
    fetchYears();
  }, []);

  // Search and Filter effect
  useEffect(() => {
    let result = years;

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (year) =>
          year.year_start?.toString().includes(searchTerm) ||
          year.year_end?.toString().includes(searchTerm) ||
          `${year.year_start} - ${year.year_end}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((year) =>
        filterStatus === "active" ? year.is_active : !year.is_active,
      );
    }

    setFilteredYears(result);
    setPage(0);
  }, [searchTerm, filterStatus, years]);

  const fetchYears = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/school-years-full`);
      setYears(res.data);
      setFilteredYears(res.data);
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

  // Sort years
  const sortedYears = useMemo(() => {
    return [...filteredYears].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      if (orderBy === "year_range") {
        aValue = `${a.year_start} - ${a.year_end}`;
        bValue = `${b.year_start} - ${b.year_end}`;
      } else if (orderBy === "status") {
        aValue = a.is_active ? "active" : "inactive";
        bValue = b.is_active ? "active" : "inactive";
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
  }, [filteredYears, orderBy, order]);

  // Pagination
  const paginatedYears = sortedYears.slice(
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

  const saveYear = async () => {
    try {
      if (editYear) {
        await axios.put(`${API}/school-years/${editYear.id}`, formData);
      } else {
        await axios.post(`${API}/school-years`, formData);
      }

      setShowModal(false);
      setEditYear(null);

      setFormData({
        year_start: "",
        year_end: "",
      });

      fetchYears();
    } catch (error) {
      alert(error.response?.data?.message || "Something went wrong");
    }
  };

  const openEdit = (year) => {
    setEditYear(year);

    setFormData({
      year_start: year.year_start,
      year_end: year.year_end,
    });

    setShowModal(true);
  };

  const deleteYear = async (id) => {
    if (!window.confirm("Are you sure you want to delete this school year?"))
      return;

    try {
      await axios.delete(`${API}/school-years/${id}`);
      fetchYears();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete school year");
    }
  };

  const activateYear = async (id) => {
    try {
      await axios.put(`${API}/school-years/${id}/activate`);
      fetchYears();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to activate school year");
    }
  };

  // Table columns
  const headCells = [
    { id: "year_range", label: "School Year", sortable: true },
    { id: "status", label: "Status", sortable: true },
    { id: "actions", label: "Action", sortable: false },
  ];

  return (
    <>
      <Helmet>
        <title>School Years | School Management System</title>
      </Helmet>

      <ThemeProvider theme={theme}>
        <div className={styles.schoolYearsContainer}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <h1>School Years</h1>
              <p>Manage academic years and activate current year</p>
            </div>

            <div className={styles.headerActions}>
              <button
                className={styles.addBtn}
                onClick={() => {
                  setEditYear(null);
                  setFormData({
                    year_start: "",
                    year_end: "",
                  });
                  setShowModal(true);
                }}
              >
                <FaPlus /> Add School Year
              </button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by school year..."
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

            <div className={styles.filterBox}>
              <FaFilter className={styles.filterIcon} />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button className={styles.refreshBtn} onClick={fetchYears}>
              <FaSync /> Refresh
            </button>
          </div>

          {/* Table */}
          <StyledTableContainer component={Paper}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading school years...</p>
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
                    {paginatedYears.length > 0 ? (
                      paginatedYears.map((year) => (
                        <TableRow key={year.id} hover>
                          <TableCell>
                            <div className={styles.yearRange}>
                              <FaCalendarAlt className={styles.yearIcon} />
                              <span>
                                {year.year_start} - {year.year_end}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            {year.is_active ? (
                              <Chip
                                icon={<FaCheckCircle />}
                                label="Active"
                                color="success"
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  "& .MuiChip-icon": {
                                    color: "white",
                                  },
                                }}
                              />
                            ) : (
                              <Chip
                                icon={<FaTimesCircle />}
                                label="Inactive"
                                color="default"
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  backgroundColor: "#ccc",
                                  color: "#666",
                                  "& .MuiChip-icon": {
                                    color: "#666",
                                  },
                                }}
                              />
                            )}
                          </TableCell>

                          <TableCell>
                            <div className={styles.actionButtons}>
                              {!year.is_active && (
                                <Tooltip title="Activate School Year">
                                  <button
                                    className={styles.activateBtn}
                                    onClick={() => activateYear(year.id)}
                                  >
                                    <FaPlayCircle />
                                  </button>
                                </Tooltip>
                              )}

                              <Tooltip title="Edit School Year">
                                <button
                                  className={styles.editBtn}
                                  onClick={() => openEdit(year)}
                                >
                                  <FaEdit />
                                </button>
                              </Tooltip>

                              <Tooltip title="Delete School Year">
                                <button
                                  className={styles.deleteBtn}
                                  onClick={() => deleteYear(year.id)}
                                  disabled={year.is_active}
                                >
                                  <FaTrash />
                                </button>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className={styles.emptyState}>
                          <div className={styles.emptyStateContent}>
                            <FaCalendarAlt size={48} color="#ccc" />
                            <h3>No school years found</h3>
                            <p>
                              Click "Add School Year" to create your first
                              academic year
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
                  count={filteredYears.length}
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
                  <h2>{editYear ? "Edit School Year" : "Add School Year"}</h2>
                  <button
                    className={styles.closeBtn}
                    onClick={() => {
                      setShowModal(false);
                      setEditYear(null);
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label>Start Year</label>
                    <input
                      type="number"
                      name="year_start"
                      placeholder="e.g., 2024"
                      value={formData.year_start}
                      onChange={handleChange}
                      min="2000"
                      max="2100"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>End Year</label>
                    <input
                      type="number"
                      name="year_end"
                      placeholder="e.g., 2025"
                      value={formData.year_end}
                      onChange={handleChange}
                      min="2000"
                      max="2100"
                    />
                  </div>

                  <div className={styles.yearHint}>
                    <FaCalendarAlt />
                    <small>
                      Example: 2024 - 2025 represents School Year 2024-2025
                    </small>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => {
                      setShowModal(false);
                      setEditYear(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button className={styles.saveBtn} onClick={saveYear}>
                    {editYear ? "Update" : "Save"}
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

export default SchoolYears;
