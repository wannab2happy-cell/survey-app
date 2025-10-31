import { useState } from "react";
import DataExport from "./Admin/DataExport";
import SurveyBuilder from "./Admin/SurveyBuilder";
import Customization from "./Admin/Customization";

export default function Admin() {
  const [tab, setTab] = useState("export");

  const renderTab = () => {
    if (tab === "export") return <DataExport />;
    if (tab === "builder") return <SurveyBuilder />;
    if (tab === "custom") return <Customization />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 상단 헤더 */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>
            Anders Admin
          </h1>
          <button
            onClick={() => alert('로그아웃 기능 추가 예정')}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* 탭 메뉴 */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-start px-6">
          {[
            { id: "export", label: "📊 응답 데이터 추출" },
            { id: "builder", label: "✍️ 설문 생성 및 관리" },
            { id: "custom", label: "🎨 브랜드 커스터마이징" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`px-6 py-3 font-medium border-b-2 transition ${
                tab === item.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-blue-600"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="flex-grow max-w-7xl mx-auto w-full p-6">
        <div className="bg-white rounded-xl shadow-card p-8">{renderTab()}</div>
      </main>

      {/* 하단 */}
      <footer className="bg-gray-100 text-center text-sm text-gray-500 py-4 border-t">
        © 2025 Anders Inc. All rights reserved.
      </footer>
    </div>
  );
}
