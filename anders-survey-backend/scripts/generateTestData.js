// 테스트 데이터 생성 스크립트
// 다양한 설문과 응답 데이터를 생성합니다.

import mongoose from 'mongoose';
import Survey from '../models/Survey.js';
import Response from '../models/Response.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// 한국 이름 생성기
const koreanNames = [
  '김민수', '이영희', '박준호', '최수진', '정태영', '강미영', '조성민', '윤서연',
  '장현우', '임지은', '한동현', '오하늘', '신예진', '류민준', '배수아', '황지훈',
  '서연우', '홍준기', '권민규', '김용훈', '문성빈', '김도한', '최길재', '이준서',
  '이호준', '정경호', '이동욱', '정민기', '이영호', '김범규'
];

// 한국 대학교/회사명
const organizations = [
  '부산대학교', '한국해양대학교', '부경대학교', '금강공업(주)', '범한메카텍',
  '서울대학교', '연세대학교', '고려대학교', '한양대학교', '성균관대학교',
  'LG전자', '삼성전자', '현대중공업', '대우조선해양', 'STX조선해양',
  '한국조선해양', '한진중공업', '삼성중공업', '한화오션', 'GS건설'
];

// 전공/부서명
const departments = [
  '조선해양공학과', '냉동공조공학전공', '기계시스템공학전공', '철강영업팀', '설계팀',
  '기계공학과', '전기공학과', '컴퓨터공학과', '산업공학과', '화학공학과',
  '영업팀', '기획팀', '연구개발팀', '생산관리팀', '품질관리팀'
];

// 직무명
const jobs = [
  '기본설계', '의장설계', '시운전', '설계', 'R&D, 기본설계', '생산관리',
  '시스템 엔지니어', '프로젝트 매니저', '연구원', '개발자', '디자이너',
  '영업사원', '마케터', '컨설턴트', '품질관리', '안전관리'
];

// 이메일 생성
const generateEmail = (name) => {
  const domains = ['naver.com', 'gmail.com', 'daum.net', 'hanmail.net'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const randomNum = Math.floor(Math.random() * 10000);
  return `${name.toLowerCase().replace(/[가-힣]/g, '')}${randomNum}@${domain}`;
};

// 전화번호 생성
const generatePhone = () => {
  const first = Math.floor(Math.random() * 9000) + 1000;
  const second = Math.floor(Math.random() * 9000) + 1000;
  return `+82 10 ${first} ${second}`;
};

// 랜덤 날짜 생성 (과거 N일 전)
const randomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
};

