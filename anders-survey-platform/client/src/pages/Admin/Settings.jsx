// 설정 페이지
// Theme V2 스타일: 시스템 설정 및 계정 관리

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';

export default function Settings() {
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeys, setApiKeys] = useState([]);
  const [newApiKeyName, setNewApiKeyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  // 추가: 권한 관리 상태
  const [showUserModal, setShowUserModal] = useState(false);
  const [users, setUsers] = useState([
    { id: 1, name: '관리자', email: 'admin@example.com', role: 'admin', lastLogin: '2024-12-19' }
  ]);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'viewer' });
  const [loadingInvite, setLoadingInvite] = useState(false);
  // 추가: 알림 설정 상태
  const [notifications, setNotifications] = useState({
    surveyClosed: true,
    responseIncrease: true,
    serverLoad: false,
    email: true,
    push: false,
  });

  // 초대된 사용자 목록 로드
  useEffect(() => {
    const fetchInvitedUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await axiosInstance.get('/users/invited', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success && response.data.data) {
          // API 응답 형식에 맞게 변환
          const invitedUsers = response.data.data.map(user => ({
            id: user._id || user.id,
            name: user.name || user.username,
            email: user.email,
            role: user.role,
            lastLogin: user.invitedAt ? new Date(user.invitedAt).toLocaleDateString('ko-KR') : '초대됨'
          }));
          setUsers(invitedUsers);
        }
      } catch (error) {
        console.error('초대된 사용자 목록 로드 오류:', error);
        // 에러가 발생해도 기존 사용자 목록은 유지
      }
    };

    fetchInvitedUsers();
  }, []);


  // API 키 생성 핸들러
  const handleCreateApiKey = () => {
    if (!newApiKeyName.trim()) {
      setMessage({ type: 'error', text: 'API 키 이름을 입력해주세요.' });
      return;
    }

    const newKey = {
      id: Date.now(),
      name: newApiKeyName,
      key: `sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    };

    setApiKeys([...apiKeys, newKey]);
    setNewApiKeyName('');
    setMessage({ type: 'success', text: 'API 키가 생성되었습니다.' });
  };

  // API 키 삭제 핸들러
  const handleDeleteApiKey = (keyId) => {
    if (window.confirm('정말로 이 API 키를 삭제하시겠습니까?')) {
      setApiKeys(apiKeys.filter(k => k.id !== keyId));
      setMessage({ type: 'success', text: 'API 키가 삭제되었습니다.' });
    }
  };

  // API 키 복사 핸들러
  const handleCopyApiKey = (key) => {
    navigator.clipboard.writeText(key);
    setMessage({ type: 'success', text: 'API 키가 클립보드에 복사되었습니다.' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // 추가: 사용자 초대 핸들러
  const handleInviteUser = async () => {
    if (!newUser.name || !newUser.email) {
      setMessage({ type: 'error', text: '이름과 이메일을 입력해주세요.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      setMessage({ type: 'error', text: '올바른 이메일 형식을 입력해주세요.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    setLoadingInvite(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: '로그인이 필요합니다.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        setLoadingInvite(false);
        return;
      }

      const response = await axiosInstance.post(
        '/users/invite',
        {
          name: newUser.name,
          email: newUser.email,
          role: newUser.role || 'viewer'
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        // 성공 메시지에 초대 링크 포함
        const inviteLink = response.data.data?.inviteLink || '';
        const successMessage = inviteLink 
          ? `${newUser.name}님을 초대했습니다. 초대 링크: ${inviteLink}`
          : `${newUser.name}님을 초대했습니다.`;

        setMessage({ type: 'success', text: successMessage });
        
        // 사용자 목록에 추가
        const newUserData = {
          id: response.data.data?.user?.id,
          name: response.data.data?.user?.name || newUser.name,
          email: response.data.data?.user?.email || newUser.email,
          role: response.data.data?.user?.role || newUser.role,
          lastLogin: '초대됨'
        };
        setUsers([...users, newUserData]);
        
        // 폼 초기화
        setNewUser({ name: '', email: '', role: 'viewer' });
        setShowUserModal(false);
        
        // 초대 링크를 클립보드에 복사 (선택사항)
        if (inviteLink && navigator.clipboard) {
          navigator.clipboard.writeText(inviteLink).catch(() => {
            // 복사 실패해도 무시
          });
        }
      } else {
        setMessage({ type: 'error', text: response.data.message || '초대에 실패했습니다.' });
      }
    } catch (error) {
      console.error('사용자 초대 오류:', error);
      const errorMessage = error.response?.data?.message || '사용자 초대 중 오류가 발생했습니다.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoadingInvite(false);
      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    }
  };

  // 초대 취소 핸들러
  const handleDeleteInvite = async (userId) => {
    if (!window.confirm('정말로 이 초대를 취소하시겠습니까?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage({ type: 'error', text: '로그인이 필요합니다.' });
        return;
      }

      const response = await axiosInstance.delete(`/users/invite/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setUsers(users.filter(u => u.id !== userId));
        setMessage({ type: 'success', text: '초대가 취소되었습니다.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: response.data.message || '초대 취소에 실패했습니다.' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('초대 취소 오류:', error);
      const errorMessage = error.response?.data?.message || '초대 취소 중 오류가 발생했습니다.';
      setMessage({ type: 'error', text: errorMessage });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };


  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold text-text-main mb-2">시스템 설정</h1>
        <p className="text-text-sub">
          API 키 설정, 권한 관리, 알림 설정 등의 관리자 기능을 설정할 수 있습니다.
          개인 계정 정보는 <Link to="/admin/account" className="text-primary hover:underline">계정 정보</Link> 페이지에서 관리하세요.
        </p>
      </div>

      {/* 메시지 표시 */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-success/10 border border-success/20 text-success' 
              : message.type === 'info'
              ? 'bg-primary/10 border border-primary/20 text-primary'
              : 'bg-error/10 border border-error/20 text-error'
          }`}
        >
          {message.text}
        </motion.div>
      )}


      {/* API 연동 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <h3 className="text-lg font-bold text-text-main mb-2">API 연동</h3>
        <p className="text-text-sub mb-4">
          외부 서비스 연동을 위한 API 키를 발급 및 관리합니다.
        </p>
        <div className="space-y-4">
          <button 
            type="button"
            className="btn-primary"
            onClick={() => setShowApiKeyModal(true)}
          >
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            API 키 관리
          </button>
          
          {apiKeys.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-text-sub">생성된 API 키:</p>
              {apiKeys.map((key) => (
                <div key={key.id} className="p-3 bg-bg rounded-lg border border-border flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-main">{key.name}</p>
                    <p className="text-xs text-text-sub font-mono truncate">{key.key}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => handleCopyApiKey(key.key)}
                      className="btn-secondary text-xs"
                    >
                      <svg className="btn-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      복사
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteApiKey(key.id)}
                      className="btn-secondary text-xs"
                      style={{ backgroundColor: '#EF4444', color: '#ffffff', borderColor: '#EF4444' }}
                    >
                      <svg className="btn-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* 추가: 권한 관리 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-text-main mb-2">권한 관리</h3>
            <p className="text-text-sub text-sm">사용자 초대 및 권한 부여를 관리합니다.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowUserModal(true)}
            className="btn-primary"
          >
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            사용자 초대
          </button>
        </div>
        
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="p-3 bg-bg rounded-lg border border-border flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-text-main">{user.name}</p>
                <p className="text-xs text-text-sub">{user.email}</p>
                <p className="text-xs text-text-sub mt-1">마지막 로그인: {user.lastLogin}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <select
                  value={user.role}
                  onChange={(e) => {
                    setUsers(users.map(u => 
                      u.id === user.id ? { ...u, role: e.target.value } : u
                    ));
                    setMessage({ type: 'success', text: `${user.name}의 권한이 변경되었습니다.` });
                    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                  }}
                  className="px-3 py-1 text-xs border border-border rounded focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="admin">관리자</option>
                  <option value="editor">편집자</option>
                  <option value="viewer">뷰어</option>
                </select>
                <button
                  type="button"
                  onClick={() => handleDeleteInvite(user.id)}
                  className="btn-secondary text-xs"
                  style={{ backgroundColor: '#EF4444', color: '#ffffff', borderColor: '#EF4444' }}
                >
                  <svg className="btn-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 추가: 알림 설정 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <h3 className="text-lg font-bold text-text-main mb-4">알림 설정</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-text-main">설문 마감 알림</label>
              <p className="text-xs text-text-sub mt-1">설문이 종료될 때 알림을 받습니다</p>
            </div>
            <button
              type="button"
              onClick={() => setNotifications({ ...notifications, surveyClosed: !notifications.surveyClosed })}
              aria-label="설문 마감 알림"
              aria-checked={notifications.surveyClosed}
              role="switch"
              className="relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              style={{
                padding: '2px',
                backgroundColor: notifications.surveyClosed ? '#26C6DA' : '#D1D5DB'
              }}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-all shadow-sm ${
                notifications.surveyClosed ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-text-main">응답 증가 알림</label>
              <p className="text-xs text-text-sub mt-1">응답 수가 증가할 때 알림을 받습니다</p>
            </div>
            <button
              type="button"
              onClick={() => setNotifications({ ...notifications, responseIncrease: !notifications.responseIncrease })}
              aria-label="응답 증가 알림"
              aria-checked={notifications.responseIncrease}
              role="switch"
              className="relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              style={{
                padding: '2px',
                backgroundColor: notifications.responseIncrease ? '#26C6DA' : '#D1D5DB'
              }}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-all shadow-sm ${
                notifications.responseIncrease ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-text-main">서버 부하 알림</label>
              <p className="text-xs text-text-sub mt-1">서버 부하가 높을 때 알림을 받습니다</p>
            </div>
            <button
              type="button"
              onClick={() => setNotifications({ ...notifications, serverLoad: !notifications.serverLoad })}
              aria-label="서버 부하 알림"
              aria-checked={notifications.serverLoad}
              role="switch"
              className="relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              style={{
                padding: '2px',
                backgroundColor: notifications.serverLoad ? '#26C6DA' : '#D1D5DB'
              }}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-all shadow-sm ${
                notifications.serverLoad ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>
          
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium text-text-main mb-3">알림 방식</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-text-sub">이메일</label>
                <button
                  type="button"
                  onClick={() => setNotifications({ ...notifications, email: !notifications.email })}
                  aria-label="이메일 알림"
                  aria-checked={notifications.email}
                  role="switch"
                  className="relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  style={{
                    padding: '2px',
                    backgroundColor: notifications.email ? '#26C6DA' : '#D1D5DB'
                  }}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white transition-all shadow-sm ${
                    notifications.email ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm text-text-sub">푸시 알림</label>
                <button
                  type="button"
                  onClick={() => setNotifications({ ...notifications, push: !notifications.push })}
                  aria-label="푸시 알림"
                  aria-checked={notifications.push}
                  role="switch"
                  className="relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  style={{
                    padding: '2px',
                    backgroundColor: notifications.push ? '#26C6DA' : '#D1D5DB'
                  }}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white transition-all shadow-sm ${
                    notifications.push ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 시스템 정보 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <h3 className="text-lg font-bold text-text-main mb-4">시스템 정보</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-text-sub">버전:</span>
            <span className="text-text-main font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-sub">환경:</span>
            <span className="text-text-main font-medium">{process.env.NODE_ENV === 'production' ? 'Production' : 'Development'}</span>
          </div>
        </div>
      </motion.div>

      {/* API 키 관리 모달 */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowApiKeyModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto pb-8"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-text-main">API 키 관리</h3>
              <button
                onClick={() => setShowApiKeyModal(false)}
                className="text-text-sub hover:text-text-main text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              {/* 새 API 키 생성 */}
              <div className="p-4 bg-bg rounded-lg border border-border">
                <label className="block text-sm font-medium text-text-sub mb-2">
                  새 API 키 생성
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newApiKeyName}
                    onChange={(e) => setNewApiKeyName(e.target.value)}
                    className="flex-1 border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="API 키 이름을 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={handleCreateApiKey}
                    className="btn-primary"
                  >
                    <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    생성
                  </button>
                </div>
              </div>
              
              {/* API 키 목록 */}
              {apiKeys.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-text-sub">생성된 API 키:</p>
                  {apiKeys.map((key) => (
                    <div key={key.id} className="p-4 bg-bg rounded-lg border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-text-main">{key.name}</p>
                        <button
                          type="button"
                          onClick={() => handleDeleteApiKey(key.id)}
                          className="btn-secondary text-xs"
                          style={{ backgroundColor: '#EF4444', color: '#ffffff', borderColor: '#EF4444' }}
                        >
                          <svg className="btn-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          삭제
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-text-sub bg-white px-3 py-2 rounded border border-border font-mono truncate">
                          {key.key}
                        </code>
                        <button
                          type="button"
                          onClick={() => handleCopyApiKey(key.key)}
                          className="btn-secondary text-sm"
                        >
                          <svg className="btn-icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          복사
                        </button>
                      </div>
                      <p className="text-xs text-text-sub mt-2">
                        생성일: {new Date(key.createdAt).toLocaleString('ko-KR')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-bg rounded-lg border border-border">
                  <p className="text-text-sub">생성된 API 키가 없습니다.</p>
                </div>
              )}
              
              <div className="flex justify-end">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-4 py-2 bg-bg border border-border rounded-lg hover:bg-primary/10 transition text-text-sub font-medium"
                >
                  닫기
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 추가: 사용자 초대 모달 */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUserModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-text-main">사용자 초대</h3>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setNewUser({ name: '', email: '', role: 'viewer' });
                  setMessage({ type: '', text: '' });
                }}
                className="text-text-sub hover:text-text-main text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg transition-colors"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">
                  이름 <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="사용자 이름을 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">
                  이메일 <span className="text-error">*</span>
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="이메일 주소를 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">
                  권한
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                >
                  <option value="viewer">뷰어 (조회 전용)</option>
                  <option value="editor">편집자 (설문 관리 가능)</option>
                  <option value="admin">관리자 (모든 권한)</option>
                </select>
              </div>
              
              {message.text && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.type === 'success' 
                    ? 'bg-success/10 text-success' 
                    : 'bg-error/10 text-error'
                }`}>
                  {message.text}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleInviteUser}
                  disabled={loadingInvite}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingInvite ? '초대 중...' : '초대하기'}
                </button>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setNewUser({ name: '', email: '', role: 'viewer' });
                    setMessage({ type: '', text: '' });
                  }}
                  className="px-4 py-2 bg-bg border border-border rounded-lg hover:bg-primary/10 transition text-text-sub font-medium"
                >
                  취소
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}