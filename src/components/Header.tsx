import React, { useState } from 'react';
import { Mountain, Search, Heart, UserRound, ShoppingBag, Menu, X, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link, useRouter } from '../router/Router';
import { useStore } from '../store/useStore';

export function Header() {
  const { path } = useRouter();
  const { cart, favorites, user, setCartOpen, setSearchOpen } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.cantidad, 0);

  const navLinks = [
    { label: 'Colección', href: '/catalogo' },
    { label: 'Hombre', href: '/catalogo?publico=Hombre' },
    { label: 'Mujer', href: '/catalogo?publico=Mujer' },
    { label: 'Lookbook', href: '/lookbook' },
    { label: 'Run Club', href: '/run-club' }
  ];

  return (
    <>
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>

      {/* Announcement Bar */}
      <aside className="announcement" aria-label="Aviso de la tienda">
        HECHO PARA LA ALTURA. HECHO PARA TI.
        <span>
          Envío gratis desde S/ 299 <ArrowRight size={12} />
        </span>
      </aside>

      {/* Site Header */}
      <header className="site-header">
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="Urban Vibe Sport, inicio">
            <span className="logo-mark">
              <Mountain size={25} strokeWidth={2.7} />
            </span>
            <span className="logo-name">
              URBAN VIBE
              <small>SPORT · AREQUIPA</small>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="Navegación principal">
            {navLinks.map((link) => {
              const isActive = path === link.href || (link.href !== '/catalogo' && path.startsWith(link.href));
              return (
                <Link
                  key={link.label}
                  to={link.href}
                  className={isActive ? 'active' : ''}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="icon-button"
              aria-label="Buscar productos"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={21} />
            </button>

            <Link
              to="/favoritos"
              className="icon-button favorite-header"
              aria-label="Mis favoritos"
            >
              <Heart size={21} className={favorites.length > 0 ? 'fill-current text-[#0047ff]' : ''} />
            </Link>

            <Link
              to="/cuenta"
              className="icon-button account-header"
              aria-label={user ? `Mi cuenta (${user.nombre})` : 'Iniciar sesión'}
            >
              <UserRound size={21} />
            </Link>

            <button
              type="button"
              className="icon-button bag-button"
              aria-label="Abrir carrito"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingBag size={21} />
              <span className="bag-count">{cartCount}</span>
            </button>

            <button
              type="button"
              className="icon-button mobile-toggle"
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="modal-backdrop is-side" onClick={() => setMobileMenuOpen(false)}>
          <div className="modal drawer" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Explora Urban Vibe</h2>
              <button
                type="button"
                className="icon-button"
                aria-label="Cerrar menú"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <nav className="mobile-nav">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                  <ArrowRight size={18} />
                </Link>
              ))}
              <Link
                to="/favoritos"
                onClick={() => setMobileMenuOpen(false)}
              >
                Favoritos ({favorites.length})
                <ArrowRight size={18} />
              </Link>
              <Link
                to="/cuenta"
                onClick={() => setMobileMenuOpen(false)}
              >
                {user ? `Mi cuenta (${user.nombre})` : 'Iniciar sesión'}
                <ArrowRight size={18} />
              </Link>
            </nav>

            <p className="muted" style={{ marginTop: 'auto' }}>
              Fibras peruanas. Espíritu arequipeño.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
