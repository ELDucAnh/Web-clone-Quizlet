'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, BookOpen, Clock } from 'lucide-react';
import { useStore } from '@/lib/store';

function NotificationsContent() {
  const { decks, cardsByDeck, progress } = useStore();
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setMounted(true);
    setNow(Date.now());
  }, []);

  if (!mounted) return null;

  const deckList = Object.values(decks).filter(deck => deck.completedAt);
  
  const intervals = [
    { label: '1 ngày', ms: 1 * 24 * 60 * 60 * 1000 },
    { label: '3 ngày', ms: 3 * 24 * 60 * 60 * 1000 },
    { label: '7 ngày', ms: 7 * 24 * 60 * 60 * 1000 },
    { label: '21 ngày', ms: 21 * 24 * 60 * 60 * 1000 },
    { label: '30 ngày', ms: 30 * 24 * 60 * 60 * 1000 },
  ];

  const dueNotifications: { deckId: string, deckName: string, intervalLabel: string, overdue: boolean, dateDue: number }[] = [];

  deckList.forEach(deck => {
    if (!deck.completedAt) return;
    const completedAt = deck.completedAt;
    
    // Tìm mốc thời gian tiếp theo gần nhất mà người dùng CẦN ôn tập (đã qua hoặc sắp tới)
    // Nhưng vì tab thông báo thường chỉ hiện những cái "đã đến hạn" hoặc "quá hạn", 
    // ta sẽ thu thập tất cả những mốc đã qua mà người dùng chưa học lại.
    // Thực tế, ta nên kiểm tra `lastStudied`. Nếu `lastStudied > dateDue` thì có nghĩa là họ đã ôn tập mốc đó rồi.
    // Để đơn giản, ta chỉ báo những mốc đã đến hạn tính từ `completedAt`.
    
    let highestIntervalDue = -1;
    let highestIntervalLabel = '';
    let highestDateDue = 0;

    for (let i = 0; i < intervals.length; i++) {
      const dateDue = completedAt + intervals[i].ms;
      if (now >= dateDue) {
        // Mốc này đã đến hạn
        // Kiểm tra xem người dùng đã học sau mốc này chưa
        const lastStudied = deck.lastStudied || 0;
        if (lastStudied < dateDue) {
          // Chưa học lại sau khi mốc này đến hạn!
          highestIntervalDue = i;
          highestIntervalLabel = intervals[i].label;
          highestDateDue = dateDue;
        }
      }
    }

    if (highestIntervalDue !== -1) {
      dueNotifications.push({
        deckId: deck.id,
        deckName: deck.name,
        intervalLabel: highestIntervalLabel,
        overdue: true,
        dateDue: highestDateDue
      });
    }
  });

  // Sort by dateDue (oldest first, because they are most overdue)
  dueNotifications.sort((a, b) => a.dateDue - b.dateDue);

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-4xl mx-auto w-full">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
          <Bell size={24} className="text-[var(--primary)]" /> Thông báo
        </h1>
        <p className="text-[var(--text-muted)] text-sm">
          Nhắc nhở ôn tập ngắt quãng (Spaced Repetition) để ghi nhớ lâu hơn.
        </p>
      </div>

      <div className="flex flex-col gap-3 mt-4">
        {dueNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="text-5xl">🎉</div>
            <div>
              <h3 className="font-bold text-[var(--text)] text-lg">Không có thông báo nào</h3>
              <p className="text-[var(--text-muted)] text-sm mt-1">
                Bạn đã hoàn thành xuất sắc các bài ôn tập!
              </p>
            </div>
          </div>
        ) : (
          dueNotifications.map((notif, idx) => {
            const deck = decks[notif.deckId];
            const cardIds = cardsByDeck[deck.id] ?? [];
            const mastered = cardIds.filter(id => progress[id]?.learnStage === 'mastered').length;
            
            return (
              <div key={notif.deckId + idx} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-[var(--primary)] transition-colors">
                <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[var(--text)] text-base">Đã đến hạn ôn tập ({notif.intervalLabel})</h3>
                  <p className="text-[var(--text-muted)] text-sm mt-1 truncate">
                    Học phần <span className="font-semibold text-[var(--text)]">{notif.deckName}</span> cần được ôn lại để củng cố trí nhớ.
                  </p>
                </div>
                <Link
                  href={`/study/${notif.deckId}`}
                  className="btn-primary py-2 px-6 flex-shrink-0 sm:w-auto w-full justify-center"
                >
                  <BookOpen size={16} /> Ôn tập ngay
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  return <NotificationsContent />;
}
