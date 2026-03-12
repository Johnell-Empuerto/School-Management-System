import React, { useEffect, useState } from "react";
import axios from "axios";
import styles from "../assets/styles/Students.module.css";
import {
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFilter,
  FaDownload,
  FaUpload,
  FaTimes,
  FaCamera,
  FaMale,
  FaFemale,
  FaUser,
  FaCheckCircle,
  FaGraduationCap,
  FaExclamationTriangle,
  FaSync,
} from "react-icons/fa";
import { MdMoreTime } from "react-icons/md";

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
  },
});

// Styled components
const StyledTableContainer = styled(TableContainer)({
  borderRadius: "24px",
  boxShadow: "0 15px 35px rgba(0, 100, 0, 0.1)",
  border: "1px solid rgba(0, 150, 0, 0.1)",
  marginTop: "20px",
  "& .MuiTable-root": {
    minWidth: "1200px",
  },
});

const Students = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  // MUI Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState("first_name");
  const [order, setOrder] = useState("asc");

  const [form, setForm] = useState({
    school_id: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix_name: "",
    age: "",
    birthdate: "",
    gender: "",
    contact_number: "",
    address: "",
    guardian_name: "",
    guardian_contact: "",
    profile_photo: "",
    status: "active",
  });

  const [editId, setEditId] = useState(null);

  const API = "http://localhost:3001/api";

  // FETCH STUDENTS
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/students`, { withCredentials: true });
      setStudents(res.data);
      setFilteredStudents(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Search and Filter
  useEffect(() => {
    let result = students;

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (student) =>
          student.first_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.school_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.guardian_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (filterStatus !== "all") {
      result = result.filter((student) => student.status === filterStatus);
    }

    setFilteredStudents(result);
    setPage(0); // Reset to first page when filtering
  }, [searchTerm, filterStatus, students]);

  // Sorting function
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Sort students
  const sortedStudents = React.useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      const aValue = a[orderBy] || "";
      const bValue = b[orderBy] || "";

      if (order === "asc") {
        return aValue.toString().localeCompare(bValue.toString());
      } else {
        return bValue.toString().localeCompare(aValue.toString());
      }
    });
  }, [filteredStudents, orderBy, order]);

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

  // INPUT CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // IMAGE UPLOAD
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({
          ...form,
          profile_photo: reader.result,
        });
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // SUBMIT
  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`${API}/students/${editId}`, form, {
          withCredentials: true,
        });
        alert("Student updated successfully");
      } else {
        await axios.post(`${API}/students`, form, { withCredentials: true });
        alert("Student created successfully");
      }

      resetForm();
      setShowModal(false);
      fetchStudents();
    } catch (error) {
      console.error(error);
      if (error.response) {
        alert(error.response.data.error || "Something went wrong");
      } else {
        alert("Server error");
      }
    }
  };

  // RESET FORM
  const resetForm = () => {
    setForm({
      school_id: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      suffix_name: "",
      age: "",
      birthdate: "",
      gender: "",
      contact_number: "",
      address: "",
      guardian_name: "",
      guardian_contact: "",
      profile_photo: "",
      status: "active",
    });
    setPreviewImage(null);
    setEditId(null);
    setSelectedStudent(null);
  };

  // EDIT
  const handleEdit = (student) => {
    setEditId(student.id);
    setSelectedStudent(student);

    setForm({
      school_id: student.school_id ?? "",
      first_name: student.first_name ?? "",
      middle_name: student.middle_name ?? "",
      last_name: student.last_name ?? "",
      suffix_name: student.suffix_name ?? "",
      age: student.age ?? "",
      birthdate: student.birthdate ? student.birthdate.split("T")[0] : "",
      gender: student.gender ?? "",
      contact_number: student.contact_number ?? "",
      address: student.address ?? "",
      guardian_name: student.guardian_name ?? "",
      guardian_contact: student.guardian_contact ?? "",
      profile_photo: student.profile_photo ?? "",
      status: student.status ?? "active",
    });
    setPreviewImage(student.profile_photo);
    setShowModal(true);
  };

  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student?"))
      return;

    try {
      await axios.delete(`${API}/students/${id}`, { withCredentials: true });
      fetchStudents();
      alert("Student deleted successfully");
    } catch (error) {
      console.error(error);
    }
  };

  // VIEW DETAILS
  const handleViewDetails = (student) => {
    setSelectedStudent(student);
  };

  // Get status badge color for MUI Chip
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "graduated":
        return "info";
      case "dropped":
        return "error";
      case "transferred":
        return "warning";
      default:
        return "default";
    }
  };

  // Get gender icon
  const getGenderIcon = (gender) => {
    switch (gender?.toLowerCase()) {
      case "male":
        return <FaMale className={styles.genderMale} />;
      case "female":
        return <FaFemale className={styles.genderFemale} />;
      default:
        return <FaUser className={styles.genderOther} />;
    }
  };

  // Table columns for sorting
  const headCells = [
    { id: "photo", label: "Photo", sortable: false },
    { id: "school_id", label: "School ID", sortable: true },
    { id: "first_name", label: "Name", sortable: true },
    { id: "gender", label: "Gender", sortable: true },
    { id: "age", label: "Age", sortable: true },
    { id: "contact_number", label: "Contact", sortable: true },
    { id: "guardian_name", label: "Guardian", sortable: true },
    { id: "status", label: "Status", sortable: true },
    { id: "actions", label: "Actions", sortable: false },
  ];

  return (
    <ThemeProvider theme={theme}>
      <div className={styles.studentsContainer}>
        {/* Header Section */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <h1>Students Management</h1>
            <p>Manage and track all student information</p>
          </div>

          <div className={styles.headerActions}>
            <button
              className={styles.addBtn}
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <FaUserPlus /> Add Student
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#e3f2fd" }}>
              <FaUser
                className={styles.statIconSvg}
                style={{ color: "#1976d2" }}
              />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{students.length}</span>
              <span className={styles.statLabel}>Total Students</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#e8f5e8" }}>
              <FaCheckCircle
                className={styles.statIconSvg}
                style={{ color: "#2e7d32" }}
              />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {students.filter((s) => s.status === "active").length}
              </span>
              <span className={styles.statLabel}>Active</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#fff3e0" }}>
              <FaGraduationCap
                className={styles.statIconSvg}
                style={{ color: "#ed6c02" }}
              />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {students.filter((s) => s.status === "graduated").length}
              </span>
              <span className={styles.statLabel}>Graduated</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{ background: "#ffebee" }}>
              <FaExclamationTriangle
                className={styles.statIconSvg}
                style={{ color: "#d32f2f" }}
              />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>
                {
                  students.filter(
                    (s) => s.status === "dropped" || s.status === "transferred",
                  ).length
                }
              </span>
              <span className={styles.statLabel}>Inactive</span>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar - USING YOUR ORIGINAL CSS */}
        <div className={styles.controls}>
          <div className={styles.searchBox}>
            <FaSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name, ID, or guardian..."
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
              <option value="graduated">Graduated</option>
              <option value="dropped">Dropped</option>
              <option value="transferred">Transferred</option>
            </select>
          </div>

          <button className={styles.refreshBtn} onClick={fetchStudents}>
            <FaSync /> Refresh
          </button>
        </div>

        {/* Table Container - MUI Table with your styling */}
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
                    {headCells.map((headCell) => (
                      <TableCell key={headCell.id}>
                        {headCell.sortable ? (
                          <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : "asc"}
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
                  {paginatedStudents.length > 0 ? (
                    paginatedStudents.map((student) => (
                      <TableRow
                        key={student.id}
                        hover
                        onClick={() => handleViewDetails(student)}
                        sx={{ cursor: "pointer" }}
                      >
                        <TableCell>
                          <div className={styles.photoCell}>
                            <img
                              src={
                                student.profile_photo &&
                                student.profile_photo.trim() !== ""
                                  ? student.profile_photo
                                  : "/user.png"
                              }
                              alt={student.first_name}
                              className={styles.studentPhoto}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/user.png";
                              }}
                            />
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className={styles.schoolId}>
                            {student.school_id}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className={styles.studentName}>
                            {student.first_name} {student.middle_name}{" "}
                            {student.last_name} {student.suffix_name}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className={styles.genderCell}>
                            {getGenderIcon(student.gender)}
                            <span>{student.gender || "N/A"}</span>
                          </div>
                        </TableCell>

                        <TableCell>{student.age || "N/A"}</TableCell>

                        <TableCell>
                          <div className={styles.contactCell}>
                            <div>{student.contact_number || "N/A"}</div>
                            <small>
                              {student.address?.substring(0, 30)}...
                            </small>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className={styles.guardianCell}>
                            <div>{student.guardian_name || "N/A"}</div>
                            <small>{student.guardian_contact || ""}</small>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span
                            className={`${styles.statusBadge} ${styles[`status${student.status?.charAt(0).toUpperCase() + student.status?.slice(1)}`]}`}
                          >
                            {student.status?.charAt(0).toUpperCase() +
                              student.status?.slice(1)}
                          </span>
                        </TableCell>

                        <TableCell>
                          <div className={styles.actionButtons}>
                            <button
                              className={styles.editBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(student);
                              }}
                              title="Edit student"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className={styles.deleteBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(student.id);
                              }}
                              title="Delete student"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className={styles.emptyState}>
                        <div className={styles.emptyStateContent}>
                          <img src="/empty-state.svg" alt="No students" />
                          <h3>No students found</h3>
                          <p>Try adjusting your search or filter criteria</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* MUI Pagination */}
              <TablePagination
                rowsPerPageOptions={[10, 20, 50]}
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
            </>
          )}
        </StyledTableContainer>

        {/* MODAL - Keep your original modal code */}
        {showModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h2>{editId ? "Edit Student" : "Add New Student"}</h2>
                <button
                  className={styles.closeBtn}
                  onClick={() => setShowModal(false)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className={styles.modalBody}>
                {/* Photo Upload Section */}
                <div className={styles.photoUploadSection}>
                  <div className={styles.photoPreview}>
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" />
                    ) : (
                      <div className={styles.photoPlaceholder}>
                        <FaCamera />
                      </div>
                    )}
                  </div>
                  <div className={styles.uploadControls}>
                    <label className={styles.uploadLabel}>
                      <FaCamera /> Choose Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: "none" }}
                      />
                    </label>
                    {previewImage && (
                      <button
                        className={styles.removePhoto}
                        onClick={() => {
                          setForm({ ...form, profile_photo: "" });
                          setPreviewImage(null);
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>School ID</label>
                    <input
                      name="school_id"
                      placeholder="Enter School ID"
                      value={form.school_id}
                      onChange={handleChange}
                      disabled={editId}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>First Name</label>
                    <input
                      name="first_name"
                      placeholder="Enter First Name"
                      value={form.first_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Middle Name</label>
                    <input
                      name="middle_name"
                      placeholder="Enter Middle Name"
                      value={form.middle_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Last Name</label>
                    <input
                      name="last_name"
                      placeholder="Enter Last Name"
                      value={form.last_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Suffix</label>
                    <input
                      name="suffix_name"
                      placeholder="Jr., III, etc."
                      value={form.suffix_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Age</label>
                      <input
                        name="age"
                        type="number"
                        placeholder="Age"
                        value={form.age}
                        onChange={handleChange}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Birthdate</label>
                      <input
                        name="birthdate"
                        type="date"
                        value={form.birthdate}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Contact Number</label>
                    <input
                      name="contact_number"
                      placeholder="Enter Contact Number"
                      value={form.contact_number}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Address</label>
                    <textarea
                      name="address"
                      placeholder="Enter Complete Address"
                      value={form.address}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Guardian Name</label>
                    <input
                      name="guardian_name"
                      placeholder="Enter Guardian Name"
                      value={form.guardian_name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Guardian Contact</label>
                    <input
                      name="guardian_contact"
                      placeholder="Enter Guardian Contact"
                      value={form.guardian_contact}
                      onChange={handleChange}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Status</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                    >
                      <option value="active">Active</option>
                      <option value="graduated">Graduated</option>
                      <option value="dropped">Dropped</option>
                      <option value="transferred">Transferred</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className={styles.saveBtn} onClick={handleSubmit}>
                  {editId ? "Update Student" : "Save Student"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Student Details Modal */}
        {selectedStudent && !showModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setSelectedStudent(null)}
          >
            <div
              className={styles.detailsModal}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>Student Details</h2>
                <button
                  className={styles.closeBtn}
                  onClick={() => setSelectedStudent(null)}
                >
                  <FaTimes />
                </button>
              </div>

              <div className={styles.detailsContent}>
                <div className={styles.detailsAvatar}>
                  <img
                    src={selectedStudent.profile_photo || "/default-avatar.png"}
                    alt={selectedStudent.first_name}
                  />
                </div>

                <div className={styles.detailsInfo}>
                  <h3>
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </h3>
                  <p className={styles.detailsSchoolId}>
                    ID: {selectedStudent.school_id}
                  </p>

                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <label>Gender</label>
                      <span>{selectedStudent.gender || "N/A"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Age</label>
                      <span>{selectedStudent.age || "N/A"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Birthdate</label>
                      <span>
                        {selectedStudent.birthdate
                          ? new Date(
                              selectedStudent.birthdate,
                            ).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Contact</label>
                      <span>{selectedStudent.contact_number || "N/A"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Address</label>
                      <span>{selectedStudent.address || "N/A"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Guardian</label>
                      <span>{selectedStudent.guardian_name || "N/A"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Guardian Contact</label>
                      <span>{selectedStudent.guardian_contact || "N/A"}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <label>Status</label>
                      <span
                        className={`${styles.statusBadge} ${styles[`status${selectedStudent.status?.charAt(0).toUpperCase() + selectedStudent.status?.slice(1)}`]}`}
                      >
                        {selectedStudent.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button
                  className={styles.editBtn}
                  onClick={() => {
                    handleEdit(selectedStudent);
                    setSelectedStudent(null);
                  }}
                >
                  <FaEdit /> Edit Student
                </button>
                <button
                  className={styles.cancelBtn}
                  onClick={() => setSelectedStudent(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
};

export default Students;
