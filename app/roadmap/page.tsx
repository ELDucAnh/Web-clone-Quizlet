'use client';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Lock, Star, Trophy, ChevronDown, ChevronUp, BookOpen, Headphones, PenLine, Mic, Brain, Target, Flame, Calendar } from 'lucide-react';
import { ROADMAP, PHASES, type RoadmapDay, type Skill } from '@/lib/roadmap-data';

const STORAGE_KEY = 'ielts_roadmap_v1';

function loadProgress(): Set<number> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch { return new Set(); }
}

function saveProgress(completed: Set<number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(completed)));
}

const SKILL_META: Record<Skill, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
  vocab:     { color: '#8B5CF6', bg: '#F5F3FF', icon: <Brain size={14} />,     label: 'Từ vựng' },
  listening: { color: '#3B82F6', bg: '#EFF6FF', icon: <Headphones size={14} />, label: 'Listening' },
  reading:   { color: '#10B981', bg: '#ECFDF5', icon: <BookOpen size={14} />,  label: 'Reading' },
  writing:   { color: '#F59E0B', bg: '#FFFBEB', icon: <PenLine size={14} />,   label: 'Writing' },
  speaking:  { color: '#EF4444', bg: '#FEF2F2', icon: <Mic size={14} />,       label: 'Speaking' },
  grammar:   { color: '#6B7280', bg: '#F9FAFB', icon: <BookOpen size={14} />,  label: 'Ngữ pháp' },
  mock:      { color: '#F59E0B', bg: '#FFFBEB', icon: <Target size={14} />,    label: 'Mock Test' },
};

// zigzag positions for 5-per-row snake layout
const COLS = 5;
function getNodePosition(dayIndex: number): { col: number; row: number } {
  const row = Math.floor(dayIndex / COLS);
  const posInRow = dayIndex % COLS;
  const col = row % 2 === 0 ? posInRow : (COLS - 1 - posInRow);
  return { col, row };
}

interface NodeProps {
  day: RoadmapDay;
  status: 'done' | 'current' | 'locked';
  onClick: () => void;
}

function DayNode({ day, status, onClick }: NodeProps) {
  const phase = PHASES.find(p => p.id === day.phase)!;
  const isDone = status === 'done';
  const isCurrent = status === 'current';
  const isLocked = status === 'locked';

  return (
    <button
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className={`relative flex flex-col items-center group ${isLocked ? 'cursor-default' : 'cursor-pointer'}`}
      style={{ width: 72 }}
    >
      {/* Milestone crown */}
      {day.isMilestone && !isLocked && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2">
          <Trophy size={14} style={{ color: phase.color }} />
        </div>
      )}

      {/* Circle */}
      <div
        className={`relative flex items-center justify-center rounded-full font-black text-sm transition-all duration-300 ${
          isDone ? 'shadow-lg' : isCurrent ? 'shadow-2xl scale-110' : 'shadow-sm'
        }`}
        style={{
          width: day.isMilestone ? 64 : 56,
          height: day.isMilestone ? 64 : 56,
          background: isDone
            ? `linear-gradient(135deg, ${phase.color}, ${phase.color}cc)`
            : isCurrent
            ? `linear-gradient(135deg, ${phase.color}, ${phase.color}99)`
            : '#E5E7EB',
          border: isCurrent ? `3px solid ${phase.color}` : isDone ? 'none' : '2px solid #D1D5DB',
          boxShadow: isCurrent ? `0 0 20px ${phase.color}66, 0 0 40px ${phase.color}33` : undefined,
        }}
      >
        {/* Pulse ring for current */}
        {isCurrent && (
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-30"
            style={{ background: phase.color }}
          />
        )}

        {isDone ? (
          <Check size={22} color="white" strokeWidth={3} />
        ) : isLocked ? (
          <Lock size={16} color="#9CA3AF" />
        ) : (
          <span style={{ color: isCurrent ? 'white' : '#6B7280' }}>{day.day}</span>
        )}

        {/* Star for milestone */}
        {day.isMilestone && isDone && (
          <Star size={12} color="gold" fill="gold" className="absolute -top-1 -right-1" />
        )}
      </div>

      {/* Day number label */}
      <span
        className="mt-1.5 text-[10px] font-semibold leading-tight text-center"
        style={{ color: isLocked ? '#9CA3AF' : isDone ? phase.color : isCurrent ? phase.color : '#6B7280' }}
      >
        {isCurrent ? '📍 Hôm nay' : `Ngày ${day.day}`}
      </span>

      {/* Theme pill */}
      {(isDone || isCurrent) && (
        <span
          className="mt-0.5 text-[9px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap max-w-[80px] truncate"
          style={{ background: phase.bg, color: phase.color }}
        >
          {day.theme.split(' & ')[0]}
        </span>
      )}
    </button>
  );
}

