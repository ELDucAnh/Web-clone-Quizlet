'use client';
import { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Target, ChevronDown, ChevronRight, Pencil, Check, X } from 'lucide-react';
import { useStore } from '@/lib/store';
import { appConfirm } from '@/lib/dialog';
import { LoadingScreen } from '@/components/LoadingScreen';
import type { IELTSSkill, StudyHoursGoal } from '@/lib/types';

const SKILLS: IELTSSkill[] = ['Listening', 'Reading', 'Writing', 'Speaking', 'Vocabulary', 'Grammar'];

const SKILL_COLORS: Record<IELTSSkill, string> = {
  Listening: '#4255FF',
  Reading: '#059669',
  Writing: '#D97706',
  Speaking: '#DC2626',
  Vocabulary: '#7C3AED',
  Grammar: '#0891B2',
};

const SKILL_LABELS: Record<IELTSSkill, string> = {
  Listening: 'Listening',
  Reading: 'Reading',
  Writing: 'Writing',
  Speaking: 'Speaking',
  Vocabulary: 'Vocabulary',
  Grammar: 'Grammar',
};

function fmt(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} phút`;
  if (m === 0) return `${h} giờ`;
  return `${h} giờ ${m} phút`;
}

function fmtShort(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}p`;
  if (m === 0) return `${h}h`;
  return `${h}h${m}p`;
}

interface EditingLog {
  id: string;
  mins: string;
  content: string;
  date: string;
}

