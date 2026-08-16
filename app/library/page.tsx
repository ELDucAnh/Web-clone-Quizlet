'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Folder, Star, Plus, Search, SortAsc, MoreVertical, Trash2, RotateCcw, ChevronRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { appConfirm } from '@/lib/dialog';
import type { Deck } from '@/lib/types';

type Tab = 'sets' | 'folders' | 'starred';
type SortBy = 'recent' | 'alpha' | 'studied';

import { DeckCard } from '@/components/DeckCard';
import { LoadingScreen } from '@/components/LoadingScreen';

function DeckMenu({ deck, onDelete, onReset }: { deck: Deck; onDelete: () => void; onReset: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)] transition-colors"
      >
        <MoreVertical size={15} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-20 w-44 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl animate-scale-in overflow-hidden">
            <button onClick={() => { setOpen(false); onReset(); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-[var(--bg)] transition-colors text-left">
              <RotateCcw size={14} /> Đặt lại tiến độ
            </button>
            <button onClick={() => { setOpen(false); onDelete(); }} className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left">
              <Trash2 size={14} /> Xóa học phần
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function LibraryContent() {
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as Tab | null;

  const [activeTab, setActiveTab] = useState<Tab>(tabParam || 'sets');
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [search, setSearch] = useState('');

  const { decks, folders, cards, cardsByDeck, progress, deleteDeck, resetDeckProgress, deleteFolder, isHydrated } = useStore();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (tabParam) setActiveTab(tabParam); }, [tabParam]);

  const deckList = Object.values(decks)
    .filter((d) => !search || d.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'alpha') return a.name.localeCompare(b.name);
      if (sortBy === 'studied') return (b.lastStudied || 0) - (a.lastStudied || 0);
      return b.createdAt - a.createdAt;
    });

  const folderList = Object.values(folders)
    .filter((f) => !search || f.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.updatedAt - a.updatedAt);

  // Starred terms: collect all starred cards
  const starredCards = Object.values(cards).filter((c) => c.starred);

  const handleDeleteDeck = async (id: string, name: string) => {
    if (await appConfirm(`Xóa học phần "${name}"? Thao tác này không thể hoàn tác.`)) {
      deleteDeck(id);
    }
  };

  const handleResetDeck = async (id: string) => {
    if (await appConfirm('Đặt lại toàn bộ tiến độ của học phần này?')) {
      resetDeckProgress(id);
    }
  };

  const handleDeleteFolder = async (id: string, name: string) => {
    if (await appConfirm(`Xóa thư mục "${name}"? Các học phần bên trong sẽ không bị xóa.`)) {
      deleteFolder(id);
    }
  };

  if (!mounted || !isHydrated) return <LoadingScreen />;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Thư viện của bạn</h1>
          <p className="text-[var(--text-muted)] text-sm mt-0.5">
            {Object.keys(decks).length} học phần · {Object.keys(folders).length} thư mục
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/create-set" className="btn-primary text-sm">
            <Plus size={16} /> Tạo học phần
          </Link>
        </div>
      </div>

      {/* ── Search & Filter ─────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm trong thư viện..."
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none transition-all focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] placeholder:text-[var(--text-muted)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <SortAsc size={15} className="text-[var(--text-muted)]" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="h-10 px-3 pr-8 rounded-xl border border-[var(--border)] bg-[var(--bg)] text-[var(--text)] text-sm outline-none cursor-pointer focus:border-[var(--primary)] transition-colors"
          >
            <option value="recent">Mới nhất</option>
            <option value="studied">Đã học gần đây</option>
            <option value="alpha">A-Z</option>
          </select>
        </div>
      </div>

      {/* ── Tabs ─────────────────────────────────────────── */}
      <div className="tab-pills">
        <button className={`tab-pill ${activeTab === 'sets' ? 'active' : ''}`} onClick={() => setActiveTab('sets')}>
          <span className="flex items-center gap-1.5"><BookOpen size={14} /> Học phần ({Object.keys(decks).length})</span>
        </button>
        <button className={`tab-pill ${activeTab === 'folders' ? 'active' : ''}`} onClick={() => setActiveTab('folders')}>
          <span className="flex items-center gap-1.5"><Folder size={14} /> Thư mục ({Object.keys(folders).length})</span>
        </button>
        <button className={`tab-pill ${activeTab === 'starred' ? 'active' : ''}`} onClick={() => setActiveTab('starred')}>
          <span className="flex items-center gap-1.5"><Star size={14} /> Đã gắn sao ({starredCards.length})</span>
        </button>
      </div>

      {/* ── Tab Content ──────────────────────────────────── */}
      {activeTab === 'sets' && (
        <div className="animate-fade-in">
          {deckList.length === 0 ? (
            <div className="empty-state">
              <div className="w-16 h-16 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center mx-auto mb-2">
                <BookOpen size={32} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text)] text-lg">Chưa có học phần nào</h3>
                <p className="text-[var(--text-muted)] text-sm mt-1">
                  {search ? 'Không tìm thấy kết quả phù hợp' : 'Tạo học phần đầu tiên để bắt đầu học'}
                </p>
              </div>
              {!search && (
                <Link href="/create-set" className="btn-primary">
                  <Plus size={16} /> Tạo học phần
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deckList.map((deck) => (
                <DeckCard
                  key={deck.id}
                  deck={deck}
                  progress={progress}
                  cardIds={cardsByDeck[deck.id] ?? []}
                  cards={cards}
                  onDelete={() => handleDeleteDeck(deck.id, deck.name)}
                  onReset={() => handleResetDeck(deck.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'folders' && (
        <div className="animate-fade-in">
          {folderList.length === 0 ? (
            <div className="empty-state">
              <div className="w-16 h-16 rounded-2xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center mx-auto mb-2">
                <Folder size={32} />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text)] text-lg">Chưa có thư mục nào</h3>
                <p className="text-[var(--text-muted)] text-sm mt-1">
                  {search ? 'Không tìm thấy thư mục phù hợp' : 'Tạo thư mục để nhóm các học phần lại'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {folderList.map((folder) => (
                <div key={folder.id} className="folder-card group">
                  <Link href={`/folder/${folder.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary-light)] text-[var(--primary)] flex items-center justify-center flex-shrink-0">
                      <Folder size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--text)] truncate">{folder.name}</p>
                      {folder.description && (
                        <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{folder.description}</p>
                      )}
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{folder.deckIds.length} học phần</p>
                    </div>
                    <ChevronRight size={16} className="text-[var(--text-muted)] flex-shrink-0" />
                  </Link>
                  <button
                    onClick={() => handleDeleteFolder(folder.id, folder.name)}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'starred' && (
        <div className="animate-fade-in">
          {starredCards.length === 0 ? (
            <div className="empty-state">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-500 flex items-center justify-center mx-auto mb-2">
                <Star size={32} fill="currentColor" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--text)] text-lg">Chưa có từ gắn sao</h3>
                <p className="text-[var(--text-muted)] text-sm mt-1">
                  Gắn sao các từ quan trọng khi học để ôn tập ở đây
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {starredCards
                .filter((c) => !search || c.term.toLowerCase().includes(search.toLowerCase()) || c.definition.toLowerCase().includes(search.toLowerCase()))
                .map((card) => {
                  const deck = decks[card.deckId];
                  return (
                    <div key={card.id} className="term-row">
                      <div className="flex-1 grid grid-cols-2 gap-4 min-w-0">
                        <div>
                          <p className="text-xs font-semibold text-[var(--text-muted)] mb-0.5">Từ vựng</p>
                          <p className="text-[var(--text)] font-medium text-sm">{card.term}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[var(--text-muted)] mb-0.5">Định nghĩa</p>
                          <p className="text-[var(--text-muted)] text-sm">{card.definition}</p>
                        </div>
                      </div>
                      {deck && (
                        <Link
                          href={`/study/${deck.id}`}
                          className="badge badge-blue flex-shrink-0 text-xs"
                        >
                          {deck.name.slice(0, 12)}{deck.name.length > 12 ? '…' : ''}
                        </Link>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-[var(--text-muted)]">Đang tải...</div>}>
      <LibraryContent />
    </Suspense>
  );
}
