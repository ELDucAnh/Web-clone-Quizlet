'use client';
import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { useStore } from '@/lib/store';
import {
  Settings, User, Moon, Target,
  BookOpen, Download, Upload, Check, AlertTriangle,
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
  const {
    settings, updateSettings, decks, sessions,
    folders, cards, cardsByDeck, progress,
    studyHoursGoals, studyHoursLogs, writingSamples, speakingTopics,
  } = useStore();
  const [exportOk, setExportOk] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'ok' | 'error'>('idle');
  const [importMsg, setImportMsg] = useState('');
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setLastBackup(localStorage.getItem('vocab-master-last-backup'));
  }, []);
  if (!mounted) return null;

  // ── Export ──────────────────────────────────────────────────────────
  const handleExport = () => {
    const snapshot = {
      version: 2,
      exportedAt: new Date().toISOString(),
      data: {
        folders, decks, cards, cardsByDeck, progress, settings, sessions,
        studyHoursGoals, studyHoursLogs, writingSamples, speakingTopics,
      },
    };
    const json = JSON.stringify(snapshot, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const dateStr = new Date().toISOString().slice(0, 10);
    a.download = `vocab-master-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    const now = new Date().toLocaleString('vi-VN');
    localStorage.setItem('vocab-master-last-backup', now);
    setLastBackup(now);
    setExportOk(true);
    setTimeout(() => setExportOk(false), 3000);
  };

  // ── Import ──────────────────────────────────────────────────────────
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // reset so same file can be picked again

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const raw = JSON.parse(ev.target?.result as string);
        // Support both formats: wrapped {version, data} or flat state
        const snap = raw.data ?? raw;

        if (!snap.decks || !snap.cards) {
          setImportStatus('error');
          setImportMsg('File không hợp lệ — không tìm thấy dữ liệu học phần.');
          setTimeout(() => setImportStatus('idle'), 5000);
          return;
        }

        // Merge into Zustand store by directly updating localStorage key
        // then reloading so Zustand hydrates fresh
        const existing = JSON.parse(localStorage.getItem('vocab-master-v2') || '{}');
        const merged = {
          state: {
            ...existing.state,
            folders: snap.folders ?? existing.state?.folders ?? {},
            decks: snap.decks,
            cards: snap.cards,
            cardsByDeck: snap.cardsByDeck ?? {},
            progress: snap.progress ?? {},
            settings: snap.settings ?? existing.state?.settings,
            sessions: snap.sessions ?? [],
            studyHoursGoals: snap.studyHoursGoals ?? existing.state?.studyHoursGoals ?? {},
            studyHoursLogs: snap.studyHoursLogs ?? existing.state?.studyHoursLogs ?? [],
            writingSamples: snap.writingSamples ?? existing.state?.writingSamples ?? {},
            speakingTopics: snap.speakingTopics ?? existing.state?.speakingTopics ?? {},
          },
          version: existing.version ?? 0,
        };
        localStorage.setItem('vocab-master-v2', JSON.stringify(merged));
        setImportStatus('ok');
        setImportMsg(`Nhập thành công! Trang sẽ tải lại...`);
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        setImportStatus('error');
        setImportMsg('Không đọc được file. Hãy chắc chắn đây là file backup .json của Vocab Master.');
        setTimeout(() => setImportStatus('idle'), 5000);
      }
    };
    reader.readAsText(file);
  };



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
      {/* ── Sao lưu & Khôi phục ──────────────────────── */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <h2 className="font-bold text-[var(--text)] mb-1 flex items-center gap-2 text-base">
          <Download size={17} className="text-[var(--primary)]" />
          Sao lưu &amp; Khôi phục
        </h2>
        <p className="text-xs text-[var(--text-muted)] mb-5">
          Toàn bộ dữ liệu (học phần, tiến độ, bài mẫu, giờ học) được lưu vào file .json trên máy bạn.
          Import lại bất cứ lúc nào để khôi phục.
        </p>

        <div className="flex flex-col gap-3">
          {/* Export */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Xuất dữ liệu (Export)</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {lastBackup ? `Backup cuối: ${lastBackup}` : 'Chưa có backup nào được tạo'}
              </p>
            </div>
            <button
              onClick={handleExport}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ${
                exportOk
                  ? 'bg-emerald-500 text-white'
                  : 'bg-[var(--primary)] text-white hover:opacity-90'
              }`}
            >
              {exportOk ? <><Check size={15} /> Đã lưu!</> : <><Download size={15} /> Tải backup</>}
            </button>
          </div>

          {/* Import */}
          <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[var(--bg)] border border-[var(--border)]">
            <div>
              <p className="text-sm font-semibold text-[var(--text)]">Nhập dữ liệu (Import)</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Chọn file <code className="bg-[var(--border)] px-1 rounded text-[11px]">vocab-master-backup-*.json</code>
              </p>
            </div>
            <label className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--border)] text-[var(--text)] hover:bg-[var(--text-muted)]/20 cursor-pointer transition-colors flex-shrink-0">
              <Upload size={15} /> Chọn file
              <input
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleImport}
              />
            </label>
          </div>

          {/* Status message */}
          {importStatus !== 'idle' && (
            <div className={`flex items-start gap-2 p-3 rounded-xl text-sm ${
              importStatus === 'ok'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
            }`}>
              {importStatus === 'ok'
                ? <Check size={16} className="mt-0.5 flex-shrink-0" />
                : <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />}
              <span>{importMsg}</span>
            </div>
          )}

          {/* Warning */}
          <p className="text-xs text-[var(--text-muted)] flex items-start gap-1.5">
            <AlertTriangle size={12} className="flex-shrink-0 mt-0.5 text-amber-500" />
            Import sẽ gộp dữ liệu từ file với dữ liệu hiện tại (ưu tiên file import). Nên export backup trước khi import.
          </p>
        </div>
      </section>
    </div>
  );
}
