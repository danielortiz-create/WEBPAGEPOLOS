# RIVT — Tienda Online

> Simple. Urbano. Diferente.

Tienda full-stack para la marca de polos RIVT (estilo New York / deportivo premium).

---

## Inicio rápido

### Opción A — Un solo clic (Windows)
Doble clic en `start-dev.bat` en la raíz del proyecto. Abre dos ventanas:
- **Frontend** en http://localhost:3000
- **Backend API** en http://localhost:4000

### Opción B — Manual

**Terminal 1 — Backend:**
```bash
cd "Pagina web/server"
node src/index.js
```

**Terminal 2 — Frontend:**
```bash
cd "Pagina web/client"
npm install     # solo la primera vez
npm run dev
```

Luego abre http://localhost:3000

---

## Estructura del proyecto

```
Pagina web/
├── client/              # Frontend React + Vite + Tailwind CSS
│   ├── public/img/      # Imágenes de productos
│   ├── src/
│   │   ├── components/  # Header, CartDrawer, ProductCard, etc.
│   │   ├── context/     # CartContext, AdminAuthContext
│   │   ├── data/        # products.js (fallback estático)
│   │   ├── pages/       # Tienda + panel /admin
│   │   └── services/    # api.js (capa HTTP)
│   ├── .env.example     # Variables de entorno del cliente
│   └── vite.config.js   # Proxy /api → puerto 4000
│
└── server/              # Backend Node.js + Express
    ├── src/
    │   ├── database.js  # lowdb (JSON file database)
    │   ├── middleware/  # auth.js (JWT)
    │   └── routes/      # auth, products, orders, upload, payments
    ├── db.json          # Base de datos (se crea automáticamente)
    ├── .env             # Variables de entorno (completar)
    └── .env.example     # Plantilla de variables
```

---

## Variables de entorno

### server/.env
```env
PORT=4000
JWT_SECRET=cambia_este_secreto_largo_y_aleatorio

# Credenciales del admin
ADMIN_USER=admin
ADMIN_PASSWORD=rivt2025        ← CÁMBIALO en producción

# MongoDB Atlas (obligatoria — el servidor no arranca sin ella)
MONGODB_URI=mongodb+srv://usuario:clave@cluster0.xxxxx.mongodb.net/rivt?retryWrites=true&w=majority

# MercadoPago (TEST- para pruebas, APP_USR- para producción)
MP_PUBLIC_KEY=TEST-xxxxxxxx
MP_ACCESS_TOKEN=TEST-xxxxxxxx

# Cloudinary (almacenamiento de imágenes)
CLOUDINARY_URL=cloudinary://KEY:SECRET@CLOUD_NAME
```

El cliente ya no necesita archivo `.env` — la public key de MercadoPago se sirve desde el backend.

### Crear las cuentas (todas gratis)

**MongoDB Atlas** (base de datos):
1. Cuenta en [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register) → cluster **M0 Free** (AWS, São Paulo)
2. Database Access → crear usuario con contraseña
3. Network Access → "Allow access from anywhere" (0.0.0.0/0) — Railway no tiene IP fija
4. Connect → Drivers → copiar la URI y agregar `/rivt` antes del `?`

