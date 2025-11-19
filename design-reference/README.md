# 디자인 레퍼런스 가이드

**작성 일자**: 2024-12-19  
**목적**: 대시보드 및 설문 목록 페이지의 디자인 방향 제시

---

## 📁 파일 구조

```
design-reference/
├── dashboard-reference.html           # 대시보드 디자인 레퍼런스
├── survey-list-reference.html         # 설문 목록 디자인 레퍼런스
├── survey-participation-reference.html # 설문 참여 디자인 레퍼런스
└── README.md                          # 이 파일
```

---

## 🎨 디자인 레퍼런스 사용 방법

### 3. 설문 참여 레퍼런스 (`survey-participation-reference.html`)

#### 포함된 디자인 요소 (레이아웃 참고)
- **시작 페이지 레이아웃**:
  - 로고 영역 (상단 중앙)
  - 제목 및 부제목 (중앙 정렬)
  - 타이틀 이미지 (중앙)
  - 설문 참여 수 표시 토글
  - 시작 버튼 (하단)
  
- **질문 페이지 레이아웃**:
  - 로고 영역 (상단 중앙)
  - 진행률 바 (뒤로가기 버튼 + 진행률 바 + 숫자)
  - 큰 질문 번호 (Q1. 스타일, text-5xl)
  - 질문 제목
  - 선택 옵션 버튼들 (세로 배치, 큰 버튼)
  
- **다양한 테마 예시**:
  - 흰색 배경 테마
  - 컬러 배경 테마 (청록색)
  - 다크 테마

#### 레이아웃 특징
- **로고 위치**: 상단 중앙, 모든 페이지에 일관되게 배치
- **진행률 바**: 뒤로가기 버튼 + 진행률 바 + 숫자 (한 줄)
- **질문 번호**: 매우 큰 텍스트 (text-5xl), Primary 색상
- **선택 버튼**: 세로로 배치, 큰 크기, Primary 색상 배경
- **간격**: 적절한 여백, 깔끔한 레이아웃

#### 브랜딩 커스터마이징 (유지)
- **primaryColor**: 버튼, 진행률 바, 질문 번호 색상
- **buttonShape**: 버튼 모양 (square, rounded, pill)
- **logoBase64**: 로고 이미지
- **bgImageBase64**: 배경 이미지 (선택)

#### 사용 방법
1. 브라우저에서 `survey-participation-reference.html` 파일 열기
2. 각 단계별 디자인 확인 (시작, 질문, 완료)
3. 다크 테마 스타일 참고
4. 구현 시 참고하여 컴포넌트 개발

---

### 1. 대시보드 레퍼런스 (`dashboard-reference.html`)

#### 포함된 디자인 요소
- **컴팩트 통계 바**: 6개 지표를 한 줄에 표시
- **필터 영역**: 설문 선택, 날짜 범위, 초기화 버튼
- **실시간 알럿 패널**: 알럿 목록 표시
- **활동 피드**: 실시간 활동 목록
- **차트 영역**: 응답 추이, 설문별 성과
- **큰 카드 모드**: 기존 큰 카드 디자인 (참고용)
- **인사이트 카드**: 인사이트 메시지 카드 (참고용)

#### 사용 방법
1. 브라우저에서 `dashboard-reference.html` 파일 열기
2. 디자인 요소 확인 및 스타일 참고
3. 구현 시 참고하여 컴포넌트 개발

---

### 2. 설문 목록 레퍼런스 (`survey-list-reference.html`)

#### 포함된 디자인 요소
- **필터 및 검색**: 검색 입력, 상태 필터, 정렬
- **뷰 전환**: 카드 뷰 ↔ 표 뷰 전환 버튼
- **표 뷰**: 아이콘 액션 메뉴가 있는 테이블
- **카드 뷰**: 아이콘 액션 메뉴가 있는 카드
- **드롭다운 메뉴**: 아이콘 클릭 시 표시되는 메뉴

