import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { api } from "../api/api";
import { useCart } from "../context/CartContext";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

/** Formulario de pago real con Stripe Elements (solo se usa si hay claves configuradas). */
function StripePaymentForm({ total, clientSecret, onPaid }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState("");
  const [procesando, setProcesando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcesando(true);
    setError("");

    const { error: stripeError } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });

    if (stripeError) {
      setError(stripeError.message);
      setProcesando(false);
      return;
    }

    try {
      await api.confirmOrder();
      onPaid();
    } catch (err) {
      setError(err.data?.error || err.message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <form className="card checkout-form" onSubmit={handleSubmit}>
      <h2>Pago con tarjeta</h2>
      <p className="detail-total">Total a pagar: {total.toFixed(2)} €</p>
      <div className="card-element-wrap"><CardElement /></div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={!stripe || procesando}>
        {procesando ? "Procesando…" : "Pagar ahora"}
      </button>
      <p className="checkout-hint">Modo test de Stripe — usa la tarjeta 4242 4242 4242 4242, cualquier fecha futura y CVC.</p>
    </form>
  );
}

/** Checkout simulado para desarrollo local sin claves de Stripe todavía. */
function SimulatedCheckoutForm({ total, onPaid }) {
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setProcesando(true);
    setError("");
    try {
      await api.confirmOrder();
      onPaid();
    } catch (err) {
      setError(err.data?.error || err.message);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="card checkout-form">
      <h2>Confirmar pedido (modo prueba)</h2>
      <p>
        Todavía no has configurado <span className="mono">STRIPE_SECRET_KEY</span> en el backend, así que el pago
        se simula para poder probar el flujo completo en local. Añade tus claves de test de Stripe cuando quieras
        el cobro real.
      </p>
      <p className="detail-total">Total: {total.toFixed(2)} €</p>
      {error && <p className="form-error">{error}</p>}
      <button className="btn-primary" onClick={handleConfirm} disabled={procesando}>
        {procesando ? "Procesando…" : "Confirmar y pagar"}
      </button>
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();
  const [sesion, setSesion] = useState(null);
  const [error, setError] = useState("");
  const [pagado, setPagado] = useState(false);

  useEffect(() => {
    api
      .checkout()
      .then(setSesion)
      .catch((err) => setError(err.data?.error || err.message));
  }, []);

  const handlePaid = async () => {
    await refreshCart();
    setPagado(true);
  };

  if (pagado) {
    return (
      <section className="checkout-success">
        <h1>¡Reserva confirmada!</h1>
        <p>Te hemos enviado los detalles de tu excursión. Puedes verla en tu perfil cuando quieras.</p>
        <button className="btn-primary" onClick={() => navigate("/perfil")}>Ir a mi perfil</button>
      </section>
    );
  }

  if (error) return <p className="form-error">{error}</p>;
  if (!sesion || !cart) return <p className="page-loading">Preparando el pago…</p>;

  return (
    <section className="checkout">
      <h1>Finalizar reserva</h1>
      {sesion.modo === "stripe" && sesion.client_secret ? (
        <Elements stripe={stripePromise} options={{ clientSecret: sesion.client_secret }}>
          <StripePaymentForm total={cart.total} clientSecret={sesion.client_secret} onPaid={handlePaid} />
        </Elements>
      ) : (
        <SimulatedCheckoutForm total={cart.total} onPaid={handlePaid} />
      )}
    </section>
  );
}
