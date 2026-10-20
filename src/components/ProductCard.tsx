import React from 'react';
import { Heart, ArrowUpRight } from 'lucide-react';
import { CartProduct, formatPEN } from '../utils/pricing';
import { Link } from '../router/Router';
import { useStore } from '../store/useStore';

export function ProductCard({ product }: { product: CartProduct }) {
  const { favorites, toggleFavorite, addToCart } = useStore();
  const isFavorite = favorites.includes(product.slug);
  const isSoldOut = product.stock <= 0;

  const colorClass = product.colores[0]
    ? `color-${product.colores[0].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')}`
    : '';

  return (
    <article className="product-item">
      <div className="product-photo">
        <Link to={`/producto/${product.slug}`} aria-label={`Ver ${product.nombre}`}>
          <img
            src={product.imagenes[0]}
            alt={product.nombre}
            loading="lazy"
            width="240"
            height="270"
          />
        </Link>

        {product.etiquetas && product.etiquetas[0] && (
          <span className="product-tag">{product.etiquetas[0]}</span>
        )}

        <button
          type="button"
          className={`favorite-button ${isFavorite ? 'saved' : ''}`}
          aria-label={isFavorite ? `Quitar ${product.nombre} de favoritos` : `Guardar ${product.nombre} en favoritos`}
          onClick={() => toggleFavorite(product.slug)}
        >
          <Heart size={16} className={isFavorite ? 'fill-current text-[#0047ff]' : ''} />
        </button>

        {isSoldOut ? (
          <span className="sold-out">Agotado</span>
        ) : (
          <Link to={`/producto/${product.slug}`} className="card-shop">
            <span>Ver prenda</span>
            <ArrowUpRight size={14} />
          </Link>
        )}
      </div>

      <div className="product-meta">
        <span className="eyebrow">
          {product.linea.toUpperCase()}
          <span>/</span>
          {product.publico.toUpperCase()}
        </span>

        <h3>
          <Link to={`/producto/${product.slug}`}>{product.nombre}</Link>
        </h3>

        <p>{product.composicion}</p>

        <div className="product-bottom">
          <strong>{formatPEN(product.precio)}</strong>
          {product.colores[0] && (
            <span
              className={`color-dot ${colorClass}`}
              title={`Color: ${product.colores[0]}`}
            />
          )}
        </div>
      </div>
    </article>
  );
}
