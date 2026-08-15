'use client';
import { useCallback, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, GripVertical, ArrowLeft, FileText, RotateCcw, ChevronRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { ImportZone, ParseFeedback, PreviewTable } from '@/components/ImportZone';
import { parseCSVFile } from '@/lib/csv-parser';
import type { ParseResult } from '@/lib/csv-parser';

interface CardRow {
  id: string;
  term: string;
  definition: string;
}

function CreateSetContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams?.get('edit');
  const { createDeck, updateDeck, addCardToDeck, updateCard, deleteCard, folders, decks, cards, cardsByDeck } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [rows, setRows] = useState<CardRow[]>([
    { id: crypto.randomUUID(), term: '', definition: '' },
    { id: crypto.randomUUID(), term: '', definition: '' },
    { id: crypto.randomUUID(), term: '', definition: '' },
  ]);

  // CSV import state
  const [showImport, setShowImport] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isLoadingCSV, setIsLoadingCSV] = useState(false);
  const [flipped, setFlipped] = useState(false);

  // Initialize edit mode
  useEffect(() => {
    if (!editId || !decks[editId]) return;
    setIsEditMode(true);
    const deck = decks[editId];
    setName(deck.name);
    setDescription(deck.description || '');
    setSelectedFolder(deck.folderId || '');
    
    const deckCardIds = cardsByDeck[editId] || [];
    if (deckCardIds.length > 0) {
      const existingRows = deckCardIds.map(id => {
        const c = cards[id];
        return { id: c.id, term: c.term, definition: c.definition, originalId: c.id };
      });
      setRows(existingRows);
    }
  }, [editId, decks, cards, cardsByDeck]);

  const folderList = Object.values(folders);

  const handleAddRow = () => {
    setRows((prev) => [...prev, { id: crypto.randomUUID(), term: '', definition: '' }]);
  };

  const handleDeleteRow = (id: string) => {
    setRows((prev) => prev.length > 1 ? prev.filter((r) => r.id !== id) : prev);
  };

  const handleRowChange = (id: string, field: 'term' | 'definition', value: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleFlip = () => {
    setFlipped((f) => !f);
    setRows((prev) => prev.map((r) => ({ ...r, term: r.definition, definition: r.term })));
  };

  const handleCSVFile = useCallback(async (f: File) => {
    setIsLoadingCSV(true);
    setParseResult(null);
    try {
      const result = await parseCSVFile(f);
      setParseResult(result);
      if (result.cards.length > 0 && !name) {
        setName(f.name.replace(/\.csv$/i, '').trim());
      }
    } catch (e) {
      setParseResult({ cards: [], errors: [`Lỗi: ${e}`], warnings: [], skippedRows: 0 });
    } finally {
      setIsLoadingCSV(false);
    }
  }, [name]);

  const handleImportCSV = () => {
    if (!parseResult || parseResult.cards.length === 0) return;
    const newRows: CardRow[] = parseResult.cards.map((c) => ({
      id: crypto.randomUUID(),
      term: c.term,
      definition: c.definition,
    }));
    setRows(newRows);
    setShowImport(false);
    setParseResult(null);
  };

  const validRows = rows.filter((r) => r.term.trim() && r.definition.trim());

  const handleCreate = () => {
    if (!name.trim() || validRows.length === 0) return;

    if (isEditMode && editId) {
      updateDeck(editId, name.trim(), description.trim());
      // Handle cards
      const oldCardIds = new Set(cardsByDeck[editId] || []);
      const newCardIds = new Set();
      
      validRows.forEach(r => {
        if ((r as any).originalId) {
          // Update existing
          updateCard(r.id, r.term.trim(), r.definition.trim());
          newCardIds.add(r.id);
        } else {
          // Add new
          addCardToDeck(editId, r.term.trim(), r.definition.trim());
        }
      });
      
      // Delete removed
      oldCardIds.forEach(id => {
        if (!newCardIds.has(id)) {
          deleteCard(id);
        }
      });
      
      router.push(`/study/${editId}`);
    } else {
      const deckId = createDeck(
        name.trim(),
        description.trim(),
        validRows.map((r) => ({ term: r.term.trim(), definition: r.definition.trim() })),
        selectedFolder || undefined
      );
      router.push(`/study/${deckId}`);
    }
  };

  const canCreate = name.trim().length > 0 && validRows.length >= 1;

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-3xl mx-auto">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[var(--text)]">{isEditMode ? 'Chỉnh sửa học phần' : 'Tạo học phần mới'}</h1>
            <p className="text-xs text-[var(--text-muted)]">Nhập từ vựng và định nghĩa</p>
          </div>
        </div>

        <button
          onClick={handleCreate}
          disabled={!canCreate}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEditMode ? 'Lưu học phần' : 'Tạo học phần'}
        </button>
      </div>

      {/* ── Set Metadata ──────────────────────────────────── */}
      <div className="flex flex-col gap-4 bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <div>
          <label className="text-sm font-semibold text-[var(--text)] block mb-1.5">
            Tiêu đề học phần <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: IELTS Vocabulary - Topic 1: Education"
            maxLength={100}
            className="q-input text-base font-semibold"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-[var(--text)] block mb-1.5">
            Mô tả <span className="text-[var(--text-muted)] font-normal">(tùy chọn)</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả nội dung học phần..."
            maxLength={300}
            rows={2}
            className="q-input resize-none"
          />
        </div>
        {folderList.length > 0 && (
          <div>
            <label className="text-sm font-semibold text-[var(--text)] block mb-1.5">
              Thêm vào thư mục <span className="text-[var(--text-muted)] font-normal">(tùy chọn)</span>
            </label>
            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="q-input cursor-pointer"
            >
              <option value="">Không có thư mục</option>
              {folderList.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Toolbar ─────────────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setShowImport((v) => !v)}
          className="btn-ghost text-sm flex items-center gap-2"
        >
          <FileText size={15} />
          {showImport ? 'Ẩn Import CSV' : 'Import từ CSV'}
        </button>
        <button
          onClick={handleFlip}
          className="btn-ghost text-sm flex items-center gap-2"
        >
          <RotateCcw size={15} />
          Đảo ngược Từ & Nghĩa
        </button>
        <span className="ml-auto text-sm text-[var(--text-muted)]">
          {validRows.length} / {rows.length} thẻ hợp lệ
        </span>
      </div>

      {/* ── CSV Import Zone ─────────────────────────────── */}
      {showImport && (
        <div className="flex flex-col gap-4 p-5 bg-[var(--card)] border border-[var(--border)] rounded-2xl animate-slide-down">
          <h3 className="font-semibold text-[var(--text)]">Import từ file CSV</h3>
          <ImportZone onFile={handleCSVFile} isLoading={isLoadingCSV} />
          {parseResult && !isLoadingCSV && (
            <>
              <ParseFeedback
                warnings={parseResult.warnings}
                errors={parseResult.errors}
                skippedRows={parseResult.skippedRows}
                validCount={parseResult.cards.length}
              />
              {parseResult.cards.length > 0 && (
                <>
                  <PreviewTable cards={parseResult.cards} />
                  <button
                    onClick={handleImportCSV}
                    disabled={parseResult.errors.length > 0}
                    className="btn-primary disabled:opacity-50"
                  >
                    Áp dụng {parseResult.cards.length} thẻ từ CSV
                  </button>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Card Column Headers ─────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 px-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
        <span>Thuật ngữ (Term)</span>
        <span>Định nghĩa (Definition)</span>
      </div>

      {/* ── Card Rows ─────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {rows.map((row, idx) => (
          <div
            key={row.id}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden transition-all hover:border-[var(--primary)] group"
          >
            {/* Row number bar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--bg)]">
              <span className="text-xs font-bold text-[var(--text-muted)]">{idx + 1}</span>
              <button
                onClick={() => handleDeleteRow(row.id)}
                disabled={rows.length <= 1}
                className="w-6 h-6 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 size={12} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-0">
              <div className="border-r border-[var(--border)]">
                <textarea
                  value={row.term}
                  onChange={(e) => handleRowChange(row.id, 'term', e.target.value)}
                  placeholder="Nhập thuật ngữ..."
                  rows={2}
                  className="w-full p-4 text-sm bg-transparent text-[var(--text)] resize-none outline-none placeholder:text-[var(--text-muted)]/60 focus:bg-[var(--primary-light)]/30 transition-colors"
                />
              </div>
              <div>
                <textarea
                  value={row.definition}
                  onChange={(e) => handleRowChange(row.id, 'definition', e.target.value)}
                  placeholder="Nhập định nghĩa..."
                  rows={2}
                  className="w-full p-4 text-sm bg-transparent text-[var(--text)] resize-none outline-none placeholder:text-[var(--text-muted)]/60 focus:bg-[var(--primary-light)]/30 transition-colors"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add Card Button ─────────────────────────────── */}
      <button
        onClick={handleAddRow}
        className="flex items-center justify-center gap-2 py-4 border-2 border-dashed border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] transition-all font-semibold"
      >
        <Plus size={18} />
        Thêm thẻ mới
      </button>

      {/* ── Sticky Create Button ─────────────────────────── */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={handleCreate}
          disabled={!canCreate}
          className="btn-primary px-8 py-3 text-base shadow-lg shadow-[var(--primary)]/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEditMode ? 'Lưu thay đổi' : `Tạo học phần (${validRows.length} thẻ)`}
        </button>
      </div>
    </div>
  );
}

export default function CreateSetPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CreateSetContent />
    </Suspense>
  );
}
