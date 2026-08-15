'use client';
import { useState } from 'react';
import Link from 'next/link';
import { MoreVertical, BookOpen, RotateCcw, Trash2, Star } from 'lucide-react';
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

  const masteredCount = cardIds.filter((id) => progress[id]?.learnStage === 'mastered').length;
  const progressPct = deck.cardCount > 0 ? Math.round((masteredCount / deck.cardCount) * 100) : 0;
  const starredCount = cards ? cardIds.filter((id) => cards[id]?.starred).length : 0;
  const isComplete = progressPct === 100 && deck.cardCount > 0;

  const handleDelete = () => { setMenuOpen(false); onDelete(); };
  const handleReset = () => { setMenuOpen(false); onReset(); };

  return (
    <div className="relative bg-[var(--card)] rounded-xl border border-[var(--border)] flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md hover:border-[var(--border-strong)] hover:-translate-y-0.5">
      <div className="p-4 flex-1 flex flex-col gap-3">

        {/* Header: title + menu */}
        <div className="flex items-start justify-between gap-2">
          <Link href={`/study/${deck.id}`} className="flex-1 min-w-0 group">
            <h3 className="font-bold text-[var(--text)] truncate group-hover:text-[var(--primary)] transition-colors text-[0.9375rem] leading-snug tracking-tight">
              {deck.name}
            </h3>
            {deck.description && (
              <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{deck.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-[var(--text-muted)]">{deck.cardCount} thẻ</span>
              {starredCount > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-amber-500 font-medium">
                  <Star size={10} fill="currentColor" /> {starredCount}
                </span>
              )}
              {isComplete && (
                <span className="badge badge-green text-[10px]">Hoàn thành</span>
              )}
            </div>
          </Link>

          {/* 3-dot menu */}
          <div className="relative flex-shrink-0">
            <button
              id={`deck-menu-${deck.id}`}
              aria-label="Tùy chọn"
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[var(--bg-subtle)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              onClick={() => setMenuOpen((v) => !v)}
            >
              <MoreVertical size={15} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-8 z-20 w-44 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-lg animate-scale-in overflow-hidden">
                  <Link
                    href={`/study/${deck.id}`}
                    className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-colors"
                    onClick={() => setMenuOpen(false)}
                  >
                    <BookOpen size={14} className="text-[var(--text-muted)]" /> Xem học phần
                  </Link>
                  <button
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-[var(--text)] hover:bg-[var(--bg-subtle)] transition-colors text-left"
                    onClick={handleReset}
                  >
                    <RotateCcw size={14} className="text-[var(--text-muted)]" /> Đặt lại tiến độ
                  </button>
                  <div className="h-px bg-[var(--border)] mx-2" />
                  <button
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left"
                    onClick={handleDelete}
                  >
                    <Trash2 size={14} /> Xóa học phần
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--text-muted)]">{masteredCount}/{deck.cardCount} đã thuộc</span>
            <span className="text-xs font-bold text-[var(--primary)]">{progressPct}%</span>
          </div>
          <div className="progress-bar-track">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: isComplete
                  ? 'linear-gradient(90deg, #16A34A, #22C55E)'
                  : 'linear-gradient(90deg, var(--primary) 0%, #818CF8 100%)',
              }}
            />
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/study/${deck.id}`}
          className="block text-center py-2 px-4 rounded-lg font-semibold text-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors active:scale-95"
        >
          {isComplete ? 'Học lại' : deck.lastStudied ? 'Tiếp tục học' : 'Bắt đầu học'}
        </Link>
      </div>
    </div>
  );
}
