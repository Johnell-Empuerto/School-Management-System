import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

function PublicRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

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

  // if logged in already → go to dashboard
  if (authenticated) return <Navigate to="/dashboard" />;

  return children;
}

export default PublicRoute;
