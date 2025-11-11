// 배포/접근 제어 컴포넌트
// anders 스타일: 퍼블릭/비공개 링크, QR 코드, 단축 URL

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

export default function SharePanel({ 
  surveyId,
  isPublic = true,
  allowMultipleResponses = true,
  expiresAt = null,
  onSettingsChange 
}) {
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 설문 링크 생성 (실제로는 서버에서 생성)
    if (surveyId) {
      // Theme V2가 활성화되면 /s/:slug 형식 사용
      const baseUrl = window.location.origin;
      setLink(`${baseUrl}/s/${surveyId}`);
    }
  }, [surveyId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* 공개 설정 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          공개 설정
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="public"
              checked={isPublic}
              onChange={() => onSettingsChange({ isPublic: true })}
              className="w-4 h-4 text-primary"
            />
            <span>공개 링크</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="public"
              checked={!isPublic}
              onChange={() => onSettingsChange({ isPublic: false })}
              className="w-4 h-4 text-primary"
            />
            <span>비공개</span>
          </label>
        </div>
      </div>

      {/* 응답 제한 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          응답 제한
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!allowMultipleResponses}
            onChange={(e) => onSettingsChange({ allowMultipleResponses: !e.target.checked })}
            className="w-4 h-4 text-primary rounded"
          />
          <span>1회만 응답 가능</span>
        </label>
      </div>

      {/* 만료일 설정 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          만료일 설정
        </label>
        <input
          type="datetime-local"
          value={expiresAt || ''}
          onChange={(e) => onSettingsChange({ expiresAt: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
        />
      </div>

      {/* 링크 공유 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          설문 링크
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={link}
            readOnly
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 bg-gray-50"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity bg-primary"
          >
            {copied ? '복사됨!' : '복사'}
          </button>
        </div>
      </div>

      {/* QR 코드 */}
      {link && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            QR 코드
          </label>
          <div className="flex justify-center p-4 bg-white rounded-xl border border-gray-200">
            <QRCodeSVG value={link} size={200} />
          </div>
        </div>
      )}
    </div>
  );
}



