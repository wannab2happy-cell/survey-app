// SurveyList.jsx (필터, 삭제 기능 추가)

import { useEffect, useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { DocumentIcon, PlusIcon, EditIcon, ChevronRightIcon, PlayIcon } from '../components/icons';
import { isThemeV2Enabled } from '../utils/featureToggle';
import StatCard from '../components/admin/StatCard';
import { motion } from 'framer-motion';
import CustomSelect from '../components/ui/CustomSelect';
import ConfirmModal from '../components/ui/ConfirmModal';
import { toast } from '../components/ui/ToastContainer';

const loadSurveyListFromLocal = () => {
  const list = JSON.parse(localStorage.getItem('surveyList') || '[]');
  return list
    .map((id) => {
      const data = localStorage.getItem(`survey_${id}`);
      if (data) {
        const survey = JSON.parse(data);
        return {
          id: survey.id,
          title: survey.title,
          status: survey.status,
          updatedAt: survey.updatedAt
            ? new Date(survey.updatedAt).toLocaleString()
            : 'N/A',
          source: 'local',
        };
      }
      return { id, title: '설문 로드 오류', status: 'error' };
    })
    .filter((s) => s.status !== 'error');
};

const getStatusConfig = (status) => {
  const configs = {
    active: { 
      label: '활성', 
      bg: 'bg-emerald-100', 
      text: 'text-emerald-700', 
      border: 'border-emerald-300',
      dot: 'bg-emerald-500'
    },
    scheduled: { 
      label: '예약됨', 
      bg: 'bg-blue-100', 
      text: 'text-blue-700', 
      border: 'border-blue-300',
      dot: 'bg-blue-500'
    },
    paused: { 
      label: '일시정지', 
      bg: 'bg-amber-100', 
      text: 'text-amber-700', 
      border: 'border-amber-300',
      dot: 'bg-amber-500'
    },
    inactive: { 
      label: '비활성', 
      bg: 'bg-gray-100', 
      text: 'text-gray-700', 
      border: 'border-gray-300',
      dot: 'bg-gray-400'
    },
    completed: {
      label: '완료',
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-300',
      dot: 'bg-purple-500'
    }
  };
  return configs[status] || configs.inactive;
};

export default function SurveyList({ onLogout }) {
  const [surveys, setSurveys] = useState([]);
  const [filteredSurveys, setFilteredSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurveys, setSelectedSurveys] = useState(new Set());
  const [statusFilter, setStatusFilter] = useState('all'); // all, scheduled, active (ongoing), completed
  // 추가: 검색, 정렬
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt'); // 'title', 'updatedAt', 'responses'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const navigate = useNavigate();
  const location = useLocation();
  const themeV2Enabled = isThemeV2Enabled();
  // 추가: 메시지 상태 (토스트 메시지용)
  const [message, setMessage] = useState({ type: '', text: '' });
  // 추가: 작업 중 상태 (일괄 작업 시)
  const [processing, setProcessing] = useState(false);
  // 추가: 개별 작업 상태 (삭제, 상태 변경)
  const [processingItems, setProcessingItems] = useState(new Set());
  // 삭제 확인 중인 항목 추적 (동기적으로 관리)
  const deletingRef = useRef(new Set());

  // 메시지 표시 및 자동 숨김 (useEffect 전에 정의)
  const showMessage = (type, text, duration = 3000) => {
    setMessage({ type, text });
    if (duration > 0) {
      setTimeout(() => setMessage({ type: '', text: '' }), duration);
    }
  };

  useEffect(() => {
    const fetchSurveys = async () => {
      setLoading(true);
      const allSurveys = [];
      
      try {
        const response = await axiosInstance.get('/surveys');
        let apiSurveys = [];
        
        if (response.data.success && Array.isArray(response.data.data)) {
          apiSurveys = response.data.data.map((survey) => {
            // 데이터 검증
            if (!survey || (!survey._id && !survey.id)) {
              console.warn('유효하지 않은 설문 데이터:', survey);
              return null;
            }
            
            return {
              id: survey._id || survey.id,
              title: survey.title || '제목 없음',
              status: survey.status || 'inactive',
              updatedAt: survey.createdAt || survey.updatedAt
                ? new Date(survey.createdAt || survey.updatedAt).toLocaleString('ko-KR')
                : 'N/A',
              source: 'api',
              totalResponses: survey.totalResponses || 0
            };
          }).filter(s => s !== null);
        } else if (Array.isArray(response.data)) {
          apiSurveys = response.data.map((survey) => {
            // 데이터 검증
            if (!survey || (!survey._id && !survey.id)) {
              console.warn('유효하지 않은 설문 데이터:', survey);
              return null;
            }
            
            return {
              id: survey._id || survey.id,
              title: survey.title || '제목 없음',
              status: survey.status || 'inactive',
              updatedAt: survey.createdAt || survey.updatedAt
                ? new Date(survey.createdAt || survey.updatedAt).toLocaleString('ko-KR')
                : 'N/A',
              source: 'api',
              totalResponses: survey.totalResponses || 0
            };
          }).filter(s => s !== null);
        }
        
        allSurveys.push(...apiSurveys);
      } catch (err) {
        console.error('API에서 설문 목록 로드 실패:', err);
        // API 실패 시에도 로컬 스토리지 데이터는 로드 시도
      }
      
      // 로컬 스토리지에서 데이터 로드 (API 실패 시 대비)
      try {
        const localSurveys = loadSurveyListFromLocal();
        // 로컬 스토리지 설문도 API 설문과 병합 (중복 제거는 아래에서 처리)
        allSurveys.push(...localSurveys);
      } catch (localErr) {
        console.error('로컬 스토리지에서 설문 목록 로드 실패:', localErr);
      }
      
      // 중복 제거 및 데이터 검증 (API 데이터 우선)
      const uniqueSurveys = [];
      const seenIds = new Set();
      
      // API 설문을 먼저 추가 (우선순위 높음)
      for (const survey of allSurveys) {
        if (survey && survey.id && !seenIds.has(survey.id)) {
          seenIds.add(survey.id);
          // 최종 데이터 검증 - title이 없어도 id만 있으면 표시
          if (survey.id) {
            uniqueSurveys.push({
              ...survey,
              title: survey.title || '제목 없음',
              status: survey.status || 'inactive'
            });
          } else {
            console.warn('불완전한 설문 데이터:', survey);
          }
        }
      }
      
      setSurveys(uniqueSurveys);
      if (uniqueSurveys.length === 0 && allSurveys.length > 0) {
        showMessage('warning', '일부 설문 데이터를 로드할 수 없습니다.');
      }
      setLoading(false);
    };
    
    fetchSurveys();
  }, [location.pathname]);

  // 필터 및 검색 적용
  useEffect(() => {
    let filtered = surveys;
    
    // 상태 필터 적용
    if (statusFilter === 'scheduled') {
      filtered = surveys.filter(s => s.status === 'scheduled');
    } else if (statusFilter === 'active') {
      filtered = surveys.filter(s => s.status === 'active');
    } else if (statusFilter === 'completed') {
      filtered = surveys.filter(s => s.status === 'completed' || s.status === 'inactive');
    }
    
    // 검색 필터 적용
    if (searchQuery.trim()) {
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // 정렬 적용
    filtered = [...filtered].sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'title') {
        aValue = a.title || '';
        bValue = b.title || '';
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (sortBy === 'updatedAt') {
        aValue = new Date(a.updatedAt || 0).getTime();
        bValue = new Date(b.updatedAt || 0).getTime();
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      } else if (sortBy === 'responses') {
        aValue = a.totalResponses || 0;
        bValue = b.totalResponses || 0;
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });
    
    setFilteredSurveys(filtered);
  }, [surveys, statusFilter, searchQuery, sortBy, sortOrder]);

  const handleLogout = () => {
    if (onLogout) onLogout();
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  // 삭제 핸들러 (요구사항 7) - 확인 1회만 진행
  const handleDelete = async (surveyId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // 동기적으로 중복 호출 확인 (ref 사용)
    if (deletingRef.current.has(surveyId)) {
      return;
    }
    
    // 이미 처리 중이면 무시 (중복 호출 방지)
    if (processingItems.has(surveyId)) {
      return;
    }
    
    // 확인 전에 ref에 추가하여 동기적으로 중복 호출 차단
    deletingRef.current.add(surveyId);
    setProcessingItems(prev => new Set(prev).add(surveyId));
    
    // 삭제 확인 모달 표시
    setConfirmModal({
      isOpen: true,
      title: '설문 삭제',
      message: '정말로 이 설문을 삭제하시겠습니까?',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/surveys/${surveyId}`);
          setSurveys(prev => prev.filter(s => s.id !== surveyId));
          setSelectedSurveys(prev => {
            const newSet = new Set(prev);
            newSet.delete(surveyId);
            return newSet;
          });
          toast.success('설문이 삭제되었습니다.');
          showMessage('success', '설문이 삭제되었습니다.');
        } catch (err) {
          console.error('삭제 실패:', err);
          const errorMessage = err.response?.data?.message || err.message || '설문 삭제에 실패했습니다.';
          toast.error(errorMessage);
          showMessage('error', errorMessage);
        } finally {
          deletingRef.current.delete(surveyId);
          setProcessingItems(prev => {
            const newSet = new Set(prev);
            newSet.delete(surveyId);
            return newSet;
          });
        }
      }
    });
  };

  // 다중 선택 삭제 (요구사항 7) - 확인 1회만 진행
  const handleBulkDelete = async () => {
    if (selectedSurveys.size === 0) {
      showMessage('warning', '삭제할 설문을 선택해주세요.');
      return;
    }

    // 이미 처리 중이면 무시 (중복 호출 방지)
    if (processing) {
      return;
    }

    // 삭제 확인 모달 표시
    setConfirmModal({
      isOpen: true,
      title: '다중 삭제',
      message: `선택한 ${selectedSurveys.size}개의 설문을 삭제하시겠습니까?`,
      variant: 'danger',
      onConfirm: async () => {
        setProcessing(true);
    const selectedIds = Array.from(selectedSurveys);
    const results = [];
    const errors = [];

    try {
      const deletePromises = selectedIds.map(async (id) => {
        try {
          await axiosInstance.delete(`/surveys/${id}`);
          results.push(id);
          return { id, success: true };
        } catch (err) {
          console.error(`설문 ${id} 삭제 실패:`, err);
          const survey = surveys.find(s => s.id === id);
          errors.push({
            id,
            title: survey?.title || '제목 없음',
            error: err.response?.data?.message || err.message || '알 수 없는 오류',
          });
          return { id, success: false };
        }
      });
      
      await Promise.all(deletePromises);
      
      // 성공한 항목만 제거
      setSurveys(prev => prev.filter(s => !results.includes(s.id)));
      setSelectedSurveys(new Set());
      
      // 결과 메시지 표시
      if (errors.length === 0) {
        showMessage('success', `${results.length}개의 설문이 삭제되었습니다.`);
      } else if (results.length > 0) {
        showMessage('warning', `${results.length}개 삭제 성공, ${errors.length}개 실패: ${errors.map(e => e.title).join(', ')}`);
      } else {
        showMessage('error', `모든 설문 삭제에 실패했습니다.`);
      }
    } catch (err) {
      console.error('일괄 삭제 실패:', err);
      showMessage('error', '일괄 삭제 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedSurveys(new Set(filteredSurveys.map(s => s.id)));
    } else {
      setSelectedSurveys(new Set());
    }
  };

  const handleSelectSurvey = (surveyId, checked) => {
    setSelectedSurveys(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(surveyId);
      } else {
        newSet.delete(surveyId);
      }
      return newSet;
    });
  };

  // 추가: 일괄 상태 변경
  const handleBulkStatusChange = async (newStatus) => {
    if (selectedSurveys.size === 0) {
      showMessage('warning', '상태를 변경할 설문을 선택해주세요.');
      return;
    }

    setConfirmModal({
      isOpen: true,
      title: '상태 변경',
      message: `선택한 ${selectedSurveys.size}개의 설문을 "${getStatusConfig(newStatus).label}" 상태로 변경하시겠습니까?`,
      variant: 'warning',
      onConfirm: async () => {
        setProcessing(true);
    const selectedIds = Array.from(selectedSurveys);
    const results = [];
    const errors = [];

    try {
      const updatePromises = selectedIds.map(async (id) => {
        try {
          await axiosInstance.put(`/surveys/${id}`, { status: newStatus });
          results.push(id);
          return { id, success: true };
        } catch (err) {
          console.error(`설문 ${id} 상태 변경 실패:`, err);
          const survey = surveys.find(s => s.id === id);
          errors.push({
            id,
            title: survey?.title || '제목 없음',
            error: err.response?.data?.message || err.message || '알 수 없는 오류',
          });
          return { id, success: false };
        }
      });
      
      await Promise.all(updatePromises);
      
      // 성공한 항목만 상태 업데이트
      setSurveys(prev => prev.map(s => 
        results.includes(s.id) ? { ...s, status: newStatus } : s
      ));
      
      setSelectedSurveys(new Set());
      
      // 결과 메시지 표시
      if (errors.length === 0) {
        showMessage('success', `${results.length}개의 설문 상태가 변경되었습니다.`);
      } else if (results.length > 0) {
        showMessage('warning', `${results.length}개 변경 성공, ${errors.length}개 실패: ${errors.map(e => e.title).join(', ')}`);
      } else {
        showMessage('error', `모든 설문 상태 변경에 실패했습니다.`);
      }
    } catch (err) {
      console.error('일괄 상태 변경 실패:', err);
      showMessage('error', '일괄 상태 변경 중 오류가 발생했습니다.');
        } finally {
          setProcessing(false);
        }
      }
    });
  };

  // 통계 계산
  const totalSurveys = surveys.length;
  const activeSurveys = surveys.filter(s => s.status === 'active').length;
  const totalResponses = surveys.reduce((sum, s) => sum + (s.totalResponses || 0), 0);
  
  // Theme V2 스타일로 렌더링
  if (themeV2Enabled) {
    return (
      <div className="space-y-6">
        {/* 메시지 표시 */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg flex items-center justify-between ${
              message.type === 'success' 
                ? 'bg-green-100 border border-green-300 text-green-800' 
                : message.type === 'warning'
                ? 'bg-yellow-100 border border-yellow-300 text-yellow-800'
                : message.type === 'error'
                ? 'bg-red-100 border border-red-300 text-red-800'
                : 'bg-blue-100 border border-blue-300 text-blue-800'
            }`}
          >
            <span>{message.text}</span>
            <button
              onClick={() => setMessage({ type: '', text: '' })}
              className="ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
              aria-label="닫기"
            >
              ✕
            </button>
          </motion.div>
        )}
        
        {/* 통계 카드 - 작은 카드 사이즈 */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center gap-2">
            <span className="text-xs text-text-sub">전체</span>
            <span className="text-sm font-semibold text-text-main">{totalSurveys}</span>
          </div>
          <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center gap-2">
            <span className="text-xs text-text-sub">활성</span>
            <span className="text-sm font-semibold text-text-main">{activeSurveys}</span>
          </div>
          <div className="px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center gap-2">
            <span className="text-xs text-text-sub">응답</span>
            <span className="text-base font-bold text-gray-900">{totalResponses}</span>
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
          <div className="space-y-4">
            {/* 첫 번째 줄: 검색 */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* 검색 입력 */}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="설문 제목으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all hover:border-gray-400"
                />
              </div>
            </div>
            
            {/* 두 번째 줄: 상태 필터, 정렬, 일괄 작업 */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <CustomSelect
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value)}
                  options={[
                    { value: 'all', label: '전체' },
                    { value: 'scheduled', label: '예약됨' },
                    { value: 'active', label: '진행 중' },
                    { value: 'completed', label: '완료' },
                  ]}
                  placeholder="상태 선택"
                  className="w-40"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <CustomSelect
                  value={sortBy}
                  onChange={(value) => setSortBy(value)}
                  options={[
                    { value: 'updatedAt', label: '최근 수정일' },
                    { value: 'title', label: '제목' },
                    { value: 'responses', label: '응답 수' },
                  ]}
                  placeholder="정렬 기준"
                  className="w-40"
                />
                
                <button
                  type="button"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label={sortOrder === 'asc' ? '내림차순 정렬' : '오름차순 정렬'}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
              
              <span className="text-sm text-gray-500 ml-auto">
                총 {filteredSurveys.length}개
              </span>
              
              {/* 일괄 작업 버튼 */}
              {selectedSurveys.size > 0 && (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <CustomSelect
                      value=""
                      onChange={(value) => {
                        if (value) {
                          handleBulkStatusChange(value);
                        }
                      }}
                      disabled={processing}
                      options={[
                        { value: 'active', label: '진행 중으로 변경' },
                        { value: 'paused', label: '일시 정지로 변경' },
                        { value: 'scheduled', label: '예약으로 변경' },
                        { value: 'inactive', label: '비활성화로 변경' },
                      ]}
                      placeholder={`일괄 상태 변경 (${selectedSurveys.size}개)`}
                      className="w-48"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    disabled={processing}
                    className={`px-4 py-2.5 rounded-lg text-sm text-white font-medium hover:opacity-90 transition-opacity ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{ backgroundColor: '#EF4444' }}
                  >
                    {processing ? '처리 중...' : '선택 삭제'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 설문 목록 */}
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
            <p className="mt-4 text-gray-500">로딩 중...</p>
          </div>
        ) : filteredSurveys.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">설문이 없습니다</h3>
            <p className="text-gray-500 mb-6">새로운 설문을 만들어 시작하세요</p>
            <Link
              to="/admin/builder"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-90 transition-all bg-primary hover:bg-primary-hover"
            >
              <PlusIcon className="w-5 h-5" />
              첫 설문 만들기
            </Link>
          </div>
        ) : (
          /* 리스트 뷰 (테이블) */
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedSurveys.size === filteredSurveys.length && filteredSurveys.length > 0}
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-primary rounded focus:ring-primary"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">제목</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수정일</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">응답 수</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">작업</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSurveys.map((survey) => {
                    const statusConfig = getStatusConfig(survey.status);
                    const isSelected = selectedSurveys.has(survey.id);
                    return (
                      <tr 
                        key={survey.id}
                        className={`hover:bg-gray-50 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectSurvey(survey.id, e.target.checked)}
                            className="w-4 h-4 text-primary rounded focus:ring-primary"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{survey.title}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot} mr-1.5`}></span>
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {survey.updatedAt}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-base font-bold text-gray-900">{survey.totalResponses || 0}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/builder/${survey.id}`)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                              title="편집"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/results/${survey.id}`)}
                              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                              title="결과보기"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDelete(survey.id, e)}
                              disabled={processingItems.has(survey.id)}
                              className={`p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all ${processingItems.has(survey.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title="삭제"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 기존 레거시 스타일
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 메시지 표시 */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg flex items-center justify-between mb-4 ${
              message.type === 'success' 
                ? 'bg-green-100 border border-green-300 text-green-800' 
                : message.type === 'warning'
                ? 'bg-yellow-100 border border-yellow-300 text-yellow-800'
                : message.type === 'error'
                ? 'bg-red-100 border border-red-300 text-red-800'
                : 'bg-blue-100 border border-blue-300 text-blue-800'
            }`}
          >
            <span>{message.text}</span>
            <button
              onClick={() => setMessage({ type: '', text: '' })}
              className="ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
              aria-label="닫기"
            >
              ✕
            </button>
          </motion.div>
        )}
        
        {/* 헤더 */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <DocumentIcon className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">설문 목록</h1>
                <p className="text-sm text-gray-500 mt-1">설문을 관리하고 편집하세요</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleLogout}
                className="px-4 py-2.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 shadow-sm hover:shadow"
              >
                로그아웃
              </button>
              <Link
                to="/admin/builder"
                className="admin-btn flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                style={{ backgroundColor: '#2dafb9', color: '#ffffff' }}
              >
                <PlusIcon className="w-5 h-5" />
                새 설문 만들기
              </Link>
            </div>
          </div>
        </header>

        {/* 필터 및 삭제 버튼 (요구사항 6, 7) */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4">
              <CustomSelect
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                options={[
                  { value: 'all', label: '전체' },
                  { value: 'scheduled', label: '예약됨' },
                  { value: 'active', label: '진행 중' },
                  { value: 'completed', label: '완료' },
                ]}
                placeholder="상태 선택"
                className="w-40"
              />
              <span className="text-sm text-gray-500">
                총 {filteredSurveys.length}개
              </span>
            </div>
            
            {selectedSurveys.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={processing}
                className={`admin-btn px-4 py-2 rounded-lg text-sm ${processing ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {processing ? '처리 중...' : `선택 삭제 (${selectedSurveys.size})`}
              </button>
            )}
          </div>
        </div>

        {/* 설문 목록 */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
              <p className="mt-4 text-gray-500">로딩 중...</p>
            </div>
          ) : filteredSurveys.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                <DocumentIcon className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">설문이 없습니다</h3>
              <p className="text-gray-500 mb-6">새로운 설문을 만들어 시작하세요</p>
              <Link
                to="/admin/builder"
                className="admin-btn inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#2dafb9', color: '#ffffff' }}
              >
                <PlusIcon className="w-5 h-5" />
                첫 설문 만들기
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* 전체 선택 체크박스 */}
              <div className="p-4 bg-gray-50 border-b border-gray-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSurveys.size === filteredSurveys.length && filteredSurveys.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-[#2dafb9] rounded focus:ring-[#2dafb9]"
                  />
                  <span className="text-sm font-medium text-gray-700">전체 선택</span>
                </label>
              </div>

              {filteredSurveys.map((survey) => {
                const statusConfig = getStatusConfig(survey.status);
                const isSelected = selectedSurveys.has(survey.id);
                return (
                  <div
                    key={survey.id}
                    className={`flex items-center gap-4 p-6 hover:bg-indigo-50/50 transition-all duration-200 ${
                      isSelected ? 'bg-indigo-50' : ''
                    }`}
                  >
                    {/* 체크박스 */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectSurvey(survey.id, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-[#2dafb9] rounded focus:ring-[#2dafb9]"
                    />

                    {/* 설문 정보 */}
                    <Link
                      to={`/admin/builder/${survey.id}`}
                      className="flex-1 min-w-0 group"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#2dafb9] transition-colors truncate">
                              {survey.title}
                            </h3>
                            {/* 상태 배지 (요구사항 6: 최소화) */}
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            최종 수정: {survey.updatedAt}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              navigate(`/admin/results/${survey.id}`);
                            }}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                            title="응답 결과 보기"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.open(`/surveys/${survey.id}`, '_blank');
                            }}
                            className="p-2 text-gray-400 hover:text-[#2dafb9] hover:bg-[#2dafb9]/10 rounded-lg transition-all"
                            title="설문 참여 페이지 보기"
                          >
                            <PlayIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/admin/builder/${survey.id}`);
                            }}
                            className="p-2 text-gray-400 hover:text-[#2dafb9] hover:bg-[#2dafb9]/10 rounded-lg transition-all"
                            title="편집"
                          >
                            <EditIcon className="w-5 h-5" />
                          </button>
                          <ChevronRightIcon className="w-5 h-5 text-gray-300 group-hover:text-[#2dafb9] transition-colors flex-shrink-0" />
                        </div>
                      </div>
                    </Link>

                    {/* 삭제 버튼 */}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(survey.id, e)}
                      disabled={processingItems.has(survey.id)}
                      className={`p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all ${processingItems.has(survey.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title="삭제"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 확인 모달 */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm || (() => {})}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
      />
    </div>
  );
}