export default function RoadmapPage() {
  const [mounted, setMounted] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [selectedDay, setSelectedDay] = useState<RoadmapDay | null>(null);
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const currentDayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setCompleted(loadProgress());
  }, []);

  // Auto-scroll to current day on load
  useEffect(() => {
    if (mounted && currentDayRef.current) {
      setTimeout(() => {
        currentDayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [mounted]);

  const getStatus = (day: number): 'done' | 'current' | 'locked' => {
    if (completed.has(day)) return 'done';
    // Current = the first uncompleted day (all previous must be done, or day 1)
    if (day === 1 || completed.has(day - 1)) return 'current';
    return 'locked';
  };

  const handleToggleComplete = (day: number) => {
    const status = getStatus(day);
    if (status === 'locked') return;

    setCompleted(prev => {
      const next = new Set(Array.from(prev));
      if (next.has(day)) {
        // Uncomplete: also uncheck all subsequent completed days
        for (let d = day; d <= 140; d++) next.delete(d);
      } else {
        next.add(day);
      }
      saveProgress(next);
      return next;
    });
    setSelectedDay(null);
  };

  const completedCount = completed.size;
  const progressPct = Math.round((completedCount / 140) * 100);
  const currentDay = ROADMAP.find(d => getStatus(d.day) === 'current');
  const streakDays = (() => {
    let streak = 0;
    for (let d = completedCount; d >= 1; d--) {
      if (completed.has(d)) streak++;
      else break;
    }
    return streak;
  })();

  if (!mounted) return null;

  // Group days into rows of COLS
  const rows: RoadmapDay[][] = [];
  for (let i = 0; i < ROADMAP.length; i += COLS) {
    rows.push(ROADMAP.slice(i, i + COLS));
  }

  // Render snake: odd rows reversed
  const snakeRows = rows.map((row, rowIndex) =>
    rowIndex % 2 === 0 ? row : [...row].reverse()
  );

  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      {/* ── Sticky Header ──────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-[var(--card)]/90 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-[var(--text)] text-base truncate">🗺️ Lộ Trình IELTS 7.5</h1>
            <p className="text-xs text-[var(--text-muted)]">140 ngày · 3h/ngày · Mục tiêu: 20/01/2027</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-orange-500 font-bold text-sm">
              <Flame size={16} /> <span>{streakDays}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full font-bold text-sm">
              <Check size={14} /> {completedCount}/140
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-[var(--border)]">
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #10B981, #3B82F6, #8B5CF6, #F59E0B)',
            }}
          />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 flex flex-col gap-8">
        {/* ── Stats Row ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PHASES.map(p => {
            const pDays = ROADMAP.filter(d => d.phase === p.id);
            const pDone = pDays.filter(d => completed.has(d.day)).length;
            const pPct = Math.round((pDone / pDays.length) * 100);
            return (
              <div key={p.id} className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--text-muted)]">Phase {p.id}</span>
                  <span className="text-xs font-black" style={{ color: p.color }}>{pPct}%</span>
                </div>
                <p className="text-[11px] font-bold text-[var(--text)] leading-tight">{p.name}</p>
                <p className="text-[10px] text-[var(--text-muted)]">{p.bandRange}</p>
                <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pPct}%`, background: p.color }} />
                </div>
                <p className="text-[10px] text-[var(--text-muted)]">{pDone}/{pDays.length} ngày</p>
              </div>
            );
          })}
        </div>

        {/* ── Current Day Banner ────────────────────────────── */}
        {currentDay && (
          <div
            className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-all shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${PHASES.find(p => p.id === currentDay.phase)!.color}22, ${PHASES.find(p => p.id === currentDay.phase)!.color}11)`,
              border: `1.5px solid ${PHASES.find(p => p.id === currentDay.phase)!.color}44`,
            }}
            onClick={() => setSelectedDay(currentDay)}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white flex-shrink-0 shadow-lg"
              style={{ background: PHASES.find(p => p.id === currentDay.phase)!.color }}
            >
              {currentDay.day}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--text-muted)] mb-0.5">📍 Hôm nay • Tuần {currentDay.week} • {currentDay.theme}</p>
              <p className="font-bold text-[var(--text)] text-base truncate">{currentDay.dayTitle}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {currentDay.tasks.map(t => `${t.emoji} ${t.duration}p`).join(' · ')}
              </p>
            </div>
            <Calendar size={20} className="text-[var(--text-muted)] flex-shrink-0" />
          </div>
        )}

        {/* ── Phase banners + Snake Tree ────────────────────── */}
        <div className="flex flex-col gap-1">
          {snakeRows.map((row, rowIndex) => {
            // Check if we need a phase banner before this row
            const firstDayInRow = rows[rowIndex][0]; // original order
            const isPhaseStart = firstDayInRow.day === 1 || firstDayInRow.day === 36 || firstDayInRow.day === 71 || firstDayInRow.day === 106;
            const phase = PHASES.find(p => p.id === firstDayInRow.phase)!;

            return (
              <div key={rowIndex}>
                {/* Phase banner */}
                {isPhaseStart && (
                  <div
                    className="rounded-2xl p-4 mb-4 mt-2 cursor-pointer select-none"
                    style={{
                      background: `linear-gradient(135deg, ${phase.color}20, ${phase.color}08)`,
                      border: `1.5px solid ${phase.color}40`,
                    }}
                    onClick={() => setExpandedPhase(prev => prev === phase.id ? null : phase.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ background: phase.color }}>
                          {phase.id}
                        </div>
                        <div>
                          <p className="font-black text-[var(--text)]">Phase {phase.id}: {phase.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">Ngày {phase.days[0]}–{phase.days[1]} · Mục tiêu {phase.bandRange}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: phase.bg, color: phase.color }}>
                          {Math.round((ROADMAP.filter(d => d.phase === phase.id && completed.has(d.day)).length / 35) * 100)}%
                        </span>
                        {expandedPhase === phase.id ? <ChevronUp size={16} className="text-[var(--text-muted)]" /> : <ChevronDown size={16} className="text-[var(--text-muted)]" />}
                      </div>
                    </div>
                    {expandedPhase === phase.id && (
                      <p className="text-sm text-[var(--text-muted)] mt-2 ml-13 pl-1">{phase.description}</p>
                    )}
                  </div>
                )}

                {/* Node row */}
                <div
                  ref={row.some(d => getStatus(d.day) === 'current') ? currentDayRef : undefined}
                  className="relative flex justify-around items-end py-3 px-2"
                >
                  {/* Connecting line between rows */}
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-3"
                    style={{ background: '#E5E7EB' }}
                  />

                  {/* Nodes */}
                  {row.map(day => (
                    <DayNode
                      key={day.day}
                      day={day}
                      status={getStatus(day.day)}
                      onClick={() => setSelectedDay(day)}
                    />
                  ))}
                </div>

                {/* Horizontal connector at bottom of row */}
                {rowIndex < snakeRows.length - 1 && (
                  <div className="flex items-center justify-center h-4">
                    <div className="w-0.5 h-full" style={{ background: '#E5E7EB' }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ── Completion Message ────────────────────────────── */}
        {completedCount === 140 && (
          <div className="text-center py-12 flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-yellow-500/30">
              <Trophy size={44} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-[var(--text)]">🎓 Hoàn Thành 140 Ngày!</h2>
            <p className="text-[var(--text-muted)]">Bạn đã chinh phục hành trình từ 5.5 lên 7.5.<br />Chúc bạn thi đạt điểm mơ ước! 🏆</p>
          </div>
        )}
      </main>

      {/* ── Day Detail Modal ───────────────────────────────── */}
      {selectedDay && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedDay(null)} />
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto bg-[var(--card)] rounded-t-3xl shadow-2xl animate-slide-up-sheet">
            <div className="sticky top-0 bg-[var(--card)] px-6 pt-5 pb-3 border-b border-[var(--border)] z-10">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {selectedDay.isMilestone && (
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Trophy size={14} className="text-amber-500" />
                      <span className="text-xs font-bold text-amber-600">{selectedDay.milestoneLabel}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-[var(--text-muted)]">
                      Ngày {selectedDay.day} · Tuần {selectedDay.week}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: PHASES.find(p => p.id === selectedDay.phase)!.bg,
                        color: PHASES.find(p => p.id === selectedDay.phase)!.color,
                      }}
                    >
                      Phase {selectedDay.phase}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-[var(--text)]">{selectedDay.dayTitle}</h2>
                  <p className="text-sm text-[var(--text-muted)] mt-0.5">📚 Chủ đề: {selectedDay.theme}</p>
                </div>
                <button onClick={() => setSelectedDay(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors text-lg">×</button>
              </div>
            </div>

            <div className="px-6 py-5 flex flex-col gap-4">
              {/* Total time */}
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Target size={15} />
                <span>Tổng thời gian: <strong className="text-[var(--text)]">
                  {selectedDay.tasks.reduce((s, t) => s + t.duration, 0)} phút (3 giờ)
                </strong></span>
              </div>

              {/* Tasks */}
              <div className="flex flex-col gap-3">
                {selectedDay.tasks.map((task, i) => {
                  const meta = SKILL_META[task.skill];
                  return (
                    <div
                      key={i}
                      className="flex gap-3 p-4 rounded-2xl border"
                      style={{ background: meta.bg, borderColor: `${meta.color}30` }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: meta.color, color: 'white' }}
                      >
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold" style={{ color: meta.color }}>{meta.label}</span>
                          <span className="text-xs text-[var(--text-muted)] ml-auto">{task.emoji} {task.duration} phút</span>
                        </div>
                        <p className="text-sm text-[var(--text)] leading-relaxed">{task.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Complete button */}
              <div className="pt-2 pb-4">
                {getStatus(selectedDay.day) === 'locked' ? (
                  <div className="flex items-center gap-2 justify-center py-4 text-[var(--text-muted)] text-sm">
                    <Lock size={16} /> Hoàn thành ngày trước để mở khóa
                  </div>
                ) : completed.has(selectedDay.day) ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 justify-center py-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold">
                      <Check size={18} strokeWidth={3} /> Đã hoàn thành ngày này!
                    </div>
                    <button
                      onClick={() => handleToggleComplete(selectedDay.day)}
                      className="text-xs text-center text-[var(--text-muted)] hover:text-red-500 transition-colors py-1"
                    >
                      Bỏ đánh dấu hoàn thành
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleToggleComplete(selectedDay.day)}
                    className="w-full py-4 rounded-2xl font-black text-white text-lg shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all"
                    style={{
                      background: `linear-gradient(135deg, ${PHASES.find(p => p.id === selectedDay.phase)!.color}, ${PHASES.find(p => p.id === selectedDay.phase)!.color}cc)`,
                      boxShadow: `0 8px 24px ${PHASES.find(p => p.id === selectedDay.phase)!.color}44`,
                    }}
                  >
                    ✅ Đánh dấu hoàn thành ngày {selectedDay.day}
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
