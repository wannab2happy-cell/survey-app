// client/src/components/builder/Step2_Cover.jsx (모던 UI 개선)

import { useCallback, useState } from 'react';
import ImageUpload from '../ImageUpload';
import { DocumentIcon } from '../icons';
import RichTextEditor from '../ui/RichTextEditor';
import UnsplashImagePicker from '../ui/UnsplashImagePicker';

export default function Step2_Cover({ cover, onCoverChange, onImageChange }) {
    const [showUnsplashPicker, setShowUnsplashPicker] = useState(false);
    
    const handleCoverChange = useCallback((key, value) => {
        onCoverChange('cover', key, value); 
    }, [onCoverChange]);
    
    const handleImageFileChange = useCallback((event) => {
        onImageChange('cover', 'imageBase64', event);
    }, [onImageChange]);

    if (!cover) {
        console.error('Step2_Cover: \'cover\' prop이 누락되었습니다.');
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
                오류: 설문 커버 데이터를 로드할 수 없습니다.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {/* 커버 섹션 */}
                <div className="bg-white rounded-xl shadow-md p-3">
                <h3 className="text-base font-bold text-text-main mb-2">커버</h3>
                
                <div className="space-y-2">
                    {/* 커버 제목 */}
                    <div>
                        <label htmlFor="coverTitle" className="block text-sm font-medium text-text-sub mb-2">
                            커버 제목
                        </label>
                        <RichTextEditor
                            value={cover.title || ''}
                            onChange={(html) => handleCoverChange('title', html)}
                            placeholder="설문 참가자에게 표시될 메인 제목입니다"
                            rows={2}
                            className="border-gray-300"
                            defaultFontSize={25}
                        />
                        <p className="mt-1 text-xs text-text-sub">
                            설문 제목을 입력하면 자동으로 복사됩니다. 필요시 별도로 수정할 수 있습니다.
                        </p>
                    </div>

                    {/* 부제목 */}
                    <div>
                        <label htmlFor="coverDescription" className="block text-sm font-medium text-text-sub mb-2">
                            부제목
                        </label>
                        <RichTextEditor
                            value={cover.description || ''}
                            onChange={(html) => handleCoverChange('description', html)}
                            placeholder="부제목을 입력하세요"
                            rows={2}
                            className="border-gray-300"
                            defaultFontSize={16}
                        />
                    </div>

                    {/* 이미지 업로드 섹션 - 한 줄에 하나씩 가로로 길게 */}
                    {/* 로고 */}
                    <div>
                        <ImageUpload
                            label="로고"
                            imageBase64={cover.logoBase64 || ''}
                            onImageChange={(e) => {
                                if (e && e.target) {
                                    handleCoverChange('logoBase64', e.target.value || '');
                                }
                            }}
                            maxSizeMB={8}
                            recommendedSize="400×400"
                            compact={true}
                        />
                    </div>

                    {/* 타이틀 이미지 - 이미지가 있을 때만 표시 */}
                    {cover.imageBase64 && cover.imageBase64.trim() !== '' && (
                    <div>
                            <ImageUpload
                                label="타이틀 이미지"
                                imageBase64={cover.imageBase64 || ''}
                                onImageChange={(e) => {
                                    if (e && e.target) {
                                        handleCoverChange('imageBase64', e.target.value || '');
                                    }
                                }}
                                maxSizeMB={8}
                                recommendedSize="1280×720"
                                compact={true}
                        />
                    </div>
                    )}

                    {/* 타이틀 이미지 추가 버튼 - 이미지가 없을 때만 표시 */}
                    {(!cover.imageBase64 || cover.imageBase64.trim() === '') && (
                    <div>
                            <label className="block text-sm font-medium text-text-sub mb-2">
                                타이틀 이미지
                        </label>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*';
                                        input.onchange = (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    handleCoverChange('imageBase64', reader.result);
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        };
                                        input.click();
                                    }}
                                    className="flex-1 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    이미지 선택
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowUnsplashPicker(true)}
                                    className="px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-sm font-medium flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Unsplash
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-text-sub">
                                최대 8MB · 추천 사이즈: 1280×720
                            </p>
                    </div>
                    )}

                    {/* 배경 이미지 */}
                    <div>
                        <ImageUpload
                            label="배경 이미지"
                            imageBase64={cover.bgImageBase64 || ''}
                            onImageChange={(e) => {
                                if (e && e.target) {
                                    handleCoverChange('bgImageBase64', e.target.value || '');
                                }
                            }}
                            maxSizeMB={8}
                            recommendedSize="1920×1080"
                            compact={true}
                        />
                    </div>

                    {/* 5. 설문 참여 수 표시 토글 (우측 이미지 순서) */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-sub">
                            설문 참여 수 표시
                        </label>
                        <button
                            type="button"
                            onClick={() => {
                                const newValue = !cover.showParticipantCount;
                                handleCoverChange('showParticipantCount', newValue);
                            }}
                            aria-label="설문 참여 수 표시"
                            aria-checked={cover.showParticipantCount || false}
                            role="switch"
                            className="relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            style={{ 
                                padding: '2px',
                                backgroundColor: cover.showParticipantCount ? '#26C6DA' : '#D1D5DB'
                            }}
                        >
                            <span className={`inline-block h-4 w-4 rounded-full bg-white transition-all shadow-sm ${
                                cover.showParticipantCount ? 'translate-x-6' : 'translate-x-0'
                            }`} />
                        </button>
                    </div>

                    {/* 6. 버튼 텍스트 입력 */}
                    <div>
                        <label htmlFor="buttonText" className="block text-sm font-medium text-text-sub mb-2">
                            버튼 텍스트
                        </label>
                        <input
                            type="text"
                            id="buttonText"
                            value={cover.buttonText || ''}
                            onChange={(e) => handleCoverChange('buttonText', e.target.value)}
                            placeholder="설문 시작하기"
                            className="w-full text-sm text-text-sub border-0 border-b-2 border-border rounded-none px-0 py-2 focus:ring-0 focus:border-primary transition-all bg-transparent"
                            style={{ 
                                borderBottom: '2px solid var(--border, #E5E7EB)'
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* 설정 섹션 */}
                <div className="bg-white rounded-xl shadow-md p-3">
                <h3 className="text-base font-bold text-text-main mb-2">설정</h3>
                
                <div className="space-y-2">
                    {/* 커버 페이지 건너뛰기 */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-sub">
                            커버 페이지 건너뛰기
                        </label>
                        <button
                            type="button"
                            onClick={() => {
                                const newValue = !cover.skipCover;
                                handleCoverChange('skipCover', newValue);
                            }}
                            aria-label="커버 페이지 건너뛰기"
                            aria-checked={cover.skipCover || false}
                            role="switch"
                            className="relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            style={{ 
                                padding: '2px',
                                backgroundColor: cover.skipCover ? '#26C6DA' : '#D1D5DB'
                            }}
                        >
                            <span className={`inline-block h-4 w-4 rounded-full bg-white transition-all shadow-sm ${
                                cover.skipCover ? 'translate-x-6' : 'translate-x-0'
                            }`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Unsplash 이미지 선택 모달 */}
            <UnsplashImagePicker
                isOpen={showUnsplashPicker}
                onClose={() => setShowUnsplashPicker(false)}
                onSelect={(e) => {
                    if (e && e.target) {
                        handleCoverChange('imageBase64', e.target.value || '');
                    }
                }}
            />
        </div>
    );
}
