import { useEffect, useMemo, useState } from "react";

/** 참여자 설문 페이지 — 테마 자동 반영(v4) */
const LS_KEY = "BRAND_THEME_V4";

export default function SurveyPage() {
  const [theme, setTheme] = useState(null);
  const [step, setStep] = useState("survey"); // 'survey' | 'complete'
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) {
      try {
        setTheme(JSON.parse(raw));
      } catch {}
    }
  }, []);

  const btnStyle = useMemo(() => {
    if (!theme) return {};
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
    return {
      bg: color,
      text: theme.buttonStyle.textColor,
      weight: theme.buttonStyle.fontWeight,
      radiusCls,
      shadowCls,
    };
  }, [theme]);

  if (!theme) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        테마 로딩 중…
      </div>
    );
  }

  const headStyle =
    theme.layout.head.backgroundType === "image" && theme.layout.head.imageUrl
      ? { background: `url(${theme.layout.head.imageUrl}) center/cover no-repeat` }
      : { background: theme.layout.head.color };

  const onSubmit = (e) => {
    e.preventDefault();
    setStep("complete");
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between"
      style={{ fontFamily: `${theme.font.kr}, ${theme.font.en}, sans-serif` }}
    >
      {/* Head */}
      <header className="w-full text-center text-white py-8 relative" style={headStyle}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10">
          {theme.logoUrl && (
            <img
              src={theme.logoUrl}
              alt="logo"
              className="h-8 mx-auto mb-2"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          <h1 className="text-xl font-bold">{theme.title}</h1>
          <p className="mt-1">{theme.layout.head.text}</p>
        </div>
      </header>

      {/* Body */}
      <main className="flex-grow flex items-center justify-center p-6">
        {step === "survey" ? (
          <form
            onSubmit={onSubmit}
            className="bg-white rounded-xl shadow p-8 w-full max-w-2xl mx-auto space-y-6"
            style={{ backgroundColor: theme.layout.bodyBg }}
          >
            <div className="space-y-4">
              <div>
                <label className="font-semibold text-gray-700 text-sm">
                  [Q1] 행사 전반에 만족하셨습니까?
                </label>
                <div className="mt-2 flex gap-3">
                  {["매우 만족", "보통", "불만족"].map((opt) => (
                    <label key={opt} className="flex items-center gap-2 text-gray-600 text-sm">
                      <input
                        type="radio"
                        name="q1"
                        value={opt}
                        checked={answers.q1 === opt}
                        onChange={(e) => setAnswers((a) => ({ ...a, q1: e.target.value }))}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 text-sm">자유 의견</label>
                <textarea
                  rows={3}
                  value={answers.q2 || ""}
                  onChange={(e) => setAnswers((a) => ({ ...a, q2: e.target.value }))}
                  className="w-full border rounded-lg p-2 mt-1"
                  placeholder="의견을 입력하세요."
                />
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-3 ${btnStyle.radiusCls} ${btnStyle.shadowCls}`}
              style={{ backgroundColor: btnStyle.bg, color: btnStyle.text, fontWeight: btnStyle.weight }}
            >
              제출하기
            </button>
          </form>
        ) : (
          <div className="bg-white rounded-xl shadow p-10 w-full max-w-2xl mx-auto text-center space-y-6">
            {theme.completePage.keyVisualUrl && (
              <img
                src={theme.completePage.keyVisualUrl}
                alt="thankyou"
                className="w-full rounded-xl object-cover h-48"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            )}
            <h2 className="text-2xl font-bold text-gray-800">{theme.completePage.thankTitle}</h2>
            <p className="text-gray-600 text-sm whitespace-pre-line">
              {theme.completePage.thankMessage}
            </p>
            <button
              onClick={() => setStep("survey")}
              className={`mt-2 px-6 py-2 ${btnStyle.radiusCls} ${btnStyle.shadowCls}`}
              style={{ backgroundColor: btnStyle.bg, color: btnStyle.text, fontWeight: btnStyle.weight }}
            >
              다시 참여하기
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        className="text-center text-xs text-gray-600 py-4"
        style={{
          background:
            theme.layout.footer.imageUrl &&
            `url(${theme.layout.footer.imageUrl}) center/cover no-repeat`,
        }}
      >
        <div className="bg-white/70 inline-block px-3 py-1 rounded">
          {theme.layout.footer.logoUrl && (
            <img
              src={theme.layout.footer.logoUrl}
              alt="footer-logo"
              className="h-5 inline-block mr-2"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          © 2025 Anders Inc.
        </div>
      </footer>
    </div>
  );
}
