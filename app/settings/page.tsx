'use client';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useStore } from '@/lib/store';
import {
  Settings, User, Moon, Sun, Target, Shuffle,
  Clock, Volume2, BookOpen, Zap, ChevronRight,
} from 'lucide-react';

// ─── Reusable Toggle Component ──────────────────────────────────────────────
function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <div className="min-w-0">
        <p className="text-sm font-medium text-[var(--text)]">{label}</p>
        {description && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>
        )}
      </div>
      {/* Native-style toggle: use a label+checkbox pattern for reliability */}
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        style={{ background: checked ? 'var(--primary)' : 'var(--border)' }}
      >
        <span
          className="block w-[18px] h-[18px] bg-white rounded-full shadow-md transition-transform duration-200"
          style={{
            position: 'absolute',
            top: '3px',
            left: '3px',
            transform: checked ? 'translateX(20px)' : 'translateX(0)',
          }}
        />
      </button>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, decks, sessions } = useStore();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const deckCount = Object.keys(decks).length;
  const totalStudied = sessions.reduce((s, sess) => s + sess.totalCards, 0);
  const totalCorrect = sessions.reduce((s, sess) => s + sess.correctCount, 0);
  const accuracy = totalStudied > 0 ? Math.round((totalCorrect / totalStudied) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-xl mx-auto">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
          <Settings size={22} className="text-[var(--primary)]" />
          Cài đặt
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Tùy chỉnh trải nghiệm học tập của bạn
        </p>
      </div>

      {/* ── Thống kê nhanh ──────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Học phần', value: deckCount, icon: '📚' },
          { label: 'Đã học', value: totalStudied, icon: '🎯' },
          { label: 'Độ chính xác', value: `${accuracy}%`, icon: '✅' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center"
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-bold text-[var(--text)]">{stat.value}</div>
            <div className="text-xs text-[var(--text-muted)] mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Hồ sơ ──────────────────────────────────────── */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <h2 className="font-bold text-[var(--text)] mb-4 flex items-center gap-2 text-base">
          <User size={17} className="text-[var(--primary)]" />
          Hồ sơ
        </h2>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--text)]">
            Tên hiển thị
          </label>
          <input
            type="text"
            value={settings.userName || ''}
            onChange={(e) => updateSettings({ userName: e.target.value })}
            placeholder="Nhập tên của bạn..."
            maxLength={30}
            className="q-input"
          />
          <p className="text-xs text-[var(--text-muted)]">
            Tên sẽ hiển thị trên trang chủ và bảng xếp hạng
          </p>
        </div>
      </section>

      {/* ── Giao diện ───────────────────────────────────── */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <h2 className="font-bold text-[var(--text)] mb-4 flex items-center gap-2 text-base">
          <Moon size={17} className="text-[var(--primary)]" />
          Giao diện
        </h2>

        {/* Theme selector - 3 buttons */}
        <div className="flex gap-2">
          {(['light', 'dark', 'system'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTheme(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                theme === t
                  ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
              }`}
            >
              {t === 'light' ? '☀️ Sáng' : t === 'dark' ? '🌙 Tối' : '🖥️ Hệ thống'}
            </button>
          ))}
        </div>
      </section>

      {/* ── Học tập ─────────────────────────────────────── */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-4">
        <h2 className="font-bold text-[var(--text)] flex items-center gap-2 text-base">
          <Target size={17} className="text-[var(--primary)]" />
          Học tập
        </h2>

        <div className="flex flex-col gap-3 divide-y divide-[var(--border)]">
          <ToggleRow
            label="Xáo trộn thẻ"
            description="Ngẫu nhiên thứ tự thẻ khi bắt đầu học"
            checked={settings.shuffleCards ?? true}
            onChange={() => updateSettings({ shuffleCards: !settings.shuffleCards })}
          />
          <div className="pt-3">
            <ToggleRow
              label="Hiển thị bộ đếm thời gian"
              description="Đếm thời gian trong mỗi phiên học"
              checked={settings.showTimer ?? true}
              onChange={() => updateSettings({ showTimer: !settings.showTimer })}
            />
          </div>
          <div className="pt-3">
            <ToggleRow
              label="Tự động phát âm"
              description="Đọc to từ vựng khi hiển thị thẻ ghi nhớ"
              checked={settings.audioAutoPlay ?? false}
              onChange={() => updateSettings({ audioAutoPlay: !settings.audioAutoPlay })}
            />
          </div>
        </div>

        {/* Daily goal */}
        <div className="pt-2 border-t border-[var(--border)] flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--text)]">Mục tiêu hàng ngày</p>
            <p className="text-xs text-[var(--text-muted)]">Số thẻ cần học mỗi ngày</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateSettings({ dailyGoal: Math.max(1, (settings.dailyGoal ?? 20) - 5) })}
              className="w-8 h-8 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)] font-bold text-lg transition-colors"
            >
              −
            </button>
            <span className="w-12 text-center font-bold text-[var(--text)]">
              {settings.dailyGoal ?? 20}
            </span>
            <button
              onClick={() => updateSettings({ dailyGoal: Math.min(200, (settings.dailyGoal ?? 20) + 5) })}
              className="w-8 h-8 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)] font-bold text-lg transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* Answer direction */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--text)]">Chiều câu hỏi</p>
            <p className="text-xs text-[var(--text-muted)]">Hiển thị từ hoặc nghĩa làm câu hỏi</p>
          </div>
          <div className="flex rounded-xl overflow-hidden border border-[var(--border)]">
            {(['term', 'definition'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => updateSettings({ answerLanguage: lang })}
                className={`px-4 py-2 text-xs font-semibold transition-colors ${
                  settings.answerLanguage === lang
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg)]'
                }`}
              >
                {lang === 'term' ? '🔤 Từ vựng' : '💬 Nghĩa'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dữ liệu ─────────────────────────────────────── */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <h2 className="font-bold text-[var(--text)] mb-4 flex items-center gap-2 text-base">
          <BookOpen size={17} className="text-[var(--primary)]" />
          Dữ liệu & Lịch sử
        </h2>
        <div className="flex flex-col gap-3 text-sm text-[var(--text-muted)]">
          <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
            <span>Tổng phiên học</span>
            <span className="font-semibold text-[var(--text)]">{sessions.length} phiên</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[var(--border)]">
            <span>Tổng thẻ đã học</span>
            <span className="font-semibold text-[var(--text)]">{totalStudied.toLocaleString()} thẻ</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span>Độ chính xác trung bình</span>
            <span
              className="font-semibold"
              style={{
                color: accuracy >= 80 ? 'var(--success)' : accuracy >= 60 ? 'var(--warning)' : 'var(--danger)',
              }}
            >
              {accuracy}%
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
