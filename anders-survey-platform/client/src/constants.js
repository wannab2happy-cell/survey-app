// client/src/constants.js (최종 상수 정의)

// -----------------------------------------------------------------------
// 1. 설문 질문 유형 목록 (QUESTION_TYPES)
// -----------------------------------------------------------------------
export const QUESTION_TYPES = [
    { value: 'text', label: '단답형 (텍스트)' },
    { value: 'textarea', label: '장문형 (텍스트)' },
    { value: 'radio', label: '객관식 (단일 선택)' },
    { value: 'checkbox', label: '복수 선택' },
    { value: 'dropdown', label: '드롭다운' },
    { value: 'image_select', label: '이미지 선택형' },
];

// -----------------------------------------------------------------------
// 2. 개인 정보 수집 필드 목록 (PERSONAL_INFO_FIELDS) - [모두 필수 항목으로 변경 완료]
// -----------------------------------------------------------------------
export const PERSONAL_INFO_FIELDS = [
    { value: 'name', label: '이름', required: true, type: 'text' }, 
    { value: 'gender', label: '성별', required: true, type: 'select' }, // 필수 항목으로 변경
    { value: 'birthdate', label: '생년월일', required: true, type: 'date' }, // 필수 항목으로 변경
    { value: 'phone', label: '연락처', required: true, type: 'tel' }, // 필수 항목으로 변경
    { value: 'email', label: '이메일 주소', required: true, type: 'email' }, // 필수 항목으로 변경
    { value: 'address', label: '주소 (주소 검색)', required: true, type: 'address_search' }, // 필수 항목으로 변경
];

// -----------------------------------------------------------------------
// 3. 설문 상태 (SURVEY_STATUSES)
// -----------------------------------------------------------------------
export const SURVEY_STATUSES = [
    { value: 'active', label: '활성 (응답 가능)' },
    { value: 'inactive', label: '비활성 (준비 중)' },
    { value: 'paused', label: '일시 중지' },
    { value: 'archived', label: '보관됨 (종료)' },
];