import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function Login({ onLogin }) {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // 입력값 검증
    if (!id.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      console.log('[Login] 로그인 시도:', { username: id });
      console.log('[Login] 요청 URL:', axiosInstance.defaults.baseURL + '/auth/login');
      console.log('[Login] axiosInstance 확인:', {
        baseURL: axiosInstance.defaults.baseURL,
        hasPost: typeof axiosInstance.post === 'function'
      });
      
      const res = await axiosInstance.post('/auth/login', {
        username: id,
        password,
      });
      
      console.log('[Login] 요청 완료, 응답 대기 중...');

      console.log('[Login] 응답 상태:', res.status);
      console.log('[Login] 응답 데이터:', res.data);
      
      // 응답 데이터 확인
      if (!res.data) {
        throw new Error('서버로부터 응답을 받지 못했습니다.');
      }
      
      const token = res.data.token;
      
      if (!token) {
        console.error('[Login] 토큰이 없습니다. 응답:', res.data);
        throw new Error('토큰을 받지 못했습니다. 서버 응답: ' + JSON.stringify(res.data));
      }
      
      console.log('[Login] 토큰 저장:', token.substring(0, 20) + '...');
      localStorage.setItem('token', token);

      console.log('[Login] 관리자 페이지로 이동합니다.');
      // 로그인 성공 → 관리자 페이지 이동
      // 약간의 지연을 두어 토큰 저장이 완료된 후 이동
      setTimeout(() => {
        navigate('/admin', { replace: true });
      }, 100);
    } catch (err) {
      console.error('[Login] 로그인 오류:', err);
      console.error('[Login] 오류 상세:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText,
      });
      
      let errorMessage = '로그인 중 오류가 발생했습니다.';
      
      if (err.response) {
        // 서버 응답이 있는 경우
        errorMessage = err.response.data?.message || err.response.data?.error || `서버 오류 (${err.response.status})`;
      } else if (err.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        errorMessage = '서버에 연결할 수 없습니다. 네트워크를 확인해주세요.';
      } else {
        // 요청 설정 중 오류가 발생한 경우
        errorMessage = err.message || '로그인 요청 중 오류가 발생했습니다.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Anders Survey Platform Admin
        </h2>

        <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              type="text"
              placeholder="관리자 ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full border border-border px-3 py-2 rounded-t-md focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-border px-3 py-2 rounded-b-md focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          {error && <p className="text-error text-sm mt-2">{error}</p>}

          <button
            type="submit"
            disabled={loading || !id.trim() || !password.trim()}
            className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: loading || !id.trim() || !password.trim() ? '#9CA3AF' : 'var(--primary, #26C6DA)',
              color: '#FFFFFF',
            }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
