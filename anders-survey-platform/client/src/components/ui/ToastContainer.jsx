// Toast 메시지 컨테이너 컴포넌트
// alert() 대신 사용할 통일된 피드백 시스템

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from './Toast';

let toastId = 0;
const toastListeners = new Set();

// Toast 관리 함수
export const showToast = (message, type = 'info', duration = 3000) => {
  const id = ++toastId;
  const toast = { id, message, type, duration };
  toastListeners.forEach(listener => listener(toast));
  return id;
};

// 편의 함수들
export const toast = {
  success: (message, duration) => showToast(message, 'success', duration),
  error: (message, duration) => showToast(message, 'error', duration),
  info: (message, duration) => showToast(message, 'info', duration),
  warning: (message, duration) => showToast(message, 'warning', duration)
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (newToast) => {
      setToasts(prev => [...prev, newToast]);
      
      // 자동 제거
      if (newToast.duration > 0) {
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== newToast.id));
        }, newToast.duration);
      }
    };

    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto"
          >
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

