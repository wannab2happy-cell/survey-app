// 디자인 템플릿 선택 컴포넌트
// 다양한 프리셋 스타일 제공 + 편집 기능

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

// 기본 템플릿 프리셋 정의 (색상 3개로 제한)
const DEFAULT_TEMPLATE_PRESETS = {
  minimal: {
    name: '미니멀',
    description: '깔끔하고 심플한 디자인',
    colors: {
      primaryColor: '#000000',
      secondaryColor: '#6B7280',
      tertiaryColor: '#10B981'
    },
    font: 'Pretendard',
    buttonShape: 'rounded-lg',
    buttonOpacity: 0.9,
    style: 'minimal'
  },
  modern: {
    name: '모던',
    description: '세련되고 트렌디한 디자인',
    colors: {
      primaryColor: '#7C3AED',
      secondaryColor: '#A78BFA',
      tertiaryColor: '#10B981'
    },
    font: 'Pretendard',
    buttonShape: 'rounded-lg',
    buttonOpacity: 0.9,
    style: 'modern'
  },
  business: {
    name: '비즈니스',
    description: '전문적이고 신뢰감 있는 디자인',
    colors: {
      primaryColor: '#1E40AF',
      secondaryColor: '#3B82F6',
      tertiaryColor: '#10B981'
    },
    font: 'Pretendard',
    buttonShape: 'rounded-lg',
    buttonOpacity: 0.9,
    style: 'business'
  },
  playful: {
    name: '플레이풀',
    description: '밝고 활기찬 디자인',
    colors: {
      primaryColor: '#F59E0B',
      secondaryColor: '#FBBF24',
      tertiaryColor: '#EF4444'
    },
    font: 'Pretendard',
    buttonShape: 'rounded-full',
    buttonOpacity: 0.9,
    style: 'playful'
  },
  elegant: {
    name: '엘레강트',
    description: '우아하고 고급스러운 디자인',
    colors: {
      primaryColor: '#7C2D12',
      secondaryColor: '#C2410C',
      tertiaryColor: '#059669'
    },
    font: 'Pretendard',
    buttonShape: 'rounded-lg',
    buttonOpacity: 0.9,
    style: 'elegant'
  },
  dark: {
    name: '다크',
    description: '모던한 다크 테마',
    colors: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#A78BFA',
      tertiaryColor: '#10B981'
    },
    font: 'Pretendard',
    buttonShape: 'rounded-lg',
    buttonOpacity: 0.9,
    style: 'dark'
  }
};

// 로컬스토리지에서 템플릿 불러오기
const loadTemplates = () => {
  try {
    const saved = localStorage.getItem('survey_templates');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_TEMPLATE_PRESETS, ...parsed };
    }
  } catch (e) {
    console.error('템플릿 로드 실패:', e);
  }
  return DEFAULT_TEMPLATE_PRESETS;
};

// 로컬스토리지에 템플릿 저장
const saveTemplates = (templates) => {
  try {
    localStorage.setItem('survey_templates', JSON.stringify(templates));
  } catch (e) {
    console.error('템플릿 저장 실패:', e);
  }
};

