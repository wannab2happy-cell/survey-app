// 키보드 단축키 훅
// react-hotkeys-hook 사용

import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

export function useKeyboardShortcuts({
  onSave,
  onAddQuestion,
  onDelete,
  onUndo,
  onRedo,
  enabled = true,
}) {
  // Ctrl+S: 저장
  useHotkeys(
    'ctrl+s, meta+s',
    (e) => {
      e.preventDefault();
      if (enabled && onSave) {
        onSave();
      }
    },
    { enabled, enableOnFormTags: false }
  );

  // +: 질문 추가
  useHotkeys(
    '+',
    (e) => {
      e.preventDefault();
      if (enabled && onAddQuestion) {
        onAddQuestion();
      }
    },
    { enabled, enableOnFormTags: false }
  );

  // Delete: 삭제 (선택된 항목이 있을 때)
  useHotkeys(
    'delete, backspace',
    (e) => {
      if (enabled && onDelete) {
        // input이나 textarea에 포커스가 있으면 삭제하지 않음
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
          return;
        }
        e.preventDefault();
        onDelete();
      }
    },
    { enabled }
  );

  // Ctrl+Z: 실행 취소
  useHotkeys(
    'ctrl+z, meta+z',
    (e) => {
      e.preventDefault();
      if (enabled && onUndo) {
        onUndo();
      }
    },
    { enabled, enableOnFormTags: false }
  );

  // Ctrl+Shift+Z: 다시 실행
  useHotkeys(
    'ctrl+shift+z, meta+shift+z',
    (e) => {
      e.preventDefault();
      if (enabled && onRedo) {
        onRedo();
      }
    },
    { enabled, enableOnFormTags: false }
  );

  return null;
}

// 단축키 가이드 컴포넌트
export function KeyboardShortcutsGuide({ visible = false, onClose }) {
  if (!visible) return null;

  const shortcuts = [
    { keys: ['Ctrl', 'S'], description: '저장' },
    { keys: ['+'], description: '질문 추가' },
    { keys: ['Delete'], description: '삭제' },
    { keys: ['Ctrl', 'Z'], description: '실행 취소' },
    { keys: ['Ctrl', 'Shift', 'Z'], description: '다시 실행' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">키보드 단축키</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-3">
          {shortcuts.map((shortcut, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span className="text-gray-700">{shortcut.description}</span>
              <div className="flex items-center gap-1">
                {shortcut.keys.map((key, keyIdx) => (
                  <span key={keyIdx} className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">
                    {key}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 rounded-lg text-white font-medium"
          style={{ backgroundColor: '#6B46C1' }}
        >
          닫기
        </button>
      </div>
    </div>
  );
}



