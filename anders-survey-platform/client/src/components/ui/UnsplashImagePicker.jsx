// Unsplash 이미지 검색 및 선택 컴포넌트

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Unsplash API Access Key
// 무료 사용: https://unsplash.com/developers
// 환경 변수 VITE_UNSPLASH_ACCESS_KEY로 설정하거나, 여기에 직접 입력하세요
const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY || '4VvxojILyaS78hhzeKvL9t4763g5L7YoLelZHEG2xR4';

const SearchIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const LoaderIcon = ({ className }) => (
  <motion.svg 
    className={className} 
    animate={{ rotate: 360 }} 
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </motion.svg>
);

export default function UnsplashImagePicker({ isOpen, onClose, onSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const searchInputRef = useRef(null);
  const observerRef = useRef(null);
  const lastImageRef = useRef(null);

  // 모달이 열릴 때 포커스
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // 검색 실행
  const searchImages = async (query, pageNum = 1) => {
    if (!UNSPLASH_ACCESS_KEY) {
      setError('Unsplash API 키가 설정되지 않았습니다. 환경 변수 VITE_UNSPLASH_ACCESS_KEY를 설정하거나 UnsplashImagePicker.jsx 파일에서 직접 입력해주세요.');
      setLoading(false);
      return;
    }

    if (!query.trim()) {
      // 기본 검색어: "background" 또는 "nature"
      query = 'background';
    }

    setLoading(true);
    setError('');

    try {
      // Unsplash API 호출
      const response = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${pageNum}&per_page=20&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unsplash API 키가 유효하지 않습니다.');
        }
        throw new Error('Unsplash API 호출 실패');
      }

      const data = await response.json();
      const newImages = data.results.map((photo) => ({
        id: photo.id,
        url: photo.urls.regular,
        thumbUrl: photo.urls.thumb,
        fullUrl: photo.urls.full,
        description: photo.description || photo.alt_description || 'Unsplash Image',
        author: photo.user.name,
        authorUrl: photo.user.links.html,
      }));

      if (pageNum === 1) {
        setImages(newImages);
      } else {
        setImages((prev) => [...prev, ...newImages]);
      }
    } catch (err) {
      console.error('Unsplash 검색 오류:', err);
      setError(err.message || '이미지를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 초기 로드 (인기 이미지)
  useEffect(() => {
    if (isOpen && images.length === 0) {
      searchImages('background', 1);
    }
  }, [isOpen]);

  // 검색어 입력 핸들러 (디바운스)
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        setPage(1);
        searchImages(searchQuery, 1);
      } else if (searchQuery === '') {
        searchImages('background', 1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, isOpen]);

  // 무한 스크롤
  useEffect(() => {
    if (!isOpen) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && images.length > 0) {
          const nextPage = page + 1;
          setPage(nextPage);
          searchImages(searchQuery || 'background', nextPage);
        }
      },
      { threshold: 0.1 }
    );

    if (lastImageRef.current) {
      observer.observe(lastImageRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isOpen, loading, images.length, page, searchQuery]);

  // 이미지 선택 및 base64 변환
  const handleImageSelect = async (image) => {
    try {
      setLoading(true);
      
      // CORS 프록시 사용 (실제 프로덕션에서는 백엔드 프록시 사용 권장)
      // 또는 이미지를 직접 다운로드하여 base64로 변환
      const response = await fetch(image.fullUrl);
      const blob = await response.blob();
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        if (onSelect) {
          onSelect({
            target: {
              value: base64,
            },
          });
        }
        onClose();
      };
      reader.onerror = () => {
        setError('이미지를 변환하는 중 오류가 발생했습니다.');
        setLoading(false);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('이미지 변환 오류:', err);
      setError('이미지를 불러오는 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  // 모달 닫기
  const handleClose = () => {
    setSearchQuery('');
    setImages([]);
    setPage(1);
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
          >
            {/* 헤더 */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">Unsplash에서 이미지 가져오기</h3>
                <p className="text-xs text-gray-500">고품질 무료 이미지를 검색하고 선택하세요</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 검색 바 */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="이미지 검색 (예: nature, business, abstract...)"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  style={{ borderColor: '#E5E7EB' }}
                />
              </div>
            </div>

            {/* 이미지 그리드 */}
            <div className="flex-1 overflow-y-auto p-6">
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                  <p className="text-xs text-red-600 mt-2">
                    Unsplash API 키가 필요합니다. <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer" className="underline">여기서</a> 무료로 발급받을 수 있습니다.
                  </p>
                </div>
              )}

              {loading && images.length === 0 ? (
                <div className="flex items-center justify-center py-20">
                  <LoaderIcon className="w-8 h-8 text-primary animate-spin" />
                  <span className="ml-3 text-gray-600">이미지를 불러오는 중...</span>
                </div>
              ) : images.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-gray-500">검색 결과가 없습니다.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, idx) => (
                    <motion.button
                      key={image.id}
                      ref={idx === images.length - 1 ? lastImageRef : null}
                      type="button"
                      onClick={() => handleImageSelect(image)}
                      className="relative aspect-video rounded-lg overflow-hidden group cursor-pointer border-2 border-transparent hover:border-primary transition-all"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <img
                        src={image.thumbUrl}
                        alt={image.description}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium transition-opacity">
                          선택
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {loading && images.length > 0 && (
                <div className="flex items-center justify-center py-8">
                  <LoaderIcon className="w-6 h-6 text-primary animate-spin" />
                  <span className="ml-3 text-gray-600">더 불러오는 중...</span>
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <p className="text-xs text-gray-500 text-center">
                이미지는 <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Unsplash</a>에서 제공됩니다.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

