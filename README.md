# 설문조사 애플리케이션 (Survey App)

설문조사를 생성, 관리, 수집할 수 있는 풀스택 웹 애플리케이션입니다.

## 📋 프로젝트 개요

이 프로젝트는 두 개의 백엔드 서버와 하나의 React 프론트엔드로 구성되어 있습니다:

- **anders-survey-platform**: Sequelize + SQLite를 사용하는 플랫폼 백엔드 및 React 프론트엔드
- **anders-survey-backend**: Mongoose + MongoDB를 사용하는 백엔드 서버

## 🚀 빠른 시작

### 1. 저장소 클론 및 의존성 설치

```bash
# 모든 의존성 설치
npm run install:all
```

또는 각 디렉토리에서 개별적으로 설치:

```bash
npm install
cd anders-survey-platform && npm install
cd client && npm install
cd ../../anders-survey-backend && npm install
```

### 2. 환경 변수 설정

각 서버 디렉토리에 `.env` 파일을 생성하세요:

#### `anders-survey-platform/.env`

```env
PORT=3000
NODE_ENV=development
DB_NAME=survey_app
DB_USERNAME=
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_DIALECT=sqlite
JWT_SECRET=your_super_secret_jwt_key_change_in_production
CLIENT_URL=http://localhost:5173
```

#### `anders-survey-backend/.env`

```env
PORT=3001
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/survey-app
JWT_SECRET=your_super_secret_jwt_key_change_in_production
ADMIN_USERNAME=andersadmin
ADMIN_PASSWORD=password123
CLIENT_URL=http://localhost:5173
```

> 💡 `.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

### 3. 서버 실행

#### 모든 서버 동시 실행 (권장)

```bash
npm run dev:all
```

#### 개별 실행

**플랫폼 서버 (포트 3000)**
```bash
npm run dev:platform
```

**백엔드 서버 (포트 3001)**
```bash
npm run dev:backend
```

**프론트엔드 클라이언트 (포트 5173)**
```bash
npm run dev
```

## 📁 프로젝트 구조

```
survey-app/
├── anders-survey-platform/     # 플랫폼 서버 (Sequelize + SQLite)
│   ├── src/                     # 서버 소스 코드
│   │   ├── app.js              # Express 앱 진입점
│   │   ├── config/             # 설정 파일
│   │   ├── controllers/        # 컨트롤러
│   │   ├── models/             # Sequelize 모델
│   │   ├── routes/             # 라우트
│   │   └── middlewares/        # 미들웨어
│   └── client/                 # React 프론트엔드
│       └── src/
│           ├── pages/          # 페이지 컴포넌트
│           ├── components/     # 재사용 컴포넌트
│           └── api/            # API 클라이언트
├── anders-survey-backend/       # 백엔드 서버 (Mongoose + MongoDB)
│   ├── server.js               # Express 앱 진입점
│   ├── controllers/            # 컨트롤러
│   ├── models/                 # Mongoose 모델
│   ├── routes/                 # 라우트
│   └── middlewares/            # 미들웨어
└── package.json                # 루트 패키지 설정
```

## 🛠️ 개발 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 클라이언트 개발 서버 실행 |
| `npm run dev:platform` | 플랫폼 백엔드 서버 실행 |
| `npm run dev:backend` | 백엔드 서버 실행 |
| `npm run dev:all` | 모든 서버 동시 실행 |
| `npm run build` | 클라이언트 프로덕션 빌드 |
| `npm run preview` | 빌드된 클라이언트 미리보기 |
| `npm run install:all` | 모든 디렉토리의 의존성 설치 |
| `npm run lint` | 코드 린팅 실행 |

## 📚 주요 기능

### 플랫폼 (anders-survey-platform)
- ✅ 설문 생성 및 관리
- ✅ 질문 관리 (라디오, 체크박스, 텍스트 등)
- ✅ 응답 수집 및 관리
- ✅ 브랜딩 설정 (로고, 색상 등)
- ✅ 사용자 인증 (JWT)
- ✅ 대시보드 통계

### 백엔드 (anders-survey-backend)
- ✅ 설문 CRUD API
- ✅ 응답 제출 API
- ✅ 대시보드 통계 API
- ✅ 브랜딩 설정 API
- ✅ 관리자 인증

## 🔌 API 엔드포인트

### 플랫폼 API (`http://localhost:3000/api`)
- `POST /api/auth/login` - 로그인
- `POST /api/auth/signup` - 회원가입
- `GET /api/surveys` - 설문 목록 조회
- `POST /api/surveys` - 설문 생성
- `GET /api/surveys/:id` - 설문 상세 조회
- `POST /api/surveys/:id/responses` - 응답 제출
- `GET /api/admin/dashboard` - 대시보드 통계

### 백엔드 API (`http://localhost:3001/api`)
- `POST /api/login` - 로그인
- `GET /api/surveys` - 설문 목록 조회
- `POST /api/surveys` - 설문 생성
- `GET /api/surveys/:id` - 설문 상세 조회
- `POST /api/surveys/:id/responses` - 응답 제출
- `GET /api/admin/dashboard` - 대시보드 통계

## ⚠️ 주의사항

1. **포트 충돌**: 두 백엔드 서버가 다른 포트를 사용하도록 설정되어 있습니다 (3000, 3001).
2. **데이터베이스**: 
   - 플랫폼은 SQLite를 사용하므로 추가 설정이 필요 없습니다.
   - 백엔드는 MongoDB를 사용하므로 MongoDB가 설치되어 실행 중이어야 합니다.
3. **JWT_SECRET**: 프로덕션 환경에서는 반드시 강력한 비밀키로 변경하세요.
4. **CORS 설정**: 클라이언트 URL이 변경되면 `.env` 파일의 `CLIENT_URL`을 업데이트하세요.

## 🐛 문제 해결

### MongoDB 연결 오류
- MongoDB가 실행 중인지 확인하세요.
- `MONGO_URI` 환경 변수가 올바르게 설정되었는지 확인하세요.

### 포트 충돌
- 다른 포트를 사용하도록 `.env` 파일의 `PORT` 값을 변경하세요.

### 모듈을 찾을 수 없음
- `npm run install:all`을 실행하여 모든 의존성을 설치했는지 확인하세요.

### 데이터베이스 테이블 오류
- 플랫폼 서버는 자동으로 테이블을 생성합니다 (`sequelize.sync({ alter: true })`).

## 📝 개발 가이드

더 자세한 개발 가이드는 [DEVELOPMENT.md](./DEVELOPMENT.md) 파일을 참고하세요.

## 📄 라이선스

ISC






