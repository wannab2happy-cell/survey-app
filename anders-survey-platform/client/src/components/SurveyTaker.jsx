import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance.js";

// 개별 질문 렌더링 컴포넌트
const QuestionDisplay = ({ question, userAnswers, onAnswerChange }) => {
  const isText = question.type === "text";
  const isSingle = question.type === "single_choice";
  const currentAnswer = userAnswers[question._id] || (isSingle ? "" : []);

  const handleChange = (e) => {
    let newValue;
    if (isText) {
      newValue = e.target.value;
    } else if (isSingle) {
      newValue = e.target.value;
    } else {
      const optionValue = e.target.value;
      const isChecked = e.target.checked;
      newValue = isChecked
        ? [...currentAnswer, optionValue]
        : currentAnswer.filter((v) => v !== optionValue);
    }
    onAnswerChange(question._id, newValue);
  };

  return (
    <div className="p-4 border rounded-xl shadow-soft mb-4 bg-white">
      <h4 className="font-semibold mb-2">{question.text}</h4>

      {isText ? (
        <textarea
          className="w-full border rounded p-2"
          placeholder="응답을 입력하세요..."
          value={currentAnswer}
          onChange={handleChange}
        />
      ) : (
        (question.options || []).map((opt, i) => (
          <label key={i} className="block mb-1">
            <input
              type={isSingle ? "radio" : "checkbox"}
              name={`q_${question._id}`}
              value={opt}
              checked={
                isSingle
                  ? currentAnswer === opt
                  : currentAnswer.includes(opt)
              }
              onChange={handleChange}
              className="mr-2"
            />
            {opt}
          </label>
        ))
      )}
    </div>
  );
};

const SurveyTaker = () => {
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 응답 저장
  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  // 1️⃣ 설문 불러오기
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const { data } = await axiosInstance.get("/surveys");
        if (!data || data.length === 0) {
          throw new Error("설문 데이터를 찾을 수 없습니다.");
        }
        setSurvey(data[0]); // 첫 번째 설문 사용
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, []);

  // 2️⃣ 응답 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!survey) return;

    const formattedAnswers = Object.entries(userAnswers).map(
      ([questionId, answer]) => ({
        questionId,
        answer,
      })
    );

    try {
      setLoading(true);
      await axiosInstance.post(`/surveys/${survey._id}/response`, {
        answers: formattedAnswers,
      });
      setIsSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "응답 제출 실패");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4 text-center">로딩 중...</div>;
  if (error) return <div className="p-4 text-red-500">오류: {error}</div>;
  if (isSubmitted)
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold mb-2">응답 완료 ✅</h2>
        <p>설문에 참여해 주셔서 감사합니다.</p>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto mt-6 p-6 bg-gray-50 rounded-2xl">
      <h1 className="text-2xl font-bold mb-2">{survey.title}</h1>
      <p className="text-gray-600 mb-4">{survey.description}</p>

      <form onSubmit={handleSubmit}>
        {survey.questions.map((q) => (
          <QuestionDisplay
            key={q._id}
            question={q}
            userAnswers={userAnswers}
            onAnswerChange={handleAnswerChange}
          />
        ))}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white p-3 rounded-xl mt-4"
          disabled={loading}
        >
          {loading ? "제출 중..." : "응답 제출하기"}
        </button>
      </form>
    </div>
  );
};

export default SurveyTaker;
