// 시뮬레이션 유틸리티
// 설문 생성, 응답 제출, API 테스트 등을 자동화

import axiosInstance from '../api/axiosInstance';

// 랜덤 텍스트 생성
const generateRandomText = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// 랜덤 한국어 텍스트 생성
const generateKoreanText = () => {
  const titles = [
    '고객 만족도 조사',
    '제품 사용성 평가',
    '서비스 개선 의견 수렴',
    '이벤트 참여 후기',
    '브랜드 인지도 조사',
    '사용자 경험 평가',
    '피드백 수집 설문',
    '선호도 조사'
  ];
  const descriptions = [
    '소중한 의견을 들려주세요',
    '여러분의 피드백이 저희에게 큰 도움이 됩니다',
    '설문에 참여해주셔서 감사합니다',
    '짧은 시간 내에 완료 가능합니다'
  ];
  return {
    title: titles[Math.floor(Math.random() * titles.length)],
    description: descriptions[Math.floor(Math.random() * descriptions.length)]
  };
};

// 질문 타입별 샘플 데이터 생성
const generateQuestion = (type, index) => {
  const baseQuestion = {
    content: `질문 ${index + 1}: ${generateKoreanText().title}에 대한 의견을 알려주세요`,
    type,
    required: Math.random() > 0.5,
    order: index
  };

  switch (type) {
    case 'RADIO':
    case 'CHECKBOX':
      return {
        ...baseQuestion,
        options: [
          `옵션 1`,
          `옵션 2`,
          `옵션 3`,
          `옵션 4`
        ]
      };
    case 'DROPDOWN':
      return {
        ...baseQuestion,
        options: [
          `선택지 A`,
          `선택지 B`,
          `선택지 C`
        ]
      };
    case 'STAR_RATING':
      return {
        ...baseQuestion,
        options: ['5'] // 별점 최대값
      };
    case 'SCALE':
      return {
        ...baseQuestion,
        options: ['1', '10'] // 최소값, 최대값
      };
    case 'TEXT':
    case 'TEXTAREA':
    default:
      return baseQuestion;
  }
};

// 설문 생성 시뮬레이션
export const simulateSurveyCreation = async (options = {}) => {
  const {
    questionCount = 5,
    questionTypes = ['RADIO', 'CHECKBOX', 'TEXT', 'TEXTAREA', 'DROPDOWN', 'STAR_RATING', 'SCALE'],
    includeCover = true,
    includeEnding = true
  } = options;

  const koreanText = generateKoreanText();
  
  const surveyData = {
    title: `[시뮬레이션] ${koreanText.title} ${new Date().toLocaleTimeString()}`,
    description: koreanText.description,
    status: 'draft',
    questions: Array.from({ length: questionCount }, (_, i) => {
      const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      return generateQuestion(type, i);
    }),
    cover: includeCover ? {
      title: koreanText.title,
      description: koreanText.description,
      showParticipantCount: Math.random() > 0.5,
      buttonText: '설문 시작하기'
    } : {},
    ending: includeEnding ? {
      title: '설문이 완료되었습니다!',
      description: '소중한 의견 감사합니다.',
      linkUrl: '',
      linkText: '더 알아보기'
    } : {},
    branding: {
      primaryColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    }
  };

  try {
    const response = await axiosInstance.post('/surveys', surveyData);
    return {
      success: true,
      surveyId: response.data.survey?._id || response.data.surveyId,
      surveyData,
      message: '설문이 성공적으로 생성되었습니다.'
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || error.message,
      surveyData
    };
  }
};

