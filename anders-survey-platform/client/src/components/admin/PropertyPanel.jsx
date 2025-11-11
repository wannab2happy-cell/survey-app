// 관리자용 우측 속성 패널
// anders 스타일: 고정 너비, 스크롤 가능

export default function PropertyPanel({ children, title = '속성' }) {
  return (
    <aside className="w-80 bg-white border-l border-gray-200 h-screen fixed right-0 top-0 overflow-y-auto">
      <div className="p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </aside>
  );
}



