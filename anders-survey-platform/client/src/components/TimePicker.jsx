// TimePicker 컴포넌트 (요구사항 3: 시간 1-12, 분 10분 간격)

import { useState, useEffect } from 'react';

export default function TimePicker({ value, onChange, label, required = false, primaryColor }) {
    const [hour, setHour] = useState(12);
    const [minute, setMinute] = useState(0);
    const [ampm, setAmpm] = useState('AM');

    // value가 ISO 문자열이면 파싱
    useEffect(() => {
        if (value) {
            try {
                const date = new Date(value);
                let hours = date.getHours();
                const mins = date.getMinutes();
                
                if (hours === 0) {
                    hours = 12;
                    setAmpm('AM');
                } else if (hours < 12) {
                    setAmpm('AM');
                } else if (hours === 12) {
                    setAmpm('PM');
                } else {
                    hours = hours - 12;
                    setAmpm('PM');
                }
                
                setHour(hours);
                // 분을 10분 간격으로 반올림
                setMinute(Math.round(mins / 10) * 10);
            } catch (e) {
                console.error('TimePicker: 날짜 파싱 실패', e);
            }
        }
    }, [value]);

    // 시간 변경 핸들러
    const handleTimeChange = (newHour, newMinute, newAmpm) => {
        setHour(newHour);
        setMinute(newMinute);
        setAmpm(newAmpm);
        
        // ISO 문자열로 변환
        let hours24 = newHour;
        if (newAmpm === 'PM' && newHour !== 12) {
            hours24 = newHour + 12;
        } else if (newAmpm === 'AM' && newHour === 12) {
            hours24 = 0;
        }
        
        // 날짜 부분 유지
        let dateStr = '';
        if (value) {
            const date = new Date(value);
            dateStr = date.toISOString().split('T')[0];
        } else {
            const today = new Date();
            dateStr = today.toISOString().split('T')[0];
        }
        
        const dateTimeStr = `${dateStr}T${String(hours24).padStart(2, '0')}:${String(newMinute).padStart(2, '0')}:00`;
        onChange({ target: { value: dateTimeStr } });
    };

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = [0, 10, 20, 30, 40, 50];

    return (
        <div className="flex items-center gap-1">
            {/* 시간 선택 (1-12) */}
            <select
                value={hour}
                onChange={(e) => handleTimeChange(Number(e.target.value), minute, ampm)}
                className="border-2 border-gray-200 rounded-md px-2 py-2 text-sm font-medium bg-white shadow-sm min-w-[60px]"
                style={{
                    borderColor: primaryColor || '#D1D5DB',
                    focusRingColor: primaryColor || '#26C6DA'
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = primaryColor || '#26C6DA';
                    e.target.style.boxShadow = `0 0 0 2px ${primaryColor || '#26C6DA'}40`;
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = primaryColor || '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                }}
            >
                {hours.map(h => (
                    <option key={h} value={h}>{h}</option>
                ))}
            </select>
            
            <span className="text-gray-400 text-sm px-0.5">:</span>
            
            {/* 분 선택 (10분 간격) */}
            <select
                value={minute}
                onChange={(e) => handleTimeChange(hour, Number(e.target.value), ampm)}
                className="border-2 border-gray-200 rounded-md px-2 py-2 text-sm font-medium bg-white shadow-sm min-w-[60px]"
                style={{
                    borderColor: primaryColor || '#D1D5DB',
                    focusRingColor: primaryColor || '#26C6DA'
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = primaryColor || '#26C6DA';
                    e.target.style.boxShadow = `0 0 0 2px ${primaryColor || '#26C6DA'}40`;
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = primaryColor || '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                }}
            >
                {minutes.map(m => (
                    <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                ))}
            </select>
            
            {/* AM/PM */}
            <select
                value={ampm}
                onChange={(e) => handleTimeChange(hour, minute, e.target.value)}
                className="border-2 border-gray-200 rounded-md px-2 py-2 text-sm font-medium bg-white shadow-sm min-w-[65px]"
                style={{
                    borderColor: primaryColor || '#D1D5DB',
                    focusRingColor: primaryColor || '#26C6DA'
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = primaryColor || '#26C6DA';
                    e.target.style.boxShadow = `0 0 0 2px ${primaryColor || '#26C6DA'}40`;
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = primaryColor || '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                }}
            >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
            </select>
        </div>
    );
}

