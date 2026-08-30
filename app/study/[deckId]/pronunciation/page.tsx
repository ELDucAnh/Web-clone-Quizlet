'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Mic, MicOff, Volume2, Check, X, RotateCcw,
  ChevronRight, Loader2, Trophy, Sparkles, MicVocal
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { shuffleArray } from '@/lib/shuffle';
import type { Card } from '@/lib/types';

// ── Normalize for comparison ──────────────────────────────────────────────────
function normalize(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s'-]/g, '') // strip punctuation except apostrophes & hyphens
    .replace(/\s+/g, ' ');
}

// Levenshtein distance for fuzzy match
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function isSimilarEnough(spoken: string, target: string): boolean {
  const a = normalize(spoken);
  const b = normalize(target);
  if (a === b) return true;
  // Allow up to 20% edit distance for longer words, max 2 for short
  const maxDist = Math.max(2, Math.floor(b.length * 0.2));
  return levenshtein(a, b) <= maxDist;
}

// ── TTS playback ──────────────────────────────────────────────────────────────
function playWord(text: string) {
  const url = `/api/tts?text=${encodeURIComponent(text)}&v=3`;
  const audio = new Audio(url);
  audio.play().catch(() => {
    // Silent fallback
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    window.speechSynthesis.speak(utter);
  });
}

// ── Result state ──────────────────────────────────────────────────────────────
type CardResult = 'correct' | 'wrong' | null;

