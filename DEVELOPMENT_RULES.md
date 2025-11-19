# 개발 규칙 문서 (Development Rules)

**버전**: v1.0.0  
**작성 일자**: 2024-12-19  
**목적**: 기존 기능과 자료를 보존하면서 디자인과 기능을 개선하기 위한 개발 규칙

---

## 🎯 핵심 원칙

### 1. 기존 기능 보존 원칙 (Non-Destructive Principle)
**⚠️ 절대 규칙**: 기존 기능이나 자료를 삭제하거나 비활성화하지 않습니다.

- ✅ **허용**: 새로운 기능 추가, 디자인 개선, 기능 개선
- ❌ **금지**: 기존 기능 삭제, 기존 라우트 제거, 기존 컴포넌트 비활성화
- ✅ **예외**: 사용자가 명시적으로 요청한 경우에만 삭제 가능

### 2. 하위 호환성 유지 원칙 (Backward Compatibility)
기존 코드와 데이터 구조를 변경할 때는 하위 호환성을 유지해야 합니다.

- 기존 API 엔드포인트는 유지
- 기존 데이터 구조 변경 시 마이그레이션 제공
- 기존 라우트는 유지 (새로운 라우트 추가 가능)

### 3. Feature Toggle 사용 원칙
새로운 기능을 추가할 때는 Feature Toggle을 사용하여 기존 기능과 공존합니다.

```javascript
// 예시: Feature Toggle 사용
const isNewFeatureEnabled = isFeatureEnabled('NEW_FEATURE');
{isNewFeatureEnabled ? <NewComponent /> : <LegacyComponent />}
```

---

## 📋 수정 전 필수 체크리스트

### 수정 전 확인 사항
- [ ] 수정하려는 파일이 `VERSION_FREEZE_v1.0.0.md`에 나열되어 있는가?
- [ ] 수정하려는 기능이 `FEATURE_FREEZE.md`에 나열되어 있는가?
- [ ] 수정이 다른 기능에 영향을 주는가?
- [ ] 기존 라우트나 API 엔드포인트를 변경하는가?

### 수정 중 확인 사항
- [ ] 기존 함수나 이벤트 핸들러를 삭제하지 않았는가?
- [ ] 기존 import 문을 삭제하지 않았는가?
- [ ] 조건부 렌더링으로 기능이 완전히 숨겨지지 않는가?
- [ ] 기존 컴포넌트를 새로운 컴포넌트로 완전히 대체하지 않았는가?

### 수정 후 확인 사항
- [ ] 모든 메뉴 항목이 사이드바에 표시되는가?
- [ ] 모든 탭이 빌더에 표시되는가?
- [ ] 모든 버튼이 클릭 가능한가?
- [ ] 모든 라우트가 정상 작동하는가?
- [ ] 기존 데이터가 정상적으로 로드되는가?

---

## 🔒 보호 대상 (Protected Items)

### 1. 라우트 (Routes)
다음 라우트는 절대 삭제하거나 변경하면 안 됩니다.

#### 메인 라우트 (App.jsx)
- `/` → `/login` 리다이렉트
- `/login` → Login 컴포넌트
- `/surveys` → SurveyPage (레거시)
- `/surveys/:surveyId` → SurveyPage (레거시)
- `/s/:slug` → SurveyPageV2 (V2)
- `/s/:slug/start` → SurveyPageV2 (V2)
- `/s/:slug/q/:step` → SurveyPageV2 (V2)
- `/s/:slug/review` → SurveyPageV2 (V2)
- `/s/:slug/done` → SurveyPageV2 (V2)
- `/builder` → SurveyBuilder
- `/admin/*` → AdminV2 또는 Admin
- `*` → NotFound

#### 관리자 라우트 (AdminV2.jsx)
- `/admin/dashboard` → Dashboard
- `/admin` → SurveyList
- `/admin/builder` → SurveyBuilder
- `/admin/builder/:id` → SurveyBuilder
- `/admin/results/:id` → SurveyResults
- `/admin/analytics` → Analytics
- `/admin/settings` → Settings

### 2. 컴포넌트 (Components)
다음 컴포넌트는 절대 삭제하면 안 됩니다.

#### 페이지 컴포넌트
- `pages/Dashboard.jsx`
- `pages/SurveyList.jsx`
- `pages/SurveyBuilder.jsx`
- `pages/SurveyResults.jsx`
- `pages/Analytics.jsx`
- `pages/Admin/Settings.jsx`
- `pages/participant/StartPage.jsx`
- `pages/participant/QuestionPage.jsx`
- `pages/participant/ReviewPage.jsx`
- `pages/participant/DonePage.jsx`
- `pages/SurveyPage.jsx` (레거시)
- `pages/SurveyPageV2.jsx` (V2)
- `pages/Admin.jsx` (레거시)
- `pages/AdminV2.jsx` (V2)

