import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

export default function AcceptInvite() {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get('token') || '';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setMessage({ type: 'error', text: '초대 토큰이 없습니다.' });
      return;
    }
    if (!username || !password) {
      setMessage({ type: 'error', text: '아이디와 비밀번호를 입력해주세요.' });
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.post('/users/accept-invite', {
        token,
        username,
        password,
      });
      if (res.data.success) {
        setMessage({ type: 'success', text: '계정이 생성되었습니다. 로그인합니다.' });
        // 자동 로그인 후 메인 페이지 이동
        const loginRes = await axiosInstance.post('/auth/login', {
          username,
          password,
        });
        if (loginRes.data.success) {
          localStorage.setItem('token', loginRes.data.token);
          // 로그인 후 메인 설문 페이지로 이동 (protected route)
          navigate('/surveys');
        } else {
          setMessage({ type: 'error', text: loginRes.data.message || '로그인에 실패했습니다.' });
        }
      } else {
        setMessage({ type: 'error', text: res.data.message || '초대 수락에 실패했습니다.' });
      }
    } catch (err) {
      console.error('Accept invite error:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || '서버 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-theme min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Anders Survey Platform Admin
        </h2>
        <p className="text-center text-sm text-gray-600 mb-4">
          초대를 수락하고 계정을 생성하세요
        </p>

        {message.text && (
          <div className={`p-3 rounded-lg text-sm ${
            message.type === 'error' 
              ? 'bg-error/10 text-error' 
              : 'bg-success/10 text-success'
          }`}>
            {message.text}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              type="text"
              placeholder="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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

          <button
            type="submit"
            disabled={loading || !username.trim() || !password.trim()}
            className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: loading || !username.trim() || !password.trim() ? '#9CA3AF' : '#26C6DA',
              color: '#FFFFFF',
            }}
          >
            {loading ? '처리 중...' : '계정 만들기'}
          </button>
        </form>
      </div>
    </div>
  );
}
