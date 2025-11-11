# 개발 가이드 (Development Guide)

## 📋 프로젝트 구조

이 프로젝트는 두 개의 백엔드 서버와 하나의 프론트엔드 클라이언트로 구성되어 있습니다:

1. **anders-survey-platform**: Sequelize + SQLite를 사용하는 플랫폼 백엔드 및 React 프론트엔드
2. **anders-survey-backend**: Mongoose + MongoDB를 사용하는 백엔드 서버

## 🚀 빠른 시작

### 1. 모든 의존성 설치

```bash
npm run install:all
```

또는 각 디렉토리에서 개별적으로 설치:

```bash
# 루트 디렉토리
npm install

# 플랫폼 서버
cd anders-survey-platform
npm install

# 클라이언트
cd client
npm install

# 백엔드 서버
cd ../../anders-survey-backend
npm install
```

### 2. 환경 변수 설정

#### anders-survey-platform/.env 파일 생성

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

#### anders-survey-backend/.env 파일 생성

```env
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/survey-app
JWT_SECRET=your_super_secret_jwt_key_change_in_production
ADMIN_USERNAME=andersadmin
ADMIN_PASSWORD=password123
CLIENT_URL=http://localhost:5173
```

### 3. 서버 실행

#### 플랫폼 서버 실행 (Sequelize + SQLite)

```bash
npm run dev:platform
# 또는
cd anders-survey-platform
node src/app.js
```

서버는 `http://localhost:3000`에서 실행됩니다.

#### 백엔드 서버 실행 (Mongoose + MongoDB)

먼저 MongoDB가 실행되어 있어야 합니다.

```bash
npm run dev:backend
# 또는
cd anders-survey-backend
npm start
```

서버는 `http://localhost:3000`에서 실행됩니다 (포트 충돌 시 다른 포트 사용).

### 4. 클라이언트 실행

```bash
npm run dev
# 또는
cd anders-survey-platform/client
npm run dev
```

클라이언트는 `http://localhost:5173`에서 실행됩니다.

## 📝 주요 기능

### 플랫폼 (anders-survey-platform)
- 설문 생성 및 관리
- 질문 관리 (라디오, 텍스트 등)
- 응답 수집 및 관리
- 브랜딩 설정
- 사용자 인증 (JWT)

### 백엔드 (anders-survey-backend)
- 설문 CRUD API
- 응답 제출 API
- 대시보드 통계 API
- 브랜딩 설정 API
- 관리자 인증

## 🔧 개발 스크립트

루트 디렉토리에서 사용 가능한 스크립트:

- `npm run dev` - 클라이언트 개발 서버 실행
- `npm run dev:platform` - 플랫폼 백엔드 서버 실행
- `npm run dev:backend` - 백엔드 서버 실행
- `npm run build` - 클라이언트 프로덕션 빌드
- `npm run preview` - 빌드된 클라이언트 미리보기
- `npm run install:all` - 모든 디렉토리의 의존성 설치

## 📚 API 엔드포인트

### 플랫폼 API (anders-survey-platform)
- `POST /api/auth/login` - 로그인
- `POST /api/auth/signup` - 회원가입
- `GET /api/surveys` - 설문 목록 조회
- `POST /api/surveys` - 설문 생성
- `GET /api/surveys/:id` - 설문 상세 조회
- `POST /api/surveys/:id/responses` - 응답 제출
- `GET /api/admin/dashboard` - 대시보드 통계

### 백엔드 API (anders-survey-backend)
- `POST /api/login` - 로그인
- `GET /api/surveys` - 설문 목록 조회
- `POST /api/surveys` - 설문 생성
- `GET /api/surveys/:id` - 설문 상세 조회
- `POST /api/surveys/:id/responses` - 응답 제출
- `GET /api/admin/dashboard` - 대시보드 통계

## ⚠️ 주의사항

1. **포트 충돌**: 두 백엔드 서버가 모두 포트 3000을 사용하려고 하면 충돌이 발생합니다. 하나는 포트 3000, 다른 하나는 포트 3001을 사용하도록 설정하세요.

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
- `npm install`을 실행하여 모든 의존성을 설치했는지 확인하세요.

### 데이터베이스 테이블 오류
- 플랫폼 서버는 자동으로 테이블을 생성합니다 (`sequelize.sync({ alter: true })`).