// 설문 데이터 생성
const createSurveys = async () => {
  const surveys = [];

  // 1. 직무 만족도 조사
  const survey1 = await Survey.create({
    title: '2025 KORMARINE 직무 만족도 조사',
    description: '조선해양 산업 종사자들의 직무 만족도를 조사합니다.',
    status: 'active',
    questions: [
      {
        content: '성함을 입력해주세요.',
        type: 'TEXT',
        options: [],
        order: 0,
        required: true
      },
      {
        content: '성별을 선택해주세요.',
        type: 'RADIO',
        options: ['남', '여'],
        order: 1,
        required: true
      },
      {
        content: '휴대폰 번호를 입력해주세요.',
        type: 'TEXT',
        options: [],
        order: 2,
        required: true
      },
      {
        content: '이메일 주소를 입력해주세요.',
        type: 'TEXT',
        options: [],
        order: 3,
        required: true
      },
      {
        content: "'학교명 or 소속회사'를 입력해주세요.",
        type: 'TEXT',
        options: [],
        order: 4,
        required: false
      },
      {
        content: "'전공명 or 소속부서'를 입력해주세요.",
        type: 'TEXT',
        options: [],
        order: 5,
        required: false
      },
      {
        content: '관심 직무를 입력해주세요.',
        type: 'TEXT',
        options: [],
        order: 6,
        required: false
      },
      {
        content: '현재 직무에 대한 만족도를 평가해주세요.',
        type: 'STAR_RATING',
        options: ['1', '2', '3', '4', '5'],
        order: 7,
        required: true
      },
      {
        content: '회사 복지에 대한 만족도를 평가해주세요.',
        type: 'SCALE',
        options: ['매우 불만족', '불만족', '보통', '만족', '매우 만족'],
        order: 8,
        required: true
      }
    ],
    personalInfo: {
      enabled: true,
      fields: ['name', 'phone', 'email'],
      consentText: '[개인정보 수집·이용 안내] 1. 목적: 행사 참가자 관리, 일정/채용연계 안내 2. 항목: 이름, 성별, 전화번호, 이메일, 소속(회사/학교), 전공/부서 3. 보유기간: 행사 종료 후 1년',
      consentRequired: true,
      customFields: []
    },
    branding: {
      primaryColor: '#4F46E5',
      secondaryColor: '#00A3FF',
      tertiaryColor: '#22C55E'
    },
    cover: {
      title: '2025 KORMARINE 직무 만족도 조사',
      description: '귀하의 소중한 의견을 들려주세요.',
      imageBase64: ''
    },
    ending: {
      title: '설문이 완료되었습니다!',
      description: '귀하의 소중한 의견에 감사드립니다.',
      imageBase64: ''
    },
    startAt: randomDate(30),
    endAt: null
  });
  surveys.push(survey1);

  // 2. 호텔 만족도 조사
  const survey2 = await Survey.create({
    title: '호텔 만족도 조사 템플릿',
    description: '호텔 이용 고객 만족도를 조사합니다.',
    status: 'active',
    questions: [
      {
        content: '성함을 입력해주세요.',
        type: 'TEXT',
        options: [],
        order: 0,
        required: true
      },
      {
        content: '호텔 시설에 대한 만족도를 평가해주세요.',
        type: 'STAR_RATING',
        options: ['1', '2', '3', '4', '5'],
        order: 1,
        required: true
      },
      {
        content: '서비스 품질에 대한 만족도를 평가해주세요.',
        type: 'STAR_RATING',
        options: ['1', '2', '3', '4', '5'],
        order: 2,
        required: true
      },
      {
        content: '가격에 대한 만족도를 평가해주세요.',
        type: 'RADIO',
        options: ['매우 비쌈', '비쌈', '적당함', '저렴함', '매우 저렴함'],
        order: 3,
        required: true
      },
      {
        content: '추천하고 싶은 점을 선택해주세요. (복수 선택 가능)',
        type: 'CHECKBOX',
        options: ['시설', '서비스', '위치', '가격', '식당', '기타'],
        order: 4,
        required: false
      },
      {
        content: '개선이 필요한 점을 자유롭게 작성해주세요.',
        type: 'TEXTAREA',
        options: [],
        order: 5,
        required: false
      }
    ],
    personalInfo: {
      enabled: false
    },
    branding: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#EC4899',
      tertiaryColor: '#F59E0B'
    },
    cover: {
      title: '호텔 만족도 조사',
      description: '고객 여러분의 소중한 의견을 들려주세요.',
      imageBase64: ''
    },
    ending: {
      title: '설문 완료',
      description: '참여해주셔서 감사합니다.',
      imageBase64: ''
    },
    startAt: randomDate(20),
    endAt: null
  });
  surveys.push(survey2);

  // 3. 제품 사용 후기 조사
  const survey3 = await Survey.create({
    title: '제품 사용 후기 조사',
    description: '구매하신 제품에 대한 후기를 남겨주세요.',
    status: 'active',
    questions: [
      {
        content: '제품명을 입력해주세요.',
        type: 'TEXT',
        options: [],
        order: 0,
        required: true
      },
      {
        content: '제품 만족도를 평가해주세요.',
        type: 'STAR_RATING',
        options: ['1', '2', '3', '4', '5'],
        order: 1,
        required: true
      },
      {
        content: '제품의 장점을 선택해주세요. (복수 선택 가능)',
        type: 'CHECKBOX',
        options: ['디자인', '성능', '가격', '내구성', '사용 편의성', '기타'],
        order: 2,
        required: false
      },
      {
        content: '제품 카테고리를 선택해주세요.',
        type: 'DROPDOWN',
        options: ['전자제품', '의류', '식품', '화장품', '도서', '기타'],
        order: 3,
        required: true
      },
      {
        content: '제품 사용 후기를 자유롭게 작성해주세요.',
        type: 'TEXTAREA',
        options: [],
        order: 4,
        required: false
      }
    ],
    personalInfo: {
      enabled: false
    },
    branding: {
      primaryColor: '#10B981',
      secondaryColor: '#3B82F6',
      tertiaryColor: '#F59E0B'
    },
    cover: {
      title: '제품 사용 후기',
      description: '구매하신 제품에 대한 후기를 남겨주세요.',
      imageBase64: ''
    },
    ending: {
      title: '후기 작성 완료',
      description: '소중한 후기 감사합니다.',
      imageBase64: ''
    },
    startAt: randomDate(15),
    endAt: null
  });
  surveys.push(survey3);

  // 4. 이벤트 참가자 설문
  const survey4 = await Survey.create({
    title: '이벤트 참가자 설문',
    description: '이벤트 참가자들의 의견을 수집합니다.',
    status: 'active',
    questions: [
      {
        content: '성함을 입력해주세요.',
        type: 'TEXT',
        options: [],
        order: 0,
        required: true
      },
      {
        content: '이벤트 만족도를 평가해주세요.',
        type: 'SCALE',
        options: ['매우 불만족', '불만족', '보통', '만족', '매우 만족'],
        order: 1,
        required: true
      },
      {
        content: '다음 이벤트 참가 의향이 있으신가요?',
        type: 'RADIO',
        options: ['매우 참가하고 싶음', '참가하고 싶음', '보통', '참가하지 않을 것 같음', '참가하지 않음'],
        order: 2,
        required: true
      },
      {
        content: '이벤트에서 좋았던 점을 선택해주세요. (복수 선택 가능)',
        type: 'CHECKBOX',
        options: ['콘텐츠', '진행', '네트워킹', '식사', '기념품', '기타'],
        order: 3,
        required: false
      },
      {
        content: '개선 사항을 자유롭게 작성해주세요.',
        type: 'TEXTAREA',
        options: [],
        order: 4,
        required: false
      }
    ],
    personalInfo: {
      enabled: true,
      fields: ['name', 'email'],
      consentText: '이벤트 관련 정보를 이메일로 받으시겠습니까?',
      consentRequired: false,
      customFields: []
    },
    branding: {
      primaryColor: '#EF4444',
      secondaryColor: '#F59E0B',
      tertiaryColor: '#10B981'
    },
    cover: {
      title: '이벤트 참가자 설문',
      description: '이벤트 참가자 여러분의 소중한 의견을 들려주세요.',
      imageBase64: ''
    },
    ending: {
      title: '설문 완료',
      description: '참여해주셔서 감사합니다.',
      imageBase64: ''
    },
    startAt: randomDate(10),
    endAt: null
  });
  surveys.push(survey4);

  // 5. 고객 서비스 만족도 조사
  const survey5 = await Survey.create({
    title: '고객 서비스 만족도 조사',
    description: '고객 서비스 품질을 평가해주세요.',
    status: 'active',
    questions: [
      {
        content: '서비스 이용 목적을 선택해주세요.',
        type: 'DROPDOWN',
        options: ['상담', '문의', '불만', '칭찬', '기타'],
        order: 0,
        required: true
      },
      {
        content: '서비스 응대 속도에 만족하시나요?',
        type: 'RADIO',
        options: ['매우 만족', '만족', '보통', '불만족', '매우 불만족'],
        order: 1,
        required: true
      },
      {
        content: '직원의 친절도를 평가해주세요.',
        type: 'STAR_RATING',
        options: ['1', '2', '3', '4', '5'],
        order: 2,
        required: true
      },
      {
        content: '문제 해결 정도를 평가해주세요.',
        type: 'SCALE',
        options: ['매우 불만족', '불만족', '보통', '만족', '매우 만족'],
        order: 3,
        required: true
      },
      {
        content: '추가 의견을 자유롭게 작성해주세요.',
        type: 'TEXTAREA',
        options: [],
        order: 4,
        required: false
      }
    ],
    personalInfo: {
      enabled: false
    },
    branding: {
      primaryColor: '#6366F1',
      secondaryColor: '#8B5CF6',
      tertiaryColor: '#EC4899'
    },
    cover: {
      title: '고객 서비스 만족도 조사',
      description: '고객 여러분의 소중한 의견을 들려주세요.',
      imageBase64: ''
    },
    ending: {
      title: '설문 완료',
      description: '참여해주셔서 감사합니다.',
      imageBase64: ''
    },
    startAt: randomDate(5),
    endAt: null
  });
  surveys.push(survey5);

  console.log(`✅ ${surveys.length}개의 설문이 생성되었습니다.`);
  return surveys;
};

