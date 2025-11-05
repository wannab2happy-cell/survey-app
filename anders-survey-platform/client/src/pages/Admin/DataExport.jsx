// client/src/pages/Admin/DataExport.jsx 파일 전체 코드 (수정됨)
import React from 'react'; // 🔴 핵심 수정: React 임포트 추가

// surveyList 배열을 props로 받습니다.
export default function DataExport({ surveyList = [] }) {
  // 🔴 핵심 수정: surveyList가 없을 경우를 대비해 기본값 빈 배열 설정

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">📊 응답 데이터 추출 및 관리</h2>

      <div className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">설문 선택</label>
            <select className="w-full p-2 border border-gray-300 rounded-lg">
              {/* 🔴 핵심 수정 1: surveyList를 옵션으로 매핑 */}
              {surveyList.length > 0 ? (
                surveyList.map((survey) => (
                  <option key={survey.id} value={survey.id}>
                    {survey.title} (생성일: {survey.created})
                  </option>
                ))
              ) : (
                <option>생성된 설문이 없습니다.</option>
              )}
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
            총 설문 수: <span className="text-primary font-semibold">{surveyList.length}개</span>
          </p>
          {/* 브랜딩 컬러 적용을 위해 Tailwind primary 클래스 사용 */}
          <button className="bg-primary hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-150">
             💾 CSV로 다운로드
          </button>
        </div>
      </div>
    </div>
  );
}