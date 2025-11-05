import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function Login({ onLogin }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axiosInstance.post("/login", {
        username: id,
        password,
      });

      const token = res.data.token;
      localStorage.setItem("token", token);

      // ✅ App.jsx 의 상태 변경과 리다이렉트를 하나의 동작으로 통일
      if (onLogin) {
        onLogin(token); // App.jsx 에서 token 기반 setState + navigate 처리
      } else {
        navigate("/admin/list", { replace: true });
      }
    } catch (err) {
      setError("아이디 또는 비밀번호가 잘못되었습니다.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Anders Survey Platform Admin
        </h2>

        <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              type="text"
              placeholder="관리자 ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full border px-3 py-2 rounded-t-md focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded-b-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            type="submit"
            className="w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
}
