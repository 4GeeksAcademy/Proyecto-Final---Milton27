import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { api } from "../api/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function ExcursionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { refreshCart } = useCart();

  const pendingItem = location.state?.pendingItem;
  const [excursion, setExcursion] = useState(null);
  const [fecha, setFecha] = useState(
    pendingItem && pendingItem.excursion_id === Number(id) ? pendingItem.fecha_excursion : "",
  );
  const [personas, setPersonas] = useState(
    pendingItem && pendingItem.excursion_id === Number(id) ? pendingItem.personas : 1,
  );
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const autoAddDone = useRef(false);

  useEffect(() => {
    api.getExcursion(id).then(setExcursion).catch(() => setError("Excursión no encontrada."));
  }, [id]);

  // Si el usuario venía de "Añadir al carrito" sin sesión, tras loguearse/registrarse
  // vuelve aquí con los datos que ya había rellenado: los añadimos automáticamente
  // en vez de obligarlo a rellenar el formulario otra vez.
  useEffect(() => {
    if (!user || !pendingItem || pendingItem.excursion_id !== Number(id) || autoAddDone.current) return;
    autoAddDone.current = true;
    (async () => {
      try {
        await api.addCartItem(pendingItem);
        await refreshCart();
        setMensaje("Añadida al carrito.");
        navigate(location.pathname, { replace: true, state: {} });
      } catch (err) {
        setError(err.data?.error || err.message);
      }
    })();
  }, [user, pendingItem, id, navigate, location.pathname, refreshCart]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");

    if (!user) {
      navigate("/login", {
        state: {
          from: location.pathname,
          pendingItem: { excursion_id: Number(id), fecha_excursion: fecha, personas: Number(personas) },
        },
      });
      return;
    }
    try {
      await api.addCartItem({ excursion_id: Number(id), fecha_excursion: fecha, personas: Number(personas) });
      await refreshCart();
      setMensaje("Añadida al carrito.");
    } catch (err) {
      setError(err.data?.error || err.message);
    }
  };

  if (error && !excursion) return <p className="form-error">{error}</p>;
  if (!excursion) return <p className="page-loading">Cargando…</p>;

  const hoy = new Date().toISOString().split("T")[0];

  return (
    <section className="detail">
      <div className="detail-info">
        <span className="excursion-card-cat">{excursion.categoria?.nombre}</span>
        <h1>{excursion.nombre}</h1>
        <p>{excursion.descripcion}</p>
        <dl className="detail-facts">
          <div><dt>Duración</dt><dd>{excursion.duracion_min} minutos</dd></div>
          <div><dt>Aforo</dt><dd>{excursion.capacidad} personas</dd></div>
          {excursion.barco && <div><dt>Embarcación</dt><dd>{excursion.barco.nombre} ({excursion.barco.tipo})</dd></div>}
          <div><dt>Precio</dt><dd>{excursion.precio.toFixed(2)} € / persona</dd></div>
        </dl>
      </div>

      <form className="card detail-form" onSubmit={handleAdd}>
        <h2>Reservar plaza</h2>
        <label>
          Fecha
          <input type="date" min={hoy} required value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </label>
        <label>
          Nº de personas
          <input
            type="number"
            min="1"
            max={excursion.capacidad}
            required
            value={personas}
            onChange={(e) => setPersonas(e.target.value)}
          />
        </label>
        <p className="detail-total">Total: {(excursion.precio * (Number(personas) || 0)).toFixed(2)} €</p>
        {error && <p className="form-error">{error}</p>}
        {mensaje && <p className="form-success">{mensaje}</p>}
        <button type="submit" className="btn-primary">Añadir al carrito</button>
      </form>
    </section>
  );
}
