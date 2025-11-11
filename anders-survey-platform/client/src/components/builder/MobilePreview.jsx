// 모바일 프리뷰 컴포넌트
// anders 스타일: 실시간 모바일 화면 프리뷰

import { motion } from 'framer-motion';
import StartPage from '../../pages/participant/StartPage';
import QuestionPage from '../../pages/participant/QuestionPage';
import ReviewPage from '../../pages/participant/ReviewPage';
import DonePage from '../../pages/participant/DonePage';

export default function MobilePreview({ 
  surveyData, 
  currentTab,
  currentQuestionIndex = 0,
  previewAnswers = {}
}) {
  const color = surveyData?.branding?.primaryColor || 'var(--primary)';
  const questions = surveyData?.questions || [];

  // 프리뷰 콘텐츠 렌더링
  const renderPreviewContent = () => {
    switch (currentTab) {
      case 'cover':
      case 'style':
        return (
          <StartPage
            survey={{
              title: surveyData?.cover?.title || surveyData?.title || '설문지',
              description: surveyData?.cover?.description || surveyData?.description || '부제목',
              cover: {
                image: surveyData?.cover?.imageBase64 || surveyData?.cover?.image,
                title: surveyData?.cover?.title || surveyData?.title,
                subtitle: surveyData?.cover?.description || surveyData?.description
              },
              branding: surveyData?.branding
            }}
            onStart={() => {}}
            color={color}
          />
        );

      case 'questions':
        if (questions.length === 0) {
          return (
            <div className="min-h-screen bg-bg flex items-center justify-center px-4">
              <div className="text-center">
                <p className="text-gray-500">질문을 추가해주세요</p>
              </div>
            </div>
          );
        }

        const question = questions[Math.min(currentQuestionIndex, questions.length - 1)];
        if (!question) return null;

        return (
          <QuestionPage
            question={question}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            answer={previewAnswers[question.id || question._id]}
            onAnswerChange={() => {}}
            onNext={() => {}}
            onPrevious={() => {}}
            showPrevious={currentQuestionIndex > 0}
            color={color}
          />
        );

      case 'ending':
        return (
          <DonePage
            survey={{
              ending: {
                title: surveyData?.ending?.title || '설문이 완료되었습니다!',
                message: surveyData?.ending?.description || '귀하의 소중한 의견에 감사드립니다.',
                image: surveyData?.ending?.imageBase64 || surveyData?.ending?.image
              },
              branding: surveyData?.branding
            }}
            color={color}
          />
        );

      default:
        return (
          <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center px-4">
            <div className="text-center">
              <p className="text-gray-500">프리뷰를 선택해주세요</p>
            </div>
          </div>
        );
    }
  };

  // 모바일 프레임 크기 (한 페이지에 맞게 축소)
  const frameWidth = 300;
  const frameHeight = 600;
  const screenWidth = frameWidth - 24; // padding 제외
  const screenHeight = frameHeight - 24; // padding 제외

  return (
    <div className="sticky top-6">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        {/* 모바일 프레임 */}
        <div 
          className="relative bg-gray-900 rounded-[2rem] p-2 shadow-2xl mx-auto" 
          style={{ width: `${frameWidth}px` }}
        >
          {/* 모바일 화면 */}
          <div 
            className="bg-white rounded-[1.75rem] overflow-hidden shadow-inner" 
            style={{ width: `${screenWidth}px`, height: `${screenHeight}px` }}
          >
            <div className="w-full h-full overflow-y-auto scrollbar-hide" style={{ maxHeight: `${screenHeight}px` }}>
              <div style={{ transform: 'scale(0.85)', transformOrigin: 'top center' }}>
                {renderPreviewContent()}
              </div>
            </div>
          </div>
        </div>

        {/* "made with anders" 텍스트 */}
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-400">made with anders</p>
        </div>
      </motion.div>
    </div>
  );
}


