import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { api } from "../api/api";
import { useState } from "react";

export default function Cart() {
  const { cart, refreshCart } = useCart();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const items = cart?.items || [];

  const handleRemove = async (itemId) => {
    try {
      await api.removeCartItem(itemId);
      await refreshCart();
    } catch (err) {
      setError(err.data?.error || err.message);
    }
  };

  const handleQty = async (itemId, personas) => {
    try {
      await api.updateCartItem(itemId, { personas });
      await refreshCart();
    } catch (err) {
      setError(err.data?.error || err.message);
    }
  };

  if (items.length === 0) {
    return (
      <section>
        <h1>Tu carrito</h1>
        <p>Todavía no has añadido ninguna excursión.</p>
        <Link to="/catalogo" className="btn-primary">Ver catálogo</Link>
      </section>
    );
  }

  return (
    <section>
      <h1>Tu carrito</h1>
      {error && <p className="form-error">{error}</p>}
      <div className="cart-list">
        {items.map((item) => (
          <div key={item.id} className="card cart-item">
            <div>
              <h3>{item.excursion.nombre}</h3>
              <p>{item.fecha_excursion}</p>
            </div>
            <label>
              Personas
              <input
                type="number"
                min="1"
                max={item.excursion.capacidad}
                value={item.personas}
                onChange={(e) => handleQty(item.id, Number(e.target.value))}
              />
            </label>
            <span className="cart-item-price">{item.subtotal.toFixed(2)} €</span>
            <button className="btn-link" onClick={() => handleRemove(item.id)}>Quitar</button>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <span>Total</span>
        <strong>{cart.total.toFixed(2)} €</strong>
      </div>
      <button className="btn-primary" onClick={() => navigate("/checkout")}>Ir a pagar</button>
    </section>
  );
}
