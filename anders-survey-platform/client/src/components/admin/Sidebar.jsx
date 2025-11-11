// 관리자용 좌측 사이드바
// anders 스타일: 고정 너비, 보라색 활성 상태

import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const menuItems = [
  { path: '/admin/dashboard', label: '대시보드', icon: '📊' },
  { path: '/admin', label: '설문 목록', icon: '📋' },
  { path: '/admin/builder', label: '설문 만들기', icon: '➕' },
  { path: '/admin/analytics', label: '분석', icon: '📈' },
  { path: '/admin/settings', label: '설정', icon: '⚙️' },
];

export default function Sidebar({ onLogout }) {
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/admin/dashboard') {
      return location.pathname === '/admin/dashboard' || location.pathname === '/admin/dashboard/';
    }
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0">
      {/* 로고 */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl bg-primary">
            S
          </div>
          <h1 className="text-xl font-bold text-gray-900">설문 플랫폼</h1>
        </div>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item, idx) => {
            const active = isActive(item.path);
            return (
              <li key={idx}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                    ${active 
                      ? 'bg-primary text-white font-semibold shadow-md' 
                      : 'text-text-sub hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 하단 프로필/로그아웃 */}
      <div className="p-4 border-t border-gray-200">
        <button
          type="button"
          onClick={() => {
            if (window.confirm('로그아웃 하시겠습니까?')) {
              if (onLogout) {
                onLogout();
              } else {
                // onLogout이 없을 경우 폴백 처리
                localStorage.removeItem('token');
                window.location.href = '/login';
              }
            }
          }}
          className="w-full px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors text-left flex items-center gap-3 font-medium"
        >
          <span>🚪</span>
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
}

