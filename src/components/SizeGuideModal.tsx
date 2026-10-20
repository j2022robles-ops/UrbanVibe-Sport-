import React from 'react';
import { X, ArrowRight, MessageSquare } from 'lucide-react';
import { useStore } from '../store/useStore';
import { WHATSAPP_PHONE } from '../utils/pricing';

export function SizeGuideModal() {
  const { sizeGuideOpen, setSizeGuideOpen } = useStore();

  if (!sizeGuideOpen) return null;

  const rows = [
    ['XS', '80–86', '62–68', '86–92'],
    ['S', '86–94', '68–76', '92–98'],
    ['M', '94–102', '76–84', '98–106'],
    ['L', '102–110', '84–92', '106–114'],
    ['XL', '110–118', '92–100', '114–122']
  ];

  const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
    '¡Hola! Quisiera ayuda para elegir mi talla en la colección ALTURA 2335.'
  )}`;

  return (
    <div
      className="modal-backdrop"
      onClick={() => setSizeGuideOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Guía de tallas"
    >
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Guía de tallas</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Cerrar guía de tallas"
            onClick={() => setSizeGuideOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <p className="text-xs text-[var(--muted)] mb-4">
          Esta tabla orientativa usa medidas corporales en centímetros. Las medidas de cada prenda se confirman con nuestro asesor por WhatsApp antes de entregar.
        </p>

        <div className="table-wrap">
          <table>
            <caption>Referencia general para prendas de la colección (cm)</caption>
            <thead>
              <tr>
                <th>Talla</th>
                <th>Pecho</th>
                <th>Cintura</th>
                <th>Cadera</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row[0]}>
                  {row.map((cell, idx) => (
                    <td key={idx} className={idx === 0 ? 'font-bold' : ''}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--border)]">
          <h3 className="text-sm font-bold uppercase tracking-wider mb-2">
            ¿Cómo tomar tus medidas?
          </h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Mide el contorno de pecho, cintura y cadera con una cinta métrica flexible, manteniéndola horizontal y sin apretar. Si dudas entre dos tallas, te recomendamos la mayor si buscas calce holgado o la menor para compresión.
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="button button-outline full mt-4"
          >
            <MessageSquare size={16} /> Consultar con un asesor por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
