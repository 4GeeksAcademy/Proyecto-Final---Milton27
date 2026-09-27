import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-mark">V</span> Velamar
      </Link>
      <nav className="navbar-links">
        <Link to="/catalogo">Catálogo</Link>
        {user && <Link to="/carrito">Carrito{itemCount > 0 ? ` (${itemCount})` : ""}</Link>}
        {user?.is_admin && <Link to="/admin">Admin</Link>}
        {user ? (
          <>
            <Link to="/perfil">{user.nombre.split(" ")[0]}</Link>
            <button className="btn-link" onClick={handleLogout}>Salir</button>
          </>
        ) : (
          <>
            <Link to="/login">Entrar</Link>
            <Link to="/registro" className="btn-outline">Crear cuenta</Link>
          </>
        )}
      </nav>
    </header>
  );
}
