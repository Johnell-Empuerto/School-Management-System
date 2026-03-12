import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import LoadingScreen from "./LoadingScreen"; // Add this import

function ProtectedRoute({ allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    api
      .get("/me")
      .then((res) => {
        if (res.status === 200) {
          setAuthenticated(true);
        }
      })
      .catch(() => {
        // Handle error silently
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />; // Changed from <div>Loading...</div>

  // not logged in
  if (!authenticated) return <Navigate to="/" />;

  // admin bypass
  if (user?.role === "admin") {
    return <Outlet />;
  }

  // role restriction
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
