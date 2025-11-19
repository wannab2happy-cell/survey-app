// 토스트 메시지 컴포넌트
// 사용자에게 알림 메시지를 표시

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export default function Toast({ message, type = 'info', visible = true, onClose, duration = 3000 }) {
  useEffect(() => {
    if (visible && duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible || !message) return null;

  const typeStyles = {
    success: 'bg-success/10 border-success/20 text-success',
    error: 'bg-error/10 border-error/20 text-error',
    warning: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    info: 'bg-primary/10 border-primary/20 text-primary',
  };

  const iconStyles = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -20, x: '-50%' }}
          className={`fixed top-4 left-1/2 z-50 px-4 py-3 rounded-lg border shadow-lg flex items-center gap-3 ${typeStyles[type] || typeStyles.info}`}
          style={{ maxWidth: '90%', width: 'auto' }}
        >
          <span className="text-lg">{iconStyles[type] || iconStyles.info}</span>
          <span className="flex-1 text-sm font-medium">{message}</span>
          {onClose && (
            <button
              onClick={onClose}
              className="ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
              aria-label="닫기"
            >
              ✕
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}






