import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 설정 파일: 프론트엔드(5173)와 백엔드(3000) 간의 통신을 위한 프록시 설정
export default defineConfig({
  plugins: [react()],
  server: {
    // 모든 HTTP 요청을 127.0.0.1:3000 (백엔드 서버)로 전달하도록 설정
    proxy: {
      '/api': {
        // 백엔드 서버의 IP 주소와 포트 (로컬 호스트 IP)
        target: 'http://127.0.0.1:3000', 
        changeOrigin: true, // 호스트 헤더 변경 허용
        secure: false, // HTTPS가 아니므로 false 설정
      }
    }
  }
})
