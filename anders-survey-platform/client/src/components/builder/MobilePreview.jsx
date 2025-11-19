// 모바일 최적화된 미리보기 컴포넌트 - 근본적인 해결책 적용

import StartPage from '../../pages/participant/StartPage';
import QuestionPage from '../../pages/participant/QuestionPage';
import DonePage from '../../pages/participant/DonePage';

export default function MobilePreview({
  surveyData,
  currentTab,
  currentQuestionIndex = 0,
  previewAnswers = {},
  surveyUrl = '' // 설문 URL (QR 코드 생성용)
}) {
  const questions = surveyData?.questions || [];

  // Common branding props
  const primaryColor = surveyData?.branding?.primaryColor || 'var(--primary)';
  const secondaryColor = surveyData?.branding?.secondaryColor || 'var(--secondary)';
  const buttonShape = surveyData?.branding?.buttonShape || 'rounded-lg';
  const buttonOpacity = surveyData?.branding?.buttonOpacity !== undefined ? surveyData?.branding?.buttonOpacity : 0.9;
  const backgroundColor = surveyData?.branding?.backgroundColor || '#1a1f2e';
  // 커버의 배경 이미지가 우선, 없으면 브랜딩의 배경 이미지 사용
  const bgImageBase64 = surveyData?.cover?.bgImageBase64 || surveyData?.branding?.bgImageBase64 || '';
  
  // QR 코드 URL 생성 (퍼블리싱 탭용)
  const qrCodeUrl = surveyUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(surveyUrl)}` : '';

  // 통일된 모바일 프레임 스타일
  const mobileFrameStyle = {
    width: '100%',
    maxWidth: '375px',
    margin: '0 auto',
    backgroundColor: '#000',
    borderRadius: '32px',
    padding: '8px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    position: 'relative'
  };

  const screenStyle = {
    width: '100%',
    height: '667px',
    maxHeight: '667px',
    backgroundColor: '#fff',
    borderRadius: '24px',
    overflow: 'hidden',
    position: 'relative'
  };

  // 렌더링할 콘텐츠 결정
  let content = null;

  // 미리보기 컨테이너 스타일
  const containerStyle = {
    width: '100%',
    height: '100%',
    overflow: 'auto',
    position: 'relative'
  };

  if (currentTab === 'cover' || currentTab === 'style' || currentTab === 'publishing') {
    content = (
      <>
        <style dangerouslySetInnerHTML={{ __html: `
          .mobile-preview-container > div {
            min-height: auto !important;
            height: 100% !important;
            max-height: 100% !important;
            min-width: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            justify-content: flex-start !important;
            overflow: visible !important;
          }
          .mobile-preview-container > div > div[class*="max-w"] {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            height: auto !important;
            flex: 1 !important;
            overflow: auto !important;
            padding: 36px 24px !important;
            margin: 0 !important;
            background-color: transparent !important;
            background: transparent !important;
          }
          .mobile-preview-container > div[style*="backgroundImage"] {
            background-size: cover !important;
            background-position: center !important;
            background-repeat: no-repeat !important;
          }
        `}} />
        <div className="mobile-preview-container" style={containerStyle}>
          <StartPage
            survey={{
              title: surveyData?.cover?.title || surveyData?.title || '제목',
              description: surveyData?.cover?.description || surveyData?.description || '부제목',
              cover: {
                image: surveyData?.cover?.imageBase64 || surveyData?.cover?.image,
                title: surveyData?.cover?.title || surveyData?.title,
                subtitle: surveyData?.cover?.description || surveyData?.description,
                description: surveyData?.cover?.description || surveyData?.description,
                logoBase64: surveyData?.cover?.logoBase64,
                buttonText: surveyData?.cover?.buttonText || '설문 시작하기',
                showParticipantCount: surveyData?.cover?.showParticipantCount
              },
              branding: surveyData?.branding,
              questions: surveyData?.questions || []
            }}
            onStart={() => {}}
            color={primaryColor}
            secondaryColor={secondaryColor}
            buttonShape={buttonShape}
            buttonOpacity={buttonOpacity}
            backgroundColor={backgroundColor}
            bgImageBase64={bgImageBase64}
            showButton={currentTab !== 'publishing'}
            qrCodeUrl={currentTab === 'publishing' ? qrCodeUrl : ''}
          />
        </div>
      </>
    );
  } else if (currentTab === 'questions' && questions.length > 0) {
    const question = questions[Math.min(currentQuestionIndex, questions.length - 1)];
    content = (
      <>
        <style dangerouslySetInnerHTML={{ __html: `
          .mobile-preview-container > div {
            min-height: auto !important;
            height: 100% !important;
            max-height: 100% !important;
            min-width: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: stretch !important;
            justify-content: flex-start !important;
            overflow: visible !important;
          }
        `}} />
        <div className="mobile-preview-container" style={containerStyle}>
          <QuestionPage
            survey={surveyData}
            question={question}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            answer={previewAnswers[question.id || question._id]}
            onAnswerChange={() => {}}
            onNext={() => {}}
            onPrevious={() => {}}
            showPrevious={currentQuestionIndex > 0}
            color={primaryColor}
            secondaryColor={secondaryColor}
            buttonShape={buttonShape}
            buttonOpacity={buttonOpacity}
            backgroundColor={surveyData?.branding?.questionBackgroundColor || backgroundColor}
            bgImageBase64={surveyData?.branding?.questionBgImageBase64 || bgImageBase64}
            koreanSpacingWrap={surveyData?.advancedSettings?.koreanSpacingWrap || false}
          />
        </div>
      </>
    );
  } else if (currentTab === 'ending') {
    content = (
      <>
        <style dangerouslySetInnerHTML={{ __html: `
          .mobile-preview-container > div {
            min-height: auto !important;
            height: 100% !important;
            max-height: 100% !important;
            min-width: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            justify-content: center !important;
            overflow: auto !important;
          }
          .mobile-preview-container h1,
          .mobile-preview-container [class*="text-3xl"],
          .mobile-preview-container [class*="text-4xl"],
          .mobile-preview-container div[style*="fontSize"] {
            font-size: 18px !important;
            line-height: 1.4 !important;
          }
        `}} />
        <div className="mobile-preview-container" style={containerStyle}>
          <DonePage
            survey={{
              ending: surveyData?.ending,
              branding: surveyData?.branding,
              cover: surveyData?.cover
            }}
            color={primaryColor}
            secondaryColor={secondaryColor}
            buttonShape={buttonShape}
            buttonOpacity={buttonOpacity}
            backgroundColor={backgroundColor}
            bgImageBase64={bgImageBase64}
            onRestart={() => {
              // 미리보기에서는 실제 동작하지 않지만, 버튼이 표시되도록 핸들러 제공
              console.log('다시하기 버튼 클릭됨 (미리보기)');
            }}
          />
        </div>
      </>
    );
  }

  if (!content) {
    return (
      <div style={mobileFrameStyle}>
        <div style={screenStyle} className="flex items-center justify-center bg-gray-50">
          <p className="text-gray-400 text-sm">미리보기를 선택하세요</p>
        </div>
      </div>
    );
  }

  // 모든 탭에 동일한 프레임과 스타일 적용
  return (
    <div style={mobileFrameStyle}>
      {/* 모바일 노치 */}
      <div 
        style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '120px',
          height: '24px',
          backgroundColor: '#000',
          borderRadius: '0 0 16px 16px',
          zIndex: 10
        }}
      />
      
      {/* 스크린 영역 - 상단 정렬, 스크롤 가능 */}
      <div style={screenStyle}>
        {content}
      </div>
    </div>
  );
}
