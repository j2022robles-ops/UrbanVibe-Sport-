import React from 'react';
import { MessageSquare } from 'lucide-react';
import { WHATSAPP_PHONE } from '../utils/pricing';

export function WhatsAppFloating() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    '¡Hola, Urban Vibe! Me gustaría recibir asesoría sobre la colección ALTURA 2335.'
  )}`;

  return (
    <aside
      aria-label="Atención por WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#20ba5a] transition-transform hover:scale-105 font-medium text-xs tracking-wide"
        aria-label="Contactar a Urban Vibe por WhatsApp"
      >
        <MessageSquare size={18} className="fill-current text-white" />
        <span className="hidden sm:inline">Asesoría WhatsApp</span>
      </a>
    </aside>
  );
}
