// 관리자용 좌측 사이드바
// 모던 단색 아이콘 디자인

import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

// 단색 SVG 아이콘 컴포넌트
const DashboardIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ListIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);


const SettingsIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UserIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LogoutIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const menuItems = [
  { path: '/admin/dashboard', label: '대시보드', icon: DashboardIcon },
  { path: '/admin', label: '설문 목록', icon: ListIcon },
  { path: '/admin/builder', label: '설문 만들기', icon: PlusIcon },
  { path: '/admin/settings', label: '설정', icon: SettingsIcon },
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

  // Admin 고정 색상 (템플릿과 무관)
  const ADMIN_COLOR = '#26C6DA';
  const ADMIN_COLOR_HOVER = '#00ACC1';
  const ADMIN_TEXT_COLOR = '#FFFFFF';
  const ADMIN_INACTIVE_COLOR = '#6B7280';
  const ADMIN_HOVER_BG = '#F9FAFB';

  return (
    <aside 
      className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-50"
      style={{ 
        backgroundColor: '#FFFFFF',
        borderRightColor: '#E5E7EB'
      }}
    >
      {/* 로고 */}
      <div className="p-6 border-b border-gray-200" style={{ borderBottomColor: '#E5E7EB' }}>
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm"
            style={{ backgroundColor: ADMIN_COLOR }}
          >
            S
          </div>
          <h1 className="text-xl font-bold" style={{ color: '#111827' }}>설문 플랫폼</h1>
        </div>
      </div>

      {/* 메뉴 */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item, idx) => {
            const active = isActive(item.path);
            const IconComponent = item.icon;
            return (
              <li key={idx}>
                <Link
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium"
                  style={active ? { 
                    backgroundColor: ADMIN_COLOR,
                    color: ADMIN_TEXT_COLOR
                  } : {
                    color: ADMIN_INACTIVE_COLOR
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = ADMIN_HOVER_BG;
                      e.currentTarget.style.color = '#111827';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = ADMIN_INACTIVE_COLOR;
                    }
                  }}
                >
                  <IconComponent 
                    className="w-5 h-5" 
                    style={active ? { color: ADMIN_TEXT_COLOR } : { color: ADMIN_INACTIVE_COLOR }}
                  />
                  <span 
                    className="text-sm"
                    style={active ? { color: ADMIN_TEXT_COLOR } : { color: ADMIN_INACTIVE_COLOR }}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 하단 계정정보 및 로그아웃 */}
      <div className="p-4 border-t border-gray-200 space-y-1" style={{ borderTopColor: '#E5E7EB' }}>
        {/* 계정정보 */}
        <Link
          to="/admin/account"
          className="w-full px-4 py-2.5 rounded-lg transition-all duration-200 text-left flex items-center gap-3 font-medium text-sm"
          style={location.pathname === '/admin/account' ? { 
            backgroundColor: ADMIN_COLOR,
            color: ADMIN_TEXT_COLOR
          } : {
            color: ADMIN_INACTIVE_COLOR
          }}
          onMouseEnter={(e) => {
            if (location.pathname !== '/admin/account') {
              e.currentTarget.style.backgroundColor = ADMIN_HOVER_BG;
              e.currentTarget.style.color = '#111827';
            }
          }}
          onMouseLeave={(e) => {
            if (location.pathname !== '/admin/account') {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = ADMIN_INACTIVE_COLOR;
            }
          }}
        >
          <UserIcon 
            className="w-5 h-5" 
            style={location.pathname === '/admin/account' ? { color: ADMIN_TEXT_COLOR } : { color: ADMIN_INACTIVE_COLOR }}
          />
          <span style={location.pathname === '/admin/account' ? { color: ADMIN_TEXT_COLOR } : { color: ADMIN_INACTIVE_COLOR }}>
            계정정보
          </span>
        </Link>
        
        {/* 로그아웃 */}
        <button
          type="button"
          onClick={() => {
            if (window.confirm('로그아웃 하시겠습니까?')) {
              if (onLogout) {
                onLogout();
              } else {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }
            }
          }}
          className="w-full px-4 py-2.5 rounded-lg transition-all duration-200 text-left flex items-center gap-3 font-medium text-sm"
          style={{ color: ADMIN_INACTIVE_COLOR }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = ADMIN_HOVER_BG;
            e.currentTarget.style.color = '#111827';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = ADMIN_INACTIVE_COLOR;
          }}
        >
          <LogoutIcon className="w-5 h-5" style={{ color: ADMIN_INACTIVE_COLOR }} />
          <span>로그아웃</span>
        </button>
      </div>
    </aside>
  );
}
