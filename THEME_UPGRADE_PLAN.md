# Theme Upgrade 전체 실행 계획서

**기준 문서**: `cursor-theme-upgrade_final_v2.md`  
**목표**: 기존 기능 보존 + 참가자 UX 개선 + 관리자 UI 개선  
**원칙**: 비파괴, 모바일 퍼스트, 일관성, 가시성, 접근성

---

## 📋 전체 개요

### 범위
- **프론트엔드**: React + Vite + Tailwind CSS
- **백엔드**: Express + MongoDB (API 계약 유지)
- **제외**: 데이터 스키마 변경, API 계약 변경, 텍스트 요약 기능
- **포함**: 한국어 + 영어 다국어 지원

### 예상 기간
- **총 기간**: 8-10주
- **Phase 1**: 1주 (기반 구축)
- **Phase 2**: 2주 (참가자 UX)
- **Phase 3**: 2주 (관리자 UI)
- **Phase 4**: 3주 (기능 확장)
- **Phase 5**: 1-2주 (최적화 및 테스트)

---

## 🎯 Phase 1: 기반 구축 (1주)

### 목표
안전한 전환을 위한 인프라 구축 및 테마 시스템 강화

### 작업 항목

#### 1.1 Feature Toggle 시스템 ✅ (완료)
- [x] `.env` 파일 생성 (`VITE_FEATURE_THEME_V2=false`)
- [x] `src/utils/featureToggle.js` 유틸리티 생성
- [x] `vite.config.js`에 환경 변수 접두사 설정
- [ ] `App.jsx`에 Feature Toggle 적용 예시 추가

#### 1.2 테마 시스템 강화 ✅ (완료)
- [x] `src/styles/theme.css` 생성 (Design Tokens)
- [x] `tailwind.config.js` 확장 (색상, 간격, 폰트, 그림자)
- [x] `index.css`에 theme.css import
- [ ] 테마 동적 적용 함수 생성 (서버에서 테마 fetch → CSS 변수 주입)

#### 1.3 레거시 보존 구조 ✅ (완료)
- [x] `src/legacy/` 폴더 생성
- [x] README.md 작성
- [ ] 기존 컴포넌트 백업 계획 수립

#### 1.4 필요한 라이브러리 설치 (예정)
```bash
npm install recharts framer-motion @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities qrcode.react react-hotkeys-hook
```

#### 1.5 다국어 지원 기반 ✅ (완료)
- [x] `src/i18n/index.js` 생성
- [x] 한국어/영어 번역 기본 구조
- [ ] 언어 선택 UI 컴포넌트 생성
- [ ] 기존 텍스트를 i18n으로 마이그레이션

### 산출물
- Feature Toggle 시스템
- Design Tokens 체계
- 다국어 시스템
- 레거시 보존 구조

---

## 🎨 Phase 2: 참가자 UX 개선 (2주)

### 목표
참가자가 쉽고 재밌게 설문에 참여할 수 있도록 개선

### 작업 항목

#### 2.1 라우팅 구조 변경
- [ ] `/s/:slug` 라우트 추가
- [ ] 단계별 네비게이션 구현:
  - `/s/:slug/start` - 소개 및 동의
  - `/s/:slug/q/:step` - 질문 단계
  - `/s/:slug/review` - 응답 검토
  - `/s/:slug/done` - 완료 화면
- [ ] 기존 `/surveys/:surveyId` 라우트는 레거시로 보존

#### 2.2 UI 컴포넌트 개발
- [ ] `components/ui/ProgressBar.tsx` - 진행률 표시
- [ ] `components/ui/BottomNav.tsx` - 하단 고정 네비게이션
- [ ] `components/ui/QuestionCard.tsx` - 질문 카드 (원 스크린 원 포커스)
- [ ] `components/ui/ChoiceTile.tsx` - 선택 옵션 타일
- [ ] `components/ui/ErrorHint.tsx` - 오류 메시지 표시
- [ ] `components/ui/ReviewCardList.tsx` - 검토 화면 카드 리스트
- [ ] `components/ui/ResultBadge.tsx` - 결과 배지

#### 2.3 참가자 페이지 구현
- [ ] `pages/participant/StartPage.tsx` - 시작 페이지
- [ ] `pages/participant/QuestionPage.tsx` - 질문 페이지
- [ ] `pages/participant/ReviewPage.tsx` - 검토 페이지
- [ ] `pages/participant/DonePage.tsx` - 완료 페이지

