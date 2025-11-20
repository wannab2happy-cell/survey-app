// client/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // 환경 변수 접두사 설정 (VITE_로 시작하는 변수만 클라이언트에 노출)
  envPrefix: 'VITE_',
  // ⭐⭐⭐ [추가된 설정: Proxy] ⭐⭐⭐
  server: {
    host: '0.0.0.0', // 모든 네트워크 인터페이스에서 접근 가능
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  }
  // ⭐⭐⭐ [추가된 설정 끝] ⭐⭐⭐
});