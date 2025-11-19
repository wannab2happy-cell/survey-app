// 관리자용 상단바
// anders 스타일: 브레드크럼, 프로필, 검색

import { useLocation, Link } from 'react-router-dom';

export default function Topbar() {
  const location = useLocation();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') {
      return [{ label: '설문 목록', path: '/admin' }];
    }
    if (path.startsWith('/admin/dashboard')) {
      return [
        { label: '설문 목록', path: '/admin' },
        { label: '대시보드', path: '/admin/dashboard' }
      ];
    }
    if (path.startsWith('/admin/builder')) {
      return [
        { label: '설문 목록', path: '/admin' },
        { label: '설문 만들기', path: '/admin/builder' }
      ];
    }
    if (path.startsWith('/admin/results')) {
      return [
        { label: '설문 목록', path: '/admin' },
        { label: '응답 결과', path: path }
      ];
    }
    if (path.startsWith('/admin/settings')) {
      return [
        { label: '설문 목록', path: '/admin' },
        { label: '설정', path: '/admin/settings' }
      ];
    }
    if (path.startsWith('/admin/account')) {
      return [
        { label: '설문 목록', path: '/admin' },
        { label: '계정정보', path: '/admin/account' }
      ];
    }
    return [{ label: '설문 목록', path: '/admin' }];
  };

  const breadcrumbs = getBreadcrumb();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 fixed top-0 left-64 right-0 z-10">
      {/* 브레드크럼 */}
      <nav className="flex items-center gap-2">
        {breadcrumbs.map((crumb, idx) => (
          <div key={idx} className="flex items-center gap-2">
            {idx > 0 && <span className="text-gray-400">/</span>}
            <Link
              to={crumb.path}
              className={`text-sm ${
                idx === breadcrumbs.length - 1
                  ? 'text-gray-900 font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {crumb.label}
            </Link>
          </div>
        ))}
      </nav>

      {/* 우측 액션 */}
      <div className="flex items-center gap-4">
      </div>
    </header>
  );
}



