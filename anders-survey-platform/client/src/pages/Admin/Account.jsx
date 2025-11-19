// 계정 정보 페이지
// 관리자 개인 계정 관리 (프로필, 비밀번호 변경)

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';

export default function Account() {
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    role: 'admin',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 프로필 정보 로드
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // 백엔드에 /api/auth/profile 또는 /api/users/me 같은 엔드포인트가 있다면 사용
        // 현재는 로컬 스토리지에서 토큰을 디코딩하여 사용자 정보 추출
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const parts = token.split('.');
            if (parts.length === 3) {
              const payload = JSON.parse(atob(parts[1]));
              setProfile({
                username: payload.username || '관리자',
                email: payload.email || '',
                role: payload.role || 'admin',
              });
            }
          } catch (e) {
            console.log('토큰에서 사용자 정보 추출 실패:', e);
          }
        }

        // 백엔드 API가 있다면 우선 사용
        try {
          const response = await axiosInstance.get('/auth/profile');
          if (response.data.success && response.data.data) {
            setProfile({
              username: response.data.data.username || profile.username,
              email: response.data.data.email || profile.email,
              role: response.data.data.role || profile.role,
            });
          }
        } catch (apiError) {
          // API가 없으면 로컬 정보 사용 (개발 환경)
          console.log('프로필 API가 아직 구현되지 않았습니다.');
        }
      } catch (error) {
        console.error('프로필 로드 오류:', error);
      }
    };

    loadProfile();
  }, []);

  // 프로필 업데이트
  const handleProfileUpdate = async () => {
    if (!profile.username.trim()) {
      setMessage({ type: 'error', text: '사용자 이름을 입력해주세요.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // 백엔드에 /api/auth/profile 또는 /api/users/me 같은 엔드포인트가 있다면 사용
      const response = await axiosInstance.put('/auth/profile', {
        username: profile.username,
        email: profile.email,
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: '프로필이 성공적으로 업데이트되었습니다.' });
      } else {
        setMessage({ type: 'error', text: response.data.message || '프로필 업데이트에 실패했습니다.' });
      }
    } catch (apiError) {
      if (apiError.response?.status === 404 || apiError.code === 'ERR_NETWORK') {
        console.warn('프로필 업데이트 API가 아직 구현되지 않았습니다.');
        setMessage({ 
          type: 'info', 
          text: '프로필 업데이트 기능은 백엔드 API 구현 후 활성화됩니다. 현재는 UI만 제공됩니다.' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: apiError.response?.data?.message || '프로필 업데이트에 실패했습니다.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 변경
  const handlePasswordChange = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setMessage({ type: 'error', text: '모든 필드를 입력해주세요.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: '비밀번호는 최소 6자 이상이어야 합니다.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await axiosInstance.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다.' });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordModal(false);
      } else {
        setMessage({ type: 'error', text: response.data.message || '비밀번호 변경에 실패했습니다.' });
      }
    } catch (apiError) {
      if (apiError.response?.status === 404 || apiError.code === 'ERR_NETWORK') {
        console.warn('비밀번호 변경 API가 아직 구현되지 않았습니다.');
        setMessage({ 
          type: 'info', 
          text: '비밀번호 변경 기능은 백엔드 API 구현 후 활성화됩니다. 현재는 UI만 제공됩니다.' 
        });
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordModal(false);
      } else {
        setMessage({ 
          type: 'error', 
          text: apiError.response?.data?.message || '비밀번호 변경에 실패했습니다.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-main mb-2">계정 정보</h1>
        <p className="text-text-sub">개인 계정 정보를 확인하고 수정하세요</p>
      </div>

      {/* 프로필 정보 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <h3 className="text-xl font-bold text-text-main mb-4">프로필 정보</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-sub mb-2">
              사용자 이름
            </label>
            <input
              type="text"
              value={profile.username}
              onChange={(e) => setProfile({ ...profile, username: e.target.value })}
              className="w-full border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="사용자 이름을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-sub mb-2">
              이메일
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              placeholder="이메일 주소를 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-sub mb-2">
              권한
            </label>
            <input
              type="text"
              value={profile.role === 'admin' ? '관리자' : profile.role}
              disabled
              className="w-full border border-border rounded-lg px-4 py-3 bg-gray-50 text-text-sub cursor-not-allowed"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleProfileUpdate}
              disabled={loading}
              className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              style={{ backgroundColor: '#26C6DA' }}
            >
              {loading ? '저장 중...' : '프로필 저장'}
            </button>
          </div>
        </div>
      </motion.div>

      {/* 비밀번호 변경 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <h3 className="text-xl font-bold text-text-main mb-2">비밀번호 변경</h3>
        <p className="text-text-sub mb-4">
          보안을 위해 정기적으로 비밀번호를 변경하는 것을 권장합니다.
        </p>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="px-6 py-2.5 rounded-lg text-white font-medium hover:opacity-90 transition-colors"
          style={{ backgroundColor: '#26C6DA' }}
        >
          비밀번호 변경
        </button>
      </motion.div>

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

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" 
          onClick={() => setShowPasswordModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-text-main">비밀번호 변경</h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
                  현재 비밀번호
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="현재 비밀번호를 입력하세요"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">
                  새 비밀번호
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-sub mb-2">
                  새 비밀번호 확인
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="새 비밀번호를 다시 입력하세요"
                />
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
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  style={{ backgroundColor: '#26C6DA' }}
                >
                  {loading ? '변경 중...' : '변경하기'}
                </button>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
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


