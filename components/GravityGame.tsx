'use client';
import { useEffect, useRef, useState } from 'react';
import type { Card } from '@/lib/types';

interface FallingWord {
  id: string;
  cardId: string;
  term: string;
  definition: string;
  x: number;     // 0–100 percent
  top: number;   // px from top (negative = above viewport)
  speed: number; // px/s
  active: boolean;
}

interface GravityGameProps {
  cards: Card[];
  onComplete: (correct: number, total: number) => void;
}

export function GravityGame({ cards, onComplete }: GravityGameProps) {
  const [falling, setFalling] = useState<FallingWord | null>(null);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [answered, setAnswered] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);
  const [totalPlayed] = useState(Math.min(cards.length, 15));
  const inputRef = useRef<HTMLInputElement>(null);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const topRef = useRef<number>(-80);
  const livesRef = useRef(3);
  const answeredRef = useRef(0);
  const fallingRef = useRef<FallingWord | null>(null);
  const cardQueueRef = useRef<Card[]>([]);

  const spawnNext = () => {
    const queue = cardQueueRef.current;
    if (queue.length === 0) return;
    const card = queue.shift()!;
    const word: FallingWord = {
      id: Math.random().toString(36).slice(2),
      cardId: card.id,
      term: card.term,
      definition: card.definition,
      x: 10 + Math.random() * 60,
      top: -80,
      speed: 40 + Math.random() * 25,
      active: true,
    };
    topRef.current = -80;
    fallingRef.current = word;
    setFalling(word);
  };

  useEffect(() => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5).slice(0, totalPlayed);
    cardQueueRef.current = shuffled;
    livesRef.current = 3;
    answeredRef.current = 0;
    inputRef.current?.focus();
    spawnNext();

    const animate = (ts: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = ts;
      const dt = (ts - lastTimeRef.current) / 1000;
      lastTimeRef.current = ts;

      const w = fallingRef.current;
      if (!w) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      topRef.current += w.speed * dt;

      setFalling((prev) => prev ? { ...prev, top: topRef.current } : null);

      // Missed (fell off bottom ~550px)
      if (topRef.current > 520) {
        livesRef.current -= 1;
        setLives(livesRef.current);
        setShake(true);
        setTimeout(() => setShake(false), 500);

        if (livesRef.current <= 0) {
          cancelAnimationFrame(frameRef.current);
          setGameOver(true);
          onComplete(answeredRef.current, totalPlayed);
          return;
        }
        spawnNext();
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!falling || !input.trim()) return;

    const norm = (s: string) => s.trim().toLowerCase();
    const correct = norm(input) === norm(falling.definition) || norm(input) === norm(falling.term);

    if (correct) {
      setFlash('correct');
      setTimeout(() => setFlash(null), 600);
      setScore(s => s + 1);
      answeredRef.current += 1;
      setAnswered(a => a + 1);
      setInput('');
      spawnNext();

      if (answeredRef.current >= totalPlayed) {
        cancelAnimationFrame(frameRef.current);
        setGameOver(true);
        onComplete(answeredRef.current, totalPlayed);
      }
    } else {
      setFlash('wrong');
      setTimeout(() => setFlash(null), 600);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
    inputRef.current?.focus();
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]`} style={{ height: 600 }}>
      {/* HUD */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-4 z-10">
        <div className="flex gap-1">{Array.from({ length: 3 }).map((_, i) => (
          <span key={i} className={`text-xl ${i < lives ? 'opacity-100' : 'opacity-20'}`}>❤️</span>
        ))}</div>
        <div className="text-sm font-bold text-[var(--text)]">
          {answered}/{totalPlayed} từ
        </div>
        <div className="font-bold text-[var(--primary)] text-sm">⭐ {score} điểm</div>
      </div>

      {/* Falling word */}
      {falling && !gameOver && (
        <div
          className="absolute transition-none"
          style={{ left: `${falling.x}%`, top: falling.top }}
        >
          <div className={`px-4 py-3 rounded-xl text-white font-bold text-sm shadow-lg transition-colors ${flash === 'correct' ? 'bg-emerald-500' : flash === 'wrong' ? 'bg-red-500' : 'bg-gradient-to-r from-[#4255FF] to-[#7C3AED]'}`}>
            {falling.definition}
          </div>
        </div>
      )}

      {/* Input form */}
      {!gameOver && (
        <form
          onSubmit={handleSubmit}
          className="absolute bottom-0 left-0 right-0 p-4 bg-[var(--card)] border-t border-[var(--border)]"
        >
          <div className={`flex gap-2 ${shake ? 'animate-shake' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Gõ từ tiếng Anh tương ứng..."
              className="q-input flex-1"
              autoComplete="off"
              autoCorrect="off"
            />
            <button type="submit" className="btn-primary px-4 flex-shrink-0">↵</button>
          </div>
        </form>
      )}

      {/* Game over overlay */}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[var(--card)]/95 backdrop-blur-sm animate-fade-in">
          <div className="text-5xl">{score >= totalPlayed * 0.8 ? '🏆' : score >= totalPlayed * 0.5 ? '🌟' : '💪'}</div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[var(--text)]">{score}/{totalPlayed}</p>
            <p className="text-[var(--text-muted)] text-sm mt-1">từ đúng</p>
          </div>
        </div>
      )}
    </div>
  );
}
