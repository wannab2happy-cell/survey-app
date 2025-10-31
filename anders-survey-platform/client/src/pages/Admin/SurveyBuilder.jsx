export default function SurveyBuilder() {
  return (
    <div className="p-6 bg-white rounded-xl shadow space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">✍️ 설문 생성 및 문항 관리</h2>

      <div className="flex gap-4">
        {/* 문항 팔레트 */}
        <div className="w-1/3 bg-gray-50 p-4 rounded-lg border space-y-3">
          <h3 className="font-bold border-b pb-2">문항 팔레트</h3>
          <div className="cursor-pointer p-2 border rounded hover:bg-gray-100">📻 단일 선택</div>
          <div className="cursor-pointer p-2 border rounded hover:bg-gray-100">☑️ 복수 선택</div>
          <div className="cursor-pointer p-2 border rounded hover:bg-gray-100">✏️ 주관식</div>
        </div>

        {/* 설문 작성 영역 */}
        <div className="flex-1 bg-white border rounded-lg p-4 space-y-4">
          <input
            type="text"
            defaultValue="2025년 행사 만족도 조사"
            className="text-xl font-bold border-b w-full pb-1 focus:outline-none"
          />
          <textarea
            className="w-full border p-2 rounded text-gray-600 focus:outline-none"
            rows="3"
            defaultValue="이 설문은 행사 참가자 피드백 수집을 위해 제작되었습니다."
          ></textarea>

          <button
            className="px-6 py-2 rounded-lg text-white font-bold"
            style={{ backgroundColor: '#0099ff' }}
            onClick={() => alert('설문이 저장되었습니다.')}
          >
            ✅ 설문 저장
          </button>
        </div>
      </div>
    </div>
  );
}
