// 통일된 확인 모달 컴포넌트
// window.confirm() 대신 사용

import { motion, AnimatePresence } from 'framer-motion';
import Button from './Button';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = '확인',
  message = '이 작업을 진행하시겠습니까?',
  confirmText = '확인',
  cancelText = '취소',
  variant = 'danger' // 'danger' | 'warning' | 'info'
}) {
  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 백드롭 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[9998]"
            style={{ zIndex: 9998 }}
          />
          
          {/* 모달 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            style={{ zIndex: 9999 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              style={{
                fontFamily: 'var(--font-body, Pretendard, sans-serif)'
              }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {message}
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onClose}
                >
                  {cancelText}
                </Button>
                <Button
                  variant={variant === 'danger' ? 'danger' : 'primary'}
                  size="md"
                  onClick={handleConfirm}
                >
                  {confirmText}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

