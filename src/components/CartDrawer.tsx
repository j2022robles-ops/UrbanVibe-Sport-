import React, { useState } from 'react';
import { X, Truck, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { calculateCartTotals, formatPEN, FREE_SHIPPING_THRESHOLD } from '../utils/pricing';
import { useRouter, Link } from '../router/Router';

export function CartDrawer() {
  const {
    cartOpen,
    setCartOpen,
    cart,
    removeFromCart,
    updateQuantity,
    coupon,
    setCoupon,
    user,
    notify
  } = useStore();

  const { navigate } = useRouter();
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  if (!cartOpen) return null;

  const totalCount = cart.reduce((acc, item) => acc + item.cantidad, 0);
  const totals = calculateCartTotals(cart, coupon, 0, !!user);

  const progressPercent = Math.min(100, Math.round((totals.subtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponInput.trim().toUpperCase();
    if (!code) return;

    if (code === 'CLUB20') {
      if (!user) {
        setCouponError('CLUB20 es exclusivo para miembros. Inicia sesión para usarlo.');
        return;
      }
      setCoupon('CLUB20');
      notify('Cupón CLUB20 aplicado: 20 % de descuento.');
      setCouponInput('');
    } else if (code === 'ALTURA10') {
      setCoupon('ALTURA10');
      notify('Cupón ALTURA10 aplicado: 10 % de descuento.');
      setCouponInput('');
    } else if (code === 'CAPAS10') {
      const hasThree = ['polo-misti', 'hoodie-heavyweight', 'casaca-cortaviento'].every(slug =>
        cart.some(i => i.product.slug === slug)
      );
      if (!hasThree) {
        setCouponError('CAPAS10 requiere incluir las 3 capas: Polo Misti, Hoodie y Casaca.');
        return;
      }
      setCoupon('CAPAS10');
      notify('Cupón CAPAS10 aplicado: 10 % en el conjunto de 3 capas.');
      setCouponInput('');
    } else {
      setCouponError('Código no válido. Prueba con ALTURA10 o CAPAS10.');
    }
  };

  const handleProceedToCheckout = () => {
    setCartOpen(false);
    navigate('/checkout');
  };

  return (
    <div
      className="modal-backdrop is-side"
      onClick={() => setCartOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Carrito de compras"
    >
      <aside className="modal drawer" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Tu bolsa ({totalCount})</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Cerrar bolsa"
            onClick={() => setCartOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="empty-state">
            <X size={40} className="text-gray-400" />
            <h3>Tu bolsa todavía está vacía.</h3>
            <p>Elige tus prendas favoritas para empezar tu ruta.</p>
            <button
              type="button"
              className="button mt-4"
              onClick={() => {
                setCartOpen(false);
                navigate('/catalogo');
              }}
            >
              Explorar colección
            </button>
          </div>
        ) : (
          <>
            {/* Shipping progress bar */}
            <div className="shipping-progress">
              <p>
                <Truck size={17} />
                {totals.freeShippingQualified ? (
                  <span>¡Calificas para <strong>envío gratis</strong> en Arequipa!</span>
                ) : (
                  <span>
                    Te faltan <strong>{formatPEN(totals.amountToFreeShipping)}</strong> para el envío gratis.
                  </span>
                )}
              </p>
              <div>
                <span style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* Cart items */}
            <div className="cart-items">
              {cart.map((item) => (
                <article
                  key={`${item.product.slug}-${item.color}-${item.talla}`}
                  className="cart-item"
                >
                  <Link
                    to={`/producto/${item.product.slug}`}
                    onClick={() => setCartOpen(false)}
                  >
                    <img src={item.product.imagenes[0]} alt={item.product.nombre} />
                  </Link>

                  <div>
                    <Link
                      to={`/producto/${item.product.slug}`}
                      onClick={() => setCartOpen(false)}
                    >
                      <h3>{item.product.nombre}</h3>
                    </Link>
                    <p>
                      {item.color} / Talla {item.talla}
                    </p>
                    <strong>{formatPEN(item.product.precio)}</strong>

                    <div className="quantity">
                      <button
                        type="button"
                        aria-label={`Reducir ${item.product.nombre}`}
                        onClick={() =>
                          updateQuantity(item.product.slug, item.color, item.talla, -1)
                        }
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.cantidad}</span>
                      <button
                        type="button"
                        aria-label={`Aumentar ${item.product.nombre}`}
                        onClick={() =>
                          updateQuantity(item.product.slug, item.color, item.talla, 1)
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="icon-button remove-item"
                    aria-label={`Eliminar ${item.product.nombre}`}
                    onClick={() =>
                      removeFromCart(item.product.slug, item.color, item.talla)
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </article>
              ))}
            </div>

            {/* Cart summary & coupon */}
            <div className="cart-summary">
              {coupon ? (
                <div className="coupon-applied">
                  <span>Cupón aplicado: <strong>{coupon}</strong></span>
                  <button type="button" onClick={() => setCoupon('')}>
                    Quitar
                  </button>
                </div>
              ) : (
                <form className="inline-input" onSubmit={handleApplyCoupon}>
                  <input
                    aria-label="Código de descuento"
                    placeholder="Código de descuento (ej. ALTURA10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                  <button type="submit" className="button button-outline">
                    Aplicar
                  </button>
                </form>
              )}

              {couponError && <p className="error mt-1">{couponError}</p>}

              <div className="summary-line">
                <span>Subtotal</span>
                <span>{formatPEN(totals.subtotal)}</span>
              </div>

              {totals.discount > 0 && (
                <div className="summary-line discount">
                  <span>Descuento ({coupon})</span>
                  <span>−{formatPEN(totals.discount)}</span>
                </div>
              )}

              <div className="summary-line total">
                <span>Total de prendas</span>
                <strong>{formatPEN(totals.subtotal - totals.discount)}</strong>
              </div>

              <p className="muted small">
                El costo de envío se calcula según tu distrito de Arequipa al continuar.
              </p>

              <button
                type="button"
                className="button full"
                onClick={handleProceedToCheckout}
              >
                Continuar con mi pedido <ArrowRight size={17} />
              </button>

              <button
                type="button"
                className="text-button full"
                onClick={() => setCartOpen(false)}
              >
                Seguir explorando
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
