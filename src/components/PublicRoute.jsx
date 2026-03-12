import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";

function PublicRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    api
      .get("/me")
      .then((res) => {
        if (res.status === 200) {
          setAuthenticated(true);
        }
      })
      .catch(() => {
        // Handle error silently - user is not authenticated
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  // if logged in already → go to dashboard
  if (authenticated) return <Navigate to="/dashboard" />;

  return children;
}

export default PublicRoute;
