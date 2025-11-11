// SurveyPreviewButton.jsx - 설문 참여 페이지 미리보기 버튼

import { useNavigate } from 'react-router-dom';
import { PlayIcon } from './icons';

export default function SurveyPreviewButton({ surveyId, className = '' }) {
    const navigate = useNavigate();

    const handlePreview = () => {
        if (!surveyId) {
            alert('설문을 먼저 저장해야 미리보기를 할 수 있습니다.');
            return;
        }
        // 새 탭에서 설문 참여 페이지 열기
        window.open(`/surveys/${surveyId}`, '_blank');
    };

    if (!surveyId) {
        return null;
    }

    return (
        <button
            onClick={handlePreview}
            className={`admin-btn flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${className}`}
            title="설문 참여 페이지 미리보기"
        >
            <PlayIcon className="w-4 h-4" />
            설문 참여 페이지 보기
        </button>
    );
}





