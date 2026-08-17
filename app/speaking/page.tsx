'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, Plus, Trash2, Edit2, X, Check, Search, ChevronDown, ChevronRight, Play } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import type { SpeakingTopic } from '@/lib/types';
import { appConfirm } from '@/lib/dialog';
import { LoadingScreen } from '@/components/LoadingScreen';

// ── Highlight vocab popup ─────────────────────────────────────────────
function HighlightVocabPopup({
  text,
  onAdd,
  onClose,
}: {
  text: string;
  onAdd: (term: string, def: string, deckId: string) => void;
  onClose: () => void;
}) {
  const { decks } = useStore();
  const deckList = Object.values(decks);
  const [def, setDef] = useState('');
  const [deckId, setDeckId] = useState(deckList[0]?.id || '');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = () => {
    if (def.trim() && deckId) onAdd(text, def.trim(), deckId);
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl p-3 flex flex-col gap-2 w-72 animate-scale-in">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--text-muted)]">Thêm vào học phần</p>
        <button onClick={onClose} className="w-5 h-5 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] rounded">
          <X size={12} />
        </button>
      </div>
      <div className="px-2 py-1.5 bg-[var(--primary-light)] rounded-lg text-sm font-semibold text-[var(--primary)] truncate">
        &ldquo;{text}&rdquo;
      </div>
      <input
        ref={inputRef}
        className="q-input text-sm"
        placeholder="Nghĩa / định nghĩa..."
        value={def}
        onChange={e => setDef(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') handleSubmit();
          if (e.key === 'Escape') onClose();
        }}
      />
      {deckList.length > 0 ? (
        <select className="q-input text-sm" value={deckId} onChange={e => setDeckId(e.target.value)}>
          {deckList.map(d => <option key={d.id} value={d.id}>{d.name.slice(0, 35)}</option>)}
        </select>
      ) : (
        <p className="text-xs text-[var(--text-muted)] italic">Bạn chưa có học phần nào.</p>
      )}
      <button
        className="btn-primary text-sm py-2 disabled:opacity-40"
        onClick={handleSubmit}
        disabled={!def.trim() || !deckId}
      >
        <Check size={13} /> Thêm vào học phần
      </button>
    </div>
  );
}

