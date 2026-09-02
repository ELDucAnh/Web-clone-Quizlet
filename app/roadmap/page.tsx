'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Lock, Trophy, BookOpen, Headphones, PenLine, Mic, Brain, Target, FlaskConical, X, ExternalLink, Flame, Calendar } from 'lucide-react';
import { ROADMAP, PHASES, type RoadmapDay, type TaskType } from '@/lib/roadmap-data';

// ─── Storage ─────────────────────────────────────────────────
const STORAGE_KEY = 'ielts_roadmap_v2';

type TaskRecord = Record<string, boolean>; // key: `${day}_${taskId}`

function loadTasks(): TaskRecord {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveTasks(r: TaskRecord) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(r));
}

function isDayComplete(day: RoadmapDay, tasks: TaskRecord): boolean {
  return day.tasks.every(t => tasks[`${day.day}_${t.id}`]);
}

function getStatus(day: number, allDays: RoadmapDay[], tasks: TaskRecord): 'done' | 'current' | 'locked' {
  const d = allDays.find(x => x.day === day)!;
  if (isDayComplete(d, tasks)) return 'done';
  if (day === 1) return 'current';
  const prev = allDays.find(x => x.day === day - 1);
  if (prev && isDayComplete(prev, tasks)) return 'current';
  return 'locked';
}

