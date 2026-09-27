import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/api";

export default function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "" });
  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState("");
  const [pedidos, setPedidos] = useState([]);
  const [confirmarBaja, setConfirmarBaja] = useState(false);

  useEffect(() => {
    if (user) setForm({ nombre: user.nombre, email: user.email, telefono: user.telefono || "" });
    api.getOrders().then(setPedidos).catch(() => {});
  }, [user]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores({});
    setMensaje("");
    try {
      await api.updateMe(form);
      await refreshUser();
      setMensaje("Datos actualizados.");
    } catch (err) {
      setErrores(err.data?.errores || { general: err.message });
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteMe();
      logout();
      navigate("/");
    } catch (err) {
      setErrores({ general: err.data?.error || err.message });
    }
  };

  if (!user) return null;

  return (
    <section className="profile">
      <h1>Tu perfil</h1>

      <form className="card auth-form" onSubmit={handleSubmit}>
        <label>
          Nombre
          <input name="nombre" value={form.nombre} onChange={handleChange} />
          {errores.nombre && <span className="field-error">{errores.nombre}</span>}
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={handleChange} />
          {errores.email && <span className="field-error">{errores.email}</span>}
        </label>
        <label>
          Teléfono
          <input name="telefono" value={form.telefono} onChange={handleChange} />
        </label>
        {errores.general && <p className="form-error">{errores.general}</p>}
        {mensaje && <p className="form-success">{mensaje}</p>}
        <button type="submit" className="btn-primary">Guardar cambios</button>
      </form>

      <div className="card">
        <h2>Tus reservas</h2>
        {pedidos.length === 0 && <p>Todavía no tienes reservas pagadas.</p>}
        {pedidos.map((p) => (
          <div key={p.id} className="order-summary">
            <strong>Pedido #{p.id}</strong> — {p.estado} — {p.total.toFixed(2)} €
            <ul>
              {p.items.map((it) => (
                <li key={it.id}>{it.excursion.nombre} · {it.fecha_excursion} · {it.personas} pers.</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="card danger-zone">
        <h2>Eliminar cuenta</h2>
        <p>Esta acción borra tu cuenta y tus reservas de forma permanente.</p>
        {!confirmarBaja ? (
          <button className="btn-danger" onClick={() => setConfirmarBaja(true)}>Eliminar mi cuenta</button>
        ) : (
          <div className="confirm-row">
            <span>¿Seguro? No se puede deshacer.</span>
            <button className="btn-danger" onClick={handleDelete}>Sí, eliminar</button>
            <button className="btn-link" onClick={() => setConfirmarBaja(false)}>Cancelar</button>
          </div>
        )}
      </div>
    </section>
  );
}
