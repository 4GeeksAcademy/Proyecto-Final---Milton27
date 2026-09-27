import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="page-loading">Cargando…</p>;
  return user ? children : <Navigate to="/login" replace />;
}

export function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="page-loading">Cargando…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return user.is_admin ? children : <Navigate to="/" replace />;
}