// 응답 데이터 생성
const createResponses = async (surveys) => {
  let totalResponses = 0;

  for (const survey of surveys) {
    const responseCount = Math.floor(Math.random() * 50) + 20; // 20-70개 응답
    const responses = [];

    for (let i = 0; i < responseCount; i++) {
      const answers = [];
      // 최근 7일 내 랜덤 날짜 생성
      const submittedAt = randomDate(Math.floor(Math.random() * 7));

      // 각 질문에 대한 답변 생성
      for (const question of survey.questions) {
        let answerValue;

        switch (question.type) {
          case 'TEXT':
            if (question.content.includes('성함')) {
              answerValue = koreanNames[Math.floor(Math.random() * koreanNames.length)];
            } else if (question.content.includes('이메일')) {
              answerValue = generateEmail(koreanNames[Math.floor(Math.random() * koreanNames.length)]);
            } else if (question.content.includes('전화번호') || question.content.includes('휴대폰')) {
              answerValue = generatePhone();
            } else if (question.content.includes('학교명') || question.content.includes('소속회사')) {
              answerValue = organizations[Math.floor(Math.random() * organizations.length)];
            } else if (question.content.includes('전공명') || question.content.includes('소속부서')) {
              answerValue = departments[Math.floor(Math.random() * departments.length)];
            } else if (question.content.includes('직무')) {
              answerValue = jobs[Math.floor(Math.random() * jobs.length)];
            } else {
              answerValue = `답변 ${i + 1}`;
            }
            break;

          case 'TEXTAREA':
            answerValue = `상세 답변 내용입니다. 이벤트에 대해 많은 것을 배울 수 있었습니다. 다음에도 참가하고 싶습니다.`;
            break;

          case 'RADIO':
            answerValue = question.options[Math.floor(Math.random() * question.options.length)];
            break;

          case 'CHECKBOX':
            const selectedCount = Math.floor(Math.random() * question.options.length) + 1;
            const selectedOptions = [];
            const shuffled = [...question.options].sort(() => 0.5 - Math.random());
            for (let j = 0; j < selectedCount && j < shuffled.length; j++) {
              selectedOptions.push(shuffled[j]);
            }
            answerValue = selectedOptions;
            break;

          case 'DROPDOWN':
            answerValue = question.options[Math.floor(Math.random() * question.options.length)];
            break;

          case 'STAR_RATING':
            // 5점 만점에 평균 4점 정도로 약간 긍정적으로
            const rating = Math.random() < 0.7 
              ? Math.floor(Math.random() * 2) + 4 // 4-5점
              : Math.floor(Math.random() * 3) + 1; // 1-3점
            answerValue = rating.toString();
            break;

          case 'SCALE':
            // 긍정적인 응답이 조금 더 많도록
            const scaleIndex = Math.random() < 0.6
              ? Math.floor(Math.random() * 2) + 3 // 3-4 (만족, 매우 만족)
              : Math.floor(Math.random() * 5); // 0-4 (전체)
            answerValue = question.options[scaleIndex];
            break;

          default:
            answerValue = '기본 답변';
        }

        answers.push({
          questionId: question._id,
          value: answerValue
        });
      }

      // Response 생성 (startedAt은 모델에 없으므로 제외)
      const response = await Response.create({
        surveyId: survey._id,
        answers: answers,
        submittedAt: submittedAt
      });

      responses.push(response);
      totalResponses++;
    }

    console.log(`✅ 설문 "${survey.title}"에 ${responses.length}개의 응답이 생성되었습니다.`);
  }

  console.log(`✅ 총 ${totalResponses}개의 응답이 생성되었습니다.`);
};

// 메인 실행 함수
const main = async () => {
  try {
    // MongoDB 연결
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/survey-app';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB 연결 성공');

    // 기존 데이터 삭제 (선택사항)
    const shouldDelete = process.argv.includes('--delete');
    if (shouldDelete) {
      console.log('⚠️ 기존 데이터를 삭제합니다...');
      await Survey.deleteMany({});
      await Response.deleteMany({});
      console.log('✅ 기존 데이터 삭제 완료');
    }

    // 설문 생성
    console.log('📝 설문 데이터를 생성합니다...');
    const surveys = await createSurveys();

    // 응답 데이터 생성
    console.log('📝 응답 데이터를 생성합니다...');
    await createResponses(surveys);

    console.log('\n✅ 테스트 데이터 생성이 완료되었습니다!');
    console.log(`\n생성된 설문 목록:`);
    surveys.forEach((survey, index) => {
      console.log(`${index + 1}. ${survey.title} (ID: ${survey._id})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
};

// 스크립트 실행
main();

