export const products = [
  {
    id: 1,
    nombre: 'Polo Dodgers "Pride of LA"',
    slug: 'dodgers-pride-of-la',
    precio: 45,
    color: 'Crema / Off-White',
    descripcion: 'Polo de algodón premium con el icónico gráfico vintage "Pride of Los Angeles". Corte unisex relaxed fit, tela 100% algodón peinado 185 gsm. Inspirado en el estilo urbano de Nueva York.',
    detalles: [
      '100% algodón peinado 185 gsm',
      'Corte relaxed fit unisex',
      'Cuello redondo reforzado',
      'Gráfico vintage serigrafiado',
      'Lavado a máquina en frío',
    ],
    tallas: ['S', 'M', 'L', 'XL'],
    stock: 20,
    imagenes: [
      '/img/dodgers-front.webp',
      '/img/dodgers-back.webp',
    ],
    imagenPrincipal: '/img/dodgers-front.webp',
  },
  {
    id: 2,
    nombre: 'Polo LA Dodgers "Cap Logo"',
    slug: 'la-dodgers-cap-logo',
    precio: 45,
    color: 'Blanco / White',
    descripcion: 'Polo con el inconfundible gráfico de la gorra LA en el pecho y el diseño completo en la espalda. Calidad premium, corte moderno.',
    detalles: [
      '100% algodón peinado 185 gsm',
      'Corte relaxed fit unisex',
      'Gráfico frente y espalda',
      'Estampado de alta resolución',
      'Lavado a máquina en frío',
    ],
    tallas: ['S', 'M', 'L', 'XL'],
    stock: 15,
    imagenes: [
      '/img/la-front.webp',
      '/img/la-combo.webp',
      '/img/la-detail.webp',
    ],
    imagenPrincipal: '/img/la-front.webp',
  },
]

export const getProductById = (id) =>
  products.find((p) => p.id === Number(id))

export const getProductBySlug = (slug) =>
  products.find((p) => p.slug === slug)
