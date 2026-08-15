'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import {
  Plus, BookOpen, Folder, TrendingUp, Target,
  CreditCard, Layers, Brain, PenLine,
  Shuffle, Droplets, ChevronRight, Zap,
} from 'lucide-react';
import { useStore } from '@/lib/store';

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const { decks, cardsByDeck, progress, folders, sessions, settings } = useStore();
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

  if (!mounted || status === 'loading') return null;

  // ── Premium Landing Page (Logged Out) ───────────────────────────────────────
  if (status === 'unauthenticated') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] py-20 px-4 text-center animate-fade-in">
        {/* Decorative background blur */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary)]/20 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-[var(--primary)]/30">
            <Brain size={40} className="drop-shadow-lg" />
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[var(--text)] to-[var(--text-muted)]">
          Làm chủ từ vựng IELTS <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] to-blue-400">
            nhanh gấp 3 lần
          </span>
        </h1>

        <p className="max-w-2xl text-lg md:text-xl text-[var(--text-muted)] mb-10 leading-relaxed">
          Ứng dụng học từ vựng đẳng cấp thế hệ mới, kết hợp thuật toán Spaced Repetition (Lặp lại ngắt quãng) và các trò chơi tương tác cuốn hút, giúp bạn ghi nhớ từ vựng mãi mãi.
        </p>

        <button
          onClick={() => signIn('google')}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-[var(--primary)] rounded-full overflow-hidden transition-all hover:scale-105 shadow-xl shadow-[var(--primary)]/40 hover:shadow-[var(--primary)]/60"
        >
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
          <span className="flex items-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Đăng nhập bằng Google
          </span>
        </button>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-left">
          {[
            { icon: <Zap size={24} />, title: "Học thông minh", desc: "Thuật toán tính toán điểm rơi trí nhớ, tự động nhắc lại từ vựng đúng lúc bạn chuẩn bị quên." },
            { icon: <Shuffle size={24} />, title: "Đa dạng chế độ", desc: "Không bao giờ nhàm chán với Flashcard, Trắc nghiệm, Điền từ, Ghép thẻ và trò chơi Gravity." },
            { icon: <Layers size={24} />, title: "Đồng bộ đám mây", desc: "Học mọi lúc mọi nơi. Dữ liệu của bạn được lưu trữ an toàn và đồng bộ hóa tức thì trên mọi thiết bị." }
          ].map((feature, i) => (
            <div key={i} className="p-6 bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[var(--primary-light)] text-[var(--primary)] rounded-2xl flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-[var(--text)] mb-2">{feature.title}</h3>
              <p className="text-[var(--text-muted)] leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
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
