"use client";

import { useState } from "react";
import { register, login } from "@/lib/auth";
import { User } from "@/types";

interface AuthFormProps {
  onSuccess: (user: User) => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result =
      mode === "register"
        ? register(email, password, name)
        : login(email, password);

    setLoading(false);

    if (result.success && result.user) {
      onSuccess(result.user);
    } else {
      setError(result.error || "Ошибка");
    }
  };

  return (
    <div className="landing-card-dark rounded-3xl p-6 sm:p-8 w-full max-w-md animate-pulse-glow">
      <div className="text-center mb-8">
        <span className="text-5xl inline-block animate-float">💕</span>
        <h2 className="font-display text-2xl text-white mt-4">
          {mode === "login" ? "Войти в кабинет" : "Создать аккаунт"}
        </h2>
        <p className="text-white/50 text-sm mt-1">
          {mode === "login"
            ? "Продолжите вашу love story"
            : "Начните создавать историю любви"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === "register" && (
          <div>
            <label className="block text-sm text-pink-300 mb-1.5">Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Как вас зовут?"
              className="w-full px-4 py-3.5 sm:py-3 rounded-xl border border-white/15 focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20 outline-none transition bg-white/10 text-white placeholder:text-white/30 text-base"
            />
          </div>
        )}

        <div>
          <label className="block text-sm text-pink-300 mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="your@email.com"
            className="w-full px-4 py-3.5 sm:py-3 rounded-xl border border-white/15 focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20 outline-none transition bg-white/10 text-white placeholder:text-white/30 text-base"
          />
        </div>

        <div>
          <label className="block text-sm text-pink-300 mb-1.5">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="••••••"
            className="w-full px-4 py-3.5 sm:py-3 rounded-xl border border-white/15 focus:border-pink-400 focus:ring-2 focus:ring-pink-500/20 outline-none transition bg-white/10 text-white placeholder:text-white/30 text-base"
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center bg-red-50 rounded-lg py-2">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-glow w-full py-3.5 rounded-xl font-bold text-base disabled:opacity-60"
        >
          {loading
            ? "Загрузка..."
            : mode === "login"
              ? "Войти"
              : "Зарегистрироваться"}
        </button>
      </form>

      <p className="text-center text-sm text-white/50 mt-6">
        {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          className="text-pink-300 font-medium hover:text-pink-200 underline underline-offset-2"
        >
          {mode === "login" ? "Зарегистрироваться" : "Войти"}
        </button>
      </p>
    </div>
  );
}
