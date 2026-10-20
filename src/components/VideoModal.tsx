import React from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';

export function VideoModal() {
  const { videoOpen, setVideoOpen } = useStore();

  if (!videoOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={() => setVideoOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Campaña audiovisual Siente la altura"
    >
      <div className="modal max-w-3xl" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Siente la altura · ALTURA 2335</h2>
          <button
            type="button"
            className="icon-button"
            aria-label="Cerrar video"
            onClick={() => setVideoOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        <video
          className="campaign-video"
          src="/video.mp4"
          controls
          autoPlay
          playsInline
          preload="metadata"
        >
          Tu navegador no soporta el formato de video.
        </video>
        <p className="mt-3 text-xs text-[var(--muted)] text-center">
          Rodado en los paisajes de Arequipa, a 2 335 m s. n. m. frente a los volcanes Misti, Chachani y Pichu Pichu.
        </p>
      </div>
    </div>
  );
}