export default function CoverTemplates({ onTemplateSelect, currentBranding = {} }) {
  const [templates, setTemplates] = useState(loadTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [hoveredTemplate, setHoveredTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    colors: {
      primaryColor: '#7C3AED',
      secondaryColor: '#A78BFA',
      tertiaryColor: '#10B981'
    },
    font: 'Pretendard',
    buttonShape: 'rounded-lg',
    buttonOpacity: 0.9
  });

  // 템플릿 변경 시 로컬스토리지에 저장
  useEffect(() => {
    saveTemplates(templates);
  }, [templates]);

  // 초기 선택된 템플릿 설정
  useEffect(() => {
    if (!currentBranding || !currentBranding.primaryColor) return;
    
    const currentPrimary = currentBranding.primaryColor?.replace('#', '').toLowerCase();
    
    for (const [key, template] of Object.entries(templates)) {
      const templatePrimary = template.colors.primaryColor.replace('#', '').toLowerCase();
      if (currentPrimary === templatePrimary) {
        setSelectedTemplate(key);
        return;
      }
    }
  }, [currentBranding, templates]);

  // CSS 변수를 실제 색상 값으로 변환하는 헬퍼 함수
  const resolveColorValue = (color) => {
    if (!color || typeof color !== 'string') return color;
    
    // CSS 변수인 경우 실제 값으로 변환
    if (color.startsWith('var(--')) {
      const varName = color.match(/var\(--([^)]+)\)/)?.[1];
      if (varName) {
        // CSS 변수 값을 가져오기
        const root = document.documentElement;
        const computedValue = getComputedStyle(root).getPropertyValue(`--${varName}`).trim();
        
        if (computedValue) {
          return computedValue;
        }
        
        // CSS 변수 매핑 (기본값)
        const varMap = {
          'success': '#10B981',
          'error': '#EF4444',
          'secondary': '#F59E0B',
          'primary': '#26C6DA',
          'text-main': '#111827',
          'text-sub': '#6B7280',
          'bg': '#F9FAFB',
          'white': '#FFFFFF',
          'border': '#E5E7EB'
        };
        
        return varMap[varName] || '#F3F4F6'; // 기본값
      }
    }
    
    return color;
  };

  const handleTemplateClick = (templateKey, template) => {
    setSelectedTemplate(templateKey);
    if (onTemplateSelect) {
      // tertiaryColor를 backgroundColor로 매핑
      const { tertiaryColor, ...otherColors } = template.colors;
      
      // CSS 변수를 실제 색상 값으로 변환
      const resolvedTertiaryColor = resolveColorValue(tertiaryColor);
      const resolvedPrimaryColor = resolveColorValue(otherColors.primaryColor);
      const resolvedSecondaryColor = resolveColorValue(otherColors.secondaryColor);
      
      const updatedBranding = {
        ...currentBranding,
        primaryColor: resolvedPrimaryColor,
        secondaryColor: resolvedSecondaryColor,
        backgroundColor: resolvedTertiaryColor, // 배경 색상을 backgroundColor로 설정 (CSS 변수 해결됨)
        font: template.font,
        buttonShape: template.buttonShape,
        buttonOpacity: template.buttonOpacity !== undefined ? template.buttonOpacity : 0.9
      };
      
      // 디버깅: 템플릿 선택 시 전달되는 데이터 확인
      console.log('[CoverTemplates] 템플릿 선택:', {
        templateKey,
        template,
        tertiaryColor,
        resolvedTertiaryColor,
        updatedBranding,
        backgroundColor: resolvedTertiaryColor
      });
      
      onTemplateSelect({
        branding: updatedBranding
      });
    }
  };

  const handleEditClick = (e, templateKey) => {
    e.stopPropagation();
    const template = templates[templateKey];
    setEditingTemplate(templateKey);
    const { backgroundColor, ...restColors } = template.colors || {};
    setEditForm({
      name: template.name,
      description: template.description,
      colors: { 
        primaryColor: template.colors?.primaryColor || '#7C3AED',
        secondaryColor: template.colors?.secondaryColor || '#A78BFA',
        tertiaryColor: template.colors?.tertiaryColor || '#10B981'
      },
      font: template.font,
      buttonShape: template.buttonShape,
      buttonOpacity: template.buttonOpacity !== undefined ? template.buttonOpacity : 0.9
    });
  };

  const handleDeleteClick = (e, templateKey) => {
    e.stopPropagation();
    if (confirm(`"${templates[templateKey].name}" 템플릿을 삭제하시겠습니까?`)) {
      const newTemplates = { ...templates };
      delete newTemplates[templateKey];
      setTemplates(newTemplates);
      if (selectedTemplate === templateKey) {
        setSelectedTemplate(null);
      }
    }
  };

  const handleSaveEdit = () => {
    if (!editingTemplate) return;
    
    // backgroundColor 제거
    const { backgroundColor, ...colors } = editForm.colors || {};
    
    const updatedTemplate = {
      ...editForm,
      colors,
      style: editingTemplate
    };
    
    const newTemplates = {
      ...templates,
      [editingTemplate]: updatedTemplate
    };
    setTemplates(newTemplates);
    
    // 저장된 템플릿이 현재 선택된 템플릿이면 브랜딩에 자동 적용
    if (selectedTemplate === editingTemplate && onTemplateSelect) {
      const { tertiaryColor, ...otherColors } = updatedTemplate.colors;
      
      // CSS 변수를 실제 색상 값으로 변환
      const resolvedTertiaryColor = resolveColorValue(tertiaryColor);
      const resolvedPrimaryColor = resolveColorValue(otherColors.primaryColor);
      const resolvedSecondaryColor = resolveColorValue(otherColors.secondaryColor);
      
      onTemplateSelect({
        branding: {
          ...currentBranding,
          primaryColor: resolvedPrimaryColor,
          secondaryColor: resolvedSecondaryColor,
          backgroundColor: resolvedTertiaryColor,
          font: updatedTemplate.font,
          buttonShape: updatedTemplate.buttonShape,
          buttonOpacity: updatedTemplate.buttonOpacity !== undefined ? updatedTemplate.buttonOpacity : 0.9
        }
      });
    }
    
    setEditingTemplate(null);
    resetEditForm();
  };

  const handleAddNew = () => {
    const newKey = `custom_${Date.now()}`;
    
    // backgroundColor 제거
    const { backgroundColor, ...colors } = editForm.colors || {};
    
    const newTemplate = {
      ...editForm,
      colors,
      style: newKey
    };
    
    const newTemplates = {
      ...templates,
      [newKey]: newTemplate
    };
    setTemplates(newTemplates);
    
    // 새 템플릿을 자동으로 선택하고 브랜딩에 적용
    setSelectedTemplate(newKey);
    if (onTemplateSelect) {
      const { tertiaryColor, ...otherColors } = newTemplate.colors;
      
      // CSS 변수를 실제 색상 값으로 변환
      const resolvedTertiaryColor = resolveColorValue(tertiaryColor);
      const resolvedPrimaryColor = resolveColorValue(otherColors.primaryColor);
      const resolvedSecondaryColor = resolveColorValue(otherColors.secondaryColor);
      
      onTemplateSelect({
        branding: {
          ...currentBranding,
          primaryColor: resolvedPrimaryColor,
          secondaryColor: resolvedSecondaryColor,
          backgroundColor: resolvedTertiaryColor,
          font: newTemplate.font,
          buttonShape: newTemplate.buttonShape,
          buttonOpacity: newTemplate.buttonOpacity !== undefined ? newTemplate.buttonOpacity : 0.9
        }
      });
    }
    
    setShowAddModal(false);
    resetEditForm();
  };

  const resetEditForm = () => {
    setEditForm({
      name: '',
      description: '',
      colors: {
        primaryColor: '#7C3AED',
        secondaryColor: '#A78BFA',
        tertiaryColor: '#10B981'
      },
      font: 'Pretendard',
      buttonShape: 'rounded-lg',
      buttonOpacity: 0.9
    });
  };

  const colorLabels = {
    primaryColor: '강조 색상',
    secondaryColor: '보조 색상',
    tertiaryColor: '배경 색상'
  };

  return (
    <div className="space-y-4">
      {/* 새 템플릿 버튼 - 상단 오른쪽 */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 text-sm font-semibold text-white rounded-lg hover:opacity-90 transition-opacity shadow-md"
          style={{ backgroundColor: 'var(--primary, #26C6DA)' }}
        >
          새 템플릿
        </button>
      </div>

      {/* 템플릿 그리드 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {Object.entries(templates).map(([key, template]) => {
          const isSelected = selectedTemplate === key;
          const isHovered = hoveredTemplate === key;
          const isDefault = key in DEFAULT_TEMPLATE_PRESETS;

          return (
            <motion.div
              key={key}
              className="relative group"
              onMouseEnter={() => setHoveredTemplate(key)}
              onMouseLeave={() => setHoveredTemplate(null)}
            >
              {/* 편집/삭제 버튼 - 우측 상단 (button 밖으로 이동) */}
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -top-2 -right-2 flex gap-1.5 z-10"
                >
                  <button
                    type="button"
                    onClick={(e) => handleEditClick(e, key)}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-primary hover:text-white transition-all border-2 border-gray-200 hover:border-primary"
                    title="편집"
                  >
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteClick(e, key)}
                    className="p-2 bg-white rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-all border-2 border-gray-200 hover:border-red-500"
                    title="삭제"
                  >
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </motion.div>
              )}
              
              <motion.button
                type="button"
                onClick={() => handleTemplateClick(key, template)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                aria-label={`${template.name} 템플릿 선택: ${template.description}`}
                aria-pressed={isSelected}
                className={`
                  relative w-full p-5 rounded-2xl transition-all duration-300
                  ${isSelected 
                    ? 'shadow-xl ring-2 ring-primary/30 bg-gradient-to-br from-primary/5 to-transparent' 
                    : 'hover:shadow-lg bg-white'
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                `}
                style={isSelected ? {
                  borderColor: template.colors.primaryColor,
                  borderWidth: '2px',
                  borderStyle: 'solid'
                } : {
                  borderWidth: '0px'
                }}
              >

                {/* 템플릿 프리뷰 */}
                <div className="space-y-3">

                  {/* 색상 팔레트 미리보기 - 3개만 */}
                  <div className="flex gap-2">
                    {Object.entries(template.colors)
                      .filter(([key]) => colorLabels[key]) // colorLabels에 있는 색상만 표시
                      .map(([colorKey, color]) => (
                        <div
                          key={colorKey}
                          className="flex-1 h-10 rounded-lg border-2 border-gray-200 shadow-sm transition-transform hover:scale-105"
                          style={{ backgroundColor: color }}
                          title={`${colorLabels[colorKey]}: ${color}`}
                        />
                      ))}
                  </div>

                  {/* 템플릿 정보 */}
                  <div className="text-left pt-1">
                    <div className="text-sm font-bold text-text-main mb-0.5">
                      {template.name}
                    </div>
                    <div className="text-xs text-text-sub leading-relaxed">
                      {template.description}
                    </div>
                  </div>
                </div>

                {/* 선택 효과 */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent pointer-events-none"
                  />
                )}
              </motion.button>
            </motion.div>
          );
        })}
      </div>

      {/* 편집 모달 */}
      <AnimatePresence>
        {(editingTemplate || showAddModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setEditingTemplate(null);
              setShowAddModal(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* 모달 헤더 */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b border-gray-200 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-text-main mb-1">
                      {showAddModal ? '새 템플릿 추가' : '템플릿 편집'}
                    </h3>
                    <p className="text-xs text-text-sub">
                      템플릿의 색상과 스타일을 설정하세요
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTemplate(null);
                      setShowAddModal(false);
                    }}
                    className="p-2 hover:bg-white/70 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* 모달 본문 */}
              <div className="p-6 space-y-8 overflow-y-auto max-h-[calc(100vh-300px)]">
                {/* 기본 정보 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-primary rounded-full"></div>
                    <h4 className="text-base font-semibold text-text-main">기본 정보</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* 이름 */}
                    <div className="space-y-2.5">
                      <label className="block text-sm font-semibold text-text-main">
                        템플릿 이름 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white hover:border-gray-300"
                        placeholder="예: 미니멀"
                        maxLength={20}
                      />
                    </div>

                    {/* 설명 */}
                    <div className="space-y-2.5">
                      <label className="block text-sm font-semibold text-text-main">
                        설명 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white hover:border-gray-300"
                        placeholder="예: 깔끔하고 심플한 디자인"
                        maxLength={50}
                      />
                    </div>
                  </div>
                </div>

                {/* 색상 설정 - 3개만 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-primary rounded-full"></div>
                    <h4 className="text-base font-semibold text-text-main">색상 설정</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {Object.entries(colorLabels).map(([key, label]) => (
                      <div key={key} className="space-y-3">
                        <label className="block text-sm font-semibold text-text-main">
                          {label}
                        </label>
                        <div className="flex items-center gap-3">
                          {/* 색상 피커 버튼 */}
                          <div className="relative flex-shrink-0">
                            <input
                              type="color"
                              id={`color-picker-${key}`}
                              value={editForm.colors[key] || '#7C3AED'}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                colors: { ...editForm.colors, [key]: e.target.value }
                              })}
                              className="absolute opacity-0 w-0 h-0"
                              title={`${label} 색상 선택`}
                            />
                            <label
                              htmlFor={`color-picker-${key}`}
                              className="block w-16 h-16 cursor-pointer rounded-xl border-2 shadow-md hover:scale-105 hover:shadow-lg transition-all flex items-center justify-center relative overflow-hidden"
                              style={{ 
                                backgroundColor: editForm.colors[key] || '#7C3AED',
                                borderColor: editForm.colors[key] || '#7C3AED'
                              }}
                            >
                              <svg 
                                className="w-7 h-7 absolute inset-0 m-auto" 
                                fill="none" 
                                stroke="white" 
                                viewBox="0 0 24 24" 
                                strokeWidth={2.5}
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                              </svg>
                            </label>
                          </div>
                          <input
                            type="text"
                            value={editForm.colors[key] || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^#[0-9A-Fa-f]{0,6}$/.test(value) || value === '') {
                                setEditForm({
                                  ...editForm,
                                  colors: { ...editForm.colors, [key]: value || '#7C3AED' }
                                });
                              }
                            }}
                            className="flex-1 min-w-0 border-2 border-gray-200 rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white hover:border-gray-300"
                            placeholder="#7C3AED"
                            maxLength={7}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 스타일 설정 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-primary rounded-full"></div>
                    <h4 className="text-base font-semibold text-text-main">스타일 설정</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* 폰트 */}
                    <div className="space-y-2.5">
                      <label className="block text-sm font-semibold text-text-main">
                        폰트 스타일
                      </label>
                      <select
                        value={editForm.font}
                        onChange={(e) => setEditForm({ ...editForm, font: e.target.value })}
                        className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white hover:border-gray-300"
                      >
                        <option value="Pretendard">Pretendard (기본)</option>
                        <option value="Noto Sans KR">Noto Sans KR</option>
                        <option value="serif">Serif</option>
                        <option value="monospace">Monospace</option>
                      </select>
                    </div>
                    
                    {/* 버튼 모양 */}
                    <div className="space-y-2.5 md:col-span-2">
                      <label className="block text-sm font-semibold text-text-main mb-3">
                        버튼 모양
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { value: 'rounded-lg', label: '둥근 모서리', desc: '부드러운 모서리', preview: 'rounded-lg' },
                          { value: 'rounded-full', label: '캡슐형', desc: '완전히 둥근 양쪽', preview: 'rounded-full' },
                          { value: 'rounded-none', label: '직각', desc: '날카로운 모서리', preview: 'rounded-none' }
                        ].map((option) => (
                          <label
                            key={option.value}
                            className={`
                              relative flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition-all
                              ${editForm.buttonShape === option.value
                                ? 'border-primary shadow-md bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }
                            `}
                            style={editForm.buttonShape === option.value ? {
                              borderColor: editForm.colors.primaryColor || '#7C3AED'
                            } : {}}
                          >
                            <input
                              type="radio"
                              name="buttonShape"
                              value={option.value}
                              checked={editForm.buttonShape === option.value}
                              onChange={(e) => setEditForm({ ...editForm, buttonShape: e.target.value })}
                              className="sr-only"
                            />
                            {/* 버튼 프리뷰 */}
                            <div
                              className={`w-full px-6 py-2.5 text-sm font-semibold text-white mb-2 ${option.preview} shadow-sm`}
                              style={{
                                backgroundColor: editForm.colors.primaryColor || '#7C3AED',
                                opacity: editForm.buttonOpacity !== undefined ? editForm.buttonOpacity : 0.9
                              }}
                            >
                              버튼
                            </div>
                            <div className="text-center">
                              <div className="text-sm font-semibold text-text-main">{option.label}</div>
                              <div className="text-xs text-text-sub mt-0.5">{option.desc}</div>
                            </div>
                            {editForm.buttonShape === option.value && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: editForm.colors.primaryColor || '#7C3AED' }}>
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    {/* 버튼 투명도 */}
                    <div className="space-y-2.5 md:col-span-2">
                      <label className="block text-sm font-semibold text-text-main">
                        버튼 투명도
                      </label>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0.1"
                            max="1"
                            step="0.1"
                            value={editForm.buttonOpacity !== undefined ? editForm.buttonOpacity : 0.9}
                            onChange={(e) => setEditForm({ ...editForm, buttonOpacity: parseFloat(e.target.value) })}
                            className="flex-1 h-2.5 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, ${editForm.colors.primaryColor || '#7C3AED'} 0%, ${editForm.colors.primaryColor || '#7C3AED'} ${(editForm.buttonOpacity !== undefined ? editForm.buttonOpacity : 0.9) * 100}%, #e5e7eb ${(editForm.buttonOpacity !== undefined ? editForm.buttonOpacity : 0.9) * 100}%, #e5e7eb 100%)`
                            }}
                          />
                          <span className="text-sm font-semibold text-text-main min-w-[4rem] text-right bg-gray-50 px-3 py-1.5 rounded-lg">
                            {Math.round((editForm.buttonOpacity !== undefined ? editForm.buttonOpacity : 0.9) * 100)}%
                          </span>
                        </div>
                        <p className="text-xs text-text-sub pl-1">
                          버튼의 투명도를 조절할 수 있습니다 (10% ~ 100%)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 모달 푸터 */}
              <div className="sticky bottom-0 bg-gradient-to-t from-white via-white to-gray-50/50 px-6 py-5 border-t border-gray-200 rounded-b-2xl flex gap-3 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => {
                    setEditingTemplate(null);
                    setShowAddModal(false);
                  }}
                  className="btn-secondary flex-1"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={showAddModal ? handleAddNew : handleSaveEdit}
                  disabled={!editForm.name || !editForm.description}
                  className="btn-primary flex-1"
                  style={{ 
                    backgroundColor: editForm.colors.primaryColor || '#26C6DA',
                    color: (() => {
                      // 색상 밝기 계산 함수
                      const getBrightness = (hex) => {
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        return (r * 299 + g * 587 + b * 114) / 1000;
                      };
                      const bgColor = editForm.colors.primaryColor || '#26C6DA';
                      // 배경색이 밝으면(밝기 > 200) 검은색 텍스트, 어두우면 흰색 텍스트
                      return getBrightness(bgColor) > 200 ? '#000000' : '#FFFFFF';
                    })()
                  }}
                >
                  {showAddModal ? (
                    <>
                      <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      추가하기
                    </>
                  ) : (
                    <>
                      <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      저장하기
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 템플릿 프리셋을 외부에서 사용할 수 있도록 export
export { DEFAULT_TEMPLATE_PRESETS };
