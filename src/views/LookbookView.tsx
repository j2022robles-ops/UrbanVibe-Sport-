import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from '../router/Router';
import { LOOKBOOK_LOOKS, CAMPAIGN_GALLERY } from '../data/products';
import { useStore } from '../store/useStore';

export function LookbookView() {
  const { notify } = useStore();
  const [guideEmail, setGuideEmail] = useState('');
  const [guideTerms, setGuideTerms] = useState(false);
  const [guideDone, setGuideDone] = useState(false);

  const handleGuideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideEmail || !guideTerms) return;

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: guideEmail, tipo: 'Guía Lookbook' })
      });
    } catch {}

    setGuideDone(true);
    notify('¡Guía enviada a tu correo!');
  };

  return (
    <div id="main-content">
      <div className="page-banner">
        <div className="container">
          <nav className="breadcrumb" aria-label="Migas de pan">
            <Link to="/">Inicio</Link> / Lookbook
          </nav>
          <span className="eyebrow blue">ALTURA 2335 / LOOKBOOK</span>
          <h1>
            Seis looks.
            <br />
            Infinitas maneras de moverte.
          </h1>
          <p>
            Tres miradas de hombre y tres de mujer, conectadas por nuestra tierra y pensadas para la altura.
          </p>
        </div>
      </div>

      <div className="container">
        {/* Editorial looks grid */}
        <section className="lookbook-grid">
          {LOOKBOOK_LOOKS.map(look => (
            <article key={look.id} className="look-item">
              <Link to={look.linkUrl} className="lookbook-photo">
                <img src={look.imagen} alt={look.titulo} loading="lazy" />
                <span>
                  <strong>LOOK {look.id}</strong>
                  <span>ALTURA 2335</span>
                </span>
              </Link>
              <h2>{look.titulo}</h2>
              <p>{look.descripcion}</p>
              <Link to={look.linkUrl} className="text-link">
                {look.linkText} <ArrowRight size={14} />
              </Link>
            </article>
          ))}
        </section>

        {/* Campaign gallery horizontal showcase */}
        <section className="campaign-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow blue">SISTEMA DE TRES CAPAS / LA CAMPAÑA</span>
              <h2>Prepárate para cada parte del día.</h2>
            </div>
          </div>

          <div className="campaign-gallery">
            {CAMPAIGN_GALLERY.map(item => (
              <img
                key={item.src}
                src={item.src}
                alt={item.alt}
                loading="lazy"
                title={item.label}
              />
            ))}
          </div>

          {/* Guide signup card */}
          <div className="campaign-guide">
            <span className="eyebrow text-white/80">TU GUÍA PARA DAR EL SIGUIENTE PASO</span>
            <h2 className="text-white mt-2 mb-3">Guía «Entrena a 2 335 m»</h2>
            <p className="text-white/90 text-xs mb-6">
              Aprende a combinar fibras naturales para resistir los cambios de temperatura en Arequipa y optimizar tu rendimiento.
            </p>

            {guideDone ? (
              <div className="bg-white/20 p-4 border border-white/30 text-white text-xs">
                ¡Gracias! Te enviamos la guía a <strong>{guideEmail}</strong> con el cupón <strong>ALTURA10</strong>.
              </div>
            ) : (
              <form className="guide-form" onSubmit={handleGuideSubmit}>
                <div className="inline-input">
                  <input
                    type="email"
                    placeholder="Ingresa tu correo"
                    value={guideEmail}
                    onChange={e => setGuideEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="button button-white">
                    Quiero mi guía <ArrowRight size={16} />
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
        </section>
      </div>
    </div>
  );
}
