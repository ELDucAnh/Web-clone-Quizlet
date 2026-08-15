'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Plus, BookOpen, Folder, TrendingUp, Target,
  CreditCard, Layers, Brain, PenLine,
  Shuffle, Droplets, ChevronRight, Zap,
} from 'lucide-react';
import { useStore } from '@/lib/store';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { decks, cardsByDeck, progress, folders, sessions, settings, isHydrated } = useStore();
  const { data: session, status } = useSession();

  useEffect(() => { setMounted(true); }, []);

  const deckList = Object.values(decks).sort((a, b) => b.createdAt - a.createdAt);
  const folderList = Object.values(folders).sort((a, b) => b.updatedAt - a.updatedAt);

  const totalCards = deckList.reduce((s, d) => s + d.cardCount, 0);
  const masteredCards = Object.values(progress).filter((p) => p.learnStage === 'mastered').length;

  const recentDecks = [...deckList]
    .sort((a, b) => (b.lastStudied || b.createdAt) - (a.lastStudied || a.createdAt))
    .slice(0, 4);

  const todayStudied = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessions
      .filter((s) => s.startedAt >= today.getTime())
      .reduce((sum, s) => sum + s.correctCount, 0);
  })();

  const dailyGoalPct = Math.min(100, Math.round((todayStudied / (settings.dailyGoal || 20)) * 100));

  const studyModes = [
    { icon: <Layers size={16} />, label: 'Thẻ ghi nhớ', desc: 'Lật thẻ 3D', href: '/library' },
    { icon: <Brain size={16} />, label: 'Học', desc: 'MCQ + Gõ từ', href: '/library' },
    { icon: <PenLine size={16} />, label: 'Kiểm tra', desc: 'Bài thi tổng hợp', href: '/library' },
    { icon: <Shuffle size={16} />, label: 'Ghép thẻ', desc: 'Match game', href: '/library' },
    { icon: <Droplets size={16} />, label: 'Gravity', desc: 'Từ rơi xuống', href: '/library' },
  ];



  // ── Loading State ───────────────────────────────────────────────────────────
  if (status === 'loading' || (status === 'authenticated' && !isHydrated)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-in">
        <div className="relative w-14 h-14 flex items-center justify-center">
          <div className="absolute inset-0 border-4 border-[var(--border)] rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[var(--primary)] rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 bg-[var(--primary-light)] rounded-full animate-pulse opacity-50"></div>
        </div>
        <p className="text-sm font-semibold text-[var(--primary)] tracking-wide animate-pulse">
          Đang tải dữ liệu...
        </p>
      </div>
    );
  }

  // ── Empty State ─────────────────────────────────────────────────────────────
  if (deckList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-10 animate-fade-in">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center mx-auto mb-6">
            <BookOpen size={28} />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text)] mb-3 tracking-tight">
            Chào mừng đến Quizlu
          </h1>
          <p className="text-[var(--text-muted)] text-base leading-relaxed">
            Học từ vựng IELTS thông minh với spaced repetition và nhiều chế độ luyện tập.
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/create-set" className="btn-primary px-5 py-2.5 text-sm">
            <Plus size={16} /> Tạo học phần đầu tiên
          </Link>
        </div>

        {/* Mode preview */}
        <div className="w-full max-w-lg flex flex-col gap-2 mt-2">
          <p className="section-title mb-2 text-center">Các chế độ học</p>
          {studyModes.map((m) => (
            <div
              key={m.label}
              className="flex items-center gap-3 px-4 py-3 bg-[var(--card)] border border-[var(--border)] rounded-xl"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                {m.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">{m.label}</p>
                <p className="text-xs text-[var(--text-muted)]">{m.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Dashboard ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 animate-fade-in">

      {/* ── Greeting ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
            {settings.userName ? `Chào mừng trở lại, ${settings.userName}` : 'Trang chủ'}
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {deckList.length} học phần · {totalCards.toLocaleString()} thẻ · {masteredCards.toLocaleString()} đã thuộc
          </p>
        </div>

        {/* Daily Goal pill */}
        <div className="flex items-center gap-3 bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 min-w-[220px] shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
            <Target size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-[var(--text)]">Mục tiêu hôm nay</span>
              <span className="text-xs font-bold text-[var(--primary)]">
                {todayStudied}/{settings.dailyGoal}
              </span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${dailyGoalPct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <BookOpen size={15} />, label: 'Học phần', value: deckList.length },
          { icon: <CreditCard size={15} />, label: 'Tổng thẻ', value: totalCards },
          { icon: <Zap size={15} />, label: 'Đã thuộc', value: masteredCards },
          { icon: <TrendingUp size={15} />, label: 'Hôm nay', value: todayStudied },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="text-[var(--text-muted)] mb-1">{stat.icon}</div>
            <div className="stat-card-value">{stat.value.toLocaleString()}</div>
            <div className="stat-card-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Recent Study Sets ───────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[var(--text)] tracking-tight">Học phần gần đây</h2>
          <Link href="/library" className="text-sm text-[var(--primary)] hover:underline flex items-center gap-0.5 font-medium">
            Xem tất cả <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recentDecks.map((deck) => {
            const cardIds = cardsByDeck[deck.id] ?? [];
            const mastered = cardIds.filter((id) => progress[id]?.learnStage === 'mastered').length;
            const pct = deck.cardCount > 0 ? Math.round((mastered / deck.cardCount) * 100) : 0;

            return (
              <Link
                key={deck.id}
                href={`/study/${deck.id}`}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-3 hover:shadow-md hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                    <BookOpen size={14} />
                  </div>
                  <span className="text-xs font-semibold text-[var(--primary)]">{pct}%</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--text)] text-sm truncate group-hover:text-[var(--primary)] transition-colors leading-snug">
                    {deck.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{deck.cardCount} thẻ · {mastered} thuộc</p>
                </div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-center py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold">
                  {deck.lastStudied ? 'Tiếp tục học' : 'Bắt đầu học'}
                </div>
              </Link>
            );
          })}

          {/* Add new deck */}
          <Link
            href="/create-set"
            className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] transition-all min-h-[160px]"
          >
            <div className="w-9 h-9 rounded-xl border-2 border-current flex items-center justify-center">
              <Plus size={18} />
            </div>
            <span className="text-sm font-semibold">Tạo học phần</span>
          </Link>
        </div>
      </section>

      {/* ── Folders ────────────────────────────────────────────────────────── */}
      {folderList.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[var(--text)] tracking-tight">Thư mục</h2>
            <Link href="/library?tab=folders" className="text-sm text-[var(--primary)] hover:underline flex items-center gap-0.5 font-medium">
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {folderList.slice(0, 3).map((folder) => (
              <Link key={folder.id} href={`/folder/${folder.id}`} className="folder-card">
                <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                  <Folder size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--text)] text-sm truncate">{folder.name}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{folder.deckIds.length} học phần</p>
                </div>
                <ChevronRight size={15} className="text-[var(--text-muted)] flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}


    </div>
  );
}
