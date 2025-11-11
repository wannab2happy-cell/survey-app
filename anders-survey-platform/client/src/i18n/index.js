// 다국어 지원 시스템 (i18n)
// 한국어와 영어를 지원합니다.

const translations = {
  ko: {
    // 공통
    common: {
      save: '저장',
      cancel: '취소',
      delete: '삭제',
      edit: '편집',
      create: '생성',
      next: '다음',
      previous: '이전',
      submit: '제출',
      loading: '로딩 중...',
      error: '오류가 발생했습니다',
      success: '성공',
    },
    // 참가자 (Participant)
    participant: {
      start: {
        title: '설문에 참여해주세요',
        description: '소중한 의견을 들려주세요',
        startButton: '시작하기',
      },
      question: {
        required: '필수',
        optional: '선택',
        nextButton: '다음으로 이동',
        previousButton: '이전으로',
      },
      review: {
        title: '응답 검토',
        description: '응답을 확인하고 제출해주세요',
        editButton: '수정',
        submitButton: '제출 완료',
      },
      done: {
        title: '설문이 완료되었습니다!',
        message: '귀하의 소중한 의견에 감사드립니다.',
      },
    },
    // 관리자 (Admin)
    admin: {
      dashboard: {
        title: '대시보드',
        totalSurveys: '전체 설문',
        totalResponses: '전체 응답',
        completionRate: '완료율',
      },
      surveys: {
        title: '설문 목록',
        createNew: '새 설문 만들기',
        status: {
          draft: '초안',
          active: '활성',
          paused: '일시정지',
          completed: '완료',
        },
      },
      builder: {
        title: '설문 빌더',
        addQuestion: '질문 추가',
        save: '저장하기',
        preview: '미리보기',
      },
      analytics: {
        title: '분석',
        export: '내보내기',
        filter: '필터',
      },
    },
  },
  en: {
    // Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Success',
    },
    // Participant
    participant: {
      start: {
        title: 'Please participate in the survey',
        description: 'Please share your valuable opinion',
        startButton: 'Start',
      },
      question: {
        required: 'Required',
        optional: 'Optional',
        nextButton: 'Next',
        previousButton: 'Previous',
      },
      review: {
        title: 'Review Responses',
        description: 'Please review and submit your responses',
        editButton: 'Edit',
        submitButton: 'Submit',
      },
      done: {
        title: 'Survey Completed!',
        message: 'Thank you for your valuable feedback.',
      },
    },
    // Admin
    admin: {
      dashboard: {
        title: 'Dashboard',
        totalSurveys: 'Total Surveys',
        totalResponses: 'Total Responses',
        completionRate: 'Completion Rate',
      },
      surveys: {
        title: 'Survey List',
        createNew: 'Create New Survey',
        status: {
          draft: 'Draft',
          active: 'Active',
          paused: 'Paused',
          completed: 'Completed',
        },
      },
      builder: {
        title: 'Survey Builder',
        addQuestion: 'Add Question',
        save: 'Save',
        preview: 'Preview',
      },
      analytics: {
        title: 'Analytics',
        export: 'Export',
        filter: 'Filter',
      },
    },
  },
};

// 현재 언어 설정 (localStorage 또는 기본값)
const getCurrentLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'ko';
  }
  return 'ko';
};

// 언어 변경
export const setLanguage = (lang) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lang);
  }
};

// 번역 함수
export const t = (key, params = {}) => {
  const lang = getCurrentLanguage();
  const keys = key.split('.');
  let value = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // 키를 찾을 수 없으면 키 자체를 반환
    }
  }
  
  // 파라미터 치환 (예: "Hello {name}" -> "Hello John")
  if (typeof value === 'string' && params) {
    return value.replace(/\{(\w+)\}/g, (match, key) => {
      return params[key] !== undefined ? params[key] : match;
    });
  }
  
  return value || key;
};

// 현재 언어 반환
export const getCurrentLang = () => getCurrentLanguage();

// 사용 가능한 언어 목록
export const availableLanguages = [
  { code: 'ko', name: '한국어' },
  { code: 'en', name: 'English' },
];

export default {
  t,
  setLanguage,
  getCurrentLang,
  availableLanguages,
};



