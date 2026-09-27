from datetime import datetime
from .extensions import db, bcrypt


class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    telefono = db.Column(db.String(30))
    is_admin = db.Column(db.Boolean, default=False)
    fecha_registro = db.Column(db.DateTime, default=datetime.utcnow)

    orders = db.relationship("Order", backref="user", lazy=True, cascade="all, delete-orphan")

    def set_password(self, raw_password):
        self.password_hash = bcrypt.generate_password_hash(raw_password).decode("utf-8")

    def check_password(self, raw_password):
        return bcrypt.check_password_hash(self.password_hash, raw_password)

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "email": self.email,
            "telefono": self.telefono,
            "is_admin": self.is_admin,
            "fecha_registro": self.fecha_registro.isoformat() if self.fecha_registro else None,
        }


class Category(db.Model):
    __tablename__ = "category"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(80), nullable=False)
    slug = db.Column(db.String(80), unique=True, nullable=False)

    excursions = db.relationship("Excursion", backref="category", lazy=True)

    def serialize(self):
        return {"id": self.id, "nombre": self.nombre, "slug": self.slug}


class Boat(db.Model):
    __tablename__ = "boat"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(80), nullable=False)
    tipo = db.Column(db.String(80))
    capacidad_max = db.Column(db.Integer)
    eslora_m = db.Column(db.Float)

    excursions = db.relationship("Excursion", backref="boat", lazy=True)

    def serialize(self):
        return {
            "id": self.id,
            "nombre": self.nombre,
            "tipo": self.tipo,
            "capacidad_max": self.capacidad_max,
            "eslora_m": self.eslora_m,
        }


class Excursion(db.Model):
    __tablename__ = "excursion"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(150), nullable=False)
    descripcion = db.Column(db.Text, nullable=False, default="")
    precio = db.Column(db.Float, nullable=False)
    duracion_min = db.Column(db.Integer, nullable=False)
    capacidad = db.Column(db.Integer, nullable=False)
    imagen_url = db.Column(db.String(300))
    activo = db.Column(db.Boolean, default=True)

    categoria_id = db.Column(db.Integer, db.ForeignKey("category.id"), nullable=False)
    boat_id = db.Column(db.Integer, db.ForeignKey("boat.id"), nullable=True)

    order_items = db.relationship("OrderItem", backref="excursion", lazy=True)

    def serialize(self, detail=False):
        data = {
            "id": self.id,
            "nombre": self.nombre,
            "descripcion": self.descripcion,
            "precio": self.precio,
            "duracion_min": self.duracion_min,
            "capacidad": self.capacidad,
            "imagen_url": self.imagen_url,
            "activo": self.activo,
            "categoria": self.category.serialize() if self.category else None,
        }
        if detail:
            data["barco"] = self.boat.serialize() if self.boat else None
        return data


class Order(db.Model):
    """Hace de carrito (estado='pendiente') y de pedido (estado='pagado')."""

    __tablename__ = "order"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    estado = db.Column(db.String(20), default="pendiente")  # pendiente | pagado | cancelado
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)
    stripe_payment_id = db.Column(db.String(120))

    items = db.relationship("OrderItem", backref="order", lazy=True, cascade="all, delete-orphan")

    @property
    def total(self):
        return round(sum(item.subtotal for item in self.items), 2)

    def serialize(self):
        return {
            "id": self.id,
            "estado": self.estado,
            "fecha_creacion": self.fecha_creacion.isoformat() if self.fecha_creacion else None,
            "total": self.total,
            "items": [item.serialize() for item in self.items],
        }


class OrderItem(db.Model):
    __tablename__ = "order_item"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey("order.id"), nullable=False)
    excursion_id = db.Column(db.Integer, db.ForeignKey("excursion.id"), nullable=False)
    fecha_excursion = db.Column(db.Date, nullable=False)
    personas = db.Column(db.Integer, nullable=False, default=1)
    precio_unitario = db.Column(db.Float, nullable=False)

    @property
    def subtotal(self):
        return round(self.precio_unitario * self.personas, 2)

    def serialize(self):
        return {
            "id": self.id,
            "excursion": self.excursion.serialize() if self.excursion else None,
            "fecha_excursion": self.fecha_excursion.isoformat() if self.fecha_excursion else None,
            "personas": self.personas,
            "precio_unitario": self.precio_unitario,
            "subtotal": self.subtotal,
        }
