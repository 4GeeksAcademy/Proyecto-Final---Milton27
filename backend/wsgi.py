import click
from app import create_app
from app.extensions import db
from app.seed import run_seed

app = create_app()


@app.cli.command("seed")
def seed_command():
    """Puebla la base de datos con categorías, embarcaciones y excursiones de ejemplo."""
    run_seed()


@app.cli.command("create-db")
def create_db_command():
    """Crea las tablas directamente (alternativa rápida a las migraciones en desarrollo)."""
    with app.app_context():
        db.create_all()
    click.echo("Tablas creadas.")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3001, debug=True)
