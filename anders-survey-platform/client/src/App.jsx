import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SurveyBuilder from './components/SurveyBuilder';
import SurveyPage from './pages/SurveyPage';
import SurveyPageV2 from './pages/SurveyPageV2';
import Login from './pages/Login';
import Admin from './pages/Admin';
import AdminV2 from './pages/AdminV2';
import NotFound from './pages/NotFound';
import { isThemeV2Enabled } from './utils/featureToggle';
import './App.css';

const isAuthenticated = () => !!localStorage.getItem('token');

const PrivateRoute = ({ element: Element }) =>
  isAuthenticated() ? Element : <Navigate to="/login" />;

function AppContent() {
  const location = useLocation();
  const themeV2Enabled = isThemeV2Enabled();
  const isAdmin = location.pathname.startsWith('/admin');
  
  // 로그아웃 핸들러
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };
  
  return (
    <div className={`${themeV2Enabled ? 'theme-v2' : 'theme-legacy'} ${isAdmin ? 'admin-theme' : ''}`}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          {/* 레거시 라우트 (기존 호환성 유지) */}
          <Route path="/surveys" element={<SurveyPage />} />
          <Route path="/surveys/:surveyId" element={<SurveyPage />} />
          {/* 새로운 라우트 (Theme V2) */}
          {themeV2Enabled ? (
            <>
              <Route path="/s/:slug" element={<SurveyPageV2 />} />
              <Route path="/s/:slug/start" element={<SurveyPageV2 />} />
              <Route path="/s/:slug/q/:step" element={<SurveyPageV2 />} />
              <Route path="/s/:slug/review" element={<SurveyPageV2 />} />
              <Route path="/s/:slug/done" element={<SurveyPageV2 />} />
            </>
          ) : null}
          <Route path="/builder" element={<PrivateRoute element={<SurveyBuilder />} />} />
          <Route 
            path="/admin/*" 
            element={
              <PrivateRoute 
                element={themeV2Enabled ? <AdminV2 onLogout={handleLogout} /> : <Admin onLogout={handleLogout} />} 
              />
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
