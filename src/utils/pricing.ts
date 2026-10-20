export interface CartProduct {
  slug: string;
  nombre: string;
  linea: string;
  composicion: string;
  publico: string;
  precio: number;
  stock: number;
  colores: string[];
  tallas: string[];
  descripcion: string;
  imagenes: string[];
  etiquetas: string[];
}

export interface CartItem {
  product: CartProduct;
  color: string;
  talla: string;
  cantidad: number;
}

export interface CustomerData {
  nombre: string;
  email: string;
  whatsapp: string;
  direccion: string;
  distrito: string;
  nota?: string;
}

export interface OrderData {
  id: string;
  items: {
    slug: string;
    nombre: string;
    precio: number;
    color: string;
    talla: string;
    cantidad: number;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon?: string;
  customer: CustomerData;
  estado?: 'Pendiente' | 'Confirmado' | 'En camino' | 'Entregado';
  createdAt?: string;
}

export const AREQUIPA_DISTRICTS: Record<string, number> = {
  "Arequipa Cercado": 8,
  "Cayma": 10,
  "Yanahuara": 8,
  "José Luis Bustamante y Rivero": 10,
  "Cerro Colorado": 12,
  "Paucarpata": 12,
  "Socabaya": 12,
  "Sachaca": 12,
  "Sabandía": 15,
  "Otro distrito de Arequipa": 18
};

export const FREE_SHIPPING_THRESHOLD = 299;
export const WHATSAPP_PHONE = '51925147306';

export function formatPEN(amount: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2
  }).format(amount);
}

export function calculateCartTotals(
  items: CartItem[],
  couponCode = '',
  shippingCost = 0,
  isUserLoggedIn = false
) {
  const subtotal = items.reduce(
    (acc, item) => acc + item.product.precio * item.cantidad,
    0
  );

  const hasThreeLayers = ['polo-misti', 'hoodie-heavyweight', 'casaca-cortaviento'].every(
    (slug) => items.some((item) => item.product.slug === slug)
  );

  let discountRate = 0;
  const normalizedCoupon = (couponCode || '').trim().toUpperCase();

  if (normalizedCoupon === 'CLUB20' && isUserLoggedIn) {
    discountRate = 0.20;
  } else if (normalizedCoupon === 'ALTURA10') {
    discountRate = 0.10;
  } else if (normalizedCoupon === 'CAPAS10' && hasThreeLayers) {
    discountRate = 0.10;
  }

  const discount = Math.round(subtotal * discountRate * 100) / 100;
  const netAmount = subtotal - discount;
  const shipping = netAmount >= FREE_SHIPPING_THRESHOLD ? 0 : shippingCost;
  const total = Math.round((netAmount + shipping) * 100) / 100;

  return {
    subtotal,
    discount,
    shipping,
    total,
    freeShippingQualified: netAmount >= FREE_SHIPPING_THRESHOLD,
    amountToFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - netAmount)
  };
}

export function generateWhatsAppOrderUrl(order: OrderData): string {
  const message = [
    `¡Hola, Urban Vibe! Quiero confirmar mi pedido ${order.id}.`,
    '',
    ...order.items.map(
      (item) =>
        `${item.cantidad} × ${item.nombre} · ${item.talla} · ${item.color} · ${formatPEN(
          item.precio * item.cantidad
        )}`
    ),
    '',
    `Subtotal: ${formatPEN(order.subtotal)}`,
    `Descuento: ${formatPEN(order.discount)}`,
    `Envío: ${formatPEN(order.shipping)}`,
    `TOTAL: ${formatPEN(order.total)}`,
    '',
    order.customer.nombre,
    order.customer.whatsapp,
    `${order.customer.direccion}, ${order.customer.distrito}`,
    order.customer.nota || '',
    '',
    'Pendiente de confirmar disponibilidad, entrega y pago.'
  ].join('\n');

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
