import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, text, confirmText, cancelText, onConfirm, onCancel, type = 'danger', isRTL = false }) => {
  // إغلاق عند الضغط على مفتاح Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm z-[9998]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className={`bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden pointer-events-auto border border-slate-100 dark:border-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Header */}
              <div className="relative p-6 pb-4 flex flex-col items-center text-center">
                <button
                  onClick={onCancel}
                  className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700`}
                >
                  <X size={20} />
                </button>

                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${type === 'danger' ? 'bg-red-50 text-red-500 dark:bg-red-500/10' : 'bg-orange-50 text-orange-500 dark:bg-orange-500/10'}`}>
                  <AlertTriangle size={32} strokeWidth={1.5} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {text}
                </p>
              </div>

              {/* Actions */}
              <div className="p-6 pt-4 flex gap-3">
                <button
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-colors focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600 outline-none"
                >
                  {cancelText || (isRTL ? 'إلغاء' : 'Cancel')}
                </button>
                <button
                  onClick={onConfirm}
                  className={`flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors shadow-sm focus:ring-2 outline-none ${
                    type === 'danger' 
                      ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500/50 dark:bg-red-500 dark:hover:bg-red-600' 
                      : 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500/50 dark:bg-orange-500 dark:hover:bg-orange-600'
                  }`}
                >
                  {confirmText || (isRTL ? 'نعم، تأكيد' : 'Yes, Confirm')}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