#### UI 컴포넌트
- `components/admin/Sidebar.jsx`
- `components/admin/Topbar.jsx`
- `components/admin/PropertyPanel.jsx`
- `components/builder/Step1_Settings.jsx`
- `components/builder/Step2_Cover.jsx`
- `components/builder/Step3_Questions.jsx`
- `components/builder/Step4_Ending.jsx`
- `components/ImageUpload.jsx`
- `components/builder/QuestionCard.jsx`

### 3. 기능 (Features)
다음 기능은 절대 삭제하거나 비활성화하면 안 됩니다.

#### 사이드바 메뉴
- 대시보드 (📊)
- 설문 목록 (📋)
- 설문 만들기 (➕)
- 분석 (📈)
- 설정 (⚙️)
- 로그아웃 (🚪)

#### 설문 빌더 탭
- 스타일 탭
- 커버 탭
- 문제 탭
- 엔딩 탭
- 퍼블리싱 탭

#### 설문 빌더 기능
- 질문 추가 버튼
- 질문 유형 선택
- 질문 이미지 업로드
- 옵션 이미지 업로드
- 설문 저장 버튼
- 미리보기 버튼
- 공유 버튼

### 4. API 엔드포인트 (API Endpoints)
다음 API 엔드포인트는 절대 삭제하면 안 됩니다.

#### 인증
- `POST /api/auth/login`
- `POST /api/auth/signup`

#### 설문
- `GET /api/surveys`
- `POST /api/surveys`
- `GET /api/surveys/:id`
- `PUT /api/surveys/:id`
- `DELETE /api/surveys/:id`
- `POST /api/surveys/:id/responses`

#### 관리자
- `GET /api/admin/dashboard`
- `GET /api/admin/analytics`

#### 설정
- `GET /api/settings`
- `PUT /api/settings`
- `GET /api/branding`
- `PUT /api/branding`

---

## 🛠️ 수정 가이드라인

### 1. 디자인 개선 (Design Improvement)

#### 허용되는 작업
- ✅ CSS 스타일 수정
- ✅ 컴포넌트 레이아웃 개선
- ✅ 색상, 폰트, 간격 조정
- ✅ 애니메이션 추가
- ✅ 반응형 디자인 개선

#### 주의사항
- ❌ 컴포넌트를 완전히 새로 작성하지 않기
- ❌ 기존 클래스명을 변경하지 않기 (CSS만 수정)
- ❌ 기존 props 구조를 변경하지 않기

#### 예시
```jsx
// ✅ 좋은 예: CSS만 수정
<div className="survey-card">  // 클래스명 유지
  {/* 내용 */}
</div>

// ❌ 나쁜 예: 컴포넌트 구조 변경
<div className="new-survey-card">  // 클래스명 변경
  {/* 완전히 다른 구조 */}
</div>
```

### 2. 기능 개선 (Feature Enhancement)

#### 허용되는 작업
- ✅ 기존 기능의 버그 수정
- ✅ 기존 기능의 성능 개선
- ✅ 기존 기능에 옵션 추가
- ✅ 새로운 기능 추가 (기존 기능 유지)

#### 주의사항
- ❌ 기존 기능을 완전히 대체하지 않기
- ❌ 기존 함수 시그니처 변경하지 않기
- ❌ 기존 데이터 구조 변경 시 마이그레이션 제공

#### 예시
```javascript
// ✅ 좋은 예: 기존 함수에 옵션 추가
function handleSave(survey, options = {}) {
  // 기존 로직 유지
  const { autoSave = false } = options;
  // 새로운 기능 추가
}

// ❌ 나쁜 예: 기존 함수 완전히 변경
function handleSaveNew(survey) {
  // 완전히 다른 로직
}
```

### 3. 새로운 기능 추가 (New Feature Addition)

#### 허용되는 작업
- ✅ 새로운 컴포넌트 추가
- ✅ 새로운 라우트 추가
- ✅ 새로운 API 엔드포인트 추가
- ✅ Feature Toggle로 새 기능 활성화/비활성화

#### 주의사항
- ❌ 기존 기능을 대체하지 않기
- ❌ 기존 라우트를 변경하지 않기
- ❌ Feature Toggle 사용하여 기존 기능과 공존

#### 예시
```jsx
// ✅ 좋은 예: Feature Toggle 사용
{isNewFeatureEnabled ? (
  <NewComponent />
) : (
  <LegacyComponent />  // 기존 컴포넌트 유지
)}

// ✅ 좋은 예: 새로운 라우트 추가
<Route path="/new-feature" element={<NewFeature />} />
// 기존 라우트는 그대로 유지
```

### 4. 코드 리팩토링 (Code Refactoring)

#### 허용되는 작업
- ✅ 코드 가독성 개선
- ✅ 중복 코드 제거
- ✅ 함수 분리
- ✅ 변수명 개선