#### 아이콘 액션 메뉴
- **편집하기** (📝): 설문 편집
- **결과보기** (📊): 결과 분석 페이지
- **Raw 데이터 다운로드** (📥): CSV 다운로드
- **설문 진행/정지** (▶️/⏸️): 상태 토글
- **공유 링크** (🔗): 링크 복사
- **설문 복사** (📋): 설문 복제
- **삭제** (🗑️): 설문 삭제

#### 사용 방법
1. 브라우저에서 `survey-list-reference.html` 파일 열기
2. 아이콘 액션 메뉴 디자인 확인
3. 구현 시 참고하여 컴포넌트 개발

---

## 🎯 디자인 가이드라인

### 1. 색상 팔레트
- **Primary**: `#26C6DA` (청록색)
- **Primary Hover**: `#20B2C3` (진한 청록색)
- **Secondary**: `#F59E0B` (주황색)
- **Success**: `#10B981` (녹색)
- **Error**: `#EF4444` (빨간색)
- **Warning**: `#F59E0B` (주황색)

### 2. 컴팩트 통계 바
- **높이**: 60-80px
- **레이아웃**: 한 줄에 6-8개 지표
- **색상 구분**: 지표별 다른 색상
- **호버 효과**: 배경색 변경

### 3. 필터 영역
- **레이아웃**: 그리드 레이아웃 (1열 → 4열)
- **입력 필드**: 표준 입력 필드 스타일
- **버튼**: 기본 버튼 스타일
- **간격**: 적절한 간격 유지

### 4. 아이콘 액션 메뉴
- **크기**: 20px (w-5 h-5)
- **색상**: 기본 회색, 호버 시 색상 변경
- **배경**: 호버 시 배경색 변경
- **간격**: 아이콘 간 적절한 간격

### 5. 알럿 패널
- **배경색**: 알럿 유형별 다른 배경색
- **테두리**: 왼쪽 테두리로 강조
- **애니메이션**: slideIn 애니메이션
- **닫기 버튼**: 각 알럿에 닫기 버튼

### 6. 활동 피드
- **레이아웃**: 컴팩트 리스트 형태
- **항목 높이**: 40px
- **애니메이션**: fadeIn 애니메이션
- **호버 효과**: 배경색 변경

### 7. 설문 참여 페이지
- **진행률 바**: 상단 고정, 현재 진행률 표시
- **질문 카드**: `bg-white rounded-xl shadow-md border border-gray-200`
- **질문 번호**: 원형 배지, Primary 색상
- **선택 옵션**: 호버 효과, 선택 시 Primary 색상 강조
- **입력 필드**: `border-2 border-gray-300`, `focus:ring-2 focus:ring-blue-500`
- **버튼**: Primary 색상, 호버 효과

---

## 🔧 구현 참고 사항

### 1. 컴팩트 통계 바
```jsx
<CompactStatsBar 
  stats={{
    totalSurveys: 10,
    activeSurveys: 5,
    totalResponses: 120,
    avgResponseRate: 85,
    activeUsers: 25,
    avgCompletionTime: 225, // 초
  }}
  loading={false}
/>
```

### 2. 필터 영역
```jsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
  <select value={selectedSurveyId} onChange={...}>
    <option value="all">전체 설문</option>
    {surveys.map(survey => ...)}
  </select>
  <input type="date" value={startDate} onChange={...} />
  <input type="date" value={endDate} onChange={...} />
  <button onClick={...}>초기화</button>
</div>
```

### 3. 아이콘 액션 메뉴
```jsx
<div className="flex items-center gap-2">
  <button className="action-icon p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="편집">
    <EditIcon className="w-5 h-5" />
  </button>
  <button className="action-icon p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all" title="결과보기">
    <ChartIcon className="w-5 h-5" />
  </button>
  {/* ... */}
</div>
```

