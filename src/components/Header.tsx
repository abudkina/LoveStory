"use client";

import { useState } from "react";
import Link from "next/link";
import { logout } from "@/lib/auth";
import { User } from "@/types";

interface HeaderProps {
  user?: User | null;
}

export default function Header({ user }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="sticky top-0 z-50 w-full safe-top">
        <div className="absolute inset-0 bg-[#0f0a14]/80 backdrop-blur-xl border-b border-white/10" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pink-500/60 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center justify-between h-16 md:h-[4.5rem]">
            <Link
              href="/"
              className="font-display text-xl md:text-2xl font-bold min-w-0 truncate group"
              onClick={closeMenu}
            >
              <span className="text-white group-hover:text-pink-200 transition-colors">LoveStory </span>
              <span className="text-shimmer">Page</span>
            </Link>

            <div className="hidden sm:flex items-center gap-6 md:gap-8">
              {!user && (
                <>
                  <a
                    href="#features"
                    className="text-white/70 hover:text-white font-medium transition-colors text-sm"
                  >
                    Как это работает
                  </a>
                  <a
                    href="#preview"
                    className="text-white/70 hover:text-white font-medium transition-colors text-sm"
                  >
                    Пример
                  </a>
                </>
              )}
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="text-white/70 hover:text-white font-medium transition-colors text-sm"
                  >
                    Кабинет
                  </Link>
                  <span className="text-white/50 text-sm max-w-[120px] truncate">{user.name}</span>
                  <button
                    onClick={() => {
                      logout();
                      window.location.href = "/";
                    }}
                    className="text-white/50 hover:text-white text-sm transition-colors"
                  >
                    Выйти
                  </button>
                </>
              ) : (
                <a
                  href="#auth"
                  className="btn-glow px-5 py-2.5 rounded-xl font-semibold text-sm"
                >
                  Начать ✦
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
              aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </nav>
        </div>
      </header>

      {menuOpen && (
        <div className="mobile-nav-overlay sm:hidden" onClick={closeMenu}>
          <nav
            className="absolute top-16 right-0 left-0 glass-card-light border-b border-white/20 shadow-2xl p-4 space-y-1 mx-3 rounded-b-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {user ? (
              <>
                <p className="px-4 py-2 text-sm text-violet-500 truncate">{user.name}</p>
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="block px-4 py-3 rounded-xl text-slate-800 hover:bg-pink-50 font-medium"
                >
                  Личный кабинет
                </Link>
                <button
                  onClick={() => {
                    logout();
                    window.location.href = "/";
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl text-pink-600 hover:bg-pink-50"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <a href="#features" onClick={closeMenu} className="block px-4 py-3 rounded-xl text-slate-800 hover:bg-pink-50">
                  Как это работает
                </a>
                <a href="#preview" onClick={closeMenu} className="block px-4 py-3 rounded-xl text-slate-800 hover:bg-pink-50">
                  Пример
                </a>
                <a
                  href="#auth"
                  onClick={closeMenu}
                  className="block px-4 py-3 rounded-xl btn-glow text-white text-center font-semibold"
                >
                  Начать ✦
                </a>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