#### 2.4 상호작용 개선
- [ ] 입력 즉시 유효성 검사
- [ ] 터치 타깃 44px 이상 확보
- [ ] 키보드 접근성 지원
- [ ] 낙관적 UI (로딩 상태)
- [ ] 마이크로카피 적용

### 산출물
- 새로운 참가자 라우팅 구조
- 참가자용 UI 컴포넌트 세트
- 개선된 참가자 경험

---

## 🛠️ Phase 3: 관리자 UI 개선 (2주)

### 목표
관리자가 단순하고 빠르게 설문을 관리할 수 있도록 개선

### 작업 항목

#### 3.1 3패널 레이아웃 구현
- [ ] `components/admin/Sidebar.tsx` - 좌측 고정 내비게이션
- [ ] `components/admin/Topbar.tsx` - 상단바 (브레드크럼, 프로필)
- [ ] `components/admin/PropertyPanel.tsx` - 우측 속성 패널
- [ ] 레이아웃 그리드 시스템 구축

#### 3.2 관리자 페이지 구조화
- [ ] `pages/admin/Dashboard.tsx` - 대시보드
- [ ] `pages/admin/SurveyList.tsx` - 설문 목록 (기존 개선)
- [ ] `pages/admin/Builder.tsx` - 빌더 (3패널 레이아웃)
- [ ] `pages/admin/Analytics.tsx` - 분석 페이지
- [ ] `pages/admin/Settings.tsx` - 설정 페이지

#### 3.3 드래그앤드롭 구현
- [ ] `@dnd-kit/core` 통합
- [ ] 문항 정렬 기능
- [ ] 복제 기능
- [ ] 템플릿 삽입 기능

#### 3.4 단축키 지원
- [ ] `react-hotkeys-hook` 통합
- [ ] `Ctrl+S` - 저장
- [ ] `+` - 문항 추가
- [ ] `Del` - 삭제
- [ ] 단축키 가이드 표시

#### 3.5 관리자 컴포넌트 개발
- [ ] `components/admin/StatCard.tsx` - 통계 카드
- [ ] `components/admin/SurveyCard.tsx` - 설문 카드
- [ ] `components/admin/QuestionList.tsx` - 문항 목록
- [ ] `components/admin/QuestionEditor.tsx` - 문항 편집기
- [ ] `components/admin/ChartView.tsx` - 차트 뷰
- [ ] `components/admin/FilterBar.tsx` - 필터 바
- [ ] `components/admin/ThemeSettings.tsx` - 테마 설정

### 산출물
- 3패널 관리자 레이아웃
- 드래그앤드롭 기능
- 단축키 지원
- 개선된 관리자 경험

---

## 🚀 Phase 4: 기능 확장 (3주)

### 목표
핵심 기능 추가 및 확장

### 작업 항목

#### 4.1 진행 설정 4종 UI
- [ ] 상태 토글 버튼 (저장만/바로 진행/예약 진행/일시정지)
- [ ] 날짜·시간 피커 (12시간제, 분 10단위)
- [ ] 기존 `status`, `startAt`, `endAt` 필드 활용
- [ ] UI만 추가 (API 계약 유지)

#### 4.2 배포/접근 제어
- [ ] 퍼블릭/비공개 링크 설정
- [ ] 응답 1회 제한 (쿠키+IP+토큰 조합)
- [ ] 만료일 설정
- [ ] 단축 URL `/go/:slug` 프록시
- [ ] QR 코드 즉시 생성 (`qrcode.react`)
- [ ] `components/admin/SharePanel.tsx` 구현

#### 4.3 분석 대시보드
- [ ] Chart.js → Recharts 전환
- [ ] 요약 카드 (NPS/CSAT/응답수/완료율)
- [ ] 기간/채널 필터
- [ ] CSV/XLSX 내보내기
- [ ] 차트 타입 (막대/도넛/추이)

#### 4.4 로직/분기 편집기 (옵션)
- [ ] `components/admin/LogicRuleEditor.tsx`
- [ ] 조건 기반 질문 스킵
- [ ] 점수 기반 분기

### 산출물
- 진행 설정 UI
- 배포/접근 제어 기능
- 분석 대시보드
- 로직 편집기 (옵션)

---

## ⚡ Phase 5: 최적화 및 테스트 (1-2주)

