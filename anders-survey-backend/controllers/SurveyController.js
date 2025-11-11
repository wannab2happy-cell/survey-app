// controllers/surveyController.js
import Survey from "../models/Survey.js";
import Response from "../models/Response.js";

// ============================================================
// 1️⃣ 설문 생성 (POST /api/surveys)
// ============================================================
export async function createSurvey(req, res) {
  try {
    const { title, description, questions, personalInfo, branding, cover, ending, status, startAt, endAt } = req.body;

    // 필수 값 확인
    if (!title || !title.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "설문 제목은 필수 항목입니다." 
      });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "최소 하나 이상의 질문이 필요합니다." 
      });
    }

    // 질문 유효성 검증
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.content || !question.content.trim()) {
        return res.status(400).json({ 
          success: false,
          message: `질문 ${i + 1}번의 내용이 비어있습니다.` 
        });
      }
      
      if (!['TEXT', 'TEXTAREA', 'RADIO', 'CHECKBOX', 'DROPDOWN', 'STAR_RATING', 'SCALE'].includes(question.type)) {
        return res.status(400).json({ 
          success: false,
          message: `질문 ${i + 1}번의 유형이 올바르지 않습니다. (TEXT, TEXTAREA, RADIO, CHECKBOX, DROPDOWN, STAR_RATING, SCALE 중 하나여야 함, 현재: ${question.type})` 
        });
      }
      
      // RADIO, CHECKBOX, DROPDOWN, STAR_RATING, SCALE 타입인데 옵션이 없는 경우
      if (['RADIO', 'CHECKBOX', 'DROPDOWN', 'STAR_RATING', 'SCALE'].includes(question.type)) {
        if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
          return res.status(400).json({ 
            success: false,
            message: `질문 ${i + 1}번(${question.type} 타입)에는 최소 하나 이상의 옵션이 필요합니다.` 
          });
        }
      }
    }
    
    console.log('✅ 질문 유효성 검증 통과:', questions.length, '개 질문');

    // personalInfo 데이터 정규화 (customFields가 객체 배열인지 확인)
    let normalizedPersonalInfo = personalInfo || { enabled: false };
    if (normalizedPersonalInfo.enabled && normalizedPersonalInfo.customFields) {
      // customFields가 문자열로 직렬화된 경우 파싱
      if (typeof normalizedPersonalInfo.customFields === 'string') {
        try {
          normalizedPersonalInfo.customFields = JSON.parse(normalizedPersonalInfo.customFields);
        } catch (e) {
          console.warn('customFields 파싱 실패, 빈 배열로 설정:', e);
          normalizedPersonalInfo.customFields = [];
        }
      }
      // customFields가 배열인지 확인하고 각 항목이 객체인지 검증
      if (Array.isArray(normalizedPersonalInfo.customFields)) {
        normalizedPersonalInfo.customFields = normalizedPersonalInfo.customFields.map(field => {
          if (typeof field === 'string') {
            try {
              return JSON.parse(field);
            } catch (e) {
              return { id: Date.now(), label: field, type: 'text', required: false };
            }
          }
          return field;
        }).filter(field => field && typeof field === 'object');
      } else {
        normalizedPersonalInfo.customFields = [];
      }
    }

    // 새 설문 저장
    const newSurvey = new Survey({
      title: title.trim(),
      description: description?.trim() || "",
      questions,
      personalInfo: normalizedPersonalInfo,
      branding: branding || {},
      cover: cover || {},
      ending: ending || {},
      status: status || 'inactive',
      startAt: startAt || null,
      endAt: endAt || null,
    });

    const savedSurvey = await newSurvey.save();
    res.status(201).json({
      success: true,
      message: "설문이 성공적으로 생성되었습니다.",
      data: savedSurvey,
    });
  } catch (error) {
    console.error("❌ 설문 생성 오류:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: "입력 데이터가 유효하지 않습니다.",
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "서버 오류로 설문을 생성할 수 없습니다.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// ============================================================
// 2️⃣ 설문 목록 조회 (GET /api/surveys)
// ============================================================
export async function getSurveyList(req, res) {
  try {
    const surveys = await Survey.find({}, "title description status createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();
    
    res.status(200).json({
      success: true,
      count: surveys.length,
      data: surveys,
    });
  } catch (error) {
    console.error("❌ 설문 목록 조회 오류:", error);
    res.status(500).json({ 
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// ============================================================
// 3️⃣ 설문 상세 조회 (GET /api/surveys/:surveyId)
// ============================================================
export async function getSurveyDetails(req, res) {
  try {
    const { surveyId } = req.params;

    // MongoDB ObjectId 형식 검증
    if (!surveyId || !/^[0-9a-fA-F]{24}$/.test(surveyId)) {
      return res.status(400).json({ 
        success: false,
        message: "유효하지 않은 설문 ID입니다." 
      });
    }

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ 
        success: false,
        message: "설문을 찾을 수 없습니다." 
      });
    }
    
    res.status(200).json({
      success: true,
      data: survey,
    });
  } catch (error) {
    console.error("❌ 설문 상세 조회 오류:", error);
    res.status(500).json({ 
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// ============================================================
// 4️⃣ 설문 응답 제출 (POST /api/surveys/:surveyId/response)
// ============================================================
export async function submitSurveyResponse(req, res) {
  try {
    const { answers } = req.body;
    const { surveyId } = req.params;

    // 설문 존재 확인
    if (!surveyId || !/^[0-9a-fA-F]{24}$/.test(surveyId)) {
      return res.status(400).json({ 
        success: false,
        message: "유효하지 않은 설문 ID입니다." 
      });
    }

    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ 
        success: false,
        message: "설문을 찾을 수 없습니다." 
      });
    }

    // 답변 검증
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "답변 내용이 필요합니다." 
      });
    }

    // 답변과 질문 개수 일치 확인
    if (answers.length !== survey.questions.length) {
      return res.status(400).json({ 
        success: false,
        message: "모든 질문에 답변을 제공해야 합니다." 
      });
    }

    const newResponse = new Response({ 
      surveyId, 
      answers,
      submittedAt: new Date(),
    });
    await newResponse.save();

    res.status(201).json({
      success: true,
      message: "응답이 성공적으로 저장되었습니다.",
      data: {
        responseId: newResponse._id,
        submittedAt: newResponse.submittedAt,
      },
    });
  } catch (error) {
    console.error("❌ 설문 응답 저장 오류:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: "입력 데이터가 유효하지 않습니다.",
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// ============================================================
// 5️⃣ 설문 수정 (PUT /api/surveys/:surveyId)
// ============================================================
export async function updateSurvey(req, res) {
  try {
    const { surveyId } = req.params;
    const { title, description, questions, personalInfo, branding, cover, ending, status, startAt, endAt } = req.body;

    // MongoDB ObjectId 형식 검증
    if (!surveyId || !/^[0-9a-fA-F]{24}$/.test(surveyId)) {
      return res.status(400).json({ 
        success: false,
        message: "유효하지 않은 설문 ID입니다." 
      });
    }

    // 설문 존재 확인
    const existingSurvey = await Survey.findById(surveyId);
    if (!existingSurvey) {
      return res.status(404).json({ 
        success: false,
        message: "설문을 찾을 수 없습니다." 
      });
    }

    // 필수 값 확인
    if (!title || !title.trim()) {
      return res.status(400).json({ 
        success: false,
        message: "설문 제목은 필수 항목입니다." 
      });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "최소 하나 이상의 질문이 필요합니다." 
      });
    }

    // 질문 유효성 검증
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      
      if (!question.content || !question.content.trim()) {
        return res.status(400).json({ 
          success: false,
          message: `질문 ${i + 1}번의 내용이 비어있습니다.` 
        });
      }
      
      if (!['TEXT', 'TEXTAREA', 'RADIO', 'CHECKBOX', 'DROPDOWN', 'STAR_RATING', 'SCALE'].includes(question.type)) {
        return res.status(400).json({ 
          success: false,
          message: `질문 ${i + 1}번의 유형이 올바르지 않습니다. (TEXT, TEXTAREA, RADIO, CHECKBOX, DROPDOWN, STAR_RATING, SCALE 중 하나여야 함, 현재: ${question.type})` 
        });
      }
      
      // RADIO, CHECKBOX, DROPDOWN, STAR_RATING, SCALE 타입인데 옵션이 없는 경우
      if (['RADIO', 'CHECKBOX', 'DROPDOWN', 'STAR_RATING', 'SCALE'].includes(question.type)) {
        if (!question.options || !Array.isArray(question.options) || question.options.length === 0) {
          return res.status(400).json({ 
            success: false,
            message: `질문 ${i + 1}번(${question.type} 타입)에는 최소 하나 이상의 옵션이 필요합니다.` 
          });
        }
      }
    }

    // personalInfo 데이터 정규화 (customFields가 객체 배열인지 확인)
    let normalizedPersonalInfo = personalInfo || { enabled: false };
    if (normalizedPersonalInfo.enabled && normalizedPersonalInfo.customFields) {
      // customFields가 문자열로 직렬화된 경우 파싱
      if (typeof normalizedPersonalInfo.customFields === 'string') {
        try {
          normalizedPersonalInfo.customFields = JSON.parse(normalizedPersonalInfo.customFields);
        } catch (e) {
          console.warn('customFields 파싱 실패, 빈 배열로 설정:', e);
          normalizedPersonalInfo.customFields = [];
        }
      }
      // customFields가 배열인지 확인하고 각 항목이 객체인지 검증
      if (Array.isArray(normalizedPersonalInfo.customFields)) {
        normalizedPersonalInfo.customFields = normalizedPersonalInfo.customFields.map(field => {
          if (typeof field === 'string') {
            try {
              return JSON.parse(field);
            } catch (e) {
              return { id: Date.now(), label: field, type: 'text', required: false };
            }
          }
          return field;
        }).filter(field => field && typeof field === 'object');
      } else {
        normalizedPersonalInfo.customFields = [];
      }
    }

    // 설문 업데이트
    existingSurvey.title = title.trim();
    existingSurvey.description = description?.trim() || "";
    existingSurvey.questions = questions;
    existingSurvey.personalInfo = normalizedPersonalInfo;
    existingSurvey.branding = branding || {};
    existingSurvey.cover = cover || {};
    existingSurvey.ending = ending || {};
    existingSurvey.status = status || 'inactive';
    existingSurvey.startAt = startAt || null;
    existingSurvey.endAt = endAt || null;
    existingSurvey.updatedAt = new Date();

    const updatedSurvey = await existingSurvey.save();

    res.status(200).json({
      success: true,
      message: "설문이 성공적으로 수정되었습니다.",
      data: updatedSurvey,
    });
  } catch (error) {
    console.error("❌ 설문 수정 오류:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false,
        message: "입력 데이터가 유효하지 않습니다.",
        error: error.message 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "서버 오류로 설문을 수정할 수 없습니다.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// ============================================================
// 6️⃣ 설문 결과 조회 (GET /api/surveys/:surveyId/results)
// ============================================================
export async function getSurveyResults(req, res) {
  try {
    const { surveyId } = req.params;

    // 설문 ID 검증
    if (!surveyId || !/^[0-9a-fA-F]{24}$/.test(surveyId)) {
      return res.status(400).json({ 
        success: false,
        message: "유효하지 않은 설문 ID입니다." 
      });
    }

    // 설문 존재 확인
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ 
        success: false,
        message: "설문을 찾을 수 없습니다." 
      });
    }

    const responses = await Response.find({ surveyId })
      .sort({ submittedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        surveyId,
        surveyTitle: survey.title,
        totalResponses: responses.length,
        results: responses.map((r) => ({
          id: r._id,
          answers: r.answers,
          submittedAt: r.submittedAt,
        })),
      },
    });
  } catch (error) {
    console.error("❌ 설문 결과 조회 오류:", error);
    res.status(500).json({ 
      success: false,
      message: "서버 오류가 발생했습니다.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

// ============================================================
// 6️⃣ 설문 삭제 (DELETE /api/surveys/:surveyId)
// ============================================================
export async function deleteSurvey(req, res) {
  try {
    const { surveyId } = req.params;

    // MongoDB ObjectId 형식 검증
    if (!surveyId || !/^[0-9a-fA-F]{24}$/.test(surveyId)) {
      return res.status(400).json({ 
        success: false,
        message: "유효하지 않은 설문 ID입니다." 
      });
    }

    // 설문 존재 확인
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ 
        success: false,
        message: "설문을 찾을 수 없습니다." 
      });
    }

    // 설문 삭제 (관련 응답도 함께 삭제됨 - CASCADE)
    await Survey.findByIdAndDelete(surveyId);
    await Response.deleteMany({ surveyId });

    res.status(200).json({
      success: true,
      message: "설문이 성공적으로 삭제되었습니다.",
    });
  } catch (error) {
    console.error("❌ 설문 삭제 오류:", error);
    res.status(500).json({ 
      success: false,
      message: "서버 오류로 설문을 삭제할 수 없습니다.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
