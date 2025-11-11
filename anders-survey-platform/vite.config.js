import { defineConfig } from 'vite';
// ERR_MODULE_NOT_FOUND 오류 해결: 설치된 '@vitejs/plugin-react'로 변경
import react from '@vitejs/plugin-react';

// VITE 설정 파일
export default defineConfig({
  // React 플러그인 설정
  plugins: [react()],
  
  // 개발 서버 설정 (프론트엔드에서 백엔드로 API 요청을 프록시)
  server: {
    // Vite가 실행될 포트를 설정합니다.
    port: 5173,
    // 프록시 설정: /api로 시작하는 모든 요청을 백엔드 서버(localhost:3000)로 전달
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        // CORS 및 기타 헤더 문제 방지를 위해 rewrite 기능을 사용합니다.
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },

  // 모듈 해상도 설정 (ESM 사용을 확인)
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
});