# Render 배포 가이드

## 🚀 배포 실패 해결 방법

현재 배포가 실패하는 이유는 **환경 변수가 설정되지 않았기 때문**입니다.

## 📋 필수 환경 변수 설정

Render Dashboard에서 다음 환경 변수들을 설정해야 합니다:

### 1. Render Dashboard 접속
1. https://dashboard.render.com 접속
2. 배포한 서비스 선택
3. 왼쪽 메뉴에서 **Environment** 클릭

### 2. 필수 환경 변수 추가

#### ⭐ MONGO_URI (필수)
MongoDB 연결 URI를 설정합니다.

**MongoDB Atlas 사용 시:**
1. https://cloud.mongodb.com 접속
2. 클러스터 선택 → Connect → Connect your application
3. Connection String 복사
4. Render에 추가:
   - **Key**: `MONGO_URI`
   - **Value**: `mongodb+srv://username:password@cluster.mongodb.net/survey-app?retryWrites=true&w=majority`
   - `username`, `password`, `cluster` 부분을 실제 값으로 변경

#### 🌐 CLIENT_URL (필수)
프론트엔드 도메인을 설정합니다 (CORS 허용).

- **Key**: `CLIENT_URL`
- **Value**: `https://your-frontend.vercel.app,https://*.vercel.app`
- 여러 도메인은 쉼표로 구분

#### 🔧 기타 환경 변수 (선택사항)

```
PORT=3000
NODE_ENV=production
SERVER_URL=https://your-app.onrender.com

# 관리자 계정 (기본값 사용 가능)
ADMIN_USERNAME=andersadmin
ADMIN_PASSWORD=your-secure-password
ADMIN_EMAIL=admin@example.com

# JWT 시크릿
JWT_SECRET=your-jwt-secret-key-here
```

### 3. 환경 변수 저장 후 재배포

1. 환경 변수 추가 후 **Save Changes** 클릭
2. 자동으로 재배포가 시작됩니다
3. **Logs** 탭에서 배포 진행 상황 확인

## 📊 배포 성공 확인

로그에서 다음 메시지가 표시되면 성공:

```
✅ MongoDB 연결 성공!
💡 관리자 계정 생성 완료: ID(andersadmin), PW(password123)
🚀 플랫폼 서버 실행 중: https://your-app.onrender.com
```

## 🔍 문제 해결

### MongoDB 연결 실패
- MongoDB Atlas에서 **Network Access** 확인
- IP 화이트리스트에 `0.0.0.0/0` 추가 (모든 IP 허용)
- 또는 Render의 IP 주소 추가

### CORS 에러
- `CLIENT_URL`에 프론트엔드 도메인이 포함되어 있는지 확인
- 와일드카드 패턴 사용: `https://*.vercel.app`

### 환경 변수가 적용되지 않음
- Render Dashboard → Environment에서 변수 확인
- 변수 저장 후 **Manual Deploy** 클릭하여 재배포

## 📱 MongoDB Atlas 무료 티어 설정

1. https://www.mongodb.com/cloud/atlas/register 회원가입
2. **Create a Free Cluster** 선택
3. 클러스터 생성 후:
   - Database Access → Add New Database User
   - Network Access → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`)
4. Connect → Connect your application에서 Connection String 복사

## 🎯 다음 단계

환경 변수 설정 후:
1. Render에서 자동 재배포 대기 (2-3분)
2. 로그에서 `✅ MongoDB 연결 성공!` 확인
3. 프론트엔드에서 API 연결 테스트
4. 관리자 계정으로 로그인 테스트

---

**문제가 계속되면 Render의 Logs 탭 내용을 공유해주세요!** 🚀

