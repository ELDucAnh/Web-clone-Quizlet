'use client';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useStore } from '@/lib/store';
import { Settings, User, Moon, Sun, Target, Shuffle, Clock, Volume2 } from 'lucide-react';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useStore();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)] flex items-center gap-2">
          <Settings size={22} className="text-[var(--primary)]" />
          Cài đặt
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">Tùy chỉnh trải nghiệm học tập của bạn</p>
      </div>

      {/* Profile */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <h2 className="font-bold text-[var(--text)] mb-4 flex items-center gap-2">
          <User size={18} className="text-[var(--primary)]" /> Hồ sơ
        </h2>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[var(--text)]">Tên của bạn</label>
          <input
            type="text"
            value={settings.userName || ''}
            onChange={(e) => updateSettings({ userName: e.target.value })}
            placeholder="Nhập tên..."
            maxLength={30}
            className="q-input"
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <h2 className="font-bold text-[var(--text)] mb-4 flex items-center gap-2">
          <Moon size={18} className="text-[var(--primary)]" /> Giao diện
        </h2>
        <div className="flex items-center justify-between">
          <span className="text-sm text-[var(--text)]">Chế độ tối</span>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`relative w-11 h-6 rounded-full transition-colors ${theme === 'dark' ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${theme === 'dark' ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Learning Settings */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col gap-5">
        <h2 className="font-bold text-[var(--text)] flex items-center gap-2">
          <Target size={18} className="text-[var(--primary)]" /> Học tập
        </h2>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-[var(--text)]">Xáo trộn thẻ</span>
            <p className="text-xs text-[var(--text-muted)]">Ngẫu nhiên thứ tự thẻ khi học</p>
          </div>
          <button
            onClick={() => updateSettings({ shuffleCards: !settings.shuffleCards })}
            className={`relative w-11 h-6 rounded-full transition-colors ${settings.shuffleCards ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.shuffleCards ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-[var(--text)]">Hiển thị timer</span>
            <p className="text-xs text-[var(--text-muted)]">Đếm thời gian trong phiên học</p>
          </div>
          <button
            onClick={() => updateSettings({ showTimer: !settings.showTimer })}
            className={`relative w-11 h-6 rounded-full transition-colors ${settings.showTimer ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.showTimer ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-[var(--text)]">Tự động phát âm</span>
            <p className="text-xs text-[var(--text-muted)]">Đọc to từ vựng khi hiển thị thẻ</p>
          </div>
          <button
            onClick={() => updateSettings({ audioAutoPlay: !settings.audioAutoPlay })}
            className={`relative w-11 h-6 rounded-full transition-colors ${settings.audioAutoPlay ? 'bg-[var(--primary)]' : 'bg-[var(--border)]'}`}
          >
            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.audioAutoPlay ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-sm font-medium text-[var(--text)]">Mục tiêu hàng ngày</span>
            <p className="text-xs text-[var(--text-muted)]">Số thẻ cần học mỗi ngày</p>
          </div>
          <input
            type="number"
            value={settings.dailyGoal}
            onChange={(e) => updateSettings({ dailyGoal: Math.max(1, parseInt(e.target.value) || 1) })}
            min={1}
            max={200}
            className="q-input w-20 text-center"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-sm font-medium text-[var(--text)]">Hỏi theo</span>
            <p className="text-xs text-[var(--text-muted)]">Chiều câu hỏi khi học</p>
          </div>
          <div className="flex rounded-lg overflow-hidden border border-[var(--border)]">
            {(['definition', 'term'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => updateSettings({ answerLanguage: lang })}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  settings.answerLanguage === lang
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--text-muted)] hover:bg-[var(--bg)]'
                }`}
              >
                {lang === 'definition' ? 'Nghĩa' : 'Từ'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