// ── Highlight hook ─────────────────────────────────────────────────────
function useHighlight(
  containerRef: React.RefObject<HTMLElement | null>,
  onAddVocab: (term: string, def: string, deckId: string) => void
) {
  const [popup, setPopup] = useState<{ x: number; y: number; text: string } | null>(null);

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const text = sel.toString().trim();
    if (!text || text.length < 2 || text.length > 120) return;
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    setPopup({ x: rect.left + rect.width / 2, y: rect.top - 8, text });
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('mouseup', handleMouseUp);
    return () => el.removeEventListener('mouseup', handleMouseUp);
  }, [containerRef, handleMouseUp]);

  const closePopup = useCallback(() => {
    setPopup(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  const handleAdd = useCallback((term: string, def: string, deckId: string) => {
    onAddVocab(term, def, deckId);
    closePopup();
  }, [onAddVocab, closePopup]);

  return { popup, closePopup, handleAdd };
}

// ── Topic Card ─────────────────────────────────────────────────────────
function TopicCard({ topic }: { topic: SpeakingTopic }) {
  const { deleteSpeakingTopic, updateSpeakingTopic, addCardToDeck } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    topic: topic.topic,
    part: topic.part,
    questions: topic.questions.join('\n'),
    sampleAnswer: topic.sampleAnswer || '',
    keywords: (topic.keywords || []).join(', '),
  });
  const bodyRef = useRef<HTMLDivElement>(null);

  // Sync when topic changes externally
  useEffect(() => {
    setEditData({
      topic: topic.topic,
      part: topic.part,
      questions: topic.questions.join('\n'),
      sampleAnswer: topic.sampleAnswer || '',
      keywords: (topic.keywords || []).join(', '),
    });
  }, [topic.topic, topic.part, topic.questions, topic.sampleAnswer, topic.keywords]);

  const { popup, closePopup, handleAdd } = useHighlight(
    bodyRef,
    (term, def, deckId) => addCardToDeck(deckId, term, def)
  );

  const handleSave = () => {
    if (!editData.topic.trim() || !editData.questions.trim()) return;
    updateSpeakingTopic(topic.id, {
      topic: editData.topic.trim(),
      part: editData.part,
      questions: editData.questions.split('\n').map(q => q.trim()).filter(Boolean),
      sampleAnswer: editData.sampleAnswer.trim() || undefined,
      keywords: editData.keywords.split(',').map(k => k.trim()).filter(Boolean),
    });
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({
      topic: topic.topic,
      part: topic.part,
      questions: topic.questions.join('\n'),
      sampleAnswer: topic.sampleAnswer || '',
      keywords: (topic.keywords || []).join(', '),
    });
    setEditing(false);
  };

  const PART_COLORS = ['', '#4255FF', '#059669', '#D97706'];
  const PART_LABELS = ['', 'Part 1 · Câu hỏi quen thuộc', 'Part 2 · Độc thoại 2 phút', 'Part 3 · Thảo luận chuyên sâu'];
  const partColor = PART_COLORS[topic.part];

  return (
    <div className={`bg-[var(--card)] border rounded-2xl overflow-hidden transition-colors ${editing ? 'border-[var(--primary)]' : 'border-[var(--border)]'}`}>
      {/* ── Header ─────────────────────────────────── */}
      <button
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-[var(--bg)] transition-colors"
        onClick={() => { if (!editing) setExpanded(v => !v); }}
        disabled={editing}
      >
        <div
          className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5"
          style={{ backgroundColor: partColor }}
        >
          P{topic.part}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[var(--text)] leading-snug">{topic.topic}</h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{PART_LABELS[topic.part]}</p>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="text-xs text-[var(--text-muted)]">{topic.questions.length} câu hỏi</span>
            {topic.sampleAnswer && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Có bài mẫu</span>
            )}
            {topic.keywords && topic.keywords.length > 0 && (
              <span className="text-xs text-[var(--text-muted)] truncate max-w-[200px]">
                {topic.keywords.slice(0, 3).join(' · ')}{topic.keywords.length > 3 ? '...' : ''}
              </span>
            )}
          </div>
        </div>
        {!editing && (
          <span className="text-[var(--text-muted)] flex-shrink-0 mt-1">
            {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </span>
        )}
      </button>

      {/* ── Action row ─────────────────────────────── */}
      <div className="px-4 pb-3 flex items-center gap-2 justify-end -mt-2">
        {!editing ? (
          <>
            <Link
              href={`/speaking/mock-test?mode=Part ${topic.part}&topicId=${topic.id}`}
              className="flex items-center gap-1 text-xs text-[var(--primary)] font-bold hover:text-[var(--primary-hover)] transition-colors py-1 px-3 rounded-lg bg-[var(--primary-light)] mr-auto"
            >
              <Play size={12} fill="currentColor" /> Thi thử với AI
            </Link>
            <button
              onClick={() => { setEditing(true); setExpanded(true); }}
              className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors py-1 px-2 rounded-lg hover:bg-[var(--primary-light)]"
            >
              <Edit2 size={12} /> Sửa
            </button>
            <button
              onClick={async () => { if (await appConfirm(`Xóa chủ đề "${topic.topic}"?`)) deleteSpeakingTopic(topic.id); }}
              className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors py-1 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash2 size={12} /> Xóa
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={!editData.topic.trim() || !editData.questions.trim()}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors py-1 px-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 disabled:opacity-40"
            >
              <Check size={12} /> Lưu
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)] transition-colors py-1 px-2 rounded-lg hover:bg-[var(--bg)]"
            >
              <X size={12} /> Hủy
            </button>
          </>
        )}
      </div>

      {/* ── Expanded content ───────────────────────── */}
      {expanded && (
        <div className="border-t border-[var(--border)] p-5">
          {editing ? (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Chủ đề *</label>
                  <input
                    className="q-input"
                    value={editData.topic}
                    onChange={e => setEditData(p => ({ ...p, topic: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Part</label>
                  <select
                    className="q-input"
                    value={editData.part}
                    onChange={e => setEditData(p => ({ ...p, part: parseInt(e.target.value) as 1 | 2 | 3 }))}
                  >
                    <option value={1}>Part 1</option>
                    <option value={2}>Part 2</option>
                    <option value={3}>Part 3</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">Câu hỏi * (mỗi dòng 1 câu)</label>
                <textarea
                  rows={4}
                  className="q-input resize-none text-sm"
                  value={editData.questions}
                  onChange={e => setEditData(p => ({ ...p, questions: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">Bài mẫu (tùy chọn)</label>
                <textarea
                  rows={7}
                  className="q-input resize-y text-sm font-mono leading-relaxed"
                  value={editData.sampleAnswer}
                  onChange={e => setEditData(p => ({ ...p, sampleAnswer: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">Từ khóa (phân cách bằng dấu phẩy)</label>
                <input
                  className="q-input"
                  placeholder="VD: vibrant, reminisce, pivotal, infrastructure..."
                  value={editData.keywords}
                  onChange={e => setEditData(p => ({ ...p, keywords: e.target.value }))}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-5" ref={bodyRef}>
              <p className="text-xs text-[var(--text-muted)] italic select-none">
                Bôi đen từ/cụm từ để thêm vào học phần từ vựng
              </p>

              {/* Questions */}
              <div>
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                  Câu hỏi ({topic.questions.length})
                </p>
                <ol className="list-decimal list-inside flex flex-col gap-2">
                  {topic.questions.map((q, i) => (
                    <li key={i} className="text-sm text-[var(--text)] leading-snug">{q}</li>
                  ))}
                </ol>
              </div>

              {/* Keywords */}
              {topic.keywords && topic.keywords.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                    Từ khóa gợi ý
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {topic.keywords.map((k, i) => (
                      <span key={i} className="badge badge-blue">{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample answer */}
              {topic.sampleAnswer && (
                <div>
                  <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-2">
                    Bài mẫu
                  </p>
                  <pre className="text-sm text-[var(--text)] leading-relaxed whitespace-pre-wrap font-sans bg-[var(--bg)] rounded-xl p-4">
                    {topic.sampleAnswer}
                  </pre>
                </div>
              )}

              {!topic.sampleAnswer && (
                <button
                  onClick={() => { setEditing(true); }}
                  className="text-sm text-[var(--primary)] hover:underline text-left"
                >
                  + Thêm bài mẫu cho chủ đề này
                </button>
              )}

              {/* Highlight popup */}
              {popup && (
                <div
                  className="fixed z-50"
                  style={{ left: popup.x, top: popup.y, transform: 'translate(-50%, -100%)' }}
                >
                  <HighlightVocabPopup
                    text={popup.text}
                    onAdd={handleAdd}
                    onClose={closePopup}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Create Form ────────────────────────────────────────────────────────
function CreateForm({ onClose }: { onClose: () => void }) {
  const { createSpeakingTopic } = useStore();
  const [form, setForm] = useState({
    part: 1 as 1 | 2 | 3,
    topic: '',
    questions: '',
    sampleAnswer: '',
    keywords: '',
  });

  const handleSubmit = () => {
    if (!form.topic.trim() || !form.questions.trim()) return;
    createSpeakingTopic({
      part: form.part,
      topic: form.topic.trim(),
      questions: form.questions.split('\n').map(q => q.trim()).filter(Boolean),
      sampleAnswer: form.sampleAnswer.trim() || undefined,
      keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
    });
    onClose();
  };

  const PART_HINTS = [
    '',
    'Câu hỏi ngắn về chủ đề quen thuộc (gia đình, công việc, sở thích...)',
    'Mô tả chi tiết một vật/người/sự kiện trong ~2 phút',
    'Thảo luận và phân tích chủ đề trừu tượng, xã hội',
  ];

  return (
    <div className="bg-[var(--card)] border-2 border-[var(--primary)] rounded-2xl p-5 flex flex-col gap-4 animate-slide-down">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[var(--text)]">Thêm chủ đề mới</h3>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)]"><X size={18} /></button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="text-xs text-[var(--text-muted)] block mb-1">Chủ đề *</label>
          <input
            className="q-input"
            placeholder="VD: Hometown, Social Media, Environment..."
            value={form.topic}
            onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
            autoFocus
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Part</label>
          <select
            className="q-input"
            value={form.part}
            onChange={e => setForm(p => ({ ...p, part: parseInt(e.target.value) as 1 | 2 | 3 }))}
          >
            <option value={1}>Part 1</option>
            <option value={2}>Part 2</option>
            <option value={3}>Part 3</option>
          </select>
        </div>
      </div>
      <p className="text-xs text-[var(--text-muted)] -mt-2 italic">{PART_HINTS[form.part]}</p>
      <div>
        <label className="text-xs text-[var(--text-muted)] block mb-1">Câu hỏi * (mỗi dòng 1 câu)</label>
        <textarea
          rows={3}
          className="q-input resize-none text-sm"
          placeholder={'Do you like your hometown?\nWhat do you like most about living there?'}
          value={form.questions}
          onChange={e => setForm(p => ({ ...p, questions: e.target.value }))}
        />
      </div>
      <div>
        <label className="text-xs text-[var(--text-muted)] block mb-1">Bài mẫu (tùy chọn, có thể thêm sau)</label>
        <textarea
          rows={5}
          className="q-input resize-none text-sm font-mono leading-relaxed"
          placeholder="Dán bài mẫu vào đây..."
          value={form.sampleAnswer}
          onChange={e => setForm(p => ({ ...p, sampleAnswer: e.target.value }))}
        />
      </div>
      <div>
        <label className="text-xs text-[var(--text-muted)] block mb-1">Từ khóa (phân cách bằng dấu phẩy)</label>
        <input
          className="q-input"
          placeholder="VD: vibrant, nostalgic, reminisce, pivotal role..."
          value={form.keywords}
          onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!form.topic.trim() || !form.questions.trim()}
          className="btn-primary disabled:opacity-40"
        >
          <Check size={14} /> Lưu chủ đề
        </button>
        <button onClick={onClose} className="btn-ghost">Hủy</button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────
export default function SpeakingPage() {
  const { speakingTopics, isHydrated } = useStore();
  const [mounted, setMounted] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [filterPart, setFilterPart] = useState<'all' | 1 | 2 | 3>('all');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'topics' | 'history'>('topics');
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [customTopic, setCustomTopic] = useState('');

  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !isHydrated) return <LoadingScreen />;

  const all = Object.values(speakingTopics).sort((a, b) => b.updatedAt - a.updatedAt);
  const filtered = all.filter(t => {
    if (filterPart !== 'all' && t.part !== filterPart) return false;
    const q = search.toLowerCase();
    if (q && !t.topic.toLowerCase().includes(q) && !(t.sampleAnswer || '').toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto w-full">
      {/* ── Header ───────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
            <Mic size={24} className="text-[var(--primary)]" /> Chủ đề Speaking
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Thi thử IELTS Speaking Voice-to-Voice với AI Giám khảo.
          </p>
        </div>
        {!showCreate && activeTab === 'topics' && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setShowTopicModal(true)} className="h-9 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-500 to-indigo-600 text-white flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
              <Play size={16} fill="currentColor" /> Thi Mock Test
            </button>
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <Plus size={16} /> Thêm chủ đề
            </button>
          </div>
        )}
      </div>

      {/* ── Custom Topic Modal ───────────────────────── */}
      {showTopicModal && (
        <>
          <div className="fixed inset-0 bg-[var(--bg)]/80 backdrop-blur-sm z-40" onClick={() => setShowTopicModal(false)} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--card)] w-full max-w-sm rounded-2xl border border-[var(--border)] shadow-2xl z-50 p-6 flex flex-col gap-4 animate-scale-in">
            <h3 className="text-xl font-bold text-[var(--text)]">Bắt đầu thi thử</h3>
            <p className="text-sm text-[var(--text-muted)]">Nhập chủ đề bạn muốn thi (ví dụ: Environment, Technology, Education...) hoặc để trống để AI tự chọn chủ đề ngẫu nhiên.</p>
            <input
              type="text"
              autoFocus
              placeholder="Chủ đề thi..."
              className="q-input mt-2"
              value={customTopic}
              onChange={e => setCustomTopic(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  window.location.href = `/speaking/mock-test?mode=Full Test&customTopic=${encodeURIComponent(customTopic)}`;
                }
              }}
            />
            <div className="flex gap-2 justify-end mt-2">
              <button onClick={() => setShowTopicModal(false)} className="btn-ghost">Hủy</button>
              <Link href={`/speaking/mock-test?mode=Full Test&customTopic=${encodeURIComponent(customTopic)}`} className="btn-primary">
                Bắt đầu thi <Play size={14} fill="currentColor" />
              </Link>
            </div>
          </div>
        </>
      )}

      {/* ── Tabs ─────────────────────────────────────── */}
      <div className="flex border-b border-[var(--border)]">
        <button
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'topics' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'}`}
          onClick={() => setActiveTab('topics')}
        >
          Kho chủ đề ({all.length})
        </button>
        <button
          className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'history' ? 'border-[var(--primary)] text-[var(--primary)]' : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)]'}`}
          onClick={() => setActiveTab('history')}
        >
          Lịch sử thi ({Object.keys(useStore.getState().speakingSubmissions || {}).length})
        </button>
      </div>

      {activeTab === 'topics' && (
        <>
          {/* ── Create form ──────────────────────────────── */}
      {showCreate && <CreateForm onClose={() => setShowCreate(false)} />}

      {/* ── Stats ────────────────────────────────────── */}
      {all.length > 0 && (
        <div className="flex gap-3">
          {([1, 2, 3] as const).map(part => {
            const count = all.filter(t => t.part === part).length;
            const PART_COLORS = ['', '#4255FF', '#059669', '#D97706'];
            return (
              <div
                key={part}
                className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 text-center cursor-pointer hover:border-current transition-colors"
                style={{ ['--hover-color' as string]: PART_COLORS[part] }}
                onClick={() => setFilterPart(filterPart === part ? 'all' : part)}
              >
                <div className="text-xl font-black" style={{ color: PART_COLORS[part] }}>{count}</div>
                <div className="text-xs text-[var(--text-muted)] mt-0.5">Part {part}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Filters ──────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm chủ đề hoặc nội dung bài mẫu..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none focus:border-[var(--primary)] placeholder:text-[var(--text-muted)] transition-all"
          />
        </div>
        <div className="tab-pills !mb-0 !border-b-0 gap-1 flex-shrink-0">
          {(['all', 1, 2, 3] as const).map(p => (
            <button
              key={p}
              onClick={() => setFilterPart(p)}
              className={`tab-pill ${filterPart === p ? 'active' : ''}`}
            >
              {p === 'all' ? `Tất cả (${all.length})` : `Part ${p} (${all.filter(t => t.part === p).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── List ─────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <Mic size={36} className="text-[var(--text-muted)]" />
          <div>
            <h3 className="font-bold text-[var(--text)] text-lg">
              {search ? 'Không tìm thấy chủ đề phù hợp' : 'Chưa có chủ đề nào'}
            </h3>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              {search ? 'Thử từ khóa khác.' : 'Thêm chủ đề từ đề thi thực tế để luyện Speaking hiệu quả hơn.'}
            </p>
          </div>
          {!search && (
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <Plus size={16} /> Thêm chủ đề đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(t => <TopicCard key={t.id} topic={t} />)}
        </div>
      )}
      </>
      )}

      {activeTab === 'history' && (
        <div className="flex flex-col gap-3">
          {Object.values(useStore.getState().speakingSubmissions || {}).length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)] border border-[var(--border)] border-dashed rounded-2xl">
              Chưa có bài thi nào. Hãy bấm &quot;Thi Mock Test&quot; để bắt đầu!
            </div>
          ) : (
            Object.values(useStore.getState().speakingSubmissions || {}).sort((a, b) => b.createdAt - a.createdAt).map(sub => (
              <Link href={`/speaking/report/${sub.id}`} key={sub.id} className="bg-[var(--card)] p-4 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] transition-colors flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[var(--text)]">{sub.topic || 'General Topic'}</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{new Date(sub.createdAt).toLocaleString('vi-VN')} · Part {sub.part}</p>
                </div>
                <div className="flex items-center gap-3">
                  {sub.band ? (
                    <div className="px-3 py-1 bg-[var(--primary-light)] text-[var(--primary)] rounded-lg font-bold text-sm">
                      Band {sub.band}
                    </div>
                  ) : (
                    <div className="text-xs text-[var(--text-muted)] italic">Đang chấm...</div>
                  )}
                  <ChevronRight size={16} className="text-[var(--text-muted)]" />
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