// ─── Task type metadata ───────────────────────────────────────
const TASK_META: Record<TaskType, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  vocab:     { label: 'Từ vựng',   icon: <Brain size={15}/>,       color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  reading:   { label: 'Đọc',       icon: <BookOpen size={15}/>,    color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  listening: { label: 'Nghe',      icon: <Headphones size={15}/>,  color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  writing:   { label: 'Viết',      icon: <PenLine size={15}/>,     color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  speaking:  { label: 'Nói',       icon: <Mic size={15}/>,         color: '#EF4444', bg: 'rgba(239,68,68,0.1)'  },
  grammar:   { label: 'Ngữ pháp',  icon: <BookOpen size={15}/>,    color: '#6366F1', bg: 'rgba(99,102,241,0.1)' },
  mock:      { label: 'Mock Test', icon: <Target size={15}/>,      color: '#F59E0B', bg: 'rgba(245,158,11,0.12)' },
};

// ─── Day Node ─────────────────────────────────────────────────
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
  const size = day.isMilestone ? 68 : 58;

  return (
    <button
      onClick={isLocked ? undefined : onClick}
      disabled={isLocked}
      className="relative flex flex-col items-center group"
      style={{ width: 78 }}
    >
      {/* Milestone crown */}
      {day.isMilestone && !isLocked && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-base">🏆</div>
      )}

      {/* Outer glow ring for current */}
      {isCurrent && (
        <div
          className="absolute rounded-full animate-ping"
          style={{
            width: size + 16, height: size + 16,
            top: -8, left: '50%', transform: 'translateX(-50%)',
            background: `${phase.color}20`,
          }}
        />
      )}

      {/* Circle */}
      <div
        className="relative flex items-center justify-center rounded-full font-black transition-all duration-300"
        style={{
          width: size, height: size,
          background: isDone
            ? `radial-gradient(circle at 35% 35%, ${phase.color}ff, ${phase.color}bb)`
            : isCurrent
            ? `radial-gradient(circle at 35% 35%, ${phase.color}cc, ${phase.color}88)`
            : 'radial-gradient(circle at 35% 35%, #374151, #1f2937)',
          boxShadow: isDone
            ? `0 4px 20px ${phase.color}55, 0 2px 8px ${phase.color}33, inset 0 1px 0 rgba(255,255,255,0.25)`
            : isCurrent
            ? `0 0 0 3px ${phase.color}, 0 0 28px ${phase.color}66, 0 4px 16px ${phase.color}44, inset 0 1px 0 rgba(255,255,255,0.2)`
            : '0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
          transform: isCurrent ? 'scale(1.08)' : 'scale(1)',
        }}
      >
        {isDone ? (
          <Check size={20} color="white" strokeWidth={3} />
        ) : isLocked ? (
          <Lock size={15} color="#6B7280" />
        ) : day.isMilestone ? (
          <FlaskConical size={20} color="white" />
        ) : (
          <span className="text-sm font-black" style={{ color: isCurrent ? 'white' : '#9CA3AF' }}>
            {day.day}
          </span>
        )}
      </div>

      {/* Label */}
      <span
        className="mt-2 text-[10px] font-bold leading-tight text-center"
        style={{ color: isLocked ? '#4B5563' : isDone ? phase.color : isCurrent ? 'white' : '#6B7280' }}
      >
        {isCurrent ? '📍 Hôm nay' : `N${day.day}`}
      </span>
    </button>
  );
}

// ─── Connector SVG between rows ───────────────────────────────
function RowConnector({ isEvenRow, color }: { isEvenRow: boolean; color: string }) {
  const side = isEvenRow ? 'right' : 'left';
  return (
    <div className="relative h-10 w-full">
      <svg width="100%" height="40" className="absolute inset-0">
        {side === 'right' ? (
          <path d="M 90% 0 Q 95% 20 90% 40" stroke={color} strokeWidth="2" fill="none" strokeOpacity="0.4" strokeDasharray="4 3"/>
        ) : (
          <path d="M 10% 0 Q 5% 20 10% 40" stroke={color} strokeWidth="2" fill="none" strokeOpacity="0.4" strokeDasharray="4 3"/>
        )}
      </svg>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────
const COLS = 5;

export default function RoadmapPage() {
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<TaskRecord>({});
  const [selectedDay, setSelectedDay] = useState<RoadmapDay | null>(null);
  const currentDayRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); setTasks(loadTasks()); }, []);

  useEffect(() => {
    if (mounted && currentDayRef.current) {
      setTimeout(() => currentDayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 600);
    }
  }, [mounted]);

  const getStatusMemo = useCallback((day: number) => {
    return getStatus(day, ROADMAP, tasks);
  }, [tasks]);

  const handleToggleTask = (day: RoadmapDay, taskId: string) => {
    const status = getStatusMemo(day.day);
    if (status === 'locked') return;
    const key = `${day.day}_${taskId}`;
    setTasks(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveTasks(next);
      return next;
    });
  };

  const completedDaysCount = ROADMAP.filter(d => isDayComplete(d, tasks)).length;
  const progressPct = Math.round((completedDaysCount / 140) * 100);

  const streakDays = (() => {
    let streak = 0;
    for (let d = completedDaysCount; d >= 1; d--) {
      const day = ROADMAP.find(x => x.day === d);
      if (day && isDayComplete(day, tasks)) streak++;
      else break;
    }
    return streak;
  })();

  const currentDay = ROADMAP.find(d => getStatusMemo(d.day) === 'current');

  if (!mounted) return null;

  // Group into rows
  const rows: RoadmapDay[][] = [];
  for (let i = 0; i < ROADMAP.length; i += COLS) rows.push(ROADMAP.slice(i, i + COLS));
  const snakeRows = rows.map((row, i) => i % 2 === 0 ? row : [...row].reverse());

  // Phase color for current node (for connector)
  const currentPhaseColor = currentDay ? PHASES.find(p => p.id === currentDay.phase)!.color : '#4f8ef7';

  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      {/* ── Sticky Header (NO backdrop-blur to avoid UI glitch) ── */}
      <header className="sticky top-0 z-30 bg-[var(--card)] border-b border-[var(--border)]">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="font-black text-[var(--text)] text-sm truncate">Lộ Trình IELTS 8.0</h1>
            <p className="text-[10px] text-[var(--text-muted)]">140 ngày · 3h/ngày · 20/01/2027</p>
          </div>
          <div className="flex items-center gap-2">
            {streakDays > 0 && (
              <div className="flex items-center gap-1 text-orange-400 font-bold text-xs">
                <Flame size={14}/> {streakDays}
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-[var(--primary-light)] text-[var(--primary)] px-3 py-1.5 rounded-full font-bold text-xs">
              <Check size={12}/> {completedDaysCount}/140
            </div>
          </div>
        </div>
        <div className="h-1 bg-[var(--border)]">
          <div
            className="h-full transition-all duration-700"
            style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #4f8ef7, #a855f7, #06b6d4, #f59e0b)' }}
          />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pb-16">
        {/* ── Hero Section ─────────────────────────────────── */}
        <div className="pt-8 pb-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[var(--primary-light)] text-[var(--primary)] px-4 py-1.5 rounded-full text-xs font-bold mb-4">
            <Calendar size={13}/> Bắt đầu ngay hôm nay
          </div>
          <h2 className="text-2xl font-black text-[var(--text)] mb-2">
            Hành trình chinh phục{' '}
            <span style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 2px 10px rgba(239, 68, 68, 0.3)' }}>
              IELTS 8.0
            </span>
          </h2>
          <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
            5.5 → 8.0 trong 140 ngày · 3 giờ mỗi ngày · Hoàn thành từng task để mở khóa ngày tiếp theo
          </p>
        </div>

        {/* ── Phase Cards ──────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
          {PHASES.map(p => {
            const pDays = ROADMAP.filter(d => d.phase === p.id);
            const pDone = pDays.filter(d => isDayComplete(d, tasks)).length;
            const pPct = Math.round((pDone / pDays.length) * 100);
            return (
              <div
                key={p.id}
                className="rounded-2xl p-3.5 border"
                style={{
                  background: `linear-gradient(135deg, ${p.color}15, ${p.color}08)`,
                  borderColor: `${p.color}30`,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black"
                    style={{ background: p.color }}
                  >
                    {p.id}
                  </div>
                  <span className="text-xs font-black" style={{ color: p.color }}>{pPct}%</span>
                </div>
                <p className="text-[11px] font-bold text-[var(--text)] leading-tight">{p.name}</p>
                <p className="text-[10px] text-[var(--text-muted)] mb-2">{p.bandRange}</p>
                <div className="h-1 bg-[var(--border)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pPct}%`, background: p.color }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Current Day Banner ────────────────────────────── */}
        {currentDay && (() => {
          const phase = PHASES.find(p => p.id === currentDay.phase)!;
          const completedTasksCount = currentDay.tasks.filter(t => tasks[`${currentDay.day}_${t.id}`]).length;
          return (
            <div
              className="rounded-2xl p-4 mb-8 cursor-pointer hover:scale-[1.01] transition-transform border"
              style={{
                background: `linear-gradient(135deg, ${phase.color}18, ${phase.color}08)`,
                borderColor: `${phase.color}40`,
              }}
              onClick={() => setSelectedDay(currentDay)}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white flex-shrink-0"
                  style={{ background: `radial-gradient(circle at 35% 35%, ${phase.color}, ${phase.color}aa)`, boxShadow: `0 4px 16px ${phase.color}44` }}
                >
                  {currentDay.day}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-[var(--text-muted)] mb-0.5">📍 Ngày hiện tại · Tuần {currentDay.week}</p>
                  <p className="font-bold text-[var(--text)] truncate">{currentDay.theme}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {currentDay.tasks.map(t => {
                      const done = tasks[`${currentDay.day}_${t.id}`];
                      return (
                        <div
                          key={t.id}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                          style={{ background: done ? TASK_META[t.type].color : '#374151' }}
                        >
                          {done ? <Check size={10}/> : <div className="w-1.5 h-1.5 rounded-full bg-gray-500"/>}
                        </div>
                      );
                    })}
                    <span className="text-[10px] text-[var(--text-muted)] ml-1">{completedTasksCount}/{currentDay.tasks.length} tasks</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Snake Tree ────────────────────────────────────── */}
        <div className="flex flex-col">
          {snakeRows.map((row, rowIndex) => {
            const originalRow = rows[rowIndex];
            const firstDay = originalRow[0];
            const isPhaseStart = [1, 36, 71, 106].includes(firstDay.day);
            const phase = PHASES.find(p => p.id === firstDay.phase)!;
            const hasCurrentInRow = row.some(d => getStatusMemo(d.day) === 'current');

            return (
              <div key={rowIndex}>
                {/* Phase header banner */}
                {isPhaseStart && (
                  <div
                    className="rounded-2xl p-4 mb-4 mt-2 overflow-hidden relative"
                    style={{
                      background: `linear-gradient(135deg, ${phase.color}22, ${phase.color}08)`,
                      border: `1.5px solid ${phase.color}35`,
                    }}
                  >
                    {/* Decorative background circle */}
                    <div
                      className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10"
                      style={{ background: phase.color }}
                    />
                    <div className="flex items-center gap-3 relative">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black"
                        style={{ background: `radial-gradient(circle at 35% 35%, ${phase.color}, ${phase.color}aa)`, boxShadow: `0 4px 12px ${phase.color}44` }}
                      >
                        {phase.id}
                      </div>
                      <div>
                        <p className="font-black text-[var(--text)] text-sm">Phase {phase.id}: {phase.name}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">Ngày {phase.days[0]}–{phase.days[1]} · Mục tiêu {phase.bandRange}</p>
                      </div>
                      <div
                        className="ml-auto text-xs font-black px-2.5 py-1 rounded-full"
                        style={{ background: phase.bg, color: phase.color }}
                      >
                        {Math.round((ROADMAP.filter(d => d.phase === phase.id && isDayComplete(d, tasks)).length / 35) * 100)}%
                      </div>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)] mt-2 ml-13 pl-1 leading-relaxed">{phase.description}</p>
                  </div>
                )}

                {/* Node row */}
                <div
                  ref={hasCurrentInRow ? currentDayRef : undefined}
                  className="flex justify-around items-center py-4 px-2"
                >
                  {row.map(day => (
                    <DayNode
                      key={day.day}
                      day={day}
                      status={getStatusMemo(day.day)}
                      onClick={() => setSelectedDay(day)}
                    />
                  ))}
                </div>

                {/* Row connector */}
                {rowIndex < snakeRows.length - 1 && (
                  <RowConnector isEvenRow={rowIndex % 2 === 0} color={currentPhaseColor} />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Completion Banner ─────────────────────────────── */}
        {completedDaysCount === 140 && (
          <div className="text-center py-16 flex flex-col items-center gap-5">
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center shadow-2xl"
              style={{ background: 'radial-gradient(circle at 35% 35%, #FBBF24, #F59E0B)' }}
            >
              <Trophy size={52} className="text-white" />
            </div>
            <h2 className="text-2xl font-black text-[var(--text)]">🎓 140 Ngày Hoàn Thành!</h2>
            <p className="text-[var(--text-muted)] text-sm max-w-xs text-center leading-relaxed">
              Bạn đã chinh phục hành trình từ 5.5 → 8.0.<br/>
              Chúc bạn thi đạt điểm mơ ước! 🏆
            </p>
          </div>
        )}
      </main>

      {/* ── Day Detail Modal ───────────────────────────────── */}
      {selectedDay && (() => {
        const phase = PHASES.find(p => p.id === selectedDay.phase)!;
        const status = getStatusMemo(selectedDay.day);
        const allDone = isDayComplete(selectedDay, tasks);
        const doneCount = selectedDay.tasks.filter(t => tasks[`${selectedDay.day}_${t.id}`]).length;

        return (
          <>
            <div className="fixed inset-0 z-50 bg-black/60" onClick={() => setSelectedDay(null)} />
            <div className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto bg-[var(--card)] rounded-t-3xl shadow-2xl animate-slide-up-sheet">
              {/* Modal header */}
              <div className="sticky top-0 bg-[var(--card)] px-5 pt-5 pb-3 border-b border-[var(--border)] z-10">
                {/* Drag handle */}
                <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-4"/>

                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    {/* Phase + milestone badge */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: phase.bg, color: phase.color }}
                      >
                        Phase {selectedDay.phase} · Tuần {selectedDay.week}
                      </span>
                      {selectedDay.isMilestone && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                          🏆 {selectedDay.milestoneLabel || 'Milestone'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Day number circle */}
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
                        style={{
                          background: `radial-gradient(circle at 35% 35%, ${phase.color}, ${phase.color}aa)`,
                          boxShadow: `0 4px 16px ${phase.color}44`,
                        }}
                      >
                        {allDone ? <Check size={22}/> : selectedDay.day}
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-[var(--text)]">Ngày {selectedDay.day}</h2>
                        <p className="text-sm text-[var(--text-muted)]">{selectedDay.theme}</p>
                      </div>
                    </div>

                    {/* Progress mini-bar */}
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(doneCount / selectedDay.tasks.length) * 100}%`, background: phase.color }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[var(--text-muted)]">{doneCount}/{selectedDay.tasks.length}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedDay(null)}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors flex-shrink-0"
                  >
                    <X size={16}/>
                  </button>
                </div>
              </div>

              {/* Modal body — task list */}
              <div className="px-5 py-4 flex flex-col gap-3">
                {status === 'locked' ? (
                  <div className="flex items-center justify-center gap-2 py-10 text-[var(--text-muted)] text-sm flex-col">
                    <Lock size={28} className="mb-2 opacity-50"/>
                    <p className="font-medium">Ngày bị khóa</p>
                    <p className="text-xs text-center max-w-xs">Hoàn thành tất cả tasks của ngày trước để mở khóa ngày này.</p>
                  </div>
                ) : (
                  <>
                    {selectedDay.tasks.map(task => {
                      const meta = TASK_META[task.type];
                      const isChecked = !!tasks[`${selectedDay.day}_${task.id}`];
                      return (
                        <div
                          key={task.id}
                          className="rounded-2xl border overflow-hidden transition-all duration-200"
                          style={{
                            background: isChecked ? 'var(--bg)' : meta.bg,
                            borderColor: isChecked ? 'var(--border)' : `${meta.color}25`,
                            opacity: isChecked ? 0.65 : 1,
                          }}
                        >
                          <div className="flex items-start gap-3 p-4">
                            {/* Checkbox */}
                            <button
                              onClick={() => handleToggleTask(selectedDay, task.id)}
                              className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                              style={{
                                borderColor: isChecked ? meta.color : `${meta.color}60`,
                                background: isChecked ? meta.color : 'transparent',
                              }}
                            >
                              {isChecked && <Check size={12} color="white" strokeWidth={3}/>}
                            </button>

                            {/* Task icon */}
                            <div
                              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                              style={{ background: isChecked ? '#374151' : meta.color }}
                            >
                              {meta.icon}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                  style={{
                                    background: isChecked ? '#374151' : `${meta.color}20`,
                                    color: isChecked ? '#6B7280' : meta.color
                                  }}
                                >
                                  {meta.label}
                                </span>
                                {isChecked && <span className="text-[10px] text-[var(--text-muted)]">✓ Hoàn thành</span>}
                              </div>
                              <p className={`text-sm font-bold leading-snug mb-1.5 ${isChecked ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text)]'}`}>
                                {task.title}
                              </p>
                              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                                {task.detail}
                              </p>
                              {task.url && (
                                <a
                                  href={task.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 mt-2 text-xs font-semibold hover:opacity-80 transition-opacity"
                                  style={{ color: meta.color }}
                                >
                                  <ExternalLink size={11}/> Mở tài liệu
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* All done message */}
                    {allDone && (
                      <div
                        className="rounded-2xl p-4 flex items-center gap-3 mt-1"
                        style={{
                          background: `linear-gradient(135deg, ${phase.color}18, ${phase.color}08)`,
                          border: `1.5px solid ${phase.color}30`,
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                          style={{ background: phase.color }}
                        >
                          <Trophy size={20}/>
                        </div>
                        <div>
                          <p className="font-bold text-[var(--text)] text-sm">Ngày {selectedDay.day} hoàn thành! 🎉</p>
                          <p className="text-xs text-[var(--text-muted)]">Tất cả tasks đã được tick. Ngày {selectedDay.day + 1} đã mở khóa.</p>
                        </div>
                      </div>
                    )}

                    {/* Unlock notice */}
                    {!allDone && (
                      <p className="text-[11px] text-center text-[var(--text-muted)] py-2">
                        Tick hết {selectedDay.tasks.length - doneCount} task còn lại để mở khóa ngày tiếp theo
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
}
