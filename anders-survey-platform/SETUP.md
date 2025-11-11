# 개발 환경 설정 가이드

## 필수 패키지 설치

프로젝트를 실행하기 위해 다음 패키지들을 설치해야 합니다.

### 서버 사이드 패키지 (루트 디렉토리)

```bash
npm install express body-parser cors dotenv sequelize jsonwebtoken bcryptjs
```

또는 MySQL을 사용하는 경우:

```bash
npm install mysql2
```

SQLite를 사용하는 경우:

```bash
npm install sqlite3
```

### 클라이언트 사이드 패키지 (client 디렉토리)

클라이언트 패키지는 이미 설치되어 있습니다.

## 환경 변수 설정

`.env` 파일을 루트 디렉토리에 생성하고 다음 변수들을 설정하세요:

```env
PORT=3000
NODE_ENV=development
DB_NAME=your_database_name
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_HOST=127.0.0.1
DB_DIALECT=mysql
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

## 실행 방법

### 서버 실행
```bash
node src/app.js
```

### 클라이언트 실행
```bash
cd client
npm run dev
```

## 새로 구현된 기능

1. **NotFound 페이지** - 404 에러 처리 페이지
2. **인증 시스템** - 로그인 및 회원가입 기능
   - `/api/auth/login` - 로그인
   - `/api/auth/signup` - 회원가입
3. **User 모델 통합** - User 모델을 models/index.js에 추가
4. **인증 라우트** - `/api/auth` 경로로 인증 관련 API 제공

## 주의사항

- JWT_SECRET은 프로덕션 환경에서 반드시 변경해야 합니다.
- 데이터베이스 설정은 `src/config/config.json` 또는 환경 변수를 통해 관리됩니다.


