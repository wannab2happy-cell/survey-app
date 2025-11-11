// Theme V2 관리자 페이지
// 3패널 레이아웃: Sidebar + Main + PropertyPanel

import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import SurveyBuilder from '../components/SurveyBuilder';
import SurveyList from './SurveyList';
import SurveyResults from './SurveyResults';
import Analytics from './Analytics';
import Settings from './Admin/Settings';
import Sidebar from '../components/admin/Sidebar';
import Topbar from '../components/admin/Topbar';
import PropertyPanel from '../components/admin/PropertyPanel';

const Dashboard = lazy(() => import('./Dashboard'));

export default function AdminV2({ onLogout }) {
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 좌측 사이드바 */}
      <Sidebar onLogout={onLogout} />

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 ml-64">
        {/* 상단바 */}
        <Topbar />

        {/* 콘텐츠 */}
        <main className="pt-16 pb-6 px-6">
          <Suspense fallback={
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
            </div>
          }>
            <Routes>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="builder/:id" element={<SurveyBuilder />} />
              <Route path="results/:id" element={<SurveyResults />} />
              <Route path="builder" element={<SurveyBuilder />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
              <Route index element={<SurveyList />} />
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

