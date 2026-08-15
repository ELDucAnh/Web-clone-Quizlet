'use client';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useStore } from '@/lib/store';
import {
  Settings, User, Moon, Sun, Monitor, Target,
  BookOpen, Download, Upload, Check, AlertTriangle,
  BarChart2, Layers, Zap, Cloud, CloudOff, LogOut, LogIn
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

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
      <button
        role="switch"
        aria-checked={checked}
        onClick={onChange}
        className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        style={{ background: checked ? 'var(--primary)' : 'var(--border-strong)' }}
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
  const {
    settings, updateSettings, decks, sessions,
    folders, cards, cardsByDeck, progress,
    studyHoursGoals, studyHoursLogs, writingSamples, speakingTopics,
  } = useStore();
  const { data: session, status } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;



  const deckCount = Object.keys(decks).length;
  const totalStudied = sessions.reduce((s, sess) => s + sess.totalCards, 0);
  const totalCorrect = sessions.reduce((s, sess) => s + sess.correctCount, 0);
  const accuracy = totalStudied > 0 ? Math.round((totalCorrect / totalStudied) * 100) : 0;

  const themeOptions = [
    { value: 'light', label: 'Sáng', icon: <Sun size={15} /> },
    { value: 'dark', label: 'Tối', icon: <Moon size={15} /> },
    { value: 'system', label: 'Hệ thống', icon: <Monitor size={15} /> },
  ] as const;

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-xl mx-auto">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">Cài đặt</h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          Tùy chỉnh trải nghiệm học tập của bạn
        </p>
      </div>

      {/* ── Thống kê nhanh ──────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Học phần', value: deckCount, icon: <Layers size={16} /> },
          { label: 'Đã học', value: totalStudied.toLocaleString(), icon: <BookOpen size={16} /> },
          { label: 'Độ chính xác', value: `${accuracy}%`, icon: <Zap size={16} /> },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 text-center flex flex-col items-center gap-1.5"
          >
            <div className="text-[var(--primary)]">{stat.icon}</div>
            <div className="text-xl font-bold text-[var(--text)] tracking-tight">{stat.value}</div>
            <div className="text-xs text-[var(--text-muted)]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Hồ sơ ──────────────────────────────────────── */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <h2 className="font-bold text-[var(--text)] mb-4 flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <User size={17} className="text-[var(--primary)]" />
            Hồ sơ
          </div>
          {session && (
            <button
              onClick={() => signOut()}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[var(--danger-light)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white transition-colors flex items-center gap-1"
            >
              <LogOut size={14} /> Đăng xuất
            </button>
          )}
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
            Tên sẽ hiển thị trên trang chủ
          </p>
        </div>
      </section>

      {/* ── Giao diện ───────────────────────────────────── */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <h2 className="font-bold text-[var(--text)] mb-4 flex items-center gap-2 text-base">
          <Moon size={17} className="text-[var(--primary)]" />
          Giao diện
        </h2>
        <div className="flex gap-2">
          {themeOptions.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                theme === t.value
                  ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
              }`}
            >
              {t.icon} {t.label}
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
              description="Đếm thời gian trong mỗi phiên kiểm tra"
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
              className="w-8 h-8 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)] font-bold text-lg transition-colors"
            >
              −
            </button>
            <span className="w-12 text-center font-bold text-[var(--text)]">
              {settings.dailyGoal ?? 20}
            </span>
            <button
              onClick={() => updateSettings({ dailyGoal: Math.min(200, (settings.dailyGoal ?? 20) + 5) })}
              className="w-8 h-8 rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text)] font-bold text-lg transition-colors"
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
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                {lang === 'term' ? 'Từ vựng' : 'Nghĩa'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dữ liệu ─────────────────────────────────────── */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <h2 className="font-bold text-[var(--text)] mb-4 flex items-center gap-2 text-base">
          <BarChart2 size={17} className="text-[var(--primary)]" />
          Dữ liệu & Lịch sử
        </h2>
        <div className="flex flex-col gap-0 text-sm text-[var(--text-muted)] divide-y divide-[var(--border)]">
          <div className="flex items-center justify-between py-3">
            <span>Tổng phiên học</span>
            <span className="font-semibold text-[var(--text)]">{sessions.length} phiên</span>
          </div>
          <div className="flex items-center justify-between py-3">
            <span>Tổng thẻ đã học</span>
            <span className="font-semibold text-[var(--text)]">{totalStudied.toLocaleString()} thẻ</span>
          </div>
          <div className="flex items-center justify-between py-3">
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
