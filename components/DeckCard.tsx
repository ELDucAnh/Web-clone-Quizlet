'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MoreVertical, BookOpen, RotateCcw, Trash2, TrendingUp, Star } from 'lucide-react';
import type { Deck, CardProgress, Card } from '@/lib/types';

interface DeckCardProps {
  deck: Deck;
  progress: Record<string, CardProgress>;
  cardIds: string[];
  cards?: Record<string, Card>;
  onDelete: () => void;
  onReset: () => void;
}

export function DeckCard({ deck, progress, cardIds, cards, onDelete, onReset }: DeckCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const masteredCount = cardIds.filter(
    (id) => progress[id]?.learnStage === 'mastered'
  ).length;
  const progressPct =
    deck.cardCount > 0 ? Math.round((masteredCount / deck.cardCount) * 100) : 0;

  const starredCount = cards
    ? cardIds.filter((id) => cards[id]?.starred).length
    : 0;

  const handleDelete = () => { setMenuOpen(false); onDelete(); };
  const handleReset = () => { setMenuOpen(false); onReset(); };

  return (
    <div
      className="relative bg-[var(--card)] rounded-xl border border-[var(--border)] flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-[var(--primary)] hover:-translate-y-0.5"
    >
      <div className="p-5 flex-1 flex flex-col gap-3">
        {/* Title + menu */}
        <div className="flex items-start justify-between gap-2">
          <Link href={`/study/${deck.id}`} className="flex-1 min-w-0 group">
            <h3 className="font-bold text-[var(--text)] truncate group-hover:text-[var(--primary)] transition-colors text-base">
              {deck.name}
            </h3>
            {deck.description && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{deck.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-[var(--text-muted)]">{deck.cardCount} thẻ</span>
              {starredCount > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-amber-500">
                  <Star size={10} fill="#F59E0B" /> {starredCount}
                </span>
              )}
            </div>
          </Link>

          {/* 3-dot menu */}
          <div className="relative">
            <button
              id={`deck-menu-${deck.id}`}
              aria-label="Tùy chọn"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MoreVertical size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-9 z-20 w-48 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl animate-scale-in overflow-hidden">
                  <Link
                    href={`/study/${deck.id}`}
                    className="flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-[var(--bg)] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <BookOpen size={15} /> Xem học phần
                  </Link>
                  <button
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-[var(--bg)] transition-colors text-left"
                    onClick={handleReset}
                  >
                    <RotateCcw size={15} /> Đặt lại tiến độ
                  </button>
                  <button
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                    onClick={handleDelete}
                  >
                    <Trash2 size={15} /> Xóa học phần
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Progress */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1">
              <TrendingUp size={12} /> Tiến độ
            </span>
            <span className="font-semibold text-[var(--primary)] text-xs">
              {masteredCount}/{deck.cardCount}
            </span>
          </div>
          <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-[var(--primary)]"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/study/${deck.id}`}
          className="mt-auto block text-center py-2.5 px-4 rounded-xl font-semibold text-sm text-white bg-[var(--primary)] transition-all duration-200 hover:opacity-90 active:scale-95"
        >
          {deck.lastStudied ? 'Tiếp tục học' : 'Bắt đầu học'}
        </Link>
      </div>
    </div>
  );
}
