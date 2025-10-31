import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// 페이지 import
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import SurveyPage from "./pages/SurveyPage"; // ✅ 새로 추가

/**
 * Anders Survey Platform App.jsx (라우팅 통합 버전)
 * - 로그인 → 관리자(Admin)
 * - /survey 경로 → 참여자용 설문 페이지
 */

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <Routes>
        {/* 참여자 설문 페이지 (로그인 없이 접근 가능) */}
        <Route path="/survey" element={<SurveyPage />} />

        {/* 기본 루트: 로그인 또는 관리자 페이지 */}
        <Route
          path="/"
          element={
            isLoggedIn ? (
              <Admin />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