### 4. 알럿 패널
```jsx
<div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
  <h3 className="text-lg font-bold text-gray-900">🔔 실시간 알럿</h3>
  <div className="space-y-3">
    {alerts.map(alert => (
      <div className="alert-item p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
        <p className="text-sm font-medium text-yellow-800">{alert.message}</p>
        <p className="text-xs text-gray-500">{alert.time}</p>
      </div>
    ))}
  </div>
</div>
```

### 5. 설문 참여 페이지
```jsx
// 진행률 바
<div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium text-gray-700">진행률</span>
    <span className="text-sm font-medium text-primary">{current} / {total}</span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-3">
    <div className="bg-primary h-3 rounded-full" style={{ width: `${(current/total)*100}%` }}></div>
  </div>
</div>

// 질문 카드
<div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
  <div className="flex items-start gap-4 mb-6">
    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
      {questionNumber}
    </div>
    <div className="flex-1">
      <h3 className="text-xl font-bold text-gray-900">
        {question.title}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </h3>
    </div>
  </div>
  {/* 선택 옵션 */}
</div>

// 선택 옵션 (라디오)
<label className="block p-4 rounded-xl border-2 border-gray-300 bg-white hover:border-primary hover:bg-primary/5 cursor-pointer transition-all">
  <input type="radio" name="option" className="w-5 h-5 text-primary focus:ring-primary" />
  <span className="ml-3 text-gray-900 font-medium">{option}</span>
</label>
```

---

## 📋 체크리스트

### 디자인 요소
- [ ] 컴팩트 통계 바 디자인 확인
- [ ] 필터 영역 디자인 확인
- [ ] 아이콘 액션 메뉴 디자인 확인
- [ ] 알럿 패널 디자인 확인
- [ ] 활동 피드 디자인 확인
- [ ] 차트 영역 디자인 확인
- [ ] 설문 참여 시작 페이지 디자인 확인
- [ ] 설문 참여 질문 페이지 디자인 확인
- [ ] 설문 참여 완료 페이지 디자인 확인

### 스타일 가이드
- [ ] 색상 팔레트 확인
- [ ] 간격 및 레이아웃 확인
- [ ] 호버 효과 확인
- [ ] 애니메이션 효과 확인
- [ ] 반응형 디자인 확인

### 구현 참고
- [ ] 컴포넌트 구조 확인
- [ ] 스타일 클래스 확인
- [ ] 인터랙션 확인
- [ ] 접근성 확인

---

## 🎨 디자인 원칙

### 1. 일관성
- 동일한 스타일 가이드 적용
- 일관된 색상 사용
- 일관된 간격 및 레이아웃

### 2. 사용성
- 명확한 레이블 및 툴팁
- 직관적인 아이콘 사용
- 적절한 피드백 제공

### 3. 접근성
- 적절한 색상 대비
- 키보드 네비게이션 지원
- 스크린 리더 지원

### 4. 반응형
- 모바일, 태블릿, 데스크톱 지원
- 유연한 레이아웃
- 적절한 브레이크포인트

---

## 🔄 업데이트 이력

| 일자 | 변경 내용 | 변경자 |
|------|----------|--------|
| 2024-12-19 | 디자인 레퍼런스 HTML 생성 | System |
| 2024-12-19 | 설문 참여 디자인 레퍼런스 추가 | System |

---

## 📝 참고 사항

### 사용 목적
- 디자인 방향 제시
- 구현 시 참고 자료
- 스타일 가이드 제공
- 컴포넌트 구조 제시

### 제한 사항
- 실제 데이터 연결 없음
- 실제 기능 구현 없음
- 시각적 참고용만 제공

### 향후 개선
- 더 많은 디자인 변형 추가
- 인터랙티브한 예제 추가
- 스타일 가이드 문서화
- 컴포넌트 라이브러리화

---

## 🎯 다음 단계

1. 디자인 레퍼런스 검토
2. 스타일 가이드 확정
3. 컴포넌트 구현
4. 사용자 피드백 수집
5. 디자인 개선

