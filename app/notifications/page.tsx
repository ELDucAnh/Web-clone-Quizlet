'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/lib/store';

function NotificationsContent() {
  const { decks, cardsByDeck, progress, studyHoursGoals, studyHoursLogs } = useStore();
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

  const dueNotifications: { deckId: string; deckName: string; intervalLabel: string; overdue: boolean; dateDue: number; daysOverdue: number }[] = [];

  deckList.forEach(deck => {
    if (!deck.completedAt || deck.cardCount === 0) return;
    
    const cardIds = cardsByDeck[deck.id] ?? [];
    const masteredCount = cardIds.filter(id => progress[id]?.learnStage === 'mastered').length;
    if (masteredCount < deck.cardCount) return;

    const completedAt = deck.completedAt;
    const lastStudied = (deck.lastStudied && deck.lastStudied > completedAt) ? deck.lastStudied : completedAt;

    for (let i = 0; i < intervals.length; i++) {
      const dateDue = completedAt + intervals[i].ms;
      if (now >= dateDue && lastStudied < dateDue) {
        const daysOverdue = Math.floor((now - dateDue) / (24 * 60 * 60 * 1000));
        dueNotifications.push({
          deckId: deck.id,
          deckName: deck.name,
          intervalLabel: intervals[i].label,
          overdue: daysOverdue > 0,
          dateDue,
          daysOverdue,
        });
        break;
      }
    }
  });

  dueNotifications.sort((a, b) => a.dateDue - b.dateDue);

  const skillStats: Record<string, number> = {};
  studyHoursLogs.forEach(l => { skillStats[l.skill] = (skillStats[l.skill] || 0) + l.minutes; });
  const activeGoals = Object.values(studyHoursGoals).filter(g => !g.deadline || g.deadline >= now);
  const unmetGoals = activeGoals.filter(g => (skillStats[g.skill] || 0) < g.targetHours * 60);

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-3xl mx-auto w-full">
      {/* ── Header ─────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">Thông báo</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Nhắc nhở ôn tập ngắt quãng (Spaced Repetition) — học phần nào đã hoàn thành 100% sẽ xuất hiện ở đây.
        </p>
      </div>

      {/* ── Notification List ─────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {unmetGoals.length > 0 && (
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 animate-slide-up">
            <div className="w-11 h-11 bg-orange-500/20 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-orange-700 text-[0.9375rem] mb-1">Mục tiêu giờ học chưa hoàn thành</h3>
              <p className="text-orange-600/80 text-sm">
                Bạn còn {unmetGoals.length} mục tiêu kỹ năng chưa đạt đủ số phút. Cố gắng lên nhé!
              </p>
            </div>
            <Link href="/study-hours" className="btn-primary bg-orange-500 hover:bg-orange-600 text-white py-2 px-5 flex-shrink-0 sm:w-auto w-full justify-center">
              Xem mục tiêu
            </Link>
          </div>
        )}

        {dueNotifications.length === 0 ? (
          <div className="empty-state">
            <div className="w-16 h-16 rounded-2xl bg-[var(--success-light)] text-[var(--success)] flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h3 className="font-bold text-[var(--text)] text-lg">Không có thông báo nào</h3>
              <p className="text-[var(--text-muted)] text-sm mt-1">
                {deckList.length === 0
                  ? 'Hoàn thành một học phần 100% để nhận nhắc nhở ôn tập.'
                  : 'Tất cả bài ôn tập đã được hoàn thành. Bạn đang học rất tốt!'}
              </p>
            </div>
            {deckList.length === 0 && (
              <Link href="/library" className="btn-primary">
                <BookOpen size={16} /> Đến thư viện
              </Link>
            )}
          </div>
        ) : (
          dueNotifications.map((notif, idx) => {
            const deck = decks[notif.deckId];
            const cardIds = cardsByDeck[deck.id] ?? [];
            const mastered = cardIds.filter(id => progress[id]?.learnStage === 'mastered').length;
            const pct = deck.cardCount > 0 ? Math.round((mastered / deck.cardCount) * 100) : 0;

            return (
              <div
                key={notif.deckId + idx}
                className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-[var(--primary)] hover:shadow-sm transition-all"
              >
                <div className="w-11 h-11 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-[var(--text)] text-[0.9375rem]">{notif.deckName}</h3>
                    <span className="badge badge-yellow">Ôn tập {notif.intervalLabel}</span>
                    {notif.daysOverdue > 0 && (
                      <span className="badge" style={{ background: 'var(--error-light)', color: 'var(--error)' }}>
                        Trễ {notif.daysOverdue} ngày
                      </span>
                    )}
                  </div>
                  <p className="text-[var(--text-muted)] text-sm">
                    Đến hạn: <span className="font-semibold text-[var(--text)]">{formatDate(notif.dateDue)}</span>
                    {' · '}Tiến độ: <span className="font-semibold text-[var(--text)]">{mastered}/{deck.cardCount} ({pct}%)</span>
                  </p>
                </div>
                <Link
                  href={`/learn/${notif.deckId}?mode=learn&resetSession=true`}
                  className="btn-primary py-2 px-5 flex-shrink-0 sm:w-auto w-full justify-center"
                >
                  <BookOpen size={15} /> Ôn tập ngay
                </Link>
              </div>
            );
          })
        )}
      </div>

      {/* ── Interval Guide ────────────────────────────────── */}
      {deckList.length > 0 && (
        <section className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5">
          <h2 className="text-sm font-bold text-[var(--text)] mb-3">Lịch ôn tập gợi ý</h2>
          <div className="flex flex-wrap gap-2">
            {intervals.map(iv => (
              <span key={iv.label} className="badge badge-blue">{iv.label} sau hoàn thành</span>
            ))}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-3 leading-relaxed">
            Spaced repetition: ôn lại đúng lúc giúp ký ức lưu lâu hơn 5–10 lần so với học liên tục.
          </p>
        </section>
      )}
    </div>
  );
}

export default function NotificationsPage() {
  return <NotificationsContent />;
}