#### 주의사항
- ❌ 기존 함수 시그니처 변경하지 않기
- ❌ 기존 컴포넌트 props 변경하지 않기
- ❌ 기존 API 응답 구조 변경하지 않기

#### 예시
```javascript
// ✅ 좋은 예: 내부 로직만 개선
function handleSave(survey) {
  // 기존 시그니처 유지
  // 내부 로직만 개선
  const validatedSurvey = validateSurvey(survey);
  return saveToDatabase(validatedSurvey);
}

// ❌ 나쁜 예: 시그니처 변경
function saveSurvey(newSurvey, options) {
  // 시그니처가 완전히 변경됨
}
```

---

## 🔍 수정 검증 방법

### 1. 기능 테스트 (Feature Testing)
수정 후 다음 기능들이 정상 작동하는지 확인:

- [ ] 로그인/로그아웃
- [ ] 설문 목록 조회
- [ ] 설문 생성/수정/삭제
- [ ] 설문 응답 제출
- [ ] 대시보드 통계
- [ ] 분석 페이지
- [ ] 설정 페이지

### 2. 라우트 테스트 (Route Testing)
모든 라우트가 정상 작동하는지 확인:

- [ ] `/login` → 로그인 페이지
- [ ] `/admin` → 설문 목록
- [ ] `/admin/dashboard` → 대시보드
- [ ] `/admin/builder` → 설문 빌더
- [ ] `/admin/analytics` → 분석
- [ ] `/admin/settings` → 설정
- [ ] `/s/:slug` → 설문 참여 (V2)
- [ ] `/surveys/:surveyId` → 설문 참여 (레거시)

### 3. UI 테스트 (UI Testing)
모든 UI 요소가 정상 표시되는지 확인:

- [ ] 사이드바 메뉴 항목
- [ ] 설문 빌더 탭
- [ ] 모든 버튼
- [ ] 모든 입력 필드
- [ ] 모든 이미지 업로드
- [ ] 모든 차트/그래프

### 4. 데이터 테스트 (Data Testing)
기존 데이터가 정상적으로 로드되는지 확인:

- [ ] 기존 설문 데이터 로드
- [ ] 기존 응답 데이터 로드
- [ ] 기존 설정 데이터 로드
- [ ] 기존 브랜딩 데이터 로드

---

## 📝 수정 이력 관리

### 변경 사항 기록
수정할 때는 반드시 다음 정보를 기록:

1. **수정 일자**: YYYY-MM-DD
2. **수정 파일**: 파일 경로
3. **수정 내용**: 무엇을 수정했는지
4. **영향 범위**: 어떤 기능에 영향을 주는지
5. **테스트 결과**: 테스트 통과 여부

### 변경 사항 예시
```markdown
## 변경 이력

### 2024-12-19
- **파일**: `client/src/components/admin/Sidebar.jsx`
- **내용**: 사이드바 배경색 변경 (회색 → 흰색)
- **영향**: 사이드바 디자인만 변경, 기능 변경 없음
- **테스트**: ✅ 통과
```

---

## ⚠️ 주의사항

### 절대 하지 말아야 할 것
1. ❌ 기존 기능 삭제
2. ❌ 기존 라우트 제거
3. ❌ 기존 컴포넌트 완전 대체
4. ❌ 기존 API 엔드포인트 제거
5. ❌ 기존 데이터 구조 파괴적 변경
6. ❌ 조건부 렌더링으로 기능 완전 숨김

### 의심스러울 때
의심스러울 때는 반드시 사용자에게 확인을 요청하세요:

- 기존 기능을 변경해야 하는 경우
- 기존 라우트를 변경해야 하는 경우
- 기존 컴포넌트를 대체해야 하는 경우
- 기존 데이터 구조를 변경해야 하는 경우

---

## 📚 참고 문서

- [VERSION_FREEZE_v1.0.0.md](./anders-survey-platform/VERSION_FREEZE_v1.0.0.md) - 버전 고정 문서
- [FEATURE_FREEZE.md](./anders-survey-platform/FEATURE_FREEZE.md) - 기능 고정 문서
- [DEVELOPMENT.md](./DEVELOPMENT.md) - 개발 가이드
- [README.md](./README.md) - 프로젝트 개요

---

## 🔄 변경 이력

| 일자 | 변경 내용 | 변경자 |
|------|----------|--------|
| 2024-12-19 | 초기 버전 작성 | System |

---

## ⚠️ 최종 경고

**이 문서는 기존 기능과 자료를 보존하기 위한 개발 규칙입니다.**

- 수정 전 반드시 이 문서를 확인하세요.
- 수정 후 반드시 모든 기능이 여전히 작동하는지 확인하세요.
- 의심스러운 경우 사용자에게 확인을 요청하세요.

**"기능이 사라졌다"는 피드백을 받지 않기 위해 이 문서를 항상 참고하세요.**






