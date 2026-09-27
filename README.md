# Velamar — E-commerce de excursiones en barco

Proyecto final (React + Flask) del bootcamp, con la temática de excursiones en barco inspirada en
[Mundo Marino, Puerto de Dénia](https://mundomarino.es/puerto-denia/).

Este repo está pensado para **correr en local primero, en VS Code**. Cuando el proyecto esté
listo, el mismo backend y frontend se pueden desplegar en Render sin cambios de estructura —
solo cambiando variables de entorno (ver el apartado final).

```
velamar-app/
├── backend/     Flask + SQLAlchemy + JWT + Stripe
├── frontend/    React + Vite
└── diseño/      Maqueta visual en un solo HTML (sin framework, solo para ver el diseño)
```

## 1. Backend (Flask)

Abre una terminal en VS Code (Terminal → New Terminal) y ejecuta:

```bash
cd backend
python3 -m venv venv

# macOS / Linux
source venv/bin/activate
# Windows (PowerShell)
venv\Scripts\Activate.ps1

pip install -r requirements.txt
cp .env.example .env
```

Crea la base de datos y cárgala con las 8 excursiones de ejemplo:

```bash
flask create-db
flask seed
```

Arranca el servidor:

```bash
flask run --port 3001
```

La API queda disponible en `http://localhost:3001/api`. Compruébalo con:

```bash
curl http://localhost:3001/api/health
```

Con el seed ya tienes un usuario admin de prueba: `admin@velamar.dev` / `admin123` (necesario
para entrar al panel `/admin` y probar el CRUD de excursiones).

## 2. Frontend (React + Vite)

En **otra** terminal de VS Code:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Abre `http://localhost:5173`. El frontend ya apunta a `http://localhost:3001` por el
`.env` que acabas de crear.

## 3. Extensión recomendada de VS Code

Con ambos servidores corriendo, todo cambio en `backend/` o `frontend/` se recarga solo
(Flask debug + Vite HMR). Se recomienda la extensión **ES7+ React/Redux/React-Native snippets**
y **Python** (Microsoft) — están sugeridas en `.vscode/extensions.json`.

## 4. Pago con Stripe (opcional en local)

Mientras `STRIPE_SECRET_KEY` esté vacío en `backend/.env`, el checkout funciona en
**modo simulado**: puedes completar todo el flujo (carrito → checkout → pedido pagado) sin
necesidad de una cuenta de Stripe.

Cuando quieras probar el pago real:

1. Crea una cuenta gratuita en [stripe.com](https://stripe.com) (modo test).
2. Copia tu clave secreta de test (`sk_test_...`) en `backend/.env` → `STRIPE_SECRET_KEY`.
3. Copia tu clave publicable de test (`pk_test_...`) en `frontend/.env` → `VITE_STRIPE_PUBLISHABLE_KEY`.
4. Reinicia ambos servidores. El checkout mostrará el formulario de tarjeta de Stripe Elements.
   Tarjeta de prueba: `4242 4242 4242 4242`, cualquier fecha futura y CVC.

## 5. Cuando esté listo: requisitos de la academia

El enunciado pide usar la plantilla oficial de la academia y desplegar en Render. Una vez que
el proyecto funcione en local:

1. Copia los modelos, rutas y componentes de este repo dentro de la plantilla oficial
   (`react-flask-hello` u otra que indique la academia), respetando su estructura de carpetas.
2. Sustituye SQLite por PostgreSQL en `DATABASE_URL` (Render lo provee automáticamente al crear
   una base de datos).
3. Configura las variables de entorno (`JWT_SECRET_KEY`, `STRIPE_SECRET_KEY`,
   `VITE_STRIPE_PUBLISHABLE_KEY`, `DATABASE_URL`) en el panel de Render.
4. Ejecuta `flask create-db` / `flask seed` (o migraciones con Flask-Migrate) contra la base de
   datos de producción.
5. Haz commits frecuentes y descriptivos a medida que avances — es uno de los requisitos
   generales del enunciado.

## Resumen del modelo de datos

`User` · `Category` · `Boat` · `Excursion` · `Order` (hace de carrito y de pedido) · `OrderItem`.

El plan completo del proyecto (modelo de datos, catálogo, endpoints, roadmap) está en:
https://claude.ai/code/artifact/86248c54-27ce-43a7-ad8e-3e363f6ddedd
