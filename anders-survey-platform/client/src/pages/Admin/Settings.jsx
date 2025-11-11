// 설정 페이지
// Theme V2 스타일: 시스템 설정 및 계정 관리

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axiosInstance from '../../api/axiosInstance';
import { 
  simulateSurveyCreation, 
  simulateResponseSubmission, 
  runFullSimulation, 
  testApiEndpoints 
} from '../../utils/simulation';

export default function Settings() {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
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
  // 추가: 알림 설정 상태
  const [notifications, setNotifications] = useState({
    surveyClosed: true,
    responseIncrease: true,
    serverLoad: false,
    email: true,
    push: false,
  });
  // 추가: 시스템 로그 상태
  const [systemLogs, setSystemLogs] = useState([]);
  // 추가: 접속자 모니터링 상태
  const [activeUsers, setActiveUsers] = useState(0);
  const [dailyActiveUsers, setDailyActiveUsers] = useState(0);
  // 추가: 시뮬레이션 도구 상태
  const [simulationConfig, setSimulationConfig] = useState({
    surveyCount: 1,
    questionCount: 5,
    responseCountPerSurvey: 10,
    delay: 100
  });
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationResults, setSimulationResults] = useState(null);
  const [apiTestResults, setApiTestResults] = useState(null);

  // 비밀번호 변경 핸들러
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
      // 비밀번호 변경 API 호출
      // 주의: 백엔드에 /auth/change-password 엔드포인트가 구현되어 있어야 합니다
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
      // API가 없는 경우를 대비한 폴백 (개발 환경)
      if (apiError.response?.status === 404 || apiError.code === 'ERR_NETWORK') {
        console.warn('비밀번호 변경 API가 아직 구현되지 않았습니다. 백엔드에 /auth/change-password 엔드포인트를 추가해주세요.');
        setMessage({ type: 'info', text: '비밀번호 변경 기능은 백엔드 API 구현 후 활성화됩니다. 현재는 UI만 제공됩니다.' });
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
  const handleInviteUser = () => {
    if (!newUser.name || !newUser.email) {
      setMessage({ type: 'error', text: '이름과 이메일을 입력해주세요.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      return;
    }

    const newUserData = {
      id: Date.now(),
      ...newUser,
      lastLogin: '초대됨',
    };

    setUsers([...users, newUserData]);
    setNewUser({ name: '', email: '', role: 'viewer' });
    setShowUserModal(false);
    setMessage({ type: 'success', text: `${newUserData.name}님을 초대했습니다.` });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // 추가: 접속자 모니터링 데이터 로드
  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        // 백엔드 API가 없을 경우를 대비한 폴백
        const stored = localStorage.getItem('activeUsers');
        if (stored) {
          const data = JSON.parse(stored);
          setActiveUsers(data.current || 0);
          setDailyActiveUsers(data.daily || 0);
        } else {
          // 모의 데이터 (실제 API 연동 시 제거)
          setActiveUsers(Math.floor(Math.random() * 50) + 10);
          setDailyActiveUsers(Math.floor(Math.random() * 200) + 100);
        }
      } catch (err) {
        console.log('접속자 수 조회 실패:', err);
      }
    };

    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 30000); // 30초마다 업데이트
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-main mb-2">시스템 설정</h1>
        <p className="text-text-sub">계정 관리 및 시스템 설정을 변경하세요</p>
      </div>

      {/* 프로젝트 설정 안내 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <h3 className="text-xl font-bold text-text-main mb-3">프로젝트 설정</h3>
        <p className="text-text-sub">
          이곳에서 사용자 계정 관리, API 키 설정, 시스템 백업/복구 등의 관리자 기능을 설정할 수 있습니다.
        </p>
      </motion.div>

      {/* 시뮬레이션 도구 - 상단으로 이동 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="bg-white rounded-xl shadow-md p-6 border-2 border-primary/20"
      >
        <h3 className="text-lg font-bold text-text-main mb-4">🔧 시뮬레이션 도구</h3>
        <p className="text-sm text-text-sub mb-4">
          설문 생성, 응답 제출, API 테스트를 자동으로 시뮬레이션하여 시스템을 검증합니다.
        </p>
        
        <div className="space-y-4">
          {/* 시뮬레이션 설정 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-sub mb-2">
                설문 개수
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={simulationConfig.surveyCount}
                onChange={(e) => setSimulationConfig({
                  ...simulationConfig,
                  surveyCount: parseInt(e.target.value) || 1
                })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={simulationRunning}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-sub mb-2">
                질문 개수
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={simulationConfig.questionCount}
                onChange={(e) => setSimulationConfig({
                  ...simulationConfig,
                  questionCount: parseInt(e.target.value) || 5
                })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={simulationRunning}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-sub mb-2">
                설문당 응답 수
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={simulationConfig.responseCountPerSurvey}
                onChange={(e) => setSimulationConfig({
                  ...simulationConfig,
                  responseCountPerSurvey: parseInt(e.target.value) || 10
                })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={simulationRunning}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-sub mb-2">
                응답 간 지연 (ms)
              </label>
              <input
                type="number"
                min="0"
                max="1000"
                value={simulationConfig.delay}
                onChange={(e) => setSimulationConfig({
                  ...simulationConfig,
                  delay: parseInt(e.target.value) || 100
                })}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                disabled={simulationRunning}
              />
            </div>
          </div>

          {/* 시뮬레이션 버튼 */}
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={async () => {
                setSimulationRunning(true);
                setSimulationResults(null);
                try {
                  const result = await runFullSimulation(simulationConfig);
                  setSimulationResults(result);
                  setMessage({
                    type: result.successCount > 0 ? 'success' : 'error',
                    text: `시뮬레이션 완료: 설문 ${result.totalSurveys}개, 응답 ${result.totalResponses}개 (성공: ${result.successCount}, 실패: ${result.failedCount})`
                  });
                } catch (error) {
                  setMessage({
                    type: 'error',
                    text: `시뮬레이션 오류: ${error.message}`
                  });
                } finally {
                  setSimulationRunning(false);
                }
              }}
              disabled={simulationRunning}
              className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-md hover:shadow-lg"
              style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            >
              {simulationRunning ? '실행 중...' : '전체 시뮬레이션 실행'}
            </button>
            
            <button
              type="button"
              onClick={async () => {
                setSimulationRunning(true);
                try {
                  const result = await simulateSurveyCreation({
                    questionCount: simulationConfig.questionCount
                  });
                  setMessage({
                    type: result.success ? 'success' : 'error',
                    text: result.success 
                      ? `설문 생성 성공: ${result.surveyId}` 
                      : `설문 생성 실패: ${result.error}`
                  });
                } catch (error) {
                  setMessage({
                    type: 'error',
                    text: `설문 생성 오류: ${error.message}`
                  });
                } finally {
                  setSimulationRunning(false);
                }
              }}
              disabled={simulationRunning}
              className="px-4 py-2.5 bg-secondary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-md hover:shadow-lg"
              style={{ backgroundColor: 'var(--secondary)', color: 'white' }}
            >
              설문 생성만
            </button>

            <button
              type="button"
              onClick={async () => {
                setSimulationRunning(true);
                setApiTestResults(null);
                try {
                  const result = await testApiEndpoints();
                  setApiTestResults(result);
                  setMessage({
                    type: result.failedCount === 0 ? 'success' : 'error',
                    text: `API 테스트 완료: 성공 ${result.successCount}개, 실패 ${result.failedCount}개`
                  });
                } catch (error) {
                  setMessage({
                    type: 'error',
                    text: `API 테스트 오류: ${error.message}`
                  });
                } finally {
                  setSimulationRunning(false);
                }
              }}
              disabled={simulationRunning}
              className="px-4 py-2.5 bg-success text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm shadow-md hover:shadow-lg"
              style={{ backgroundColor: 'var(--success)', color: 'white' }}
            >
              API 엔드포인트 테스트
            </button>
          </div>

          {/* 시뮬레이션 결과 */}
          {simulationResults && (
            <div className="mt-4 p-4 bg-bg rounded-lg border border-border">
              <h4 className="text-sm font-bold text-text-main mb-2">시뮬레이션 결과</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-sub">실행 시간:</span>
                  <span className="text-text-main">{(simulationResults.duration / 1000).toFixed(2)}초</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-sub">생성된 설문:</span>
                  <span className="text-text-main">{simulationResults.totalSurveys}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-sub">총 응답 수:</span>
                  <span className="text-text-main">{simulationResults.totalResponses}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">성공:</span>
                  <span className="text-success font-medium">{simulationResults.successCount}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-error">실패:</span>
                  <span className="text-error font-medium">{simulationResults.failedCount}개</span>
                </div>
                {simulationResults.errors && simulationResults.errors.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border max-h-40 overflow-y-auto">
                    <p className="text-error text-xs font-medium mb-1">오류 상세:</p>
                    {simulationResults.errors.map((err, idx) => (
                      <div key={idx} className="text-error text-xs mb-1 p-2 bg-error/10 rounded">
                        <p className="font-medium">{err.type === 'survey_creation' ? '설문 생성 오류' : '응답 제출 오류'}</p>
                        <p>{err.error}</p>
                        {err.errorDetails && <p className="text-xs opacity-75 mt-1">{err.errorDetails}</p>}
                        {err.status && <p className="text-xs opacity-75">HTTP {err.status}</p>}
                        {err.surveyId && <p className="text-xs opacity-75">설문 ID: {err.surveyId}</p>}
                        {err.responseNumber && <p className="text-xs opacity-75">응답 번호: {err.responseNumber}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* API 테스트 결과 */}
          {apiTestResults && (
            <div className="mt-4 p-4 bg-bg rounded-lg border border-border">
              <h4 className="text-sm font-bold text-text-main mb-2">API 테스트 결과</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-sub">실행 시간:</span>
                  <span className="text-text-main">{(apiTestResults.duration / 1000).toFixed(2)}초</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-success">성공:</span>
                  <span className="text-success font-medium">{apiTestResults.successCount}개</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-error">실패:</span>
                  <span className="text-error font-medium">{apiTestResults.failedCount}개</span>
                </div>
                <div className="mt-2 pt-2 border-t border-border max-h-32 overflow-y-auto">
                  {apiTestResults.tests && apiTestResults.tests.map((test, idx) => (
                    <div key={idx} className={`p-2 rounded mb-1 ${test.success ? 'bg-success/10' : 'bg-error/10'}`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${test.success ? 'text-success' : 'text-error'}`}>
                          {test.endpoint}
                        </span>
                        <span className={test.success ? 'text-success' : 'text-error'}>
                          {test.success ? '✓' : '✗'}
                        </span>
                      </div>
                      {test.error && (
                        <p className="text-error text-xs mt-1">{test.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
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

      {/* 관리자 계정 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <h3 className="text-lg font-bold text-text-main mb-2">관리자 계정</h3>
        <p className="text-text-sub mb-4">
          현재 로그인된 관리자 계정 정보를 확인하고 비밀번호를 변경합니다.
        </p>
        <button 
          className="px-6 py-2.5 rounded-lg text-white font-medium hover:bg-primary-hover transition-colors bg-primary"
          onClick={() => setShowPasswordModal(true)}
        >
          비밀번호 변경
        </button>
      </motion.div>

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
            className="px-6 py-2.5 rounded-lg text-white font-medium hover:bg-primary-hover transition-colors bg-primary"
            onClick={() => setShowApiKeyModal(true)}
          >
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
                      onClick={() => handleCopyApiKey(key.key)}
                      className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary-hover transition"
                    >
                      복사
                    </button>
                    <button
                      onClick={() => handleDeleteApiKey(key.id)}
                      className="px-3 py-1 text-xs bg-error text-white rounded hover:opacity-90 transition"
                    >
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
            onClick={() => setShowUserModal(true)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm"
          >
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
                  <option value="staff">스태프</option>
                  <option value="viewer">뷰어</option>
                </select>
                <button
                  onClick={() => {
                    if (window.confirm(`${user.name}을(를) 삭제하시겠습니까?`)) {
                      setUsers(users.filter(u => u.id !== user.id));
                      setMessage({ type: 'success', text: '사용자가 삭제되었습니다.' });
                      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                    }
                  }}
                  className="px-3 py-1 text-xs bg-error text-white rounded hover:opacity-90 transition"
                >
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
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                notifications.surveyClosed ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                notifications.surveyClosed ? 'translate-x-6' : 'translate-x-1'
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
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                notifications.responseIncrease ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                notifications.responseIncrease ? 'translate-x-6' : 'translate-x-1'
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
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                notifications.serverLoad ? 'bg-primary' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                notifications.serverLoad ? 'translate-x-6' : 'translate-x-1'
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    notifications.email ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    notifications.email ? 'translate-x-6' : 'translate-x-1'
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
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    notifications.push ? 'bg-primary' : 'bg-gray-300'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    notifications.push ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 추가: 접속자 모니터링 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <h3 className="text-lg font-bold text-text-main mb-4">접속자 모니터링</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-sm text-text-sub mb-1">실시간 접속자</p>
            <p className="text-2xl font-bold text-primary">{activeUsers}</p>
          </div>
          <div className="p-4 bg-success/10 rounded-lg border border-success/20">
            <p className="text-sm text-text-sub mb-1">1일 누적 접속자</p>
            <p className="text-2xl font-bold text-success">{dailyActiveUsers}</p>
          </div>
          <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20">
            <p className="text-sm text-text-sub mb-1">7일 추이</p>
            <p className="text-2xl font-bold text-secondary">준비 중</p>
          </div>
        </div>
      </motion.div>

      {/* 추가: 시스템 로그 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <h3 className="text-lg font-bold text-text-main mb-4">시스템 로그</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {systemLogs.length === 0 ? (
            <p className="text-sm text-text-sub text-center py-4">로그가 없습니다.</p>
          ) : (
            systemLogs.map((log, idx) => (
              <div key={idx} className="p-2 bg-bg rounded text-xs text-text-sub">
                <span className="text-text-main font-medium">{log.type}</span>: {log.message} - {log.timestamp}
              </div>
            ))
          )}
        </div>
      </motion.div>


      {/* 시스템 정보 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
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
            <span className="text-text-main font-medium">Development</span>
          </div>
        </div>
      </motion.div>

      {/* 비밀번호 변경 모달 */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowPasswordModal(false)}>
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

      {/* API 키 관리 모달 */}
      {showApiKeyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowApiKeyModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
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
                    onClick={handleCreateApiKey}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                  >
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
                          onClick={() => handleDeleteApiKey(key.id)}
                          className="px-3 py-1 text-xs bg-error text-white rounded hover:opacity-90 transition"
                        >
                          삭제
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-text-sub bg-white px-3 py-2 rounded border border-border font-mono truncate">
                          {key.key}
                        </code>
                        <button
                          onClick={() => handleCopyApiKey(key.key)}
                          className="px-3 py-2 bg-primary text-white rounded hover:bg-primary-hover transition text-sm font-medium"
                        >
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
                  <option value="viewer">뷰어 (읽기 전용)</option>
                  <option value="staff">스태프 (편집 가능)</option>
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
                  onClick={handleInviteUser}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
                >
                  초대하기
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