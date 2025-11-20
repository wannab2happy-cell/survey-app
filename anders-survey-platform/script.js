/**
 * 앤더스 설문 플랫폼 - SPA 메인 로직 (script.js)
 * Rule #2, #4, #5, #7, #8 및 개인정보 수집 요구사항 준수
 * (Thank You Page 로직 최종 반영)
 */

// ====================================================================
// 0. 전역 상태 및 설정
// ====================================================================
const BASE_URL = `${import.meta.env.VITE_API_URL}/api`;
const SURVEY_ID = 1;

// 현재는 데모이므로, 완료 문구를 임시로 저장합니다. 
// 실제 백엔드 연동 시, 이 값은 Admin 페이지 설정에서 가져와야 합니다.
const THANK_YOU_TITLE = "참여해주셔서 감사합니다!";
const THANK_YOU_MESSAGE = "귀하의 소중한 의견이 이벤트 운영 및 제품 개발에 큰 도움이 됩니다.<br>참여해주신 분들께는 추첨을 통해 소정의 경품이 제공될 예정이며, 당첨자는 개별 연락드릴 예정입니다.";

const STATE = {
    view: 'loading',                
    surveyData: null,
    liveData: null,
    isSubmitting: false,
    currentQuestionIndex: -1,      
    tempResponses: {},             
    personalInfo: {},              
    userId: Math.floor(Math.random() * 1000000) 
};

const contentContainer = document.getElementById('content-container');
const statusMessage = document.getElementById('status-message');
let dashboardInterval = null; 

// ====================================================================
// 1. 유틸리티 함수 (showMessage, navigate, fetchData) - (생략 - 이전과 동일)
// ====================================================================

function showMessage(message, type) { /* ... */ }
function navigate(viewName) { /* ... */ }
async function fetchData(endpoint, method = 'GET', body = null) { /* ... */ }


// ====================================================================
// 2. 데이터 로딩 (Fetchers) - (생략 - 이전과 동일)
// ====================================================================

async function fetchSurveyDetails() { /* ... */ }
function fetchLiveData() { /* ... */ }


// ====================================================================
// 3. 설문 네비게이션 및 상태 저장 - (생략 - 이전과 동일)
// ====================================================================

function saveCurrentResponse() { /* ... */ }
function savePersonalInfoAndProceed() { /* ... */ }
function attachSurveyListeners(isLast) { /* ... */ }


// ====================================================================
// 4. 뷰 렌더링 함수 (renderThankYou 업데이트)
// ====================================================================

/**
 * 개인정보 동의 및 입력 단계 렌더링 (currentQuestionIndex = -1)
 */
