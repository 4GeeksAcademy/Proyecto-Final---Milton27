import { useEffect, useState } from "react";
import { api } from "../api/api";
import ExcursionCard from "../components/ExcursionCard";

export default function Catalog() {
  const [categorias, setCategorias] = useState([]);
  const [excursiones, setExcursiones] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getCategories().then(setCategorias).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError("");
    api
      .getExcursions(categoriaActiva)
      .then(setExcursiones)
      .catch(() => setError("No se pudo cargar el catálogo. ¿Está corriendo el backend?"))
      .finally(() => setLoading(false));
  }, [categoriaActiva]);

  return (
    <section>
      <p className="eyebrow">Catálogo</p>
      <h1>Todas las excursiones</h1>

      <div className="filter-row">
        <button
          className={categoriaActiva === "" ? "chip chip-active" : "chip"}
          onClick={() => setCategoriaActiva("")}
        >
          Todas
        </button>
        {categorias.map((c) => (
          <button
            key={c.id}
            className={categoriaActiva === c.slug ? "chip chip-active" : "chip"}
            onClick={() => setCategoriaActiva(c.slug)}
          >
            {c.nombre}
          </button>
        ))}
      </div>

      {loading && <p className="page-loading">Cargando excursiones…</p>}
      {error && <p className="form-error">{error}</p>}

      <div className="catalog-grid">
        {excursiones.map((e) => (
          <ExcursionCard key={e.id} excursion={e} />
        ))}
      </div>
      {!loading && !error && excursiones.length === 0 && <p>No hay excursiones en esta categoría.</p>}
    </section>
  );
}
