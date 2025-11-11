# 설문 유형 관련 파일 가이드

## 📋 설문 유형을 추가/수정할 때 수정해야 하는 파일 목록

### 1️⃣ 프론트엔드 - 질문 유형 목록 정의
**파일**: `client/src/components/builder/Step3_Questions.jsx`
- **위치**: 17-26줄
- **역할**: 질문 추가 시 선택할 수 있는 유형 목록
- **수정 방법**: `questionTypes` 배열에 새 유형 추가

```javascript
const questionTypes = [
    { value: 'single_choice', label: '단일 선택', icon: '📊' },
    { value: 'yes_no', label: '예/아니오', icon: '✅' },
    { value: 'multiple_choice', label: '다중 선택', icon: '☑️' },
    { value: 'image_choice', label: '이미지 선택', icon: '🖼️' },
    { value: 'dropdown', label: '드롭다운', icon: '📋' },
    { value: 'star_rating', label: '별점 평가', icon: '⭐' },
    { value: 'scale', label: '척도 (Likert)', icon: '📏' },
    { value: 'descriptive', label: '서술형 (텍스트)', icon: '📝' }
];
```

### 2️⃣ 프론트엔드 - 질문 유형 변환 설정
**파일**: `client/src/components/builder/Step3_Questions.jsx`
- **위치**: 64-76줄
- **역할**: 프론트엔드 타입 → 백엔드 타입 변환 설정
- **수정 방법**: `getQuestionConfig` 함수의 `configs` 객체에 새 유형 추가

```javascript
const getQuestionConfig = (type) => {
    const configs = {
        'single_choice': { frontendType: 'radio', backendType: 'RADIO', needsOptions: true, defaultOptions: 2 },
        'yes_no': { frontendType: 'yes_no', backendType: 'YES_NO', needsOptions: true, defaultOptions: ['예', '아니오'] },
        'multiple_choice': { frontendType: 'checkbox', backendType: 'CHECKBOX', needsOptions: true, defaultOptions: 2 },
        'image_choice': { frontendType: 'radio_image', backendType: 'RADIO', needsOptions: true, defaultOptions: 2, hasImage: true },
        'dropdown': { frontendType: 'dropdown', backendType: 'DROPDOWN', needsOptions: true, defaultOptions: 2 },
        'star_rating': { frontendType: 'star_rating', backendType: 'STAR_RATING', needsOptions: true, defaultOptions: ['1', '2', '3', '4', '5'] },
        'scale': { frontendType: 'scale', backendType: 'SCALE', needsOptions: true, defaultOptions: ['매우 동의', '동의', '보통', '비동의', '매우 비동의'] },
        'descriptive': { frontendType: 'textarea', backendType: 'TEXT', needsOptions: false, defaultOptions: [] }
    };
    return configs[type] || configs['single_choice'];
};
```

### 3️⃣ 프론트엔드 - 질문 카드에서 유형 선택
**파일**: `client/src/components/builder/QuestionCard.jsx`
- **위치**: 209-225줄
- **역할**: 질문 편집 시 유형 변경 드롭다운
- **수정 방법**: `<select>` 태그의 `<option>` 목록에 새 유형 추가

```javascript
<select 
    value={type}
    onChange={(e) => onQuestionTypeChange(index, e?.target?.value)}
>
    <option value="radio">단일 선택</option>
    <option value="yes_no">예/아니오</option>
    <option value="checkbox">다중 선택</option>
    <option value="image_choice">이미지 선택</option>
    <option value="dropdown">드롭다운</option>
    <option value="star_rating">별점 평가</option>
    <option value="scale">척도 (Likert)</option>
    <option value="text">단답형</option>
    <option value="descriptive">서술형</option>
    <option value="radio_image">이미지 단일 선택</option>
    <option value="checkbox_image">이미지 다중 선택</option>
</select>
```

### 4️⃣ 프론트엔드 - 저장 시 타입 변환
**파일**: `client/src/components/SurveyBuilder.jsx`
- **위치**: 376-412줄
- **역할**: 설문 저장 시 프론트엔드 타입 → 백엔드 타입 변환
- **수정 방법**: `if-else` 조건문에 새 유형 변환 로직 추가

