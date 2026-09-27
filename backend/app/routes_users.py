from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .extensions import db
from .models import User
from .routes_auth import EMAIL_RE

users_bp = Blueprint("users", __name__)


def usuario_actual():
    return User.query.get(int(get_jwt_identity()))


@users_bp.route("/users/me", methods=["GET"])
@jwt_required()
def get_me():
    user = usuario_actual()
    if not user:
        return jsonify({"error": "Usuario no encontrado."}), 404
    return jsonify(user.serialize()), 200


@users_bp.route("/users/me", methods=["PUT"])
@jwt_required()
def update_me():
    user = usuario_actual()
    if not user:
        return jsonify({"error": "Usuario no encontrado."}), 404

    data = request.get_json(silent=True) or {}
    errores = {}

    if "nombre" in data:
        nombre = (data.get("nombre") or "").strip()
        if len(nombre) < 2:
            errores["nombre"] = "El nombre debe tener al menos 2 caracteres."
        else:
            user.nombre = nombre

    if "email" in data:
        email = (data.get("email") or "").strip().lower()
        if not EMAIL_RE.match(email):
            errores["email"] = "Introduce un email válido."
        elif User.query.filter(User.email == email, User.id != user.id).first():
            errores["email"] = "Ese email ya está en uso."
        else:
            user.email = email

    if "telefono" in data:
        user.telefono = data.get("telefono")

    if "password" in data and data["password"]:
        if len(data["password"]) < 6:
            errores["password"] = "La contraseña debe tener al menos 6 caracteres."
        else:
            user.set_password(data["password"])

    if errores:
        return jsonify({"errores": errores}), 400

    db.session.commit()
    return jsonify(user.serialize()), 200


@users_bp.route("/users/me", methods=["DELETE"])
@jwt_required()
def delete_me():
    user = usuario_actual()
    if not user:
        return jsonify({"error": "Usuario no encontrado."}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "Cuenta eliminada."}), 200
