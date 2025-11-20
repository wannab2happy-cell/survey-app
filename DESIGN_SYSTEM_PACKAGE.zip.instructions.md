# 디자인 시스템 패키지 사용 가이드

## 📦 패키지 구성

이 디자인 시스템을 다른 프로젝트에서 사용하려면 다음 파일들을 복사하세요:

### 필수 파일

1. **디자인 토큰**
   - `client/src/styles/theme.css`
   - `client/src/index.css` (일부 - CSS 변수 부분만)

2. **Tailwind 설정**
   - `client/tailwind.config.js`

3. **UI 컴포넌트 (선택사항)**
   - `client/src/components/ui/InputField.jsx`
   - `client/src/components/ui/BottomNav.jsx`
   - `client/src/components/ui/ChoiceTile.jsx`
   - `client/src/components/ui/ProgressBar.jsx`
   - `client/src/components/ui/QuestionCard.jsx`
   - `client/src/components/ui/CustomSelect.jsx`

### 설치 필요 패키지

```bash
npm install tailwindcss postcss autoprefixer
npm install framer-motion  # 애니메이션용
```

---

## 🚀 빠른 시작

### 1. 파일 구조 생성

```
your-project/
├── src/
│   ├── styles/
│   │   └── theme.css          # 복사
│   ├── components/
│   │   └── ui/                # UI 컴포넌트 복사
│   └── index.css              # theme.css import 추가
├── tailwind.config.js         # 복사
└── package.json
```

### 2. CSS 설정

`src/index.css`:
```css
@import "tailwindcss";
@import "./styles/theme.css";

/* 기본 스타일 */
* {
  font-family: var(--font-body, 'Pretendard', sans-serif);
  box-sizing: border-box;
}
```

### 3. Tailwind 설정 확인

`tailwind.config.js`의 `content` 배열을 프로젝트 경로에 맞게 수정:
```js
content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}',
]
```

### 4. 색상 커스터마이징

`src/styles/theme.css`에서 브랜드 색상 변경:
```css
:root {
  --primary: #YOUR_BRAND_COLOR;
  --primary-hover: #YOUR_HOVER_COLOR;
}
```

---

## 📝 주요 디자인 패턴

### 버튼 스타일

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

### 입력 필드 스타일

```jsx
<input 
  className="w-full px-5 py-3.5 rounded-lg border-2 border-primary bg-white focus:ring-2 focus:ring-primary"
  style={{ fontSize: '15px', fontWeight: 400 }}
/>
```

### 카드 스타일

```jsx
<div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
  카드 내용
</div>
```

---

## 🎨 색상 시스템

### 기본 색상
- **Primary**: `#26C6DA` (청록색)
- **Secondary**: `#F59E0B` (주황색)
- **Success**: `#10B981` (초록색)
- **Error**: `#EF4444` (빨간색)

### 사용 방법
```jsx
// Tailwind 클래스로 사용
<div className="bg-primary text-white">...</div>
<div className="text-text-main">...</div>

// CSS 변수로 직접 사용
<div style={{ backgroundColor: 'var(--primary)' }}>...</div>
```

---

## 📐 간격 시스템

```jsx
// Tailwind spacing 사용
<div className="p-4">     {/* 16px */}
<div className="p-6">     {/* 24px */}
<div className="gap-3">   {/* 12px */}

// CSS 변수로 사용
<div style={{ padding: 'var(--space-4)' }}>...</div>
```

---

## 🔤 타이포그래피

```jsx
// 폰트 크기
<p className="text-sm">     {/* 14px */}
<p className="text-base">   {/* 16px */}
<p className="text-lg">     {/* 18px */}

// 폰트 두께
<p className="font-normal">   {/* 400 */}
<p className="font-medium">   {/* 500 */}
<p className="font-semibold"> {/* 600 */}
<p className="font-bold">     {/* 700 */}
```

---

## 💾 저장 위치

이 가이드와 함께 다음 파일들을 함께 저장하세요:
- `DESIGN_SYSTEM.md` (이 파일)
- `client/src/styles/theme.css`
- `client/tailwind.config.js`
- `client/src/components/ui/*.jsx` (필요한 컴포넌트만)

