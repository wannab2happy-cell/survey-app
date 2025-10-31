// src/models/index.js

import Sequelize from 'sequelize';
import fs from 'fs'; 
import path from 'path'; 
import { fileURLToPath } from 'url';
import dotenv from 'dotenv'; // ✅ .env 파일 로드를 위해 dotenv import

// .env 파일 로드 (src/app.js에서 이미 로드되었다고 가정하나, 안전을 위해 여기서도 실행)
dotenv.config();

// --- 모델 Import ---
import Survey from './Survey.js';
import Question from './Question.js';
import Response from './Response.js';
import Answer from './Answer.js';
import BrandingSetting from './brandingSetting.js'; // ✅ 새로 추가된 모델

// 현재 파일의 디렉토리 경로를 구합니다 (ESM 환경)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 설정 파일 경로: config.json을 읽기 위한 경로 설정
// ✅ 올바른 경로: src/models에서 '..'로 src로 이동 후, 'config' 폴더 지정
const configPath = path.join(__dirname, '..', 'config', 'config.json');

// config.json 파일 읽기 (CLI 호환성 및 환경 변수 이름 확인용)
const configData = fs.readFileSync(configPath, 'utf8');
const configImport = JSON.parse(configData);

const env = process.env.NODE_ENV || 'development';
const config = configImport[env];
const db = {};

// ------------------------------------------------------------------
// ✅ .env 환경 변수를 사용하여 DB 연결을 설정합니다. (보안 강화)
// ------------------------------------------------------------------
// process.env 값이 있으면 사용하고, 없으면 config.json의 값을 사용합니다.
const database = process.env.DB_NAME || config.database;
const username = process.env.DB_USERNAME || config.username;
const password = process.env.DB_PASSWORD || config.password;
const host = process.env.DB_HOST || config.host;
const dialect = process.env.DB_DIALECT || config.dialect;

let sequelize = new Sequelize(database, username, password, {
    host: host,
    dialect: dialect,
    // 로깅, 풀링 등 필요한 옵션을 여기에 추가할 수 있습니다.
});

// ------------------------------------------------------------------
// ✅ 모델 초기화 및 연결
// ------------------------------------------------------------------
db.Survey = Survey(sequelize, Sequelize.DataTypes);
db.Question = Question(sequelize, Sequelize.DataTypes);
db.Response = Response(sequelize, Sequelize.DataTypes);
db.Answer = Answer(sequelize, Sequelize.DataTypes);
db.BrandingSetting = BrandingSetting(sequelize, Sequelize.DataTypes); // ✅ BrandingSetting 모델 연결

// 모델 관계 설정 (associate)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// ✅ ESM default export로 내보냅니다.
export default db;