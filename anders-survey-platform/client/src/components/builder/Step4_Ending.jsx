// client/src/components/builder/Step4_Ending.jsx (모던 UI 개선)

import { useCallback } from 'react';
import ImageUpload from '../ImageUpload';
import { CheckCircleIcon } from '../icons';
import RichTextEditor from '../ui/RichTextEditor';

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
        <div className="space-y-2">
            {/* 엔딩 페이지 섹션 */}
                <div className="bg-white rounded-xl shadow-md p-3">
                <h3 className="text-base font-bold text-text-main mb-2">엔딩 페이지</h3>
                
                <div className="space-y-2">
                    {/* 완료 제목 */}
                    <div>
                        <label htmlFor="endingTitle" className="block text-sm font-medium text-text-sub mb-2">
                            완료 제목
                        </label>
                        <RichTextEditor
                            value={safeEnding.title || ''}
                            onChange={(html) => handleEndingChange('title', html)}
                            placeholder="제출 완료"
                            rows={2}
                            className="border-gray-300"
                            defaultFontSize={20}
                        />
                    </div>

                    {/* 완료 설명 */}
                    <div>
                        <label htmlFor="endingDescription" className="block text-sm font-medium text-text-sub mb-2">
                            완료 설명 문구
                        </label>
                        <RichTextEditor
                            value={safeEnding.description || ''}
                            onChange={(html) => handleEndingChange('description', html)}
                            placeholder="결과페이지 내용을 입력해 주세요."
                            rows={4}
                            className="border-gray-300"
                            defaultFontSize={16}
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
                        <ImageUpload
                            label="완료 페이지 이미지"
                            imageBase64={safeEnding.imageBase64 || ''}
                            onImageChange={(e) => {
                                if (e && e.target) {
                                    handleEndingChange('imageBase64', e.target.value || '');
                                }
                            }}
                            maxSizeMB={8}
                            recommendedSize="1280×720"
                            compact={true}
                        />
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