export default function PronunciationPage() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.deckId as string;

  const { decks, cards, cardsByDeck, settings } = useStore();
  const [mounted, setMounted] = useState(false);

  // The queue of cards still to practice
  const [queue, setQueue] = useState<Card[]>([]);
  // Cards that have been correctly pronounced
  const [done, setDone] = useState<Card[]>([]);
  // Total cards at start
  const [total, setTotal] = useState(0);

  // Speech recognition state
  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [lastResult, setLastResult] = useState<CardResult>(null);
  const [spokenText, setSpokenText] = useState('');
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  // Auto-advance timer
  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setMounted(true); }, []);

  // Init queue from deck cards
  useEffect(() => {
    if (!mounted) return;
    const ids = cardsByDeck[deckId] ?? [];
    const deckCards = shuffleArray(
      ids.map(id => cards[id]).filter((c): c is Card => !!c)
    );
    setQueue(deckCards);
    setTotal(deckCards.length);
    setDone([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, deckId]);

  useEffect(() => {
    if (mounted && !decks[deckId]) router.replace('/');
  }, [mounted, deckId, decks, router]);

  const currentCard = queue[0] ?? null;
  const questionField = settings.answerLanguage === 'definition' ? 'term' : 'definition';
  // What the user should say aloud
  const targetText = currentCard ? currentCard[questionField] : '';

  // ── Auto-play word when card changes ─────────────────────────────────────────
  useEffect(() => {
    if (currentCard && mounted && lastResult === null) {
      const t = setTimeout(() => playWord(targetText), 400);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCard?.id, mounted]);

  // ── Speech recognition ────────────────────────────────────────────────────────
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    recognitionRef.current?.stop();
    setIsListening(false);
    setInterim('');
  }, []);

  const evaluateAnswer = useCallback((spoken: string, card: Card) => {
    const target = card[questionField];
    const correct = isSimilarEnough(spoken, target);
    setSpokenText(spoken);
    setLastResult(correct ? 'correct' : 'wrong');
    stopListening();

    // Auto advance after 1.8s (correct) or 2.5s (wrong)
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = setTimeout(() => {
      if (correct) {
        setDone(prev => [...prev, card]);
        setQueue(prev => prev.slice(1));
      } else {
        // Push to back of queue
        setQueue(prev => [...prev.slice(1), card]);
      }
      setLastResult(null);
      setSpokenText('');
      setInterim('');
    }, correct ? 1600 : 2400);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionField]);

  const startListening = useCallback(() => {
    if (!currentCard) return;
    if (advanceTimerRef.current) {
      clearTimeout(advanceTimerRef.current);
      setLastResult(null);
      setSpokenText('');
      setInterim('');
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Trình duyệt của bạn không hỗ trợ nhận dạng giọng nói. Hãy thử Chrome hoặc Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 3;

    let finalText = '';

    recognition.onresult = (e: any) => {
      let interimStr = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          finalText += transcript;
        } else {
          interimStr += transcript;
        }
      }
      setInterim(interimStr || finalText);
    };

    recognition.onend = () => {
      if (!isListeningRef.current) return;
      isListeningRef.current = false;
      setIsListening(false);
      if (finalText.trim()) {
        evaluateAnswer(finalText.trim(), currentCard);
      } else {
        setInterim('');
      }
    };

    recognition.onerror = (e: any) => {
      isListeningRef.current = false;
      setIsListening(false);
      setInterim('');
      if (e.error === 'not-allowed') {
        alert('Bạn cần cấp quyền truy cập microphone!');
      }
    };

    isListeningRef.current = true;
    setIsListening(true);
    setInterim('');
    recognition.start();
  }, [currentCard, evaluateAnswer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, [stopListening]);

  if (!mounted) return null;
  const deck = decks[deckId];
  if (!deck) return null;

  const completedCount = done.length;
  const progressPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  // ── Completion Screen ────────────────────────────────────────────────────────
  if (total > 0 && completedCount === total) {
    return (
      <div className="min-h-dvh flex flex-col bg-[var(--bg)]">
        <header className="sticky top-0 z-30 bg-[var(--card)]/80 backdrop-blur-lg border-b border-[var(--border)]">
          <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
            <Link href={`/study/${deckId}`} className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <span className="font-bold text-[var(--text)] truncate">{deck.name} — Luyện phát âm</span>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 gap-8 max-w-lg mx-auto w-full text-center animate-fade-in">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-2xl shadow-emerald-500/30">
              <Trophy size={44} className="text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-md">
              <Sparkles size={16} className="text-white" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-black text-[var(--text)] mb-2">Xuất sắc! 🎉</h1>
            <p className="text-[var(--text-muted)] text-lg">
              Bạn đã phát âm đúng tất cả <strong className="text-[var(--text)]">{total} từ</strong>
            </p>
          </div>

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={() => {
                const ids = cardsByDeck[deckId] ?? [];
                const deckCards = shuffleArray(ids.map(id => cards[id]).filter((c): c is Card => !!c));
                setQueue(deckCards);
                setTotal(deckCards.length);
                setDone([]);
                setLastResult(null);
                setSpokenText('');
              }}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-[var(--primary)] text-white font-bold text-lg hover:bg-[var(--primary-hover)] shadow-lg shadow-[var(--primary)]/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <RotateCcw size={20} /> Luyện lại
            </button>
            <Link
              href={`/study/${deckId}`}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border border-[var(--border)] text-[var(--text)] font-semibold hover:bg-[var(--bg)] transition-all"
            >
              <ArrowLeft size={18} /> Về học phần
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ── Empty deck guard ─────────────────────────────────────────────────────────
  if (total === 0 && mounted) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 text-[var(--text-muted)]">
        <MicVocal size={40} />
        <p className="font-semibold">Học phần này chưa có từ vựng nào.</p>
        <Link href={`/study/${deckId}`} className="btn-primary">Quay lại</Link>
      </div>
    );
  }

  // ── Main Practice Screen ─────────────────────────────────────────────────────
  const remaining = queue.length;

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--bg)]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 bg-[var(--card)]/80 backdrop-blur-lg border-b border-[var(--border)]">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link
            href={`/study/${deckId}`}
            onClick={stopListening}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-sm text-[var(--text)] truncate">{deck.name} — Luyện phát âm</h1>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">
            <Check size={13} /> {completedCount}/{total}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
        {/* ── Progress bar ── */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2.5 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #10B981, #34D399)',
              }}
            />
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">{progressPct}%</span>
        </div>

        {/* ── Queue indicator ── */}
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 min-w-[8px] max-w-[24px] rounded-full transition-all duration-300 ${
                i < completedCount
                  ? 'bg-emerald-400'
                  : i === completedCount
                  ? 'bg-[var(--primary)] scale-y-150'
                  : 'bg-[var(--border)]'
              }`}
            />
          ))}
        </div>

        {/* ── Card ── */}
        {currentCard && (
          <div className={`relative bg-[var(--card)] rounded-3xl border-2 shadow-xl transition-all duration-300 overflow-hidden ${
            lastResult === 'correct'
              ? 'border-emerald-400 shadow-emerald-400/20'
              : lastResult === 'wrong'
              ? 'border-red-400 shadow-red-400/20'
              : 'border-[var(--border)]'
          }`}>
            {/* Result overlay */}
            {lastResult && (
              <div className={`absolute inset-0 flex items-center justify-center z-10 ${
                lastResult === 'correct'
                  ? 'bg-emerald-500/10'
                  : 'bg-red-500/10'
              }`}>
                <div className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl ${
                  lastResult === 'correct'
                    ? 'bg-emerald-500 shadow-emerald-500/50'
                    : 'bg-red-500 shadow-red-500/50'
                }`}>
                  {lastResult === 'correct'
                    ? <Check size={40} className="text-white" strokeWidth={3} />
                    : <X size={40} className="text-white" strokeWidth={3} />
                  }
                </div>
              </div>
            )}

            <div className="p-8 flex flex-col items-center gap-6">
              {/* Remaining badge */}
              <div className="self-end text-xs font-semibold text-[var(--text-muted)] bg-[var(--bg)] px-3 py-1 rounded-full">
                Còn lại {remaining} từ
              </div>

              {/* Definition (context) */}
              <div className="w-full text-center">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">
                  {questionField === 'term' ? 'Nghĩa' : 'Từ'}
                </p>
                <p className="text-[var(--text-muted)] text-base leading-relaxed">
                  {currentCard[questionField === 'term' ? 'definition' : 'term']}
                </p>
              </div>

              {/* Word to say */}
              <div className="w-full text-center py-6 px-4 bg-gradient-to-br from-[var(--primary-light)] to-blue-50 dark:to-blue-950/20 rounded-2xl border border-[var(--primary)]/20">
                <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-widest mb-3">
                  Hãy đọc từ này
                </p>
                <p
                  className="font-black text-[var(--text)] leading-none"
                  style={{ fontSize: targetText.length > 20 ? '1.8rem' : targetText.length > 10 ? '2.5rem' : '3rem' }}
                >
                  {targetText}
                </p>
                <button
                  onClick={() => playWord(targetText)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors"
                >
                  <Volume2 size={14} /> Nghe lại
                </button>
              </div>

              {/* Spoken result */}
              {spokenText && (
                <div className={`w-full text-center py-3 px-4 rounded-xl text-sm font-medium ${
                  lastResult === 'correct'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                }`}>
                  {lastResult === 'wrong' && (
                    <span className="block text-xs font-bold mb-1 opacity-70">Bạn đã đọc:</span>
                  )}
                  &ldquo;{spokenText}&rdquo;
                  {lastResult === 'wrong' && (
                    <span className="block text-xs mt-1 opacity-70">→ Sẽ luyện lại sau</span>
                  )}
                </div>
              )}

              {/* Interim (live transcript) */}
              {isListening && interim && (
                <div className="w-full text-center py-2 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 text-sm italic">
                  {interim}...
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Mic Button ── */}
        <div className="flex flex-col items-center gap-4">
          {!lastResult ? (
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all duration-200 active:scale-95 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/40 scale-110'
                  : 'bg-gradient-to-br from-[var(--primary)] to-indigo-600 hover:scale-105 shadow-[var(--primary)]/40'
              }`}
            >
              {/* Ripple animation when recording */}
              {isListening && (
                <>
                  <span className="absolute inset-0 rounded-full bg-red-400/40 animate-ping" />
                  <span className="absolute inset-[-6px] rounded-full border-2 border-red-400/30 animate-pulse" />
                </>
              )}
              {isListening
                ? <MicOff size={32} className="text-white" />
                : <Mic size={32} className="text-white" />
              }
            </button>
          ) : (
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              lastResult === 'correct' ? 'bg-emerald-100 dark:bg-emerald-950/40' : 'bg-red-100 dark:bg-red-950/40'
            }`}>
              <Loader2 size={28} className={`animate-spin ${lastResult === 'correct' ? 'text-emerald-500' : 'text-red-400'}`} />
            </div>
          )}

          <p className="text-sm font-medium text-[var(--text-muted)] text-center">
            {isListening
              ? '🎙️ Đang ghi âm... Bấm để dừng'
              : lastResult === 'correct'
              ? '✅ Chính xác! Chuyển từ tiếp theo...'
              : lastResult === 'wrong'
              ? '❌ Chưa đúng. Sẽ luyện lại sau...'
              : 'Bấm mic và đọc to từ phía trên'
            }
          </p>
        </div>

        {/* ── Skip button ── */}
        {!lastResult && !isListening && (
          <button
            onClick={() => {
              setQueue(prev => [...prev.slice(1), prev[0]]);
              setLastResult(null);
              setSpokenText('');
            }}
            className="self-center flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] transition-colors px-4 py-2 rounded-xl hover:bg-[var(--bg)]"
          >
            Bỏ qua từ này <ChevronRight size={14} />
          </button>
        )}
      </main>
    </div>
  );
}
