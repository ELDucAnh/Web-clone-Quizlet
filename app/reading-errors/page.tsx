'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Plus, Trash2, BookOpen, Search,
  ChevronDown, ChevronUp, Copy, Check, AlertCircle,
  FileText, Filter, X, BookMarked
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type ErrorType =
  | 'True/False/NG'
  | 'Matching Headings'
  | 'Matching Information'
  | 'Summary Fill'
  | 'Multiple Choice'
  | 'Sentence Completion'
  | 'Paraphrase Trap'
  | 'Từ vựng sai'
  | 'Khác';

interface ReadingError {
  id: string;
  createdAt: number;
  passageTitle: string;       // tên bài / VOL số mấy
  passageText: string;        // đoạn văn gốc
  selectedText: string;       // đoạn/từ bôi chọn
  errorType: ErrorType;
  note: string;               // giải thích lỗi
  correction: string;         // cách sửa / đáp án đúng
  tags: string[];             // custom tags
}

// ─── Storage ──────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'ielts_reading_errors_v1';

function loadErrors(): ReadingError[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveErrors(errors: ReadingError[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(errors));
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ERROR_TYPES: ErrorType[] = [
  'True/False/NG',
  'Matching Headings',
  'Matching Information',
  'Summary Fill',
  'Multiple Choice',
  'Sentence Completion',
  'Paraphrase Trap',
  'Từ vựng sai',
  'Khác',
];

const ERROR_TYPE_COLORS: Record<ErrorType, { bg: string; text: string; border: string }> = {
  'True/False/NG':        { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
  'Matching Headings':    { bg: '#EDE9FE', text: '#5B21B6', border: '#DDD6FE' },
  'Matching Information': { bg: '#F3E8FF', text: '#7C3AED', border: '#E9D5FF' },
  'Summary Fill':         { bg: '#DBEAFE', text: '#1E40AF', border: '#BFDBFE' },
  'Multiple Choice':      { bg: '#FCE7F3', text: '#9D174D', border: '#FBCFE8' },
  'Sentence Completion':  { bg: '#D1FAE5', text: '#065F46', border: '#A7F3D0' },
  'Paraphrase Trap':      { bg: '#FEE2E2', text: '#991B1B', border: '#FECACA' },
  'Từ vựng sai':          { bg: '#E0F2FE', text: '#075985', border: '#BAE6FD' },
  'Khác':                 { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' },
};

// ─── Highlight passage text ───────────────────────────────────────────────────
function HighlightedPassage({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) {
  if (!highlight.trim()) return <span className="whitespace-pre-wrap text-sm leading-relaxed">{text}</span>;

  const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return (
    <span className="whitespace-pre-wrap text-sm leading-relaxed">
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <mark key={i} className="bg-red-200 text-red-900 rounded px-0.5 font-semibold">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
}

// ─── Error Card ───────────────────────────────────────────────────────────────
function ErrorCard({
  error,
  onDelete,
}: {
  error: ReadingError;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const col = ERROR_TYPE_COLORS[error.errorType];

  const handleCopy = () => {
    navigator.clipboard.writeText(error.selectedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const date = new Date(error.createdAt).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });

  return (
    <div
      className="rounded-2xl border overflow-hidden transition-all duration-200 hover:shadow-md"
      style={{ borderColor: col.border, background: 'var(--card)' }}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Error type badge + passage title */}
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span
                className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}` }}
              >
                {error.errorType}
              </span>
              {error.passageTitle && (
                <span className="text-[11px] text-[var(--text-muted)] font-medium flex items-center gap-1">
                  <FileText size={10} /> {error.passageTitle}
                </span>
              )}
              <span className="text-[10px] text-[var(--text-faint)] ml-auto">{date}</span>
            </div>

            {/* Selected text highlight */}
            <div
              className="rounded-xl px-3 py-2 mb-2 font-semibold text-sm leading-relaxed cursor-pointer"
              style={{ background: col.bg, color: col.text }}
              onClick={handleCopy}
              title="Click để copy"
            >
              <span className="select-all">❝ {error.selectedText} ❞</span>
              <span className="ml-2 inline-flex items-center">
                {copied ? <Check size={12} /> : <Copy size={12} className="opacity-50" />}
              </span>
            </div>

            {/* Note */}
            {error.note && (
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                <span className="font-semibold text-[var(--text)]">Lỗi: </span>{error.note}
              </p>
            )}
            {error.correction && (
              <p className="text-sm text-green-700 dark:text-green-400 leading-relaxed mt-1">
                <span className="font-semibold">✓ Sửa: </span>{error.correction}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1 flex-shrink-0">
            {/* Only show expand button if there's a passage to show */}
            {error.passageText && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors"
                title={expanded ? 'Thu gọn passage' : 'Xem passage gốc'}
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
              <span
                key={tag}
                className="text-[10px] bg-[var(--bg)] text-[var(--text-muted)] px-2 py-0.5 rounded-full border border-[var(--border)]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Collapsible passage */}
      {expanded && error.passageText && (
        <div className="px-4 pb-4 border-t border-[var(--border)] pt-3">
          <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Đoạn passage gốc
          </p>
          <div className="bg-[var(--bg)] rounded-xl p-3 max-h-60 overflow-y-auto">
            <HighlightedPassage text={error.passageText} highlight={error.selectedText} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Error Form ───────────────────────────────────────────────────────────
function AddErrorForm({ onAdd }: { onAdd: (e: ReadingError) => void }) {
  const [passageTitle, setPassageTitle] = useState('');
  const [passageText, setPassageText] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [errorType, setErrorType] = useState<ErrorType>('True/False/NG');
  const [note, setNote] = useState('');
  const [correction, setCorrection] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [selectionHint, setSelectionHint] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const passageTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Capture selected text ONLY from inside the textarea (not window selection)
  const handleTextareaMouseUp = () => {
    const el = passageTextareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start !== end) {
      const sel = el.value.slice(start, end).trim();
      if (sel.length > 0 && sel.length < 500) {
        setSelectedText(sel);
        setSelectionHint(true);
        setTimeout(() => setSelectionHint(false), 2000);
      }
    }
  };

  const addTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags(prev => [...prev, trimmed]);
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => setTags(prev => prev.filter(t => t !== tag));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedText.trim()) return;

    const newError: ReadingError = {
      id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
      passageTitle: passageTitle.trim(),
      passageText: passageText.trim(),
      selectedText: selectedText.trim(),
      errorType,
      note: note.trim(),
      correction: correction.trim(),
      tags,
    };
    onAdd(newError);

    // Reset only the per-error fields; keep passage so user can add
    // multiple errors for the same passage without re-pasting
    setSelectedText('');
    setNote('');
    setCorrection('');
    setTags([]);
    setTagInput('');
    
    // Show success feedback
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    
    // Scroll the textarea back into view for next selection
    passageTextareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const col = ERROR_TYPE_COLORS[errorType];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Passage info */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
            Tên bài / VOL số
          </label>
          <input
            type="text"
            value={passageTitle}
            onChange={e => setPassageTitle(e.target.value)}
            placeholder="Vd: VOL 6 Test 2 Passage 3, Cambridge 18 Test 1..."
            className="q-input text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
            Paste đoạn Passage vào đây <span className="text-[var(--primary)] font-bold">(bôi chọn từ/cụm sai)</span>
          </label>
          <div className="relative">
            <textarea
              ref={passageTextareaRef}
              value={passageText}
              onChange={e => setPassageText(e.target.value)}
              onMouseUp={handleTextareaMouseUp}
              onKeyUp={handleTextareaMouseUp}
              placeholder="Paste toàn bộ đoạn passage vào đây, sau đó bôi chọn từ hoặc cụm từ mà bạn đã trả lời sai..."
              rows={8}
              className="q-input text-sm resize-none leading-relaxed"
            />
            {selectionHint && (
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-lg font-semibold animate-fade-in">
                ✓ Đã chọn!
              </div>
            )}
          </div>
          {selectedText && (
            <div
              className="mt-2 px-3 py-2 rounded-xl text-sm font-medium flex items-start gap-2"
              style={{ background: col.bg, color: col.text, border: `1px solid ${col.border}` }}
            >
              <Check size={14} className="flex-shrink-0 mt-0.5" />
              <span>Đã chọn: <strong>❝ {selectedText} ❞</strong></span>
              <button
                type="button"
                onClick={() => setSelectedText('')}
                className="ml-auto flex-shrink-0 opacity-60 hover:opacity-100"
              >
                <X size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Error type */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
          Loại câu hỏi / Loại lỗi
        </label>
        <div className="flex flex-wrap gap-2">
          {ERROR_TYPES.map(et => {
            const c = ERROR_TYPE_COLORS[et];
            const isActive = errorType === et;
            return (
              <button
                key={et}
                type="button"
                onClick={() => setErrorType(et)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition-all border"
                style={{
                  background: isActive ? c.bg : 'transparent',
                  color: isActive ? c.text : 'var(--text-muted)',
                  borderColor: isActive ? c.border : 'var(--border)',
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {et}
              </button>
            );
          })}
        </div>
      </div>

      {/* Note + Correction */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
            Ghi chú lỗi sai
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Tại sao sai? Vd: nhầm F và NG, bẫy paraphrase ở từ 'however'..."
            rows={3}
            className="q-input text-sm resize-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
            Đáp án đúng / Cách sửa
          </label>
          <textarea
            value={correction}
            onChange={e => setCorrection(e.target.value)}
            placeholder="Đáp án đúng là gì? Phải đọc ở đâu trong passage? Từ khóa nào..."
            rows={3}
            className="q-input text-sm resize-none"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">
          Tags <span className="font-normal text-[var(--text-faint)] normal-case">(tuỳ chọn — Enter để thêm)</span>
        </label>
        <div className="flex gap-2 flex-wrap mb-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="flex items-center gap-1 text-xs bg-[var(--primary-light)] text-[var(--primary)] px-2.5 py-1 rounded-full font-semibold"
            >
              #{tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:opacity-70">
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder="Vd: VOL6, cam18, bẫy-paraphrase..."
          className="q-input text-sm"
        />
      </div>

      {/* Submit & Feedback */}
      <div className="space-y-3">
        {saveSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 animate-slide-up">
            <Check size={16} />
            Đã lưu lỗi thành công! Bạn có thể tiếp tục bôi chọn cụm từ khác trong bài.
          </div>
        )}
        
        <button
          type="submit"
          disabled={!selectedText.trim()}
          className="btn-primary w-full py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          Lưu lỗi sai này
        </button>

        {!selectedText && !saveSuccess && (
          <p className="text-xs text-center text-[var(--text-faint)] flex items-center justify-center gap-1">
            <AlertCircle size={12} />
            Hãy paste passage và bôi chọn từ/cụm sai trước
          </p>
        )}
      </div>
    </form>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReadingErrorsPage() {
  const [mounted, setMounted] = useState(false);
  const [errors, setErrors] = useState<ReadingError[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<ErrorType | 'Tất cả'>('Tất cả');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    setMounted(true);
    setErrors(loadErrors());
  }, []);

  const handleAdd = useCallback((e: ReadingError) => {
    setErrors(prev => {
      const next = [e, ...prev];
      saveErrors(next);
      return next;
    });
    // Không đóng form sau khi lưu — user có thể muốn thêm nhiều lỗi
    // từ cùng 1 passage mà không cần re-open form lại
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
    const q = searchText.toLowerCase();
    const matchSearch = !q || [e.selectedText, e.note, e.correction, e.passageTitle, ...e.tags]
      .some(s => s.toLowerCase().includes(q));
    return matchType && matchSearch;
  });

  // Stats
  const statsByType = ERROR_TYPES.reduce<Record<string, number>>((acc, t) => {
    acc[t] = errors.filter(e => e.errorType === t).length;
    return acc;
  }, {});
  // topError = loại lỗi có count nhiều nhất; nếu tất cả bằng 0 thì null
  const hasAnyTyped = ERROR_TYPES.some(t => statsByType[t] > 0);
  const topError = hasAnyTyped
    ? ERROR_TYPES.reduce((a, b) => (statsByType[a] >= statsByType[b] ? a : b), ERROR_TYPES[0])
    : null;

  if (!mounted) return null;

  return (
    <div className="min-h-dvh bg-[var(--bg)]">
      <main className="max-w-4xl mx-auto px-4 pb-16">
        {/* Page heading */}
        <div className="flex items-start justify-between gap-4 pt-8 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
              <BookMarked size={24} className="text-[var(--primary)]" /> Nhật Ký Lỗi Reading
            </h1>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              {errors.length} lỗi đã lưu · Paste passage → bôi chọn → ghi chú
            </p>
          </div>
          <button onClick={() => setShowForm(v => !v)} className="btn-primary flex-shrink-0">
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? 'Đóng' : 'Thêm lỗi'}
          </button>
        </div>
        {/* ── Stats bar ── */}
        {errors.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
            <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-3.5">
              <p className="text-2xl font-black text-[var(--text)]">{errors.length}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Tổng lỗi</p>
            </div>
            {topError && (
              <div
                className="rounded-2xl border p-3.5"
                style={{
                  background: ERROR_TYPE_COLORS[topError].bg,
                  borderColor: ERROR_TYPE_COLORS[topError].border,
                }}
              >
                <p className="text-2xl font-black" style={{ color: ERROR_TYPE_COLORS[topError].text }}>
                  {statsByType[topError]}
                </p>
                <p className="text-xs mt-0.5" style={{ color: ERROR_TYPE_COLORS[topError].text, opacity: 0.75 }}>
                  {topError} (nhiều nhất)
                </p>
              </div>
            )}
            <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-3.5">
              <p className="text-2xl font-black text-red-500">
                {errors.filter(e => e.errorType === 'Paraphrase Trap').length}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">Paraphrase bẫy</p>
            </div>
            <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-3.5">
              <p className="text-2xl font-black text-purple-500">
                {errors.filter(e => e.errorType === 'True/False/NG').length}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">T/F/NG</p>
            </div>
          </div>
        )}

        {/* ── Add form ── */}
        {showForm && (
          <div className="mb-6 rounded-2xl bg-[var(--card)] border border-[var(--border)] p-5 shadow-md animate-slide-up">
            <h2 className="font-black text-[var(--text)] mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-[var(--primary)]" />
              Thêm lỗi Reading mới
            </h2>
            <AddErrorForm onAdd={handleAdd} />
          </div>
        )}

        {/* ── Filter & Search ── */}
        {errors.length > 0 && (
          <div className="flex flex-col gap-2 mb-5">
            {/* Search — full width */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <input
                type="text"
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                placeholder="Tìm lỗi, từ vựng, ghi chú..."
                className="w-full h-10 pl-9 pr-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] placeholder:text-[var(--text-muted)]"
              />
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
              <Filter size={13} className="text-[var(--text-muted)] flex-shrink-0" />
              {(['Tất cả', ...ERROR_TYPES] as (ErrorType | 'Tất cả')[]).map(type => {
                const isAll = type === 'Tất cả';
                const count = isAll ? errors.length : statsByType[type as ErrorType] ?? 0;
                if (!isAll && count === 0) return null;
                const col = isAll ? null : ERROR_TYPE_COLORS[type as ErrorType];
                const isActive = filterType === type;
                return (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-all border flex-shrink-0"
                    style={{
                      background: isActive ? (col?.bg ?? 'var(--primary-light)') : 'transparent',
                      color: isActive ? (col?.text ?? 'var(--primary)') : 'var(--text-muted)',
                      borderColor: isActive ? (col?.border ?? 'var(--primary)') : 'var(--border)',
                    }}
                  >
                    {type} {count > 0 && <span className="opacity-70">({count})</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Error list ── */}
        {errors.length === 0 && !showForm && (
          <div className="empty-state mt-8">
            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-2">
              <BookOpen size={32} className="text-red-400" />
            </div>
            <h2 className="font-black text-[var(--text)] text-lg">Chưa có lỗi nào được lưu</h2>
            <p className="text-[var(--text-muted)] text-sm max-w-sm text-center">
              Paste đoạn passage, bôi chọn chỗ sai, ghi note — lưu vào đây để ôn lại và không tái phạm.
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
