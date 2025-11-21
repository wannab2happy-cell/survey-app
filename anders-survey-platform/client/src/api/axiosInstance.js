import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL;

// 디버깅: baseURL 확인
console.log('[Axios] VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('[Axios] baseURL:', baseURL);

if (!baseURL) {
  console.error('[Axios] ❌ VITE_API_URL이 설정되지 않았습니다!');
  console.error('[Axios] Vercel 환경 변수에 VITE_API_URL을 추가하세요.');
}

const axiosInstance = axios.create({
  baseURL: baseURL || 'https://survey-app-c6tz.onrender.com/api', // fallback
  headers: { 'Content-Type': 'application/json' },
});

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
