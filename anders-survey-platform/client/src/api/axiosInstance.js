import axios from 'axios';

// 환경 변수에서 baseURL 가져오기
const envBaseURL = import.meta.env.VITE_API_URL;

// 디버깅: 환경 변수 확인 (개발 모드에서만)
if (import.meta.env.MODE === 'development') {
  console.log('[Axios] import.meta.env.VITE_API_URL:', envBaseURL);
  console.log('[Axios] import.meta.env.MODE:', import.meta.env.MODE);
}

// Fallback: 환경 변수가 없으면 프로덕션 API URL 사용
// ⚠️ 중요: Vercel 환경 변수가 빌드 시점에 주입되지 않으면 fallback 사용
const PRODUCTION_API_URL = 'https://survey-app-c6tz.onrender.com/api';

// 환경 변수 확인 및 정규화
let finalBaseURL;
if (envBaseURL && typeof envBaseURL === 'string' && envBaseURL.trim() !== '') {
  finalBaseURL = envBaseURL.trim().replace(/\/$/, ''); // 끝의 슬래시 제거
} else {
  // 환경 변수가 없거나 빈 문자열이면 fallback 사용
  finalBaseURL = PRODUCTION_API_URL;
}

// 최종 baseURL 로그 (프로덕션에서는 간단하게)
if (import.meta.env.MODE === 'development') {
  console.log('[Axios] import.meta.env.VITE_API_URL:', envBaseURL);
  console.log('[Axios] ✅ 최종 baseURL:', finalBaseURL);
  if (!envBaseURL || envBaseURL.trim() === '') {
    console.warn('[Axios] ⚠️ VITE_API_URL이 설정되지 않아 fallback URL을 사용합니다:', PRODUCTION_API_URL);
  }
} else {
  // 프로덕션에서는 최소한의 로그만
  console.log('[Axios] baseURL:', finalBaseURL);
}

const axiosInstance = axios.create({
  baseURL: finalBaseURL,
  headers: { 'Content-Type': 'application/json' },
});

// 생성 후 확인 (개발 모드에서만)
if (import.meta.env.MODE === 'development') {
  console.log('[Axios] ✅ axiosInstance.defaults.baseURL:', axiosInstance.defaults.baseURL);
}

// JWT 토큰 만료 확인 헬퍼 함수
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // JWT 토큰은 base64로 인코딩된 3부분으로 구성: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    // payload 부분 디코딩
    const payload = JSON.parse(atob(parts[1]));
    
    // exp (expiration time)가 있는지 확인
    if (!payload.exp) return false; // exp가 없으면 만료 시간이 없으므로 유효한 것으로 간주
    
    // 현재 시간(초)과 만료 시간 비교
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    // 디코딩 실패 시 만료된 것으로 간주
    console.error('토큰 디코딩 실패:', error);
    return true;
  }
};

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage?.getItem('token');
    
    // 디버깅: 요청 URL 로그 (로그인 요청은 항상 로그 출력)
    const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
    const isLoginRequest = config.url?.includes('/auth/login') || config.url?.includes('/login');
    
    if (import.meta.env.MODE === 'development' || isLoginRequest) {
      console.log(`[Axios] Request: ${config.method?.toUpperCase()} ${fullUrl}`);
    }
    
    // 토큰이 만료되었는지 확인
    if (token && isTokenExpired(token)) {
      console.warn('토큰이 만료되었습니다. 로그인 페이지로 이동합니다.');
      localStorage.removeItem('token');
      
      // 현재 경로가 로그인 페이지가 아닌 경우에만 리다이렉트
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      // 요청 취소
      return Promise.reject(new Error('토큰이 만료되었습니다.'));
    }
    
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized 에러 처리 (토큰 만료 또는 유효하지 않은 토큰)
    if (error?.response?.status === 401) {
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || '인증이 만료되었습니다.';
      
      // 토큰이 만료되었거나 유효하지 않은 경우
      if (errorMessage.includes('만료') || errorMessage.includes('expired') || errorMessage.includes('유효하지 않은')) {
        // localStorage에서 토큰 제거
        localStorage.removeItem('token');
        
        // 현재 경로가 로그인 페이지가 아닌 경우에만 리다이렉트
        if (!window.location.pathname.includes('/login')) {
          console.warn('토큰이 만료되었습니다. 로그인 페이지로 이동합니다.');
          // 로그인 페이지로 리다이렉트
          window.location.href = '/login';
        }
      }
      
      console.error('401 Unauthorized:', errorMessage);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
