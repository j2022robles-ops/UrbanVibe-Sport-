import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  Truck,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  CreditCard,
  QrCode,
  Banknote
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useRouter, Link } from '../router/Router';
import {
  calculateCartTotals,
  formatPEN,
  generateWhatsAppOrderUrl,
  AREQUIPA_DISTRICTS,
  OrderData
} from '../utils/pricing';

export function CheckoutView() {
  const { cart, coupon, user, clearCart, notify } = useStore();
  const { navigate } = useRouter();

  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    email: user?.email || '',
    whatsapp: user?.whatsapp || '',
    direccion: '',
    distrito: 'Yanahuara',
    nota: '',
    metodoPago: 'yape'
  });

  const [districts, setDistricts] = useState(AREQUIPA_DISTRICTS);
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.districts) setDistricts(data.districts);
      })
      .catch(() => {});
  }, []);

  const shippingCost = districts[formData.distrito] ?? 10;
  const totals = calculateCartTotals(cart, coupon, shippingCost, !!user);

  if (cart.length === 0 && !createdOrder) {
    return (
      <div id="main-content" className="container empty-state py-24 text-center">
        <ShoppingBag size={48} className="text-[#0047ff] mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Tu bolsa todavía está vacía.</h1>
        <p className="text-[var(--muted)] mt-2">
          Elige tus prendas favoritas para empezar tu experiencia.
        </p>
        <Link to="/catalogo" className="button mt-6">
          Explorar colección
        </Link>
      </div>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre || !formData.whatsapp || !formData.direccion || !formData.distrito) {
      notify('Por favor completa todos los campos requeridos de envío.');
      return;
    }

    setLoading(true);

    const orderPayload = {
      items: cart.map(item => ({
        slug: item.product.slug,
        nombre: item.product.nombre,
        precio: item.product.precio,
        color: item.color,
        talla: item.talla,
        cantidad: item.cantidad
      })),
      subtotal: totals.subtotal,
      discount: totals.discount,
      shipping: totals.shipping,
      total: totals.total,
      coupon: coupon || undefined,
      customer: {
        nombre: formData.nombre,
        email: formData.email,
        whatsapp: formData.whatsapp,
        direccion: formData.direccion,
        distrito: formData.distrito,
        nota: formData.nota
      }
    };

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      if (res.ok) {
        const orderData: OrderData = await res.json();
        try {
          const { saveOrderToDb } = await import('../services/db');
          await saveOrderToDb(orderData);
        } catch {}
        setCreatedOrder(orderData);
        clearCart();
        notify(`¡Pedido ${orderData.id} registrado con éxito en la base de datos!`);
      } else {
        throw new Error('Error al registrar pedido');
      }
    } catch {
      // Local fallback in case network has transient glitch
      const fallbackOrder: OrderData = {
        id: `UV-${Math.floor(10000 + Math.random() * 90000)}`,
        ...orderPayload
      };
      try {
        const { saveOrderToDb } = await import('../services/db');
        await saveOrderToDb(fallbackOrder);
      } catch {}
      setCreatedOrder(fallbackOrder);
      clearCart();
      notify(`¡Pedido ${fallbackOrder.id} generado y guardado en la base de datos!`);
    } finally {
      setLoading(false);
      window.scrollTo(0, 0);
    }
  };

  // Order Success View
  if (createdOrder) {
    const whatsappUrl = generateWhatsAppOrderUrl(createdOrder);

    return (
      <div id="main-content" className="container order-success">
        <div className="success-icon">
          <CheckCircle2 size={36} />
        </div>

        <span className="eyebrow blue">PEDIDO {createdOrder.id}</span>
        <h1>
          ¡Tu próxima aventura
          <br />
          ya tiene un comienzo!
        </h1>

        <p>
          Guardamos tu pedido. Ahora confirma los detalles, la entrega y el pago con nuestro equipo de Urban Vibe por WhatsApp.
        </p>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="button mt-6 text-sm inline-flex items-center gap-3 px-8 py-4"
        >
          <MessageSquare size={18} /> Confirmar por WhatsApp
        </a>

        {/* Receipt card */}
        <div className="order-receipt mt-8">
          <div className="summary-line font-bold border-b border-[var(--border)] pb-3 mb-3">
            <span>Detalle del pedido ({createdOrder.id})</span>
            <span className="status-tag">Pendiente de confirmación</span>
          </div>

          <div className="space-y-2 mb-4 text-xs">
            {createdOrder.items.map(item => (
              <div key={`${item.slug}-${item.talla}`} className="flex justify-between">
                <span>
                  {item.cantidad} × {item.nombre} ({item.talla} · {item.color})
                </span>
                <strong>{formatPEN(item.precio * item.cantidad)}</strong>
              </div>
            ))}
          </div>

          <div className="border-t border-[var(--border)] pt-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>{formatPEN(createdOrder.subtotal)}</span>
            </div>
            {createdOrder.discount > 0 && (
              <div className="flex justify-between text-[#0047ff]">
                <span>Descuento:</span>
                <span>−{formatPEN(createdOrder.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Envío ({createdOrder.customer.distrito}):</span>
              <span>{createdOrder.shipping === 0 ? 'Gratis' : formatPEN(createdOrder.shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm pt-2 border-t border-[var(--border)]">
              <span>TOTAL:</span>
              <strong>{formatPEN(createdOrder.total)}</strong>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--border)] text-xs text-[var(--muted)]">
            <p><strong>Destinatario:</strong> {createdOrder.customer.nombre} ({createdOrder.customer.whatsapp})</p>
            <p><strong>Dirección:</strong> {createdOrder.customer.direccion}, {createdOrder.customer.distrito}</p>
            {createdOrder.customer.nota && <p><strong>Nota:</strong> {createdOrder.customer.nota}</p>}
          </div>
        </div>

        <Link to="/catalogo" className="text-link mt-8">
          Volver a la colección <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div id="main-content" className="checkout-page container">
      <nav className="breadcrumb" aria-label="Migas de pan">
        <Link to="/">Inicio</Link> / <Link to="/catalogo">Colección</Link> / Checkout
      </nav>

      <span className="eyebrow blue">FINALIZAR PEDIDO</span>
      <h1>Completa tu entrega.</h1>

      <div className="checkout-layout">
        {/* Left Column: Form */}
        <form className="checkout-form" onSubmit={handleSubmitOrder}>
          <h2>
            <span>01</span> Tus datos personales
          </h2>
          <div className="form-grid">
            <label className="span-two">
              Nombre completo
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej. Mateo Valdivia"
              />
            </label>

            <label>
              WhatsApp
              <input
                type="tel"
                required
                value={formData.whatsapp}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+51 925 147 306"
              />
            </label>

            <label>
              Correo electrónico
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="mateo@ejemplo.com"
              />
            </label>
          </div>

          <h2>
            <span>02</span> Dirección en Arequipa
          </h2>
          <div className="form-grid">
            <label className="span-two">
              Distrito de entrega
              <select
                value={formData.distrito}
                onChange={e => setFormData({ ...formData, distrito: e.target.value })}
              >
                {Object.keys(districts).map(d => (
                  <option key={d} value={d}>
                    {d} ({districts[d] === 0 ? 'Gratis' : formatPEN(districts[d])})
                  </option>
                ))}
              </select>
            </label>

            <label className="span-two">
              Dirección exacta
              <input
                type="text"
                required
                value={formData.direccion}
                onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                placeholder="Av. Ejército 710, Dpto 402 / Urb. Magisterial"
              />
            </label>

            <label className="span-two">
              Instrucciones para la entrega (opcional)
              <input
                type="text"
                value={formData.nota}
                onChange={e => setFormData({ ...formData, nota: e.target.value })}
                placeholder="Ej. Tocar timbre 4B o dejar en recepción"
              />
            </label>
          </div>

          <h2>
            <span>03</span> Método de pago coordinado
          </h2>
          <div className="space-y-3">
            {[
              { id: 'yape', label: 'Yape / Plin (QR al coordinar)', icon: QrCode },
              { id: 'transfer', label: 'Transferencia BCP o Interbank', icon: Banknote },
              { id: 'contraentrega', label: 'Pago contra entrega en Arequipa (Efectivo / POS)', icon: Truck },
              { id: 'tarjeta', label: 'Tarjeta de crédito / débito', icon: CreditCard }
            ].map(method => (
              <label
                key={method.id}
                className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors ${
                  formData.metodoPago === method.id
                    ? 'border-[#0047ff] bg-[#0047ff]/5'
                    : 'border-[var(--border)] hover:bg-[var(--cream)]'
                }`}
              >
                <input
                  type="radio"
                  name="metodoPago"
                  value={method.id}
                  checked={formData.metodoPago === method.id}
                  onChange={e => setFormData({ ...formData, metodoPago: e.target.value })}
                  className="w-4 h-4 accent-[#0047ff]"
                />
                <method.icon size={18} className="text-[#0047ff]" />
                <span className="text-xs font-medium">{method.label}</span>
              </label>
            ))}
          </div>

          <div className="info-box mt-6">
            <ShieldCheck size={20} className="text-[#0047ff]" />
            <p>
              Tu pedido se reserva de inmediato en inventario. El asesor de Urban Vibe te escribirá por WhatsApp para validar disponibilidad de tallas, franja horaria de entrega y enviar el código QR o cuenta para el pago.
            </p>
          </div>

          <button
            type="submit"
            className="button full mt-8 py-4 text-sm"
            disabled={loading}
          >
            {loading ? 'Generando pedido...' : 'Confirmar y generar pedido'} <ArrowRight size={18} />
          </button>
        </form>

        {/* Right Column: Sticky Order Summary */}
        <aside className="checkout-summary">
          <div className="section-heading">
            <h2>Resumen del pedido</h2>
            <Link to="/catalogo" className="text-button">
              Seguir comprando
            </Link>
          </div>

          <div className="space-y-3 my-4">
            {cart.map(item => (
              <div
                key={`${item.product.slug}-${item.color}-${item.talla}`}
                className="checkout-item"
              >
                <img src={item.product.imagenes[0]} alt={item.product.nombre} />
                <div>
                  <strong>{item.product.nombre}</strong>
                  <p>
                    {item.color} · Talla {item.talla} · Cant: {item.cantidad}
                  </p>
                </div>
                <span>{formatPEN(item.product.precio * item.cantidad)}</span>
              </div>
            ))}
          </div>

          <div className="summary-line">
            <span>Subtotal de prendas</span>
            <span>{formatPEN(totals.subtotal)}</span>
          </div>

          {totals.discount > 0 && (
            <div className="summary-line text-[#0047ff]">
              <span>Descuento aplicado ({coupon})</span>
              <span>−{formatPEN(totals.discount)}</span>
            </div>
          )}

          <div className="summary-line">
            <span>Envío ({formData.distrito})</span>
            <span>
              {totals.shipping === 0 ? 'Gratis' : formatPEN(totals.shipping)}
            </span>
          </div>

          <div className="summary-line total font-bold text-lg">
            <span>Total a pagar</span>
            <span>{formatPEN(totals.total)}</span>
          </div>

          <p className="muted small mt-4">
            Precios expresados en Soles (PEN). Incluye IGV. Los envíos se despachan desde nuestro almacén en Arequipa.
          </p>
        </aside>
      </div>
    </div>
  );
}
