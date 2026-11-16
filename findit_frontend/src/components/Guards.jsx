import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Loading() {
  return (
    <div className="center-screen">
      <div className="spinner" />
    </div>
  );
}

export function RequireAuth() {
  const { isAuth, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (!isAuth) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return <Outlet />;
}

export function RequireRole({ role }) {
  const { isAuth, isModerator, isAdmin, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading />;
  if (!isAuth) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  const ok = role === "admin" ? isAdmin : isModerator;
  if (!ok) return <Navigate to="/" replace />;
  return <Outlet />;
}