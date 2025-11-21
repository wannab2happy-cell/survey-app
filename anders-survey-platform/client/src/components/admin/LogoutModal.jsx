import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 overflow-hidden"
        >
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#E0F7FA' }}>
              <svg className="w-6 h-6" style={{ color: '#26C6DA' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2">로그아웃</h3>
            <p className="text-gray-500 text-sm mb-6">
              정말 로그아웃 하시겠습니까?<br/>
              로그아웃 후에는 다시 로그인해야 합니다.
            </p>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
              >
                취소
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 px-4 py-2 text-white rounded-lg transition-colors font-medium text-sm shadow-sm"
                style={{ backgroundColor: '#26C6DA' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00ACC1'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#26C6DA'}
              >
                로그아웃
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
