// SurveyList.jsx (필터, 삭제 기능 추가)

import { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { DocumentIcon, PlusIcon, EditIcon, ChevronRightIcon, PlayIcon } from '../components/icons';
import { isThemeV2Enabled } from '../utils/featureToggle';
import StatCard from '../components/admin/StatCard';
import SurveyCard from '../components/admin/SurveyCard';

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
  // 추가: 검색, 정렬, 뷰 전환
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt'); // 'title', 'updatedAt', 'responses'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [viewMode, setViewMode] = useState('card'); // 'card', 'table'
  const navigate = useNavigate();
  const location = useLocation();
  const themeV2Enabled = isThemeV2Enabled();

  useEffect(() => {
    const fetchSurveys = async () => {
      setLoading(true);
      const allSurveys = [];
      
      try {
        const response = await axiosInstance.get('/surveys');
        if (response.data.success && Array.isArray(response.data.data)) {
          const apiSurveys = response.data.data.map((survey) => ({
            id: survey._id || survey.id,
            title: survey.title,
            status: survey.status || 'inactive',
            updatedAt: survey.createdAt || survey.updatedAt
              ? new Date(survey.createdAt || survey.updatedAt).toLocaleString()
              : 'N/A',
            source: 'api',
          }));
          allSurveys.push(...apiSurveys);
        } else if (Array.isArray(response.data)) {
          const apiSurveys = response.data.map((survey) => ({
            id: survey._id || survey.id,
            title: survey.title,
            status: survey.status || 'inactive',
            updatedAt: survey.createdAt || survey.updatedAt
              ? new Date(survey.createdAt || survey.updatedAt).toLocaleString()
              : 'N/A',
            source: 'api',
          }));
          allSurveys.push(...apiSurveys);
        }
      } catch (err) {
        console.log('API에서 설문 목록 로드 실패, 로컬 스토리지 사용:', err);
      }
      
      const localSurveys = loadSurveyListFromLocal();
      allSurveys.push(...localSurveys);
      
      const uniqueSurveys = [];
      const seenIds = new Set();
      for (const survey of allSurveys) {
        if (survey.id && !seenIds.has(survey.id)) {
          seenIds.add(survey.id);
          uniqueSurveys.push(survey);
        }
      }
      
      setSurveys(uniqueSurveys);
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

  // 삭제 핸들러 (요구사항 7)
  const handleDelete = async (surveyId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm('정말로 이 설문을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await axiosInstance.delete(`/surveys/${surveyId}`);
      setSurveys(prev => prev.filter(s => s.id !== surveyId));
      setSelectedSurveys(prev => {
        const newSet = new Set(prev);
        newSet.delete(surveyId);
        return newSet;
      });
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('설문 삭제에 실패했습니다.');
    }
  };

  // 다중 선택 삭제 (요구사항 7)
  const handleBulkDelete = async () => {
    if (selectedSurveys.size === 0) {
      alert('삭제할 설문을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedSurveys.size}개의 설문을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const deletePromises = Array.from(selectedSurveys).map(id => 
        axiosInstance.delete(`/surveys/${id}`).catch(err => {
          console.error(`설문 ${id} 삭제 실패:`, err);
          return null;
        })
      );
      
      await Promise.all(deletePromises);
      setSurveys(prev => prev.filter(s => !selectedSurveys.has(s.id)));
      setSelectedSurveys(new Set());
    } catch (err) {
      console.error('일괄 삭제 실패:', err);
      alert('일부 설문 삭제에 실패했습니다.');
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
      alert('상태를 변경할 설문을 선택해주세요.');
      return;
    }

    if (!window.confirm(`선택한 ${selectedSurveys.size}개의 설문을 "${getStatusConfig(newStatus).label}" 상태로 변경하시겠습니까?`)) {
      return;
    }

    try {
      const updatePromises = Array.from(selectedSurveys).map(id => 
        axiosInstance.put(`/surveys/${id}`, { status: newStatus }).catch(err => {
          console.error(`설문 ${id} 상태 변경 실패:`, err);
          return null;
        })
      );
      
      await Promise.all(updatePromises);
      
      // 로컬 상태 업데이트
      setSurveys(prev => prev.map(s => 
        selectedSurveys.has(s.id) ? { ...s, status: newStatus } : s
      ));
      
      setSelectedSurveys(new Set());
      alert('상태가 성공적으로 변경되었습니다.');
    } catch (err) {
      console.error('일괄 상태 변경 실패:', err);
      alert('일부 설문의 상태 변경에 실패했습니다.');
    }
  };

  // 통계 계산
  const totalSurveys = surveys.length;
  const activeSurveys = surveys.filter(s => s.status === 'active').length;
  const totalResponses = surveys.reduce((sum, s) => sum + (s.totalResponses || 0), 0);
  
  // Theme V2 스타일로 렌더링
  if (themeV2Enabled) {
    return (
      <div className="space-y-6">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="전체 설문" 
            value={totalSurveys} 
            icon="📋" 
            color="purple" 
            delay={0}
          />
          <StatCard 
            title="활성 설문" 
            value={activeSurveys} 
            icon="✅" 
            color="green" 
            delay={0.1}
          />
          <StatCard 
            title="총 응답 수" 
            value={totalResponses} 
            icon="📊" 
            color="blue" 
            delay={0.2}
          />
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="space-y-4">
            {/* 첫 번째 줄: 검색 및 뷰 전환 */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* 검색 입력 */}
              <div className="flex-1 min-w-[200px]">
                <input
                  type="text"
                  placeholder="설문 제목으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              
              {/* 뷰 전환 버튼 */}
              <div className="flex items-center gap-2 border-2 border-gray-200 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('card')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    viewMode === 'card'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="카드 뷰"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label="표 뷰"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* 두 번째 줄: 상태 필터, 정렬, 일괄 작업 */}
            <div className="flex items-center gap-4 flex-wrap">
              <label className="text-sm font-medium text-gray-700">상태 필터:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-2 border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">전체</option>
                <option value="scheduled">예약됨</option>
                <option value="active">진행 중</option>
                <option value="completed">완료</option>
              </select>
              
              <label className="text-sm font-medium text-gray-700 ml-4">정렬:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border-2 border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="updatedAt">최근 수정일</option>
                <option value="title">제목</option>
                <option value="responses">응답 수</option>
              </select>
              
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 border-2 border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                aria-label={sortOrder === 'asc' ? '내림차순 정렬' : '오름차순 정렬'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
              
              <span className="text-sm text-gray-500 ml-auto">
                총 {filteredSurveys.length}개
              </span>
              
              {/* 일괄 작업 버튼 */}
              {selectedSurveys.size > 0 && (
                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBulkStatusChange(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="border-2 border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">일괄 상태 변경 ({selectedSurveys.size}개)</option>
                    <option value="active">진행 중으로 변경</option>
                    <option value="paused">일시 정지로 변경</option>
                    <option value="scheduled">예약으로 변경</option>
                    <option value="inactive">비활성화로 변경</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleBulkDelete}
                    className="px-4 py-2 rounded-lg text-sm text-white font-medium hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#EF4444' }}
                  >
                    선택 삭제
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-90 transition-all"
              style={{ backgroundColor: '#6B46C1' }}
            >
              <PlusIcon className="w-5 h-5" />
              첫 설문 만들기
            </Link>
          </div>
        ) : viewMode === 'table' ? (
          /* 표 뷰 */
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
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
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {survey.totalResponses || 0}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/builder/${survey.id}`)}
                              className="text-primary hover:text-primary-hover"
                            >
                              편집
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/results/${survey.id}`)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              결과
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDelete(survey.id, e)}
                              className="text-red-600 hover:text-red-700"
                            >
                              삭제
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
        ) : (
          /* 카드 뷰 (기존) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSurveys.map((survey, idx) => (
              <SurveyCard 
                key={survey.id} 
                survey={survey} 
                delay={idx * 0.05}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 기존 레거시 스타일
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
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
              <label className="text-sm font-medium text-gray-700">상태 필터:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border-2 border-gray-200 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-[#2dafb9] focus:border-[#2dafb9]"
              >
                <option value="all">전체</option>
                <option value="scheduled">예약됨</option>
                <option value="active">진행 중</option>
                <option value="completed">완료</option>
              </select>
              <span className="text-sm text-gray-500">
                총 {filteredSurveys.length}개
              </span>
            </div>
            
            {selectedSurveys.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="admin-btn px-4 py-2 rounded-lg text-sm"
              >
                선택 삭제 ({selectedSurveys.size})
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
                      onClick={(e) => handleDelete(survey.id, e)}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
    </div>
  );
}
