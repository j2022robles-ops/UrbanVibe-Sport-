import React, { useState } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useRouter, Link } from '../router/Router';
import { formatPEN } from '../utils/pricing';

export function SearchModal() {
  const { searchOpen, setSearchOpen, products } = useStore();
  const { navigate } = useRouter();
  const [query, setQuery] = useState('');

  if (!searchOpen) return null;

  const filteredProducts = query.trim()
    ? products.filter(
        p =>
          p.nombre.toLowerCase().includes(query.toLowerCase()) ||
          p.linea.toLowerCase().includes(query.toLowerCase()) ||
          p.composicion.toLowerCase().includes(query.toLowerCase()) ||
          p.descripcion.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchOpen(false);
      navigate(`/catalogo?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onClick={() => setSearchOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Buscar prendas"
    >
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Encuentra tu próxima prenda</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Cerrar búsqueda"
            onClick={() => setSearchOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <form className="search-form" onSubmit={handleSearchSubmit}>
          <label htmlFor="search-input">Buscar por prenda, fibra o línea</label>
          <div className="inline-input">
            <input
              id="search-input"
              type="search"
              placeholder="Ej. Alpaca, Polo Misti, Running, Hoodie..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            <button type="submit" className="button">
              Buscar <Search size={16} />
            </button>
          </div>
        </form>

        {query.trim() && (
          <div className="mt-6 border-t border-[var(--border)] pt-4">
            <p className="small muted mb-3">
              {filteredProducts.length} resultado{filteredProducts.length === 1 ? '' : 's'} para "{query}"
            </p>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {filteredProducts.map(p => (
                <Link
                  key={p.slug}
                  to={`/producto/${p.slug}`}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-3 p-2 hover:bg-[var(--cream)] transition-colors"
                >
                  <img src={p.imagenes[0]} alt={p.nombre} className="w-12 h-14 object-cover" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{p.nombre}</h4>
                    <span className="text-xs text-[var(--muted)]">{p.linea} · {p.composicion}</span>
                  </div>
                  <strong className="text-sm">{formatPEN(p.precio)}</strong>
                </Link>
              ))}
              {filteredProducts.length === 0 && (
                <p className="text-sm text-[var(--muted)] py-4 text-center">
                  No encontramos prendas con ese criterio. Prueba con "Misti", "Alpaca" o "Running".
                </p>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-[var(--border)] flex flex-wrap gap-2 text-xs">
          <span className="text-[var(--muted)]">Búsquedas populares:</span>
          {['Running', 'Baby alpaca', 'Algodón pima', 'Training', 'Hoodie'].map(term => (
            <button
              key={term}
              type="button"
              className="text-[#0047ff] hover:underline"
              onClick={() => {
                setQuery(term);
              }}
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
