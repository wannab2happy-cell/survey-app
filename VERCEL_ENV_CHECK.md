# Vercel 환경 변수 확인 및 수정 가이드

## 문제
요청이 `https://survey-app-c6tz.onrender.com/surveys`로 가고 있음 (잘못됨)
올바른 요청: `https://survey-app-c6tz.onrender.com/api/surveys`

## 해결 방법

### 1단계: Vercel 환경 변수 확인

1. **Vercel 대시보드 접속**
   - https://vercel.com → 프로젝트 선택

2. **Settings → Environment Variables** 클릭

3. **`VITE_API_URL` 찾기**
   - Key가 `VITE_API_URL`인 항목 찾기

4. **값 확인**
   - ✅ 올바른 값: `https://survey-app-c6tz.onrender.com/api` (끝에 `/api` 포함)
   - ❌ 잘못된 값 예시:
     - `https://survey-app-c6tz.onrender.com` (끝에 `/api` 없음)
     - `survey-app-c6tz.onrender.com/api` (앞에 `https://` 없음)
     - `/api` (상대 경로)

### 2단계: 환경 변수 수정 (필요시)

**값이 잘못되어 있다면:**

1. **`VITE_API_URL` 항목의 "Edit" 버튼 클릭**

2. **Value 수정**
   - 올바른 값: `https://survey-app-c6tz.onrender.com/api`
   - ⚠️ 주의: 끝에 슬래시(`/`) 없이 입력

3. **Environment 확인**
   - Production ✅
   - Preview ✅
   - Development ✅
   - 모두 체크되어 있어야 함

4. **"Save" 클릭**

### 3단계: 재배포

1. **Deployments 탭 클릭**

2. **가장 최근 배포의 "..." 메뉴 클릭**

3. **"Redeploy" 선택**

4. **배포 완료 대기** (1-3분)

### 4단계: 브라우저 확인

1. **브라우저 강력 새로고침**
   - Ctrl + Shift + R (Windows)
   - Cmd + Shift + R (Mac)

2. **브라우저 콘솔 확인 (F12 → Console)**
   - 다음 로그가 보여야 함:
     ```
     [Axios] import.meta.env.VITE_API_URL: https://survey-app-c6tz.onrender.com/api
     [Axios] ✅ 최종 baseURL: https://survey-app-c6tz.onrender.com/api
     [Axios] Request: GET https://survey-app-c6tz.onrender.com/api/surveys
     ```

3. **Network 탭 확인 (F12 → Network)**
   - `surveys` 요청 클릭
   - Request URL이 `https://survey-app-c6tz.onrender.com/api/surveys`인지 확인

---

## 체크리스트

- [ ] Vercel 환경 변수 `VITE_API_URL` 값이 `https://survey-app-c6tz.onrender.com/api`인가?
- [ ] 환경 변수가 Production, Preview, Development 모두에 설정되어 있는가?
- [ ] 재배포를 완료했는가?
- [ ] 브라우저 강력 새로고침을 했는가?
- [ ] 브라우저 콘솔에 `[Axios]` 로그가 보이는가?
- [ ] Network 탭에서 Request URL이 `/api/surveys`로 가는가?

