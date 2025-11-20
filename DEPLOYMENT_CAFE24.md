# 🚀 Cafe24 배포 가이드 (anderstest.mycafe24.com)

Cafe24 호스팅 환경에 Anders Survey Platform을 배포하는 방법을 안내합니다.

## 📋 목차

1. [Cafe24 환경 확인](#cafe24-환경-확인)
2. [환경 변수 설정](#환경-변수-설정)
3. [프론트엔드 빌드](#프론트엔드-빌드)
4. [백엔드 설정](#백엔드-설정)
5. [파일 업로드](#파일-업로드)
6. [Node.js 앱 실행](#nodejs-앱-실행)
7. [도메인 연결](#도메인-연결)

---

## 1. Cafe24 환경 확인

### 필요한 Cafe24 서비스

- ✅ **Node.js 호스팅** (유료 플랜 필요)
- ✅ **FTP 접근 권한**
- ✅ **SSH 접근 권한** (선택사항, 있으면 편리함)
- ✅ **MongoDB Atlas** (Cafe24는 MongoDB를 제공하지 않으므로 외부 서비스 사용)

### 확인 사항

1. Cafe24 관리자 페이지에서 Node.js 호스팅 활성화 여부 확인
2. FTP 접속 정보 확인 (호스트, 사용자명, 비밀번호)
3. Node.js 버전 확인 (v18 이상 권장)

---

## 2. 환경 변수 설정

### 2.1 백엔드 환경 변수

Cafe24에서는 환경 변수를 관리자 페이지에서 설정하거나, `.env` 파일을 사용할 수 있습니다.

**방법 1: Cafe24 관리자 페이지에서 설정** (권장)

Cafe24 관리자 페이지 → 호스팅 관리 → Node.js 앱 설정에서 환경 변수 추가:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/survey-app?retryWrites=true&w=majority
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here
CLIENT_URL=https://anderstest.mycafe24.com
NODE_ENV=production
```

**방법 2: .env 파일 사용**

서버에 업로드할 `.env` 파일 생성:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/survey-app?retryWrites=true&w=majority
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here
CLIENT_URL=https://anderstest.mycafe24.com
NODE_ENV=production
```

### 2.2 프론트엔드 환경 변수

`anders-survey-platform/client/.env.production` 파일 생성:

```env
# Cafe24에서는 같은 도메인에서 API를 서브패스로 사용하는 것이 일반적
VITE_API_URL=/api
```

또는 백엔드를 별도 포트로 실행하는 경우:

```env
VITE_API_URL=https://anderstest.mycafe24.com:3001/api
```

---

## 3. 프론트엔드 빌드

### 3.1 로컬에서 빌드

```bash
cd anders-survey-platform/client

# 환경 변수 파일 생성
echo "VITE_API_URL=/api" > .env.production

# 의존성 설치
npm install

# 프로덕션 빌드
npm run build
```

빌드 완료 후 `dist` 폴더가 생성됩니다.

---

## 4. 백엔드 설정

### 4.1 프로덕션 의존성만 설치

로컬에서 프로덕션 의존성만 설치하여 `node_modules`를 압축:

```bash
cd anders-survey-backend
npm install --production
```

또는 서버에서 직접 설치하는 것이 더 안전합니다.

---

## 5. 파일 업로드

### 5.1 FTP 클라이언트 사용 (FileZilla 등)

**프론트엔드 파일 업로드:**

1. FTP 접속 정보 입력:
   - 호스트: `anderstest.mycafe24.com` 또는 Cafe24에서 제공한 FTP 호스트
   - 사용자명: Cafe24 FTP 사용자명
   - 비밀번호: Cafe24 FTP 비밀번호
   - 포트: 21 (일반 FTP) 또는 22 (SFTP)

2. 업로드 경로 확인:
   - 일반적으로 `/www` 또는 `/public_html` 또는 Cafe24에서 지정한 경로
   - 프론트엔드 빌드 파일: `client/dist/*` → `/www/` 또는 `/public_html/`

3. 파일 업로드:
   ```
   로컬: anders-survey-platform/client/dist/*
   서버: /www/ (또는 Cafe24에서 지정한 웹 루트)
   ```

**백엔드 파일 업로드:**

```
로컬: anders-survey-backend/*
서버: /www/backend/ (또는 /nodejs/backend/)
```

### 5.2 업로드할 파일 목록

**프론트엔드:**
- `dist/index.html`
- `dist/assets/*` (모든 JS, CSS 파일)
- `dist/vite.svg` (있는 경우)

**백엔드:**
- `server.js`
- `package.json`
- `package-lock.json`
- `.env` (환경 변수 파일)
- `routes/` 폴더 전체
- `controllers/` 폴더 전체
- `models/` 폴더 전체
- `middlewares/` 폴더 전체
- `config/` 폴더 전체 (있는 경우)

**업로드하지 않을 파일:**
- `node_modules/` (서버에서 설치)
- `.git/`
- `*.log`
- 개발용 파일

---

## 6. Node.js 앱 실행

### 6.1 Cafe24 관리자 페이지에서 실행

1. Cafe24 관리자 페이지 접속
2. 호스팅 관리 → Node.js 앱 관리
3. 새 앱 추가:
   - **앱 이름**: `survey-backend`
   - **실행 파일**: `server.js`
   - **작업 디렉토리**: `/www/backend/` (또는 업로드한 경로)
   - **포트**: `3001` (또는 Cafe24에서 할당한 포트)
   - **Node.js 버전**: v18 이상
4. 환경 변수 설정 (위에서 설정한 값들)
5. 앱 시작

### 6.2 SSH 접근이 가능한 경우

```bash
# SSH 접속
ssh username@anderstest.mycafe24.com

# 백엔드 디렉토리로 이동
cd /www/backend

# 의존성 설치
npm install --production

# PM2 설치 및 실행 (SSH 접근 가능한 경우)
npm install -g pm2
pm2 start server.js --name survey-backend
pm2 save
```

### 6.3 Cafe24 Node.js 앱 설정 예시

**앱 설정:**
```
앱 이름: survey-backend
실행 파일: server.js
작업 디렉토리: /www/backend
포트: 3001
Node.js 버전: 18.x 또는 20.x
자동 재시작: 활성화
```

---

## 7. 도메인 연결

### 7.1 프론트엔드 서빙 설정

Cafe24에서는 일반적으로 웹 루트(`/www` 또는 `/public_html`)에 업로드한 파일이 자동으로 서빙됩니다.

**Nginx 또는 Apache 설정** (Cafe24에서 자동 설정되지만 확인 필요):

```nginx
# 프론트엔드 서빙
location / {
    root /www;
    index index.html;
    try_files $uri $uri/ /index.html;
}

# API 프록시 (백엔드로 전달)
location /api {
    proxy_pass http://localhost:3001;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

### 7.2 SSL 인증서 설정

Cafe24 관리자 페이지에서:
1. 호스팅 관리 → SSL 인증서
2. 무료 SSL 인증서 발급 (Let's Encrypt) 또는 유료 SSL 인증서 설치
3. `https://anderstest.mycafe24.com` 활성화

---

## 8. 배포 확인

### 8.1 백엔드 확인

```bash
# 브라우저에서 확인
https://anderstest.mycafe24.com/api/health

# 또는
curl https://anderstest.mycafe24.com/api/health
```

### 8.2 프론트엔드 확인

1. 브라우저에서 `https://anderstest.mycafe24.com` 접속
2. 로그인 페이지 확인: `https://anderstest.mycafe24.com/login`
3. 관리자 계정으로 로그인 테스트

### 8.3 API 연결 확인

브라우저 개발자 도구 → Network 탭에서 API 요청이 정상적으로 작동하는지 확인

---

## 9. Cafe24 특화 설정

### 9.1 포트 번호 확인

Cafe24에서는 Node.js 앱에 특정 포트를 할당합니다. 할당된 포트를 확인하고 `.env` 파일의 `PORT` 값을 수정하세요.

### 9.2 파일 권한 설정

FTP 클라이언트에서 파일 권한 설정:
- 실행 파일: `755`
- 일반 파일: `644`
- 디렉토리: `755`

### 9.3 로그 확인

Cafe24 관리자 페이지에서:
- 호스팅 관리 → 로그 보기
- Node.js 앱 로그 확인
- 에러 로그 확인

---

## 10. 트러블슈팅

### 문제: Node.js 앱이 시작되지 않음

**해결:**
1. Cafe24 관리자 페이지에서 Node.js 앱 로그 확인
2. `package.json`의 `start` 스크립트 확인
3. 환경 변수 설정 확인
4. 포트 번호 확인

### 문제: API 연결 실패

**해결:**
1. 프론트엔드 `.env.production`의 `VITE_API_URL` 확인
2. 백엔드가 실행 중인지 확인 (Cafe24 관리자 페이지)
3. 포트 번호가 올바른지 확인
4. CORS 설정 확인 (`.env`의 `CLIENT_URL`)

### 문제: 정적 파일 404 에러

**해결:**
1. 파일 업로드 경로 확인
2. 파일 권한 확인
3. `index.html` 파일이 웹 루트에 있는지 확인

### 문제: React Router 404 에러

**해결:**
Cafe24 관리자 페이지에서 웹 서버 설정에 다음 추가:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

---

## 11. 보안 체크리스트

- [ ] `.env` 파일이 올바르게 설정되었는지 확인
- [ ] `JWT_SECRET`이 강력한 랜덤 문자열로 설정되었는지 확인
- [ ] `ADMIN_PASSWORD`가 안전한 비밀번호로 설정되었는지 확인
- [ ] MongoDB Atlas의 Network Access에 Cafe24 서버 IP 추가
- [ ] SSL 인증서가 설치되었는지 확인
- [ ] 불필요한 파일이 업로드되지 않았는지 확인

---

## 12. 업데이트 방법

### 프론트엔드 업데이트

```bash
# 로컬에서 빌드
cd anders-survey-platform/client
npm run build

# FTP로 dist 폴더 내용만 업로드
```

### 백엔드 업데이트

```bash
# 변경된 파일만 FTP로 업로드
# Cafe24 관리자 페이지에서 Node.js 앱 재시작
```

---

## 13. 지원

문제가 발생하면:

1. **Cafe24 관리자 페이지 로그 확인**
2. **Node.js 앱 로그 확인**
3. **브라우저 개발자 도구 콘솔 확인**
4. **Network 탭에서 API 요청 상태 확인**

---

**배포 완료! 🎉**

이제 `https://anderstest.mycafe24.com`에서 설문 플랫폼을 사용할 수 있습니다.