```javascript
const questions = surveyData.questions.map((q, index) => {
    let questionType = 'TEXT';
    const qType = (q.type || '').toLowerCase();
    
    if (qType === 'yes_no') {
        questionType = 'RADIO';
        if (finalOptions.length === 0) {
            finalOptions = ['예', '아니오'];
        }
    } else if (['radio', 'single_choice', 'radio_image'].includes(qType)) {
        questionType = 'RADIO';
    } else if (['checkbox', 'multiple_choice', 'checkbox_image'].includes(qType)) {
        questionType = 'CHECKBOX';
    } else if (qType === 'dropdown') {
        questionType = 'DROPDOWN';
    } else if (qType === 'star_rating') {
        questionType = 'STAR_RATING';
        if (finalOptions.length === 0) {
            finalOptions = ['1', '2', '3', '4', '5'];
        }
    } else if (qType === 'scale') {
        questionType = 'SCALE';
        if (finalOptions.length === 0) {
            finalOptions = ['매우 동의', '동의', '보통', '비동의', '매우 비동의'];
        }
    } else if (qType === 'text') {
        questionType = 'TEXT';
    } else if (['textarea', 'descriptive'].includes(qType)) {
        questionType = 'TEXTAREA';
    }
    // 새 유형 추가 시 여기에 else if 추가
    
    return {
        content: questionContent.trim(),
        type: questionType,
        options: finalOptions,
        order: index,
        required: q.required || false
    };
});
```

### 5️⃣ 백엔드 - 모델 Enum 정의
**파일**: `src/models/Survey.js`
- **위치**: 7줄
- **역할**: MongoDB 스키마에서 허용되는 질문 타입 정의
- **수정 방법**: `enum` 배열에 새 타입 추가

```javascript
const QuestionSchema = new mongoose.Schema({
  content: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['TEXT', 'TEXTAREA', 'RADIO', 'CHECKBOX', 'DROPDOWN', 'STAR_RATING', 'SCALE'], 
    required: true 
  },
  options: { type: [String], default: [] },
  order: { type: Number, default: 0 },
  required: { type: Boolean, default: false },
}, { _id: true });
```

### 6️⃣ 백엔드 - 저장 시 타입 변환 (createSurvey)
**파일**: `src/controllers/SurveyController.js`
- **위치**: 148-191줄
- **역할**: 설문 생성 시 프론트엔드 타입 → 백엔드 타입 변환
- **수정 방법**: `normalizedQuestions` 매핑 함수에 새 유형 변환 로직 추가

```javascript
const normalizedQuestions = questions.map((q, index) => {
    let questionType = 'TEXT';
    const qType = (q.type || '').toLowerCase();
    
    if (qType === 'yes_no') {
        questionType = 'RADIO';
        if (finalOptions.length === 0) {
            finalOptions = ['예', '아니오'];
        }
    } else if (['radio', 'single_choice', 'radio_image'].includes(qType)) {
        questionType = 'RADIO';
    } else if (['checkbox', 'multiple_choice', 'checkbox_image'].includes(qType)) {
        questionType = 'CHECKBOX';
    } else if (qType === 'dropdown') {
        questionType = 'DROPDOWN';
    } else if (qType === 'star_rating') {
        questionType = 'STAR_RATING';
        if (finalOptions.length === 0) {
            finalOptions = ['1', '2', '3', '4', '5'];
        }
    } else if (qType === 'scale') {
        questionType = 'SCALE';
        if (finalOptions.length === 0) {
            finalOptions = ['매우 동의', '동의', '보통', '비동의', '매우 비동의'];
        }
    } else if (qType === 'text') {
        questionType = 'TEXT';
    } else if (['textarea', 'descriptive'].includes(qType)) {
        questionType = 'TEXTAREA';
    }
    // 새 유형 추가 시 여기에 else if 추가
    
    return {
        content: (q.content || q.title || q.text || '').trim(),
        type: questionType,
        options: finalOptions,
        order: index,
        required: q.required || false
    };
});
```

### 7️⃣ 백엔드 - 저장 시 타입 변환 (updateSurvey)
**파일**: `src/controllers/SurveyController.js`
- **위치**: 265-308줄
- **역할**: 설문 수정 시 프론트엔드 타입 → 백엔드 타입 변환
- **수정 방법**: `createSurvey`와 동일하게 수정

### 8️⃣ 백엔드 - 로드 시 타입 변환
**파일**: `client/src/components/SurveyBuilder.jsx`
- **위치**: 89-134줄
- **역할**: 설문 수정 시 백엔드 타입 → 프론트엔드 타입 변환
- **수정 방법**: `convertedQuestions` 매핑 함수에 새 유형 변환 로직 추가

