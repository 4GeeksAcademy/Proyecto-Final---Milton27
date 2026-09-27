import re
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from .extensions import db
from .models import User

auth_bp = Blueprint("auth", __name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def validar_signup(data):
    errores = {}
    nombre = (data.get("nombre") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if len(nombre) < 2:
        errores["nombre"] = "El nombre debe tener al menos 2 caracteres."
    if not EMAIL_RE.match(email):
        errores["email"] = "Introduce un email válido."
    if len(password) < 6:
        errores["password"] = "La contraseña debe tener al menos 6 caracteres."

    return errores, nombre, email, password


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}
    errores, nombre, email, password = validar_signup(data)

    if errores:
        return jsonify({"errores": errores}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"errores": {"email": "Ya existe una cuenta con este email."}}), 409

    user = User(nombre=nombre, email=email, telefono=data.get("telefono"))
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.serialize()}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Credenciales inválidas."}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": user.serialize()}), 200
