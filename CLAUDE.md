# Tienda RIVT — Contexto del proyecto

Tienda online de polos de la marca **RIVT** (estilo urbano/New York, inspiración visual Kith/premium minimalista). Todo el contenido de cara al usuario está en **español (Perú)**.

## Estructura

```
21_Polos/
├── CLAUDE.md            ← este archivo
├── start-dev.bat        ← arranca backend + frontend (doble clic, abre 2 ventanas)
├── start-client.bat     ← arranca solo el frontend (usado por el preview)
├── Costos/              ← archivos de costos del negocio (no es código)
└── Pagina web/
    ├── package.json     ← scripts build/start para Railway (monorepo)
    ├── client/          ← Frontend React 18 + Vite 5 + Tailwind CSS 3
    │   └── src/
    │       ├── components/   Header, Hero, Footer, ProductCard, CartDrawer, WhatsAppButton
    │       ├── context/      CartContext, AdminAuthContext
    │       ├── data/         products.js (fallback estático si la API no responde)
    │       ├── pages/        HomePage, ProductDetailPage, CartPage, CheckoutPage + admin/
    │       └── services/     api.js (capa HTTP centralizada)
    └── server/          ← Backend Node.js + Express (puerto 4000)
        ├── scripts/         migrate-lowdb.js (migración one-shot lowdb → Atlas)
        └── src/
            ├── db/           connect.js (Mongoose → Atlas), seed.js
            ├── models/       Producto, Pedido, Admin, Counter (Mongoose)
            ├── middleware/   auth.js (JWT), asyncHandler.js
            └── routes/       auth, products, orders, upload (Cloudinary), payments (MercadoPago)
```

## Cómo arrancar en desarrollo

```
# Opción 1: doble clic en start-dev.bat

# Opción 2: manual, 2 terminales
cd "Pagina web/server" && node src/index.js     # API en :4000
cd "Pagina web/client" && npm run dev            # Tienda en :3000
```

- Vite proxea `/api` → `http://localhost:4000` (ver `client/vite.config.js`)
- Para el preview del harness usar la config `rivt-client` de `.claude/launch.json`
- `start-dev.bat` NO sirve para el preview (abre ventanas nuevas con `start`)

## Producción

- **URL:** https://www.rivtperu.com (dominio en Namecheap, DNS CNAME → Railway)
- **Hosting:** Railway, repo GitHub `danielortiz-create/WEBPAGEPOLOS`, branch `main`, root directory `Pagina web`
- Deploy automático al hacer push a `main`
- En producción Express sirve el build de React desde `client/dist` (SPA fallback en `index.js`)
- Variables de entorno en Railway: `PORT=4000`, `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASSWORD`, `MONGODB_URI` (obligatoria — el server hace exit(1) sin ella), `CLOUDINARY_URL`, `MP_PUBLIC_KEY`, `MP_ACCESS_TOKEN`
- Datos en **MongoDB Atlas** (M0 gratis) e imágenes en **Cloudinary** — ambos sobreviven redeploys

## Panel de administración

- URL: `/admin` — credenciales dev: usuario `admin`, contraseña `rivt2025`
- CRUD de productos (múltiples imágenes por producto, la primera es la principal), gestión de pedidos con estados: `pendiente → pagado → enviado / cancelado`
- Token JWT en localStorage (`rivt_admin_token`), expira en 24h

## Decisiones de diseño y negocio

- **Sin categorías de producto** — el usuario pidió quitar "Béisbol"; es una colección única. No re-agregar el campo `categoria` en UI.
- Diseño premium minimalista: crema `#F5F3EC`, tinta `#1A1A1A`, tipografía Playfair Display (serif, títulos) + Inter (sans)
- Precio por defecto de un polo: **S/ 45**
- WhatsApp del negocio: **+51 912 304 036** (hardcodeado en varios componentes)
- Pagos: **MercadoPago Payment Brick** embebido en el checkout (tarjeta + Yape cuando la cuenta lo habilite). Sin credenciales configuradas → 503 `configurar: true` y el checkout ofrece solo WhatsApp. La public key se sirve desde `GET /api/pagos/mp/config` (NO es variable VITE). El monto se cobra desde `pedido.total` en la BD, nunca del cliente.
- **Sección Build** (`/build`): polos personalizados con IA (OpenAI Images, modelo `gpt-image-1-mini`, ~$0.011/imagen). Solo polos base negro/blanco. Precio server-side: chico S/80, mediano S/100, grande S/120 (`PRECIOS_BUILD` en `routes/build.js`; `orders.js` re-fija el precio de items personalizados). Límite 3 generaciones/día por IP (in-memory) + cap global 150/día. Sin `OPENAI_API_KEY` → `/build` muestra "próximamente". Los items custom llevan `id: 'custom-<uuid>'`, `personalizado: true`, `prompt`, `imagen` (Cloudinary folder `rivt-builds`), `color_polo`, `tamano_diseno`. `trust proxy` activado en index.js para que `req.ip` funcione en Railway.
- Base de datos: **MongoDB Atlas** con Mongoose. Los modelos mantienen un campo propio `id` (numérico en productos, UUID en pedidos) además del `_id` de Mongo, con toJSON transform para no romper el contrato del frontend. Counter en colección `counters` para el autoincremental de productos.
- Imágenes: **Cloudinary** (multer memoryStorage + upload_stream, folder `rivt-productos`). Las imágenes viejas `/img/...` siguen sirviéndose estáticas.
- ⚠️ No usar dependencias con módulos nativos (better-sqlite3 no compila en esta máquina — sin Visual Studio Build Tools).

## Git

- Branch principal: `main` (deploya a producción vía Railway)
- No commitear: `server/.env`, `server/database.sqlite` (JSON legacy de lowdb con datos reales), `node_modules`, `client/dist`
- El usuario prefiere revisar cambios en una branch antes de fusionar a `main`
