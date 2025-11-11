// client/src/components/builder/Step2_Cover.jsx (모던 UI 개선)

import { useCallback } from 'react';
import ImageUpload from '../ImageUpload';
import { DocumentIcon } from '../icons';

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
        <div className="space-y-4">
            {/* 커버 섹션 */}
                <div className="bg-white rounded-xl shadow-md p-4">
                <h3 className="text-lg font-bold text-text-main mb-4">커버</h3>
                
                <div className="space-y-3">
                    {/* 1. 로고 업로드 (우측 이미지 순서) */}
                    <div>
                        <ImageUpload
                            label="로고"
                            imageBase64={cover.logoBase64 || ''}
                            onImageChange={(e) => {
                                if (e && e.target && e.target.value) {
                                    handleCoverChange('logoBase64', e.target.value);
                                }
                            }}
                            maxSizeMB={8}
                            recommendedSize="400*400"
                            compact={true}
                        />
                    </div>

                    {/* 2. 설문지 제목 (우측 이미지 순서) */}
                    <div>
                        <label htmlFor="coverTitle" className="block text-sm font-medium text-text-sub mb-2">
                            설문지
                        </label>
                        <input
                            type="text"
                            id="coverTitle"
                            value={cover.title || ''}
                            onChange={(e) => handleCoverChange('title', e.target.value)}
                            placeholder="설문지"
                            className="w-full text-lg font-bold text-primary border-0 border-b-2 border-border rounded-none px-0 py-2 focus:ring-0 focus:border-primary transition-all bg-transparent"
                            style={{ 
                                borderBottom: '2px solid var(--border, #E5E7EB)',
                                color: 'var(--primary, #6B46C1)'
                            }}
                        />
                    </div>

                    {/* 3. 부제목 (우측 이미지 순서) */}
                    <div>
                        <label htmlFor="coverDescription" className="block text-sm font-medium text-text-sub mb-2">
                            부제목
                        </label>
                        <input
                            type="text"
                            id="coverDescription"
                            value={cover.description || ''}
                            onChange={(e) => handleCoverChange('description', e.target.value)}
                            placeholder="부제목"
                            className="w-full text-sm text-text-sub border-0 border-b-2 border-border rounded-none px-0 py-2 focus:ring-0 focus:border-primary transition-all bg-transparent"
                            style={{ 
                                borderBottom: '2px solid var(--border, #E5E7EB)'
                            }}
                        />
                    </div>

                    {/* 4. 타이틀 이미지 (우측 이미지 순서) */}
                    <div>
                        <ImageUpload
                            label="타이틀 이미지"
                            imageBase64={cover.imageBase64 || ''}
                            onImageChange={(e) => {
                                if (e && e.target && e.target.value) {
                                    handleCoverChange('imageBase64', e.target.value);
                                }
                            }}
                            maxSizeMB={8}
                            recommendedSize="1280*720"
                            showRecentUploads={true}
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
                            className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                cover.showParticipantCount ? 'bg-primary' : 'bg-gray-300'
                            }`}
                            style={{ padding: '2px' }}
                        >
                            <span className={`inline-block h-4 w-4 rounded-full bg-white transition-all shadow-sm ${
                                cover.showParticipantCount ? 'translate-x-6' : 'translate-x-0'
                            }`} />
                        </button>
                    </div>

                    {/* 6. 설문 시작하기 버튼 프리뷰 (우측 이미지 순서) - 항상 표시 */}
                    <div className="pt-3" style={{ display: 'block' }}>
                        <button 
                            type="button"
                            className="w-full bg-primary text-white rounded-lg px-6 py-4 text-lg font-medium hover:bg-primary-hover transition-colors flex items-center justify-center gap-2 shadow-md"
                            style={{ 
                                backgroundColor: 'var(--primary, #6B46C1)',
                                display: 'block',
                                visibility: 'visible'
                            }}
                        >
                            <span>설문 시작하기</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* 설정 섹션 */}
                <div className="bg-white rounded-xl shadow-md p-4">
                <h3 className="text-lg font-bold text-text-main mb-4">설정</h3>
                
                <div className="space-y-4">
                    {/* 커버 페이지 건너뛰기 */}
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-text-sub">
                            커버 페이지 건너뛰기
                        </label>
                        <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-border transition-colors">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1" />
                        </button>
                    </div>

                    {/* 링크 미리보기 커스텀 */}
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-medium text-text-sub">
                                링크 미리보기 커스텀
                            </label>
                            <span className="ml-2 px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded">Essential</span>
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