```javascript
const convertedQuestions = (loadedSurvey.questions || []).map((q, index) => {
    let questionType = 'text';
    const qType = (q.type || '').toUpperCase();
    
    // 예/아니오 감지: RADIO 타입이고 옵션이 ['예', '아니오']인 경우
    if (qType === 'RADIO' && qOptions.length === 2) {
        const sortedOptions = [...qOptions].sort();
        if (sortedOptions[0] === '아니오' && sortedOptions[1] === '예') {
            questionType = 'yes_no';
        } else {
            questionType = 'radio';
        }
    } else if (qType === 'RADIO') {
        questionType = 'radio';
    } else if (qType === 'CHECKBOX') {
        questionType = 'checkbox';
    } else if (qType === 'DROPDOWN') {
        questionType = 'dropdown';
    } else if (qType === 'STAR_RATING') {
        questionType = 'star_rating';
    } else if (qType === 'SCALE') {
        questionType = 'scale';
    } else if (qType === 'TEXT') {
        questionType = 'text';
    } else if (qType === 'TEXTAREA') {
        questionType = 'descriptive';
    }
    // 새 유형 추가 시 여기에 else if 추가
    
    return {
        id: Date.now() + index,
        type: questionType,
        title: q.content || '',
        text: q.content || '',
        content: q.content || '',
        options: convertedOptions,
        required: q.required || false,
        image: '',
        show_image_upload: false
    };
});
```

### 9️⃣ 프론트엔드 - 렌더링 시 타입 처리
**파일**: `client/src/pages/SurveyPage.jsx`
- **위치**: 48-443줄
- **역할**: 설문 응답 페이지에서 질문 유형별 렌더링
- **수정 방법**: `switch (questionType)` 문에 새 `case` 추가

```javascript
switch (questionType) {
    case 'CHECKBOX':
        // 체크박스 렌더링
        return (...);
    
    case 'YES_NO':
    case 'RADIO':
        // 라디오/예아니오 렌더링
        return (...);
    
    case 'DROPDOWN':
        // 드롭다운 렌더링
        return (...);
    
    case 'STAR_RATING':
        // 별점 렌더링
        return (...);
    
    case 'SCALE':
    case 'LIKERT':
        // 척도 렌더링
        return (...);
    
    case 'TEXT':
        // 단답형 렌더링
        return (...);
    
    case 'TEXTAREA':
    case 'DESCRIPTIVE':
        // 서술형 렌더링
        return (...);
    
    case 'RADIO_IMAGE':
    case 'CHECKBOX_IMAGE':
    case 'IMAGE_SELECT':
        // 이미지 선택 렌더링
        return (...);
    
    default:
        // 지원하지 않는 타입
        return (...);
}
```

## 🔄 데이터 흐름

1. **질문 추가** → `Step3_Questions.jsx` (questionTypes 배열)
2. **유형 선택** → `QuestionCard.jsx` (select 옵션)
3. **저장 시 변환** → `SurveyBuilder.jsx` (프론트 → 백엔드)
4. **백엔드 저장** → `SurveyController.js` (타입 정규화)
5. **DB 저장** → `Survey.js` (enum 검증)
6. **로드 시 변환** → `SurveyBuilder.jsx` (백엔드 → 프론트)
7. **응답 페이지 렌더링** → `SurveyPage.jsx` (switch case)

## ⚠️ 주의사항

1. **타입 일관성**: 모든 파일에서 동일한 타입 이름 사용
2. **대소문자**: 백엔드는 대문자 (RADIO, CHECKBOX 등), 프론트엔드는 소문자 (radio, checkbox 등)
3. **변환 로직**: 프론트엔드 → 백엔드, 백엔드 → 프론트엔드 양방향 변환 필요
4. **Enum 업데이트**: 새 타입 추가 시 반드시 `Survey.js` 모델의 enum도 업데이트

## 📝 새 유형 추가 예시

예를 들어 "날짜 선택" 유형을 추가한다면:

1. `Step3_Questions.jsx` 17줄: `{ value: 'date_picker', label: '날짜 선택', icon: '📅' }` 추가
2. `Step3_Questions.jsx` 64줄: `'date_picker': { frontendType: 'date_picker', backendType: 'DATE_PICKER', needsOptions: false, defaultOptions: [] }` 추가
3. `QuestionCard.jsx` 214줄: `<option value="date_picker">날짜 선택</option>` 추가
4. `SurveyBuilder.jsx` 376줄: `else if (qType === 'date_picker') { questionType = 'DATE_PICKER'; }` 추가
5. `Survey.js` 7줄: enum에 `'DATE_PICKER'` 추가
6. `SurveyController.js` 148줄, 265줄: 타입 변환 로직 추가
7. `SurveyBuilder.jsx` 89줄: 역변환 로직 추가
8. `SurveyPage.jsx` 48줄: `case 'DATE_PICKER':` 렌더링 로직 추가



