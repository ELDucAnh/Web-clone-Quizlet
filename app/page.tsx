'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus, BookOpen, Folder, TrendingUp, Flame, Target,
  CreditCard, Zap, FileText, Gamepad2, ChevronRight, Clock
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

  // Recent decks (last studied or most recent)
  const recentDecks = [...deckList]
    .sort((a, b) => (b.lastStudied || b.createdAt) - (a.lastStudied || a.createdAt))
    .slice(0, 4);

  // Today's studied cards
  const todayStudied = (() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sessions
      .filter((s) => s.startedAt >= today.getTime())
      .reduce((sum, s) => sum + s.correctCount, 0);
  })();

  const dailyGoalPct = Math.min(100, Math.round((todayStudied / (settings.dailyGoal || 20)) * 100));

  const studyModes = [
    { icon: '🎴', label: 'Thẻ ghi nhớ', desc: 'Lật thẻ 3D', href: '/library', color: 'from-blue-500 to-indigo-600' },
    { icon: '🧠', label: 'Học', desc: 'MCQ + Gõ từ', href: '/library', color: 'from-violet-500 to-purple-600' },
    { icon: '📝', label: 'Kiểm tra', desc: 'Thi tổng hợp', href: '/library', color: 'from-emerald-500 to-teal-600' },
    { icon: '🧩', label: 'Ghép thẻ', desc: 'Match game', href: '/library', color: 'from-orange-500 to-amber-600' },
    { icon: '☄️', label: 'Gravity', desc: 'Từ rơi xuống', href: '/library', color: 'from-pink-500 to-rose-600' },
  ];

  if (!mounted) return null;

  // ── Empty State ───────────────────────────────────────────────
  if (deckList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-8 animate-fade-in">
        <div className="text-center max-w-lg">
          <div className="text-7xl mb-4">📚</div>
          <h1 className="text-3xl font-bold text-[var(--text)] mb-3">
            Chào mừng đến VocabMaster!
          </h1>
          <p className="text-[var(--text-muted)] text-base leading-relaxed">
            Học từ vựng thông minh với thuật toán SM-2 và nhiều chế độ học thú vị.
            Tạo học phần đầu tiên hoặc import từ file CSV để bắt đầu!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/create-set" className="btn-primary px-6 py-3 text-base">
            <Plus size={18} />
            Tạo học phần đầu tiên
          </Link>
          <Link href="/import" className="btn-ghost px-6 py-3 text-base">
            <FileText size={18} />
            Import CSV
          </Link>
        </div>

        {/* Study mode showcase */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full max-w-2xl mt-4">
          {studyModes.map((m) => (
            <div
              key={m.label}
              className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center"
            >
              <div className="text-2xl mb-1.5">{m.icon}</div>
              <div className="font-semibold text-sm text-[var(--text)]">{m.label}</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* ── Greeting + Daily Goal ────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">
            {settings.userName
              ? `Chào mừng trở lại, ${settings.userName}! 👋`
              : 'Chào mừng trở lại! 👋'}
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {deckList.length} học phần · {totalCards} thẻ · {masteredCards} đã thuộc
          </p>
        </div>

        {/* Daily Goal Progress */}
        <div className="flex items-center gap-3 bg-[var(--card)] border border-[var(--border)] rounded-xl px-4 py-3 min-w-[200px]">
          <div className="w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-950/30 text-orange-500 flex items-center justify-center flex-shrink-0">
            <Target size={18} />
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

      {/* ── Stats Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: <BookOpen size={18} />, label: 'Học phần', value: deckList.length, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30' },
          { icon: <CreditCard size={18} />, label: 'Tổng thẻ', value: totalCards, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30' },
          { icon: <Zap size={18} />, label: 'Đã thuộc', value: masteredCards, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
          { icon: <Flame size={18} />, label: 'Hôm nay', value: todayStudied, color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/30' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4">
            <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-[var(--text)]">{stat.value}</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Recent Study Sets ─────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
            <Clock size={18} className="text-[var(--primary)]" />
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
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                  style={{ background: deck.color }}
                >
                  <BookOpen size={18} />
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
                    <span className="font-semibold" style={{ color: deck.color }}>{mastered}/{deck.cardCount}</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${pct}%`, background: deck.color }} />
                  </div>
                </div>
                <div
                  className="text-center py-2 rounded-lg text-white text-xs font-bold"
                  style={{ background: deck.color }}
                >
                  {deck.lastStudied ? 'Tiếp tục học' : 'Bắt đầu học'}
                </div>
              </Link>
            );
          })}

          {/* Add new deck card */}
          <Link
            href="/create-set"
            className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] transition-all group"
          >
            <div className="w-10 h-10 rounded-lg border-2 border-current flex items-center justify-center">
              <Plus size={20} />
            </div>
            <span className="text-sm font-semibold">Tạo học phần</span>
          </Link>
        </div>
      </section>

      {/* ── Recent Folders ────────────────────────────────────── */}
      {folderList.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--text)] flex items-center gap-2">
              <Folder size={18} className="text-[var(--primary)]" />
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
                <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                  <Folder size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[var(--text)] text-sm truncate">{folder.name}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {folder.deckIds.length} học phần
                  </p>
                </div>
                <ChevronRight size={16} className="text-[var(--text-muted)] flex-shrink-0" />
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Study Modes ───────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-bold text-[var(--text)] mb-4">Chế độ học</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {studyModes.map((m) => (
            <Link key={m.label} href={m.href} className="study-mode-btn">
              <span className="mode-icon">{m.icon}</span>
              <span className="mode-label">{m.label}</span>
              <span className="text-xs text-[var(--text-muted)]">{m.desc}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
