'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Folder, Plus, MoreVertical, Pencil, Trash2, X, BookOpen,
  ChevronRight, ArrowLeft, TrendingUp
} from 'lucide-react';
import { useStore } from '@/lib/store';

export default function FolderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.id as string;

  const { folders, decks, cardsByDeck, progress, updateFolder, deleteFolder, addDeckToFolder, removeDeckFromFolder } = useStore();
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [showAddDeck, setShowAddDeck] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'decks'>('all');

  useEffect(() => { setMounted(true); }, []);

  const folder = folders[folderId];

  useEffect(() => {
    if (folder) {
      setEditName(folder.name);
      setEditDesc(folder.description || '');
    }
  }, [folder]);

  if (!mounted) return null;

  if (!folder) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center">
          <Folder size={24} />
        </div>
        <h2 className="text-xl font-bold text-[var(--text)]">Không tìm thấy thư mục</h2>
        <Link href="/library" className="btn-primary">
          <ArrowLeft size={16} /> Về thư viện
        </Link>
      </div>
    );
  }

  const folderDecks = folder.deckIds
    .map((id) => decks[id])
    .filter(Boolean);

  const handleSaveEdit = () => {
    if (!editName.trim()) return;
    updateFolder(folderId, editName.trim(), editDesc.trim());
    setEditing(false);
  };

  const handleDeleteFolder = () => {
    if (confirm(`Xóa thư mục "${folder.name}"? Các học phần bên trong sẽ không bị xóa.`)) {
      deleteFolder(folderId);
      router.push('/library');
    }
  };

  // All decks NOT in this folder (for add dialog)
  const availableDecks = Object.values(decks).filter(
    (d) => !folder.deckIds.includes(d.id)
  );

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* ── Breadcrumb ───────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <Link href="/" className="hover:text-[var(--primary)] transition-colors">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link href="/library?tab=folders" className="hover:text-[var(--primary)] transition-colors">Thư mục</Link>
        <ChevronRight size={14} />
        <span className="text-[var(--text)] font-medium truncate">{folder.name}</span>
      </div>

      {/* ── Folder Header ─────────────────────────────── */}
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Folder size={36} />
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
                maxLength={80}
                className="q-input text-lg font-bold"
              />
              <input
                type="text"
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                maxLength={200}
                placeholder="Mô tả thư mục (tùy chọn)"
                className="q-input text-sm"
              />
              <div className="flex gap-2">
                <button onClick={handleSaveEdit} className="btn-primary text-sm py-2">Lưu</button>
                <button onClick={() => setEditing(false)} className="btn-ghost text-sm py-2">Hủy</button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-[var(--text)] truncate">{folder.name}</h1>
              {folder.description && (
                <p className="text-[var(--text-muted)] text-sm mt-1">{folder.description}</p>
              )}
              <p className="text-sm text-[var(--text-muted)] mt-1">
                {folder.deckIds.length} học phần
              </p>
            </>
          )}
        </div>

        {/* 3-dot menu */}
        {!editing && (
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors"
            >
              <MoreVertical size={18} />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-10 z-20 w-44 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl animate-scale-in overflow-hidden">
                  <button
                    onClick={() => { setShowMenu(false); setEditing(true); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-[var(--bg)] transition-colors text-left"
                  >
                    <Pencil size={14} /> Đổi tên thư mục
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); setShowAddDeck(true); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-[var(--bg)] transition-colors text-left"
                  >
                    <Plus size={14} /> Thêm học phần
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); handleDeleteFolder(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
                  >
                    <Trash2 size={14} /> Xóa thư mục
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Filter Pills ──────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
            activeFilter === 'all'
              ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
              : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setActiveFilter('decks')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all flex items-center gap-1.5 ${
            activeFilter === 'decks'
              ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
              : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
          }`}
        >
          <BookOpen size={13} /> Học phần
        </button>
        <button
          onClick={() => setShowAddDeck(true)}
          className="px-4 py-1.5 rounded-full text-sm font-medium border border-dashed border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all flex items-center gap-1.5"
        >
          <Plus size={13} /> Thêm học phần
        </button>
      </div>

      {/* ── Content ──────────────────────────────────── */}
      {folderDecks.length === 0 ? (
        /* Quizlet-style empty state */
        <div className="empty-state">
          <div className="flex gap-3 mb-2">
            <div className="w-14 h-20 rounded-xl bg-[var(--primary-light)] opacity-90 transform -rotate-6 border border-[var(--border)]" />
            <div className="w-14 h-20 rounded-xl bg-[var(--primary)] opacity-40" />
            <div className="w-14 h-20 rounded-xl bg-[var(--primary-light)] opacity-90 transform rotate-6 border border-[var(--border)]" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text)] text-lg">Bắt đầu xây dựng thư mục của bạn</h3>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              Thêm học phần vào thư mục để tổ chức nội dung học tập
            </p>
          </div>
          <button onClick={() => setShowAddDeck(true)} className="btn-primary px-6 py-3">
            Thêm tài liệu học
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {folderDecks.map((deck) => {
            if (!deck) return null;
            const cardIds = cardsByDeck[deck.id] ?? [];
            const mastered = cardIds.filter((id) => progress[id]?.learnStage === 'mastered').length;
            const pct = deck.cardCount > 0 ? Math.round((mastered / deck.cardCount) * 100) : 0;
            return (
              <div
                key={deck.id}
                className="relative bg-[var(--card)] rounded-xl border border-[var(--border)] flex flex-col overflow-hidden transition-all duration-200 hover:shadow-md hover:border-[var(--border-strong)] hover:-translate-y-0.5 group"
              >
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/study/${deck.id}`} className="flex-1 min-w-0 group/link">
                      <h3 className="font-bold text-[var(--text)] truncate group-hover/link:text-[var(--primary)] transition-colors text-[0.9375rem] leading-snug tracking-tight">
                        {deck.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs text-[var(--text-muted)]">{deck.cardCount} thẻ</span>
                        {pct === 100 && deck.cardCount > 0 && (
                          <span className="badge badge-green text-[10px]">Hoàn thành</span>
                        )}
                      </div>
                    </Link>
                    <button
                      onClick={() => removeDeckFromFolder(folderId, deck.id)}
                      className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-all flex-shrink-0"
                      title="Xóa khỏi thư mục"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[var(--text-muted)]">{mastered}/{deck.cardCount} đã thuộc</span>
                      <span className="text-xs font-bold text-[var(--primary)]">{pct}%</span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: pct === 100
                            ? 'linear-gradient(90deg, #16A34A, #22C55E)'
                            : 'linear-gradient(90deg, var(--primary) 0%, #818CF8 100%)',
                        }}
                      />
                    </div>
                  </div>
                  <Link
                    href={`/study/${deck.id}`}
                    className="block text-center py-2 px-4 rounded-lg font-semibold text-sm text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors active:scale-95"
                  >
                    {pct === 100 ? 'Học lại' : deck.lastStudied ? 'Tiếp tục học' : 'Bắt đầu học'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Deck Modal ────────────────────────────── */}
      {showAddDeck && (
        <>
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowAddDeck(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="w-full max-w-md bg-[var(--card)] rounded-2xl shadow-2xl animate-scale-in pointer-events-auto max-h-[80vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                <h2 className="font-bold text-lg text-[var(--text)]">Thêm học phần vào thư mục</h2>
                <button onClick={() => setShowAddDeck(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg)]">
                  <X size={18} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 p-4">
                {availableDecks.length === 0 ? (
                  <div className="text-center py-8 text-[var(--text-muted)]">
                    <BookOpen size={32} className="mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Tất cả học phần đã ở trong thư mục này</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableDecks.map((deck) => (
                      <button
                        key={deck.id}
                        onClick={() => { addDeckToFolder(folderId, deck.id); setShowAddDeck(false); }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all text-left group"
                      >
                        <div className="w-9 h-9 rounded-lg bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                          <BookOpen size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-[var(--text)] truncate group-hover:text-[var(--primary)]">{deck.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{deck.cardCount} thẻ</p>
                        </div>
                        <Plus size={15} className="ml-auto text-[var(--text-muted)] group-hover:text-[var(--primary)] flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
