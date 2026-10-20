import React, { useState } from 'react';
import { Play, ArrowRight, ArrowUpRight, ShieldCheck, Sparkles, Truck, Feather, Mountain } from 'lucide-react';
import { Link, useRouter } from '../router/Router';
import { useStore } from '../store/useStore';
import { ProductCard } from '../components/ProductCard';
import { formatPEN } from '../utils/pricing';

export function HomeView() {
  const { products, addToCart, setCartOpen, setCoupon, notify, setVideoOpen } = useStore();
  const { navigate } = useRouter();

  const [bundleSize, setBundleSize] = useState('M');
  const [guideEmail, setGuideEmail] = useState('');
  const [guideTerms, setGuideTerms] = useState(false);
  const [guideSubmitted, setGuideSubmitted] = useState(false);
  const [guideLoading, setGuideLoading] = useState(false);

  // Layering bundle: polo-misti, hoodie-heavyweight, casaca-cortaviento
  const layerProducts = ['polo-misti', 'hoodie-heavyweight', 'casaca-cortaviento']
    .map(slug => products.find(p => p.slug === slug))
    .filter(Boolean) as typeof products;

  const bundleTotal = layerProducts.reduce((sum, p) => sum + p.precio, 0);
  const bundleDiscounted = Math.round(bundleTotal * 0.9 * 100) / 100;

  const handleAddBundle = () => {
    if (layerProducts.length !== 3) return;

    layerProducts.forEach(prod => {
      addToCart(prod, prod.colores[0] || 'Crudo', bundleSize, 1);
    });

    setCoupon('CAPAS10');
    notify('Conjunto de 3 capas añadido con 10 % de descuento (CAPAS10).');
    setCartOpen(true);
  };

  const handleGuideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideEmail || !guideTerms) return;

    setGuideLoading(true);
    const leadObj = {
      id: `LEAD-${Date.now().toString().slice(-4)}`,
      email: guideEmail,
      nombre: 'Atleta Altura',
      tipo: 'Guía 2335',
      createdAt: new Date().toISOString()
    };

    try {
      const { saveLeadToDb } = await import('../services/db');
      await saveLeadToDb(leadObj);
    } catch {}

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadObj)
      });
    } catch {}

    setGuideLoading(false);
    setGuideSubmitted(true);
    notify('¡Guía enviada a tu correo! Además recibiste el cupón ALTURA10.');
  };

  const featuredIndices = [0, 3, 6, 9];
  const featuredProducts = featuredIndices.map(i => products[i]).filter(Boolean);

  return (
    <div id="main-content">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="live-dot" /> NUEVA COLECCIÓN · ALTURA 2335
          </span>

          <h1>
            ENTRENA
            <br />
            A TU <em>ALTURA.</em>
          </h1>

          <p>
            Fibras peruanas. Espíritu imparable.
            <br />
            Diseñadas para moverte entre el frío del amanecer y tu próxima cima.
          </p>

          <Link to="/catalogo" className="button hero-cta">
            Descubre la colección <ArrowUpRight size={21} />
          </Link>

          <div className="hero-foot">
            <span>
              <strong>2 335</strong> METROS DE INSPIRACIÓN
            </span>
            <button
              type="button"
              onClick={() => setVideoOpen(true)}
              aria-label="Reproducir video de la campaña"
            >
              <span className="play-circle">
                <Play size={14} className="fill-current text-[#0047ff]" />
              </span>{' '}
              Siente la altura
            </button>
          </div>
        </div>

        <div className="hero-media">
          <img
            src="/images/hero.webp"
            alt="Runner con la colección ALTURA 2335 frente al Misti, Arequipa"
            loading="eager"
            width="800"
            height="800"
          />
          <span className="image-coordinate">AREQUIPA, PERÚ · 2 335 M S. N. M.</span>
          <div className="hero-stamp">
            <Mountain size={32} strokeWidth={2.5} />
            <span>
              NACIMOS
              <br />
              PARA SUBIR.
            </span>
            <ArrowUpRight size={26} />
          </div>
        </div>
      </section>

      {/* Marquee Ticker */}
      <div className="ticker" aria-hidden="true">
        <span>ALGODÓN PIMA</span>
        <span>↗</span>
        <span>BABY ALPACA</span>
        <span>↗</span>
        <span>MERINO</span>
        <span>↗</span>
        <span>ESPÍRITU AREQUIPEÑO</span>
        <span>↗</span>
        <span>ALTURA 2335</span>
      </div>

      {/* Benefits Bar */}
      <div className="container benefits">
        <div>
          <Feather size={24} />
          <span>
            Fibras de origen peruano
            <small>Suavidad que se siente.</small>
          </span>
        </div>
        <div>
          <Mountain size={24} />
          <span>
            Pensado para la altura
            <small>Del amanecer a la cima.</small>
          </span>
        </div>
        <div>
          <Truck size={24} />
          <span>
            Envíos en Arequipa
            <small>Gratis desde S/ 299.</small>
          </span>
        </div>
      </div>

      {/* Featured Products */}
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow blue">TUS PRÓXIMOS ESENCIALES</span>
            <h2>El movimiento empieza aquí.</h2>
          </div>
          <Link to="/catalogo" className="text-link">
            Ver las 14 prendas <ArrowRight size={18} />
          </Link>
        </div>

        <div className="product-grid">
          {featuredProducts.map(product => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      {/* Collection Categories */}
      <section className="section container">
        <div className="section-heading">
          <div>
            <span className="eyebrow blue">ENCUENTRA TU RITMO</span>
            <h2>Una colección. Tu manera de moverte.</h2>
          </div>
        </div>

        <div className="category-grid">
          {[
            {
              linea: 'Running',
              sub: 'Para ir un kilómetro más.',
              img: 'hero',
              num: '01'
            },
            {
              linea: 'Training',
              sub: 'Tu mejor versión, cada día.',
              img: 'training',
              num: '02'
            },
            {
              linea: 'Altura',
              sub: 'La cima te está esperando.',
              img: 'trekking',
              num: '03'
            }
          ].map(cat => (
            <Link
              key={cat.linea}
              to={`/catalogo?linea=${cat.linea}`}
              className="category-card"
            >
              <img
                src={`/images/${cat.img}.webp`}
                alt={`Look ${cat.linea} de la colección`}
                loading="lazy"
              />
              <span className="category-number">{cat.num} / {cat.linea.toUpperCase()}</span>
              <div>
                <h3>{cat.linea}</h3>
                <p>{cat.sub}</p>
              </div>
              <span className="round-arrow">
                <ArrowRight size={18} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Three Layering System */}
      <section className="layers-section" id="sistema-capas">
        <div className="container layers-layout">
          <div className="layers-intro">
            <span className="eyebrow blue">MENOS EXCUSAS. MÁS CAPAS.</span>
            <h2>
              El clima cambia.
              <br />
              <em>Tu ritmo sigue.</em>
            </h2>
            <p>
              Una base suave, una capa que abriga y un exterior para salir. Arma tu sistema de tres capas y prepárate para lo que venga.
            </p>

            <div className="pack-price">
              <strong>{formatPEN(bundleDiscounted)}</strong>
              <del>{formatPEN(bundleTotal)}</del>
              <span>−10 % EN EL CONJUNTO</span>
            </div>

            <div className="pack-actions">
              <label htmlFor="pack-size" className="sr-only">
                Talla del conjunto
              </label>
              <select
                id="pack-size"
                value={bundleSize}
                onChange={e => setBundleSize(e.target.value)}
              >
                {['S', 'M', 'L', 'XL'].map(sz => (
                  <option key={sz} value={sz}>
                    Talla {sz}
                  </option>
                ))}
              </select>

              <button
                type="button"
                className="button"
                onClick={handleAddBundle}
              >
                Arma tu conjunto <ArrowRight size={18} />
              </button>
            </div>

            <Link to="/guia-de-tallas" className="small text-link">
              Encuentra tu talla
            </Link>
          </div>

          <div className="layers-products">
            {layerProducts.map((p, idx) => (
              <Link key={p.slug} to={`/producto/${p.slug}`}>
                <span className="layer-label">
                  0{idx + 1} / {['BASE', 'MEDIA', 'EXTERIOR'][idx]}
                </span>
                <img src={p.imagenes[0]} alt={p.nombre} loading="lazy" />
                <h3>{p.nombre}</h3>
                <p>
                  {
                    ['Respira y acompaña.', 'Abriga tu movimiento.', 'Completa tu protección.'][
                      idx
                    ]
                  }
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="story-section container section">
        <div className="story-image">
          <img
            src="/images/comunidad.webp"
            alt="Comunidad Urban Vibe en Arequipa con el Misti al fondo"
            loading="lazy"
          />
          <span className="story-label">NUESTRA TIERRA. NUESTRA ENERGÍA.</span>
        </div>

        <div className="story-copy">
          <span className="eyebrow blue">DE AREQUIPA, CON ALTURA</span>
          <h2>
            No es solo
            <br />
            dónde entrenas.
            <br />
            <em>Es lo que te mueve.</em>
          </h2>
          <p>
            Creemos en las mañanas que empiezan temprano, en el valor de nuestras fibras y en las ganas de llegar un poco más lejos. ALTURA 2335 nace de esa forma de vivir.
          </p>
          <Link to="/nosotros" className="text-link">
            Conoce nuestra historia <ArrowRight size={18} />
          </Link>

          <Link to="/run-club" className="club-mini">
            <span>
              ÚNETE AL MOVIMIENTO
              <strong>Misti al amanecer · Run Club</strong>
            </span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Guide & Newsletter Banner */}
      <section className="guide-section">
        <div className="container guide-layout">
          <div>
            <span className="eyebrow">TU PRÓXIMO PASO EMPIEZA AQUÍ</span>
            <h2>
              Más altura.
              <br />
              Más comunidad.
            </h2>
            <p>
              Descarga gratis nuestra guía «Entrena a 2 335 m».
              <br />
              Capas, cuidado de fibras y hábitos para tus rutas.
            </p>
          </div>

          <div className="guide-form">
            {guideSubmitted ? (
              <div className="bg-white/10 p-6 border border-white/20 text-white">
                <h3 className="text-lg font-bold">¡Guía enviada con éxito!</h3>
                <p className="text-sm mt-2 text-white/90">
                  Revisa tu bandeja de entrada ({guideEmail}). Tu código de 10 % de descuento para tu primera compra es: <strong>ALTURA10</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleGuideSubmit}>
                <div className="inline-input">
                  <input
                    type="email"
                    placeholder="Ingresa tu correo"
                    value={guideEmail}
                    onChange={e => setGuideEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="button button-white" disabled={guideLoading}>
                    {guideLoading ? 'Enviando...' : 'Quiero mi guía'} <ArrowRight size={16} />
                  </button>
                </div>
                <label className="checkbox-label text-white">
                  <input
                    type="checkbox"
                    checked={guideTerms}
                    onChange={e => setGuideTerms(e.target.checked)}
                    required
                  />
                  Acepto la{' '}
                  <Link to="/privacidad" className="underline text-white">
                    política de privacidad
                  </Link>{' '}
                  y recibir información de Urban Vibe.
                </label>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