function renderPersonalInformationStep() {
    stopDashboardRefresh();
    const piData = STATE.personalInfo; 

    // ... (이전과 동일한 HTML 구조)
    contentContainer.innerHTML = `
        <div id="survey-header-image" class="fixed-header bg-cover bg-center" style="background-image: var(--survey-head-image);">
            <div class="progress-bar-container p-3 text-center">
                <h1 class="text-white text-xl font-bold">개인정보 입력 및 동의</h1>
            </div>
        </div>

        <div class="question-scroll-area"> 
            <form id="personal-info-form" class="bg-white p-6 rounded-xl shadow-md border border-gray-100 space-y-6">
                
                <h3 class="text-2xl font-bold text-gray-800 border-b pb-3 mb-4">필수 정보 입력</h3>
                <p class="text-sm text-gray-600">이벤트 혜택 제공을 위해 정확한 정보를 입력해 주세요.</p>

                <label class="block">
                    <span class="text-gray-700 font-medium">이름 <span class="text-red-500">*</span></span>
                    <input type="text" name="name" value="${piData.name || ''}" required class="mt-1 block w-full p-3 border rounded-lg" placeholder="홍길동">
                </label>
                <label class="block">
                    <span class="text-gray-700 font-medium">연락처 <span class="text-red-500">*</span></span>
                    <input type="tel" name="contact" value="${piData.contact || ''}" required class="mt-1 block w-full p-3 border rounded-lg" placeholder="010-0000-0000">
                </label>
                <label class="block">
                    <span class="text-gray-700 font-medium">이메일 주소 <span class="text-red-500">*</span></span>
                    <input type="email" name="email" value="${piData.email || ''}" required class="mt-1 block w-full p-3 border rounded-lg" placeholder="example@anders.com">
                </label>
                
                <div class="mt-8 pt-4 border-t">
                    <h3 class="text-2xl font-bold text-gray-800 mb-4">개인정보 수집 및 이용 동의</h3>
                    <div class="flex items-start space-x-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <input type="checkbox" id="pi-consent" name="pi_consent" ${piData.pi_consent ? 'checked' : ''} required class="mt-1 form-checkbox h-5 w-5 text-blue-600">
                        <label for="pi-consent" class="text-sm text-gray-800 flex-1">
                            **본인은 개인정보 수집 및 이용에 동의합니다.** <span class="text-red-500">*</span>
                            <button type="button" onclick="showConsentModal()" class="text-blue-600 font-bold ml-2 underline"> [동의서 원문 확인] </button>
                        </label>
                    </div>
                </div>

            </form>
        </div>

        <div id="survey-footer-nav" class="fixed-footer">
            <div class="footer-image-placeholder bg-cover bg-center" style="background-image: var(--survey-foot-image);"></div>
            <div class="flex justify-end">
                <button id="next-button" 
                    class="flex-1 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition duration-150"
                    style="background-color: var(--primary-color);">
                    다음 단계 (설문 시작) →
                </button>
            </div>
        </div>
    `;
    window.showConsentModal = () => { /* ... */ };

    attachSurveyListeners(false); 
}

/**
 * 설문 참여 뷰 렌더링 (Step 0 이상)
 */
function renderSurvey() {
    // ... (이전과 동일한 로직)
}

/**
 * 설문 완료 (Thank You) 뷰 렌더링 (최종 업데이트)
 */
function renderThankYou() {
    stopDashboardRefresh();
    
    // 1. 네비게이션 버튼을 제거하고 Foot 이미지만 유지
    const footerNav = document.getElementById('survey-footer-nav');
    if (footerNav) {
        footerNav.innerHTML = `<div class="footer-image-placeholder bg-cover bg-center" style="background-image: var(--survey-foot-image);"></div>`;
    }
    
    // 2. Head 영역에는 완료 메시지를 표시
    const headerImage = document.getElementById('survey-header-image');
    if (headerImage) {
        headerImage.innerHTML = `
            <div class="progress-bar-container p-3 text-center">
                <h1 class="text-white text-xl font-bold">✅ 설문 참여 완료</h1>
            </div>
        `;
    }

    // 3. 중앙 콘텐츠 영역에 완료 안내 문구 삽입
    contentContainer.innerHTML = `
        <div class="p-8 bg-white rounded-xl shadow-2xl text-center w-full max-w-md mx-auto my-10 border-t-8" style="border-color: var(--primary-color);">
            <svg class="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <h2 class="text-3xl font-bold text-gray-800 mb-4">${THANK_YOU_TITLE}</h2>
            
            <p class="text-lg text-gray-700 leading-relaxed mb-6">
                ${THANK_YOU_MESSAGE}
            </p>
            
            <a href="index.html" class="inline-block px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition duration-150">
                메인 페이지로 돌아가기
            </a>
        </div>
    `;
}


function renderDashboard() {
    // ... (이전과 동일한 로직)
}


function render() {
    // ... (이전과 동일한 로직)
}


// ====================================================================
// 5. 최종 제출 핸들러 및 초기화 - (생략 - 이전과 동일)
// ====================================================================

async function handleSurveySubmit(event) {
    // ... (이전과 동일한 로직)
    navigate('thankyou');
}

async function init() {
    // ... (이전과 동일한 로직)
}

// window.addEventListener('hashchange', ...) 와 document.addEventListener('DOMContentLoaded', ...) 도 이전과 동일