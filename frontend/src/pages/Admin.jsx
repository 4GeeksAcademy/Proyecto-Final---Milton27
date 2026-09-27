import { useEffect, useState } from "react";
import { api } from "../api/api";

const EXCURSION_VACIA = {
  nombre: "", descripcion: "", precio: "", duracion_min: "", capacidad: "", categoria_id: "",
};

export default function Admin() {
  const [excursiones, setExcursiones] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [errorReservas, setErrorReservas] = useState("");
  const [form, setForm] = useState(EXCURSION_VACIA);
  const [editandoId, setEditandoId] = useState(null);
  const [error, setError] = useState("");

  const cargar = () => {
    api.getExcursions().then(setExcursiones).catch(() => {});
  };

  const cargarReservas = () => {
    api.getAdminReservations()
      .then(setReservas)
      .catch((err) => setErrorReservas(err.data?.error || err.message));
  };

  useEffect(() => {
    cargar();
    cargarReservas();
    api.getCategories().then(setCategorias).catch(() => {});
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      ...form,
      precio: Number(form.precio),
      duracion_min: Number(form.duracion_min),
      capacidad: Number(form.capacidad),
      categoria_id: Number(form.categoria_id),
    };
    try {
      if (editandoId) {
        await api.updateExcursion(editandoId, payload);
      } else {
        await api.createExcursion(payload);
      }
      setForm(EXCURSION_VACIA);
      setEditandoId(null);
      cargar();
    } catch (err) {
      setError(err.data?.error || err.message);
    }
  };

  const handleEdit = (excursion) => {
    setEditandoId(excursion.id);
    setForm({
      nombre: excursion.nombre,
      descripcion: excursion.descripcion,
      precio: excursion.precio,
      duracion_min: excursion.duracion_min,
      capacidad: excursion.capacidad,
      categoria_id: excursion.categoria?.id || "",
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteExcursion(id);
      cargar();
    } catch (err) {
      setError(err.data?.error || err.message);
    }
  };

  return (
    <section className="admin">
      <h1>Panel de administración</h1>
      <p>Alta, edición y baja de excursiones — el CRUD completo del proyecto.</p>

      <form className="card admin-form" onSubmit={handleSubmit}>
        <h2>{editandoId ? `Editar excursión #${editandoId}` : "Nueva excursión"}</h2>
        <div className="admin-form-grid">
          <label>Nombre
            <input name="nombre" required value={form.nombre} onChange={handleChange} />
          </label>
          <label>Categoría
            <select name="categoria_id" required value={form.categoria_id} onChange={handleChange}>
              <option value="">Selecciona…</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </label>
          <label>Precio (€)
            <input name="precio" type="number" step="0.01" min="0" required value={form.precio} onChange={handleChange} />
          </label>
          <label>Duración (min)
            <input name="duracion_min" type="number" min="1" required value={form.duracion_min} onChange={handleChange} />
          </label>
          <label>Capacidad
            <input name="capacidad" type="number" min="1" required value={form.capacidad} onChange={handleChange} />
          </label>
        </div>
        <label>Descripción
          <textarea name="descripcion" required rows="2" value={form.descripcion} onChange={handleChange} />
        </label>
        {error && <p className="form-error">{error}</p>}
        <div className="admin-form-actions">
          <button type="submit" className="btn-primary">{editandoId ? "Guardar cambios" : "Crear excursión"}</button>
          {editandoId && (
            <button type="button" className="btn-link" onClick={() => { setEditandoId(null); setForm(EXCURSION_VACIA); }}>
              Cancelar edición
            </button>
          )}
        </div>
      </form>

      <div className="table-wrap card">
        <table>
          <thead>
            <tr><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Duración</th><th>Aforo</th><th></th></tr>
          </thead>
          <tbody>
            {excursiones.map((e) => (
              <tr key={e.id}>
                <td>{e.nombre}</td>
                <td>{e.categoria?.nombre}</td>
                <td>{e.precio.toFixed(2)} €</td>
                <td>{e.duracion_min} min</td>
                <td>{e.capacidad}</td>
                <td>
                  <button className="btn-link" onClick={() => handleEdit(e)}>Editar</button>
                  <button className="btn-link btn-danger-link" onClick={() => handleDelete(e.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="table-wrap card">
        <h2>Reservas agendadas</h2>
        <p>Plazas reservadas en pedidos ya pagados, por fecha de excursión — quién la reservó y para cuándo.</p>
        {errorReservas && <p className="form-error">{errorReservas}</p>}
        {!errorReservas && reservas.length === 0 && <p>Todavía no hay ninguna reserva pagada.</p>}
        {reservas.length > 0 && (
          <table>
            <thead>
              <tr><th>Excursión</th><th>Fecha</th><th>Personas</th><th>Cliente</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              {reservas.map((r) => (
                <tr key={r.id}>
                  <td>{r.excursion?.nombre}</td>
                  <td>{r.fecha_excursion}</td>
                  <td>{r.personas}</td>
                  <td>{r.cliente ? `${r.cliente.nombre} (${r.cliente.email})` : "—"}</td>
                  <td>{r.subtotal.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
