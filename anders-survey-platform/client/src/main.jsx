import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
// Tailwind CSS 및 디자인 설정을 위한 index.css 파일을 불러옵니다.
import './index.css'; 

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
