// client/src/pages/Admin/Customization.jsx 파일 전체 코드
import React, { useEffect, useMemo, useState } from "react"; 

/** Anders Survey Platform — Customization v4
 * - 컬러: primary + sub1~3
 * - 버튼 스타일: 색상(Primary/Custom), radius, shadow, textColor, fontWeight
 * - 이미지 업로드(Base64, 2MB, jpg/png/webp)
 * - 페이지 그룹: 브랜드 정보(시작), 페이지 스타일(본문), 완료 화면
 * - 저장소: localStorage BRANDS_THEME_V4
 */
const LS_KEY = "BRAND_THEME_V4";

const DEFAULT_THEME = {
  // 0) 브랜드 기본
  logoUrl: "",
  keyVisualUrl: "",
  title: "행사 참여 설문",
  colorSet: {
    primary: "#4F46E5", // Indigo-600
    sub1: "#00A3FF",
    sub2: "#22C55E",
    sub3: "#F59E0B",
  },
  font: { kr: "Noto Sans KR", en: "Inter" },
  // 1) 버튼 스타일
  buttonStyle: {
    colorMode: "primary", // 'primary' | 'custom'
    customColor: "#4F46E5",
    radius: "rounded", // 'square' | 'rounded' | 'pill'
    shadow: true,
    textColor: "#FFFFFF",
    fontWeight: "600", // '400' | '500' | '600' | '700'
  },
  // 2) 본문 페이지 레이아웃
  layout: {
    head: {
      backgroundType: "image", // 'image' | 'color'
      imageUrl: "",
      color: "#EEF6FF",
      text: "당신의 피드백이 더 나은 경험을 만듭니다.",
    },
    footer: { imageUrl: "", logoUrl: "" },
    bodyBg: "#FFFFFF",
  },
  // 3) 완료 페이지
  completePage: {
    thankTitle: "참여해주셔서 감사합니다!",
    thankMessage:
      "여러분의 의견은 다음 행사에 소중히 반영됩니다.\n좋은 하루 되세요.",
    keyVisualUrl: "",
  },
};

/* ---------- 전역 스타일 관리 유틸리티 ---------- */
const refreshGlobalTheme = (theme) => {
  const root = document.documentElement.style;
  const primary = theme.colorSet.primary;
  
  // Primary 색상 업데이트
  root.setProperty('--color-primary', primary);
  
  // Customization에서 설정하는 다른 서브 색상도 업데이트
  root.setProperty('--color-sub1', theme.colorSet.sub1);
  root.setProperty('--color-sub2', theme.colorSet.sub2);
  root.setProperty('--color-sub3', theme.colorSet.sub3);
};
/* ---------------------------------------------------- */

// ImageUpload 컴포넌트
const ImageUpload = ({ label, path, value, width, height, guide, onUpload, onClear }) => (
  <div>
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <div className="border border-dashed rounded-lg p-3 mt-2 flex flex-col items-center justify-center text-gray-400 text-sm bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
      <input
        type="file"
        accept="image/*"
        className="hidden"
        id={path}
        onChange={(e) => onUpload(e, path)}
      />
      <label htmlFor={path} className="flex flex-col items-center cursor-pointer">
        {value ? (
          <img
            src={value}
            alt="preview"
            style={{
              maxWidth: width || "100%",
              maxHeight: height || "110px",
              objectFit: "contain",
            }}
            className="rounded-lg mb-2"
          />
        ) : (
          <>
            <span className="text-lg font-bold text-gray-500">＋ 이미지 업로드</span>
            <span className="text-xs text-gray-400 mt-1">{guide}</span>
          </>
        )}
      </label>
    </div>
    {value && (
      <button className="mt-2 text-xs text-red-500 underline" onClick={() => onClear(path)}>
        삭제하기
      </button>
    )}
  </div>
);

