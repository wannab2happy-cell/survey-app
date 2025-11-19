// client/src/pages/Admin/DataExport.jsx 파일 전체 코드 (수정됨)

import CustomSelect from '../../components/ui/CustomSelect';

// surveyList 배열을 props로 받습니다.
export default function DataExport({ surveyList = [] }) {
  // 🔴 핵심 수정: surveyList가 없을 경우를 대비해 기본값 빈 배열 설정

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">📊 응답 데이터 추출 및 관리</h2>
        <p className="text-gray-600">설문 응답 데이터를 추출하고 관리하세요</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CustomSelect
            label="설문 선택"
            value=""
            onChange={() => {}}
            options={surveyList.length > 0 ? (
              surveyList.map((survey) => ({
                value: survey.id,
                label: `${survey.title} (생성일: ${survey.created})`
              }))
            ) : [
              { value: '', label: '생성된 설문이 없습니다.' }
            ]}
            placeholder="설문을 선택하세요"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
            <input 
              type="date" 
              className="w-full px-4 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all hover:border-gray-400" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
            <input 
              type="date" 
              className="w-full px-4 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all hover:border-gray-400" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">참여자 검색</label>
          <input 
            type="text" 
            placeholder="이름 또는 ID 입력" 
            className="w-full px-4 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all hover:border-gray-400" 
          />
        </div>

        <div className="flex justify-between items-center border-t border-gray-200 pt-4">
          <p className="text-gray-700 font-medium">
            총 설문 수: <span className="text-primary font-semibold">{surveyList.length}개</span>
          </p>
          <button className="px-4 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors border-2 border-primary focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2">
            <span>💾</span>
            CSV로 다운로드
          </button>
        </div>
      </div>
    </div>
  );
}