**Cloudinary** (imágenes):
1. Cuenta en [cloudinary.com](https://cloudinary.com) → Dashboard
2. Copiar la "API Environment variable" completa (`cloudinary://...`)

**MercadoPago** (pagos):
1. Cuenta vendedor en [mercadopago.com.pe](https://www.mercadopago.com.pe)
2. [Panel developers](https://www.mercadopago.com.pe/developers) → Tus integraciones → Crear aplicación
3. Copiar **Public Key** y **Access Token** (primero las de prueba `TEST-`)
4. Webhooks → agregar URL `https://TU-DOMINIO/api/pagos/mp/webhook` → evento "Pagos"

---

## Panel de Administración

URL: http://localhost:3000/admin

| Credenciales por defecto |        |
|--------------------------|--------|
| Usuario                  | admin  |
| Contraseña               | rivt2025 |

**Funciones disponibles:**
- Dashboard con estadísticas (productos, pedidos, ingresos)
- **Productos:** crear, editar, eliminar, subir imágenes, activar/desactivar
- **Pedidos:** ver todos, filtrar por estado, cambiar estado (pendiente → pagado → enviado)

---

## Pago online (MercadoPago)

El checkout usa **Payment Brick** de MercadoPago embebido en la web. Con las
variables `MP_PUBLIC_KEY` y `MP_ACCESS_TOKEN` configuradas, el cliente paga sin
salir de la tienda. Sin configurar, el checkout ofrece solo WhatsApp.

**Soporta:**
- Tarjeta de crédito/débito (Visa, Mastercard, Amex)
- Yape (aparece automáticamente cuando la cuenta MP lo tiene habilitado)

**Tarjetas de prueba** (con credenciales `TEST-`): Mastercard `5031 7557 3453 0604`,
Visa `4009 1753 3280 6176` — CVV `123`, cualquier fecha futura. El nombre del
titular controla el resultado: `APRO` aprueba, `OTHE` rechaza, `CONT` queda pendiente.

---

## Build — Polos personalizados con IA

En `/build` el cliente describe su idea, la IA genera el diseño sobre un polo
negro o blanco, y lo agrega al carrito. Precios: chico S/ 80, mediano S/ 100,
grande S/ 120. Límite: 3 diseños por visitante al día.

Requiere `OPENAI_API_KEY` en `server/.env` (sin ella, la página muestra
"próximamente"):
1. Cuenta en [platform.openai.com](https://platform.openai.com)
2. Si lo pide, verificar organización (Settings → Organization → Verify)
3. Cargar crédito: Billing → Add credits ($5 ≈ 450 diseños)
4. API keys → Create new secret key

El pedido llega al panel admin con la imagen del diseño (clic para verla en
grande y mandarla a estampar) y la idea original del cliente.

---

## Agregar productos desde el código (alternativo)

Edita `client/src/data/products.js` — se usa como fallback si el servidor no está disponible.

Para agregar imágenes: coloca los `.webp` o `.jpg` en `client/public/img/` y usa la URL `/img/mi-polo.webp`.

---

## API Reference

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/productos` | Listar productos (público) |
| GET | `/api/productos/:id` | Detalle producto |
| POST | `/api/productos` | Crear producto (admin) |
| PUT | `/api/productos/:id` | Editar producto (admin) |
| DELETE | `/api/productos/:id` | Ocultar producto (admin) |
| POST | `/api/pedidos` | Crear pedido (público) |
| GET | `/api/pedidos` | Listar pedidos (admin) |
| PATCH | `/api/pedidos/:id/estado` | Cambiar estado pedido (admin) |
| POST | `/api/auth/login` | Login admin |
| POST | `/api/upload` | Subir imagen a Cloudinary (admin) |
| GET | `/api/pagos/mp/config` | Public key de MercadoPago |
| POST | `/api/pagos/mp/procesar` | Procesar pago (Payment Brick) |
| POST | `/api/pagos/mp/webhook` | Webhook de MercadoPago |
| GET | `/api/health` | Health check |

---

## WhatsApp
Número: **+51 912 304 036**

Para cambiar el número, reemplaza `51912304036` en todo el proyecto.

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 + Vite 5 + Tailwind CSS 3 + React Router 6 |
| Backend | Node.js + Express 4 |
| Base de datos | MongoDB Atlas (Mongoose) |
| Autenticación | JWT (jsonwebtoken + bcryptjs) |
| Imágenes | Cloudinary (multer en memoria + upload_stream) |
| Pasarela de pago | MercadoPago Payment Brick (tarjeta + Yape) |
| Tipografía | Playfair Display + Inter (Google Fonts) |