export default function Customization() {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [tab, setTab] = useState("brand"); 
  const [saving, setSaving] = useState(false);

  /* 로드 */
  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    let loadedTheme = DEFAULT_THEME;
    if (raw) {
      try {
        loadedTheme = { ...DEFAULT_THEME, ...JSON.parse(raw) };
        setTheme(loadedTheme);
      } catch (e) {
         console.error("테마 로딩 오류:", e);
      }
    }
    // 로드 직후 전역 CSS 변수를 설정하여 Admin 페이지 헤더/탭 색상을 즉시 업데이트합니다.
    refreshGlobalTheme(loadedTheme); 
  }, []);

  /* 갱신 */
  const setByPath = (path, value) => {
    setTheme((prev) => {
      const next = structuredClone(prev);
      const ks = path.split(".");
      let cur = next;
      for (let i = 0; i < ks.length - 1; i++) cur = cur[ks[i]];
      cur[ks.at(-1)] = value;
      
      // Primary 색상이 변경될 때마다 미리보기뿐만 아니라 전역 스타일을 즉시 업데이트 (Live Preview)
      if (path.startsWith('colorSet.primary')) {
          refreshGlobalTheme(next);
      }
      
      return next;
    });
  };

  /* 이미지 업로드 */
  const onUpload = (e, path) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allow = ["image/jpeg", "image/png", "image/webp"];
    if (!allow.includes(f.type)) return alert("JPG, PNG, WEBP만 허용됩니다.");
    if (f.size > 2 * 1024 * 1024) return alert("2MB 이하만 업로드 가능합니다.");
    const reader = new FileReader();
    reader.onload = () => setByPath(path, reader.result);
    reader.readAsDataURL(f);
  };
  const onClear = (path) => setByPath(path, "");

  /* 저장 */
  const save = () => {
    setSaving(true);
    try {
      // 1. localStorage 저장
      localStorage.setItem(LS_KEY, JSON.stringify(theme));
      
      // 2. 저장 후 최종적으로 전역 스타일 업데이트
      refreshGlobalTheme(theme); 
      
      alert("✅ 저장 완료: 브랜드 설정이 적용되었습니다.");
    } finally {
      setSaving(false);
    }
  };

  /* 미리보기 버튼 스타일 계산 */
  const previewBtnStyle = useMemo(() => {
    const color =
      theme.buttonStyle.colorMode === "custom"
        ? theme.buttonStyle.customColor
        : theme.colorSet.primary;
    const radiusCls =
      theme.buttonStyle.radius === "square"
        ? "rounded-none"
        : theme.buttonStyle.radius === "pill"
        ? "rounded-full"
        : "rounded-lg";
    const shadowCls = theme.buttonStyle.shadow ? "shadow" : "";
    const weight = theme.buttonStyle.fontWeight;
    return { color, radiusCls, shadowCls, weight };
  }, [theme]);

  /* 우측 미리보기 */
  const Preview = useMemo(() => {
    const headBg =
      theme.layout.head.backgroundType === "image" && theme.layout.head.imageUrl
        ? { background: `url(${theme.layout.head.imageUrl}) center/cover no-repeat` }
        : { background: theme.layout.head.color };
    return (
      <div className="rounded-xl shadow p-5 border bg-white">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">미리보기</h3>

        {/* Head */}
        <div className="rounded-lg overflow-hidden mb-3 border" style={headBg}>
          <div className="p-5 bg-black/30 text-white text-sm">
            {theme.logoUrl && <img src={theme.logoUrl} alt="" className="h-6 mb-1" />}
            <p>{theme.layout.head.text}</p>
          </div>
        </div>

        {/* Body */}
        <div
          className="rounded-lg border p-4 mb-3"
          style={{ backgroundColor: theme.layout.bodyBg }}
        >
          <div className="text-sm font-semibold text-gray-800">
            [Q1] 행사 전반에 만족하셨습니까?
          </div>
          <button
            className={`mt-4 px-4 py-2 text-white ${previewBtnStyle.radiusCls} ${previewBtnStyle.shadowCls}`}
            style={{
              backgroundColor: previewBtnStyle.color,
              color: theme.buttonStyle.textColor,
              fontWeight: previewBtnStyle.weight,
            }}
          >
            제출
          </button>
        </div>

        {/* Footer */}
        <div
          className="h-12 flex items-center justify-between px-3 rounded border"
          style={{
            background:
              theme.layout.footer.imageUrl &&
              `url(${theme.layout.footer.imageUrl}) center/cover no-repeat`,
          }}
        >
          {theme.layout.footer.logoUrl && (
            <img src={theme.layout.footer.logoUrl} alt="" className="h-6" />
          )}
          <span className="text-xs text-white drop-shadow">© Anders Inc.</span>
        </div>
      </div>
    );
  }, [theme, previewBtnStyle]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">🎨 브랜딩 & 페이지 커스터마이징</h2>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 border rounded-lg"
            onClick={() => { setTheme(DEFAULT_THEME); refreshGlobalTheme(DEFAULT_THEME); }} 
          >
            기본값
          </button>
          <button
            className="px-5 py-2 text-white rounded-lg font-semibold"
            style={{ backgroundColor: previewBtnStyle.color }}
            onClick={save}
            disabled={saving}
          >
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white border rounded-xl shadow">
        <div className="flex border-b overflow-x-auto">
          {[
            { id: "brand", label: "브랜드 정보(시작)" },
            { id: "colors", label: "컬러 시스템" },
            { id: "button", label: "버튼 스타일" },
            { id: "page", label: "페이지 스타일(본문)" },
            { id: "complete", label: "완료 화면" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-sm font-medium ${
                tab === t.id ? "border-b-2" : "text-gray-600"
              }`}
              style={tab === t.id ? { borderColor: previewBtnStyle.color, color: previewBtnStyle.color } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* 좌측 폼 */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* 1) 브랜드 정보 */}
            {tab === "brand" && (
              <section className="border rounded-xl p-5 bg-white space-y-4">
                <h3 className="font-semibold text-lg mb-3">브랜드 정보(시작 안내)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <ImageUpload
                    label="로고"
                    path="logoUrl"
                    value={theme.logoUrl}
                    width="160px"
                    guide="권장 200×60px / PNG·JPG·WEBP / ≤2MB"
                    onUpload={onUpload}
                    onClear={onClear}
                  />
                  <ImageUpload
                    label="키 비주얼"
                    path="keyVisualUrl"
                    value={theme.keyVisualUrl}
                    height="120px"
                    guide="권장 1200×400px / ≤2MB"
                    onUpload={onUpload}
                    onClear={onClear}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">설문 타이틀</label>
                    <input
                      type="text"
                      className="w-full border rounded p-2 mt-1"
                      value={theme.title}
                      onChange={(e) => setByPath("title", e.target.value)}
                      placeholder="예) 2025 행사 만족도 조사"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">본문 배경색</label>
                    <input
                      type="color"
                      className="w-28 h-10 border rounded mt-1"
                      value={theme.layout.bodyBg}
                      onChange={(e) => setByPath("layout.bodyBg", e.target.value)}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* 2) 컬러 시스템 */}
            {tab === "colors" && (
              <section className="border rounded-xl p-5 bg-white space-y-4">
                <h3 className="font-semibold text-lg mb-3">컬러 시스템</h3>
                <p className="text-xs text-gray-500 mb-2">
                  Primary: 버튼·링크 등 핵심 강조 | Sub1: Head 등 비주얼 | Sub2: 포커스 |
                  Sub3: Footer 보조
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {Object.entries(theme.colorSet).map(([k, v]) => (
                    <div key={k}>
                      <label className="text-sm font-semibold text-gray-700">{k}</label>
                      <input
                        type="color"
                        value={v}
                        onChange={(e) => setByPath(`colorSet.${k}`, e.target.value)}
                        className="w-full h-10 border rounded mt-1"
                      />
                      <input
                        type="text"
                        value={v}
                        onChange={(e) => setByPath(`colorSet.${k}`, e.target.value)}
                        className="w-full border rounded p-2 text-sm mt-1"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* 3) 버튼 스타일 */}
            {tab === "button" && (
              <section className="border rounded-xl p-5 bg-white space-y-5">
                <h3 className="font-semibold text-lg mb-3">버튼 스타일</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">색상 소스</label>
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <label>
                        <input
                          type="radio"
                          checked={theme.buttonStyle.colorMode === "primary"}
                          onChange={() => setByPath("buttonStyle.colorMode", "primary")}
                          className="mr-1"
                        />
                        Primary 컬러 사용
                      </label>
                      <label>
                        <input
                          type="radio"
                          checked={theme.buttonStyle.colorMode === "custom"}
                          onChange={() => setByPath("buttonStyle.colorMode", "custom")}
                          className="mr-1"
                        />
                        직접 지정
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">텍스트 색상</label>
                    <input
                      type="color"
                      className="w-28 h-10 border rounded mt-1"
                      value={theme.buttonStyle.textColor}
                      onChange={(e) => setByPath("buttonStyle.textColor", e.target.value)}
                    />
                  </div>
                  {theme.buttonStyle.colorMode === "custom" && (
                    <div>
                      <label className="text-sm font-semibold text-gray-700">버튼 배경색</label>
                      <input
                        type="color"
                        className="w-28 h-10 border rounded mt-1"
                        value={theme.buttonStyle.customColor}
                        onChange={(e) => setByPath("buttonStyle.customColor", e.target.value)}
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-semibold text-gray-700">모양</label>
                    <div className="mt-2 flex gap-3 text-sm">
                      {[
                        { id: "square", name: "사각" },
                        { id: "rounded", name: "라운드" },
                        { id: "pill", name: "완전 라운드" },
                      ].map((r) => (
                        <label key={r.id}>
                          <input
                            type="radio"
                            className="mr-1"
                            checked={theme.buttonStyle.radius === r.id}
                            onChange={() => setByPath("buttonStyle.radius", r.id)}
                          />
                          {r.name}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">굵기</label>
                    <select
                      className="w-full border rounded p-2 mt-1"
                      value={theme.buttonStyle.fontWeight}
                      onChange={(e) => setByPath("buttonStyle.fontWeight", e.target.value)}
                    >
                      {["400", "500", "600", "700"].map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="btnShadow"
                      type="checkbox"
                      checked={theme.buttonStyle.shadow}
                      onChange={(e) => setByPath("buttonStyle.shadow", e.target.checked)}
                    />
                    <label htmlFor="btnShadow" className="text-sm font-semibold text-gray-700">
                      그림자 사용
                    </label>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-xs text-gray-500 mb-2">미리보기</div>
                  <button
                    className={`px-5 py-2 ${previewBtnStyle.radiusCls} ${previewBtnStyle.shadowCls}`}
                    style={{
                      backgroundColor: previewBtnStyle.color,
                      color: theme.buttonStyle.textColor,
                      fontWeight: previewBtnStyle.weight,
                    }}
                  >
                    제출
                  </button>
                </div>
              </section>
            )}

            {/* 4) 페이지 스타일(본문) */}
            {tab === "page" && (
              <section className="border rounded-xl p-5 bg-white space-y-5">
                <h3 className="font-semibold text-lg mb-3">페이지 스타일(본문)</h3>
                <ImageUpload
                  label="Head 이미지"
                  path="layout.head.imageUrl"
                  value={theme.layout.head.imageUrl}
                  height="110px"
                  guide="권장 1200×300px / ≤2MB"
                  onUpload={onUpload}
                  onClear={onClear}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Head 배경색</label>
                    <input
                      type="color"
                      className="w-28 h-10 border rounded mt-1"
                      value={theme.layout.head.color}
                      onChange={(e) => setByPath("layout.head.color", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Head 텍스트</label>
                    <input
                      type="text"
                      className="w-full border rounded p-2 mt-1"
                      value={theme.layout.head.text}
                      onChange={(e) => setByPath("layout.head.text", e.target.value)}
                    />
                  </div>
                </div>
                <ImageUpload
                  label="Footer 배경 이미지"
                  path="layout.footer.imageUrl"
                  value={theme.layout.footer.imageUrl}
                  height="90px"
                  guide="권장 1200×150px / ≤2MB"
                  onUpload={onUpload}
                  onClear={onClear}
                />
                <ImageUpload
                  label="Footer 로고"
                  path="layout.footer.logoUrl"
                  value={theme.layout.footer.logoUrl}
                  width="140px"
                  guide="권장 200×60px / ≤2MB"
                  onUpload={onUpload}
                  onClear={onClear}
                />
              </section>
            )}

            {/* 5) 완료 화면 */}
            {tab === "complete" && (
              <section className="border rounded-xl p-5 bg-white space-y-5">
                <h3 className="font-semibold text-lg mb-3">완료 화면</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">감사 타이틀</label>
                    <input
                      type="text"
                      className="w-full border rounded p-2 mt-1"
                      value={theme.completePage.thankTitle}
                      onChange={(e) => setByPath("completePage.thankTitle", e.target.value)}
                    />
                  </div>
                  <ImageUpload
                    label="완료 키비주얼"
                    path="completePage.keyVisualUrl"
                    value={theme.completePage.keyVisualUrl}
                    height="110px"
                    guide="권장 800×300px / ≤2MB"
                    onUpload={onUpload}
                    onClear={onClear}
                  />
                </div>
                <label className="text-sm font-semibold text-gray-700">안내 문구</label>
                <textarea
                  rows={3}
                  className="w-full border rounded p-2"
                  value={theme.completePage.thankMessage}
                  onChange={(e) => setByPath("completePage.thankMessage", e.target.value)}
                />
              </section>
            )}
          </div>

          {/* 우측 미리보기 */}
          <div>{Preview}</div>
        </div>
      </div>
    </div>
  );
}