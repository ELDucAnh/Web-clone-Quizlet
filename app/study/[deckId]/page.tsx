'use client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, RotateCcw, Shuffle, Volume2, Star,
  BookOpen, Layers, Brain, PenLine, Shuffle as ShuffleIcon, Droplets,
  TrendingUp, Search, Pencil, Zap, MessageCircle, Headphones,
  MoreVertical, Trash2, Play, Pause, Folder, ChevronRight as CR,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { appConfirm } from '@/lib/dialog';
import { shuffleArray } from '@/lib/shuffle';
import type { Card } from '@/lib/types';

// ── TTS Helper ───────────────────────────────────────────────────────
function speak(text: string) {
  const url = `/api/tts?text=${encodeURIComponent(text)}&v=2`;
  const audio = new Audio(url);
  audio.play().catch(e => console.error("Audio play failed:", e));
}

// ── Flashcard Preview ────────────────────────────────────────────────
interface FlashcardPreviewProps {
  card: Card;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onShuffle: () => void;
  shuffled: boolean;
  starred: boolean;
  onToggleStar: () => void;
}

function FlashcardPreview({ card, index, total, onPrev, onNext, onShuffle, shuffled, starred, onToggleStar }: FlashcardPreviewProps) {
  const [flipped, setFlipped] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => { setFlipped(false); }, [card.id]);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setTimeout(() => {
      if (flipped) onNext(); else setFlipped(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, [autoPlay, flipped, onNext]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === ' ') { e.preventDefault(); setFlipped(f => !f); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); onPrev(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); onNext(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onPrev, onNext]);

  const front = card.term;
  const back = card.definition;
  const pct = Math.round(((index + 1) / total) * 100);

  return (
    <div className="flex flex-col gap-4">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-[var(--text)]">{index + 1}</span>
        <div className="flex-1 progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-sm text-[var(--text-muted)]">{total}</span>
      </div>

      {/* 3D Card */}
      <div
        className="card-container w-full cursor-pointer select-none"
        style={{ height: 'clamp(240px, 36vw, 340px)' }}
        onClick={() => setFlipped(f => !f)}
      >
        <div className={`card-inner w-full h-full ${flipped ? 'flipped' : ''}`}>
          {/* Front */}
          <div className="card-face bg-[var(--card)] border border-[var(--border)] card-shadow flex-col gap-4 p-8 rounded-2xl">
            <span className="absolute top-4 left-5 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">Từ vựng</span>
            <button className="absolute top-3 right-12 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors" onClick={e => { e.stopPropagation(); speak(front); }} aria-label="Phát âm">
              <Volume2 size={18} />
            </button>
            <button
              className="absolute top-3 right-4 transition-colors"
              style={{ color: starred ? '#F59E0B' : 'var(--text-muted)' }}
              onClick={e => { e.stopPropagation(); onToggleStar(); }}
            >
              <Star size={18} fill={starred ? '#F59E0B' : 'none'} />
            </button>
            <p className="text-center font-bold text-[var(--text)] leading-relaxed" dir="auto"
              style={{ fontSize: front.length > 80 ? '1rem' : front.length > 40 ? '1.35rem' : '1.875rem' }}>
              {front}
            </p>
            <span className="absolute bottom-4 text-xs text-[var(--text-muted)]/60">Nhấn để lật thẻ (Space)</span>
          </div>
          {/* Back */}
          <div className="card-face card-back-face bg-[var(--primary)] flex-col gap-4 p-8 rounded-2xl">
            <span className="absolute top-4 left-5 text-xs font-semibold uppercase tracking-widest text-white/60">Định nghĩa</span>
            <button className="absolute top-3 right-4 text-white/60 hover:text-white transition-colors" onClick={e => { e.stopPropagation(); speak(back); }}>
              <Volume2 size={18} />
            </button>
            <p className="text-center font-bold text-white leading-relaxed" dir="auto"
              style={{ fontSize: back.length > 80 ? '1rem' : back.length > 40 ? '1.35rem' : '1.875rem' }}>
              {back}
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <button onClick={onShuffle} className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${shuffled ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg)]'}`} title="Xáo trộn">
          <Shuffle size={17} />
        </button>
        <div className="flex items-center gap-3">
          <button onClick={onPrev} disabled={index === 0} className="w-11 h-11 rounded-xl flex items-center justify-center border border-[var(--border)] hover:bg-[var(--bg)] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setFlipped(false)} className="w-9 h-9 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors" title="Lật lại">
            <RotateCcw size={16} />
          </button>
          <button onClick={onNext} disabled={index === total - 1} className="w-11 h-11 rounded-xl flex items-center justify-center border border-[var(--border)] hover:bg-[var(--bg)] disabled:opacity-30 disabled:cursor-not-allowed transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
        <button onClick={() => setAutoPlay(v => !v)} className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${autoPlay ? 'bg-emerald-500 text-white border-emerald-500' : 'border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg)]'}`} title={autoPlay ? 'Dừng' : 'Tự động phát'}>
          {autoPlay ? <Pause size={17} /> : <Play size={17} />}
        </button>
      </div>
    </div>
  );
}

// ── Main Set Detail Page ─────────────────────────────────────────────
export default function SetDetailPage() {
  const params = useParams();
  const deckId = params.deckId as string;
  const { decks, cards, cardsByDeck, progress, folders, toggleStarCard, deleteDeck, resetDeckProgress } = useStore();
  const [mounted, setMounted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffled, setShuffled] = useState(false);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);
  const [termSearch, setTermSearch] = useState('');
  const [termFilter, setTermFilter] = useState<'all' | 'starred'>('all');
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const rawIds = useMemo(() => cardsByDeck[deckId] ?? [], [cardsByDeck, deckId]);

  useEffect(() => {
    setOrderedIds(rawIds);
    setCurrentIndex(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId]);

  const handleShuffle = useCallback(() => {
    if (shuffled) {
      setOrderedIds(rawIds);
    } else {
      setOrderedIds(shuffleArray([...rawIds]));
    }
    setShuffled(s => !s);
    setCurrentIndex(0);
  }, [shuffled, rawIds]);

  if (!mounted) return null;

  const deck = decks[deckId];
  if (!deck) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
          <BookOpen size={28} />
        </div>
        <h2 className="text-xl font-bold text-[var(--text)]">Không tìm thấy học phần</h2>
        <Link href="/" className="btn-primary"><ChevronLeft size={16} /> Về trang chủ</Link>
      </div>
    );
  }

  const currentCard = cards[orderedIds[currentIndex]];
  const folder = deck.folderId ? folders[deck.folderId] : null;
  const mastered = orderedIds.filter(id => progress[id]?.learnStage === 'mastered').length;
  const pct = deck.cardCount > 0 ? Math.round((mastered / deck.cardCount) * 100) : 0;
  const starredCount = orderedIds.filter(id => cards[id]?.starred).length;

  const termCardList = orderedIds
    .map(id => cards[id]).filter(Boolean)
    .filter(c => {
      if (termFilter === 'starred' && !c.starred) return false;
      if (termSearch && !c.term.toLowerCase().includes(termSearch.toLowerCase()) && !c.definition.toLowerCase().includes(termSearch.toLowerCase())) return false;
      return true;
    });

  const studyModes = [
    { icon: <Layers size={20} />, label: 'Thẻ ghi nhớ', href: `/learn/${deckId}?mode=flashcard` },
    { icon: <Brain size={20} />, label: pct === 100 ? 'Học lại' : (pct > 0 ? 'Học tiếp' : 'Học'), href: `/learn/${deckId}?mode=learn${pct === 100 ? '&resetSession=true' : ''}` },
    { icon: <PenLine size={20} />, label: 'Kiểm tra', href: `/learn/${deckId}?mode=test` },
    { icon: <ShuffleIcon size={20} />, label: 'Ghép thẻ', href: `/learn/${deckId}?mode=match` },
    { icon: <Droplets size={20} />, label: 'Gravity', href: `/learn/${deckId}?mode=gravity` },
    { icon: <MessageCircle size={20} />, label: 'Luyện hội thoại', href: `/learn/${deckId}?mode=conversation` },
    { icon: <Headphones size={20} />, label: 'Luyện nghe', href: `/learn/${deckId}?mode=listening` },
    { icon: <BookOpen size={20} />, label: 'Luyện đọc', href: `/learn/${deckId}?mode=reading` },
  ];

  return (
    <div className="flex flex-col gap-8 animate-fade-in">
      {/* ── Breadcrumb ─────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] flex-wrap">
        <Link href="/" className="hover:text-[var(--primary)] transition-colors">Trang chủ</Link>
        <CR size={14} />
        {folder ? (
          <>
            <Link href={`/folder/${folder.id}`} className="hover:text-[var(--primary)] transition-colors flex items-center gap-1">
              <Folder size={13} /> {folder.name}
            </Link>
            <CR size={14} />
          </>
        ) : (
          <>
            <Link href="/library" className="hover:text-[var(--primary)] transition-colors">Thư viện</Link>
            <CR size={14} />
          </>
        )}
        <span className="text-[var(--text)] font-medium truncate">{deck.name}</span>
      </div>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-[var(--text)] truncate">{deck.name}</h1>
          {deck.description && <p className="text-[var(--text-muted)] text-sm mt-1">{deck.description}</p>}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="badge badge-blue flex items-center gap-1"><BookOpen size={12} /> {deck.cardCount} thẻ</span>
            {folder && (
              <Link href={`/folder/${folder.id}`} className="badge badge-yellow flex items-center gap-1">
                <Folder size={12} /> {folder.name}
              </Link>
            )}
            <span className="text-xs text-[var(--text-muted)]">Đã thuộc: {mastered}/{deck.cardCount} ({pct}%)</span>
          </div>
        </div>
        <div className="relative flex-shrink-0">
          <button onClick={() => setShowMenu(v => !v)} className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors">
            <MoreVertical size={18} />
          </button>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-10 z-20 w-52 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl animate-scale-in overflow-hidden">
                <Link href={`/create-set?edit=${deckId}`} className="flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-[var(--bg)] transition-colors" onClick={() => setShowMenu(false)}>
                  <Pencil size={14} /> Chỉnh sửa học phần
                </Link>
                <button onClick={async () => { setShowMenu(false); if (await appConfirm('Đặt lại tiến độ?')) resetDeckProgress(deckId); }} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-[var(--bg)] transition-colors text-left">
                  <RotateCcw size={14} /> Đặt lại tiến độ
                </button>
                <button onClick={async () => { setShowMenu(false); if (await appConfirm(`Xóa học phần "${deck.name}"?`)) { deleteDeck(deckId); window.location.href = '/'; } }} className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left">
                  <Trash2 size={14} /> Xóa học phần
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Flashcard Preview ───────────────────────────────── */}
      {currentCard && (
        <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
          <FlashcardPreview
            card={currentCard}
            index={currentIndex}
            total={orderedIds.length}
            onPrev={() => setCurrentIndex(i => Math.max(0, i - 1))}
            onNext={() => setCurrentIndex(i => Math.min(orderedIds.length - 1, i + 1))}
            onShuffle={handleShuffle}
            shuffled={shuffled}
            starred={!!currentCard.starred}
            onToggleStar={() => toggleStarCard(currentCard.id)}
          />
        </section>
      )}

      {/* ── Study Modes ─────────────────────────────────── */}
      <section>
        <h2 className="text-base font-bold text-[var(--text)] mb-4">Chế độ học</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {studyModes.map(m => (
            <Link key={m.label} href={m.href} className="study-mode-btn">
              <span className="mode-icon">{m.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="mode-label block">{m.label}</span>
              </div>
              <ChevronRight size={15} className="text-[var(--text-muted)] flex-shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* ── Term List ───────────────────────────────────────── */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-lg font-bold text-[var(--text)]">Thuật ngữ ({deck.cardCount})</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setTermFilter('all')} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${termFilter === 'all' ? 'bg-[var(--primary)] text-white border-[var(--primary)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)]'}`}>
              Tất cả ({deck.cardCount})
            </button>
            <button onClick={() => setTermFilter('starred')} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1 ${termFilter === 'starred' ? 'bg-amber-500 text-white border-amber-500' : 'border-[var(--border)] text-[var(--text-muted)] hover:border-amber-500'}`}>
              <Star size={11} fill={termFilter === 'starred' ? 'white' : 'none'} /> Đã gắn sao ({starredCount})
            </button>
          </div>
        </div>
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input type="text" value={termSearch} onChange={e => setTermSearch(e.target.value)} placeholder="Tìm kiếm từ vựng..." className="w-full h-10 pl-9 pr-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] placeholder:text-[var(--text-muted)]" />
        </div>
        <div className="flex flex-col gap-2">
          {termCardList.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-muted)]"><p className="text-sm">Không tìm thấy từ vựng phù hợp</p></div>
          ) : termCardList.map((card, idx) => (
            <div key={card.id} className="term-row group">
              <span className="text-xs font-bold text-[var(--text-muted)] w-6 flex-shrink-0">{idx + 1}</span>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                <div className="sm:border-r border-[var(--border)] sm:pr-3">
                  <p className="font-semibold text-[var(--text)] text-sm leading-relaxed">{card.term}</p>
                </div>
                <div><p className="text-[var(--text-muted)] text-sm leading-relaxed">{card.definition}</p></div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button onClick={() => speak(card.term)} className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors" title="Phát âm">
                  <Volume2 size={14} />
                </button>
                <button onClick={() => toggleStarCard(card.id)} className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors" style={{ color: card.starred ? '#F59E0B' : 'var(--text-muted)' }} title={card.starred ? 'Bỏ gắn sao' : 'Gắn sao'}>
                  <Star size={14} fill={card.starred ? '#F59E0B' : 'none'} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
