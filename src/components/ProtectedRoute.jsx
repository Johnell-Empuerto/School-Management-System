import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

function ProtectedRoute({ allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch("http://localhost:3001/api/me", {
      credentials: "include",
    })
      .then((res) => {
        if (res.ok) {
          setAuthenticated(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

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
