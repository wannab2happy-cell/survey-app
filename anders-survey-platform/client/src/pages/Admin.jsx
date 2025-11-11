// src/pages/Admin.jsx (모던 UI 개선)

import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router-dom';
import SurveyBuilder from '../components/SurveyBuilder.jsx';
import SurveyList from './SurveyList.jsx';
import SurveyResults from './SurveyResults.jsx';
import { DocumentIcon } from '../components/icons';

export default function Admin({ onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();
    
    const handleLogout = () => {
        localStorage.removeItem('token');
        if (onLogout) {
            onLogout();
        }
        navigate('/login', { replace: true });
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
    
    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* 1. 좌측 메뉴 (Navigation) - 모던 디자인 */}
            <nav className="w-64 bg-white shadow-2xl border-r border-gray-200 p-6 flex flex-col">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 rounded-xl">
                            <DocumentIcon className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Survey Admin
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 ml-12">설문 관리 시스템</p>
                </div>
                
                <div className="space-y-2 flex-1">
                    <Link 
                        to="/admin" 
                        className={`
                            flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                            ${isActive('/admin') && !location.pathname.includes('/builder') && !location.pathname.includes('/results')
                                ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg'
                                : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                            }
                        `}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span className="font-medium">설문 목록</span>
                    </Link>
                    
                    <Link 
                        to="/admin/builder" 
                        className={`
                            flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                            ${location.pathname.includes('/builder')
                                ? 'text-white shadow-lg'
                                : 'text-gray-700 hover:bg-[#2dafb9]/10 hover:text-[#2dafb9]'
                            }
                        `}
                        style={location.pathname.includes('/builder') 
                            ? { backgroundColor: '#2dafb9', color: '#ffffff' }
                            : {}
                        }
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="font-medium">설문 생성</span>
                    </Link>
                </div>
                
                <button 
                    onClick={handleLogout} 
                    className="mt-auto flex items-center gap-3 p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 hover:shadow-md transition-all duration-200 font-medium"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    로그아웃
                </button>
            </nav>

            {/* 2. 우측 콘텐츠 영역 */}
            <main className="flex-1 overflow-y-auto">
                <Routes>
                    <Route path="builder/:id" element={<SurveyBuilder />} /> 
                    <Route path="results/:id" element={<SurveyResults />} /> 
                    <Route path="builder" element={<SurveyBuilder />} /> 
                    <Route index element={<SurveyList />} /> 
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
            </main>
        </div>
    );
}
