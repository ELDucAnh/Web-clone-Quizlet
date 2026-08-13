// lib/store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { AppState, Actions, Deck, Card, CardProgress, StudySession, Folder } from './types';

// CRITICAL: Wrap localStorage access để tránh SSR crash (Next.js)
const safeStorage = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') return null;
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(name, value);
    } catch (e) {
      console.warn('localStorage quota exceeded:', e);
    }
  },
  removeItem: (name: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(name);
    } catch {}
  },
};

const DECK_COLOR = '#4255FF';

function getDefaultProgress(cardId: string, deckId: string): CardProgress {
  return {
    cardId,
    deckId,
    easeFactor: 2.5,
    interval: 0,
    repetitions: 0,
    nextReview: 0,
    learnStage: 'unseen',
    correctStreak: 0,
    totalAnswers: 0,
    correctAnswers: 0,
  };
}

export const useStore = create<AppState & Actions>()(
  persist(
    (set, get) => ({
      folders: {},
      decks: {},
      cards: {},
      cardsByDeck: {},
      progress: {},
      sessions: [],
      searchQuery: '',
      sidebarCollapsed: false,
      settings: {
        answerLanguage: 'definition',
        shuffleCards: true,
        showTimer: true,
        dailyGoal: 20,
        audioAutoPlay: false,
      },

      // ─── Deck Actions ─────────────────────────────────────────────────

      importDeck: (
        name: string,
        rawCards: Array<{ term: string; definition: string }>,
        description?: string,
        folderId?: string
      ) => {
        const deckId = uuidv4();
        const color = DECK_COLOR;

        const newCards: Card[] = rawCards.map((rc) => ({
          id: uuidv4(),
          term: rc.term,
          definition: rc.definition,
          deckId,
          starred: false,
          createdAt: Date.now(),
        }));

        const cardMap: Record<string, Card> = {};
        const cardIds: string[] = [];
        newCards.forEach((c) => {
          cardMap[c.id] = c;
          cardIds.push(c.id);
        });

        // Sanitize & deduplicate deck name
        const existingNames = Object.values(get().decks).map((d) => d.name);
        let deckName = name.replace(/\.csv$/i, '').trim() || 'Bộ từ không tên';
        if (existingNames.includes(deckName)) {
          let counter = 2;
          while (existingNames.includes(`${deckName} (${counter})`)) counter++;
          deckName = `${deckName} (${counter})`;
        }

        const deck: Deck = {
          id: deckId,
          name: deckName,
          description: description || '',
          cardCount: newCards.length,
          createdAt: Date.now(),
          color,
          folderId: folderId,
        };

        set((state) => ({
          decks: { ...state.decks, [deckId]: deck },
          cards: { ...state.cards, ...cardMap },
          cardsByDeck: { ...state.cardsByDeck, [deckId]: cardIds },
        }));

        // If folderId specified, add deck to folder
        if (folderId && get().folders[folderId]) {
          set((state) => ({
            folders: {
              ...state.folders,
              [folderId]: {
                ...state.folders[folderId],
                deckIds: [...(state.folders[folderId].deckIds || []), deckId],
                updatedAt: Date.now(),
              },
            },
          }));
        }

        return deckId;
      },

      createDeck: (
        name: string,
        description: string,
        cards: Array<{ term: string; definition: string }>,
        folderId?: string
      ) => {
        return get().importDeck(name, cards, description, folderId);
      },

      updateDeck: (deckId: string, name: string, description?: string) => {
        set((state) => ({
          decks: {
            ...state.decks,
            [deckId]: {
              ...state.decks[deckId],
              name,
              description: description ?? state.decks[deckId]?.description,
            },
          },
        }));
      },

      updateProgress: (cardId: string, update: Partial<CardProgress>) => {
        set((state) => ({
          progress: {
            ...state.progress,
            [cardId]: {
              ...getDefaultProgress(cardId, state.cards[cardId]?.deckId ?? ''),
              ...state.progress[cardId],
              ...update,
            },
          },
        }));
      },

      resetDeckProgress: (deckId: string) => {
        const cardIds = get().cardsByDeck[deckId] ?? [];
        set((state) => {
          const newProgress = { ...state.progress };
          cardIds.forEach((id) => {
            delete newProgress[id];
          });
          const newDecks = { ...state.decks };
          if (newDecks[deckId]) {
            newDecks[deckId] = { ...newDecks[deckId], lastStudied: undefined };
          }
          return { progress: newProgress, decks: newDecks };
        });
      },

      deleteDeck: (deckId: string) => {
        const cardIds = get().cardsByDeck[deckId] ?? [];
        const deck = get().decks[deckId];

        set((state) => {
          const newCards = { ...state.cards };
          const newProgress = { ...state.progress };
          const newDecks = { ...state.decks };
          const newByDeck = { ...state.cardsByDeck };
          const newFolders = { ...state.folders };

          cardIds.forEach((id) => {
            delete newCards[id];
            delete newProgress[id];
          });
          delete newDecks[deckId];
          delete newByDeck[deckId];

          // Remove from folder if applicable
          if (deck?.folderId && newFolders[deck.folderId]) {
            newFolders[deck.folderId] = {
              ...newFolders[deck.folderId],
              deckIds: newFolders[deck.folderId].deckIds.filter((id) => id !== deckId),
              updatedAt: Date.now(),
            };
          }

          return {
            decks: newDecks,
            cards: newCards,
            progress: newProgress,
            cardsByDeck: newByDeck,
            folders: newFolders,
          };
        });
      },

      // ─── Folder Actions ───────────────────────────────────────────────

      createFolder: (name: string, description?: string) => {
        const folderId = uuidv4();
        const folder: Folder = {
          id: folderId,
          name: name.trim() || 'Thư mục không tên',
          description: description || '',
          deckIds: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          folders: { ...state.folders, [folderId]: folder },
        }));
        return folderId;
      },

      updateFolder: (folderId: string, name: string, description?: string) => {
        set((state) => ({
          folders: {
            ...state.folders,
            [folderId]: {
              ...state.folders[folderId],
              name: name.trim() || state.folders[folderId]?.name,
              description: description ?? state.folders[folderId]?.description,
              updatedAt: Date.now(),
            },
          },
        }));
      },

      deleteFolder: (folderId: string) => {
        set((state) => {
          const newFolders = { ...state.folders };
          const newDecks = { ...state.decks };
          // Unlink decks from folder (don't delete them)
          const folder = newFolders[folderId];
          if (folder) {
            folder.deckIds.forEach((deckId) => {
              if (newDecks[deckId]) {
                newDecks[deckId] = { ...newDecks[deckId], folderId: undefined };
              }
            });
          }
          delete newFolders[folderId];
          return { folders: newFolders, decks: newDecks };
        });
      },

      addDeckToFolder: (folderId: string, deckId: string) => {
        set((state) => {
          const folder = state.folders[folderId];
          if (!folder) return {};
          if (folder.deckIds.includes(deckId)) return {};

          const deck = state.decks[deckId];
          // Remove from old folder
          const newFolders = { ...state.folders };
          if (deck?.folderId && newFolders[deck.folderId]) {
            newFolders[deck.folderId] = {
              ...newFolders[deck.folderId],
              deckIds: newFolders[deck.folderId].deckIds.filter((id) => id !== deckId),
              updatedAt: Date.now(),
            };
          }
          newFolders[folderId] = {
            ...folder,
            deckIds: [...folder.deckIds, deckId],
            updatedAt: Date.now(),
          };

          return {
            folders: newFolders,
            decks: {
              ...state.decks,
              [deckId]: { ...state.decks[deckId], folderId },
            },
          };
        });
      },

      removeDeckFromFolder: (folderId: string, deckId: string) => {
        set((state) => {
          const folder = state.folders[folderId];
          if (!folder) return {};
          return {
            folders: {
              ...state.folders,
              [folderId]: {
                ...folder,
                deckIds: folder.deckIds.filter((id) => id !== deckId),
                updatedAt: Date.now(),
              },
            },
            decks: {
              ...state.decks,
              [deckId]: { ...state.decks[deckId], folderId: undefined },
            },
          };
        });
      },

      // ─── Card Actions ─────────────────────────────────────────────────

      toggleStarCard: (cardId: string) => {
        set((state) => {
          const card = state.cards[cardId];
          if (!card) return {};
          return {
            cards: {
              ...state.cards,
              [cardId]: { ...card, starred: !card.starred },
            },
          };
        });
      },

      // ─── Layout Actions ───────────────────────────────────────────────

      setSearchQuery: (query: string) => {
        set({ searchQuery: query });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
      },

      updateSettings: (settings: Partial<AppState['settings']>) => {
        set((state) => ({ settings: { ...state.settings, ...settings } }));
      },

      addSession: (session: StudySession) => {
        set((state) => {
          const newDecks = { ...state.decks };
          if (newDecks[session.deckId]) {
            newDecks[session.deckId] = {
              ...newDecks[session.deckId],
              lastStudied: session.startedAt,
            };
          }
          return {
            sessions: [...state.sessions.slice(-99), session],
            decks: newDecks,
          };
        });
      },
    }),
    {
      name: 'vocab-master-v2',
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({
        folders: state.folders,
        decks: state.decks,
        cards: state.cards,
        cardsByDeck: state.cardsByDeck,
        progress: state.progress,
        settings: state.settings,
        sessions: state.sessions,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

export { getDefaultProgress };
