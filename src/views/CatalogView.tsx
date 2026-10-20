import React from 'react';
import { Search, Filter, RefreshCw, Heart } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useRouter, Link } from '../router/Router';
import { ProductCard } from '../components/ProductCard';

export function CatalogView({ favoritesOnly = false }: { favoritesOnly?: boolean }) {
  const { products, favorites } = useStore();
  const { search, navigate } = useRouter();

  const searchParams = new URLSearchParams(search);
  const activeLine = searchParams.get('linea') || '';
  const activeAudience = searchParams.get('publico') || '';
  const searchQuery = searchParams.get('q') || '';
  const activeSize = searchParams.get('talla') || '';
  const maxPrice = searchParams.get('precio') || '';
  const sortOrder = searchParams.get('orden') || 'coleccion';

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(search);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const queryString = params.toString();
    navigate(queryString ? `/catalogo?${queryString}` : '/catalogo');
  };

  const clearAllFilters = () => {
    navigate(favoritesOnly ? '/favoritos' : '/catalogo');
  };

  const filteredProducts = products
    .filter(p => {
      if (favoritesOnly && !favorites.includes(p.slug)) return false;

      // Filter by Line
      if (activeLine) {
        if (activeLine === 'Accesorios') {
          const accessoriesSlugs = ['gorro-beanie', 'cuello-termico', 'medias-pack'];
          if (!accessoriesSlugs.includes(p.slug)) return false;
        } else if (p.linea.toLowerCase() !== activeLine.toLowerCase()) {
          return false;
        }
      }

      // Filter by Publico (Audience)
      if (activeAudience) {
        if (p.publico !== activeAudience && p.publico !== 'Unisex') return false;
      }

      // Filter by Size
      if (activeSize && !p.tallas.includes(activeSize)) return false;

      // Filter by Max Price
      if (maxPrice && p.precio > Number(maxPrice)) return false;

      // Filter by Search Query
      if (searchQuery) {
        const fullText = `${p.nombre} ${p.composicion} ${p.linea} ${p.publico} ${p.descripcion}`.toLowerCase();
        if (!fullText.includes(searchQuery.toLowerCase())) return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortOrder === 'precio-asc') return a.precio - b.precio;
      if (sortOrder === 'precio-desc') return b.precio - a.precio;
      if (sortOrder === 'nombre') return a.nombre.localeCompare(b.nombre);
      return 0; // Default catalog order
    });

  const categories = ['', 'Running', 'Training', 'Altura', 'Accesorios'];

  return (
    <div id="main-content">
      <div className="page-banner">
        <div className="container">
          <nav className="breadcrumb" aria-label="Migas de pan">
            <Link to="/">Inicio</Link> / {favoritesOnly ? 'Favoritos' : 'Colección'}
          </nav>

          <span className="eyebrow blue">ALTURA 2335 · FIBRAS PERUANAS</span>
          <h1>{favoritesOnly ? 'Tus favoritos.' : 'Tu próxima aventura, vestida.'}</h1>
          <p>
            {favoritesOnly
              ? 'Las prendas que guardaste para inspirarte y dar el siguiente paso.'
              : '14 prendas. Tres líneas. La misma energía para seguir subiendo.'}
          </p>
        </div>
      </div>

      <section className="container catalog-section">
        {/* Category Tabs */}
        {!favoritesOnly && (
          <div className="catalog-tabs">
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                className={activeLine.toLowerCase() === cat.toLowerCase() ? 'selected' : ''}
                onClick={() => updateParam('linea', cat)}
              >
                {cat || 'Toda la colección'}
              </button>
            ))}
          </div>
        )}

        {/* Filters and search */}
        <div className="filters">
          <span className="filter-label">
            <Filter size={15} /> Filtrar:
          </span>

          <label>
            <span className="sr-only">Filtrar por género</span>
            <select
              value={activeAudience}
              onChange={e => updateParam('publico', e.target.value)}
            >
              <option value="">Género: Todos</option>
              <option value="Hombre">Hombre</option>
              <option value="Mujer">Mujer</option>
              <option value="Unisex">Unisex</option>
            </select>
          </label>

          <label>
            <span className="sr-only">Filtrar por talla</span>
            <select
              value={activeSize}
              onChange={e => updateParam('talla', e.target.value)}
            >
              <option value="">Talla: Todas</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
            </select>
          </label>

          <label>
            <span className="sr-only">Filtrar por precio</span>
            <select
              value={maxPrice}
              onChange={e => updateParam('precio', e.target.value)}
            >
              <option value="">Precio: Cualquier</option>
              <option value="90">Hasta S/ 90</option>
              <option value="150">Hasta S/ 150</option>
              <option value="200">Hasta S/ 200</option>
              <option value="300">Hasta S/ 300</option>
            </select>
          </label>

          <div className="catalog-search">
            <Search size={16} className="text-[var(--muted)]" />
            <input
              type="search"
              placeholder="Buscar prendas..."
              value={searchQuery}
              onChange={e => updateParam('q', e.target.value)}
              aria-label="Buscar prendas"
            />
          </div>
        </div>

        {/* Active filter badges & Sort bar */}
        <div className="results-bar">
          <div>
            <span>
              Mostrando {filteredProducts.length} prenda
              {filteredProducts.length === 1 ? '' : 's'}
            </span>
            {(activeLine || activeAudience || activeSize || maxPrice || searchQuery) && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="ml-3 text-[#0047ff] hover:underline inline-flex items-center gap-1 text-xs"
              >
                <RefreshCw size={12} /> Limpiar filtros
              </button>
            )}
          </div>

          <label className="flex items-center gap-2">
            <span>Ordenar por:</span>
            <select
              value={sortOrder}
              onChange={e => updateParam('orden', e.target.value)}
            >
              <option value="coleccion">Orden de la colección</option>
              <option value="precio-asc">Precio: de menor a mayor</option>
              <option value="precio-desc">Precio: de mayor a menor</option>
              <option value="nombre">Nombre (A–Z)</option>
            </select>
          </label>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            {favoritesOnly ? (
              <>
                <Heart size={44} className="text-[#0047ff]" />
                <h2>Aún no tienes prendas en favoritos.</h2>
                <p>Explora la colección ALTURA 2335 y toca el corazón para guardar lo que te inspira.</p>
                <Link to="/catalogo" className="button mt-3">
                  Ver colección
                </Link>
              </>
            ) : (
              <>
                <Search size={44} className="text-[#0047ff]" />
                <h2>No se encontraron prendas.</h2>
                <p>Intenta ajustar los filtros de línea, talla, género o término de búsqueda.</p>
                <button type="button" onClick={clearAllFilters} className="button mt-3">
                  Restablecer filtros
                </button>
              </>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
