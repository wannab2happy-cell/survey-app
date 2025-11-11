// src/components/builder/Step1_Settings.jsx (최종 코드 - 공유 기능 포함 + 모던 UI)

import ImageUpload from '../ImageUpload';
import TimePicker from '../TimePicker';
import { CalendarIcon, ClockIcon } from '../icons';

// ISO 8601 문자열을 datetime-local 형식(YYYY-MM-DDTHH:MM)으로 변환하는 헬퍼 함수
const formatDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return ''; 
        
        // 브라우저의 로컬 시간대 기준으로 문자열 포맷
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
        return '';
    }
};

export default function Step1_Settings({ form, handleFormChange, onBrandingChange, onImageChange }) {

    return (
        <div className="space-y-4">
            
            {/* 1. 기본 설정 및 진행 설정 */}
            <section className="bg-white rounded-xl shadow-md p-4">
                <h3 className="text-lg font-bold text-text-main mb-4">설문 기본 정보 및 진행 설정</h3>
                
                <div className="space-y-4">
                    {/* 설문 제목 */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-text-sub mb-2">
                            설문 제목 <span className="text-error">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            value={form?.title || ''}
                            onChange={(e) => {
                                if (handleFormChange) {
                                    handleFormChange('title', e.target.value);
                                }
                            }}
                            className="w-full border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white text-text-main"
                            required
                            placeholder="예: 고객 만족도 설문 조사"
                            autoComplete="off"
                        />
                    </div>

                    {/* 일정 설정 - 모던 디자인 */}
                    {(form.status === 'active' || form.status === 'scheduled') && (
                        <div className="mt-6 p-6 rounded-xl bg-bg border border-border shadow-sm">
                            <div className="flex items-center gap-2 mb-5">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <ClockIcon className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-text-main">
                                        {form.status === 'active' ? '설문 종료 일정 설정' : '설문 예약 일정 설정'}
                                    </h4>
                                    <p className="text-xs text-text-sub mt-0.5">
                                        {form.status === 'active' ? '설문이 언제까지 진행될지 설정하세요' : '설문 시작 및 종료 시간을 설정하세요'}
                                    </p>
                                </div>
                            </div>
                            {/* 예약 진행: 시작일시 아래 종료일시 배치 */}
                            {form.status === 'scheduled' ? (
                                <div className="space-y-4">
                                    {/* 시작 일시 */}
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-border">
                                        <label htmlFor="startAt" className="block text-sm font-medium text-text-sub mb-2 flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4 text-primary" />
                                            시작 일시 <span className="text-error">*</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="date"
                                                id="startAt"
                                                value={form.startAt ? new Date(form.startAt).toISOString().split('T')[0] : ''}
                                                onChange={(e) => {
                                                    const date = e.target.value;
                                                    const time = form.startAt ? new Date(form.startAt).toTimeString().slice(0, 5) : '12:00';
                                                    const dateTime = `${date}T${time}:00`;
                                                    handleFormChange('startAt', dateTime);
                                                }}
                                                required
                                                className="flex-1 border-2 border-border rounded-md shadow-sm px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                                            />
                                            <TimePicker
                                                value={form.startAt}
                                                onChange={(e) => {
                                                    const date = form.startAt ? new Date(form.startAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                                                    const time = e.target.value.split('T')[1] || '12:00:00';
                                                    handleFormChange('startAt', `${date}T${time}`);
                                                }}
                                            />
                                        </div>
                                    </div>
                                    
                                    {/* 종료 일시 */}
                                    <div className="bg-white rounded-xl p-4 shadow-sm border border-border">
                                        <label htmlFor="endAt" className="block text-sm font-medium text-text-sub mb-2 flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4 text-primary" />
                                            종료 일시 <span className="text-xs text-text-sub">(선택)</span>
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="date"
                                                id="endAt"
                                                value={form.endAt ? new Date(form.endAt).toISOString().split('T')[0] : ''}
                                                onChange={(e) => {
                                                    const date = e.target.value;
                                                    const time = form.endAt ? new Date(form.endAt).toTimeString().slice(0, 5) : '12:00';
                                                    const dateTime = `${date}T${time}:00`;
                                                    handleFormChange('endAt', dateTime);
                                                }}
                                                className="flex-1 border-2 border-border rounded-md shadow-sm px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                                            />
                                            <TimePicker
                                                value={form.endAt}
                                                onChange={(e) => {
                                                    const date = form.endAt ? new Date(form.endAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                                                    const time = e.target.value.split('T')[1] || '12:00:00';
                                                    handleFormChange('endAt', `${date}T${time}`);
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* 바로 진행: 종료 일시만 표시 */
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-border">
                                    <label htmlFor="endAt" className="block text-sm font-medium text-text-sub mb-2 flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4 text-primary" />
                                        종료 일시 <span className="text-xs text-text-sub">(선택)</span>
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="date"
                                            id="endAt"
                                            value={form.endAt ? new Date(form.endAt).toISOString().split('T')[0] : ''}
                                            onChange={(e) => {
                                                const date = e.target.value;
                                                const time = form.endAt ? new Date(form.endAt).toTimeString().slice(0, 5) : '12:00';
                                                const dateTime = `${date}T${time}:00`;
                                                handleFormChange('endAt', dateTime);
                                            }}
                                            className="flex-1 border-2 border-border rounded-md shadow-sm px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white"
                                        />
                                        <TimePicker
                                            value={form.endAt}
                                            onChange={(e) => {
                                                const date = form.endAt ? new Date(form.endAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
                                                const time = e.target.value.split('T')[1] || '12:00:00';
                                                handleFormChange('endAt', `${date}T${time}`);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* 2. 브랜딩 및 디자인 설정 */}
            <section className="bg-white rounded-xl shadow-md p-4">
                <h3 className="text-lg font-bold text-text-main mb-4">브랜딩 및 디자인</h3>
                
                <div className="space-y-4">
                    {/* 색상, 폰트, 버튼 모양 설정 */}
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { 
                                key: 'primaryColor', 
                                label: '강조 색상', 
                                desc: '브랜드 강조, 주요 버튼, 진행률, 타이틀'
                            },
                            { 
                                key: 'secondaryColor', 
                                label: '보조 색상', 
                                desc: 'Hover, 구획선, 카드 배경 등 보조 요소'
                            },
                            { 
                                key: 'tertiaryColor', 
                                label: '상태 색상', 
                                desc: '성공/완료 피드백, 시스템 알림'
                            }
                        ].map(({ key, label, desc }) => (
                            <div key={key}>
                                <label htmlFor={key} className="block text-sm font-medium text-text-main mb-1">
                                    {label}
                                </label>
                                <p className="text-xs text-text-sub mb-2 leading-relaxed">
                                    {desc}
                                </p>
                                <div className="relative">
                                    <input
                                        type="color"
                                        id={key}
                                        value={(() => {
                                            const color = form.branding[key];
                                            if (!color) {
                                                // 기본값 매핑
                                                if (key === 'primaryColor') return '#26C6DA';
                                                if (key === 'secondaryColor') return '#F59E0B';
                                                if (key === 'tertiaryColor') return '#10B981';
                                                return '#26C6DA';
                                            }
                                            // CSS 변수인 경우 기본값 반환, 아니면 그대로 사용
                                            if (color.includes('var(--')) {
                                                if (key === 'primaryColor') return '#26C6DA';
                                                if (key === 'secondaryColor') return '#F59E0B';
                                                if (key === 'tertiaryColor') return '#10B981';
                                                return '#26C6DA';
                                            }
                                            return color;
                                        })()}
                                        onChange={(e) => {
                                            const colorValue = e.target.value;
                                            onBrandingChange('branding', key, colorValue);
                                        }}
                                        className="w-full h-12 cursor-pointer transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                        style={{
                                            border: 'none',
                                            borderRadius: '0',
                                            padding: '0'
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* 폰트 및 버튼 모양 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="font" className="block text-sm font-medium text-text-sub mb-2">
                                폰트 스타일
                            </label>
                            <select
                                id="font"
                                value={form.branding.font}
                                onChange={(e) => onBrandingChange('branding', 'font', e.target.value)}
                                className="w-full border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            >
                                <option value="Pretendard">Pretendard (기본)</option>
                                <option value="Noto Sans KR">Noto Sans KR</option>
                                <option value="serif">Serif</option>
                                <option value="monospace">Monospace</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="buttonShape" className="block text-sm font-medium text-text-sub mb-2">
                                버튼 모양
                            </label>
                            <select
                                id="buttonShape"
                                value={form.branding.buttonShape}
                                onChange={(e) => onBrandingChange('branding', 'buttonShape', e.target.value)}
                                className="w-full border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                            >
                                <option value="rounded-lg">둥근 모서리 (Rounded)</option>
                                <option value="rounded-none">직각 (Sharp)</option>
                                <option value="rounded-full">캡슐형 (Pill)</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* 로고 및 배경 이미지 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
                        <ImageUpload
                            label="로고 이미지"
                            imageBase64={form.branding.logoBase64}
                            onImageChange={(e) => onImageChange('branding', 'logoBase64', e)}
                            hint="설문 상단에 표시될 로고 (권장: 투명 배경)"
                            compact={true}
                        />
                        <ImageUpload
                            label="전체 배경 이미지"
                            imageBase64={form.branding.bgImageBase64}
                            onImageChange={(e) => onImageChange('branding', 'bgImageBase64', e)}
                            hint="설문 페이지 배경 이미지"
                            compact={true}
                        />
                    </div>
                </div>
            </section>

            {/* 3. Head/Foot 커스터마이징 (요구사항 5) */}
            <section className="bg-white rounded-xl shadow-md p-4">
                <h3 className="text-lg font-bold text-text-main mb-4">Head/Foot 커스터마이징</h3>
                
                <div className="space-y-4">
                    {/* Head 섹션 */}
                    <div className="border border-border rounded-lg p-4">
                        <h4 className="text-lg font-semibold mb-4 text-text-main">Head (상단)</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-2">배경색</label>
                                <input
                                    type="color"
                                    value={form.head?.background || '#ffffff'}
                                    onChange={(e) => onBrandingChange('head', 'background', e.target.value)}
                                    className="w-full h-12 border-2 border-border rounded-lg shadow-sm cursor-pointer hover:border-primary transition"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-2">제목</label>
                                <input
                                    type="text"
                                    value={form.head?.title || ''}
                                    onChange={(e) => onBrandingChange('head', 'title', e.target.value)}
                                    placeholder="Head 제목 입력"
                                    className="w-full border-2 border-border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>
                            <ImageUpload
                                label="Head 이미지"
                                imageBase64={form.head?.imageBase64 || ''}
                                onImageChange={(e) => onImageChange('head', 'imageBase64', e)}
                                hint="Head에 표시될 이미지 (선택)"
                                compact={true}
                            />
                        </div>
                    </div>

                    {/* Foot 섹션 */}
                    <div className="border border-border rounded-lg p-4">
                        <h4 className="text-lg font-semibold mb-4 text-text-main">Foot (하단)</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-sub mb-2">배경색</label>
                                <input
                                    type="color"
                                    value={form.foot?.background || '#ffffff'}
                                    onChange={(e) => onBrandingChange('foot', 'background', e.target.value)}
                                    className="w-full h-12 border-2 border-border rounded-lg shadow-sm cursor-pointer hover:border-primary transition"
                                />
                            </div>
                            <ImageUpload
                                label="Foot 로고 이미지"
                                imageBase64={form.foot?.logoBase64 || ''}
                                onImageChange={(e) => onImageChange('foot', 'logoBase64', e)}
                                hint="Foot에 표시될 로고 (선택)"
                                compact={true}
                            />
                            <ImageUpload
                                label="Foot 이미지"
                                imageBase64={form.foot?.imageBase64 || ''}
                                onImageChange={(e) => onImageChange('foot', 'imageBase64', e)}
                                hint="Foot에 표시될 이미지 (선택)"
                                compact={true}
                            />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
