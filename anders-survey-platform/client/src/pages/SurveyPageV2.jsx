// Theme V2 참가자용 설문 페이지
// 새로운 라우팅 구조와 UI 컴포넌트 사용

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import StartPage from './participant/StartPage';
import QuestionPage from './participant/QuestionPage';
import ReviewPage from './participant/ReviewPage';
import DonePage from './participant/DonePage';

const STEP_START = 'start';
const STEP_QUESTION = 'question';
const STEP_REVIEW = 'review';
const STEP_DONE = 'done';

export default function SurveyPageV2() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(STEP_START);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 라우트에서 step 파라미터 확인
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/review')) {
      setCurrentStep(STEP_REVIEW);
    } else if (path.includes('/done')) {
      setCurrentStep(STEP_DONE);
    } else if (path.includes('/q/')) {
      const stepMatch = path.match(/\/q\/(\d+)/);
      if (stepMatch) {
        const step = parseInt(stepMatch[1]) - 1;
        setCurrentQuestionIndex(step);
        setCurrentStep(STEP_QUESTION);
      }
    } else if (path.includes('/start') || path.endsWith(`/s/${slug}`)) {
      setCurrentStep(STEP_START);
    }
  }, [location.pathname, slug]);

  // 커버 페이지 건너뛰기 설정 확인
  useEffect(() => {
    if (survey?.cover?.skipCover && currentStep === STEP_START && survey?.questions && survey.questions.length > 0) {
      // 커버 페이지를 건너뛰고 바로 첫 질문으로 이동
      navigate(`/s/${slug}/q/1`, { replace: true });
      setCurrentStep(STEP_QUESTION);
      setCurrentQuestionIndex(0);
    }
  }, [survey, currentStep, slug, navigate]);

  // 설문 데이터 로드
  useEffect(() => {
    if (!slug) {
      setError('유효하지 않은 설문 링크입니다.');
      setLoading(false);
      return;
    }

    const fetchSurvey = async () => {
      try {
        setLoading(true);
        
        // slug를 surveyId로 사용 (MongoDB ObjectId 또는 일반 문자열 모두 지원)
        const response = await axiosInstance.get(`/surveys/${slug}`);
        let surveyData = null;
        
        if (response.data.success && response.data.data) {
          surveyData = response.data.data;
        } else if (response.data.id || response.data._id) {
          surveyData = response.data;
        }
        
        if (surveyData) {
          // 질문 데이터 정규화
          if (surveyData.questions) {
            surveyData.questions = surveyData.questions.map(q => ({
              ...q,
              type: (q.type || '').toUpperCase().trim(),
              options: (q.options || []).map(opt =>
                typeof opt === 'string' ? opt : (opt.text || opt.label || opt.content || String(opt))
              )
            }));
          }
          setSurvey(surveyData);
          setError(null);
        } else {
          setError('설문을 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('설문 데이터 로드 오류:', err);
        setError('설문을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [slug]);

  const handleStart = () => {
    if (survey?.questions && survey.questions.length > 0) {
      navigate(`/s/${slug}/q/1`);
      setCurrentStep(STEP_QUESTION);
      setCurrentQuestionIndex(0);
    }
  };

  const handleAnswerChange = useCallback((questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  }, []);

  const handleNext = () => {
    const questions = survey?.questions || [];
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      navigate(`/s/${slug}/q/${nextIndex + 1}`);
    } else {
      // 마지막 질문이면 검토 페이지로
      navigate(`/s/${slug}/review`);
      setCurrentStep(STEP_REVIEW);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      navigate(`/s/${slug}/q/${prevIndex + 1}`);
    } else {
      // 첫 질문이면 시작 페이지로
      navigate(`/s/${slug}/start`);
      setCurrentStep(STEP_START);
    }
  };

  const handleEdit = (questionIndex) => {
    setCurrentQuestionIndex(questionIndex);
    navigate(`/s/${slug}/q/${questionIndex + 1}`);
    setCurrentStep(STEP_QUESTION);
  };

  const handleRestart = () => {
    // 설문을 처음부터 다시 시작
    setAnswers({});
    setCurrentQuestionIndex(0);
    setCurrentStep(STEP_START);
    navigate(`/s/${slug}/start`);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // answers 객체를 배열로 변환 (백엔드 형식에 맞춤)
      const questions = survey?.questions || [];
      const answersArray = questions.map((question) => {
        const questionId = question._id || question.id;
        const answerValue = answers[questionId];
        
        return {
          questionId: questionId,
          value: answerValue !== undefined && answerValue !== null 
            ? (Array.isArray(answerValue) ? answerValue : String(answerValue))
            : ''
        };
      });
      
      console.log('제출할 답변 데이터:', {
        answersCount: answersArray.length,
        questionsCount: questions.length,
        answers: answersArray
      });
      
      const response = await axiosInstance.post(`/surveys/${slug}/response`, {
        answers: answersArray,
        submittedAt: new Date().toISOString()
      });

      if (response.data.success || response.status === 200 || response.status === 201) {
        navigate(`/s/${slug}/done`);
        setCurrentStep(STEP_DONE);
      } else {
        alert('제출 중 오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('제출 오류:', err);
      const errorMessage = err.response?.data?.message || err.message || '알 수 없는 오류가 발생했습니다.';
      console.error('에러 상세:', {
        status: err.response?.status,
        data: err.response?.data,
        message: errorMessage
      });
      alert('제출 중 오류가 발생했습니다: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen w-full max-w-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50" style={{ width: '100%', maxWidth: '100vw' }}>
        <div className="text-center px-4">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">설문을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !survey) {
    return (
      <div className="min-h-screen w-full max-w-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50" style={{ width: '100%', maxWidth: '100vw' }}>
        <div className="text-center max-w-md px-4 w-full">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">오류가 발생했습니다</h1>
          <p className="text-gray-600">{error || '설문을 찾을 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  // 템플릿 색상 추출 (3가지 색상 모두 활용)
  const primaryColor = survey.branding?.primaryColor || '#6B46C1';      // 강조 색상: 버튼, 링크, 강조 텍스트, 진행률 바, 선택된 항목
  const secondaryColor = survey.branding?.secondaryColor || '#A78BFA';  // 보조 색상: 호버 상태, 보조 요소, 그라데이션, 경계선
  const tertiaryColor = survey.branding?.backgroundColor || survey.branding?.tertiaryColor || '#F3F4F6'; // 배경 색상: 전체 배경, 카드 배경
  
  const buttonShape = survey.branding?.buttonShape || 'rounded-lg';
  const buttonOpacity = survey.branding?.buttonOpacity !== undefined ? survey.branding?.buttonOpacity : 0.9;
  // 커버의 배경 이미지가 우선, 없으면 브랜딩의 배경 이미지 사용
  const bgImageBase64 = survey.cover?.bgImageBase64 || survey.branding?.bgImageBase64 || '';
  const questions = survey.questions || [];
  const koreanSpacingWrap = survey.advancedSettings?.koreanSpacingWrap || false;

  // 단계별 렌더링
  switch (currentStep) {
    case STEP_START:
      return <StartPage 
        survey={survey} 
        onStart={handleStart} 
        color={primaryColor}
        secondaryColor={secondaryColor}
        backgroundColor={tertiaryColor}
        buttonShape={buttonShape} 
        buttonOpacity={buttonOpacity} 
        bgImageBase64={bgImageBase64} 
      />;

    case STEP_QUESTION:
      if (currentQuestionIndex >= 0 && currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        return (
          <QuestionPage
            survey={survey}
            question={question}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            answer={answers[question._id || question.id]}
            onAnswerChange={handleAnswerChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            showPrevious={true}
            color={primaryColor}
            secondaryColor={secondaryColor}
            backgroundColor={tertiaryColor}
            buttonShape={buttonShape}
            buttonOpacity={buttonOpacity}
            bgImageBase64={bgImageBase64}
            koreanSpacingWrap={koreanSpacingWrap}
          />
        );
      }
      return <StartPage 
        survey={survey} 
        onStart={handleStart} 
        color={primaryColor}
        secondaryColor={secondaryColor}
        backgroundColor={tertiaryColor}
        buttonShape={buttonShape} 
        buttonOpacity={buttonOpacity} 
        bgImageBase64={bgImageBase64} 
      />;

    case STEP_REVIEW:
      return (
        <ReviewPage
          survey={survey}
          answers={answers}
          onEdit={handleEdit}
          onSubmit={handleSubmit}
          onSubmitLoading={isSubmitting}
          color={primaryColor}
          secondaryColor={secondaryColor}
          backgroundColor={tertiaryColor}
          buttonShape={buttonShape}
          buttonOpacity={buttonOpacity}
          bgImageBase64={bgImageBase64}
        />
      );

    case STEP_DONE:
      return <DonePage 
        survey={survey} 
        color={primaryColor}
        secondaryColor={secondaryColor}
        backgroundColor={tertiaryColor}
        buttonShape={buttonShape} 
        buttonOpacity={buttonOpacity} 
        bgImageBase64={bgImageBase64}
        onRestart={handleRestart}
      />;

    default:
      return <StartPage 
        survey={survey} 
        onStart={handleStart} 
        color={primaryColor}
        secondaryColor={secondaryColor}
        backgroundColor={tertiaryColor}
        buttonShape={buttonShape} 
        buttonOpacity={buttonOpacity} 
        bgImageBase64={bgImageBase64} 
      />;
  }
}