// 응답 생성 시뮬레이션
export const simulateResponseSubmission = async (surveyId, options = {}) => {
  const {
    responseCount = 1,
    delay = 100 // 응답 간 지연 시간 (ms)
  } = options;

  try {
    // 설문 정보 가져오기
    const surveyResponse = await axiosInstance.get(`/surveys/${surveyId}`);
    const survey = surveyResponse.data.survey || surveyResponse.data;
    
    if (!survey || !survey.questions || survey.questions.length === 0) {
      return {
        success: false,
        error: '설문을 찾을 수 없거나 질문이 없습니다.',
        total: 0,
        successCount: 0,
        failedCount: 0,
        results: []
      };
    }

    const results = [];
    
    for (let i = 0; i < responseCount; i++) {
      try {
        // 각 질문에 대한 답변 생성
        const answers = survey.questions.map((question, index) => {
          // 질문 ID 확인
          const questionId = question._id || question.id;
          if (!questionId) {
            console.warn(`질문 ${index + 1}에 ID가 없습니다:`, question);
          }

          let value;
          
          switch (question.type) {
            case 'RADIO':
            case 'DROPDOWN':
              if (question.options && question.options.length > 0) {
                value = question.options[Math.floor(Math.random() * question.options.length)];
              } else {
                value = '선택 없음';
              }
              break;
            case 'CHECKBOX':
              if (question.options && question.options.length > 0) {
                const selectedCount = Math.min(
                  Math.floor(Math.random() * question.options.length) + 1,
                  question.options.length
                );
                value = question.options.slice(0, selectedCount);
              } else {
                value = [];
              }
              break;
            case 'STAR_RATING':
              value = String(Math.floor(Math.random() * 5) + 1);
              break;
            case 'SCALE':
              const min = parseInt(question.options?.[0] || '1');
              const max = parseInt(question.options?.[1] || '10');
              value = String(Math.floor(Math.random() * (max - min + 1)) + min);
              break;
            case 'TEXT':
              value = `답변 ${i + 1}-${index + 1}: ${generateRandomText(20)}`;
              break;
            case 'TEXTAREA':
              value = `상세 답변 ${i + 1}-${index + 1}:\n${generateRandomText(50)}`;
              break;
            default:
              value = `기본 답변 ${i + 1}-${index + 1}`;
          }
          
          return {
            questionId: questionId,
            value: value
          };
        });

        // 질문 ID가 없는 경우 필터링
        const validAnswers = answers.filter(a => a.questionId);
        if (validAnswers.length !== survey.questions.length) {
          throw new Error(`일부 질문에 ID가 없습니다. (${validAnswers.length}/${survey.questions.length})`);
        }

        const response = await axiosInstance.post(`/surveys/${surveyId}/response`, {
          answers: validAnswers
        });
        
        results.push({
          success: true,
          responseId: response.data.responseId || response.data.data?.responseId,
          responseNumber: i + 1
        });
        
        // 지연 시간 적용
        if (i < responseCount - 1 && delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        const errorDetails = error.response?.data?.error || '';
        console.error(`응답 ${i + 1} 제출 실패:`, errorMessage, errorDetails);
        
        results.push({
          success: false,
          error: errorMessage,
          errorDetails: errorDetails,
          responseNumber: i + 1,
          status: error.response?.status
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return {
      success: successCount > 0,
      total: responseCount,
      successCount,
      failedCount: responseCount - successCount,
      results
    };
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error('응답 제출 시뮬레이션 오류:', errorMessage);
    return {
      success: false,
      error: errorMessage,
      total: 0,
      successCount: 0,
      failedCount: 0,
      results: []
    };
  }
};

// 전체 시뮬레이션 (설문 생성 + 응답 제출)
export const runFullSimulation = async (options = {}) => {
  const {
    surveyCount = 1,
    questionCount = 5,
    responseCountPerSurvey = 10,
    delay = 100
  } = options;

  const simulationResults = {
    startTime: new Date(),
    surveys: [],
    totalSurveys: surveyCount,
    totalResponses: 0,
    successCount: 0,
    failedCount: 0,
    errors: []
  };

  for (let i = 0; i < surveyCount; i++) {
    // 설문 생성
    const surveyResult = await simulateSurveyCreation({
      questionCount,
      questionTypes: ['RADIO', 'CHECKBOX', 'TEXT', 'TEXTAREA', 'DROPDOWN', 'STAR_RATING', 'SCALE']
    });

    if (surveyResult.success && surveyResult.surveyId) {
      // 응답 제출
      const responseResult = await simulateResponseSubmission(surveyResult.surveyId, {
        responseCount: responseCountPerSurvey,
        delay
      });

      simulationResults.surveys.push({
        surveyId: surveyResult.surveyId,
        surveyTitle: surveyResult.surveyData.title,
        questionCount,
        responseResult
      });

      simulationResults.totalResponses += responseResult.total || 0;
      simulationResults.successCount += responseResult.successCount || 0;
      simulationResults.failedCount += responseResult.failedCount || 0;
      
      // 응답 제출 실패 시 상세 에러 정보 수집
      if (responseResult.failedCount > 0) {
        responseResult.results?.forEach((result, idx) => {
          if (!result.success) {
            simulationResults.errors.push({
              type: 'response_submission',
              surveyId: surveyResult.surveyId,
              responseNumber: result.responseNumber,
              error: result.error || '알 수 없는 오류',
              errorDetails: result.errorDetails || '',
              status: result.status
            });
          }
        });
      }
    } else {
      simulationResults.failedCount++;
      simulationResults.errors.push({
        type: 'survey_creation',
        error: surveyResult.error || '설문 생성 실패'
      });
    }
  }

  simulationResults.endTime = new Date();
  simulationResults.duration = simulationResults.endTime - simulationResults.startTime;

  return simulationResults;
};

// API 엔드포인트 테스트
export const testApiEndpoints = async () => {
  const results = {
    startTime: new Date(),
    tests: [],
    successCount: 0,
    failedCount: 0
  };

  // 1. 설문 목록 조회 테스트
  try {
    const response = await axiosInstance.get('/surveys');
    results.tests.push({
      endpoint: 'GET /surveys',
      success: true,
      status: response.status,
      dataCount: response.data?.surveys?.length || response.data?.length || 0
    });
    results.successCount++;
  } catch (error) {
    results.tests.push({
      endpoint: 'GET /surveys',
      success: false,
      error: error.response?.data?.message || error.message,
      status: error.response?.status
    });
    results.failedCount++;
  }

  // 2. 설문 생성 테스트
  try {
    const surveyResult = await simulateSurveyCreation({ questionCount: 2 });
    if (surveyResult.success) {
      results.tests.push({
        endpoint: 'POST /surveys',
        success: true,
        surveyId: surveyResult.surveyId
      });
      results.successCount++;

      // 3. 설문 상세 조회 테스트
      try {
        const detailResponse = await axiosInstance.get(`/surveys/${surveyResult.surveyId}`);
        results.tests.push({
          endpoint: `GET /surveys/${surveyResult.surveyId}`,
          success: true,
          status: detailResponse.status
        });
        results.successCount++;
      } catch (error) {
        results.tests.push({
          endpoint: `GET /surveys/${surveyResult.surveyId}`,
          success: false,
          error: error.response?.data?.message || error.message
        });
        results.failedCount++;
      }

      // 4. 응답 제출 테스트
      try {
        const responseResult = await simulateResponseSubmission(surveyResult.surveyId, {
          responseCount: 1
        });
        results.tests.push({
          endpoint: `POST /surveys/${surveyResult.surveyId}/response`,
          success: responseResult.success,
          responseCount: responseResult.successCount || 0
        });
        if (responseResult.success) {
          results.successCount++;
        } else {
          results.failedCount++;
        }
      } catch (error) {
        results.tests.push({
          endpoint: `POST /surveys/${surveyResult.surveyId}/response`,
          success: false,
          error: error.response?.data?.message || error.message
        });
        results.failedCount++;
      }
    } else {
      results.tests.push({
        endpoint: 'POST /surveys',
        success: false,
        error: surveyResult.error
      });
      results.failedCount++;
    }
  } catch (error) {
    results.tests.push({
      endpoint: 'POST /surveys',
      success: false,
      error: error.response?.data?.message || error.message
    });
    results.failedCount++;
  }

  results.endTime = new Date();
  results.duration = results.endTime - results.startTime;

  return results;
};

