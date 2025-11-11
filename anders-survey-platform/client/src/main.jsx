// client/src/main.jsx 파일 전체 코드
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// ------------------------------------------
// [최종 수정]: CSS 파일 임포트 경로를 상대 경로 ('./index.css')로 변경
// 이 경로는 'main.jsx'와 같은 폴더(src)에 index.css가 있다고 가정합니다.
import './index.css'; 
// ------------------------------------------

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);