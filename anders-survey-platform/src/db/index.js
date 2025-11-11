import { Sequelize, DataTypes } from 'sequelize';

// 데이터베이스 연결 설정
// 개발 환경에서는 간단히 SQLite를 사용합니다. 파일은 프로젝트 루트에 'database.sqlite'로 생성되거나 사용됩니다.
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite', // <- 여기를 'database.sqlite'로 변경
    logging: false // Sequelize 쿼리 로그를 보지 않도록 설정
});

// 1. Survey 모델 정의
const Survey = sequelize.define('Survey', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'Surveys'
});

// 2. Question 모델 정의
const Question = sequelize.define('Question', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    surveyId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
    type: { // RADIO, TEXT
        type: DataTypes.STRING,
        allowNull: false
    },
    options: { // RADIO의 경우 JSON 문자열로 저장
        type: DataTypes.TEXT
    },
    order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'Questions'
});

// 3. Response 모델 정의
const Response = sequelize.define('Response', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    surveyId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER, // 실제 환경에서는 UUID를 사용하지만, 테스트를 위해 INTEGER 사용
        allowNull: false
    },
    submittedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
}, {
    tableName: 'Responses'
});

// 4. Answer 모델 정의
const Answer = sequelize.define('Answer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    responseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    questionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    value: { // 답변 값 (RADIO 선택지 또는 TEXT 입력)
        type: DataTypes.TEXT,
        allowNull: false
    }
}, {
    tableName: 'Answers'
});

// 관계 설정 (Associations)
// 1:N 관계: Survey (1) <-> Question (N)
Survey.hasMany(Question, { foreignKey: 'surveyId', onDelete: 'CASCADE' });
Question.belongsTo(Survey, { foreignKey: 'surveyId' });

// 1:N 관계: Response (1) <-> Answer (N)
Response.hasMany(Answer, { foreignKey: 'responseId', onDelete: 'CASCADE' });
Answer.belongsTo(Response, { foreignKey: 'responseId' });

// 1:N 관계: Survey (1) <-> Response (N)
Survey.hasMany(Response, { foreignKey: 'surveyId', onDelete: 'CASCADE' });
Response.belongsTo(Survey, { foreignKey: 'surveyId' });

// 초기 데이터 시딩 함수
const seedDatabase = async () => {
    // 설문이 이미 존재하면 시딩하지 않음 (이전에 테스트 데이터를 넣었을 수 있으므로)
    // survey_db.sqlite 파일이 존재하지 않는 경우에만 실행됩니다.
    
    // 이전에 테스트를 위해 생성된 설문 데이터가 없다면, 새로 생성합니다.
    const existingSurvey = await Survey.findByPk(1);
    
    if (existingSurvey) {
        console.log('✅ Initial survey data already exists. Skipping seeding.');
        return;
    }

    // 1. 설문 생성
    const survey = await Survey.create({
        title: '고객 서비스 만족도 조사 (Live Test)',
        description: '저희 서비스 개선을 위해 소중한 의견을 들려주세요.'
    });

    // 2. 질문 생성
    const question1 = await Question.create({
        surveyId: survey.id,
        content: '가장 선호하는 기능은 무엇인가요?',
        type: 'RADIO',
        options: JSON.stringify([
            'A. 빠른 응답 속도', 
            'B. 편리한 UI/UX', 
            'C. 다양한 커스터마이징'
        ]),
        order: 1
    });

    const question2 = await Question.create({
        surveyId: survey.id,
        content: '서비스 개선을 위한 의견을 자유롭게 적어주세요.',
        type: 'TEXT',
        options: null,
        order: 2
    });

    // 3. 테스트 응답 데이터 생성 (총 3건)
    // 응답 1 (A 선택)
    const res1 = await Response.create({ surveyId: survey.id, userId: 101 });
    await Answer.create({ responseId: res1.id, questionId: question1.id, value: 'A. 빠른 응답 속도' });
    await Answer.create({ responseId: res1.id, questionId: question2.id, value: '주관식 답변 테스트 1: 편리한 기능에 만족합니다.' });

    // 응답 2 (A 선택)
    const res2 = await Response.create({ surveyId: survey.id, userId: 102 });
    await Answer.create({ responseId: res2.id, questionId: question1.id, value: 'A. 빠른 응답 속도' });
    await Answer.create({ responseId: res2.id, questionId: question2.id, value: '주관식 답변 테스트 2: 데이터 집계 속도가 빠르네요.' });

    // 응답 3 (B 선택)
    const res3 = await Response.create({ surveyId: survey.id, userId: 103 });
    await Answer.create({ responseId: res3.id, questionId: question1.id, value: 'B. 편리한 UI/UX' });
    await Answer.create({ responseId: res3.id, questionId: question2.id, value: '주관식 답변 테스트 3: 기능 추가를 기대합니다.' });

    console.log('✅ Database seeded successfully with initial test data.');
};

// 데이터베이스 초기화 및 시딩
const initDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection has been established successfully.');
        
        // 모델 동기화 (테이블 생성)
        // force: true로 설정하면 서버 재시작 시 기존 테이블을 삭제하고 새로 만듭니다.
        // 현재는 false로 설정하여 기존 데이터를 보존합니다.
        await sequelize.sync({ force: false }); 
        
        // 초기 데이터 삽입
        await seedDatabase();

    } catch (error) {
        console.error('❌ Unable to connect to the database or sync models:', error);
    }
};

// 서버 시작 시 데이터베이스 초기화 실행
initDatabase();

// 컨트롤러에서 사용할 모델들을 내보냄 (import db from '../db/index.js' 형식에 맞춤)
export default {
    sequelize,
    Survey,
    Question,
    Response,
    Answer
};
