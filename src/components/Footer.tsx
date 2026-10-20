import React from 'react';
import { Mountain, ArrowUpRight, MessageSquare } from 'lucide-react';
import { Link } from '../router/Router';
import { useStore } from '../store/useStore';
import { WHATSAPP_PHONE } from '../utils/pricing';

export function Footer() {
  const { user } = useStore();
  const currentYear = new Date().getFullYear();

  const whatsappHref = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    '¡Hola! Me gustaría recibir asesoría sobre ALTURA 2335.'
  )}`;

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <Link to="/" className="brand" aria-label="Urban Vibe Sport">
            <span className="logo-mark">
              <Mountain size={25} strokeWidth={2.7} />
            </span>
            <span className="logo-name">
              URBAN VIBE
              <small>SPORT · AREQUIPA</small>
            </span>
          </Link>
          <p>
            De la campiña a la cima.
            <br />
            Fibras peruanas para ir más lejos.
          </p>
          <span className="eyebrow">
            16°23′ S / 71°32′ O · AREQUIPA, PERÚ
          </span>
        </div>

        <div>
          <h3>Explora</h3>
          <Link to="/catalogo">Colección ALTURA 2335</Link>
          <Link to="/lookbook">Nuestros looks</Link>
          <Link to="/nosotros">Nuestra historia</Link>
          <Link to="/run-club">Misti al amanecer</Link>
        </div>

        <div>
          <h3>Estamos para ti</h3>
          <Link to="/guia-de-tallas">Guía de tallas</Link>
          <Link to="/cuidado">Cuida tus prendas</Link>
          <Link to="/envios">Envíos y cambios</Link>
          <a href={whatsappHref} target="_blank" rel="noreferrer">
            Hablemos por WhatsApp <ArrowUpRight size={14} />
          </a>
        </div>

        <div>
          <h3>Tu espacio</h3>
          <Link to="/cuenta">Mi cuenta</Link>
          <Link to="/favoritos">Mis favoritos</Link>
          <Link to="/contacto">Contacto</Link>
          {user?.role === 'admin' ? (
            <Link to="/admin" className="text-[#0047ff] font-semibold">
              Administración y base de datos
            </Link>
          ) : (
            <Link to="/login" className="text-gray-400">
              Acceso equipo
            </Link>
          )}
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {currentYear} Urban Vibe Sport. Desde Arequipa, con altura.</span>
        <div>
          <Link to="/terminos">Términos</Link>
          <Link to="/privacidad">Privacidad</Link>
          <Link to="/reclamaciones">Libro de reclamaciones</Link>
        </div>
      </div>
    </footer>
  );
}
