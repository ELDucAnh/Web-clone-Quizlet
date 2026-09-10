'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Trash2, Headphones, Search,
  ChevronDown, ChevronUp, Check, AlertCircle,
  FileText, Filter, X, BarChart2
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type ListeningErrorType =
  | 'Spelling'
  | 'Speed/Accent'
  | 'Distractor'
  | 'No Comprehension';

type SectionType = 'Section 1' | 'Section 2' | 'Section 3' | 'Section 4';

interface ListeningError {
  id: string;
  createdAt: number;
  vol: string;             // VOL số / test number
  section: SectionType;
  questionNum: string;     // số câu (vd: "12", "34-36")
  transcript: string;      // đoạn transcript ngắn xung quanh câu sai
  correctAnswer: string;   // đáp án đúng
  errorType: ListeningErrorType;
  note: string;            // phân tích tại sao sai
  tags: string[];
}

// ─── Storage ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'ielts_listening_errors_v1';

function loadErrors(): ListeningError[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveErrors(errors: ListeningError[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(errors));
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ERROR_TYPES: ListeningErrorType[] = [
  'Spelling',
  'Speed/Accent',
  'Distractor',
  'No Comprehension',
];

const SECTIONS: SectionType[] = ['Section 1', 'Section 2', 'Section 3', 'Section 4'];

const ERROR_TYPE_META: Record<ListeningErrorType, { bg: string; text: string; border: string; icon: string; desc: string }> = {
  'Spelling':           { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A', icon: '✏️', desc: 'Nghe ra nhưng viết sai chính tả' },
  'Speed/Accent':       { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA', icon: '⚡', desc: 'Không nghe kịp do tốc độ hoặc giọng' },
  'Distractor':         { bg: '#EDE9FE', text: '#5B21B6', border: '#DDD6FE', icon: '🎭', desc: 'Bị bẫy câu trả lời gây nhiễu' },
  'No Comprehension':   { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE', icon: '🤔', desc: 'Hiểu sai hoặc không hiểu nghĩa' },
};

// ─── ErrorCard ────────────────────────────────────────────────────────────────
function ErrorCard({ error, onDelete }: { error: ListeningError; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const meta = ERROR_TYPE_META[error.errorType];
  const date = new Date(error.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div className="rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-md" style={{ borderColor: meta.border, background: 'var(--card)' }}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Header row */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: meta.bg, color: meta.text, border: `1px solid ${meta.border}` }}>
                {meta.icon} {error.errorType}
              </span>
              {error.vol && (
                <span className="text-[11px] text-[var(--text-muted)] font-medium flex items-center gap-1">
                  <FileText size={10} /> {error.vol}
                </span>
              )}
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[var(--bg)] text-[var(--text-secondary)]">
                {error.section}
              </span>
              {error.questionNum && (
                <span className="text-[11px] text-[var(--text-muted)]">Câu {error.questionNum}</span>
              )}
              <span className="text-[10px] text-[var(--text-faint)] ml-auto">{date}</span>
            </div>

            {/* Correct answer */}
            <div className="rounded-xl px-3 py-2 mb-2 text-sm font-semibold" style={{ background: meta.bg, color: meta.text }}>
              ✓ Đáp án đúng: <strong>{error.correctAnswer}</strong>
            </div>

            {/* Note */}
            {error.note && (
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                <span className="font-semibold text-[var(--text)]">Phân tích: </span>{error.note}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            {error.transcript && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors"
                title={expanded ? 'Thu gọn transcript' : 'Xem transcript'}
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
            <button
              onClick={() => onDelete(error.id)}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Xóa lỗi"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Tags */}
        {error.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {error.tags.map(tag => (
              <span key={tag} className="text-[10px] bg-[var(--bg)] text-[var(--text-muted)] px-2 py-0.5 rounded-full border border-[var(--border)]">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Transcript */}
      {expanded && error.transcript && (
        <div className="px-4 pb-4 border-t border-[var(--border)] pt-3">
          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">Transcript</p>
          <div className="bg-[var(--bg)] rounded-xl p-3 text-sm leading-relaxed text-[var(--text)] max-h-48 overflow-y-auto">
            {error.transcript}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── AddErrorForm ─────────────────────────────────────────────────────────────
function AddErrorForm({ onAdd }: { onAdd: (e: ListeningError) => void }) {
  const [vol, setVol] = useState('');
  const [section, setSection] = useState<SectionType>('Section 1');
  const [questionNum, setQuestionNum] = useState('');
  const [transcript, setTranscript] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [errorType, setErrorType] = useState<ListeningErrorType>('Spelling');
  const [note, setNote] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  const addTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) setTags(prev => [...prev, trimmed]);
    setTagInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!correctAnswer.trim() || !errorType) return;

    const newError: ListeningError = {
      id: `lerr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
      vol: vol.trim(),
      section,
      questionNum: questionNum.trim(),
      transcript: transcript.trim(),
      correctAnswer: correctAnswer.trim(),
      errorType,
      note: note.trim(),
      tags,
    };
    onAdd(newError);
    // Reset per-error fields, keep vol/section
    setQuestionNum('');
    setTranscript('');
    setCorrectAnswer('');
    setNote('');
    setTags([]);
    setTagInput('');
  };

  const meta = ERROR_TYPE_META[errorType];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* VOL + Section + Câu */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">VOL / Test</label>
          <input type="text" value={vol} onChange={e => setVol(e.target.value)} placeholder="VOL 6 Test 2..." className="q-input text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Section</label>
          <div className="flex gap-1 flex-wrap">
            {SECTIONS.map(s => (
              <button key={s} type="button" onClick={() => setSection(s)}
                className="flex-1 py-2 rounded-lg text-xs font-bold border transition-all"
                style={{
                  background: section === s ? '#2563EB' : 'transparent',
                  color: section === s ? '#fff' : 'var(--text-muted)',
                  borderColor: section === s ? '#2563EB' : 'var(--border)',
                }}
              >
                {s.replace('Section ', 'Sec ')}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Số câu</label>
          <input type="text" value={questionNum} onChange={e => setQuestionNum(e.target.value)} placeholder="Vd: 12, 34-36..." className="q-input text-sm" />
        </div>
      </div>

      {/* Transcript */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
          Transcript <span className="font-normal text-[var(--text-faint)] normal-case">(đoạn ngắn xung quanh câu sai)</span>
        </label>
        <textarea value={transcript} onChange={e => setTranscript(e.target.value)}
          placeholder="Paste đoạn transcript ngắn xung quanh câu sai để ôn lại sau..."
          rows={4} className="q-input text-sm resize-none font-mono leading-relaxed"
        />
      </div>

      {/* Correct answer + Error type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Đáp án đúng *</label>
          <input type="text" value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)}
            placeholder="Đáp án đúng là gì?" className="q-input text-sm" required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Loại lỗi</label>
          <div className="flex flex-col gap-1.5">
            {ERROR_TYPES.map(et => {
              const m = ERROR_TYPE_META[et];
              const isActive = errorType === et;
              return (
                <button key={et} type="button" onClick={() => setErrorType(et)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all text-left"
                  style={{
                    background: isActive ? m.bg : 'transparent',
                    color: isActive ? m.text : 'var(--text-muted)',
                    borderColor: isActive ? m.border : 'var(--border)',
                  }}
                >
                  <span>{m.icon}</span>
                  <div>
                    <div>{et}</div>
                    <div className="font-normal opacity-70 text-[10px]">{m.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Phân tích lỗi</label>
        <textarea value={note} onChange={e => setNote(e.target.value)}
          placeholder="Tại sao sai? Vd: bị distractor 'Wednesday' nhưng đáp án là 'Thursday', speaker có nói 'actually'..."
          rows={3} className="q-input text-sm resize-none"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
          Tags <span className="font-normal text-[var(--text-faint)] normal-case">(Enter để thêm)</span>
        </label>
        <div className="flex gap-1 flex-wrap mb-2">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 text-xs bg-[var(--primary-light)] text-[var(--primary)] px-2.5 py-1 rounded-full font-semibold">
              #{tag}
              <button type="button" onClick={() => setTags(prev => prev.filter(t => t !== tag))} className="hover:opacity-70"><X size={10} /></button>
            </span>
          ))}
        </div>
        <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder="Vd: VOL6, sec3-mcq, giọng-Úc..." className="q-input text-sm"
        />
      </div>

      {/* Submit */}
      <button type="submit" disabled={!correctAnswer.trim()}
        className="btn-primary w-full py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus size={16} /> Lưu lỗi Listening
      </button>

      {!correctAnswer && (
        <p className="text-xs text-center text-[var(--text-faint)] flex items-center justify-center gap-1">
          <AlertCircle size={12} /> Nhập đáp án đúng trước khi lưu
        </p>
      )}
    </form>
  );
}

// ─── Mini Bar Chart (stats) ───────────────────────────────────────────────────
function MiniBarChart({ data }: { data: { label: string; count: number; color: string }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex gap-1.5 items-end h-16 w-full justify-between mt-auto">
      {data.map(d => (
        <div key={d.label} className="flex flex-col items-center flex-1 min-w-0">
          <span className="text-[10px] font-bold text-[var(--primary)] mb-0.5">{d.count}</span>
          <div className="w-4 rounded-t-sm bg-[var(--primary)] transition-all duration-500" style={{ height: `${Math.max(4, (d.count / max) * 32)}px` }} />
          <span className="text-[8.5px] text-[var(--text-muted)] text-center leading-none mt-1 w-full truncate px-0.5" title={d.label}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ListeningErrorsPage() {
  const [mounted, setMounted] = useState(false);
  const [errors, setErrors] = useState<ListeningError[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<ListeningErrorType | 'Tất cả'>('Tất cả');
  const [filterSection, setFilterSection] = useState<SectionType | 'Tất cả'>('Tất cả');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    setMounted(true);
    setErrors(loadErrors());
  }, []);

  const handleAdd = useCallback((e: ListeningError) => {
    setErrors(prev => {
      const next = [e, ...prev];
      saveErrors(next);
      return next;
    });
  }, []);

  const handleDelete = useCallback((id: string) => {
    if (!confirm('Xóa lỗi này?')) return;
    setErrors(prev => {
      const next = prev.filter(e => e.id !== id);
      saveErrors(next);
      return next;
    });
  }, []);

  const filtered = errors.filter(e => {
    const matchType = filterType === 'Tất cả' || e.errorType === filterType;
    const matchSection = filterSection === 'Tất cả' || e.section === filterSection;
    const q = searchText.toLowerCase();
    const matchSearch = !q || [e.correctAnswer, e.note, e.vol, e.transcript, e.questionNum, ...e.tags].some(s => s.toLowerCase().includes(q));
    return matchType && matchSection && matchSearch;
  });

  // Stats
  const countByType = ERROR_TYPES.reduce<Record<string, number>>((acc, t) => {
    acc[t] = errors.filter(e => e.errorType === t).length;
    return acc;
  }, {});
  const countBySection = SECTIONS.reduce<Record<string, number>>((acc, s) => {
    acc[s] = errors.filter(e => e.section === s).length;
    return acc;
  }, {});
  const weakestSection = SECTIONS.reduce((a, b) => countBySection[a] >= countBySection[b] ? a : b, SECTIONS[0]);
  const topType = ERROR_TYPES.find(t => countByType[t] === Math.max(...ERROR_TYPES.map(t2 => countByType[t2])));

  const chartData = ERROR_TYPES.map(t => ({
    label: t === 'No Comprehension' ? 'No Comp.' : t === 'Speed/Accent' ? 'Speed' : t,
    count: countByType[t],
    color: ERROR_TYPE_META[t].text,
  }));

  if (!mounted) return null;

  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <main className="max-w-4xl mx-auto px-4 pb-16">
        {/* Page heading */}
        <div className="flex items-start justify-between gap-4 pt-8 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
              <Headphones size={24} className="text-[var(--primary)]" /> Nhật Ký Lỗi Listening
            </h1>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              {errors.length} lỗi đã lưu · Luyện VOL → ghi lỗi → khắc phục
            </p>
          </div>
          <button onClick={() => setShowForm(v => !v)} className="btn-primary flex-shrink-0">
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Đóng' : 'Thêm lỗi'}
          </button>
        </div>
        {/* Stats */}
        {errors.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
            <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-3.5">
              <p className="text-2xl font-black text-[var(--text)]">{errors.length}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Tổng lỗi</p>
            </div>
            {topType && countByType[topType] > 0 && (
              <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-3.5">
                <p className="text-2xl font-black text-[var(--primary)]">{countByType[topType]}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">{topType} (nhiều nhất)</p>
              </div>
            )}
            <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-3.5">
              <p className="text-2xl font-black text-[var(--primary)]">{countBySection[weakestSection]}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{weakestSection} (yếu nhất)</p>
            </div>
            <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-3.5 flex flex-col justify-between">
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1">
                <BarChart2 size={11} /> Phân bổ lỗi
              </p>
              <MiniBarChart data={chartData} />
            </div>
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <div className="mb-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 shadow-md animate-slide-up">
            <h2 className="font-black text-[var(--text)] mb-4 flex items-center gap-2">
              <Headphones size={18} className="text-amber-500" />
              Thêm lỗi Listening mới
            </h2>
            <AddErrorForm onAdd={handleAdd} />
          </div>
        )}

        {/* Filter & Search */}
        {errors.length > 0 && (
          <div className="flex flex-col gap-2 mb-5">
            {/* Search — full width */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="Tìm lỗi, đáp án, transcript..."
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] placeholder:text-[var(--text-muted)]"
              />
            </div>
            {/* Section filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              <Filter size={13} className="text-[var(--text-muted)] flex-shrink-0" />
              {(['Tất cả', ...SECTIONS] as (SectionType | 'Tất cả')[]).map(s => (
                <button key={s} onClick={() => setFilterSection(s)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border flex-shrink-0"
                  style={{
                    background: filterSection === s ? '#2563EB' : 'transparent',
                    color: filterSection === s ? '#fff' : 'var(--text-muted)',
                    borderColor: filterSection === s ? '#2563EB' : 'var(--border)',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            {/* Type filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              {(['Tất cả', ...ERROR_TYPES] as (ListeningErrorType | 'Tất cả')[]).map(type => {
                const isAll = type === 'Tất cả';
                const count = isAll ? errors.length : countByType[type as ListeningErrorType] ?? 0;
                if (!isAll && count === 0) return null;
                const col = isAll ? null : ERROR_TYPE_META[type as ListeningErrorType];
                const isActive = filterType === type;
                return (
                  <button key={type} onClick={() => setFilterType(type)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border flex-shrink-0"
                    style={{
                      background: isActive ? (col?.bg ?? 'var(--primary-light)') : 'transparent',
                      color: isActive ? (col?.text ?? 'var(--primary)') : 'var(--text-muted)',
                      borderColor: isActive ? (col?.border ?? 'var(--primary)') : 'var(--border)',
                    }}
                  >
                    {isAll ? '🗂 Tất cả' : `${col?.icon} ${type}`} <span className="opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {errors.length === 0 && !showForm && (
          <div className="empty-state mt-8">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-2">
              <Headphones size={32} className="text-amber-400" />
            </div>
            <h2 className="font-black text-[var(--text)] text-lg">Chưa có lỗi nào được lưu</h2>
            <p className="text-[var(--text-muted)] text-sm max-w-sm text-center">
              Luyện đề VOL → ghi lại mọi câu sai vào đây → phân tích và khắc phục từng loại lỗi để tăng band Listening.
            </p>
            <button onClick={() => setShowForm(true)} className="btn-primary mt-2">
              <Plus size={15} /> Thêm lỗi đầu tiên
            </button>
          </div>
        )}

        {filtered.length === 0 && errors.length > 0 && (
          <div className="text-center py-12 text-[var(--text-muted)]">
            <Search size={28} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">Không tìm thấy lỗi nào phù hợp</p>
          </div>
        )}

        <div className="space-y-3">
          {filtered.map(error => (
            <ErrorCard key={error.id} error={error} onDelete={handleDelete} />
          ))}
        </div>
      </main>
    </div>
  );
}