### 목표
성능, 접근성, 안정성 개선

### 작업 항목

#### 5.1 접근성 개선
- [ ] 포커스 링 추가
- [ ] 스크린리더 라벨 추가
- [ ] 색 대비 AA 준수
- [ ] 키보드 네비게이션 테스트

#### 5.2 성능 최적화
- [ ] 3G 기준 첫 페인트 ≤ 2초 목표
- [ ] 이미지 `loading="lazy"` 적용
- [ ] 코드 스플리팅
- [ ] 번들 크기 최적화

#### 5.3 E2E 테스트
- [ ] Playwright 설정
- [ ] 핵심 플로우 6개 스냅샷:
  1. 로그인
  2. 설문 생성
  3. 미리보기
  4. 배포
  5. 응답 제출
  6. 통계 조회

#### 5.4 점진적 롤아웃 준비
- [ ] Feature Toggle 테스트
- [ ] 레거시/신규 UI 전환 테스트
- [ ] 모니터링 설정

### 산출물
- 접근성 개선
- 성능 최적화
- E2E 테스트 스위트
- 롤아웃 준비 완료

---

## 📦 필요한 라이브러리

### 필수
```json
{
  "recharts": "^2.x",
  "framer-motion": "^11.x",
  "@dnd-kit/core": "^6.x",
  "@dnd-kit/sortable": "^8.x",
  "@dnd-kit/utilities": "^3.x",
  "qrcode.react": "^3.x",
  "react-hotkeys-hook": "^4.x"
}
```

### 옵션
- `react-color` (색상 선택기)
- `jsPDF` (PDF 내보내기)
- `xlsx` (Excel 내보내기)

---

## 🔄 의존성 관계

```
Phase 1 (기반 구축)
  ↓
Phase 2 (참가자 UX) ──┐
                      ├──→ Phase 4 (기능 확장)
Phase 3 (관리자 UI) ──┘
  ↓
Phase 5 (최적화 및 테스트)
```

**병렬 진행 가능**: Phase 2와 Phase 3은 독립적으로 진행 가능

---

## ⚠️ 리스크 및 대응 방안

### 리스크 1: 기존 기능 회귀
- **대응**: 레거시 보존, Feature Toggle, E2E 테스트

### 리스크 2: 성능 저하
- **대응**: 코드 스플리팅, 이미지 최적화, 번들 분석

### 리스크 3: 접근성 미준수
- **대응**: 접근성 체크리스트, 자동화 테스트

### 리스크 4: 일정 지연
- **대응**: 우선순위 조정, MVP 먼저 출시

---

## 📊 우선순위 매트릭스

| 항목 | 중요도 | 긴급도 | 우선순위 |
|------|--------|--------|----------|
| Feature Toggle | 높음 | 높음 | P0 |
| 테마 시스템 | 높음 | 높음 | P0 |
| 참가자 UX 개선 | 높음 | 중 | P1 |
| 관리자 UI 개선 | 높음 | 중 | P1 |
| 진행 설정 UI | 중 | 낮음 | P2 |
| 배포/접근 제어 | 중 | 낮음 | P2 |
| 분석 대시보드 | 중 | 낮음 | P2 |
| 로직 편집기 | 낮음 | 낮음 | P3 |

---

## ✅ Definition of Done

### 참가자
- [ ] 3G에서 첫 페인트 ≤ 2초
- [ ] 진행률·저장 상태 항상 표기
- [ ] Review 화면에서 누락/오류 일괄 확인 및 즉시 수정 가능
- [ ] 키보드·리더 접근 정상

### 관리자
- [ ] "문항 추가 → 미리보기 → 배포 링크 복사" 3클릭 이내
- [ ] 드래그 정렬/복제/단축키 동작
- [ ] 통계 카드 필터·내보내기 가능

---

## 🚦 다음 단계

1. **이 계획서 검토 및 승인**
2. **Phase 1 완료 확인** (현재 진행 중)
3. **필요한 라이브러리 설치**
4. **Phase 2 또는 Phase 3 선택하여 진행**

---

## 📝 참고 사항

- 모든 변경사항은 Feature Toggle로 보호
- 기존 API 계약 및 데이터 스키마 변경 금지
- 레거시 코드는 `src/legacy/`에 보존
- 다국어는 한국어 + 영어만 지원
- 텍스트 요약 기능은 제외



