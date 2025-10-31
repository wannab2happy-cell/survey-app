export default function SurveyBuilder() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">✍️ 설문 생성 및 문항 관리</h2>

      <div className="card space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">설문 제목</label>
          <input
            type="text"
            defaultValue="2025 현장 만족도 조사"
            className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">설문 설명</label>
          <textarea
            rows="3"
            defaultValue="참여자에게 표시되는 간단한 설명 문구입니다."
            className="w-full border rounded-lg p-2 focus:ring focus:ring-blue-200"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">실행 일정</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="datetime-local" className="border rounded-lg p-2" />
            <input type="datetime-local" className="border rounded-lg p-2" />
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button className="px-5 py-2 bg-gray-200 rounded-lg font-medium text-gray-700 hover:bg-gray-300">
            임시 저장
          </button>
          <button className="btn-primary">✅ 설문 저장 및 배포</button>
        </div>
      </div>
    </div>
  );
}
