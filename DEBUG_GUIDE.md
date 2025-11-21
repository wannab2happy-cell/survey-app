# Vercel 배포 디버깅 가이드

## 문제: 설문 목록 API 404 오류

**현재 상황:**
- 요청이 `survey-app-c6tz.onrender.com/surveys`로 가고 있음 (잘못됨)
- 올바른 요청: `survey-app-c6tz.onrender.com/api/surveys`

---

## 단계별 확인 방법

### 1단계: Vercel 배포 상태 확인

1. **Vercel 대시보드 접속**
   - https://vercel.com → 프로젝트 선택

2. **최신 배포 확인**
   - 상단 "Deployments" 탭 클릭
   - 가장 위에 있는 배포의 상태 확인:
     - ✅ **Ready** (초록색) = 배포 완료
     - 🟡 **Building** = 빌드 중 (대기)
     - ❌ **Error** = 오류 발생

3. **배포가 완료되지 않았다면**
   - 빌드가 완료될 때까지 대기 (보통 1-3분)

---

### 2단계: 브라우저 캐시 완전히 지우기

**방법 1: 강력 새로고침 (권장)**
- Windows: **Ctrl + Shift + R**
- Mac: **Cmd + Shift + R**

**방법 2: 개발자 도구에서 캐시 비활성화**
1. **F12** 키 누르기 (개발자 도구 열기)
2. **Network** 탭 클릭
3. 상단에 **"Disable cache"** 체크박스 체크
4. **F5** 또는 새로고침 버튼 클릭

**방법 3: 브라우저 캐시 완전 삭제**
1. **Ctrl + Shift + Delete** (Windows) 또는 **Cmd + Shift + Delete** (Mac)
2. "캐시된 이미지 및 파일" 선택
3. "데이터 삭제" 클릭

---

### 3단계: 브라우저 콘솔 확인

1. **개발자 도구 열기**
   - **F12** 키 누르기

2. **Console 탭 클릭**

3. **페이지 새로고침** (F5 또는 Ctrl+R)

4. **확인할 로그:**
   ```
   [Axios] VITE_API_URL: https://survey-app-c6tz.onrender.com/api
   [Axios] baseURL: https://survey-app-c6tz.onrender.com/api
   [Axios] finalBaseURL: https://survey-app-c6tz.onrender.com/api
   [Axios] axiosInstance will use baseURL: https://survey-app-c6tz.onrender.com/api
   [Axios] axiosInstance.defaults.baseURL: https://survey-app-c6tz.onrender.com/api
   ```

5. **로그가 보이지 않는다면:**
   - 새 배포가 아직 반영되지 않았을 수 있음
   - Vercel 배포 상태 다시 확인 (1단계)

---

### 4단계: Network 탭에서 실제 요청 확인

1. **개발자 도구 열기** (F12)

2. **Network 탭 클릭**

3. **페이지 새로고침** (F5)

4. **`surveys` 요청 찾기**
   - 필터에 `surveys` 입력
   - 또는 목록에서 `surveys` 찾기

5. **요청 클릭하여 상세 정보 확인**
   - **Request URL** 확인:
     - ✅ 올바름: `https://survey-app-c6tz.onrender.com/api/surveys`
     - ❌ 잘못됨: `https://survey-app-c6tz.onrender.com/surveys`
   - **Status Code** 확인:
     - ✅ 200 = 성공
     - ❌ 404 = 경로 오류

---

### 5단계: Vercel 환경 변수 재확인

1. **Vercel 대시보드 접속**
   - https://vercel.com → 프로젝트 선택

2. **Settings → Environment Variables** 클릭

3. **`VITE_API_URL` 확인**
   - Key: `VITE_API_URL`
   - Value: `https://survey-app-c6tz.onrender.com/api` (끝에 슬래시 없이)
   - Environment: **Production, Preview, Development 모두 체크**

4. **값이 다르거나 없으면**
   - "Edit" 클릭하여 수정
   - 또는 "Add New" 클릭하여 추가
   - **저장 후 재배포 필요**

---

### 6단계: 수동 재배포 (필요시)

1. **Vercel 대시보드 → Deployments 탭**

2. **가장 최근 배포의 "..." 메뉴 클릭**

3. **"Redeploy" 선택**

4. **배포 완료 대기** (1-3분)

5. **브라우저 강력 새로고침** (Ctrl + Shift + R)

---

## 문제 해결 체크리스트

- [ ] Vercel 배포가 "Ready" 상태인가?
- [ ] 브라우저 강력 새로고침을 했는가?
- [ ] 브라우저 콘솔에 `[Axios]` 로그가 보이는가?
- [ ] `[Axios] VITE_API_URL` 값이 올바른가?
- [ ] Network 탭에서 Request URL이 `/api/surveys`로 가는가?
- [ ] Vercel 환경 변수 `VITE_API_URL`이 올바르게 설정되어 있는가?

---

## 여전히 문제가 있다면

**브라우저 콘솔의 모든 로그를 복사해서 알려주세요:**
1. F12 → Console 탭
2. 모든 로그 선택 (Ctrl+A)
3. 복사 (Ctrl+C)
4. 붙여넣기

**Network 탭의 요청 정보도 알려주세요:**
1. F12 → Network 탭
2. `surveys` 요청 클릭
3. "Headers" 탭의 "Request URL" 값
4. "Response" 탭의 내용

