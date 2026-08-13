'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus, BookOpen, Folder, TrendingUp, Flame, Target,
  CreditCard, Zap, FileText, Layers, Brain, PenLine,
  Shuffle, Droplets, ChevronRight, Clock
} from 'lucide-react';
import { useStore } from '@/lib/store';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { decks, cardsByDeck, progress, folders, sessions, settings } = useStore();

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
    { icon: <Layers size={18} />, label: 'Thẻ ghi nhớ', desc: 'Lật thẻ 3D', href: '/library' },
    { icon: <Brain size={18} />, label: 'Học', desc: 'MCQ + Gõ từ', href: '/library' },
    { icon: <PenLine size={18} />, label: 'Kiểm tra', desc: 'Thi tổng hợp', href: '/library' },
    { icon: <Shuffle size={18} />, label: 'Ghép thẻ', desc: 'Match game', href: '/library' },
    { icon: <Droplets size={18} />, label: 'Gravity', desc: 'Từ rơi xuống', href: '/library' },
  ];

  if (!mounted) return null;

  // ── Empty State ─────────────────────────────────────────────────
  if (deckList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-8 animate-fade-in">
        <div className="text-center max-w-lg">
          <div className="w-16 h-16 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center mx-auto mb-5">
            <BookOpen size={32} />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text)] mb-3">
            Chào mừng đến Quizlu
          </h1>
          <p className="text-[var(--text-muted)] text-base leading-relaxed">
            Học từ vựng thông minh với thuật toán lặp lại cách quãng và nhiều chế độ luyện tập.
            Tạo học phần đầu tiên hoặc import từ file CSV để bắt đầu.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/create-set" className="btn-primary px-6 py-3 text-base">
            <Plus size={18} />
            Tạo học phần đầu tiên
          </Link>
        </div>

        {/* Mode preview */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full max-w-2xl mt-2">
          {studyModes.map((m) => (
            <div
              key={m.label}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center"
            >
              <div className="text-[var(--primary)] flex justify-center mb-2">{m.icon}</div>
              <div className="font-semibold text-sm text-[var(--text)]">{m.label}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* ── Greeting + Daily Goal ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">
            {settings.userName
              ? `Chào mừng trở lại, ${settings.userName}`
              : 'Chào mừng trở lại'}
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {deckList.length} học phần · {totalCards} thẻ · {masteredCards} đã thuộc
          </p>
        </div>

        {/* Daily Goal */}
        <div className="flex items-center gap-3 bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 min-w-[200px]">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
            <Target size={16} />
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

      {/* ── Stats Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <BookOpen size={16} />, label: 'Học phần', value: deckList.length },
          { icon: <CreditCard size={16} />, label: 'Tổng thẻ', value: totalCards },
          { icon: <Zap size={16} />, label: 'Đã thuộc', value: masteredCards },
          { icon: <Flame size={16} />, label: 'Hôm nay', value: todayStudied },
        ].map((stat) => (
          <div key={stat.label} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <div className="text-[var(--text-muted)] mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-[var(--text)]">{stat.value}</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Recent Study Sets ──────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
            <Clock size={16} className="text-[var(--text-muted)]" />
            Học phần gần đây
          </h2>
          <Link
            href="/library"
            className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1 font-medium"
          >
            Xem tất cả <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentDecks.map((deck) => {
            const cardIds = cardsByDeck[deck.id] ?? [];
            const mastered = cardIds.filter((id) => progress[id]?.learnStage === 'mastered').length;
            const pct = deck.cardCount > 0 ? Math.round((mastered / deck.cardCount) * 100) : 0;

            return (
              <Link
                key={deck.id}
                href={`/study/${deck.id}`}
                className="quizlet-card p-4 flex flex-col gap-3 group"
              >
                <div className="w-9 h-9 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                  <BookOpen size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[var(--text)] text-sm truncate group-hover:text-[var(--primary)] transition-colors">
                    {deck.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{deck.cardCount} thẻ</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs text-[var(--text-muted)]">
                    <span className="flex items-center gap-0.5"><TrendingUp size={10} /> Tiến độ</span>
                    <span className="font-semibold text-[var(--primary)]">{mastered}/{deck.cardCount}</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="text-center py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-bold">
                  {deck.lastStudied ? 'Tiếp tục học' : 'Bắt đầu học'}
                </div>
              </Link>
            );
          })}

          {/* Add new */}
          <Link
            href="/create-set"
            className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] transition-all"
          >
            <div className="w-9 h-9 rounded-lg border-2 border-current flex items-center justify-center">
              <Plus size={18} />
            </div>
            <span className="text-sm font-semibold">Tạo học phần</span>
          </Link>
        </div>
      </section>

      {/* ── Recent Folders ─────────────────────────────────────── */}
      {folderList.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[var(--text)] flex items-center gap-2">
              <Folder size={16} className="text-[var(--text-muted)]" />
              Thư mục của bạn
            </h2>
            <Link
              href="/library?tab=folders"
              className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1 font-medium"
            >
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {folderList.slice(0, 3).map((folder) => (
              <Link key={folder.id} href={`/folder/${folder.id}`} className="folder-card">
                <div className="w-9 h-9 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                  <Folder size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--text)] text-sm truncate">{folder.name}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {folder.deckIds.length} học phần
                  </p>
                </div>
                <ChevronRight size={15} className="text-[var(--text-muted)] flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Study Modes ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-bold text-[var(--text)] mb-4">Chế độ học</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {studyModes.map((m) => (
            <Link key={m.label} href={m.href} className="study-mode-btn">
              <span className="text-[var(--primary)]">{m.icon}</span>
              <span className="mode-label">{m.label}</span>
              <span className="text-xs text-[var(--text-muted)]">{m.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
