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
    if (path.startsWith('/admin/analytics')) {
      return [
        { label: '설문 목록', path: '/admin' },
        { label: '분석', path: '/admin/analytics' }
      ];
    }
    if (path.startsWith('/admin/settings')) {
      return [
        { label: '설문 목록', path: '/admin' },
        { label: '설정', path: '/admin/settings' }
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
        {/* 검색 */}
        <div className="relative">
          <input
            type="text"
            placeholder="검색..."
            className="w-64 px-4 py-2 pl-10 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* 프로필 */}
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center cursor-pointer">
          <span className="text-primary font-semibold">A</span>
        </div>
      </div>
    </header>
  );
}



