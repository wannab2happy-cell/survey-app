// client/src/components/builder/Step2_Cover.jsx (모던 UI 개선)

import { useCallback } from 'react';
import ImageUpload from '../ImageUpload';
import { DocumentIcon } from '../icons';
import RichTextEditor from '../ui/RichTextEditor';

export default function Step2_Cover({ cover, onCoverChange, onImageChange }) {
    
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
                <div className="bg-white rounded-xl shadow-md p-2">
                <h3 className="text-base font-bold text-text-main mb-2">커버</h3>
                
                <div className="space-y-2">
                    {/* 커버 제목 */}
                    <div>
                        <label htmlFor="coverTitle" className="block text-sm font-medium text-text-sub mb-1.5">
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
                    </div>

                    {/* 부제목 */}
                    <div>
                        <label htmlFor="coverDescription" className="block text-sm font-medium text-text-sub mb-1.5">
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

                    {/* 타이틀 이미지 */}
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
                        <label htmlFor="buttonText" className="block text-sm font-medium text-text-sub mb-1.5">
                            버튼 텍스트
                        </label>
                        <input
                            type="text"
                            id="buttonText"
                            value={cover.buttonText || ''}
                            onChange={(e) => handleCoverChange('buttonText', e.target.value)}
                            placeholder="설문 시작하기"
                            className="w-full text-sm text-text-sub border-0 border-b-2 border-border rounded-none px-0 py-1.5 focus:ring-0 focus:border-primary transition-all bg-transparent"
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
        </div>
    );
}
