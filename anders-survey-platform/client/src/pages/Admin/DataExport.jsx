export default function DataExport() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">📊 응답 데이터 추출 및 관리</h2>

      <div className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">설문 선택</label>
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              <option>2025년 신제품 만족도 조사</option>
              <option>BTL 현장 피드백</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">날짜 범위</label>
            <div className="flex space-x-2">
              <input type="date" className="p-2 border rounded-lg w-full" />
              <span className="text-gray-400">~</span>
              <input type="date" className="p-2 border rounded-lg w-full" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">참여자 검색</label>
            <input type="text" placeholder="이름 또는 ID 입력" className="p-2 border rounded-lg w-full" />
          </div>
        </div>

        <div className="flex justify-between items-center border-t pt-4">
          <p className="text-gray-700 font-medium">
            필터링된 결과: <span className="text-blue-600 font-semibold">128건</span>
          </p>
          <button className="btn-primary">💾 CSV로 다운로드</button>
        </div>
      </div>
    </div>
  );
}
