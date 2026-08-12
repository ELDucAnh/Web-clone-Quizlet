'use client';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Timer as TimerIcon } from 'lucide-react';
import { useStore } from '@/lib/store';
import { shuffleArray } from '@/lib/shuffle';
import { FlashCard, FlashCardNav } from '@/components/FlashCard';
import { MultipleChoice } from '@/components/MultipleChoice';
import { TypeAnswer } from '@/components/TypeAnswer';
import { MatchGame } from '@/components/MatchGame';
import { GravityGame } from '@/components/GravityGame';
import { ResultScreen } from '@/components/ResultScreen';
import { ProgressBar } from '@/components/ProgressBar';
import { v4 as uuidv4 } from 'uuid';
import type { Card } from '@/lib/types';

type StudyMode = 'flashcard' | 'learn' | 'match' | 'gravity' | 'test';
type LearnStage = 'mcq1' | 'type1' | 'mcq2' | 'type2';
const LEARN_STAGES: LearnStage[] = ['mcq1', 'type1', 'mcq2', 'type2'];

function LearnContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const deckId = params.deckId as string;
  const modeParam = (searchParams.get('mode') || 'flashcard') as StudyMode;

  const { decks, cards, cardsByDeck, settings, progress, updateProgress, addSession, toggleStarCard } = useStore();

  const deck = decks[deckId];
  const rawIds = cardsByDeck[deckId] ?? [];
  const allCards: Card[] = rawIds.map(id => cards[id]).filter(Boolean);

  const [studyCards, setStudyCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [fcFlipped, setFcFlipped] = useState(false);
  const [learnStageMap, setLearnStageMap] = useState<Record<string, number>>({});
  const [learnCorrect, setLearnCorrect] = useState(0);
  const [mounted, setMounted] = useState(false);

  const startTime = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (allCards.length === 0) return;
    const shuffled = settings.shuffleCards ? shuffleArray([...allCards]) : [...allCards];
    setStudyCards(shuffled);
    setCurrentIndex(0);
    setCorrectCount(0);
    setDone(false);
    setFcFlipped(false);
    setLearnStageMap({});
    setLearnCorrect(0);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckId, modeParam]);

  useEffect(() => {
    if (!settings.showTimer) return;
    timerRef.current = setInterval(() => setElapsedSecs(s => s + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [settings.showTimer]);

  const finishSession = useCallback((correct: number, total: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCorrectCount(correct);
    setDone(true);
    addSession({
      id: uuidv4(),
      deckId,
      mode: modeParam,
      startedAt: startTime.current,
      completedAt: Date.now(),
      totalCards: total,
      correctCount: correct,
      score: total > 0 ? Math.round((correct / total) * 100) : 0,
    });
  }, [deckId, modeParam, addSession]);

  const handleRestart = () => {
    setDone(false);
    setCurrentIndex(0);
    setCorrectCount(0);
    setElapsedSecs(0);
    setFcFlipped(false);
    setLearnStageMap({});
    setLearnCorrect(0);
    startTime.current = Date.now();
    const shuffled = settings.shuffleCards ? shuffleArray([...allCards]) : [...allCards];
    setStudyCards(shuffled);
    if (settings.showTimer) {
      timerRef.current = setInterval(() => setElapsedSecs(s => s + 1), 1000);
    }
  };

  // Learn mode handler
  const handleLearnAnswer = (isCorrect: boolean) => {
    const card = studyCards[currentIndex];
    const stageIdx = learnStageMap[card.id] ?? 0;
    if (isCorrect) {
      const nextStage = stageIdx + 1;
      if (nextStage >= LEARN_STAGES.length) {
        updateProgress(card.id, { learnStage: 'mastered', repetitions: (progress[card.id]?.repetitions ?? 0) + 1 });
        const nc = learnCorrect + 1;
        setLearnCorrect(nc);
        if (currentIndex + 1 >= studyCards.length) {
          finishSession(nc, studyCards.length);
        } else {
          setCurrentIndex(i => i + 1);
        }
      } else {
        setLearnStageMap(p => ({ ...p, [card.id]: nextStage }));
        setCurrentIndex(i => (i + 1) % studyCards.length);
      }
    } else {
      setLearnStageMap(p => ({ ...p, [card.id]: Math.max(0, stageIdx - 1) }));
      setCurrentIndex(i => (i + 1) % studyCards.length);
    }
  };

  // Test/MCQ handler
  const handleTestAnswer = (isCorrect: boolean) => {
    const nc = correctCount + (isCorrect ? 1 : 0);
    setCorrectCount(nc);
    if (currentIndex + 1 >= studyCards.length) {
      finishSession(nc, studyCards.length);
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (!mounted) return null;

  const modeLabels: Record<StudyMode, string> = {
    flashcard: '🎴 Thẻ ghi nhớ',
    learn: '🧠 Học',
    match: '🧩 Ghép thẻ',
    gravity: '☄️ Gravity',
    test: '📝 Kiểm tra',
  };

  if (!deck) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Link href="/" className="btn-primary"><ArrowLeft size={16} /> Về trang chủ</Link>
      </div>
    );
  }

  const currentCard = studyCards[currentIndex];

  return (
    <div className="flex flex-col gap-4 max-w-3xl mx-auto animate-fade-in">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Link href={`/study/${deckId}`} className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors flex-shrink-0">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-bold text-[var(--text)] truncate">{modeLabels[modeParam]}</h1>
          <p className="text-xs text-[var(--text-muted)] truncate">{deck.name}</p>
        </div>
        {settings.showTimer && (
          <div className="flex items-center gap-1.5 text-sm font-mono font-semibold text-[var(--text-muted)] flex-shrink-0">
            <TimerIcon size={14} /> {elapsedSecs}s
          </div>
        )}
      </div>

      {/* ── Done Screen ────────────────────────────────── */}
      {done && (
        <ResultScreen
          totalCards={studyCards.length}
          correctCount={correctCount}
          mode={modeParam}
          deckId={deckId}
          timeSeconds={elapsedSecs}
          onRestart={handleRestart}
        />
      )}

      {/* ── Flashcard Mode ─────────────────────────────── */}
      {!done && modeParam === 'flashcard' && studyCards.length > 0 && currentCard && (
        <div className="flex flex-col gap-4">
          <ProgressBar current={currentIndex} total={studyCards.length} label={`${currentIndex + 1} / ${studyCards.length}`} />
          <FlashCard
            card={currentCard}
            flipped={fcFlipped}
            onFlip={() => setFcFlipped(f => !f)}
            showSide={settings.answerLanguage === 'definition' ? 'term' : 'definition'}
          />
          <FlashCardNav
            current={currentIndex}
            total={studyCards.length}
            onPrev={() => { setCurrentIndex(i => Math.max(0, i - 1)); setFcFlipped(false); }}
            onNext={() => {
              setFcFlipped(false);
              if (currentIndex + 1 >= studyCards.length) {
                finishSession(studyCards.length, studyCards.length);
              } else {
                setCurrentIndex(i => i + 1);
              }
            }}
            onReset={() => { setCurrentIndex(0); setFcFlipped(false); }}
          />
        </div>
      )}

      {/* ── Learn Mode ─────────────────────────────────── */}
      {!done && modeParam === 'learn' && studyCards.length > 0 && currentCard && (
        <div className="flex flex-col gap-4">
          <ProgressBar current={learnCorrect} total={studyCards.length} label={`Đã thuộc: ${learnCorrect} / ${studyCards.length}`} />
          {(() => {
            const stageIdx = learnStageMap[currentCard.id] ?? 0;
            const stage = LEARN_STAGES[stageIdx];
            const isType = stage.startsWith('type');
            return isType ? (
              <TypeAnswer
                card={currentCard}
                questionField={settings.answerLanguage === 'definition' ? 'term' : 'definition'}
                answerField={settings.answerLanguage === 'definition' ? 'definition' : 'term'}
                onAnswer={handleLearnAnswer}
              />
            ) : (
              <MultipleChoice
                card={currentCard}
                allCards={allCards}
                questionField={settings.answerLanguage === 'definition' ? 'term' : 'definition'}
                answerField={settings.answerLanguage === 'definition' ? 'definition' : 'term'}
                onAnswer={handleLearnAnswer}
              />
            );
          })()}
        </div>
      )}

      {/* ── Test Mode ──────────────────────────────────── */}
      {!done && modeParam === 'test' && studyCards.length > 0 && currentCard && (
        <div className="flex flex-col gap-4">
          <ProgressBar current={currentIndex} total={studyCards.length} label={`Câu ${currentIndex + 1} / ${studyCards.length}`} />
          <MultipleChoice
            card={currentCard}
            allCards={allCards}
            questionField={settings.answerLanguage === 'definition' ? 'term' : 'definition'}
            answerField={settings.answerLanguage === 'definition' ? 'definition' : 'term'}
            onAnswer={handleTestAnswer}
          />
        </div>
      )}

      {/* ── Match Game ─────────────────────────────────── */}
      {!done && modeParam === 'match' && (
        <MatchGame
          cards={allCards.slice(0, 8)}
          onComplete={(correct, elapsed) => finishSession(correct, Math.min(8, allCards.length))}
        />
      )}

      {/* ── Gravity Mode ───────────────────────────────── */}
      {!done && modeParam === 'gravity' && (
        <GravityGame
          cards={allCards}
          onComplete={(correct, total) => finishSession(correct, total)}
        />
      )}
    </div>
  );
}

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-[var(--text-muted)]">Đang tải...</div>}>
      <LearnContent />
    </Suspense>
  );
}
