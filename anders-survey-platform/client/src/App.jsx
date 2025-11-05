import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Login from "./pages/Login";
import SurveyList from "./pages/SurveyList";
import SurveyBuilder from "./pages/SurveyBuilder";

// ✅ 보호 라우트
const AdminRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// ✅ 로그아웃 포함 메인 App
function AppContent() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  const handleLogin = (token) => {
    localStorage.setItem("token", token);
    setIsAuthenticated(true);
    navigate("/admin/list", { replace: true });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    navigate("/login", { replace: true }); // ✅ 즉시 로그인 화면으로 이동
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route
          path="/admin/*"
          element={
            <AdminRoute isAuthenticated={isAuthenticated}>
              <Routes>
                <Route
                  path="list"
                  element={<SurveyList onLogout={handleLogout} />}
                />
                <Route path="builder/:id" element={<SurveyBuilder />} />
                <Route path="/" element={<Navigate to="list" replace />} />
              </Routes>
            </AdminRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
