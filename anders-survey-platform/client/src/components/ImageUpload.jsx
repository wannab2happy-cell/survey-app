// ImageUpload.jsx (드래그 앤 드롭 + 가이드 안내 + 최근 업로드 + Unsplash)

import { useState, useEffect, useRef } from 'react';
import UnsplashImagePicker from './ui/UnsplashImagePicker';

// 아이콘 컴포넌트
const UploadIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
);

const TrashIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const XCircleIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ImageUpload = (props) => {
  const {
    label = '이미지',
    imageBase64 = '',
    onImageChange = () => {},
    hint,
    maxSizeMB = 8,
    recommendedSize = '1280*720',
    className = '',
    hideLabel = false,
    compact = false, // 작은 크기 모드
    showRecentUploads = false, // 최근 업로드 섹션 표시 여부
  } = props || {};

  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [recentUploads, setRecentUploads] = useState([]);
  const [showUnsplashPicker, setShowUnsplashPicker] = useState(false);
  const fileInputRef = useRef(null);
  const inputId = `file-upload-${label.replace(/\s/g, '-')}`;

  // 최근 업로드 이미지 로드 (localStorage에서)
  useEffect(() => {
    if (showRecentUploads) {
      const stored = localStorage.getItem('recentImageUploads');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setRecentUploads(parsed.slice(0, 5)); // 최근 5개만
        } catch (e) {
          console.error('최근 업로드 이미지 로드 실패:', e);
        }
      }
    }
  }, [showRecentUploads]);

  useEffect(() => {
    if (imageBase64) {
      setError('');
    }
  }, [imageBase64]);

  const validateAndProcessFile = (file) => {
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`파일 크기는 최대 ${maxSizeMB}MB를 초과할 수 없습니다.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Result = reader.result;
      
      // 최근 업로드에 추가
      if (showRecentUploads) {
        const newUpload = {
          id: Date.now(),
          imageBase64: base64Result,
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
        };
        const updated = [newUpload, ...recentUploads].slice(0, 10); // 최대 10개
        setRecentUploads(updated);
        localStorage.setItem('recentImageUploads', JSON.stringify(updated));
      }
      
      const syntheticEvent = {
        target: {
          value: base64Result,
        },
      };
      if (typeof onImageChange === 'function') {
        onImageChange(syntheticEvent);
      }
      setError('');
    };
    reader.onerror = () => {
      setError('파일을 읽는 도중 오류가 발생했습니다.');
    };
    reader.readAsDataURL(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleRecentUploadClick = (upload) => {
    const syntheticEvent = {
      target: {
        value: upload.imageBase64,
      },
    };
    if (typeof onImageChange === 'function') {
      onImageChange(syntheticEvent);
    }
    setError('');
  };

  const handleFileChange = (event) => {
    const file = event?.target?.files?.[0];
    validateAndProcessFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      validateAndProcessFile(file);
    } else {
      setError('이미지 파일만 업로드 가능합니다.');
    }
  };

  const handleClearImage = () => {
    const syntheticEvent = {
      target: {
        value: '',
      },
    };
    if (typeof onImageChange === 'function') {
      onImageChange(syntheticEvent);
    }
    setError('');
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // 유효한 base64 이미지인지 확인 (빈 문자열, 더미 데이터 제외)
  const isValidImage = (base64) => {
    if (!base64 || typeof base64 !== 'string') return false;
    // 빈 문자열 체크
    if (base64.trim() === '') return false;
    // 더미 1x1 투명 이미지 체크
    const dummyImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0EQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    if (base64 === dummyImage) return false;
    // data:image로 시작하는지 확인
    if (!base64.startsWith('data:image/')) return false;
    return true;
  };

  const hasImage = isValidImage(imageBase64);

  return (
    <div className={`space-y-2 ${className}`}>
      {!hideLabel && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {hint && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}

      {/* 드래그 앤 드롭 영역 - 전체 클릭 가능 */}
      {!hasImage ? (
        <label
          htmlFor={inputId}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            block border-2 border-solid rounded-lg transition-all duration-200 cursor-pointer
            ${compact 
              ? 'p-2' 
              : 'p-4'
            }
            ${isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-200 bg-bg hover:border-primary/50 hover:bg-primary/5'
            }
            focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2
            ${compact ? 'flex items-center gap-2' : 'text-center'}
            ${compact ? 'min-h-[72px]' : ''}
          `}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <input 
            id={inputId} 
            ref={fileInputRef}
            type="file" 
            className="sr-only" 
            accept="image/*"
            onChange={handleFileChange} 
          />
          
          {compact ? (
            // Compact 모드: 가로 레이아웃
            <>
              <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-gray-50 rounded-lg border border-gray-200">
                <UploadIcon className={`w-5 h-5 ${isDragging ? 'text-primary' : 'text-text-sub'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleButtonClick();
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg font-medium bg-primary text-white hover:bg-primary-hover transition-colors"
                  >
                    이미지 선택
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowUnsplashPicker(true);
                    }}
                    className="px-3 py-1.5 text-xs rounded-lg font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    Unsplash
                  </button>
                </div>
                <p className="text-xs text-text-sub">
                  최대 {maxSizeMB}MB{recommendedSize && ` · ${recommendedSize}`}
                </p>
              </div>
            </>
          ) : (
            // 일반 모드: 세로 레이아웃
            <>
              {/* 업로드 아이콘 */}
              <div className="flex justify-center mb-4">
                <UploadIcon className={`w-12 h-12 ${isDragging ? 'text-primary' : 'text-text-sub'}`} />
              </div>
              
              {/* 드래그 앤 드롭 안내 */}
              <p className="text-sm text-text-sub mb-4">
                이미지 파일을 끌어오세요.
              </p>
              
              {/* 이미지 선택 버튼 - 클릭 시 이벤트 전파 방지 */}
              <div className="flex items-center gap-3 justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleButtonClick();
                  }}
                  className="px-6 py-2.5 text-sm rounded-lg font-medium bg-primary text-white hover:bg-primary-hover transition-colors"
                >
                  이미지 선택하기
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowUnsplashPicker(true);
                  }}
                  className="px-6 py-2.5 text-sm rounded-lg font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Unsplash에서 가져오기
                </button>
              </div>
              
              {/* 가이드 안내 */}
              <p className="text-sm text-text-sub mt-4">
                최대 크기: {maxSizeMB}MB{recommendedSize && ` · 추천 사이즈: ${recommendedSize}`}
              </p>
            </>
          )}
        </label>
      ) : (
        // 이미지 미리보기 영역 - 전체 클릭 가능
        <label
          htmlFor={inputId}
          className={`relative block border-2 border-gray-200 rounded-lg bg-white cursor-pointer hover:border-primary/50 transition-colors ${compact ? 'p-2 min-h-[72px]' : 'p-4'}`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
        >
          <input 
            id={inputId} 
            ref={fileInputRef}
            type="file" 
            className="sr-only" 
            accept="image/*"
            onChange={handleFileChange} 
          />
          
          <div className={`flex items-center ${compact ? 'gap-2' : 'gap-4'}`}>
            <div className="relative flex-shrink-0">
              <img 
                src={imageBase64} 
                alt="Uploaded Preview" 
                className={`${compact ? 'h-16 w-16' : 'h-24 w-24'} object-cover rounded-lg border border-gray-200`}
                loading="lazy"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClearImage();
                }}
                className={`absolute ${compact ? '-top-1 -right-1 p-0.5' : '-top-2 -right-2 p-1'} bg-white rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition shadow-md z-10`}
                aria-label="이미지 제거"
              >
                <XCircleIcon className={`${compact ? 'w-4 h-4' : 'w-5 h-5'}`} />
              </button>
            </div>
            
            {!compact && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700 mb-1">이미지가 업로드되었습니다</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleButtonClick();
                    }}
                    className="text-sm text-[#2dafb9] hover:text-[#27a69f] font-medium"
                  >
                    이미지 변경하기
                  </button>
                </div>
                {/* 가이드 안내 */}
                <p className="text-sm text-text-sub mt-2">
                  최대 크기: {maxSizeMB}MB{recommendedSize && ` · 추천 사이즈: ${recommendedSize}`}
                </p>
              </div>
            )}
            {compact && (
              <div className="flex-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleButtonClick();
                  }}
                  className="text-xs text-[#2dafb9] hover:text-[#27a69f] font-medium"
                >
                  변경
                </button>
                {/* 가이드 안내 */}
                <p className="text-xs text-text-sub mt-1">
                  최대 크기: {maxSizeMB}MB{recommendedSize && ` · 추천 사이즈: ${recommendedSize}`}
                </p>
              </div>
            )}
          </div>
        </label>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="flex items-center text-sm text-error mt-2">
          <XCircleIcon className="w-5 h-5 mr-1" />
          {error}
        </div>
      )}

      {/* 최근 업로드 섹션 */}
      {showRecentUploads && recentUploads.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-bold text-text-main mb-3">최근 업로드</h4>
          <div className="grid grid-cols-5 gap-3">
            {recentUploads.map((upload) => (
              <button
                key={upload.id}
                type="button"
                onClick={() => handleRecentUploadClick(upload)}
                className="relative aspect-square border-2 border-border rounded-lg overflow-hidden hover:border-primary transition-colors group"
              >
                <img
                  src={upload.imageBase64}
                  alt={upload.fileName || 'Recent upload'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-bg text-text-sub text-xs">이미지</div>';
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Unsplash 이미지 선택 모달 */}
      <UnsplashImagePicker
        isOpen={showUnsplashPicker}
        onClose={() => setShowUnsplashPicker(false)}
        onSelect={onImageChange}
      />
    </div>
  );
};

export default ImageUpload;
