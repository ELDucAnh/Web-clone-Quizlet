'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { PenLine, Plus, Trash2, Edit2, X, ChevronDown, ChevronRight, Check, Search, Highlighter, FolderPlus, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import type { WritingTask, WritingSample } from '@/lib/types';

// ── Image Paste Helper ────────────────────────────────────────────────
const handleImagePaste = (e: React.ClipboardEvent, currentText: string, setter: (val: string) => void) => {
  const items = e.clipboardData?.items;
  if (!items) return;
  for (let i = 0; i < items.length; i++) {
    if (items[i].type.indexOf('image') !== -1) {
      e.preventDefault();
      const file = items[i].getAsFile();
      if (!file) continue;
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setter(currentText + `\n<img src="${base64}" alt="Pasted" class="max-w-full max-h-96 rounded-lg my-2 border border-[var(--border)]" />\n`);
      };
      reader.readAsDataURL(file);
      break;
    }
  }
};

// ── Highlight vocab popup ─────────────────────────────────────────────
function HighlightVocabPopup({
  text,
  onAdd,
  onClose,
  linkedDeckId,
}: {
  text: string;
  onAdd: (term: string, def: string, deckId: string) => void;
  onClose: () => void;
  linkedDeckId?: string;
}) {
  const { decks } = useStore();
  const deckList = Object.values(decks);
  const [def, setDef] = useState('');
  const [deckId, setDeckId] = useState(linkedDeckId || deckList[0]?.id || '');
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when popup appears
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = () => {
    if (def.trim() && deckId) {
      onAdd(text, def.trim(), deckId);
    }
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl p-3 flex flex-col gap-2 w-72 animate-scale-in">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--text-muted)]">Thêm vào học phần</p>
        <button onClick={onClose} className="w-5 h-5 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] rounded">
          <X size={12} />
        </button>
      </div>
      {/* Selected term */}
      <div className="px-2 py-1.5 bg-[var(--primary-light)] rounded-lg text-sm font-semibold text-[var(--primary)] truncate">
        &ldquo;{text}&rdquo;
      </div>
      {/* Definition input */}
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
      {/* Deck selector */}
      {deckList.length > 0 ? (
        <select className="q-input text-sm" value={deckId} onChange={e => setDeckId(e.target.value)}>
          {deckList.map(d => (
            <option key={d.id} value={d.id}>{d.name.slice(0, 35)}</option>
          ))}
        </select>
      ) : (
        <p className="text-xs text-[var(--text-muted)] italic">Bạn chưa có học phần nào. Hãy tạo học phần trước.</p>
      )}
      <div className="flex gap-2">
        <button
          className="btn-primary w-full text-sm py-2 disabled:opacity-40"
          onClick={handleSubmit}
          disabled={!def.trim() || !deckId}
        >
          <Check size={13} /> Lưu từ vựng
        </button>
      </div>
    </div>
  );
}

// -- Removed useHighlight hook --

