// CoverPreview – 최종 정렬 버전 (HTML 레이아웃을 그대로 React로 변환)

export default function CoverPreview({ 
  cover = {}, 
  branding = {},
  survey = {}
}) {
  const coverImage = cover?.imageBase64 || cover?.image || survey?.coverImage;
  const title = cover?.title || survey?.title || '제목';
  const subtitle = cover?.description || survey?.description || '부제목';
  const logoBase64 = cover?.logoBase64 || branding?.logoBase64;
  const buttonText = cover?.buttonText || '설문 시작하기';
  
  const primaryColor = branding?.primaryColor || '#7c53ff';
  const secondaryColor = branding?.secondaryColor;
  const backgroundColor = branding?.backgroundColor || '#ffffff';
  // 배경 이미지 우선순위: 커버 > 브랜딩
  const bgImageBase64 = cover?.bgImageBase64 || branding?.bgImageBase64;
  const buttonShape = branding?.buttonShape || 'rounded-lg';
  const buttonOpacity = branding?.buttonOpacity !== undefined ? branding?.buttonOpacity : 0.9;
  
  // 보조 색상 처리
  const actualSecondaryColor = secondaryColor && typeof secondaryColor === 'string' && secondaryColor.startsWith('#')
    ? secondaryColor
    : (secondaryColor && typeof secondaryColor === 'string' && secondaryColor.includes('var')
        ? '#F59E0B'
        : (secondaryColor || '#6B7280')); // 기본값: 회색
  
  // 배경 스타일
  const bgStyle = {
    backgroundColor,
    ...(bgImageBase64 && {
      backgroundImage: `url(${bgImageBase64})`,
      backgroundSize: "cover",
      backgroundPosition: "center"
    })
  };
  
  // 텍스트 색상
  const getTextColor = () => {
    if (bgImageBase64) return "#ffffff";
    const hex = backgroundColor.replace("#", "");
    if (hex.length !== 6) return "#000"; 
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? "#000000" : "#ffffff";
  };

  const textColor = getTextColor();
  const subTextColor = textColor === "#ffffff" ? "rgba(255,255,255,0.7)" : "#555";

  // 버튼 모양 처리
  const shapeClass = buttonShape === 'pill' || buttonShape === 'rounded-full'
    ? 'rounded-full'
    : buttonShape === 'square' || buttonShape === 'rounded-none'
    ? 'rounded-none'
    : 'rounded-[28px]'; // 'rounded' 또는 'rounded-lg' 또는 기본값

  return (
    <div
      className="w-full text-center rounded-[34px] border-[6px] border-[#0a0e1a] shadow-xl overflow-hidden"
      style={{ 
        ...bgStyle,
        minHeight: '640px',
        height: '100%',
        maxHeight: '640px'
      }}
    >
      <div
        className="relative w-full h-full box-border px-[26px] flex flex-col"
        style={{ 
          paddingTop: "60px", 
          paddingBottom: "90px",
          minHeight: '640px',
          height: '100%'
        }}
      >
        {/* 상단 영역 (로고, 제목, 부제목) */}
        <div className="flex-shrink-0">
          {/* 로고 */}
          {logoBase64 ? (
            <div
              className="w-[70px] h-[70px] mx-auto mb-[60px]"
              style={{ marginTop: "-20px" }}
            >
              <img
                src={logoBase64}
                alt="logo"
                className="w-full h-full object-contain rounded-2xl"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div
              className="w-[70px] h-[70px] mx-auto mb-[60px] rounded-2xl border-2 border-dashed border-[#dcdcdc] flex items-center justify-center text-sm text-[#777] bg-[#fafafa]"
              style={{ marginTop: "-20px" }}
            >
              로고
            </div>
          )}

          {/* 제목 */}
          <h1
            className="text-[30px] font-bold leading-tight mb-[10px]"
            style={{ color: primaryColor }}
          >
            {title}
          </h1>

          {/* 부제목 */}
          <p
            className="text-[17px]"
            style={{ color: actualSecondaryColor || subTextColor }}
          >
            {subtitle || '부제목'}
          </p>
        </div>

        {/* 중간 영역 (타이틀 이미지 - 중앙 정렬) */}
        <div className="flex-1 flex items-center justify-center">
          {coverImage ? (
            <div className="w-full h-[180px] rounded-2xl overflow-hidden">
              <img
                src={coverImage}
                alt="cover"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-full h-[180px] rounded-2xl border-2 border-dashed border-[#dcdcdc] bg-[#fafafa] flex flex-col items-center justify-center text-sm text-[#888] leading-tight">
              타이틀 이미지<br />
              (추천 1280×720, 최대 크기 8MB)
            </div>
          )}
        </div>

                {/* 하단 영역 (질문 정보) */}
                <div className="flex-shrink-0">
                  {survey?.questions?.length > 0 && (
                    <div className="text-base" style={{ color: actualSecondaryColor || '#999' }}>
                      총 질문 {survey.questions.length}개 · 예상 {Math.ceil(survey.questions.length * 0.6)}분
                    </div>
                  )}
                </div>

        {/* 시작 버튼 */}
        <button
          className={`w-[80%] h-[55px] ${shapeClass} text-[19px] font-semibold text-white absolute left-1/2 -translate-x-1/2 transition-opacity`}
          style={{
            bottom: "80px",
            backgroundColor: primaryColor,
            opacity: buttonOpacity,
            boxShadow: `0px 3px 14px ${primaryColor}66`
          }}
          disabled
        >
          {buttonText}
        </button>

        {/* 참여자 수 */}
        {cover?.showParticipantCount && (
          <div className="absolute bottom-[6px] left-0 right-0 text-center text-base text-[#aaa]">
            현재 <span style={{ color: primaryColor }}>0명</span>이 참여했습니다
          </div>
        )}
      </div>
    </div>
  );
}
