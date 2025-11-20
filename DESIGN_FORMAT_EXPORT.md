# 디자인 포맷 내보내기 가이드

이 프로젝트의 디자인 시스템을 다른 프로젝트에서 재사용하기 위한 완전한 가이드입니다.

## 📋 복사할 파일 목록

### 1. 디자인 토큰 (필수)
```
anders-survey-platform/client/src/styles/theme.css
anders-survey-platform/client/src/index.css (CSS 변수 부분만)
```

### 2. Tailwind 설정 (필수)
```
anders-survey-platform/client/tailwind.config.js
```

### 3. UI 컴포넌트 (선택)
```
anders-survey-platform/client/src/components/ui/InputField.jsx
anders-survey-platform/client/src/components/ui/BottomNav.jsx
anders-survey-platform/client/src/components/ui/ChoiceTile.jsx
anders-survey-platform/client/src/components/ui/ProgressBar.jsx
anders-survey-platform/client/src/components/ui/QuestionCard.jsx
anders-survey-platform/client/src/components/ui/CustomSelect.jsx
anders-survey-platform/client/src/components/ui/ErrorHint.jsx
```

---

## 🎨 핵심 디자인 토큰

### 색상 팔레트
```css
/* Primary (브랜드 컬러) */
--primary: #26C6DA;           /* 청록색 */
--primary-hover: #00ACC1;     /* 호버 */

/* 상태 색상 */
--secondary: #F59E0B;         /* 주황 */
--success: #10B981;           /* 초록 */
--error: #EF4444;             /* 빨강 */

/* 텍스트 */
--text-main: #111827;         /* 메인 텍스트 */
--text-sub: #6B7280;          /* 서브 텍스트 */

/* 배경 */
--bg: #F9FAFB;                /* 배경 */
--white: #FFFFFF;             /* 흰색 */
--border: #E5E7EB;            /* 테두리 */
```

### 간격 시스템
- `--space-1` ~ `--space-12`: 4px ~ 48px
- Tailwind: `p-1`, `p-2`, `p-3`, `p-4`, `p-6`, `p-8` 등

### 둥근 모서리
- `--radius-sm`: 4px
- `--radius-md`: 12px
- `--radius-lg`: 16px
- `--radius-xl`: 20px
- `--radius-full`: 9999px

### 폰트
- **패밀리**: Pretendard (한글 최적화)
- **크기**: xs(12px) ~ 4xl(36px)
- **두께**: normal(400) ~ bold(700)

---

## 🧩 컴포넌트 스타일 가이드

### 버튼
```jsx
// Primary 버튼
<button className="px-6 py-3.5 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-all">
  버튼
</button>

// Secondary 버튼
<button className="px-6 py-3.5 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all">
  버튼
</button>
```

### 입력 필드
```jsx
<input 
  className="w-full px-5 py-3.5 rounded-lg border-2 border-primary bg-white focus:ring-2 focus:ring-primary"
  style={{ fontSize: '15px', fontWeight: 400 }}
/>
```

### 카드
```jsx
<div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
  카드 내용
</div>
```

### 선택 타일 (라디오/체크박스)
```jsx
<button className="w-full px-5 py-4 rounded-xl border-2 border-gray-300 text-left transition-all hover:border-primary">
  <div className="flex items-center gap-4">
    <div className="w-6 h-6 rounded-full border-2 border-primary"></div>
    <span className="text-base">옵션 텍스트</span>
  </div>
</button>
```

---

## 📐 레이아웃 패턴

### 관리자 페이지
- **헤더**: 고정, 탭 네비게이션 + 액션 버튼
- **메인**: 좌우 분할 (설정 영역 + 미리보기)
- **카드**: 흰색 배경, 그림자, 둥근 모서리

### 참가자 페이지 (모바일 퍼스트)
- **전체 화면**: 단일 질문에 집중
- **상단**: 진행률 바 (고정)
- **중앙**: 질문 카드 + 입력 필드 (80% 너비)
- **하단**: 네비게이션 버튼 (고정)

---

## 🚀 적용 방법

### Step 1: 파일 복사
```bash
# 디자인 토큰
cp anders-survey-platform/client/src/styles/theme.css your-project/src/styles/

# Tailwind 설정
cp anders-survey-platform/client/tailwind.config.js your-project/

# UI 컴포넌트 (필요한 것만)
cp -r anders-survey-platform/client/src/components/ui your-project/src/components/
```

### Step 2: CSS Import
```css
/* your-project/src/index.css */
@import "tailwindcss";
@import "./styles/theme.css";
```

### Step 3: Tailwind 설정 수정
`tailwind.config.js`의 `content` 경로를 프로젝트에 맞게 수정:
```js
content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}',
]
```

### Step 4: 색상 커스터마이징
`src/styles/theme.css`에서 브랜드 색상 변경:
```css
:root {
  --primary: #YOUR_BRAND_COLOR;
  --primary-hover: #YOUR_HOVER_COLOR;
}
```

---

## 📦 필요한 패키지

```json
{
  "dependencies": {
    "tailwindcss": "^3.x",
    "framer-motion": "^10.x"
  }
}
```

---

## 💡 주요 특징

1. **CSS 변수 기반**: 색상/간격/폰트를 CSS 변수로 관리하여 일괄 변경 가능
2. **Tailwind 통합**: Tailwind 클래스로 쉽게 사용 가능
3. **모바일 퍼스트**: 반응형 디자인 기본 적용
4. **접근성**: 최소 터치 타깃 크기(44px) 준수
5. **일관성**: 디자인 토큰으로 전체 일관성 유지

---

## 🔗 파일 위치 요약

| 파일 | 경로 |
|------|------|
| 디자인 토큰 | `client/src/styles/theme.css` |
| 전역 스타일 | `client/src/index.css` |
| Tailwind 설정 | `client/tailwind.config.js` |
| UI 컴포넌트 | `client/src/components/ui/*.jsx` |

---

## ✨ 사용 예시

### 간단한 페이지 구조
```jsx
// 레이아웃
<div className="min-h-screen bg-bg">
  {/* 헤더 */}
  <header className="bg-white border-b border-gray-200 px-6 py-4">
    <h1 className="text-2xl font-bold text-text-main">제목</h1>
  </header>
  
  {/* 메인 콘텐츠 */}
  <main className="max-w-4xl mx-auto p-6">
    <div className="bg-white rounded-xl shadow-md p-6">
      <input className="w-full px-5 py-3.5 rounded-lg border-2 border-primary" />
      <button className="mt-4 px-6 py-3 bg-primary text-white rounded-lg font-semibold">
        저장
      </button>
    </div>
  </main>
</div>
```

이 디자인 시스템을 사용하면 일관된 UI를 빠르게 구축할 수 있습니다!

