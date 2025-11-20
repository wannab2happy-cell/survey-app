# 테스트 데이터 생성 스크립트

이 스크립트는 다양한 설문과 응답 데이터를 생성하여 테스트에 사용할 수 있습니다.

## 사용 방법

### 1. 기본 실행 (기존 데이터 유지)
```bash
npm run generate-test-data
```

### 2. 기존 데이터 삭제 후 생성
```bash
npm run generate-test-data:clean
```

## 생성되는 데이터

### 설문 (5개)
1. **2025 KORMARINE 직무 만족도 조사**
   - 질문 유형: TEXT, RADIO, STAR_RATING, SCALE
   - 개인정보 수집: 활성화
   - 응답 수: 20-70개

2. **호텔 만족도 조사 템플릿**
   - 질문 유형: TEXT, STAR_RATING, RADIO, CHECKBOX, TEXTAREA
   - 개인정보 수집: 비활성화
   - 응답 수: 20-70개

3. **제품 사용 후기 조사**
   - 질문 유형: TEXT, STAR_RATING, CHECKBOX, DROPDOWN, TEXTAREA
   - 개인정보 수집: 비활성화
   - 응답 수: 20-70개

4. **이벤트 참가자 설문**
   - 질문 유형: TEXT, SCALE, RADIO, CHECKBOX, TEXTAREA
   - 개인정보 수집: 활성화 (이름, 이메일)
   - 응답 수: 20-70개

5. **고객 서비스 만족도 조사**
   - 질문 유형: DROPDOWN, RADIO, STAR_RATING, SCALE, TEXTAREA
   - 개인정보 수집: 비활성화
   - 응답 수: 20-70개

### 응답 데이터
- 각 설문마다 20-70개의 랜덤 응답 생성
- 다양한 질문 유형에 맞는 답변 생성
- 한국 이름, 이메일, 전화번호, 소속 등 실제와 유사한 데이터
- 최근 7일 내 랜덤 날짜로 응답 생성

## 주의사항

1. **기존 데이터 삭제**: `--delete` 옵션을 사용하면 기존의 모든 설문과 응답 데이터가 삭제됩니다.
2. **MongoDB 연결**: MongoDB가 실행 중이어야 합니다.
3. **환경 변수**: `.env` 파일에 `MONGO_URI`가 설정되어 있어야 합니다.

## 생성된 데이터 확인

생성된 설문은 관리자 페이지에서 확인할 수 있습니다:
- 설문 목록: `/admin`
- 설문 결과: `/admin/results/:id`

## 문제 해결

### MongoDB 연결 오류
- MongoDB가 실행 중인지 확인하세요.
- `.env` 파일의 `MONGO_URI`가 올바른지 확인하세요.

### 스크립트 실행 오류
- Node.js 버전이 14 이상인지 확인하세요.
- 필요한 패키지가 설치되어 있는지 확인하세요: `npm install`








