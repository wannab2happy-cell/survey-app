import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function SurveyBuilder() {
  const navigate = useNavigate();

  // 설문 기본 정보
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // 질문 목록
  const [questions, setQuestions] = useState([]);

  // 단일 질문 추가
  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      content: "",
      type: "TEXT",
      options: [],
      order: questions.length + 1,
    };
    setQuestions([...questions, newQuestion]);
  };

  // 질문 삭제
  const deleteQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  // 질문 내용 변경
  const updateQuestion = (id, key, value) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [key]: value } : q))
    );
  };

  // 객관식 옵션 추가
  const addOption = (id) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, options: [...q.options, ""] } : q
      )
    );
  };

  // 옵션 내용 변경
  const updateOption = (qId, index, value) => {
    setQuestions(
      questions.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((opt, i) =>
                i === index ? value : opt
              ),
            }
          : q
      )
    );
  };

  // 옵션 삭제
  const deleteOption = (qId, index) => {
    setQuestions(
      questions.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.filter((_, i) => i !== index),
            }
          : q
      )
    );
  };

  // 설문 저장 (POST /api/surveys)
  const handleSave = async () => {
    if (!title.trim()) return alert("설문 제목을 입력하세요.");

    try {
      const token = localStorage.getItem("token");
      const payload = {
        title,
        description,
        questions: questions.map((q) => ({
          content: q.content,
          type: q.type,
          options: q.options.filter((opt) => opt.trim() !== ""),
          order: q.order,
        })),
      };

      const res = await axiosInstance.post("/surveys", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("설문이 성공적으로 저장되었습니다!");
      console.log("Survey created:", res.data);
      navigate("/admin/list");
    } catch (error) {
      console.error("설문 저장 오류:", error);
      alert("서버 오류로 설문 저장에 실패했습니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        {/* 제목 및 설명 */}
        <h1 className="text-2xl font-bold mb-6">새 설문 만들기</h1>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            설문 제목
          </label>
          <input
            type="text"
            className="border rounded w-full p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 행사 만족도 조사"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            설문 설명
          </label>
          <textarea
            className="border rounded w-full p-2 h-20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="이 설문에 대한 간단한 설명을 입력하세요."
          />
        </div>

        {/* 질문 섹션 */}
        <h2 className="text-lg font-semibold mb-2">질문 목록</h2>

        {questions.length === 0 && (
          <p className="text-gray-500 mb-4">아직 추가된 질문이 없습니다.</p>
        )}

        {questions.map((q) => (
          <div
            key={q.id}
            className="border rounded p-4 mb-4 bg-gray-50 relative"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                질문 {q.order}
              </span>
              <button
                onClick={() => deleteQuestion(q.id)}
                className="text-red-500 text-sm hover:underline"
              >
                삭제
              </button>
            </div>

            <input
              type="text"
              className="border rounded w-full p-2 mb-2"
              value={q.content}
              onChange={(e) => updateQuestion(q.id, "content", e.target.value)}
              placeholder="질문 내용을 입력하세요"
            />

            <div className="flex items-center mb-2">
              <label className="text-sm text-gray-600 mr-2">유형:</label>
              <select
                className="border rounded p-1"
                value={q.type}
                onChange={(e) => updateQuestion(q.id, "type", e.target.value)}
              >
                <option value="TEXT">주관식</option>
                <option value="RADIO">객관식(단일 선택)</option>
                <option value="CHECKBOX">객관식(복수 선택)</option>
              </select>
            </div>

            {/* 객관식 옵션 */}
            {["RADIO", "CHECKBOX"].includes(q.type) && (
              <div className="ml-2 mt-2">
                <p className="text-sm text-gray-700 mb-1">옵션 목록</p>
                {q.options.map((opt, i) => (
                  <div key={i} className="flex items-center mb-1">
                    <input
                      type="text"
                      className="border rounded p-1 w-full"
                      value={opt}
                      onChange={(e) =>
                        updateOption(q.id, i, e.target.value)
                      }
                      placeholder={`옵션 ${i + 1}`}
                    />
                    <button
                      onClick={() => deleteOption(q.id, i)}
                      className="ml-2 text-red-500 text-xs hover:underline"
                    >
                      삭제
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => addOption(q.id)}
                  className="text-blue-600 text-sm mt-1 hover:underline"
                >
                  + 옵션 추가
                </button>
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-between mt-6">
          <button
            onClick={addQuestion}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            + 질문 추가
          </button>

          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            설문 저장
          </button>
        </div>
      </div>
    </div>
  );
}
