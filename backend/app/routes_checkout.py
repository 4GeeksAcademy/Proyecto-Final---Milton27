from flask import Blueprint, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from .extensions import db
from .models import Order, OrderItem
from .routes_catalog import requiere_admin

checkout_bp = Blueprint("checkout", __name__)


@checkout_bp.route("/checkout", methods=["POST"])
@jwt_required()
def checkout():
    """
    Crea la intención de pago para el carrito actual.

    Si hay una STRIPE_SECRET_KEY configurada en el .env, se crea un
    PaymentIntent real de Stripe (modo test) y se devuelve su client_secret
    para usarlo con Stripe Elements en el frontend.

    Si no hay clave configurada, se responde en "modo simulado" para poder
    probar el flujo completo en local sin necesidad de una cuenta de Stripe.
    Sustituye esto por la integración real antes de entregar el proyecto.
    """
    user_id = int(get_jwt_identity())
    carrito = Order.query.filter_by(user_id=user_id, estado="pendiente").first()

    if not carrito or not carrito.items:
        return jsonify({"error": "El carrito está vacío."}), 400

    total = carrito.total
    stripe_key = current_app.config.get("STRIPE_SECRET_KEY")

    if stripe_key:
        import stripe
        stripe.api_key = stripe_key
        intent = stripe.PaymentIntent.create(
            amount=int(total * 100),  # Stripe trabaja en céntimos
            currency="eur",
            metadata={"order_id": carrito.id, "user_id": user_id},
        )
        carrito.stripe_payment_id = intent["id"]
        db.session.commit()
        return jsonify({"modo": "stripe", "client_secret": intent["client_secret"], "total": total}), 200

    # --- Modo simulado (sin Stripe configurado) ---
    carrito.stripe_payment_id = f"simulado_{carrito.id}"
    db.session.commit()
    return jsonify({"modo": "simulado", "client_secret": None, "total": total}), 200


@checkout_bp.route("/orders/confirm", methods=["POST"])
@jwt_required()
def confirm_order():
    """Marca el carrito pendiente como pagado. En modo simulado no valida
    nada más; con Stripe real, aquí se debería verificar el PaymentIntent
    contra la API de Stripe antes de marcar el pedido como pagado."""
    user_id = int(get_jwt_identity())
    carrito = Order.query.filter_by(user_id=user_id, estado="pendiente").first()

    if not carrito or not carrito.items:
        return jsonify({"error": "No hay ningún pedido pendiente que confirmar."}), 400

    stripe_key = current_app.config.get("STRIPE_SECRET_KEY")
    if stripe_key and carrito.stripe_payment_id:
        import stripe
        stripe.api_key = stripe_key
        intent = stripe.PaymentIntent.retrieve(carrito.stripe_payment_id)
        if intent["status"] != "succeeded":
            return jsonify({"error": f"El pago todavía no se ha completado (estado: {intent['status']})."}), 400

    carrito.estado = "pagado"
    db.session.commit()
    return jsonify(carrito.serialize()), 200


@checkout_bp.route("/orders", methods=["GET"])
@jwt_required()
def get_orders():
    user_id = int(get_jwt_identity())
    pedidos = (
        Order.query.filter_by(user_id=user_id)
        .filter(Order.estado != "pendiente")
        .order_by(Order.fecha_creacion.desc())
        .all()
    )
    return jsonify([p.serialize() for p in pedidos]), 200


@checkout_bp.route("/admin/reservations", methods=["GET"])
@jwt_required()
def admin_reservations():
    """Lista, solo para administradores, todas las plazas reservadas (de pedidos
    ya pagados) en cualquier excursión, con quién la reservó y para cuándo.
    Es la vista de "excursiones agendadas" del panel de admin."""
    error = requiere_admin()
    if error:
        return error

    items = (
        OrderItem.query.join(Order)
        .filter(Order.estado == "pagado")
        .order_by(OrderItem.fecha_excursion.asc())
        .all()
    )

    resultado = [
        {
            "id": item.id,
            "excursion": item.excursion.serialize() if item.excursion else None,
            "fecha_excursion": item.fecha_excursion.isoformat() if item.fecha_excursion else None,
            "personas": item.personas,
            "subtotal": item.subtotal,
            "pedido_id": item.order_id,
            "cliente": (
                {"nombre": item.order.user.nombre, "email": item.order.user.email}
                if item.order and item.order.user
                else None
            ),
        }
        for item in items
    ]
    return jsonify(resultado), 200
