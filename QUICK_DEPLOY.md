# ⚡ 빠른 배포 가이드

이 가이드는 최소한의 설정으로 빠르게 배포하는 방법을 안내합니다.

## 📦 1단계: 환경 변수 설정

### 백엔드 환경 변수

```bash
cd anders-survey-backend
cp .env.example .env
# .env 파일을 열어서 실제 값으로 수정
```

**필수 수정 항목:**
- `MONGO_URI`: MongoDB 연결 문자열
- `JWT_SECRET`: 강력한 랜덤 문자열 (예: `openssl rand -base64 32`)
- `ADMIN_PASSWORD`: 관리자 비밀번호
- `CLIENT_URL`: 프론트엔드 도메인

### 프론트엔드 환경 변수

```bash
cd anders-survey-platform/client
cp .env.production.example .env.production
# .env.production 파일을 열어서 백엔드 API URL 수정
```

**수정 항목:**
- `VITE_API_URL`: 백엔드 API 주소 (예: `https://api.yourdomain.com/api`)

## 🏗️ 2단계: 빌드

### 자동 빌드 스크립트 사용 (권장)

```bash
chmod +x deploy.sh
./deploy.sh production
```

### 수동 빌드

```bash
# 백엔드 의존성 설치
cd anders-survey-backend
npm install --production

# 프론트엔드 빌드
cd ../anders-survey-platform/client
npm install
npm run build
```

## 📤 3단계: 서버에 업로드

### 방법 1: SCP 사용

```bash
# 프론트엔드 빌드 파일
scp -r anders-survey-platform/client/dist/* user@server:/var/www/survey-app/client/dist/

# 백엔드 파일
scp -r anders-survey-backend/* user@server:/var/www/survey-app/backend/
```

### 방법 2: Git 사용

```bash
# 서버에서
git clone your-repo-url
cd survey-app
# .env 파일 업로드
```

## 🚀 4단계: 서버에서 실행

### 백엔드 실행 (PM2 사용)

```bash
ssh user@server
cd /var/www/survey-app/backend
npm install --production
pm2 start server.js --name survey-backend
pm2 save
pm2 startup
```

### Nginx 설정

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # 프론트엔드
    root /var/www/survey-app/client/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API 프록시
    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL 설정

```bash
sudo certbot --nginx -d yourdomain.com
```

## ✅ 5단계: 확인

1. 브라우저에서 `https://yourdomain.com` 접속
2. `/login` 페이지에서 관리자 계정으로 로그인
3. 대시보드 접근 확인

## 🔧 문제 해결

### 백엔드가 시작되지 않음

```bash
# 로그 확인
pm2 logs survey-backend

# 환경 변수 확인
cd /var/www/survey-app/backend
cat .env
```

### API 연결 실패

1. 프론트엔드 `.env.production`의 `VITE_API_URL` 확인
2. 백엔드 서버가 실행 중인지 확인: `pm2 status`
3. Nginx 프록시 설정 확인

### CORS 에러

백엔드 `.env`의 `CLIENT_URL`에 프론트엔드 도메인을 정확히 입력

---

**더 자세한 내용은 `DEPLOYMENT_GUIDE.md`를 참고하세요.**

