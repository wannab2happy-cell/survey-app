// client/src/components/builder/Step4_Ending.jsx (모던 UI 개선)

import { useCallback } from 'react';
import ImageUpload from '../ImageUpload';
import { CheckCircleIcon } from '../icons';

export default function Step4_Ending({ ending, onEndingChange, onImageChange }) {
    
    const safeEnding = ending || { 
        title: '', 
        description: '', 
        imageBase64: '',
        linkUrl: '',
        linkText: '더 알아보기'
    };

    const handleEndingChange = useCallback((key, value) => {
        onEndingChange('ending', key, value); 
    }, [onEndingChange]);
    
    const handleImageFileChange = useCallback((event) => {
        onImageChange('ending', 'imageBase64', event);
    }, [onImageChange]);

    return (
        <div className="space-y-4">
            {/* 엔딩 페이지 섹션 */}
                <div className="bg-white rounded-xl shadow-md p-4">
                <h3 className="text-lg font-bold text-text-main mb-4">엔딩 페이지</h3>
                
                <div className="space-y-4">
                    {/* 완료 제목 */}
                    <div>
                        <label htmlFor="endingTitle" className="block text-sm font-medium text-text-sub mb-2">
                            완료 제목
                        </label>
                        <input
                            type="text"
                            id="endingTitle"
                            value={safeEnding.title || ''}
                            onChange={(e) => handleEndingChange('title', e.target.value)}
                            placeholder="제출 완료"
                            className="w-full border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                        />
                    </div>

                    {/* 완료 설명 */}
                    <div>
                        <label htmlFor="endingDescription" className="block text-sm font-medium text-text-sub mb-2">
                            완료 설명 문구
                        </label>
                        <textarea
                            id="endingDescription"
                            value={safeEnding.description || ''}
                            onChange={(e) => handleEndingChange('description', e.target.value)}
                            rows={4}
                            placeholder="결과페이지 내용을 입력해 주세요."
                            className="w-full border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all resize-none"
                        />
                    </div>

                    {/* 외부 링크 설정 */}
                    <div className="pt-4 border-t border-border">
                        <label className="block text-sm font-medium text-text-sub mb-3">
                            외부 사이트 연결
                        </label>
                        <div className="space-y-3">
                            <div>
                                <label htmlFor="linkUrl" className="block text-xs font-medium text-text-sub mb-1.5">
                                    연결할 URL
                                </label>
                                <input
                                    type="url"
                                    id="linkUrl"
                                    value={safeEnding.linkUrl || ''}
                                    onChange={(e) => handleEndingChange('linkUrl', e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>
                            <div>
                                <label htmlFor="linkText" className="block text-xs font-medium text-text-sub mb-1.5">
                                    버튼 텍스트
                                </label>
                                <input
                                    type="text"
                                    id="linkText"
                                    value={safeEnding.linkText || '더 알아보기'}
                                    onChange={(e) => handleEndingChange('linkText', e.target.value)}
                                    placeholder="더 알아보기"
                                    className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>
                            {safeEnding.linkUrl && (
                                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                                    <p className="text-xs text-text-sub">
                                        <span className="font-medium text-primary">미리보기:</span> 버튼이 "{safeEnding.linkText || '더 알아보기'}"로 표시됩니다.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 완료 페이지 이미지 */}
                    <div>
                        <label className="block text-sm font-medium text-text-sub mb-2">
                            완료 페이지 이미지
                        </label>
                        {safeEnding.imageBase64 ? (
                            <div className="relative border-2 border-dashed border-border rounded-lg p-4">
                                <img 
                                    src={safeEnding.imageBase64} 
                                    alt="Ending" 
                                    className="w-full h-48 object-cover rounded-lg"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                                <button
                                    onClick={() => handleEndingChange('imageBase64', '')}
                                    className="absolute top-2 right-2 p-2 bg-error text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <label className="block border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                handleEndingChange('imageBase64', reader.result);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="hidden"
                                />
                                <svg className="mx-auto h-12 w-12 text-text-sub" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p className="mt-2 text-sm text-text-sub">이미지를 업로드하세요</p>
                            </label>
                        )}
                    </div>
                </div>
            </div>

            {/* 설정 섹션 */}
                <div className="bg-white rounded-xl shadow-md p-4">
                <h3 className="text-lg font-bold text-text-main mb-4">설정</h3>
                
                <div className="space-y-4">
                    {/* 다시하기 버튼 표시 */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-sub">
                            다시하기 버튼 표시
                        </label>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                        </button>
                    </div>

                    {/* anders 로고 & 브랜딩 & 버튼 숨기기 */}
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-text-sub">
                                anders 로고 & 브랜딩 & 버튼 숨기기
                            </label>
                            <span className="ml-2 px-2 py-0.5 text-xs bg-error/10 text-error rounded">Premium</span>
                        </div>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-border transition-colors">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
