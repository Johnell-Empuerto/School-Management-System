import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Students from "../pages/Students";
import Teachers from "../pages/Teachers";
import Enrollment from "../pages/Enrollment";
import Grades from "../pages/Grades";
import Attendance from "../pages/Attendance";
import Reports from "../pages/Reports";
import Users from "../pages/Users";
import Settings from "../pages/Settings";
import Profile from "../pages/Profile";
import Classes from "../pages/Classes";
import Subjects from "../pages/Subjects";
import ClassSubjects from "../pages/ClassSubjects";
import EnrollmentRequests from "../pages/EnrollmentRequests";
import Activity from "../pages/Activity";
import CalendarPage from "../pages/Calendar";
import SchoolYears from "../pages/SchoolYears";
import LicenseExpired from "../pages/LicenseExpired";

import Layout from "../components/Layout";
import ProtectedRoute from "../components/ProtectedRoute";
import PublicRoute from "../components/PublicRoute";

const AppRoutes = () => {
  const [licenseValid, setLicenseValid] = useState(null);

  useEffect(() => {
    fetch("/license.json")
      .then((res) => res.json())
      .then((license) => {
        const today = new Date();
        const expiry = new Date(license.expiry);

        if (today > expiry) {
          setLicenseValid(false);
        } else {
          setLicenseValid(true);
        }
      })
      .catch(() => setLicenseValid(false));
  }, []);

  if (licenseValid === null) return null;

  if (!licenseValid) {
    return <LicenseExpired />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* PUBLIC ROUTE */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        {/* ALL PROTECTED ROUTES */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin", "teacher", "student"]} />
          }
        >
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />

            <Route
              element={<ProtectedRoute allowedRoles={["admin", "teacher"]} />}
            >
              <Route path="/students" element={<Students />} />
              <Route path="/grades" element={<Grades />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/subjects" element={<Subjects />} />
              <Route path="/class-subjects" element={<ClassSubjects />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route
                path="/enrollment-requests"
                element={<EnrollmentRequests />}
              />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/users" element={<Users />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/school-years" element={<SchoolYears />} />
            </Route>

            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["admin", "student", "teacher"]}
                />
              }
            >
              <Route path="/activity" element={<Activity />} />
            </Route>

            <Route
              element={<ProtectedRoute allowedRoles={["admin", "student"]} />}
            >
              <Route path="/enrollment" element={<Enrollment />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
