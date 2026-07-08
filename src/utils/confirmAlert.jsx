import React from 'react';
import { createRoot } from 'react-dom/client';
import ConfirmModal from '../components/common/ConfirmModal';
import i18n from '../i18n'; // Adjust the import path if your i18n instance is elsewhere

/**
 * A professional, promise-based custom alert replacing window.confirm
 * 
 * @param {Object} options 
 * @param {string} options.title - The title of the modal
 * @param {string} options.text - The message body
 * @param {string} [options.confirmText] - Custom confirm button text
 * @param {string} [options.cancelText] - Custom cancel button text
 * @param {string} [options.type='danger'] - Type of alert ('danger' | 'warning')
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
export const confirmAlert = (options) => {
  return new Promise((resolve) => {
    // Create a container for the modal
    const container = document.createElement('div');
    document.body.appendChild(container);
    
    // We use createRoot to render the modal component outside the main React tree
    const root = createRoot(container);

    // Get current language direction
    const isRTL = i18n.language === 'ar' || document.documentElement.dir === 'rtl';

    const cleanup = () => {
      // Small delay to allow framer-motion exit animations to finish before unmounting
      setTimeout(() => {
        root.unmount();
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      }, 300); // Wait for the 0.3s exit transition
    };

    const handleConfirm = () => {
      // Re-render with isOpen=false to trigger exit animation
      renderModal(false);
      cleanup();
      resolve(true);
    };

    const handleCancel = () => {
      renderModal(false);
      cleanup();
      resolve(false);
    };

    const renderModal = (isOpen) => {
      root.render(
        <ConfirmModal
          isOpen={isOpen}
          title={options.title}
          text={options.text}
          confirmText={options.confirmText}
          cancelText={options.cancelText}
          type={options.type || 'danger'}
          isRTL={isRTL}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      );
    };

    // Initial render
    renderModal(true);
  });
};
