import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('andersadmin'); // 기본값
  const [password, setPassword] = useState('password123'); // 실제 백엔드 계정 비밀번호
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // ✅ 수정: 실제 서버 경로에 맞게 변경
      const response = await axios.post('http://localhost:3000/api/login', {
        username,
        password,
      });

      if (response.status === 200) {
        setMessage('✅ 로그인 성공!');
        onLoginSuccess(); // 성공 시 Admin.jsx로 전환
      }
    } catch (error) {
      if (error.response) {
        setMessage(
          `❌ 로그인 실패: ${
            error.response.data.message || 'ID 또는 비밀번호가 일치하지 않습니다.'
          }`
        );
      } else if (error.request) {
        setMessage('❌ 서버에 연결할 수 없습니다. (http://localhost:3000)');
      } else {
        setMessage('❌ 요청 설정 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl border-t-4 border-indigo-600">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          <span className="text-indigo-600">Anders</span> Survey Platform
        </h2>
        <p className="text-center text-gray-500 mb-8">관리자 로그인</p>

        <form onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                아이디 (andersadmin)
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                비밀번호 (password123)
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-8 flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        {message && (
          <div
            className={`mt-6 p-3 rounded-lg text-center font-medium ${
              message.includes('✅')
                ? 'bg-green-100 text-green-700'
                : message.includes('❌ 로그인 실패')
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
