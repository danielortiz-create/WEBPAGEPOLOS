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
DATABASE_URL=./db.json
JWT_SECRET=cambia_este_secreto_largo_y_aleatorio

# Credenciales del admin
ADMIN_USER=admin
ADMIN_PASSWORD=rivt2025        ← CÁMBIALO en producción

# Culqi (Fase 3) — https://culqi.com/developers
CULQI_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxx
CULQI_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxx
```

### client/.env (crear este archivo)
```env
VITE_CULQI_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxx
```

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

## Pago online (Fase 3 — Culqi)

1. Crea una cuenta en [culqi.com](https://culqi.com)
2. Obtén tus llaves en el Dashboard de Culqi
3. Completa `server/.env` con `CULQI_SECRET_KEY` y `CULQI_PUBLIC_KEY`
4. Crea `client/.env` con `VITE_CULQI_PUBLIC_KEY`
5. Reinicia ambos servidores

**Soporta:**
- Tarjeta de crédito/débito (Visa, Mastercard, Amex)
- Yape (vía token Culqi)

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
| POST | `/api/upload` | Subir imagen (admin) |
| POST | `/api/pagos/culqi` | Pagar con tarjeta |
| POST | `/api/pagos/yape` | Pagar con Yape |
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
| Base de datos | lowdb 1 (JSON file — sin instalación de drivers) |
| Autenticación | JWT (jsonwebtoken + bcryptjs) |
| Subida de archivos | Multer |
| Pasarela de pago | Culqi (tarjeta + Yape) |
| Tipografía | Playfair Display + Inter (Google Fonts) |
