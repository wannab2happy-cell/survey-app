// 진행 설정 UI 컴포넌트
// anders 스타일: 상태 토글 버튼 (저장만/바로 진행/예약 진행/일시정지)

import { useState } from 'react';

const statusOptions = [
  { value: 'inactive', label: '저장만', icon: '💾', color: 'gray' },
  { value: 'active', label: '바로 진행', icon: '▶️', color: 'green' },
  { value: 'scheduled', label: '예약 진행', icon: '📅', color: 'blue' },
  { value: 'paused', label: '일시정지', icon: '⏸️', color: 'yellow' },
];

export default function StatusToggle({ 
  status = 'inactive', 
  startAt = null,
  endAt = null,
  onChange 
}) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [localStartAt, setLocalStartAt] = useState(startAt || '');
  const [localEndAt, setLocalEndAt] = useState(endAt || '');

  const handleStatusChange = (newStatus) => {
    if (newStatus === 'scheduled') {
      setShowDatePicker(true);
    } else {
      setShowDatePicker(false);
    }
    onChange({ status: newStatus, startAt: localStartAt, endAt: localEndAt });
  };

  const handleDateChange = () => {
    onChange({ status, startAt: localStartAt, endAt: localEndAt });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          진행 설정
        </label>
        <div className="grid grid-cols-2 gap-2">
          {statusOptions.map((option) => {
            const isActive = status === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleStatusChange(option.value)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all
                  ${isActive 
                    ? 'border-purple-500 bg-purple-50 text-purple-700 font-semibold' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                <span className="text-xl">{option.icon}</span>
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {status === 'scheduled' && (
        <div className="space-y-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작 일시
            </label>
            <input
              type="datetime-local"
              value={localStartAt}
              onChange={(e) => {
                setLocalStartAt(e.target.value);
                handleDateChange();
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              종료 일시
            </label>
            <input
              type="datetime-local"
              value={localEndAt}
              onChange={(e) => {
                setLocalEndAt(e.target.value);
                handleDateChange();
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}



