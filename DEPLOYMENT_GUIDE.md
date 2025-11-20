# 🚀 웹 배포 가이드

이 문서는 Anders Survey Platform을 웹 서버에 배포하는 방법을 안내합니다.

## 📋 목차

1. [사전 준비사항](#사전-준비사항)
2. [환경 변수 설정](#환경-변수-설정)
3. [프론트엔드 빌드](#프론트엔드-빌드)
4. [백엔드 설정](#백엔드-설정)
5. [서버 배포](#서버-배포)
6. [도메인 연결](#도메인-연결)
7. [배포 확인](#배포-확인)

---

## 1. 사전 준비사항

### 필요한 것들

- ✅ Node.js (v18 이상)
- ✅ MongoDB Atlas 계정 또는 MongoDB 서버
- ✅ 웹 서버 (VPS, 클라우드 서버 등)
- ✅ 도메인 (선택사항)

### 권장 서버 사양

- **최소**: 1GB RAM, 1 CPU 코어
- **권장**: 2GB RAM, 2 CPU 코어 이상

---

## 2. 환경 변수 설정

### 2.1 백엔드 환경 변수

`anders-survey-backend` 폴더에 `.env` 파일을 생성하세요:

```bash
cd anders-survey-backend
touch .env
```

`.env` 파일 내용:

```env
# MongoDB 연결 문자열
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/survey-app?retryWrites=true&w=majority

# 서버 포트 (기본값: 3001)
PORT=3001

# JWT 시크릿 키 (강력한 랜덤 문자열로 변경하세요)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# 관리자 계정 설정
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password-here

# 클라이언트 URL (프론트엔드 도메인)
CLIENT_URL=https://yourdomain.com,https://www.yourdomain.com

# 환경 설정
NODE_ENV=production
```

**⚠️ 중요**: 
- `JWT_SECRET`은 반드시 강력한 랜덤 문자열로 변경하세요
- `ADMIN_PASSWORD`는 안전한 비밀번호로 설정하세요
- `MONGO_URI`는 MongoDB Atlas에서 제공하는 연결 문자열을 사용하세요

### 2.2 프론트엔드 환경 변수

`anders-survey-platform/client` 폴더에 `.env.production` 파일을 생성하세요:

```bash
cd anders-survey-platform/client
touch .env.production
```

`.env.production` 파일 내용:

```env
# 백엔드 API URL (프로덕션 서버 주소)
VITE_API_URL=https://api.yourdomain.com/api
```

또는 백엔드와 프론트엔드를 같은 도메인에서 서브패스로 운영하는 경우:

```env
# 같은 도메인 사용 시
VITE_API_URL=/api
```

---

## 3. 프론트엔드 빌드

### 3.1 의존성 설치

```bash
cd anders-survey-platform/client
npm install
```

### 3.2 프로덕션 빌드

```bash
npm run build
```

빌드가 완료되면 `dist` 폴더가 생성됩니다. 이 폴더의 내용을 웹 서버에 업로드하면 됩니다.

### 3.3 빌드 결과 확인

```bash
# 빌드 결과 미리보기 (선택사항)
npm run preview
```

---

## 4. 백엔드 설정

### 4.1 의존성 설치

```bash
cd anders-survey-backend
npm install
```

### 4.2 프로덕션 모드로 실행

```bash
# 직접 실행
npm start

# 또는 PM2 사용 (권장)
npm install -g pm2
pm2 start server.js --name survey-backend
pm2 save
pm2 startup
```

---

## 5. 서버 배포

### 5.1 옵션 A: 같은 서버에 배포 (권장)

#### Nginx 설정 예시

`/etc/nginx/sites-available/survey-app` 파일 생성:

```nginx
# 프론트엔드 (React 앱)
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # 프론트엔드 빌드 파일 서빙
    root /var/www/survey-app/client/dist;
    index index.html;
    
    # React Router를 위한 설정
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 정적 파일 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API 요청을 백엔드로 프록시
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
}
```

#### SSL 인증서 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# SSL 인증서 발급
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 자동 갱신 설정
sudo certbot renew --dry-run
```

### 5.2 옵션 B: 분리된 서버에 배포

#### 백엔드 서버 (API 서버)

```nginx
# /etc/nginx/sites-available/survey-api
server {
    listen 80;
    server_name api.yourdomain.com;
    
    location / {
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
}
```

#### 프론트엔드 서버

```nginx
# /etc/nginx/sites-available/survey-frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    root /var/www/survey-app/client/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 6. 파일 업로드

### 6.1 서버에 파일 복사

```bash
# 프론트엔드 빌드 파일 업로드
scp -r anders-survey-platform/client/dist/* user@your-server:/var/www/survey-app/client/dist/

# 백엔드 파일 업로드
scp -r anders-survey-backend/* user@your-server:/var/www/survey-app/backend/
```

### 6.2 서버에서 설정

```bash
# 서버에 접속
ssh user@your-server

# 디렉토리 생성
sudo mkdir -p /var/www/survey-app/{client/dist,backend}
sudo chown -R $USER:$USER /var/www/survey-app

# 파일 업로드 후
cd /var/www/survey-app/backend
npm install --production
```

---

## 7. 배포 확인

### 7.1 백엔드 확인

```bash
# 백엔드 서버가 실행 중인지 확인
curl http://localhost:3001/api/health

# 또는 브라우저에서
# http://api.yourdomain.com/api/health
```

### 7.2 프론트엔드 확인

브라우저에서 `https://yourdomain.com` 접속하여 확인

### 7.3 관리자 로그인 확인

1. `https://yourdomain.com/login` 접속
2. 환경 변수에 설정한 관리자 계정으로 로그인
3. 대시보드 접근 확인

---

## 8. 추가 설정

### 8.1 PM2로 백엔드 관리

```bash
# PM2 설치
npm install -g pm2

# 백엔드 시작
cd /var/www/survey-app/backend
pm2 start server.js --name survey-backend

# 자동 재시작 설정
pm2 save
pm2 startup

# 로그 확인
pm2 logs survey-backend

# 상태 확인
pm2 status

# 재시작
pm2 restart survey-backend

# 중지
pm2 stop survey-backend
```

### 8.2 방화벽 설정

```bash
# UFW 방화벽 설정 (Ubuntu)
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### 8.3 MongoDB Atlas 설정

1. MongoDB Atlas 대시보드 접속
2. Network Access에서 서버 IP 주소 추가
3. Database Access에서 사용자 생성
4. 연결 문자열 복사하여 `.env` 파일의 `MONGO_URI`에 설정

---

## 9. 트러블슈팅

### 문제: CORS 에러

**해결**: 백엔드 `.env` 파일의 `CLIENT_URL`에 프론트엔드 도메인을 정확히 입력

### 문제: API 연결 실패

**해결**: 
1. 프론트엔드 `.env.production`의 `VITE_API_URL` 확인
2. 백엔드 서버가 실행 중인지 확인
3. Nginx 프록시 설정 확인

### 문제: 정적 파일 404 에러

**해결**: Nginx의 `root` 경로가 올바른지 확인

### 문제: React Router 404 에러

**해결**: Nginx 설정에 `try_files $uri $uri/ /index.html;` 추가

---

## 10. 보안 체크리스트

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] `JWT_SECRET`이 강력한 랜덤 문자열로 설정되었는지 확인
- [ ] `ADMIN_PASSWORD`가 안전한 비밀번호로 설정되었는지 확인
- [ ] SSL 인증서가 설치되어 있는지 확인
- [ ] MongoDB Atlas의 Network Access가 제한되어 있는지 확인
- [ ] 서버 방화벽이 올바르게 설정되어 있는지 확인
- [ ] 정기적인 백업이 설정되어 있는지 확인

---

## 11. 배포 후 작업

1. **백업 설정**: 정기적으로 MongoDB 데이터 백업
2. **모니터링 설정**: PM2 모니터링 또는 서버 모니터링 도구 설정
3. **로그 관리**: 로그 로테이션 설정
4. **업데이트 계획**: 정기적인 업데이트 및 보안 패치 계획 수립

---

## 12. 지원

문제가 발생하면 다음을 확인하세요:

1. 서버 로그: `pm2 logs survey-backend`
2. Nginx 로그: `/var/log/nginx/error.log`
3. 브라우저 콘솔: 개발자 도구 확인
4. 네트워크 탭: API 요청 상태 확인

---

**배포 완료! 🎉**

이제 `https://yourdomain.com`에서 설문 플랫폼을 사용할 수 있습니다.

