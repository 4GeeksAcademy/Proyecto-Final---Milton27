import os
from flask import Flask, jsonify
from .extensions import db, migrate, jwt, bcrypt, cors


def create_app():
    app = Flask(__name__)

    # --- Configuración básica ---
    _database_url = os.getenv(
        "DATABASE_URL", "sqlite:///" + os.path.join(os.getcwd(), "velamar.db")
    )
    if _database_url.startswith("postgres://"):
        _database_url = _database_url.replace("postgres://", "postgresql://", 1)
    if _database_url.startswith("postgresql://"):
        _database_url = _database_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    app.config["SQLALCHEMY_DATABASE_URI"] = _database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-cambiame")
    app.config["STRIPE_SECRET_KEY"] = os.getenv("STRIPE_SECRET_KEY", "")

    # --- Extensiones ---
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # --- Modelos (deben importarse antes de crear tablas / migraciones) ---
    from . import models  # noqa: F401

    # --- Blueprints ---
    from .routes_auth import auth_bp
    from .routes_users import users_bp
    from .routes_catalog import catalog_bp
    from .routes_cart import cart_bp
    from .routes_checkout import checkout_bp

    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(users_bp, url_prefix="/api")
    app.register_blueprint(catalog_bp, url_prefix="/api")
    app.register_blueprint(cart_bp, url_prefix="/api")
    app.register_blueprint(checkout_bp, url_prefix="/api")

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "velamar-api"})

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "not_found", "message": str(e)}), 404

    return app