function GoalCard({ goal }: { goal: StudyHoursGoal }) {
  const { studyHoursLogs, addStudyHoursLog, deleteStudyHoursGoal, deleteStudyHoursLog } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);
  const [newMins, setNewMins] = useState('60');
  const [newContent, setNewContent] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingLog, setEditingLog] = useState<EditingLog | null>(null);

  const logs = studyHoursLogs
    .filter(l => l.goalId === goal.id)
    .sort((a, b) => b.date - a.date);

  const totalMins = logs.reduce((s, l) => s + l.minutes, 0);
  const totalHours = totalMins / 60;
  const pct = Math.min(100, Math.round((totalHours / goal.targetHours) * 100));
  const color = SKILL_COLORS[goal.skill];

  const remaining = goal.targetHours - totalHours;
  const daysLeft = goal.deadline ? Math.ceil((goal.deadline - Date.now()) / 86400000) : null;

  const handleAddLog = () => {
    const m = parseInt(newMins);
    if (!m || m <= 0 || !newContent.trim()) return;
    addStudyHoursLog({
      goalId: goal.id,
      skill: goal.skill,
      minutes: m,
      content: newContent.trim(),
      date: new Date(newDate).getTime(),
    });
    setNewMins('60');
    setNewContent('');
    setNewDate(new Date().toISOString().split('T')[0]);
    setShowAddLog(false);
    setExpanded(true); // auto-expand to see the new log
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden">
      {/* ── Card Header — click to expand ────────────────── */}
      <button
        className="w-full p-5 flex items-center gap-4 text-left hover:bg-[var(--bg)] transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {goal.skill.slice(0, 1)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-[var(--text)]">{goal.skill}</h3>
            <span className="text-xs text-[var(--text-muted)]">
              {fmtShort(totalMins)} / {goal.targetHours}h
            </span>
            {pct === 100 && (
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                Hoàn thành!
              </span>
            )}
          </div>
          <div className="mt-2 h-2 rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, backgroundColor: color }}
            />
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <p className="text-xs text-[var(--text-muted)]">{pct}% • còn {remaining > 0 ? fmt(Math.round(remaining * 60)) : 'đã đạt mục tiêu'}</p>
            {daysLeft !== null && (
              <p className={`text-xs font-medium ${daysLeft < 7 ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
                {daysLeft > 0 ? `Còn ${daysLeft} ngày` : daysLeft === 0 ? 'Hôm nay hạn chót' : `Quá hạn ${Math.abs(daysLeft)} ngày`}
              </p>
            )}
          </div>
        </div>
        <span className="text-[var(--text-muted)] flex-shrink-0">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
      </button>

      {/* ── Expanded content ─────────────────────────────── */}
      {expanded && (
        <div className="border-t border-[var(--border)]">
          {/* Action bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)] bg-[var(--bg)]/50">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              {logs.length} buổi học • {fmtShort(totalMins)} tổng
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddLog(v => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold text-[var(--primary)] hover:text-[var(--quizlet-blue-hover)] transition-colors py-1 px-2 rounded-lg hover:bg-[var(--primary-light)]"
              >
                <Plus size={13} /> Thêm buổi học
              </button>
              <button
                onClick={async () => { if (await appConfirm(`Xóa mục tiêu "${goal.skill}" và toàn bộ ${logs.length} log liên quan?`)) deleteStudyHoursGoal(goal.id); }}
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-red-500 transition-colors py-1 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <Trash2 size={12} /> Xóa mục tiêu
              </button>
            </div>
          </div>

          {/* Add log form */}
          {showAddLog && (
            <div className="p-5 border-b border-[var(--border)] bg-[var(--primary-light)]/40 flex flex-col gap-3 animate-slide-down">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Ngày học</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    className="q-input"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Thời gian (phút)</label>
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    value={newMins}
                    onChange={e => setNewMins(e.target.value)}
                    placeholder="60"
                    className="q-input"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">Nội dung đã học *</label>
                <input
                  type="text"
                  value={newContent}
                  onChange={e => setNewContent(e.target.value)}
                  placeholder="VD: Dictation bài 5, Shadowing TED talk, Cambridge 18 Test 1..."
                  className="q-input"
                  onKeyDown={e => e.key === 'Enter' && handleAddLog()}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAddLog}
                  disabled={!newContent.trim() || !newMins || parseInt(newMins) <= 0}
                  className="btn-primary text-sm py-2 disabled:opacity-40"
                >
                  <Check size={14} /> Lưu
                </button>
                <button onClick={() => setShowAddLog(false)} className="btn-ghost text-sm py-2">
                  Hủy
                </button>
              </div>
            </div>
          )}

          {/* Logs */}
          {logs.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-sm text-[var(--text-muted)]">Chưa có buổi học nào được ghi.</p>
              <button
                onClick={() => setShowAddLog(true)}
                className="mt-2 text-sm font-medium text-[var(--primary)] hover:underline"
              >
                + Thêm buổi học đầu tiên
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {logs.map(log => (
                <div key={log.id} className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--bg)] transition-colors group">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: color }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text)] leading-snug">{log.content}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      {new Date(log.date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })}
                      {' · '}
                      <span className="font-semibold" style={{ color }}>{fmt(log.minutes)}</span>
                    </p>
                  </div>
                  <button
                    onClick={async () => { if (await appConfirm('Xóa log này?')) deleteStudyHoursLog(log.id); }}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex-shrink-0"
                    title="Xóa buổi học này"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function StudyHoursPage() {
  const { studyHoursGoals, studyHoursLogs, createStudyHoursGoal, isHydrated } = useStore();
  const [mounted, setMounted] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newSkill, setNewSkill] = useState<IELTSSkill>('Listening');
  const [newTarget, setNewTarget] = useState('100');
  const [newDeadline, setNewDeadline] = useState('');

  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !isHydrated) return <LoadingScreen />;

  const goals = Object.values(studyHoursGoals).sort((a, b) => a.createdAt - b.createdAt);

  // Summary stats
  const skillStats: Partial<Record<IELTSSkill, number>> = {};
  studyHoursLogs.forEach(l => { skillStats[l.skill] = (skillStats[l.skill] || 0) + l.minutes; });
  const totalMins = studyHoursLogs.reduce((s, l) => s + l.minutes, 0);

  const handleCreate = () => {
    const t = parseInt(newTarget);
    if (!t || t <= 0 || t > 1000) return;
    createStudyHoursGoal(newSkill, t, newDeadline ? new Date(newDeadline).getTime() : undefined);
    setShowCreate(false);
    setNewTarget('100');
    setNewDeadline('');
  };

  // Check if skill already has a goal
  const existingSkills = new Set(goals.map(g => g.skill));

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto w-full">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
            <Clock size={24} className="text-[var(--primary)]" /> Nhật ký giờ học
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Đặt mục tiêu giờ luyện theo kỹ năng IELTS và ghi lại từng buổi học.
          </p>
        </div>
        <button onClick={() => setShowCreate(v => !v)} className="btn-primary flex-shrink-0">
          <Plus size={16} /> Thêm mục tiêu
        </button>
      </div>

      {/* ── Tổng kết ─────────────────────────────────────── */}
      {totalMins > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Tổng giờ học</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {SKILLS.map(skill => {
              const mins = skillStats[skill] || 0;
              return (
                <div key={skill} className="text-center">
                  <div
                    className="text-xl font-black"
                    style={{ color: mins > 0 ? SKILL_COLORS[skill] : 'var(--border)' }}
                  >
                    {fmtShort(mins) || '0p'}
                  </div>
                  <div className="text-xs text-[var(--text-muted)] mt-0.5">{skill.slice(0, 4)}</div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3 text-right">
            Tổng cộng: <span className="font-bold text-[var(--text)]">{fmt(totalMins)}</span>
          </p>
        </div>
      )}

      {/* ── Create form ───────────────────────────────────── */}
      {showCreate && (
        <div className="bg-[var(--card)] border-2 border-[var(--primary)] rounded-2xl p-5 flex flex-col gap-4 animate-slide-down">
          <h3 className="font-bold text-[var(--text)]">Tạo mục tiêu mới</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">Kỹ năng</label>
              <select value={newSkill} onChange={e => setNewSkill(e.target.value as IELTSSkill)} className="q-input">
                {SKILLS.map(s => (
                  <option key={s} value={s}>
                    {SKILL_LABELS[s]}{existingSkills.has(s) ? ' (đã có)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">Mục tiêu giờ (tối đa 1000)</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={newTarget}
                onChange={e => setNewTarget(e.target.value)}
                className="q-input"
              />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] block mb-1">Hạn chót (tùy chọn)</label>
              <input
                type="date"
                value={newDeadline}
                onChange={e => setNewDeadline(e.target.value)}
                className="q-input"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newTarget || parseInt(newTarget) <= 0 || parseInt(newTarget) > 1000}
              className="btn-primary disabled:opacity-40"
            >
              <Check size={14} /> Tạo mục tiêu
            </button>
            <button onClick={() => setShowCreate(false)} className="btn-ghost">Hủy</button>
          </div>
        </div>
      )}

      {/* ── Goals list ────────────────────────────────────── */}
      {goals.length === 0 ? (
        <div className="empty-state">
          <Target size={40} className="text-[var(--text-muted)]" />
          <div>
            <h3 className="font-bold text-[var(--text)] text-lg">Chưa có mục tiêu nào</h3>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              Tạo mục tiêu để theo dõi giờ luyện từng kỹ năng IELTS một cách có hệ thống.
            </p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus size={16} /> Tạo mục tiêu đầu tiên
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
        </div>
      )}
    </div>
  );
}
