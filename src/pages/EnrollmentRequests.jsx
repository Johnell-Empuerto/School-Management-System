import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import styles from "../assets/styles/EnrollmentRequests.module.css";
import { Helmet } from "react-helmet-async";
import Swal from "sweetalert2";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaUserGraduate,
  FaClock,
  FaCheckDouble,
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
  Badge,
  Tab,
  Tabs,
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

function EnrollmentRequests() {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGrade, setFilterGrade] = useState("all");

  // Pagination and Sorting
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("created_at");
  const [order, setOrder] = useState("desc");

  useEffect(() => {
    fetchRequests();
  }, []);

  // Search and Filter effect
  useEffect(() => {
    let result = requests;

    // Filter by status tab
    if (activeTab === 0) {
      result = result.filter((r) => r.status === "pending");
    } else if (activeTab === 1) {
      result = result.filter((r) => r.status === "approved");
    } else if (activeTab === 2) {
      result = result.filter((r) => r.status === "rejected");
    }

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (req) =>
          `${req.first_name} ${req.last_name}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          req.grade_level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.section?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.school_year?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Grade filter
    if (filterGrade !== "all") {
      result = result.filter((req) => req.grade_level === filterGrade);
    }

    setFilteredRequests(result);
    setPage(0);
  }, [searchTerm, filterGrade, activeTab, requests]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get("/enrollment-requests");
      setRequests(res.data);
      setFilteredRequests(res.data.filter((r) => r.status === "pending"));
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id) => {
    const result = await Swal.fire({
      title: "Approve Enrollment Request?",
      text: "This student will be officially enrolled.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2e7d32",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, approve it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.put(`/enrollment-requests/approve/${id}`);

      fetchRequests();

      Swal.fire({
        title: "Success",
        text: res.data?.message || "Enrollment request approved",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      const errValue =
        err.response?.data?.message ||
        err.message ||
        "Failed to approve request";

      Swal.fire({
        title: "Error!",
        text: errValue,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const rejectRequest = async (id) => {
    const result = await Swal.fire({
      title: "Reject Enrollment Request?",
      text: "This student request will be rejected.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, reject it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await api.put(`/enrollment-requests/reject/${id}`);

      fetchRequests();

      Swal.fire({
        title: "Success",
        text: res.data?.message || "Enrollment request rejected",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      const errValue =
        err.response?.data?.message ||
        err.message ||
        "Failed to reject request";

      Swal.fire({
        title: "Error!",
        text: errValue,
        icon: "error",
        confirmButtonText: "OK",
      });
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

  // Sort requests
  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      let aValue = a[orderBy];
      let bValue = b[orderBy];

      // Handle special cases
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
  }, [filteredRequests, orderBy, order]);

  // Pagination
  const paginatedRequests = sortedRequests.slice(
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

  // Get unique grades for filter
  const grades = [
    ...new Set(requests.map((r) => r.grade_level).filter(Boolean)),
  ];

  // Get counts for badges
  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  // Table columns based on active tab
  const getHeadCells = () => {
    const baseCells = [
      { id: "student_name", label: "Student", sortable: true },
      { id: "grade_level", label: "Grade", sortable: true },
      { id: "section", label: "Section", sortable: true },
      { id: "school_year", label: "School Year", sortable: true },
      { id: "status", label: "Status", sortable: true },
    ];

    if (activeTab === 0) {
      baseCells.push({ id: "actions", label: "Action", sortable: false });
    }

    return baseCells;
  };

  const headCells = getHeadCells();

  // Get status color and icon
  const getStatusInfo = (status) => {
    switch (status) {
      case "pending":
        return { color: "#ff9800", bgColor: "#fff3e0", icon: <FaClock /> };
      case "approved":
        return {
          color: "#4caf50",
          bgColor: "#e8f5e8",
          icon: <FaCheckCircle />,
        };
      case "rejected":
        return {
          color: "#f44336",
          bgColor: "#ffebee",
          icon: <FaTimesCircle />,
        };
      default:
        return { color: "#999", bgColor: "#f5f5f5", icon: null };
    }
  };

  return (
    <>
      <Helmet>
        <title>Enrollment Requests | School Management System</title>
      </Helmet>

      <ThemeProvider theme={theme}>
        <div className={styles.requestsContainer}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <h1>Enrollment Requests</h1>
              <p>Manage and process student enrollment applications</p>
            </div>

            <div className={styles.headerActions}>
              <button className={styles.refreshBtn} onClick={fetchRequests}>
                <FaSync /> Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${styles.pendingCard}`}>
              <div className={styles.statIcon}>
                <FaClock />
              </div>
              <div className={styles.statInfo}>
                <h3>Pending</h3>
                <p>{pendingCount}</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.approvedCard}`}>
              <div className={styles.statIcon}>
                <FaCheckCircle />
              </div>
              <div className={styles.statInfo}>
                <h3>Approved</h3>
                <p>{approvedCount}</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${styles.rejectedCard}`}>
              <div className={styles.statIcon}>
                <FaTimesCircle />
              </div>
              <div className={styles.statInfo}>
                <h3>Rejected</h3>
                <p>{rejectedCount}</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <StyledTabs value={activeTab} onChange={handleTabChange}>
            <Tab
              label={
                <Badge badgeContent={pendingCount} color="warning" max={99}>
                  Pending
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={approvedCount} color="success" max={99}>
                  Approved
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={rejectedCount} color="error" max={99}>
                  Rejected
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
                placeholder="Search by student name, grade, section..."
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
          </div>

          {/* Table */}
          <StyledTableContainer component={Paper}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading enrollment requests...</p>
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
                    {paginatedRequests.length > 0 ? (
                      paginatedRequests.map((request) => {
                        const statusInfo = getStatusInfo(request.status);
                        return (
                          <TableRow key={request.id} hover>
                            <TableCell>
                              <div className={styles.studentInfo}>
                                <div className={styles.studentAvatar}>
                                  <FaUserGraduate />
                                </div>
                                <div>
                                  <div className={styles.studentName}>
                                    {request.first_name} {request.last_name}
                                  </div>
                                  <div className={styles.studentEmail}>
                                    {request.email || "No email provided"}
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell>
                              <Chip
                                label={request.grade_level}
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
                                {request.section}
                              </span>
                            </TableCell>

                            <TableCell>
                              <span className={styles.schoolYear}>
                                {request.school_year}
                              </span>
                            </TableCell>

                            <TableCell>
                              <Chip
                                icon={statusInfo.icon}
                                label={request.status}
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

                            {activeTab === 0 && (
                              <TableCell>
                                <div className={styles.actionButtons}>
                                  <Tooltip title="Approve Request">
                                    <button
                                      className={styles.approveBtn}
                                      onClick={() => approveRequest(request.id)}
                                    >
                                      <FaCheckCircle /> Approve
                                    </button>
                                  </Tooltip>

                                  <Tooltip title="Reject Request">
                                    <button
                                      className={styles.rejectBtn}
                                      onClick={() => rejectRequest(request.id)}
                                    >
                                      <FaTimesCircle /> Reject
                                    </button>
                                  </Tooltip>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={activeTab === 0 ? 6 : 5}
                          className={styles.emptyState}
                        >
                          <div className={styles.emptyStateContent}>
                            <h3>
                              No{" "}
                              {activeTab === 0
                                ? "pending"
                                : activeTab === 1
                                  ? "approved"
                                  : "rejected"}{" "}
                              requests found
                            </h3>
                            <p>
                              {activeTab === 0
                                ? "There are no pending enrollment requests at this time"
                                : activeTab === 1
                                  ? "No approved enrollment requests to display"
                                  : "No rejected enrollment requests to display"}
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
                  count={filteredRequests.length}
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
      </ThemeProvider>
    </>
  );
}

export default EnrollmentRequests;
