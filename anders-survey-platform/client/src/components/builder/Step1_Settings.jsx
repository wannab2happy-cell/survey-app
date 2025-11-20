// src/components/builder/Step1_Settings.jsx (UI/UX 통일 및 정돈)

import { useState, useEffect } from 'react';
import ImageUpload from '../ImageUpload';
import TimePicker from '../TimePicker';
import { CalendarIcon, ClockIcon } from '../icons';
import CoverTemplates from './CoverTemplates';

// ISO 8601 문자열을 datetime-local 형식(YYYY-MM-DDTHH:MM)으로 변환하는 헬퍼 함수
const formatDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return ''; 
        
        // 브라우저의 로컬 시간대 기준으로 문자열 포맷
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
        return '';
    }
};

export default function Step1_Settings({ form, handleFormChange, onBrandingChange, onImageChange }) {

    const [showTemplates, setShowTemplates] = useState(true);
    const [localTitle, setLocalTitle] = useState(form?.title || '');
    const [isComposing, setIsComposing] = useState(false);

    // 한글 입력 조합 시작
    const handleCompositionStart = () => {
        setIsComposing(true);
    };

    // 한글 입력 조합 완료
    const handleCompositionEnd = (e) => {
        setIsComposing(false);
        const value = e.target.value || '';
        setLocalTitle(value);
        if (handleFormChange) {
            handleFormChange('title', value);
        }
    };

    // 입력 변경 핸들러
    const handleTitleChange = (e) => {
        const value = e.target.value || '';
        setLocalTitle(value);
        
        // 한글 조합 중이면 부모 상태는 업데이트하지 않음
        if (isComposing) {
            return;
        }
        
        if (handleFormChange) {
            handleFormChange('title', value);
        }
    };

    // form.title이 외부에서 변경되면 로컬 상태도 동기화
    useEffect(() => {
        if (!isComposing && form?.title !== undefined) {
            setLocalTitle(form.title || '');
        }
    }, [form?.title, isComposing]);

    const handleTemplateSelect = (templateData) => {
        if (onBrandingChange && templateData.branding) {
            // 디버깅: 템플릿 선택 시 전달되는 데이터 확인
            console.log('[Step1_Settings] 템플릿 선택 데이터:', templateData);
            
            // React의 상태 업데이트 배치 처리를 고려하여,
            // 모든 브랜딩 값을 순차적으로 업데이트하되, 
            // backgroundColor를 마지막에 확실히 적용
            const brandingEntries = Object.entries(templateData.branding);
            
            // backgroundColor를 제외한 다른 필드들을 먼저 업데이트
            const otherEntries = brandingEntries.filter(([key]) => key !== 'backgroundColor');
            const backgroundColorEntry = brandingEntries.find(([key]) => key === 'backgroundColor');
            
            // 다른 필드들을 먼저 업데이트
            otherEntries.forEach(([key, value]) => {
                console.log(`[Step1_Settings] 브랜딩 업데이트: ${key} = ${value}`);
                onBrandingChange('branding', key, value);
            });
            
            // backgroundColor를 마지막에 확실히 적용 (약간의 지연을 두어 다른 업데이트가 완료된 후 적용)
            if (backgroundColorEntry) {
                const [key, value] = backgroundColorEntry;
                setTimeout(() => {
                    console.log(`[Step1_Settings] 배경 색상 최종 업데이트: ${key} = ${value}`);
                    onBrandingChange('branding', key, value);
                }, 50);
            }
        }
    };

    return (
        <div className="space-y-3">
            {/* 설문지 제목 섹션 */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
                <h2 className="text-base font-bold text-text-main mb-2">설문지 정보</h2>
                
                <div className="space-y-2">
                    <div>
                        <label htmlFor="surveyTitle" className="block text-sm font-medium text-text-main mb-1.5">
                            설문지 제목 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="surveyTitle"
                            name="title"
                            value={localTitle}
                            onChange={handleTitleChange}
                            onCompositionStart={handleCompositionStart}
                            onCompositionEnd={handleCompositionEnd}
                            placeholder="설문지 제목을 입력하세요"
                            maxLength={100}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white hover:border-gray-300"
                            style={{
                                borderColor: form?.branding?.primaryColor || '#E5E7EB',
                                focusRingColor: form?.branding?.primaryColor || '#26C6DA'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = form?.branding?.primaryColor || '#26C6DA';
                                e.target.style.boxShadow = `0 0 0 2px ${form?.branding?.primaryColor || '#26C6DA'}40`;
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = form?.branding?.primaryColor || '#E5E7EB';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                        <p className="mt-1 text-xs text-text-sub">
                            설문지의 제목을 입력하세요. 이 제목은 설문 목록과 관리 화면에 표시됩니다.
                        </p>
                    </div>
                </div>
            </section>

            {/* 스타일 섹션 */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
                <h2 className="text-base font-bold text-text-main mb-2">스타일</h2>
                
                {/* 참가자 화면 스타일 (템플릿) */}
                <div className="mb-2">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 p-2">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                                    <h3 className="text-base font-semibold text-text-main">참가자 화면 스타일</h3>
                                    <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">설문 참여 화면</span>
                                </div>
                                <p className="text-xs text-text-sub ml-3">
                                    설문 참가자가 보게 될 화면의 색상과 디자인을 선택하세요
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowTemplates(!showTemplates)}
                                className="p-2 text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm flex-shrink-0 ml-4"
                                style={{ backgroundColor: '#26C6DA' }}
                                aria-label={showTemplates ? '접기' : '템플릿 선택'}
                            >
                                {showTemplates ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                )}
                            </button>
                        </div>
                        
                        {/* 템플릿 선택 영역 */}
                        {showTemplates && (
                            <div className="mt-2 pt-2 border-t border-blue-200">
                                <CoverTemplates
                                    onTemplateSelect={handleTemplateSelect}
                                    currentBranding={form.branding || {}}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 고급 설정 섹션 */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
                <h2 className="text-base font-bold text-text-main mb-2">고급 설정</h2>
                
                <div className="space-y-2">
                    {/* 한글 띄어쓰기 유지 및 줄바꿈 설정 */}
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex-1">
                            <label htmlFor="koreanSpacingWrap" className="text-sm font-medium text-text-main cursor-pointer">
                                한글 띄어쓰기 유지하고 줄바꿈하기
                            </label>
                            <p className="text-xs text-text-sub mt-1">
                                텍스트 입력 시 한글 단어 단위로 줄바꿈하며 띄어쓰기를 유지합니다
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                id="koreanSpacingWrap"
                                checked={form?.advancedSettings?.koreanSpacingWrap || false}
                                onChange={(e) => {
                                    if (handleFormChange) {
                                        handleFormChange('advancedSettings', {
                                            ...form?.advancedSettings,
                                            koreanSpacingWrap: e.target.checked
                                        });
                                    }
                                }}
                                className="sr-only peer"
                            />
                            <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                                form?.advancedSettings?.koreanSpacingWrap 
                                    ? 'bg-[#26C6DA]' 
                                    : 'bg-gray-300'
                            }`}>
                                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-200 mt-0.5 ${
                                    form?.advancedSettings?.koreanSpacingWrap 
                                        ? 'translate-x-5' 
                                        : 'translate-x-0.5'
                                }`} />
                            </div>
                        </label>
                    </div>
                </div>
            </section>
        </div>
    );
}
