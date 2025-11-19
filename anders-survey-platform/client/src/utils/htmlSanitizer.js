// HTML 정제 유틸리티 - 허용된 태그만 통과시키는 안전한 함수

/**
 * 허용된 HTML 태그와 속성만 통과시키는 정제 함수
 * @param {string} html - 정제할 HTML 문자열
 * @returns {string} - 정제된 HTML 문자열
 */
export function sanitizeHTML(html) {
  if (!html || typeof html !== 'string') return '';

  // 허용된 태그와 속성 정의
  const allowedTags = {
    'strong': [],
    'b': [],
    'br': [],
    'span': ['style'],
    'p': []
  };

  // 스크립트 태그와 이벤트 핸들러 제거
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '');

  // 허용된 태그만 유지
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    const lowerTag = tagName.toLowerCase();
    
    // 허용된 태그인지 확인
    if (allowedTags[lowerTag] !== undefined) {
      // span 태그의 경우 style 속성만 허용
      if (lowerTag === 'span') {
        const styleMatch = match.match(/style\s*=\s*["']([^"']*)["']/i);
        if (styleMatch) {
          // font-size만 허용
          const styleValue = styleMatch[1];
          if (/font-size\s*:\s*\d+px/i.test(styleValue)) {
            return match;
          }
          // style 속성이 font-size가 아니면 제거
          return match.replace(/\s*style\s*=\s*["'][^"']*["']/i, '');
        }
      }
      return match;
    }
    // 허용되지 않은 태그는 제거
    return '';
  });

  return sanitized;
}

/**
 * 텍스트를 HTML로 변환 (줄바꿈 처리)
 * @param {string} text - 변환할 텍스트
 * @returns {string} - HTML 문자열
 */
export function textToHTML(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/\n/g, '<br>');
}

