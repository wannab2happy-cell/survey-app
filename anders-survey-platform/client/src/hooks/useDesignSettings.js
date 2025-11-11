// client/src/hooks/useDesignSettings.js

import { useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const useDesignSettings = () => {
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // 백엔드의 GET /api/settings 엔드포인트 호출
                const response = await axiosInstance.get('/settings'); 
                const data = response.data;

                if (data.success) {
                    const settings = data.settings;
                    
                    // HTML 문서의 루트 요소 (<html>)에 CSS 변수로 설정 적용
                    const root = document.documentElement;

                    // 1. 컬러 적용
                    if (settings.primary_color) {
                        root.style.setProperty('--dynamic-primary-color', settings.primary_color);
                    }
                    if (settings.secondary_color) {
                        root.style.setProperty('--dynamic-secondary-color', settings.secondary_color);
                    }
                    
                    // 2. 폰트 적용
                    if (settings.font_family) {
                        root.style.setProperty('--dynamic-font-family', settings.font_family);
                    }

                    console.log('Design settings applied:', settings);
                }
            } catch (error) {
                console.error('Failed to fetch design settings:', error);
                // 실패 시 기본값 사용 (CSS에서 정의)
            }
        };

        fetchSettings();
    }, []); // 컴포넌트 마운트 시 한 번만 실행
};

export default useDesignSettings;