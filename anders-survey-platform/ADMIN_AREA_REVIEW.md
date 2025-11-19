# Admin 영역 구조 정리 문서

## 개요
Admin 영역의 전체 구조를 정리하고, 각 기능별 구현 상태를 문서화했습니다.

## 라우팅 구조

### 메인 라우트
- `/admin/*` - AdminV2 컴포넌트가 모든 Admin 라우트를 관리
- Protected Route로 보호됨 (로그인 필요)

### 하위 라우트
- `/admin` (index) - 설문 목록 (SurveyList)
- `/admin/dashboard` - 대시보드
- `/admin/builder` - 설문 만들기 (SurveyBuilder)
- `/admin/builder/:id` - 설문 편집
- `/admin/analytics` - 분석/통계
- `/admin/settings` - 시스템 설정
- `/admin/account` - 계정 정보 (신규 추가)
- `/admin/results/:id` - 설문 결과 보기

## 파일 구조

### 페이지 컴포넌트
```
src/pages/
├── AdminV2.jsx              # Admin 메인 레이아웃 (라우팅)
├── Dashboard.jsx            # 대시보드 페이지
├── SurveyList.jsx           # 설문 목록 페이지
├── Analytics.jsx            # 분석/통계 페이지
├── SurveyResults.jsx        # 설문 결과 페이지
└── Admin/
    ├── Settings.jsx         # 시스템 설정 페이지
    └── Account.jsx          # 계정 정보 페이지 (신규)
```

### 공통 컴포넌트
```
src/components/admin/
├── Sidebar.jsx              # 좌측 메뉴 (단색 아이콘)
├── Topbar.jsx               # 상단 바
└── PropertyPanel.jsx        # 우측 속성 패널 (현재 미사용)
```

## 기능별 상세

### 1. 대시보드 (Dashboard)
**파일**: `src/pages/Dashboard.jsx`
**라우트**: `/admin/dashboard`

**기능**:
- 전체 설문 수, 총 응답 수, 활성 설문 수 등 핵심 지표 표시
- 응답 추이 차트 (최근 7일)
- 설문별 성과 비교
- 필터링 (설문 선택, 날짜 범위)

**API**:
- `/api/surveys` - 설문 목록 조회
- `/api/surveys/:id/results` - 설문별 응답 데이터 조회
- 백엔드에 `/api/admin/dashboard/summary` API가 있으나 현재 미사용 (향후 개선 가능)

**상태**: ✅ 정상 작동

### 2. 설문 목록 (Survey List)
**파일**: `src/pages/SurveyList.jsx`
**라우트**: `/admin` (index)

**기능**:
- 설문 리스트 표시 (제목, 상태, 생성일, 응답 수)
- 필터/정렬 (상태별, 최신순 등)
- 검색 (제목 기준)
- 설문 생성 버튼
- 액션 버튼 (편집, 결과 보기, 링크 복사)

**API**:
- `/api/surveys` - 설문 목록 조회
- 로컬 스토리지 폴백 지원

**상태**: ✅ 정상 작동

### 3. 분석/통계 (Analytics)
**파일**: `src/pages/Analytics.jsx`
**라우트**: `/admin/analytics`

**기능**:
- 전체 통계 요약 (설문 수, 응답 수, 활성 설문 수, 평균 응답률)
- 응답 추이 차트
- 설문별 성과 비교
- 필터링 (설문 선택, 날짜 범위)

**API**:
- `/api/surveys` - 설문 목록 조회
- `/api/surveys/:id/results` - 설문별 응답 데이터 조회

**상태**: ✅ 정상 작동

**참고**: Dashboard와 기능이 일부 겹치지만, Dashboard는 전체 요약, Analytics는 상세 분석에 집중

### 4. 시스템 설정 (Settings)
**파일**: `src/pages/Admin/Settings.jsx`
**라우트**: `/admin/settings`

**기능**:
- 시뮬레이션 도구 (설문 생성, 응답 제출 시뮬레이션)
- API 키 관리
- 권한 관리 (사용자 초대 및 권한 부여)
- 알림 설정
- 접속자 모니터링
- 시스템 로그
- 시스템 정보

**상태**: ✅ 정상 작동

**변경 사항**: 계정 관련 기능(비밀번호 변경 등)은 Account 페이지로 분리

### 5. 계정 정보 (Account) - 신규 추가
**파일**: `src/pages/Admin/Account.jsx`
**라우트**: `/admin/account`

**기능**:
- 프로필 정보 조회 및 수정 (사용자 이름, 이메일)
- 비밀번호 변경

