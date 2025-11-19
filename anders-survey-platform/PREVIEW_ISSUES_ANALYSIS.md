# 미리보기 문제점 분석 및 해결 방안

## 🔍 문제점 분석

### 1. **StartPage (style 탭)**
- ❌ `min-h-screen` 사용 → 미리보기 영역(667px)에 맞지 않음
- ❌ `items-center justify-center` → 중앙 정렬로 인한 여백
- ❌ 내부 컨테이너 `minHeight: 720px` → 667px보다 큼
- ❌ `padding: 30px 0` → 불필요한 상하 여백

### 2. **CoverPreview (cover 탭)**
- ❌ 자체 프레임(`border-[6px]`) → MobilePreview 프레임과 중복
- ❌ `minHeight: 640px`, `maxHeight: 640px` → 고정 높이
- ❌ `absolute` 포지셔닝 버튼 → 스크롤 시 문제 가능

### 3. **QuestionPage (questions 탭)**
- ❌ `h-screen` 사용 → 전체 화면 높이
- ❌ `items-center justify-center` → 중앙 정렬
- ❌ `overflow-hidden` → 스크롤 불가능
- ❌ `absolute` 포지셔닝 → 미리보기 영역에 맞지 않음

### 4. **DonePage (ending 탭)**
- ❌ `h-screen`, `min-h-screen` 사용
- ❌ `items-center justify-center` → 중앙 정렬
- ❌ 전체 화면을 차지하려고 함

## 💡 해결 방안

### 방안 1: 각 컴포넌트에 `isPreview` prop 추가 (권장)
- 장점: 깔끔하고 유지보수 용이
- 단점: 각 컴포넌트 수정 필요

### 방안 2: CSS 강제 오버라이드 (현재 방식)
- 장점: 컴포넌트 수정 불필요
- 단점: `!important` 남용, 유지보수 어려움

### 방안 3: iframe 사용
- 장점: 완전한 격리
- 단점: 복잡도 증가, 통신 필요

### 방안 4: 미리보기 전용 컴포넌트 생성
- 장점: 실제 페이지와 완전 분리
- 단점: 코드 중복

## ✅ 추천 해결책

**방안 1 + 방안 2 조합**:
1. 각 컴포넌트에 `isPreview` prop 추가
2. 미리보기 모드일 때 스타일 완전 오버라이드
3. CSS로 추가 보완

