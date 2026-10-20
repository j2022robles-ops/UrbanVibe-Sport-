import React, { useState } from 'react';
import { Calendar, MapPin, Clock, ArrowRight, MessageSquare, CheckCircle2, Users } from 'lucide-react';
import { Link } from '../router/Router';
import { useStore } from '../store/useStore';
import { WHATSAPP_PHONE } from '../utils/pricing';

export function RunClubView() {
  const { notify } = useStore();
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [terms, setTerms] = useState(false);
  const [registered, setRegistered] = useState(false);

  const whatsappHref = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    '¡Hola, Urban Vibe! Me interesa unirme al próximo encuentro del Run Club de ALTURA 2335.'
  )}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !terms) return;

    const leadObj = {
      id: `LEAD-${Date.now().toString().slice(-4)}`,
      email,
      nombre: nombre || 'Atleta',
      tipo: 'Run Club RSVP',
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

    setRegistered(true);
    notify('¡Te registraste con éxito en el Urban Vibe Run Club! Cupón CLUB20 disponible.');
  };

  return (
    <div id="main-content">
      {/* Club Hero */}
      <section className="club-hero">
        <img
          src="/images/hero.webp"
          alt="Comunidad Urban Vibe Run Club en Arequipa"
          loading="eager"
        />
        <div className="container">
          <span className="eyebrow">URBAN VIBE RUN CLUB</span>
          <h1>
            Misti
            <br />
            <em>al amanecer.</em>
          </h1>
          <p>
            Hay kilómetros que se disfrutan más en compañía. Entrenamos todos los sábados en la campiña arequipeña.
          </p>
          <a
            href="#unirse"
            className="button hero-cta mt-6"
          >
            Únete al movimiento <ArrowRight size={18} />
          </a>
        </div>
      </section>

      {/* Content & Calendar */}
      <div className="container section">
        <div className="club-content">
          <div>
            <span className="eyebrow blue">EL RITMO LO PONEMOS JUNTOS</span>
            <h2 className="text-3xl font-bold mt-2 mb-4">
              Nos mueve la misma energía.
            </h2>
            <p className="mb-6">
              El Run Club de ALTURA 2335 propone encuentros en la campiña arequipeña los sábados a las 6:30 a. m. Un espacio abierto para corredores de todos los ritmos que buscan compartir la ruta y conectar con nuestra comunidad.
            </p>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-4 p-4 border border-[var(--border)]">
                <Calendar size={22} className="text-[#0047ff] shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-sm">Próxima salida: Sábado 6:30 AM</h3>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Punto de encuentro: Mirador de Yanahuara. Rutas de 5K y 10K con llegada a Carmen Alto.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border border-[var(--border)]">
                <MapPin size={22} className="text-[#0047ff] shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-sm">Altitud 2 335 m s. n. m.</h3>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Clima fresco matutino. Recomendamos vestimenta en capas transpirables (Polo Misti o base de algodón pima/merino).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border border-[var(--border)]">
                <Users size={22} className="text-[#0047ff] shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-sm">Beneficio exclusivo de comunidad</h3>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Todos los integrantes del club reciben 20 % de descuento en prendas Urban Vibe mediante el cupón <strong>CLUB20</strong>.
                  </p>
                </div>
              </div>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="button button-outline"
            >
              <MessageSquare size={16} /> Consultar el próximo encuentro por WhatsApp
            </a>
          </div>

          {/* Registration form */}
          <div id="unirse" className="club-registration">
            <span className="eyebrow text-white/80">QUIERO SER PARTE</span>
            <h2 className="text-white mt-2 mb-3">Registra tu interés</h2>
            <p className="mb-6">
              Deja tus datos para recibir los puntos de partida de los sábados, tips de entrenamiento en altitud y beneficios especiales.
            </p>

            {registered ? (
              <div className="bg-white/20 p-5 border border-white/30 text-white space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 size={20} /> ¡Registro exitoso!
                </div>
                <p className="text-xs text-white/90">
                  Bienvenido al Club. Tu código para 20 % en toda la colección es: <strong>CLUB20</strong> (válido al crear tu cuenta o comprar).
                </p>
              </div>
            ) : (
              <form className="guide-form space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="club-name" className="text-white text-xs block mb-1">
                    Nombre o apodo
                  </label>
                  <input
                    id="club-name"
                    type="text"
                    placeholder="Tu nombre"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    className="w-full p-3 bg-white/10 text-white placeholder:text-white/60 border border-white/30"
                  />
                </div>

                <div>
                  <label htmlFor="club-email" className="text-white text-xs block mb-1">
                    Correo electrónico
                  </label>
                  <input
                    id="club-email"
                    type="email"
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full p-3 bg-white/10 text-white placeholder:text-white/60 border border-white/30"
                  />
                </div>

                <label className="checkbox-label text-white">
                  <input
                    type="checkbox"
                    checked={terms}
                    onChange={e => setTerms(e.target.checked)}
                    required
                  />
                  Acepto la{' '}
                  <Link to="/privacidad" className="underline text-white">
                    política de privacidad
                  </Link>{' '}
                  y recibir información de Urban Vibe.
                </label>

                <button type="submit" className="button button-white w-full justify-center">
                  Quiero unirme <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
