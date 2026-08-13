// lib/types.ts

export interface Card {
  id: string;           // UUID v4
  term: string;         // Từ / câu hỏi
  definition: string;   // Nghĩa / câu trả lời
  deckId: string;
  starred?: boolean;    // Đánh dấu sao thuật ngữ quan trọng
  createdAt: number;    // timestamp
}

export interface Deck {
  id: string;           // UUID v4
  name: string;         // Tên bộ từ
  description?: string;
  cardCount: number;
  createdAt: number;
  lastStudied?: number;
  completedAt?: number;
  folderId?: string;    // Thuộc thư mục nào (nếu có)
  color: string;        // Màu accent
  tags?: string[];
}

export interface Folder {
  id: string;           // UUID v4
  name: string;
  description?: string;
  deckIds: string[];    // Danh sách ID bộ từ trong thư mục
  createdAt: number;
  updatedAt: number;
}

export interface CardProgress {
  cardId: string;
  deckId: string;
  // SM-2 fields
  easeFactor: number;   // Default 2.5
  interval: number;     // Số ngày (0 = chưa học)
  repetitions: number;  // Số lần đúng liên tiếp
  nextReview: number;   // Timestamp ngày review tiếp theo
  // Learn mode fields
  learnStage: 'unseen' | 'mcq1' | 'type1' | 'mcq2' | 'type2' | 'mastered';
  correctStreak: number;
  lastAnswered?: number;
  // Stats
  totalAnswers: number;
  correctAnswers: number;
}

export interface StudySession {
  id: string;
  deckId: string;
  mode: 'flashcard' | 'learn' | 'match' | 'gravity' | 'review' | 'test';
  startedAt: number;
  completedAt?: number;
  score?: number;
  totalCards: number;
  correctCount: number;
}

export interface AppState {
  folders: Record<string, Folder>;
  decks: Record<string, Deck>;
  cards: Record<string, Card>;           // cardId -> Card
  cardsByDeck: Record<string, string[]>; // deckId -> cardId[]
  progress: Record<string, CardProgress>; // cardId -> progress
  sessions: StudySession[];
  searchQuery: string;
  sidebarCollapsed: boolean;
  settings: {
    userName?: string;
    answerLanguage: 'definition' | 'term';
    shuffleCards: boolean;
    showTimer: boolean;
    dailyGoal: number;
    audioAutoPlay: boolean;
  };
}

export interface Actions {
  // Deck Actions
  importDeck: (name: string, rawCards: Array<{ term: string; definition: string }>, description?: string, folderId?: string) => string;
  createDeck: (name: string, description: string, cards: Array<{ term: string; definition: string }>, folderId?: string) => string;
  updateDeck: (deckId: string, name: string, description?: string) => void;
  deleteDeck: (deckId: string) => void;
  resetDeckProgress: (deckId: string) => void;
  markDeckCompleted: (deckId: string) => void;

  // Folder Actions
  createFolder: (name: string, description?: string) => string;
  updateFolder: (folderId: string, name: string, description?: string) => void;
  deleteFolder: (folderId: string) => void;
  addDeckToFolder: (folderId: string, deckId: string) => void;
  removeDeckFromFolder: (folderId: string, deckId: string) => void;

  // Card Actions
  toggleStarCard: (cardId: string) => void;
  updateProgress: (cardId: string, update: Partial<CardProgress>) => void;

  // Layout / UI Actions
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  updateSettings: (settings: Partial<AppState['settings']>) => void;
  addSession: (session: StudySession) => void;
}
