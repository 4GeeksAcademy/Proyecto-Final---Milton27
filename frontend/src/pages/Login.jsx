import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setEnviando(true);
    try {
      await login(email, password);
      const destino = location.state?.from || "/catalogo";
      navigate(destino, { state: { pendingItem: location.state?.pendingItem } });
    } catch (err) {
      setError(err.data?.error || err.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="card auth-form" onSubmit={handleSubmit}>
        <h1>Entrar</h1>
        <label>
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Contraseña
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit" className="btn-primary" disabled={enviando}>
          {enviando ? "Entrando…" : "Entrar"}
        </button>
        <p className="auth-switch">¿No tienes cuenta? <Link to="/registro" state={location.state}>Regístrate</Link></p>
      </form>
    </section>
  );
}
