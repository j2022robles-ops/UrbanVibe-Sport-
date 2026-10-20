import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  formatPEN,
  generateWhatsAppOrderUrl,
  type CartItem
} from './pricing.ts';

const mockProductA = {
  slug: 'polo-misti',
  nombre: 'Polo manga larga Misti',
  linea: 'Running',
  composicion: '70% pima',
  publico: 'Unisex',
  precio: 129,
  stock: 24,
  colores: ['Crudo'],
  tallas: ['M'],
  descripcion: 'Desc',
  imagenes: ['/products/01.webp'],
  etiquetas: []
};

const mockProductB = {
  slug: 'hoodie-heavyweight',
  nombre: 'Hoodie heavyweight',
  linea: 'Training',
  composicion: '100% pima',
  publico: 'Unisex',
  precio: 189,
  stock: 24,
  colores: ['Carbón'],
  tallas: ['M'],
  descripcion: 'Desc',
  imagenes: ['/products/07.webp'],
  etiquetas: []
};

const mockProductC = {
  slug: 'casaca-cortaviento',
  nombre: 'Casaca cortaviento',
  linea: 'Altura',
  composicion: 'Nylon',
  publico: 'Unisex',
  precio: 289,
  stock: 24,
  colores: ['Crudo'],
  tallas: ['M'],
  descripcion: 'Desc',
  imagenes: ['/products/11.webp'],
  etiquetas: []
};

test('formatPEN formats currency as Peruvian Soles', () => {
  const formatted = formatPEN(129);
  assert.ok(formatted.includes('129') || formatted.includes('S/'));
});

test('calculateCartTotals calculates standard total with district shipping below free threshold', () => {
  const items: CartItem[] = [
    { product: mockProductA, color: 'Crudo', talla: 'M', cantidad: 1 }
  ];
  const res = calculateCartTotals(items, '', 10, false);
  assert.equal(res.subtotal, 129);
  assert.equal(res.discount, 0);
  assert.equal(res.shipping, 10);
  assert.equal(res.total, 139);
  assert.equal(res.freeShippingQualified, false);
  assert.equal(res.amountToFreeShipping, 170);
});

test('calculateCartTotals applies free shipping when net subtotal exceeds 299', () => {
  const items: CartItem[] = [
    { product: mockProductC, color: 'Crudo', talla: 'M', cantidad: 1 },
    { product: mockProductA, color: 'Crudo', talla: 'M', cantidad: 1 }
  ];
  // 289 + 129 = 418
  const res = calculateCartTotals(items, '', 12, false);
  assert.equal(res.subtotal, 418);
  assert.equal(res.shipping, 0);
  assert.equal(res.total, 418);
  assert.equal(res.freeShippingQualified, true);
  assert.equal(res.amountToFreeShipping, 0);
});

test('calculateCartTotals applies ALTURA10 coupon discount', () => {
  const items: CartItem[] = [
    { product: mockProductB, color: 'Carbón', talla: 'M', cantidad: 1 }
  ]; // 189
  const res = calculateCartTotals(items, 'ALTURA10', 8, false);
  assert.equal(res.subtotal, 189);
  assert.equal(res.discount, 18.9);
  assert.equal(res.shipping, 8);
  assert.equal(res.total, 178.1);
});

test('calculateCartTotals applies CLUB20 for authenticated club members', () => {
  const items: CartItem[] = [
    { product: mockProductA, color: 'Crudo', talla: 'M', cantidad: 1 }
  ]; // 129
  const res = calculateCartTotals(items, 'CLUB20', 8, true);
  assert.equal(res.subtotal, 129);
  assert.equal(res.discount, 25.8);
});

test('calculateCartTotals applies CAPAS10 only when all 3 layers are present', () => {
  const threeLayers: CartItem[] = [
    { product: mockProductA, color: 'Crudo', talla: 'M', cantidad: 1 },
    { product: mockProductB, color: 'Carbón', talla: 'M', cantidad: 1 },
    { product: mockProductC, color: 'Crudo', talla: 'M', cantidad: 1 }
  ]; // 129 + 189 + 289 = 607
  const res = calculateCartTotals(threeLayers, 'CAPAS10', 10, false);
  assert.equal(res.subtotal, 607);
  assert.equal(res.discount, 60.7);
  assert.equal(res.shipping, 0); // 607 - 60.7 = 546.3 >= 299
  assert.equal(res.total, 546.3);

  // Without casaca:
  const twoLayers = [threeLayers[0], threeLayers[1]];
  const resTwo = calculateCartTotals(twoLayers, 'CAPAS10', 10, false);
  assert.equal(resTwo.discount, 0);
});

test('generateWhatsAppOrderUrl builds valid wa.me link with order details', () => {
  const url = generateWhatsAppOrderUrl({
    id: 'UV-98214',
    items: [
      {
        slug: 'polo-misti',
        nombre: 'Polo manga larga Misti',
        precio: 129,
        color: 'Crudo',
        talla: 'M',
        cantidad: 1
      }
    ],
    subtotal: 129,
    discount: 0,
    shipping: 8,
    total: 137,
    customer: {
      nombre: 'Renato Salas',
      whatsapp: '+51954123456',
      email: 'renato@example.com',
      direccion: 'Calle Los Arces 204',
      distrito: 'Yanahuara',
      nota: 'Tocar timbre 2'
    }
  });

  assert.ok(url.startsWith('https://wa.me/51925147306?text='));
  assert.ok(url.includes('UV-98214'));
  assert.ok(url.includes('Yanahuara'));
});
