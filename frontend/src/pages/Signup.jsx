import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ nombre: "", email: "", password: "", telefono: "" });
  const [errores, setErrores] = useState({});
  const [enviando, setEnviando] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores({});
    setEnviando(true);
    try {
      await signup(form);
      const destino = location.state?.from || "/catalogo";
      navigate(destino, { state: { pendingItem: location.state?.pendingItem } });
    } catch (err) {
      setErrores(err.data?.errores || { general: err.message });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section className="auth-page">
      <form className="card auth-form" onSubmit={handleSubmit}>
        <h1>Crear cuenta</h1>
        <label>
          Nombre
          <input name="nombre" required value={form.nombre} onChange={handleChange} />
          {errores.nombre && <span className="field-error">{errores.nombre}</span>}
        </label>
        <label>
          Email
          <input name="email" type="email" required value={form.email} onChange={handleChange} />
          {errores.email && <span className="field-error">{errores.email}</span>}
        </label>
        <label>
          Teléfono (opcional)
          <input name="telefono" value={form.telefono} onChange={handleChange} />
        </label>
        <label>
          Contraseña
          <input name="password" type="password" required value={form.password} onChange={handleChange} />
          {errores.password && <span className="field-error">{errores.password}</span>}
        </label>
        {errores.general && <p className="form-error">{errores.general}</p>}
        <button type="submit" className="btn-primary" disabled={enviando}>
          {enviando ? "Creando cuenta…" : "Crear cuenta"}
        </button>
        <p className="auth-switch">¿Ya tienes cuenta? <Link to="/login" state={location.state}>Entra aquí</Link></p>
      </form>
    </section>
  );
}
