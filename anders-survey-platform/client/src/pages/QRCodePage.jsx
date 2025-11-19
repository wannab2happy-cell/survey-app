// QR 코드 전용 페이지 (행사용)
// 설문 참여 URL과 함께 QR 코드를 표시하는 독립 페이지

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import StartPage from './participant/StartPage';

export default function QRCodePage() {
  const { slug } = useParams();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // 설문 데이터 로드
  useEffect(() => {
    if (!slug) {
      setError('유효하지 않은 설문 링크입니다.');
      setLoading(false);
      return;
    }

    const fetchSurvey = async () => {
      try {
        setLoading(true);
        
        const response = await axiosInstance.get(`/surveys/${slug}`);
        let surveyData = null;
        
        if (response.data.success && response.data.data) {
          surveyData = response.data.data;
        } else if (response.data.id || response.data._id) {
          surveyData = response.data;
        }
        
        if (surveyData) {
          setSurvey(surveyData);
          setError(null);
          
          // QR 코드 URL 생성
          const surveyUrl = `${window.location.origin}/s/${slug}`;
          setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(surveyUrl)}`);
        } else {
          setError('설문을 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('설문 데이터 로드 오류:', err);
        setError('설문을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [slug]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error || '설문을 찾을 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  // 브랜딩 정보 추출
  const primaryColor = survey?.branding?.primaryColor || 'var(--primary)';
  const secondaryColor = survey?.branding?.secondaryColor || 'var(--secondary)';
  const backgroundColor = survey?.branding?.backgroundColor || '#F3F4F6';
  const bgImageBase64 = survey?.cover?.bgImageBase64 || survey?.branding?.bgImageBase64 || '';

  return (
    <StartPage
      survey={survey}
      onStart={() => {}}
      color={primaryColor}
      secondaryColor={secondaryColor}
      backgroundColor={backgroundColor}
      bgImageBase64={bgImageBase64}
      showButton={false}
      qrCodeUrl={qrCodeUrl}
    />
  );
}

