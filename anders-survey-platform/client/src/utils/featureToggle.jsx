// Feature Toggle 유틸리티
// 환경 변수를 통해 신구 UI를 전환할 수 있도록 지원

import React from 'react';

/**
 * Feature Toggle 상태 확인
 * @returns {boolean} FEATURE_THEME_V2가 활성화되어 있는지 여부
 */
// 한 번만 로그를 출력하기 위한 플래그
let hasLoggedFeatureToggle = false;

export const isThemeV2Enabled = () => {
  // 개발 환경에서는 강제로 true (테스트용)
  // 프로덕션에서는 환경 변수로 제어 (기본값: true)
  const envValue = import.meta.env.VITE_FEATURE_THEME_V2;
  
  // 개발 환경에서는 무조건 true
  if (import.meta.env.MODE === 'development' || import.meta.env.DEV) {
    if (!hasLoggedFeatureToggle) {
      console.log('[Feature Toggle] Development mode - Theme V2 강제 활성화');
      hasLoggedFeatureToggle = true;
    }
    return true;
  }
  
  // 프로덕션에서는 환경 변수로 제어 (설정되지 않으면 기본값 true)
  return envValue !== 'false';
};

/**
 * Feature Toggle에 따라 컴포넌트를 조건부로 렌더링하는 HOC
 * @param {React.Component} V2Component - 새로운 테마 컴포넌트
 * @param {React.Component} LegacyComponent - 기존 컴포넌트
 * @returns {React.Component} 조건부로 렌더링되는 컴포넌트
 */
export const withFeatureToggle = (V2Component, LegacyComponent) => {
  return (props) => {
    if (isThemeV2Enabled()) {
      return <V2Component {...props} />;
    }
    return <LegacyComponent {...props} />;
  };
};

/**
 * Feature Toggle에 따라 값을 반환하는 유틸리티
 * @param {*} v2Value - Theme V2가 활성화되었을 때 반환할 값
 * @param {*} legacyValue - 기존 테마일 때 반환할 값
 * @returns {*} 조건에 따른 값
 */
export const getFeatureValue = (v2Value, legacyValue) => {
  return isThemeV2Enabled() ? v2Value : legacyValue;
};