// ── Sample Card ────────────────────────────────────────────────────────
function SampleCard({ sample }: { sample: WritingSample }) {
  const { deleteWritingSample, updateWritingSample, addCardToDeck, createDeck } = useStore();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: sample.title,
    topic: sample.topic,
    content: sample.content,
    band: sample.band?.toString() || '',
    task: sample.task,
  });
  const [mode, setMode] = useState<'vocab' | 'highlight' | 'erase'>('vocab');
  const [popup, setPopup] = useState<{ x: number; y: number; text: string } | null>(null);
  const [isGrading, setIsGrading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<any>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // Sync editData if sample changes (e.g. after save)
  useEffect(() => {
    setEditData({
      title: sample.title,
      topic: sample.topic,
      content: sample.content,
      band: sample.band?.toString() || '',
      task: sample.task,
    });
  }, [sample.title, sample.topic, sample.content, sample.band, sample.task]);

  const handleMouseUp = () => {
    const sel = window.getSelection();
    
    if (mode === 'erase') {
      if (sel && !sel.isCollapsed) {
        const marks = bodyRef.current?.querySelectorAll('mark');
        let changed = false;
        marks?.forEach(mark => {
          if (sel.containsNode(mark, true)) {
            const parent = mark.parentNode;
            if (parent) {
              while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
              parent.removeChild(mark);
              changed = true;
            }
          }
        });
        if (changed && bodyRef.current) {
          updateWritingSample(sample.id, { content: bodyRef.current.innerHTML });
        }
        sel.removeAllRanges();
      }
      return;
    }

    if (!sel || sel.isCollapsed) return;

    if (mode === 'highlight') {
      const range = sel.getRangeAt(0);
      try {
        const mark = document.createElement('mark');
        mark.className = 'bg-yellow-200 text-yellow-900 rounded px-1';
        range.surroundContents(mark);
        sel.removeAllRanges();
        if (bodyRef.current) {
          updateWritingSample(sample.id, { content: bodyRef.current.innerHTML });
        }
      } catch (e) {
        console.warn('Cannot highlight across multiple HTML nodes', e);
        sel.removeAllRanges();
      }
      return;
    }

    if (mode === 'vocab') {
      const text = sel.toString().trim();
      if (!text || text.length < 2 || text.length > 120) return;
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setPopup({ x: rect.left + rect.width / 2, y: rect.top - 8, text });
    }
  };

  const handleContentClick = (e: React.MouseEvent) => {
    if (mode === 'erase') {
      let target = e.target as HTMLElement;
      while (target && target !== bodyRef.current) {
        if (target.nodeName === 'MARK') {
          const parent = target.parentNode;
          if (parent) {
            while (target.firstChild) parent.insertBefore(target.firstChild, target);
            parent.removeChild(target);
            if (bodyRef.current) {
              updateWritingSample(sample.id, { content: bodyRef.current.innerHTML });
            }
          }
          break;
        }
        target = target.parentNode as HTMLElement;
      }
    }
  };

  const handleAddVocab = (term: string, def: string, deckId: string) => {
    addCardToDeck(deckId, term, def);
    setPopup(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleSave = () => {
    if (!editData.title.trim() || !editData.content.trim()) return;
    updateWritingSample(sample.id, {
      title: editData.title.trim(),
      topic: editData.topic.trim(),
      content: editData.content.trim(),
      band: editData.band ? parseFloat(editData.band) : undefined,
      task: editData.task,
    });
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditData({
      title: sample.title,
      topic: sample.topic,
      content: sample.content,
      band: sample.band?.toString() || '',
      task: sample.task,
    });
    setEditing(false);
  };

  const bandColor = (b?: number) =>
    !b ? 'var(--text-muted)' : b >= 7 ? '#059669' : b >= 6 ? '#D97706' : '#DC2626';

  const isTask1 = sample.task === 'task1';
  const linkedDeckTag = sample.tags?.find(t => t.startsWith('deck:'));
  const linkedDeckId = linkedDeckTag ? linkedDeckTag.split(':')[1] : undefined;

  const handleCreateDeck = () => {
    if (linkedDeckId) return;
    const newDeckId = createDeck(sample.title, `Từ vựng từ bài viết: ${sample.title}`, []);
    const newTags = [...(sample.tags || []), `deck:${newDeckId}`];
    updateWritingSample(sample.id, { tags: newTags });
  };

  const handleGradeWithAI = async () => {
    if (!sample.topic || !sample.content) {
      alert('Cần có đủ Đề bài (Topic) và Nội dung bài làm để AI chấm điểm!');
      return;
    }
    setIsGrading(true);
    setAiFeedback(null);
    setExpanded(true);
    try {
      const res = await fetch('/api/ai/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskType: sample.task,
          topic: sample.topic,
          essay: sample.content.replace(/<[^>]*>?/gm, '').trim()
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAiFeedback(data);
        if (data.overallBand) {
          updateWritingSample(sample.id, { band: data.overallBand });
        }
      } else {
        alert(data.error || 'Có lỗi xảy ra khi chấm bài.');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể kết nối đến AI.');
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className={`bg-[var(--card)] border rounded-2xl overflow-hidden transition-colors ${editing ? 'border-[var(--primary)]' : 'border-[var(--border)]'}`}>
      {/* ── Card header — always clickable to expand ──── */}
      <button
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-[var(--bg)] transition-colors"
        onClick={() => { if (!editing) setExpanded(v => !v); }}
        disabled={editing}
      >
        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-black flex-shrink-0 mt-0.5 ${
          isTask1
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
        }`}>
          {isTask1 ? 'Task 1' : 'Task 2'}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[var(--text)] leading-snug truncate">{sample.title}</h3>
          {sample.topic && (
            <div 
              className="text-[var(--text)] font-medium mt-1.5 mb-2 whitespace-pre-wrap text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: sample.topic }}
            />
          )}
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {sample.content.replace(/<[^>]*>?/gm, '').trim().split(/\s+/).filter(w => w.length > 0).length} từ
            {sample.band && (
              <span className="ml-2 font-bold" style={{ color: bandColor(sample.band) }}>
                Band {sample.band}
              </span>
            )}
          </p>
        </div>
        {!editing && (
          <span className="text-[var(--text-muted)] flex-shrink-0 mt-1">
            {expanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
          </span>
        )}
      </button>

      {/* ── Action buttons row (always visible) ─────── */}
      <div className="px-4 pb-3 flex flex-wrap items-center justify-end gap-2 -mt-2">
        {!editing ? (
          <>
            {linkedDeckId ? (
              <Link
                href={`/study/${linkedDeckId}`}
                className="flex items-center gap-1 text-xs font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors py-1.5 px-3 rounded-lg shadow-sm"
                onClick={e => e.stopPropagation()}
              >
                <BookOpen size={13} /> Học bộ từ của bài này
              </Link>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); handleCreateDeck(); }}
                className="flex items-center gap-1 text-xs font-bold text-[var(--primary)] bg-[var(--primary-light)] hover:opacity-80 transition-opacity py-1.5 px-3 rounded-lg mr-auto"
              >
                <FolderPlus size={13} /> Tạo bộ học phần
              </button>
            )}
            
            <button
              onClick={(e) => { e.stopPropagation(); setEditing(true); setExpanded(true); }}
              className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors py-1 px-2 rounded-lg hover:bg-[var(--primary-light)] ml-auto"
            >
              <Edit2 size={12} /> Sửa
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleGradeWithAI(); }}
              disabled={isGrading}
              className="flex items-center gap-1 text-xs text-purple-600 font-semibold hover:text-purple-700 transition-colors py-1 px-2 rounded-lg hover:bg-purple-50 disabled:opacity-50"
            >
              {isGrading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} 
              {isGrading ? 'AI đang chấm...' : 'Chấm bằng AI'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); if (confirm('Xóa bài mẫu này?')) deleteWritingSample(sample.id); }}
              className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-red-500 transition-colors py-1 px-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <Trash2 size={12} /> Xóa
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleSave}
              disabled={!editData.title.trim() || !editData.content.trim()}
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

      {/* ── Expanded content ─────────────────────────── */}
      {expanded && (
        <div className="border-t border-[var(--border)] p-5">
          {editing ? (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Loại</label>
                  <select
                    className="q-input"
                    value={editData.task}
                    onChange={e => setEditData(p => ({ ...p, task: e.target.value as WritingTask }))}
                  >
                    <option value="task1">Task 1</option>
                    <option value="task2">Task 2</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Tiêu đề *</label>
                  <input
                    className="q-input"
                    value={editData.title}
                    onChange={e => setEditData(p => ({ ...p, title: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Đề / Topic (hỗ trợ dán ảnh Ctrl+V)</label>
                  <textarea
                    rows={3}
                    className="q-input resize-y font-mono text-xs leading-relaxed"
                    value={editData.topic}
                    onChange={e => setEditData(p => ({ ...p, topic: e.target.value }))}
                    onPaste={e => handleImagePaste(e, editData.topic, (val) => setEditData(p => ({ ...p, topic: val })))}
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-muted)] block mb-1">Band (0–9)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    className="q-input"
                    value={editData.band}
                    onChange={e => setEditData(p => ({ ...p, band: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] block mb-1">Nội dung bài mẫu *</label>
                <textarea
                  rows={12}
                  className="q-input resize-y font-mono text-xs leading-relaxed"
                  value={editData.content}
                  onChange={e => setEditData(p => ({ ...p, content: e.target.value }))}
                />
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-3 bg-[var(--bg)] p-1.5 rounded-lg w-max border border-[var(--border)]">
                <button
                  onClick={() => { setMode('vocab'); setPopup(null); }}
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors ${mode === 'vocab' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                >
                  <BookOpen size={13} /> Tra từ & Thêm thẻ
                </button>
                <button
                  onClick={() => { setMode('highlight'); setPopup(null); }}
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors ${mode === 'highlight' ? 'bg-yellow-400 text-yellow-900 shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                >
                  <Highlighter size={13} /> Bút Highlight
                </button>
                <button
                  onClick={() => { setMode('erase'); setPopup(null); }}
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors ${mode === 'erase' ? 'bg-red-500 text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
                >
                  <Trash2 size={13} /> Tẩy Highlight
                </button>
              </div>

              <div 
                ref={bodyRef}
                className={`text-base text-[var(--text)] leading-relaxed whitespace-pre-wrap font-sans ${mode === 'erase' ? 'cursor-pointer' : ''}`}
                dangerouslySetInnerHTML={{ __html: sample.content }}
                onMouseUp={handleMouseUp}
                onClick={handleContentClick}
              />
              {popup && mode === 'vocab' && (
                <div
                  className="fixed z-50"
                  style={{ left: popup.x, top: popup.y, transform: 'translate(-50%, -100%)' }}
                >
                  <HighlightVocabPopup
                    text={popup.text}
                    onAdd={handleAddVocab}
                    onClose={() => { setPopup(null); window.getSelection()?.removeAllRanges(); }}
                    linkedDeckId={linkedDeckId}
                  />
                </div>
              )}

              {/* AI Feedback UI */}
              {aiFeedback && (
                <div className="mt-6 pt-5 border-t-2 border-dashed border-purple-200">
                  <div className="flex items-center gap-2 mb-4 text-purple-700 font-bold text-lg">
                    <Sparkles size={20} /> Kết quả chấm điểm từ AI
                  </div>
                  
                  <div className="flex items-center gap-4 mb-5 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="text-center">
                      <div className="text-3xl font-black text-purple-700">{aiFeedback.overallBand}</div>
                      <div className="text-xs font-semibold text-purple-500 uppercase tracking-wider">Overall</div>
                    </div>
                    <div className="flex-1 grid grid-cols-4 gap-2">
                      {['TR', 'CC', 'LR', 'GRA'].map(crit => (
                        <div key={crit} className="bg-white rounded-lg p-2 text-center shadow-sm">
                          <div className="text-lg font-bold text-[var(--text)]">{aiFeedback.scores?.[crit]}</div>
                          <div className="text-[10px] font-bold text-[var(--text-muted)]">{crit}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-blue-50/50 p-4 rounded-xl text-sm">
                      <h4 className="font-bold text-blue-800 mb-2">Nhận xét chung</h4>
                      <p className="text-[var(--text)] leading-relaxed">{aiFeedback.generalComment}</p>
                    </div>

                    {aiFeedback.grammarErrors?.length > 0 && (
                      <div>
                        <h4 className="font-bold text-red-700 mb-2 flex items-center gap-2 text-sm"><X size={16}/> Lỗi ngữ pháp cần chú ý</h4>
                        <ul className="space-y-2">
                          {aiFeedback.grammarErrors.map((err: any, idx: number) => (
                            <li key={idx} className="bg-red-50 p-3 rounded-lg text-sm border border-red-100">
                              <p className="line-through text-red-400 mb-1">{err.error}</p>
                              <p className="font-semibold text-green-600 mb-1">✓ {err.correction}</p>
                              <p className="text-[var(--text-muted)] text-xs">{err.explanation}</p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Create Form ───────────────────────────────────────────────────────
function CreateForm({ onClose }: { onClose: () => void }) {
  const { createWritingSample } = useStore();
  const [form, setForm] = useState({ task: 'task1' as WritingTask, title: '', topic: '', content: '', band: '' });

  const handleSubmit = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    createWritingSample({
      task: form.task,
      title: form.title.trim(),
      topic: form.topic.trim(),
      content: form.content.trim(),
      band: form.band ? parseFloat(form.band) : undefined,
    });
    onClose();
  };

  return (
    <div className="bg-[var(--card)] border-2 border-[var(--primary)] rounded-2xl p-5 flex flex-col gap-4 animate-slide-down">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[var(--text)]">Thêm bài mẫu mới</h3>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text)]"><X size={18} /></button>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Loại</label>
          <select
            className="q-input"
            value={form.task}
            onChange={e => setForm(p => ({ ...p, task: e.target.value as WritingTask }))}
          >
            <option value="task1">Task 1 (biểu đồ, bản đồ...)</option>
            <option value="task2">Task 2 (luận điểm, ý kiến...)</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-xs text-[var(--text-muted)] block mb-1">Tiêu đề *</label>
          <input
            className="q-input"
            placeholder={form.task === 'task1' ? 'VD: Line graph – UK population 1900-2000' : 'VD: Some people think technology has made life more complex...'}
            value={form.title}
            onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            autoFocus
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="text-xs text-[var(--text-muted)] block mb-1">Đề / Topic (hỗ trợ dán ảnh Ctrl+V)</label>
          <textarea
            rows={3}
            className="q-input resize-y font-mono text-xs leading-relaxed"
            placeholder="Dán nguyên văn đề bài hoặc Ctrl+V ảnh vào đây..."
            value={form.topic}
            onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
            onPaste={e => handleImagePaste(e, form.topic, (val) => setForm(p => ({ ...p, topic: val })))}
          />
        </div>
        <div>
          <label className="text-xs text-[var(--text-muted)] block mb-1">Band (tùy chọn)</label>
          <input
            type="number"
            step="0.5"
            min="0"
            max="9"
            className="q-input"
            placeholder="7.5"
            value={form.band}
            onChange={e => setForm(p => ({ ...p, band: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-[var(--text-muted)] block mb-1">Nội dung bài mẫu *</label>
        <textarea
          rows={10}
          className="q-input resize-y font-mono text-xs leading-relaxed"
          placeholder="Dán bài mẫu vào đây..."
          value={form.content}
          onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={!form.title.trim() || !form.content.trim()}
          className="btn-primary disabled:opacity-40"
        >
          <Check size={14} /> Lưu bài mẫu
        </button>
        <button onClick={onClose} className="btn-ghost">Hủy</button>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────
export default function WritingPage() {
  const { writingSamples } = useStore();
  const [mounted, setMounted] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState<'all' | 'task1' | 'task2'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const all = Object.values(writingSamples).sort((a, b) => b.updatedAt - a.updatedAt);
  const task1Count = all.filter(s => s.task === 'task1').length;
  const task2Count = all.filter(s => s.task === 'task2').length;

  const filtered = all.filter(s => {
    if (filter !== 'all' && s.task !== filter) return false;
    const q = search.toLowerCase();
    if (q && !s.title.toLowerCase().includes(q) && !s.topic.toLowerCase().includes(q) && !s.content.toLowerCase().includes(q)) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto w-full">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
            <PenLine size={24} className="text-[var(--primary)]" /> Kho bài mẫu Writing
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Lưu bài mẫu Task 1 & Task 2. Bôi đen từ/cụm từ để thêm ngay vào học phần từ vựng.
          </p>
        </div>
        {!showCreate && (
          <button onClick={() => setShowCreate(true)} className="btn-primary flex-shrink-0">
            <Plus size={16} /> Thêm bài mẫu
          </button>
        )}
      </div>

      {/* ── Create form ───────────────────────────────────── */}
      {showCreate && <CreateForm onClose={() => setShowCreate(false)} />}

      {/* ── Filters ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề, topic hoặc nội dung..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none transition-all focus:border-[var(--primary)] placeholder:text-[var(--text-muted)]"
          />
        </div>
        <div className="tab-pills !mb-0 !border-b-0 gap-1 flex-shrink-0">
          {(['all', 'task1', 'task2'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`tab-pill ${filter === t ? 'active' : ''}`}
            >
              {t === 'all' ? `Tất cả (${all.length})` : t === 'task1' ? `Task 1 (${task1Count})` : `Task 2 (${task2Count})`}
            </button>
          ))}
        </div>
      </div>

      {/* ── List ─────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <PenLine size={36} className="text-[var(--text-muted)]" />
          <div>
            <h3 className="font-bold text-[var(--text)] text-lg">
              {search ? 'Không tìm thấy bài phù hợp' : 'Kho bài mẫu trống'}
            </h3>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              {search ? 'Thử từ khóa khác hoặc tìm trong nội dung.' : 'Thêm bài mẫu từ sách Cambridge, IELTS Liz, v.v.'}
            </p>
          </div>
          {!search && (
            <button onClick={() => setShowCreate(true)} className="btn-primary">
              <Plus size={16} /> Thêm bài mẫu đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(s => <SampleCard key={s.id} sample={s} />)}
        </div>
      )}
    </div>
  );
}
