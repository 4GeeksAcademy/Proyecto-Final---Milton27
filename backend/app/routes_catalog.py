from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .extensions import db
from .models import Category, Boat, Excursion, User

catalog_bp = Blueprint("catalog", __name__)


def requiere_admin():
    """Devuelve None si el usuario actual es admin, o una respuesta de error si no."""
    user = User.query.get(int(get_jwt_identity()))
    if not user or not user.is_admin:
        return jsonify({"error": "Requiere permisos de administrador."}), 403
    return None


@catalog_bp.route("/categories", methods=["GET"])
def get_categories():
    categorias = Category.query.order_by(Category.nombre).all()
    return jsonify([c.serialize() for c in categorias]), 200


@catalog_bp.route("/excursions", methods=["GET"])
def get_excursions():
    query = Excursion.query.filter_by(activo=True)

    categoria_slug = request.args.get("categoria")
    if categoria_slug:
        query = query.join(Category).filter(Category.slug == categoria_slug)

    excursiones = query.order_by(Excursion.nombre).all()
    return jsonify([e.serialize() for e in excursiones]), 200


@catalog_bp.route("/excursions/<int:excursion_id>", methods=["GET"])
def get_excursion(excursion_id):
    excursion = Excursion.query.get(excursion_id)
    if not excursion:
        return jsonify({"error": "Excursión no encontrada."}), 404
    return jsonify(excursion.serialize(detail=True)), 200


@catalog_bp.route("/excursions", methods=["POST"])
@jwt_required()
def create_excursion():
    error = requiere_admin()
    if error:
        return error

    data = request.get_json(silent=True) or {}
    campos_requeridos = ["nombre", "descripcion", "precio", "duracion_min", "capacidad", "categoria_id"]
    faltantes = [c for c in campos_requeridos if c not in data]
    if faltantes:
        return jsonify({"error": f"Faltan campos: {', '.join(faltantes)}"}), 400

    excursion = Excursion(
        nombre=data["nombre"],
        descripcion=data["descripcion"],
        precio=data["precio"],
        duracion_min=data["duracion_min"],
        capacidad=data["capacidad"],
        categoria_id=data["categoria_id"],
        boat_id=data.get("boat_id"),
        imagen_url=data.get("imagen_url"),
        activo=data.get("activo", True),
    )
    db.session.add(excursion)
    db.session.commit()
    return jsonify(excursion.serialize(detail=True)), 201


@catalog_bp.route("/excursions/<int:excursion_id>", methods=["PUT"])
@jwt_required()
def update_excursion(excursion_id):
    error = requiere_admin()
    if error:
        return error

    excursion = Excursion.query.get(excursion_id)
    if not excursion:
        return jsonify({"error": "Excursión no encontrada."}), 404

    data = request.get_json(silent=True) or {}
    for campo in ["nombre", "descripcion", "precio", "duracion_min", "capacidad",
                  "categoria_id", "boat_id", "imagen_url", "activo"]:
        if campo in data:
            setattr(excursion, campo, data[campo])

    db.session.commit()
    return jsonify(excursion.serialize(detail=True)), 200


@catalog_bp.route("/excursions/<int:excursion_id>", methods=["DELETE"])
@jwt_required()
def delete_excursion(excursion_id):
    error = requiere_admin()
    if error:
        return error

    excursion = Excursion.query.get(excursion_id)
    if not excursion:
        return jsonify({"error": "Excursión no encontrada."}), 404

    db.session.delete(excursion)
    db.session.commit()
    return jsonify({"message": "Excursión eliminada."}), 200


@catalog_bp.route("/boats", methods=["GET"])
def get_boats():
    boats = Boat.query.order_by(Boat.nombre).all()
    return jsonify([b.serialize() for b in boats]), 200
