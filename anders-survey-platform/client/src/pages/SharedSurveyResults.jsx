// 공유 링크로 접근하는 설문 결과 페이지 (인증 불필요)
// SurveyResults 컴포넌트를 재사용하되, 공유 토큰으로 데이터를 가져옴

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import SurveyResults from './SurveyResults';

export default function SharedSurveyResults() {
  const { id, token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [survey, setSurvey] = useState(null);
  const [results, setResults] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || !token) {
        setError('유효하지 않은 공유 링크입니다.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // 공유 토큰으로 설문 및 결과 데이터 가져오기
        const [surveyRes, resultsRes] = await Promise.all([
          axiosInstance.get(`/surveys/${id}`),
          axiosInstance.get(`/surveys/${id}/results/shared/${token}`)
        ]);

        // 설문 데이터 처리
        let surveyData = null;
        if (surveyRes.data.success && surveyRes.data.data) {
          surveyData = surveyRes.data.data;
        } else if (surveyRes.data.id || surveyRes.data._id) {
          surveyData = surveyRes.data;
        }

        // 결과 데이터 처리
        let resultData = null;
        if (resultsRes.data.success && resultsRes.data.data) {
          resultData = resultsRes.data.data;
        } else if (resultsRes.data.results) {
          resultData = resultsRes.data;
        }

        if (!surveyData) {
          setError('설문을 찾을 수 없습니다.');
          setLoading(false);
          return;
        }

        if (!resultData) {
          setError('결과 데이터를 불러올 수 없습니다.');
          setLoading(false);
          return;
        }

        setSurvey(surveyData);
        setResults({
          results: resultData.results || [],
          totalResponses: resultData.totalResponses || 0
        });
        setError(null);
      } catch (err) {
        console.error('공유 결과 데이터 로드 오류:', err);
        if (err.response?.status === 403) {
          setError('유효하지 않은 공유 토큰입니다.');
        } else if (err.response?.status === 404) {
          setError('설문을 찾을 수 없습니다.');
        } else {
          setError('결과를 불러오는 중 오류가 발생했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mb-4"></div>
          <p className="text-gray-600">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !survey || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">접근 불가</h2>
            <p className="text-gray-600">{error || '결과를 불러올 수 없습니다.'}</p>
          </div>
        </div>
      </div>
    );
  }

  // SurveyResults 컴포넌트를 사용하되, survey와 results를 props로 전달
  // 하지만 SurveyResults는 useParams로 id를 가져오므로, 이를 우회하기 위해
  // 직접 결과 데이터를 렌더링하는 것이 더 나을 수 있습니다.
  // 일단 SurveyResults를 그대로 사용하되, 필요한 경우 수정하겠습니다.
  
  return <SurveyResults survey={survey} results={results} isShared={true} />;
}