**API**:
- `/api/auth/profile` - 프로필 조회/수정 (백엔드 구현 필요)
- `/api/auth/change-password` - 비밀번호 변경 (백엔드 구현 필요)
- 현재는 JWT 토큰에서 사용자 정보 추출 (폴백)

**상태**: ✅ UI 완성, 백엔드 API 연결 대기

## UI/UX 통일성

### 디자인 시스템
- **Primary Color**: `#26C6DA` (고정 admin 색상)
- **폰트**: Pretendard (기본)
- **컴포넌트 스타일**: Tailwind CSS 기반

### 레이아웃
- **PC 우선**: Admin 화면은 PC 최적화
- **반응형**: 태블릿/모바일에서도 최소한의 사용 가능
- **고정 Sidebar**: 좌측 256px 고정 메뉴
- **메인 콘텐츠**: Sidebar 제외한 나머지 영역

### 메뉴 구조
- **상단 메뉴**: 대시보드, 설문 목록, 설문 만들기, 분석, 설정
- **하단 메뉴**: 계정정보, 로그아웃
- **활성 상태**: 흰색 텍스트 + 아이콘, 배경색 `#26C6DA`
- **비활성 상태**: 회색 텍스트 + 아이콘, 호버 시 배경색 변경

## API 엔드포인트 정리

### 설문 관련
- `GET /api/surveys` - 설문 목록 조회
- `GET /api/surveys/:id` - 설문 상세 조회
- `POST /api/surveys` - 설문 생성
- `PUT /api/surveys/:id` - 설문 수정
- `DELETE /api/surveys/:id` - 설문 삭제
- `GET /api/surveys/:id/results` - 설문 응답 결과 조회

### 대시보드 관련
- `GET /api/admin/dashboard/summary` - 대시보드 요약 (현재 미사용)
- `GET /api/admin/dashboard/surveys/:surveyId/live` - 설문별 실시간 데이터

### 인증 관련
- `POST /api/auth/login` - 로그인
- `GET /api/auth/profile` - 프로필 조회 (구현 필요)
- `PUT /api/auth/profile` - 프로필 수정 (구현 필요)
- `PUT /api/auth/change-password` - 비밀번호 변경 (구현 필요)

## 주요 변경 사항

### 완료된 작업
1. ✅ 계정 정보 페이지 생성 (`/admin/account`)
2. ✅ Settings 페이지에서 계정 관련 기능 분리
3. ✅ Sidebar 메뉴에 계정 정보 링크 추가
4. ✅ 라우팅 구조 정리 및 계정 정보 라우트 추가
5. ✅ 각 페이지 API 연결 확인 및 정리
6. ✅ UI/UX 통일성 확인 (색상, 폰트, 레이아웃)

### 향후 개선 사항
1. 백엔드에 계정 정보 API 구현 (`/api/auth/profile`, `/api/auth/change-password`)
2. Dashboard에서 `/api/admin/dashboard/summary` API 활용 검토
3. 에러 처리 및 로딩 상태 개선
4. 모바일 반응형 최적화

## 사용 가이드

### 관리자 로그인 후 플로우
1. **대시보드** (`/admin/dashboard`) - 전체 현황 파악
2. **설문 목록** (`/admin`) - 설문 관리
3. **설문 만들기** (`/admin/builder`) - 새 설문 생성
4. **분석** (`/admin/analytics`) - 상세 통계 확인
5. **설정** (`/admin/settings`) - 시스템 설정 관리
6. **계정 정보** (`/admin/account`) - 개인 계정 관리

### 각 메뉴 역할
- **대시보드**: 전체 요약/알림/최근 활동
- **설문 목록**: 설문 단위 관리 (생성/편집/진행 상태/링크/배포)
- **분석**: 설문별 통계/그래프/응답 분석
- **설정**: 시스템/워크스페이스/기본값
- **계정 정보**: 로그인한 사용자 개인 설정

## 기술 스택
- **프론트엔드**: React, React Router, Tailwind CSS, Chart.js
- **상태 관리**: React Hooks (useState, useEffect)
- **API 통신**: Axios (axiosInstance)
- **인증**: JWT 토큰 (localStorage)

## 주의사항
- 모든 Admin 페이지는 Protected Route로 보호됨
- 토큰 만료 시 자동으로 로그인 페이지로 리다이렉트
- API 호출 실패 시 적절한 에러 메시지 표시
- 로컬 스토리지 폴백 지원 (일부 기능)


