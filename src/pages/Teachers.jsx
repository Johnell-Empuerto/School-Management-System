import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import styles from "../assets/styles/Teachers.module.css";
import { Helmet } from "react-helmet-async";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaSync,
  FaUserPlus,
  FaEdit,
} from "react-icons/fa";

// MUI Imports - only for table
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
  Avatar,
  Chip,
  IconButton,
  Tooltip,
  Box,
  CircularProgress,
  ThemeProvider,
  createTheme,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Create a custom theme that matches your design
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
    success: {
      main: "#2e7d32",
    },
    warning: {
      main: "#ff9800",
    },
    error: {
      main: "#f44336",
    },
    info: {
      main: "#17a2b8",
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
  },
});

// Styled components
const StyledTableContainer = styled(TableContainer)({
  borderRadius: "24px",
  boxShadow: "0 15px 35px rgba(0, 100, 0, 0.1)",
  border: "1px solid rgba(0, 150, 0, 0.1)",
  marginTop: "20px",
  "& .MuiTable-root": {
    minWidth: "1400px",
  },
});

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");

  // MUI Pagination and Sorting states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("first_name");
  const [order, setOrder] = useState("asc");

  const [formData, setFormData] = useState({
    school_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix_name: "",
    gender: "",
    birthdate: "",
    contact_number: "",
    email: "",
    address: "",
    department: "",
    rank_level: "",
    specialization: "",
    hire_date: "",
    employment_type: "",
    highest_education: "",
    age: "",
    profile_photo: "",
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Search and Filter effect
  useEffect(() => {
    let result = teachers;

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (teacher) =>
          teacher.first_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          teacher.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.school_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.department
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((teacher) => teacher.status === filterStatus);
    }

    // Department filter
    if (filterDepartment !== "all") {
      result = result.filter(
        (teacher) => teacher.department === filterDepartment,
      );
    }

    setFilteredTeachers(result);
    setPage(0); // Reset to first page when filtering
  }, [searchTerm, filterStatus, filterDepartment, teachers]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/teachers");
      setTeachers(res.data);
      setFilteredTeachers(res.data);
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

  // Sort teachers
  const sortedTeachers = useMemo(() => {
    return [...filteredTeachers].sort((a, b) => {
      const aValue = a[orderBy] || "";
      const bValue = b[orderBy] || "";

      if (order === "asc") {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });
  }, [filteredTeachers, orderBy, order]);

  // Pagination
  const paginatedTeachers = sortedTeachers.slice(
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setFormData({
        ...formData,
        profile_photo: reader.result,
      });
    };

    reader.readAsDataURL(file);
  };

  const addTeacher = async () => {
    try {
      await api.post("/teachers", formData);

      setFormData({
        school_id: "",
        first_name: "",
        last_name: "",
        department: "",
        rank_level: "",
        age: "",
      });

      setShowModal(false);
      fetchTeachers();
    } catch (error) {
      const message = error.response?.data?.message || "Something went wrong";
      alert(message);
    }
  };

  const openEditModal = (teacher) => {
    setFormData({
      school_id: teacher.school_id || "",
      first_name: teacher.first_name || "",
      middle_name: teacher.middle_name || "",
      last_name: teacher.last_name || "",
      suffix_name: teacher.suffix_name || "",
      gender: teacher.gender || "",
      birthdate: teacher.birthdate || "",
      contact_number: teacher.contact_number || "",
      email: teacher.email || "",
      address: teacher.address || "",
      department: teacher.department || "",
      rank_level: teacher.rank_level || "",
      specialization: teacher.specialization || "",
      hire_date: teacher.hire_date || "",
      employment_type: teacher.employment_type || "",
      highest_education: teacher.highest_education || "",
      age: teacher.age || "",
      profile_photo: teacher.profile_photo || "",
    });

    setEditTeacher(teacher);
    setShowModal(true);
  };

  const updateTeacher = async () => {
    // Create a copy of formData without school_id for the update
    const { school_id, ...updateData } = formData;
    await api.put(`/teachers/${editTeacher.id}`, updateData);

    setShowModal(false);
    setEditTeacher(null);
    setFormData({
      school_id: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      suffix_name: "",
      gender: "",
      birthdate: "",
      contact_number: "",
      email: "",
      address: "",
      department: "",
      rank_level: "",
      specialization: "",
      hire_date: "",
      employment_type: "",
      highest_education: "",
      age: "",
    });

    fetchTeachers();
  };

  const updateTeacherStatus = async (id, status) => {
    await api.put(`/teachers/${id}/status`, { status });
    fetchTeachers();
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  // Get unique departments for filter
  const departments = [
    ...new Set(teachers.map((t) => t.department).filter(Boolean)),
  ];

  // Get status color for Chip
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "leave":
        return "warning";
      case "maternity_leave":
        return "info";
      case "retired":
        return "default";
      case "resigned":
        return "error";
      default:
        return "default";
    }
  };

  // Table columns for sorting
  const headCells = [
    { id: "photo", label: "Photo", sortable: false },
    { id: "school_id", label: "School ID", sortable: true },
    { id: "first_name", label: "First Name", sortable: true },
    { id: "last_name", label: "Last Name", sortable: true },
    { id: "department", label: "Department", sortable: true },
    { id: "rank_level", label: "Rank", sortable: true },
    { id: "age", label: "Age", sortable: true },
    { id: "birthdate", label: "Birthday", sortable: true },
    { id: "status", label: "Status", sortable: true },
    { id: "actions", label: "Action", sortable: false },
  ];

  return (
    <>
      <Helmet>
        <title>Teachers | School Management System</title>
      </Helmet>

      <ThemeProvider theme={theme}>
        <div className={styles.teachersContainer}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <h1>Teachers Management</h1>
              <p>Manage and track all teacher information</p>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.addBtn}
                onClick={() => {
                  setEditTeacher(null);
                  setFormData({
                    school_id: "",
                    first_name: "",
                    middle_name: "",
                    last_name: "",
                    suffix_name: "",
                    gender: "",
                    birthdate: "",
                    contact_number: "",
                    email: "",
                    address: "",
                    department: "",
                    rank_level: "",
                    specialization: "",
                    hire_date: "",
                    employment_type: "",
                    highest_education: "",
                    age: "",
                    profile_photo: "",
                  });
                  setShowModal(true);
                }}
              >
                <FaUserPlus /> Add Teacher
              </button>
            </div>
          </div>

          {/* Search and Filter Bar - Using your original CSS */}
          <div className={styles.controls}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search by name, ID, department, or email..."
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
                <option value="leave">On Leave</option>
                <option value="maternity_leave">Maternity Leave</option>
                <option value="retired">Retired</option>
                <option value="resigned">Resigned</option>
              </select>
            </div>

            {departments.length > 0 && (
              <div className={styles.filterBox}>
                <FaFilter className={styles.filterIcon} />
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                >
                  <option value="all">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button className={styles.refreshBtn} onClick={fetchTeachers}>
              <FaSync /> Refresh
            </button>
          </div>

          {/* Table Container - MUI Table */}
          <StyledTableContainer component={Paper}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.spinner}></div>
                <p>Loading teachers...</p>
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
                    {paginatedTeachers.length > 0 ? (
                      paginatedTeachers.map((teacher) => (
                        <TableRow key={teacher.id} hover>
                          <TableCell>
                            <div className={styles.photoCell}>
                              <img
                                src={
                                  teacher.profile_photo?.trim() || "/user.png"
                                }
                                alt="profile"
                                className={styles.teacherPhoto}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/user.png";
                                }}
                              />
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className={styles.schoolId}>
                              {teacher.school_id}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div className={styles.teacherName}>
                              {teacher.first_name} {teacher.middle_name}
                            </div>
                          </TableCell>

                          <TableCell>{teacher.last_name}</TableCell>

                          <TableCell>
                            <div className={styles.departmentCell}>
                              {teacher.department}
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className={styles.rankLevel}>
                              {teacher.rank_level}
                            </span>
                          </TableCell>

                          <TableCell className={styles.ageCell}>
                            {teacher.age}
                          </TableCell>

                          <TableCell className={styles.birthdayCell}>
                            {formatDate(teacher.birthdate)}
                          </TableCell>

                          <TableCell>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "5px",
                              }}
                            >
                              <Chip
                                label={teacher.status?.replace("_", " ")}
                                color={getStatusColor(teacher.status)}
                                size="small"
                                sx={{
                                  fontWeight: 600,
                                  textTransform: "capitalize",
                                }}
                              />
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select
                                  value={teacher.status}
                                  onChange={(e) =>
                                    updateTeacherStatus(
                                      teacher.id,
                                      e.target.value,
                                    )
                                  }
                                  sx={{
                                    borderRadius: "20px",
                                    fontSize: "0.8rem",
                                    height: "32px",
                                  }}
                                >
                                  <MenuItem value="active">Active</MenuItem>
                                  <MenuItem value="leave">On Leave</MenuItem>
                                  <MenuItem value="maternity_leave">
                                    Maternity Leave
                                  </MenuItem>
                                  <MenuItem value="retired">Retired</MenuItem>
                                  <MenuItem value="resigned">Resigned</MenuItem>
                                </Select>
                              </FormControl>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className={styles.actionButtons}>
                              <Tooltip title="Edit Teacher">
                                <button
                                  className={styles.editBtn}
                                  onClick={() => openEditModal(teacher)}
                                >
                                  <FaEdit />
                                </button>
                              </Tooltip>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={10} className={styles.emptyState}>
                          <div className={styles.emptyStateContent}>
                            <h3>No teachers found</h3>
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
                  count={filteredTeachers.length}
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

          {/* MODAL - Keep your original modal code */}
          {showModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <div className={styles.modalHeader}>
                  <h2>{editTeacher ? "Edit Teacher" : "Add Teacher"}</h2>
                  <button
                    className={styles.closeBtn}
                    onClick={() => {
                      setShowModal(false);
                      setEditTeacher(null);
                      setFormData({
                        school_id: "",
                        first_name: "",
                        last_name: "",
                        department: "",
                        rank_level: "",
                        age: "",
                      });
                    }}
                  >
                    <FaTimes />
                  </button>
                </div>

                <div className={styles.modalBody}>
                  {/* School ID field - only show in add mode */}
                  {!editTeacher && (
                    <div className={styles.formGroup}>
                      <label>School ID</label>
                      <input
                        type="text"
                        name="school_id"
                        placeholder="Enter School ID"
                        value={formData.school_id}
                        onChange={handleChange}
                      />
                    </div>
                  )}

                  {/* Show school_id as read-only in edit mode */}
                  {editTeacher && (
                    <div className={styles.readonlyField}>
                      <label>School ID:</label>
                      <span>{formData.school_id}</span>
                    </div>
                  )}

                  {/* Photo Upload */}
                  <div className={styles.photoUploadSection}>
                    <div className={styles.photoPreview}>
                      {formData.profile_photo ? (
                        <img src={formData.profile_photo} alt="Preview" />
                      ) : (
                        <div className={styles.photoPlaceholder}>📷</div>
                      )}
                    </div>
                    <div className={styles.uploadControls}>
                      <label className={styles.uploadLabel}>
                        📤 Upload Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: "none" }}
                        />
                      </label>
                      {formData.profile_photo && (
                        <button
                          className={styles.removePhoto}
                          onClick={() =>
                            setFormData({ ...formData, profile_photo: "" })
                          }
                        >
                          🗑️ Remove
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label>First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        placeholder="Enter first name"
                        value={formData.first_name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Middle Name</label>
                      <input
                        type="text"
                        name="middle_name"
                        placeholder="Enter middle name"
                        value={formData.middle_name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        placeholder="Enter last name"
                        value={formData.last_name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Suffix</label>
                      <input
                        type="text"
                        name="suffix_name"
                        placeholder="Jr., III, etc."
                        value={formData.suffix_name}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Gender</label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Birthdate</label>
                      <input
                        type="date"
                        name="birthdate"
                        value={formData.birthdate}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Age</label>
                      <input
                        type="number"
                        name="age"
                        placeholder="Enter age"
                        value={formData.age}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Contact Number</label>
                      <input
                        type="text"
                        name="contact_number"
                        placeholder="Enter contact number"
                        value={formData.contact_number}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Email</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Address</label>
                      <textarea
                        name="address"
                        placeholder="Enter complete address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="2"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Department</label>
                      <input
                        type="text"
                        name="department"
                        placeholder="Enter department"
                        value={formData.department}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Rank Level</label>
                      <input
                        type="text"
                        name="rank_level"
                        placeholder="Enter rank level"
                        value={formData.rank_level}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        placeholder="Enter specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Hire Date</label>
                      <input
                        type="date"
                        name="hire_date"
                        value={formData.hire_date}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Employment Type</label>
                      <select
                        name="employment_type"
                        value={formData.employment_type}
                        onChange={handleChange}
                      >
                        <option value="">Select Type</option>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="contract">Contract</option>
                        <option value="probationary">Probationary</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Highest Education</label>
                      <input
                        type="text"
                        name="highest_education"
                        placeholder="Enter highest education"
                        value={formData.highest_education}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => {
                      setShowModal(false);
                      setEditTeacher(null);
                      setFormData({
                        school_id: "",
                        first_name: "",
                        last_name: "",
                        department: "",
                        rank_level: "",
                        age: "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.saveBtn}
                    onClick={editTeacher ? updateTeacher : addTeacher}
                  >
                    {editTeacher ? "Update Teacher" : "Save Teacher"}
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

export default Teachers;
