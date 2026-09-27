import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="hero">
      <p className="eyebrow">Excursiones en barco</p>
      <h1>Vive la costa desde el agua</h1>
      <p className="hero-lead">
        Atardeceres en catamarán, cuevas marinas, rutas gastronómicas y aventuras en familia.
        Reserva tu plaza en minutos.
      </p>
      <Link to="/catalogo" className="btn-primary">Ver excursiones</Link>
    </section>
  );
}
