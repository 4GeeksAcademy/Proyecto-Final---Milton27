import { Link } from "react-router-dom";

export default function ExcursionCard({ excursion }) {
  return (
    <Link to={`/catalogo/${excursion.id}`} className="excursion-card">
      <span className="excursion-card-cat">{excursion.categoria?.nombre}</span>
      <h3>{excursion.nombre}</h3>
      <p>{excursion.descripcion}</p>
      <div className="excursion-card-meta">
        <span>{excursion.duracion_min} min · {excursion.capacidad} plazas</span>
        <span className="excursion-card-price">{excursion.precio.toFixed(2)} €</span>
      </div>
    </Link>
  );
}
