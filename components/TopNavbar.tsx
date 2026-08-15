'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, Menu, Flame, FileText, Folder, X, User, LogIn } from 'lucide-react';
import { useStore } from '@/lib/store';
import { useSession, signIn } from 'next-auth/react';

interface TopNavbarProps {
  onMobileMenuOpen?: () => void;
  onCreateFolder?: () => void;
}

export function TopNavbar({ onMobileMenuOpen, onCreateFolder }: TopNavbarProps) {
  const router = useRouter();
  const { decks, cards, searchQuery, setSearchQuery, settings, sessions } = useStore();
  const { data: session, status } = useSession();

  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const createMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Calculate streak (consecutive days with sessions)
  const streakDays = (() => {
    if (sessions.length === 0) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let checkDate = new Date(today);
    const sessionDays = new Set(
      sessions.map((s) => {
        const d = new Date(s.startedAt);
        d.setHours(0, 0, 0, 0);
        return d.getTime();
      })
    );
    while (sessionDays.has(checkDate.getTime())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  })();

  // Search results filtering
  const searchResults = searchQuery.trim().length > 0
    ? Object.values(decks).filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : [];

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setShowCreateMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setShowSearchResults(true);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
      setShowSearchResults(false);
    }
    if (e.key === 'Enter' && searchResults.length > 0) {
      router.push(`/study/${searchResults[0].id}`);
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  const userName = settings.userName || 'Bạn';
  const initials = userName.slice(0, 1).toUpperCase();

  return (
    <header className="app-topbar border-none shadow-sm z-30 relative bg-white">
      <div className="h-full flex items-center justify-between px-4">
        {/* Mobile hamburger */}
        <button
          onClick={onMobileMenuOpen}
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors flex-shrink-0"
          aria-label="Mở menu"
        >
          <Menu size={20} />
        </button>

        <div className="hidden md:flex flex-1 justify-center relative max-w-2xl mx-auto" ref={searchRef}>
          <div className="relative w-full">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowSearchResults(true)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Tìm kiếm học phần, thư mục, từ vựng..."
              className="w-full h-11 pl-10 pr-8 rounded-lg bg-[var(--bg)] border-2 border-transparent text-[var(--text)] text-sm outline-none transition-all focus:bg-white focus:border-[var(--primary)] placeholder:text-[var(--text-muted)]"
              aria-label="Tìm kiếm"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full mt-1.5 left-0 right-0 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden animate-scale-in">
              {searchResults.map((deck) => (
                <Link
                  key={deck.id}
                  href={`/study/${deck.id}`}
                  onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg)] transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                    style={{ background: deck.color }}
                  >
                    <FileText size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] truncate">{deck.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{deck.cardCount} thẻ</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* ── Right Actions ──────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {status === 'unauthenticated' ? (
            <button
              onClick={() => signIn('google')}
              className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <LogIn size={16} /> Đăng nhập
            </button>
          ) : (
            <>
              {/* Streak badge */}
              {streakDays > 0 && (
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 bg-orange-50 text-orange-600 rounded-full text-xs font-bold">
                  <Flame size={13} />
                  <span>{streakDays}</span>
                </div>
              )}

              {/* Create (+) button */}
              <div className="relative" ref={createMenuRef}>
                <button
                  onClick={() => setShowCreateMenu((v) => !v)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--primary)] text-white hover:bg-[var(--quizlet-blue-hover)] transition-colors shadow-sm"
                  aria-label="Tạo mới"
                >
                  <Plus size={18} />
                </button>

                {showCreateMenu && (
                  <div className="absolute right-0 top-11 w-52 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden animate-scale-in">
                    <div className="p-1">
                      <Link
                        href="/create-set"
                        onClick={() => setShowCreateMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg)] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text)]">Tạo học phần</p>
                          <p className="text-xs text-[var(--text-muted)]">Nhập thẻ từ vựng mới</p>
                        </div>
                      </Link>
                      <button
                        onClick={() => { setShowCreateMenu(false); onCreateFolder?.(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg)] transition-colors"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Folder size={16} />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-[var(--text)]">Tạo thư mục</p>
                          <p className="text-xs text-[var(--text-muted)]">Nhóm các học phần lại</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* User avatar */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="w-9 h-9 rounded-full gradient-primary text-white font-bold text-sm flex items-center justify-center hover:ring-2 hover:ring-[var(--primary-light)] transition-all overflow-hidden"
                  aria-label="Menu người dùng"
                >
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-11 w-56 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl z-50 overflow-hidden animate-scale-in">
                    <div className="px-4 py-3 border-b border-[var(--border)]">
                      <p className="font-semibold text-[var(--text)] text-sm truncate">{session?.user?.name || userName}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{session?.user?.email || 'Quizlu — IELTS Vocab'}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        href="/settings"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)] transition-colors"
                      >
                        <User size={15} />
                        Hồ sơ & Cài đặt
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
