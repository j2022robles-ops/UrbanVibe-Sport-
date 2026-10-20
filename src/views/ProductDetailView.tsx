import React, { useState } from 'react';
import {
  Heart,
  ShoppingBag,
  Truck,
  Feather,
  Check,
  ChevronDown,
  ArrowUpRight,
  Ruler,
  MessageSquare
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { useRouter, Link } from '../router/Router';
import { ProductCard } from '../components/ProductCard';
import { formatPEN, WHATSAPP_PHONE } from '../utils/pricing';

export function ProductDetailView() {
  const { params } = useRouter();
  const slug = params.slug;
  const {
    products,
    addToCart,
    favorites,
    toggleFavorite,
    setSizeGuideOpen,
    notify
  } = useStore();

  const product = products.find(p => p.slug === slug);

  const [selectedColor, setSelectedColor] = useState(
    product?.colores[0] || 'Crudo'
  );
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);

  if (!product) {
    return (
      <div className="container empty-state py-20">
        <h2>Prenda no encontrada</h2>
        <p>No pudimos encontrar la prenda solicitada en la colección ALTURA 2335.</p>
        <Link to="/catalogo" className="button mt-4">
          Volver a la colección
        </Link>
      </div>
    );
  }

  const isFavorite = favorites.includes(product.slug);
  const isSoldOut = product.stock <= 0;

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    addToCart(product, selectedColor, selectedSize, quantity);
    notify(`Se añadió ${quantity} × ${product.nombre} (${selectedSize}) a tu bolsa.`);
  };

  const relatedProducts = products
    .filter(p => p.slug !== product.slug && (p.linea === product.linea || p.publico === product.publico))
    .slice(0, 3);

  const whatsappHref = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    `¡Hola! Me interesa ${product.nombre}${selectedSize ? ` en talla ${selectedSize}` : ''}. ¿Me ayudan con mi pedido?`
  )}`;

  return (
    <div id="main-content" className="product-page">
      <div className="container">
        <nav className="breadcrumb" aria-label="Migas de pan">
          <Link to="/">Inicio</Link> / <Link to={`/catalogo?linea=${product.linea}`}>{product.linea}</Link> / {product.nombre}
        </nav>

        <div className="product-detail">
          {/* Photo gallery showcase */}
          <div className="detail-photo">
            <span className="eyebrow">
              ALTURA 2335 / {product.linea.toUpperCase()}
            </span>
            <img
              src={product.imagenes[0]}
              alt={product.nombre}
              loading="eager"
            />
            <span className="detail-photo-label">
              FIBRAS PERUANAS. ESPÍRITU IMPARABLE.
            </span>
          </div>

          {/* Product Info */}
          <div className="detail-info">
            <span className="eyebrow blue">
              {product.linea.toUpperCase()} / {product.publico.toUpperCase()}
            </span>

            <h1>{product.nombre}</h1>
            <div className="detail-price">
              <strong>{formatPEN(product.precio)}</strong>
            </div>

            <p className="detail-description">{product.descripcion}</p>

            <form onSubmit={handleAddToCart}>
              {/* Color Selection */}
              <div className="selection-heading">
                <span>Color: {selectedColor}</span>
              </div>
              <div className="options">
                {product.colores.map(col => (
                  <button
                    key={col}
                    type="button"
                    className={selectedColor === col ? 'selected' : ''}
                    onClick={() => setSelectedColor(col)}
                  >
                    <span
                      className={`color-dot color-${col
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')}`}
                    />
                    {col}
                  </button>
                ))}
              </div>

              {/* Size Selection */}
              <div className="selection-heading">
                <span>Selecciona tu talla</span>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[var(--muted)] text-xs underline"
                  onClick={() => setSizeGuideOpen(true)}
                >
                  <Ruler size={13} /> Guía de tallas
                </button>
              </div>

              <div className="options size-selector">
                {product.tallas.map(talla => (
                  <button
                    key={talla}
                    type="button"
                    aria-pressed={selectedSize === talla}
                    className={selectedSize === talla ? 'selected' : ''}
                    onClick={() => {
                      setSelectedSize(talla);
                      setSizeError(false);
                    }}
                  >
                    {talla}
                  </button>
                ))}
              </div>

              {sizeError && (
                <p className="error mt-2 font-medium">
                  Selecciona una talla para continuar.
                </p>
              )}

              {/* Stock Indicator */}
              <div className="stock">
                {isSoldOut ? (
                  <span className="text-red-600 font-semibold">● Agotado temporalmente</span>
                ) : (
                  <span>● {product.stock} unidades disponibles</span>
                )}
              </div>

              {/* Quantity and Add to Bag */}
              <div className="add-row">
                <label htmlFor="prod-qty" className="sr-only">Cantidad</label>
                <input
                  id="prod-qty"
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  aria-label="Cantidad"
                />

                <button
                  type="submit"
                  className="button"
                  disabled={isSoldOut}
                >
                  <ShoppingBag size={18} />
                  <span>Añadir a mi bolsa</span>
                </button>

                <button
                  type="button"
                  className={`icon-button favorite-detail ${isFavorite ? 'saved' : ''}`}
                  aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                  onClick={() => toggleFavorite(product.slug)}
                >
                  <Heart size={20} className={isFavorite ? 'fill-current text-[#0047ff]' : ''} />
                </button>
              </div>
            </form>

            {/* Perks */}
            <div className="detail-perks">
              <p>
                <Truck size={17} /> Envío gratis desde S/ 299 en prendas.
              </p>
              <p>
                <Feather size={17} /> Diseñada con fibras de origen peruano ({product.composicion}).
              </p>
              <p>
                <Check size={17} /> Asesoría de talla antes de confirmar tu pedido.
              </p>
            </div>

            {/* Details and Accordions */}
            <details open>
              <summary>Composición y cuidado</summary>
              <p>
                {product.composicion}. Revisa la etiqueta de la prenda y nuestra{' '}
                <Link to="/cuidado" className="underline">guía de cuidado</Link> antes del primer lavado.
              </p>
            </details>

            <details>
              <summary>Envíos y cambios</summary>
              <p>
                Despacho en Arequipa de 24 a 48 horas en distritos urbanos. Cambios de talla sin costo de gestión si la prenda se conserva en estado nuevo. Conoce más en nuestra sección de{' '}
                <Link to="/envios" className="underline">envíos y cambios</Link>.
              </p>
            </details>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="text-link inline-flex items-center gap-2 mt-4"
            >
              <MessageSquare size={16} /> Necesito ayuda para elegir <ArrowUpRight size={14} />
            </a>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="section">
            <div className="section-heading">
              <div>
                <span className="eyebrow blue">SIGUE EXPLORANDO</span>
                <h2>Juntos, llegan más lejos.</h2>
              </div>
            </div>

            <div className="product-grid">
              {relatedProducts.map(p => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
