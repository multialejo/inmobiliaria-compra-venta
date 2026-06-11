import React, { useEffect, useRef } from 'react';

export default function ConfirmDialog({ isOpen, message, onConfirm, onCancel }) {
  const confirmRef = useRef(null);

  useEffect(() => {
    if (isOpen && confirmRef.current) {
      confirmRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="bg-white rounded-xl p-6 max-w-sm w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <p id="confirm-dialog-title" className="text-gray-900 font-medium mb-6 text-center">
          {message}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            ref={confirmRef}
            onClick={() => { onConfirm(); onCancel(); }}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition font-medium text-sm"
          >
            Eliminar
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition font-medium text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
