// src/pages/Admin.jsx (최종 코드)

import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import SurveyBuilder from "../components/SurveyBuilder.jsx"; 
import SurveyList from "./SurveyList.jsx"; 
import SurveyResults from "./SurveyResults.jsx"; 
// BrandingPage import 제거됨

export default function Admin({ onLogout }) {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* 1. 좌측 메뉴 (Navigation) */}
            <nav className="w-64 bg-white shadow-xl p-4 space-y-2 flex flex-col">
                <div className="text-xl font-bold text-indigo-600 mb-6">Survey Admin</div>
                
                <Link 
                    to="/admin" 
                    className="block p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                >
                    📋 설문 목록 (대시보드)
                </Link>
                <Link 
                    to="/admin/builder" 
                    className="block p-3 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                >
                    📝 설문 생성 (Builder)
                </Link>
                
                {/* 브랜딩 Link 제거됨 */}
                
                <button 
                    onClick={onLogout} 
                    className="mt-auto p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                >
                    로그아웃
                </button>
            </nav>

            {/* 2. 우측 콘텐츠 영역 */}
            <main className="flex-1 overflow-y-auto">
                <Routes>
                    
                    {/* 1순위: 수정 모드 */}
                    <Route path="builder/:id" element={<SurveyBuilder />} /> 
                    
                    {/* 2순위: 결과 분석 모드 */}
                    <Route path="results/:id" element={<SurveyResults />} /> 
                    
                    {/* 브랜딩 Route 제거됨 */}
                    
                    {/* 3순위: 생성 모드 */}
                    <Route path="builder" element={<SurveyBuilder />} /> 
                    
                    {/* 4순위: Admin 루트 경로 (목록) */}
                    <Route index element={<SurveyList />} /> 
                    
                    {/* 5순위: 정의되지 않은 Admin 내부 경로는 목록으로 리디렉션 */}
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Routes>
            </main>
        </div>
    );
}