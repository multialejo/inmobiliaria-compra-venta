import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function RejectionModal({ isOpen, onConfirm, onCancel }) {
  const [motivo, setMotivo] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setMotivo('');
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(motivo);
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-100 transform transition-all animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">
            Rechazar Solicitud de Agente
          </h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-full transition"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              ¿Estás seguro de que deseas rechazar la solicitud para que este cliente se convierta en agente? Por favor, ingresa el motivo del rechazo para continuar.
            </p>
            <div>
              <label htmlFor="motivo-rechazo" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Motivo del Rechazo (Obligatorio)
              </label>
              <textarea
                id="motivo-rechazo"
                ref={textareaRef}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Escribe aquí el motivo por el cual se rechaza la solicitud (este campo es obligatorio)..."
                required
                className="w-full min-h-[100px] px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm text-gray-800 placeholder-gray-400 shadow-inner resize-y transition duration-200 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-100 text-gray-700 font-semibold text-sm transition duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!motivo.trim()}
              className={`px-5 py-2 text-white font-semibold rounded-xl text-sm shadow-md transition duration-200 ${
                !motivo.trim()
                  ? 'bg-red-400 cursor-not-allowed opacity-60 shadow-none'
                  : 'bg-red-600 hover:bg-red-700 shadow-red-200 hover:shadow-red-300'
              }`}
            >
              Rechazar Solicitud
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
