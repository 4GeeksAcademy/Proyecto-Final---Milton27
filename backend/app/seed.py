"""Datos semilla de Velamar: categorías, embarcaciones, excursiones y un admin.

Uso: flask seed
"""
from .extensions import db
from .models import User, Category, Boat, Excursion

CATEGORIAS = [
    {"nombre": "Atardecer", "slug": "atardecer"},
    {"nombre": "Cultural", "slug": "cultural"},
    {"nombre": "Baño y snorkel", "slug": "bano-snorkel"},
    {"nombre": "Gastronómico", "slug": "gastronomico"},
    {"nombre": "Aventura", "slug": "aventura"},
    {"nombre": "Transporte", "slug": "transporte"},
    {"nombre": "Adrenalina", "slug": "adrenalina"},
]

BARCOS = [
    {"nombre": "Velamar I", "tipo": "Catamarán a vela", "capacidad_max": 100, "eslora_m": 24},
    {"nombre": "Estrella del Sur", "tipo": "Catamarán a motor", "capacidad_max": 250, "eslora_m": 28},
    {"nombre": "Brisa Rápida", "tipo": "Lancha rápida", "capacidad_max": 12, "eslora_m": 8},
]

EXCURSIONES = [
    dict(nombre="Atardecer en Catamarán", slug_categoria="atardecer", barco="Estrella del Sur",
         precio=12, duracion_min=90, capacidad=100,
         descripcion="Navegación al atardecer bordeando la costa, con copa de bienvenida a bordo."),
    dict(nombre="Cuevas y Reserva Marina", slug_categoria="cultural", barco="Velamar I",
         precio=8, duracion_min=75, capacidad=125,
         descripcion="Ruta guiada bordeando el cabo hasta una cueva marina protegida, con explicación a bordo."),
    dict(nombre="Cabos y Baño en Costa Blanca", slug_categoria="bano-snorkel", barco="Estrella del Sur",
         precio=29, duracion_min=180, capacidad=100,
         descripcion="Fondeo en tres cabos de la costa para nadar y hacer snorkel en aguas protegidas."),
    dict(nombre="Desayuno a Bordo y Cuevas", slug_categoria="gastronomico", barco="Velamar I",
         precio=14, duracion_min=120, capacidad=100,
         descripcion="Salida temprana con desayuno servido en cubierta antes de llegar a la cueva marina."),
    dict(nombre="Desembarco Pirata", slug_categoria="aventura", barco="Estrella del Sur",
         precio=14, duracion_min=90, capacidad=80,
         descripcion="Excursión temática con recreación teatral de un desembarco pirata para toda la familia."),
    dict(nombre="Crucero Gourmet en Calas", slug_categoria="gastronomico", barco="Estrella del Sur",
         precio=43, duracion_min=240, capacidad=125,
         descripcion="Mini crucero por calas y acantilados con comida a bordo y parada para el baño."),
    dict(nombre="Bus Acuático del Puerto", slug_categoria="transporte", barco="Brisa Rápida",
         precio=2.5, duracion_min=20, capacidad=50,
         descripcion="Trayecto corto entre paradas del puerto, ideal como producto de entrada de bajo coste."),
    dict(nombre="Parasailing sobre la Bahía", slug_categoria="adrenalina", barco="Brisa Rápida",
         precio=35, duracion_min=45, capacidad=12,
         descripcion="Vuelo en paracaídas remolcado por lancha, con vistas aéreas de la costa."),
]


def run_seed():
    if Category.query.first():
        print("La base de datos ya tiene datos — no se vuelve a sembrar.")
        return

    categorias_por_slug = {}
    for c in CATEGORIAS:
        categoria = Category(**c)
        db.session.add(categoria)
        categorias_por_slug[c["slug"]] = categoria

    barcos_por_nombre = {}
    for b in BARCOS:
        barco = Boat(**b)
        db.session.add(barco)
        barcos_por_nombre[b["nombre"]] = barco

    db.session.flush()  # asigna IDs sin cerrar la transacción

    for e in EXCURSIONES:
        excursion = Excursion(
            nombre=e["nombre"],
            descripcion=e["descripcion"],
            precio=e["precio"],
            duracion_min=e["duracion_min"],
            capacidad=e["capacidad"],
            categoria_id=categorias_por_slug[e["slug_categoria"]].id,
            boat_id=barcos_por_nombre[e["barco"]].id,
        )
        db.session.add(excursion)

    if not User.query.filter_by(email="admin@velamar.dev").first():
        admin = User(nombre="Admin Velamar", email="admin@velamar.dev", is_admin=True)
        admin.set_password("admin123")
        db.session.add(admin)

    db.session.commit()
    print("Datos semilla creados: 7 categorías, 3 embarcaciones, 8 excursiones y 1 admin.")
    print("Admin de prueba -> email: admin@velamar.dev / password: admin123")
