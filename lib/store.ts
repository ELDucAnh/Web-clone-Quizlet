// lib/store.ts
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { syncToBackend } from './api';
import type { AppState, Actions, Deck, Card, CardProgress, StudySession, Folder, IELTSState, IELTSActions, StudyHoursGoal, StudyHoursLog, WritingSample, SpeakingTopic, IELTSSkill } from './types';

// Cloud-only mode: No localStorage wrappers needed

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

export const useStore = create<AppState & Actions & IELTSState & IELTSActions & { hydrate: (data: any) => void; clearData: () => void }>()((set, get) => ({
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

      // ─── IELTS State ─────────────────────────────────────────────────
      studyHoursGoals: {},
      studyHoursLogs: [],
      writingSamples: {},
      speakingTopics: {},

      // ─── Cloud Actions ───────────────────────────────────────────────
      hydrate: (data: any) => {
        set({
          folders: data.folders || {},
          decks: data.decks || {},
          cards: data.cards || {},
          cardsByDeck: data.cardsByDeck || {},
          progress: data.progress || {},
          sessions: data.sessions || [],
          studyHoursGoals: data.studyHoursGoals || {},
          studyHoursLogs: data.studyHoursLogs || [],
          writingSamples: data.writingSamples || {},
          speakingTopics: data.speakingTopics || {},
          // keep local UI state (searchQuery, sidebarCollapsed)
        });
      },
      clearData: () => {
        set({
          folders: {},
          decks: {},
          cards: {},
          cardsByDeck: {},
          progress: {},
          sessions: [],
          studyHoursGoals: {},
          studyHoursLogs: [],
          writingSamples: {},
          speakingTopics: {},
        });
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

        // Async sync to backend
        syncToBackend('/decks', 'POST', { deck, cards: newCards });

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
        
        syncToBackend(`/decks/${deckId}`, 'PUT', { name, description });
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
        
        const currentProgress = get().progress[cardId];
        if (currentProgress) {
          syncToBackend(`/progress/${cardId}`, 'PUT', currentProgress);
        }
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
            newDecks[deckId] = { ...newDecks[deckId], lastStudied: undefined, completedAt: undefined };
          }
          return { progress: newProgress, decks: newDecks };
        });
      },

      markDeckCompleted: (deckId: string) => {
        set((state) => {
          const deck = state.decks[deckId];
          if (!deck || deck.completedAt) return state; // already completed
          return {
            decks: {
              ...state.decks,
              [deckId]: { ...deck, completedAt: Date.now() },
            },
          };
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
        
        syncToBackend(`/decks/${deckId}`, 'DELETE');
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

      addCardToDeck: (deckId: string, term: string, definition: string) => {
        const id = uuidv4();
        const newCard = { id, term, definition, deckId, starred: false, createdAt: Date.now() };
        set((state) => {
          const deck = state.decks[deckId];
          if (!deck) return {};
          const ids = state.cardsByDeck[deckId] ?? [];
          return {
            cards: { ...state.cards, [id]: newCard },
            cardsByDeck: { ...state.cardsByDeck, [deckId]: [...ids, id] },
            decks: { ...state.decks, [deckId]: { ...deck, cardCount: ids.length + 1 } },
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
        
        syncToBackend('/sessions', 'POST', session);
      },

      // ─── IELTS Study Hours Actions ────────────────────────────────────────────
      createStudyHoursGoal: (skill: IELTSSkill, targetHours: number, deadline?: number) => {
        const id = uuidv4();
        const goal: StudyHoursGoal = { id, skill, targetHours: Math.min(1000, targetHours), deadline, createdAt: Date.now() };
        set((state) => ({ studyHoursGoals: { ...state.studyHoursGoals, [id]: goal } }));
        return id;
      },

      deleteStudyHoursGoal: (goalId: string) => {
        set((state) => {
          const newGoals = { ...state.studyHoursGoals };
          delete newGoals[goalId];
          const newLogs = state.studyHoursLogs.filter(l => l.goalId !== goalId);
          return { studyHoursGoals: newGoals, studyHoursLogs: newLogs };
        });
      },

      addStudyHoursLog: (log: Omit<StudyHoursLog, 'id' | 'createdAt'>) => {
        const newLog: StudyHoursLog = { ...log, id: uuidv4(), createdAt: Date.now() };
        set((state) => ({ studyHoursLogs: [...state.studyHoursLogs, newLog] }));
      },

      deleteStudyHoursLog: (logId: string) => {
        set((state) => ({ studyHoursLogs: state.studyHoursLogs.filter(l => l.id !== logId) }));
      },

      // ─── Writing Sample Actions ────────────────────────────────────────────────
      createWritingSample: (data: Omit<WritingSample, 'id' | 'createdAt' | 'updatedAt'>) => {
        const id = uuidv4();
        const now = Date.now();
        const sample: WritingSample = { ...data, id, createdAt: now, updatedAt: now };
        set((state) => ({ writingSamples: { ...state.writingSamples, [id]: sample } }));
        return id;
      },

      updateWritingSample: (id: string, data: Partial<Omit<WritingSample, 'id' | 'createdAt'>>) => {
        set((state) => {
          if (!state.writingSamples[id]) return state;
          return { writingSamples: { ...state.writingSamples, [id]: { ...state.writingSamples[id], ...data, updatedAt: Date.now() } } };
        });
      },

      deleteWritingSample: (id: string) => {
        set((state) => {
          const newSamples = { ...state.writingSamples };
          delete newSamples[id];
          return { writingSamples: newSamples };
        });
      },

      // ─── Speaking Topic Actions ────────────────────────────────────────────────
      createSpeakingTopic: (data: Omit<SpeakingTopic, 'id' | 'createdAt' | 'updatedAt'>) => {
        const id = uuidv4();
        const now = Date.now();
        const topic: SpeakingTopic = { ...data, id, createdAt: now, updatedAt: now };
        set((state) => ({ speakingTopics: { ...state.speakingTopics, [id]: topic } }));
        return id;
      },

      updateSpeakingTopic: (id: string, data: Partial<Omit<SpeakingTopic, 'id' | 'createdAt'>>) => {
        set((state) => {
          if (!state.speakingTopics[id]) return state;
          return { speakingTopics: { ...state.speakingTopics, [id]: { ...state.speakingTopics[id], ...data, updatedAt: Date.now() } } };
        });
      },

      deleteSpeakingTopic: (id: string) => {
        set((state) => {
          const newTopics = { ...state.speakingTopics };
          delete newTopics[id];
          return { speakingTopics: newTopics };
        });
      },
}));

export { getDefaultProgress };
