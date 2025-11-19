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
        if (onBrandingChange) {
            Object.entries(templateData.branding).forEach(([key, value]) => {
                onBrandingChange('branding', key, value);
            });
        }
    };

    return (
        <div className="space-y-6">
            {/* 설문지 제목 섹션 */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-text-main mb-4">설문지 정보</h2>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="surveyTitle" className="block text-sm font-semibold text-text-main mb-2">
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
                            className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-base focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white hover:border-gray-300"
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
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-text-main mb-6">스타일</h2>
                
                {/* 템플릿 및 브랜딩 섹션 */}
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex-1">
                            <h3 className="text-base font-semibold text-text-main mb-1">템플릿 및 브랜딩</h3>
                            <p className="text-xs text-text-sub">
                                원하는 스타일을 선택하면 자동으로 색상과 디자인이 적용됩니다
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
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <CoverTemplates
                                onTemplateSelect={handleTemplateSelect}
                                currentBranding={form.branding || {}}
                            />
                        </div>
                    )}
                    
                </div>
            </section>

            {/* 고급 설정 섹션 */}
            <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-text-main mb-4">고급 설정</h2>
                
                <div className="space-y-4">
                    {/* 한글 띄어쓰기 유지 및 줄바꿈 설정 */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
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
