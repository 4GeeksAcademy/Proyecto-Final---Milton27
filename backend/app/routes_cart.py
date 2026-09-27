from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .extensions import db
from .models import Order, OrderItem, Excursion

cart_bp = Blueprint("cart", __name__)


def obtener_o_crear_carrito(user_id):
    carrito = Order.query.filter_by(user_id=user_id, estado="pendiente").first()
    if not carrito:
        carrito = Order(user_id=user_id, estado="pendiente")
        db.session.add(carrito)
        db.session.commit()
    return carrito


@cart_bp.route("/cart", methods=["GET"])
@jwt_required()
def get_cart():
    user_id = int(get_jwt_identity())
    carrito = obtener_o_crear_carrito(user_id)
    return jsonify(carrito.serialize()), 200


@cart_bp.route("/cart/items", methods=["POST"])
@jwt_required()
def add_cart_item():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}

    excursion_id = data.get("excursion_id")
    fecha_str = data.get("fecha_excursion")
    personas = data.get("personas", 1)

    if not excursion_id or not fecha_str:
        return jsonify({"error": "excursion_id y fecha_excursion son obligatorios."}), 400

    excursion = Excursion.query.get(excursion_id)
    if not excursion or not excursion.activo:
        return jsonify({"error": "Excursión no disponible."}), 404

    try:
        fecha_excursion = datetime.strptime(fecha_str, "%Y-%m-%d").date()
    except ValueError:
        return jsonify({"error": "Formato de fecha inválido, usa AAAA-MM-DD."}), 400

    if fecha_excursion < datetime.utcnow().date():
        return jsonify({"error": "La fecha de la excursión no puede ser en el pasado."}), 400

    try:
        personas = int(personas)
    except (TypeError, ValueError):
        return jsonify({"error": "El número de personas debe ser un entero."}), 400

    if personas < 1 or personas > excursion.capacidad:
        return jsonify({"error": f"El número de personas debe estar entre 1 y {excursion.capacidad}."}), 400

    carrito = obtener_o_crear_carrito(user_id)
    item = OrderItem(
        order_id=carrito.id,
        excursion_id=excursion.id,
        fecha_excursion=fecha_excursion,
        personas=personas,
        precio_unitario=excursion.precio,
    )
    db.session.add(item)
    db.session.commit()
    return jsonify(carrito.serialize()), 201


@cart_bp.route("/cart/items/<int:item_id>", methods=["PUT"])
@jwt_required()
def update_cart_item(item_id):
    user_id = int(get_jwt_identity())
    carrito = obtener_o_crear_carrito(user_id)
    item = OrderItem.query.filter_by(id=item_id, order_id=carrito.id).first()
    if not item:
        return jsonify({"error": "Línea de carrito no encontrada."}), 404

    data = request.get_json(silent=True) or {}
    personas = data.get("personas")
    if personas is not None:
        try:
            personas = int(personas)
        except (TypeError, ValueError):
            return jsonify({"error": "El número de personas debe ser un entero."}), 400
        if personas < 1 or personas > item.excursion.capacidad:
            return jsonify({"error": f"El número de personas debe estar entre 1 y {item.excursion.capacidad}."}), 400
        item.personas = personas

    db.session.commit()
    return jsonify(carrito.serialize()), 200


@cart_bp.route("/cart/items/<int:item_id>", methods=["DELETE"])
@jwt_required()
def delete_cart_item(item_id):
    user_id = int(get_jwt_identity())
    carrito = obtener_o_crear_carrito(user_id)
    item = OrderItem.query.filter_by(id=item_id, order_id=carrito.id).first()
    if not item:
        return jsonify({"error": "Línea de carrito no encontrada."}), 404

    db.session.delete(item)
    db.session.commit()
    return jsonify(carrito.serialize()), 200
