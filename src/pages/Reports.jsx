import { useEffect, useState } from "react";
import api from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "../assets/styles/Reports.module.css";
import { Helmet } from "react-helmet-async";

import {
  FaDownload,
  FaFilePdf,
  FaSync,
  FaUserGraduate,
  FaUsers,
  FaCalendarCheck,
  FaSearch,
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
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  CircularProgress,
  ThemeProvider,
  createTheme,
  Divider,
  TextField,
  InputAdornment,
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
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "24px",
          boxShadow: "0 10px 25px rgba(0, 100, 0, 0.1)",
        },
      },
    },
  },
});

// Styled Components
const StyledTableContainer = styled(TableContainer)({
  borderRadius: "24px",
  boxShadow: "0 15px 35px rgba(0, 100, 0, 0.1)",
  border: "1px solid rgba(0, 150, 0, 0.1)",
  marginTop: "20px",
});

const FilterContainer = styled(Box)({
  display: "flex",
  gap: "20px",
  alignItems: "center",
  flexWrap: "wrap",
  marginBottom: "30px",
  padding: "20px",
  backgroundColor: "#f8f9fa",
  borderRadius: "16px",
  border: "1px solid rgba(0, 100, 0, 0.1)",
});

function Reports() {
  // Filter states
  const [schoolYears, setSchoolYears] = useState([]);
  const [schoolYearId, setSchoolYearId] = useState("");
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [students, setStudents] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Report states
  const [reportData, setReportData] = useState([]);
  const [selectedReportType, setSelectedReportType] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Initial load
  useEffect(() => {
    fetchSchoolYears();
  }, []);

  // Load classes when school year changes
  useEffect(() => {
    if (schoolYearId) {
      fetchClassesBySchoolYear();
      setClassId("");
      setStudents([]);
      setStudentId("");
    }
  }, [schoolYearId]);

  // Load students when class changes
  useEffect(() => {
    if (classId) {
      fetchStudentsByClass();
      setStudentId("");
    }
  }, [classId]);

  // API Calls
  const fetchSchoolYears = async () => {
    try {
      const res = await api.get("/school-years");
      setSchoolYears(res.data);
      if (res.data.length > 0) {
        setSchoolYearId(res.data[0].id); // Auto-select latest school year
      }
    } catch (error) {
      console.error("Error fetching school years:", error);
    }
  };

  const fetchClassesBySchoolYear = async () => {
    try {
      const res = await api.get(
        `/classes-by-year?school_year_id=${schoolYearId}`,
      );
      setClasses(res.data);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const fetchStudentsByClass = async () => {
    try {
      const res = await api.get(`/students/class/${classId}`);
      setStudents(res.data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  // Filter students by search term
  const filteredStudents = students.filter((student) => {
    const fullName = `${student.first_name} ${student.last_name}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // Report generation functions
  const getStudentReport = async () => {
    if (!studentId || !classId || !schoolYearId) return;

    setLoading(true);
    setSelectedReportType("student");
    const student = students.find((s) => s.id === parseInt(studentId));
    setSelectedStudent(student);
    const classInfo = classes.find((c) => c.id === parseInt(classId));
    setSelectedClass(classInfo);

    try {
      const res = await api.get(
        `/reports/student/${studentId}?class_id=${classId}&school_year_id=${schoolYearId}`,
      );
      setReportData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getClassReport = async () => {
    if (!classId || !schoolYearId) return;

    setLoading(true);
    setSelectedReportType("class");
    const classInfo = classes.find((c) => c.id === parseInt(classId));
    setSelectedClass(classInfo);

    try {
      const res = await api.get(
        `/reports/class/${classId}?school_year_id=${schoolYearId}`,
      );
      setReportData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceReport = async () => {
    if (!classId || !schoolYearId) return;

    setLoading(true);
    setSelectedReportType("attendance");
    const classInfo = classes.find((c) => c.id === parseInt(classId));
    setSelectedClass(classInfo);

    try {
      const res = await api.get(
        `/reports/attendance/${classId}?school_year_id=${schoolYearId}`,
      );
      setReportData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Get status color
  const getStatusColor = (grade) => {
    if (grade >= 75) return "success";
    if (grade > 0) return "error";
    return "default";
  };

  const getAttendanceStatusColor = (rate) => {
    if (rate >= 90) return "success";
    if (rate >= 75) return "warning";
    return "error";
  };

  // PDF download functions (keep existing ones)
  const downloadReportCard = () => {
    if (!selectedStudent || reportData.length === 0) return;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text("Student Report Card", 105, 20, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `${selectedStudent.first_name} ${selectedStudent.last_name}`,
      20,
      40,
    );

    const gradeLevel = selectedClass?.grade_level || "";
    const section = selectedClass?.section || "";
    const schoolYear = schoolYears.find(
      (sy) => sy.id === parseInt(schoolYearId),
    );

    doc.setFontSize(12);
    doc.text(`${gradeLevel} - ${section}`, 20, 48);
    doc.text(
      `School Year: ${schoolYear?.year_start || "2024"}-${schoolYear?.year_end || "2025"}`,
      20,
      56,
    );

    const tableColumn = [
      "Subject",
      "1st",
      "2nd",
      "3rd",
      "4th",
      "Final",
      "Status",
    ];
    const tableRows = [];
    let totalGrades = 0;
    let validGradeCount = 0;

    reportData.forEach((item) => {
      if (item.subject_name) {
        const q1 = Number(item.q1) || 0;
        const q2 = Number(item.q2) || 0;
        const q3 = Number(item.q3) || 0;
        const q4 = Number(item.q4) || 0;
        const final = Number(item.final_grade) || 0;

        tableRows.push([
          item.subject_name,
          q1.toFixed(2),
          q2.toFixed(2),
          q3.toFixed(2),
          q4.toFixed(2),
          final.toFixed(2),
          final >= 75 ? "PASSED" : "FAILED",
        ]);

        if (final > 0) {
          totalGrades += final;
          validGradeCount++;
        }
      }
    });

    autoTable(doc, {
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      bodyStyles: {
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    const average = validGradeCount > 0 ? totalGrades / validGradeCount : 0;

    doc.setFontSize(12);
    doc.text("Summary:", 20, finalY);
    doc.text(`Total Subjects: ${validGradeCount}`, 30, finalY + 8);
    doc.text(`Average Grade: ${average.toFixed(2)}`, 30, finalY + 16);
    doc.text(`Status: ${average >= 75 ? "PASSED" : "FAILED"}`, 30, finalY + 24);

    doc.save(
      `${selectedStudent.last_name}_${selectedStudent.first_name}_Report_Card.pdf`,
    );
  };

  const downloadAttendanceReport = () => {
    if (!selectedClass || reportData.length === 0) return;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text("Attendance Report", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Grade ${selectedClass.grade_level} - ${selectedClass.section}`,
      20,
      40,
    );
    const schoolYear = schoolYears.find(
      (sy) => sy.id === parseInt(schoolYearId),
    );
    doc.text(
      `School Year: ${schoolYear?.year_start || "2024"}-${schoolYear?.year_end || "2025"}`,
      20,
      48,
    );
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 20, 56);

    const tableColumn = ["Student", "Present", "Absent", "Late", "Total Days"];
    const tableRows = [];

    reportData.forEach((item) => {
      const total = (item.present || 0) + (item.absent || 0) + (item.late || 0);
      tableRows.push([
        `${item.first_name || ""} ${item.last_name || ""}`,
        item.present || 0,
        item.absent || 0,
        item.late || 0,
        total,
      ]);
    });

    autoTable(doc, {
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
    });

    doc.save(
      `Attendance_Grade${selectedClass.grade_level}_${selectedClass.section}.pdf`,
    );
  };

  const downloadClassReport = () => {
    if (!selectedClass || reportData.length === 0) return;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(41, 128, 185);
    doc.text("Class Grade Report", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`${selectedClass.grade_level} - ${selectedClass.section}`, 20, 40);
    const schoolYear = schoolYears.find(
      (sy) => sy.id === parseInt(schoolYearId),
    );
    doc.text(
      `School Year: ${schoolYear?.year_start || "2024"}-${schoolYear?.year_end || "2025"}`,
      20,
      48,
    );
    doc.text(`Date Generated: ${new Date().toLocaleDateString()}`, 20, 56);

    const subjects = [
      ...new Set(reportData.map((item) => item.subject_name).filter(Boolean)),
    ];

    const tableColumn = ["Student", ...subjects, "Average"];
    const tableRows = [];

    const studentMap = new Map();

    reportData.forEach((item) => {
      const id = item.student_id;

      if (!studentMap.has(id)) {
        studentMap.set(id, {
          name: `${item.first_name} ${item.last_name}`,
          grades: {},
        });
      }

      const student = studentMap.get(id);
      const final = Number(item.final_grade) || 0;
      student.grades[item.subject_name] = final;
    });

    studentMap.forEach((student) => {
      const row = [student.name];
      let total = 0;
      let subjectCount = 0;

      subjects.forEach((subject) => {
        const grade = Number(student.grades[subject]) || 0;
        row.push(grade > 0 ? grade.toFixed(2) : "—");
        if (grade > 0) {
          total += grade;
          subjectCount++;
        }
      });

      const avg = subjectCount > 0 ? (total / subjectCount).toFixed(2) : "0.00";
      row.push(avg);
      tableRows.push(row);
    });

    autoTable(doc, {
      startY: 70,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
    });

    doc.save(
      `Class_Grade${selectedClass.grade_level}_${selectedClass.section}_Report.pdf`,
    );
  };

  return (
    <>
      <Helmet>
        <title>Reports | School Management System</title>
      </Helmet>

      <ThemeProvider theme={theme}>
        <div className={styles.reportsContainer}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <h1>Reports</h1>
              <p>Generate and download academic reports</p>
            </div>
          </div>

          {/* Filter Section - Pure HTML/CSS */}
          <div className={styles.filterContainer}>
            <div className={styles.filterGroup}>
              <label htmlFor="schoolYear">School Year</label>
              <select
                id="schoolYear"
                value={schoolYearId}
                onChange={(e) => setSchoolYearId(e.target.value)}
                className={styles.select}
              >
                {schoolYears.map((sy) => (
                  <option key={sy.id} value={sy.id}>
                    {sy.year}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="class">Class</label>
              <select
                id="class"
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                disabled={!schoolYearId}
                className={styles.select}
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.grade_level} - {c.section}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Students within Class */}
            {classId && (
              <div className={styles.filterGroup}>
                <label htmlFor="search">Search Student</label>
                <div className={styles.searchWrapper}>
                  <FaSearch className={styles.searchIcon} />
                  <input
                    id="search"
                    type="text"
                    placeholder="Search student..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Report Cards - Pure HTML/CSS */}
          <div className={styles.cardsGrid}>
            {/* Student Report Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <FaUserGraduate />
                </div>
                <h3 className={styles.cardTitle}>Student Report Card</h3>
              </div>

              <div className={styles.cardBody}>
                <label className={styles.cardLabel}>Select Student</label>
                <select
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={!classId}
                  className={styles.cardSelect}
                >
                  <option value="">Select Student</option>
                  {filteredStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={getStudentReport}
                disabled={!studentId || !classId || !schoolYearId || loading}
                className={styles.cardButton}
              >
                Generate Report Card
              </button>
            </div>

            {/* Class Report Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <FaUsers />
                </div>
                <h3 className={styles.cardTitle}>Class Grade Report</h3>
              </div>

              <div className={styles.cardBody}>
                <label className={styles.cardLabel}>Selected Class</label>
                <div className={styles.cardText}>
                  {classId
                    ? `${classes.find((c) => c.id === parseInt(classId))?.grade_level} - ${classes.find((c) => c.id === parseInt(classId))?.section}`
                    : "No class selected"}
                </div>
              </div>

              <button
                onClick={getClassReport}
                disabled={!classId || !schoolYearId || loading}
                className={styles.cardButton}
              >
                Generate Class Report
              </button>
            </div>

            {/* Attendance Report Card */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardIcon}>
                  <FaCalendarCheck />
                </div>
                <h3 className={styles.cardTitle}>Attendance Report</h3>
              </div>

              <div className={styles.cardBody}>
                <label className={styles.cardLabel}>Selected Class</label>
                <div className={styles.cardText}>
                  {classId
                    ? `${classes.find((c) => c.id === parseInt(classId))?.grade_level} - ${classes.find((c) => c.id === parseInt(classId))?.section}`
                    : "No class selected"}
                </div>
              </div>

              <button
                onClick={getAttendanceReport}
                disabled={!classId || !schoolYearId || loading}
                className={styles.cardButton}
              >
                Generate Attendance Report
              </button>
            </div>
          </div>

          {/* Report Results - Keep MUI table */}
          {reportData.length > 0 && (
            <div className={styles.resultsSection}>
              <div className={styles.resultsHeader}>
                <Typography variant="h5">
                  {selectedReportType === "student" && "Student Report Card"}
                  {selectedReportType === "class" && "Class Grade Report"}
                  {selectedReportType === "attendance" && "Attendance Report"}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<FaDownload />}
                  onClick={
                    selectedReportType === "student"
                      ? downloadReportCard
                      : selectedReportType === "class"
                        ? downloadClassReport
                        : downloadAttendanceReport
                  }
                >
                  Download PDF
                </Button>
              </div>

              <StyledTableContainer component={Paper}>
                {loading ? (
                  <div className={styles.loadingState}>
                    <CircularProgress size={50} sx={{ color: "#2e7d32" }} />
                    <p>Loading report data...</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHead>
                        <TableRow>
                          {selectedReportType === "student" && (
                            <>
                              <TableCell>Subject</TableCell>
                              <TableCell align="center">1st</TableCell>
                              <TableCell align="center">2nd</TableCell>
                              <TableCell align="center">3rd</TableCell>
                              <TableCell align="center">4th</TableCell>
                              <TableCell align="center">Final</TableCell>
                              <TableCell align="center">Status</TableCell>
                            </>
                          )}
                          {selectedReportType === "class" && (
                            <>
                              <TableCell>Student</TableCell>
                              <TableCell>Subject</TableCell>
                              <TableCell align="center">1st</TableCell>
                              <TableCell align="center">2nd</TableCell>
                              <TableCell align="center">3rd</TableCell>
                              <TableCell align="center">4th</TableCell>
                              <TableCell align="center">Final</TableCell>
                              <TableCell align="center">Status</TableCell>
                            </>
                          )}
                          {selectedReportType === "attendance" && (
                            <>
                              <TableCell>Student</TableCell>
                              <TableCell align="center">Present</TableCell>
                              <TableCell align="center">Absent</TableCell>
                              <TableCell align="center">Late</TableCell>
                              <TableCell align="center">Total Days</TableCell>
                              <TableCell align="center">
                                Attendance Rate
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Keep all your existing table body rendering code exactly as is */}
                        {selectedReportType === "student" &&
                          reportData.map((row, index) => {
                            const q1 = Number(row.q1) || 0;
                            const q2 = Number(row.q2) || 0;
                            const q3 = Number(row.q3) || 0;
                            const q4 = Number(row.q4) || 0;
                            const final = Number(row.final_grade) || 0;
                            return (
                              <TableRow key={index} hover>
                                <TableCell>{row.subject_name}</TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={q1 > 0 ? q1.toFixed(2) : "—"}
                                    size="small"
                                    color={
                                      q1 >= 75
                                        ? "success"
                                        : q1 > 0
                                          ? "error"
                                          : "default"
                                    }
                                    variant={q1 > 0 ? "filled" : "outlined"}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={q2 > 0 ? q2.toFixed(2) : "—"}
                                    size="small"
                                    color={
                                      q2 >= 75
                                        ? "success"
                                        : q2 > 0
                                          ? "error"
                                          : "default"
                                    }
                                    variant={q2 > 0 ? "filled" : "outlined"}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={q3 > 0 ? q3.toFixed(2) : "—"}
                                    size="small"
                                    color={
                                      q3 >= 75
                                        ? "success"
                                        : q3 > 0
                                          ? "error"
                                          : "default"
                                    }
                                    variant={q3 > 0 ? "filled" : "outlined"}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={q4 > 0 ? q4.toFixed(2) : "—"}
                                    size="small"
                                    color={
                                      q4 >= 75
                                        ? "success"
                                        : q4 > 0
                                          ? "error"
                                          : "default"
                                    }
                                    variant={q4 > 0 ? "filled" : "outlined"}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={final > 0 ? final.toFixed(2) : "N/A"}
                                    size="small"
                                    color={getStatusColor(final)}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  {final > 0 ? (
                                    <Chip
                                      label={final >= 75 ? "PASSED" : "FAILED"}
                                      size="small"
                                      color={final >= 75 ? "success" : "error"}
                                    />
                                  ) : (
                                    <Chip
                                      label="NO GRADE"
                                      size="small"
                                      color="default"
                                    />
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}

                        {selectedReportType === "class" &&
                          reportData.map((row, index) => {
                            const q1 = Number(row.q1) || 0;
                            const q2 = Number(row.q2) || 0;
                            const q3 = Number(row.q3) || 0;
                            const q4 = Number(row.q4) || 0;
                            const final = Number(row.final_grade) || 0;
                            const isValidGrade = final > 0;

                            return (
                              <TableRow key={index} hover>
                                <TableCell>
                                  {row.first_name} {row.last_name}
                                </TableCell>
                                <TableCell>{row.subject_name}</TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={q1 > 0 ? q1.toFixed(2) : "—"}
                                    size="small"
                                    color={
                                      q1 >= 75
                                        ? "success"
                                        : q1 > 0
                                          ? "error"
                                          : "default"
                                    }
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={q2 > 0 ? q2.toFixed(2) : "—"}
                                    size="small"
                                    color={
                                      q2 >= 75
                                        ? "success"
                                        : q2 > 0
                                          ? "error"
                                          : "default"
                                    }
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={q3 > 0 ? q3.toFixed(2) : "—"}
                                    size="small"
                                    color={
                                      q3 >= 75
                                        ? "success"
                                        : q3 > 0
                                          ? "error"
                                          : "default"
                                    }
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={q4 > 0 ? q4.toFixed(2) : "—"}
                                    size="small"
                                    color={
                                      q4 >= 75
                                        ? "success"
                                        : q4 > 0
                                          ? "error"
                                          : "default"
                                    }
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={final > 0 ? final.toFixed(2) : "N/A"}
                                    size="small"
                                    color={getStatusColor(final)}
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  {isValidGrade ? (
                                    <Chip
                                      label={final >= 75 ? "PASSED" : "FAILED"}
                                      size="small"
                                      color={final >= 75 ? "success" : "error"}
                                    />
                                  ) : (
                                    <Chip
                                      label="NO GRADE"
                                      size="small"
                                      color="default"
                                    />
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}

                        {selectedReportType === "attendance" &&
                          reportData.map((row, index) => {
                            const present = Number(row.present || 0);
                            const absent = Number(row.absent || 0);
                            const late = Number(row.late || 0);
                            const total = present + absent + late;
                            const attendanceRate =
                              total > 0
                                ? ((present / total) * 100).toFixed(1)
                                : 0;

                            return (
                              <TableRow key={index} hover>
                                <TableCell>
                                  {row.first_name} {row.last_name}
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={present}
                                    size="small"
                                    color="success"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={absent}
                                    size="small"
                                    color="error"
                                  />
                                </TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={late}
                                    size="small"
                                    color="warning"
                                  />
                                </TableCell>
                                <TableCell align="center">{total}</TableCell>
                                <TableCell align="center">
                                  <Chip
                                    label={`${attendanceRate}%`}
                                    size="small"
                                    color={getAttendanceStatusColor(
                                      attendanceRate,
                                    )}
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}

                        {reportData.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={
                                selectedReportType === "student"
                                  ? 7
                                  : selectedReportType === "class"
                                    ? 8
                                    : 6
                              }
                              className={styles.emptyState}
                            >
                              <div className={styles.emptyStateContent}>
                                <Typography variant="h6">
                                  No data found
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                >
                                  Try selecting different criteria
                                </Typography>
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
                      count={reportData.length}
                      rowsPerPage={rowsPerPage}
                      page={page}
                      onPageChange={handleChangePage}
                      onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                  </>
                )}
              </StyledTableContainer>
            </div>
          )}
        </div>
      </ThemeProvider>
    </>
  );
}

export default Reports;
