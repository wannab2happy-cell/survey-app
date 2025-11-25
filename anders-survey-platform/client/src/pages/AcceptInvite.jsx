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
      const res = await axiosInstance.post('/accept-invite', {
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
    <div className="max-w-md mx-auto mt-12 p-6 bg-bg rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-text-main">초대 수락</h2>
      {message.text && (
        <div className={`p-3 rounded mb-4 ${message.type === 'error' ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-sub mb-1">아이디</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-border rounded px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="사용자명"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-text-sub mb-1">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-border rounded px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
            placeholder="비밀번호"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '처리 중...' : '계정 만들기'}
        </button>
      </form>
    </div>
  );
}
