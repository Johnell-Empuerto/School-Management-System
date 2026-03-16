import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import styles from "../assets/styles/Users.module.css";
import { Helmet } from "react-helmet-async";
import Swal from "sweetalert2";

import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaSync,
  FaUserPlus,
  FaEdit,
  FaUserCheck,
  FaUserTimes,
  FaSave,
  FaTimesCircle,
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
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
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
      main: "#2e7d32",
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
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "30px",
          textTransform: "none",
          fontWeight: 600,
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
  },
});

// Styled Table Container
const StyledTableContainer = styled(TableContainer)({
  borderRadius: "24px",
  boxShadow: "0 15px 35px rgba(0, 100, 0, 0.1)",
  border: "1px solid rgba(0, 150, 0, 0.1)",
  marginTop: "20px",
});

function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Pagination and Sorting
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("school_id");
  const [order, setOrder] = useState("asc");

  // Create User Form
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [schoolId, setSchoolId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");

  // Edit User
  const [editId, setEditId] = useState(null);
  const [editSchoolId, setEditSchoolId] = useState("");
  const [editRole, setEditRole] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  // fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search and Filter effect
  useEffect(() => {
    let result = users;

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.school_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Role filter
    if (filterRole !== "all") {
      result = result.filter((user) => user.role === filterRole);
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((user) => user.status === filterStatus);
    }

    setFilteredUsers(result);
    setPage(0);
  }, [searchTerm, filterRole, filterStatus, users]);

  // Sorting function
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Sort users
  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const aValue = a[orderBy] || "";
      const bValue = b[orderBy] || "";

      if (order === "asc") {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });
  }, [filteredUsers, orderBy, order]);

  // Pagination
  const paginatedUsers = sortedUsers.slice(
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

  // create user
  const handleCreateUser = async () => {
    if (!schoolId || !password) {
      Swal.fire({
        title: "Error!",
        text: "School ID and password required",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      await api.post("/users", {
        school_id: schoolId,
        password,
        role,
      });

      Swal.fire({
        title: "Success",
        text: "User created successfully",
        icon: "success",
        confirmButtonText: "OK",
      });

      setSchoolId("");
      setPassword("");
      setRole("student");
      setShowCreateModal(false);

      fetchUsers();
    } catch (error) {
      if (error.response?.data?.message) {
        const errorvalue = error.response.data.message;

        Swal.fire({
          title: "Error!",
          text: errorvalue,
          icon: "error",
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Error creating user",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  // activate / deactivate
  const toggleStatus = async (user) => {
    const result = await Swal.fire({
      title: "Change User Status?",
      text: `Set ${user.school_id} to ${
        user.status === "active" ? "inactive" : "active"
      }`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });

    if (!result.isConfirmed) return;

    const newStatus = user.status === "active" ? "inactive" : "active";

    await api.put(`/users/${user.id}/status`, { status: newStatus });

    fetchUsers();
  };

  const startEdit = (user) => {
    setEditId(user.id);
    setEditSchoolId(user.school_id);
    setEditRole(user.role);
    setShowEditModal(true);
  };

  const updateUser = async () => {
    try {
      await api.put(`/users/${editId}`, {
        school_id: editSchoolId,
        role: editRole,
      });

      Swal.fire({
        title: "Success",
        text: "User updated",
        icon: "success",
        confirmButtonText: "OK",
      });

      setEditId(null);
      setShowEditModal(false);

      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "error";
      case "teacher":
        return "primary";
      case "student":
        return "success";
      default:
        return "default";
    }
  };

  // Table columns
  const headCells = [
    { id: "school_id", label: "School ID", sortable: true },
    { id: "role", label: "Role", sortable: true },
    { id: "status", label: "Status", sortable: true },
    { id: "created_at", label: "Created", sortable: true },
    { id: "actions", label: "Action", sortable: false },
  ];

  return (
    <>
      <Helmet>
        <title>Users | School Management System</title>
      </Helmet>

      <ThemeProvider theme={theme}>
        <div className={styles.usersContainer}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <h1>Users Management</h1>
              <p>Manage system users and their access levels</p>
            </div>

            <div className={styles.headerActions}>
              <button
                className={styles.addBtn}
                onClick={() => setShowCreateModal(true)}
              >
                <FaUserPlus /> Create User
              </button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by School ID or Role..."
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
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
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

            <button className={styles.refreshBtn} onClick={fetchUsers}>
              <FaSync /> Refresh
            </button>
          </div>

          {/* Table */}
          <StyledTableContainer component={Paper}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading users...</p>
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
                    {paginatedUsers.length > 0 ? (
                      paginatedUsers.map((user) => (
                        <TableRow key={user.id} hover>
                          <TableCell>
                            <span className={styles.schoolId}>
                              {user.school_id}
                            </span>
                          </TableCell>

                          <TableCell>
                            <Chip
                              label={user.role}
                              color={getRoleColor(user.role)}
                              size="small"
                              sx={{
                                fontWeight: 600,
                                textTransform: "capitalize",
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <Chip
                              icon={
                                user.status === "active" ? (
                                  <FaUserCheck />
                                ) : (
                                  <FaUserTimes />
                                )
                              }
                              label={user.status}
                              color={
                                user.status === "active" ? "success" : "error"
                              }
                              size="small"
                              sx={{
                                fontWeight: 600,
                                textTransform: "capitalize",
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <span className={styles.dateCell}>
                              {new Date(user.created_at).toLocaleDateString()}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className={styles.actionButtons}>
                              <Tooltip title="Edit User">
                                <button
                                  className={styles.editBtn}
                                  onClick={() => startEdit(user)}
                                >
                                  <FaEdit />
                                </button>
                              </Tooltip>

                              <Tooltip
                                title={
                                  user.status === "active"
                                    ? "Deactivate"
                                    : "Activate"
                                }
                              >
                                <button
                                  className={
                                    user.status === "active"
                                      ? styles.deactivateBtn
                                      : styles.activateBtn
                                  }
                                  onClick={() => toggleStatus(user)}
                                >
                                  {user.status === "active" ? (
                                    <FaUserTimes />
                                  ) : (
                                    <FaUserCheck />
                                  )}
                                </button>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className={styles.emptyState}>
                          <div className={styles.emptyStateContent}>
                            <FaUserPlus size={48} color="#ccc" />
                            <h3>No users found</h3>
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
                  count={filteredUsers.length}
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

          {/* Create User Modal */}
          {showCreateModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h2>Create New User</h2>
                  <button
                    className={styles.closeBtn}
                    onClick={() => setShowCreateModal(false)}
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label>School ID</label>
                    <input
                      type="text"
                      placeholder="Enter School ID"
                      value={schoolId}
                      onChange={(e) => setSchoolId(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Password</label>
                    <input
                      type="password"
                      placeholder="Enter Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button className={styles.saveBtn} onClick={handleCreateUser}>
                    Create User
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {showEditModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h2>Edit User</h2>
                  <button
                    className={styles.closeBtn}
                    onClick={() => {
                      setShowEditModal(false);
                      setEditId(null);
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className={styles.modalBody}>
                  <div className={styles.formGroup}>
                    <label>School ID</label>
                    <input
                      type="text"
                      value={editSchoolId}
                      onChange={(e) => setEditSchoolId(e.target.value)}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Role</label>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => {
                      setShowEditModal(false);
                      setEditId(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button className={styles.saveBtn} onClick={updateUser}>
                    Update User
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

export default Users;
