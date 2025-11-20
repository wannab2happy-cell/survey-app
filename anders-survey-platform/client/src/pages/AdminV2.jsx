// Theme V2 관리자 페이지
// 3패널 레이아웃: Sidebar + Main + PropertyPanel

import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import React from 'react';
import SurveyBuilder from '../components/SurveyBuilder';
import SurveyList from './SurveyList';
import SurveyResults from './SurveyResults';
import Settings from './Admin/Settings';
import Account from './Admin/Account';
import Sidebar from '../components/admin/Sidebar';
import Topbar from '../components/admin/Topbar';
import PropertyPanel from '../components/admin/PropertyPanel';

const Dashboard = lazy(() => import('./Dashboard'));

export default function AdminV2({ onLogout }) {
  // Admin 영역의 CSS 변수 보호 (디버깅용)
  React.useEffect(() => {
    const protectAdminColors = () => {
      const adminTheme = document.querySelector('.admin-theme');
      if (adminTheme) {
        adminTheme.style.setProperty('--primary', '#26C6DA', 'important');
        adminTheme.style.setProperty('--primary-hover', '#00ACC1', 'important');
        adminTheme.style.setProperty('--color-primary', '#26C6DA', 'important');
        adminTheme.style.setProperty('--color-accent', '#26C6DA', 'important');
      }
    };
    
    protectAdminColors();
    const interval = setInterval(protectAdminColors, 100);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 좌측 사이드바 */}
      <Sidebar onLogout={onLogout} />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* 상단바 */}
        <Topbar />

        {/* 콘텐츠 */}
        <main className="flex-1 px-6 overflow-hidden" style={{ height: '100vh', maxHeight: '100vh', overflow: 'hidden', paddingTop: '64px' }}>
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            </div>
          }>
            <Routes>
              <Route path="dashboard" element={<div className="h-full overflow-y-auto pb-6 pt-4"><Dashboard /></div>} />
              <Route path="builder/:id" element={<SurveyBuilder />} />
              <Route path="results/:id" element={<div className="h-full overflow-y-auto pb-6 pt-4"><SurveyResults /></div>} />
              <Route path="builder" element={<SurveyBuilder />} />
              <Route path="settings" element={<div className="h-full overflow-y-auto pb-12 pt-4"><Settings /></div>} />
              <Route path="account" element={<div className="h-full overflow-y-auto pb-6 pt-4"><Account /></div>} />
              <Route index element={<div className="h-full overflow-y-auto pb-6 pt-4"><SurveyList /></div>} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>

      {/* 우측 속성 패널 (필요시 표시) */}
      {/* <PropertyPanel title="속성">
        <div>속성 패널 내용</div>
      </PropertyPanel> */}
    </div>
  );
}

