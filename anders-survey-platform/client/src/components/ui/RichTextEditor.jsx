// 간단한 버튼 기반 리치 텍스트 에디터 컴포넌트
// Bold, Font Size, Line Break 기능 제공

import { useState, useRef, useEffect } from 'react';
import { sanitizeHTML } from '../../utils/htmlSanitizer';

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = '',
  className = '',
  style = {},
  rows = 3,
  defaultFontSize = 16 // 기본 폰트 크기
}) {
  const [htmlValue, setHtmlValue] = useState(value || '');
  const [isFocused, setIsFocused] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState(defaultFontSize);
  const [isBold, setIsBold] = useState(false);
  const textareaRef = useRef(null);

  // 외부 value 변경 시 동기화
  useEffect(() => {
    if (value !== htmlValue) {
      setHtmlValue(value || '');
      // HTML에서 현재 스타일 추출
      extractStyles(value || '');
    }
  }, [value]);

  // HTML에서 현재 스타일 추출
  const extractStyles = (html) => {
    if (!html) {
      setCurrentFontSize(defaultFontSize);
      setIsBold(false);
      return;
    }

    const div = document.createElement('div');
    div.innerHTML = html;
    
    // Bold 체크
    const hasStrong = div.querySelector('strong, b');
    setIsBold(!!hasStrong);

    // 폰트 크기 추출
    const spanWithSize = div.querySelector('span[style*="font-size"]');
    if (spanWithSize) {
      const style = spanWithSize.getAttribute('style');
      const match = style.match(/font-size:\s*(\d+)px/);
      if (match) {
        setCurrentFontSize(parseInt(match[1]));
      }
    } else {
      setCurrentFontSize(defaultFontSize);
    }
  };

  // HTML을 순수 텍스트로 변환 (편집용)
  const getTextContent = (html) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    // <br> 태그를 줄바꿈으로 변환
    const text = div.textContent || div.innerText || '';
    // <br> 태그를 실제 줄바꿈으로 변환
    return html.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]*>/g, '');
  };

  // 텍스트를 HTML로 변환
  const textToHTML = (text, bold = false, fontSize = null) => {
    if (!text) return '';
    
    const actualFontSize = fontSize !== null ? fontSize : defaultFontSize;
    
    // 줄바꿈을 <br>로 변환
    let html = text.replace(/\n/g, '<br>');
    
    // 폰트 크기 적용 (기본값과 다를 때만)
    if (actualFontSize !== defaultFontSize) {
      html = `<span style="font-size: ${actualFontSize}px">${html}</span>`;
    }
    
    // Bold 적용
    if (bold) {
      html = `<strong>${html}</strong>`;
    }
    
    return html;
  };

  // 텍스트 변경 핸들러
  const handleTextChange = (text) => {
    // textarea에 입력된 텍스트는 순수 텍스트 (줄바꿈 포함)
    // 현재 스타일을 적용하여 HTML 생성
    const html = textToHTML(text, isBold, currentFontSize);
    const sanitized = sanitizeHTML(html);
    setHtmlValue(sanitized);
    
    if (onChange) {
      onChange(sanitized);
    }
  };

  // Bold 토글 (전체 텍스트)
  const handleBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const newBold = !isBold;
    setIsBold(newBold);

    // 현재 텍스트 추출
    const plainText = getTextContent(htmlValue);
    
    // 새 스타일 적용
    const newHtml = textToHTML(plainText, newBold, currentFontSize);
    const sanitized = sanitizeHTML(newHtml);
    
    setHtmlValue(sanitized);
    if (onChange) {
      onChange(sanitized);
    }
    
    // textarea는 자동으로 업데이트됨 (displayText가 변경되므로)
    textarea.focus();
  };

  // 폰트 크기 변경 (콤보박스)
  const handleFontSizeChange = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const newSize = parseInt(e.target.value);

    setCurrentFontSize(newSize);

    // 현재 텍스트 추출
    const plainText = getTextContent(htmlValue);
    
    // 새 스타일 적용
    const newHtml = textToHTML(plainText, isBold, newSize);
    const sanitized = sanitizeHTML(newHtml);
    
    setHtmlValue(sanitized);
    if (onChange) {
      onChange(sanitized);
    }
    
    // textarea는 자동으로 업데이트됨 (displayText가 변경되므로)
    textarea.focus();
  };

  // 엔터 키 처리
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      // 기본 동작(줄바꿈)을 허용하므로 preventDefault 불필요
      // textarea가 자동으로 줄바꿈을 처리하고, handleTextChange에서 <br>로 변환됨
    }
  };

  // HTML을 순수 텍스트로 변환 (textarea 표시용)
  const htmlToPlainText = (html) => {
    if (!html) return '';
    // <br> 태그를 줄바꿈으로 먼저 변환
    const withLineBreaks = html.replace(/<br\s*\/?>/gi, '\n');
    // 나머지 HTML 태그 제거
    const div = document.createElement('div');
    div.innerHTML = withLineBreaks;
    return div.textContent || div.innerText || '';
  };

  // 표시용 텍스트 (순수 텍스트만)
  const displayText = htmlToPlainText(htmlValue);

  return (
    <div className={`border-2 border-gray-300 rounded-xl overflow-hidden transition-all ${isFocused ? 'border-primary ring-2 ring-primary/20' : ''} ${className}`} style={style}>
      {/* 툴바 */}
      <div className="flex items-center gap-2 p-2.5 bg-gray-50 border-b border-gray-200">
        {/* Bold 버튼 */}
        <button
          type="button"
          onClick={handleBold}
          className={`p-2 rounded-lg transition-colors active:scale-95 ${
            isBold ? 'bg-gray-300' : 'hover:bg-gray-200'
          }`}
          title="진하게 (전체 텍스트)"
          aria-label="진하게"
        >
          <svg className={`w-4 h-4 ${isBold ? 'text-gray-900' : 'text-gray-700'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: 2.5 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
          </svg>
        </button>

        {/* 폰트 크기 콤보박스 */}
        <div className="flex items-center gap-2 border-l border-gray-300 pl-2 ml-1">
          <label htmlFor="fontSize" className="text-xs text-gray-600 font-medium whitespace-nowrap">
            폰트 크기:
          </label>
          <select
            id="fontSize"
            value={currentFontSize}
            onChange={handleFontSizeChange}
            className="px-2.5 py-1.5 rounded text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-colors cursor-pointer"
            title="폰트 크기 선택"
            aria-label="폰트 크기 선택"
          >
            <option value={10}>10px</option>
            <option value={12}>12px</option>
            <option value={14}>14px</option>
            <option value={16}>16px</option>
            <option value={18}>18px</option>
            <option value={20}>20px</option>
            <option value={24}>24px</option>
            <option value={28}>28px</option>
            <option value={32}>32px</option>
          </select>
        </div>
      </div>

      {/* 텍스트 입력 영역 */}
      <textarea
        ref={textareaRef}
        value={displayText}
        onChange={(e) => handleTextChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 bg-white resize-none focus:outline-none text-gray-900 placeholder-gray-400 text-sm"
        style={{
          fontSize: '15px',
          lineHeight: '1.6',
          minHeight: `${rows * 24}px`
        }}
      />
    </div>
  );
}

