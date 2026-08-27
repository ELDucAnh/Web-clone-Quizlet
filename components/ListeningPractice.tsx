'use client';
import { useState, useEffect, useRef } from 'react';
import {
  Headphones, Loader2, Play, Pause, RotateCcw, ChevronDown, ChevronUp,
  Check, X, FileText, Sparkles, AlertCircle, TrendingUp, Star,
  Volume2, Lightbulb, Award, MessageSquare, ArrowRight
} from 'lucide-react';
import type { Card } from '@/lib/types';

// ── Types ────────────────────────────────────────────────────────────────────
interface DialogueTurn { speaker: string; text: string; }
interface DialogueData {
  topic: string;
  dialogue: DialogueTurn[];
  keyPoints: string[];
}
interface VocabUsage { word: string; status: 'used_well' | 'missed_opportunity'; tip: string; }
interface SummaryAnalysis {
  overallScore: number;
  comprehensionLevel: string;
  caughtPoints: string[];
  missedPoints: string[];
  languageFeedback: { strengths: string[]; improvements: string[]; };
  vocabularyUsage: VocabUsage[];
  encouragement: string;
  suggestedSummary: string;
}

// ── Phase type ───────────────────────────────────────────────────────────────
type Phase = 'loading' | 'listening' | 'writing' | 'analyzing' | 'result';

// ── Score helpers ─────────────────────────────────────────────────────────────
function getScoreGradient(score: number) {
  if (score >= 80) return 'from-emerald-500 to-green-400';
  if (score >= 60) return 'from-amber-500 to-yellow-400';
  return 'from-rose-500 to-red-400';
}
function getScoreEmoji(score: number) {
  if (score >= 80) return '🏆';
  if (score >= 65) return '👍';
  if (score >= 50) return '💪';
  return '📚';
}

// ── Audio Player ──────────────────────────────────────────────────────────────
function AudioPlayer({ src, label }: { src: string; label?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onLoaded = () => { setLoaded(true); setDuration(el.duration); };
    const onTimeUpdate = () => setProgress(el.currentTime / (el.duration || 1));
    const onEnded = () => setPlaying(false);
    const onError = () => setError(true);
    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('timeupdate', onTimeUpdate);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('timeupdate', onTimeUpdate);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onError);
    };
  }, []);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); setPlaying(false); }
    else { el.play(); setPlaying(true); }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    if (!el || !loaded) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    el.currentTime = ratio * el.duration;
  };

  const restart = () => {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = 0;
    el.play();
    setPlaying(true);
  };

  const formatTime = (s: number) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (error) return <p className="text-red-500 text-sm">⚠️ Không thể tải audio — thử lại.</p>;

  return (
    <div className="w-full">
      <audio ref={audioRef} src={src} preload="auto" />
      {label && <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">{label}</p>}
      <div className="flex items-center gap-3 bg-[var(--bg)] border border-[var(--border)] rounded-2xl px-4 py-3">
        <button
          onClick={togglePlay}
          disabled={!loaded}
          className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:opacity-90 transition-opacity shadow-md"
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button onClick={restart} className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors flex-shrink-0">
          <RotateCcw size={15} />
        </button>
        <div className="flex-1 flex flex-col gap-1">
          <div
            className="h-2 bg-[var(--border)] rounded-full cursor-pointer relative overflow-hidden"
            onClick={seek}
          >
            <div
              className="absolute inset-y-0 left-0 bg-[var(--primary)] rounded-full transition-all"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-[var(--text-muted)]">
            <span>{formatTime(duration * progress)}</span>
            <span>{loaded ? formatTime(duration) : '...'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
interface ListeningPracticeProps {
  cards: Card[];
  onComplete: (correct: number, total: number) => void;
}

export function ListeningPractice({ cards, onComplete }: ListeningPracticeProps) {
  const [phase, setPhase] = useState<Phase>('loading');
  const [dialogueData, setDialogueData] = useState<DialogueData | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showScript, setShowScript] = useState(false);
  const [userSummary, setUserSummary] = useState('');
  const [analysis, setAnalysis] = useState<SummaryAnalysis | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Step 1: Generate dialogue from AI
  useEffect(() => {
    const words = cards.map(c => c.term);
    fetch('/api/ai/generate-dialogue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ words }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setErrorMsg(data.error);
          setPhase('listening');
          return;
        }
        if (data.dialogue && data.keyPoints) {
          setDialogueData(data);
          // Build full text for TTS
          const fullText = data.dialogue
            .map((turn: DialogueTurn) => `${turn.speaker} says: ${turn.text}`)
            .join('. ');
          generateAudio(fullText);
        } else {
          setErrorMsg('AI trả về sai định dạng');
          setPhase('listening');
        }
      })
      .catch(err => {
        setErrorMsg(err.message);
        setPhase('listening');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateAudio = async (text: string) => {
    try {
      // POST to avoid URL length limits for long dialogue texts
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error(`TTS failed: ${res.status}`);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      setAudioUrl(objectUrl);
    } catch (err: any) {
      console.error('[ListeningPractice] Audio generation failed:', err);
      // Set empty so player shows error state
      setAudioUrl(null);
    } finally {
      setPhase('listening');
    }
  };


  const handleSubmitSummary = async () => {
    if (!userSummary.trim() || !dialogueData) return;
    setPhase('analyzing');
    try {
      const res = await fetch('/api/ai/analyze-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userSummary,
          keyPoints: dialogueData.keyPoints,
          topic: dialogueData.topic,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data);
      setPhase('result');
    } catch (err: any) {
      alert('Lỗi phân tích: ' + err.message);
      setPhase('writing');
    }
  };

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-5 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Headphones size={32} className="text-purple-500" />
          </div>
          <Loader2 size={20} className="animate-spin text-[var(--primary)] absolute -bottom-1 -right-1" />
        </div>
        <div className="text-center">
          <p className="font-bold text-[var(--text)]">AI đang soạn hội thoại...</p>
          <p className="text-[var(--text-muted)] text-sm mt-1">Đang tạo cuộc trò chuyện thú vị từ từ vựng của bạn</p>
        </div>
      </div>
    );
  }

  // ── Analyzing ────────────────────────────────────────────────────────────────
  if (phase === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-5 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Sparkles size={32} className="text-blue-500" />
          </div>
          <Loader2 size={20} className="animate-spin text-[var(--primary)] absolute -bottom-1 -right-1" />
        </div>
        <div className="text-center">
          <p className="font-bold text-[var(--text)]">AI đang chấm bài...</p>
          <p className="text-[var(--text-muted)] text-sm mt-1">Phân tích mức độ hiểu, từ vựng và phản hồi chi tiết</p>
        </div>
      </div>
    );
  }

  // ── Listening Phase ──────────────────────────────────────────────────────────
  if (phase === 'listening' && dialogueData) {
    return (
      <div className="flex flex-col gap-6 bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm animate-fade-in">
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-[var(--border)] pb-5">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Headphones size={26} />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-[var(--text)]">Luyện Listening</h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              Chủ đề: <span className="font-semibold text-[var(--text)]">{dialogueData.topic}</span>
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 bg-purple-100 dark:bg-purple-900/30 px-3 py-1.5 rounded-full">
            <MessageSquare size={13} />
            {dialogueData.dialogue.length} lượt thoại
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Lightbulb size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-300">
              <p className="font-bold mb-1">Hướng dẫn:</p>
              <ol className="list-decimal list-inside space-y-1 text-amber-700 dark:text-amber-400">
                <li>Nghe hội thoại bên dưới (có thể nghe nhiều lần)</li>
                <li>Khi sẵn sàng, nhấn <strong>&quot;Viết tóm tắt&quot;</strong></li>
                <li>Gõ những gì bạn nghe được — bằng tiếng Anh hoặc tiếng Việt</li>
                <li>AI sẽ phân tích và cho biết bạn đã hiểu được bao nhiêu</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Audio Player */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-5 rounded-2xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-3">
            <Volume2 size={16} className="text-purple-600" />
            <span className="text-sm font-bold text-purple-700 dark:text-purple-300">Nghe hội thoại (AI voice)</span>
          </div>
          {audioUrl ? (
            <AudioPlayer src={audioUrl} />
          ) : (
            <div className="flex items-center gap-2 text-purple-500">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Đang chuẩn bị audio...</span>
            </div>
          )}
          <p className="text-xs text-purple-500 dark:text-purple-400 mt-3">
            💡 Nhấn nút play để nghe. Script bị ẩn — hãy nghe thật tập trung!
          </p>
        </div>

        {/* Script toggle (hidden by default) */}
        <div className="border border-[var(--border)] rounded-xl overflow-hidden">
          <button
            onClick={() => setShowScript(s => !s)}
            className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg)] text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            <span className="flex items-center gap-2">
              <FileText size={15} />
              Xem script (sẽ mất tính thách thức!)
            </span>
            {showScript ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showScript && (
            <div className="p-4 border-t border-[var(--border)] bg-[var(--card)] max-h-96 overflow-y-auto">
              <div className="flex flex-col gap-4">
                {dialogueData.dialogue.map((turn, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${turn.speaker === 'Alex' ? 'bg-violet-500' : 'bg-indigo-500'}`}>
                      {turn.speaker[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-muted)] mb-1">{turn.speaker}</p>
                      <p className="text-sm text-[var(--text)] leading-relaxed">{turn.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => setPhase('writing')}
          className="btn-primary py-3.5 flex items-center justify-center gap-2 text-base font-semibold shadow-lg"
        >
          <FileText size={18} />
          Tôi đã nghe xong — Viết tóm tắt
          <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  // ── Writing Phase ─────────────────────────────────────────────────────────────
  if (phase === 'writing' && dialogueData) {
    return (
      <div className="flex flex-col gap-6 bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm animate-fade-in">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center">
            <FileText size={22} />
          </div>
          <div>
            <h2 className="font-bold text-[var(--text)]">Viết tóm tắt những gì bạn nghe được</h2>
            <p className="text-xs text-[var(--text-muted)]">Chủ đề: {dialogueData.topic}</p>
          </div>
        </div>

        {/* Re-listen option */}
        {audioUrl && (
          <div className="bg-[var(--bg)] rounded-xl p-3 border border-[var(--border)]">
            <p className="text-xs font-semibold text-[var(--text-muted)] mb-2">Nghe lại nếu cần:</p>
            <AudioPlayer src={audioUrl} />
          </div>
        )}

        {/* Summary input */}
        <div>
          <label className="block text-sm font-bold text-[var(--text)] mb-2">
            Tóm tắt nội dung cuộc hội thoại:
          </label>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            Viết những điểm chính bạn nghe được — dùng tiếng Anh hoặc tiếng Việt đều được. Càng chi tiết càng tốt!
          </p>
          <textarea
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4 text-[var(--text)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] resize-none transition-all"
            rows={8}
            placeholder="Hai người nói chuyện về... Họ đề cập đến... Kết luận của họ là..."
            value={userSummary}
            onChange={e => setUserSummary(e.target.value)}
          />
          <p className="text-xs text-[var(--text-muted)] mt-1">{userSummary.trim().split(/\s+/).filter(Boolean).length} từ</p>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmitSummary}
          disabled={userSummary.trim().length < 20}
          className="btn-primary py-3.5 flex items-center justify-center gap-2 text-base font-semibold shadow-lg disabled:opacity-50"
        >
          <Sparkles size={18} />
          AI phân tích bài tóm tắt của tôi
        </button>
      </div>
    );
  }

  // ── Result Phase ──────────────────────────────────────────────────────────────
  if (phase === 'result' && analysis && dialogueData) {
    const score = analysis.overallScore ?? 0;

    return (
      <div className="flex flex-col gap-5 animate-fade-in">

        {/* Score Banner */}
        <div className={`rounded-2xl p-6 text-white bg-gradient-to-br ${getScoreGradient(score)} shadow-lg`}>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex flex-col items-center justify-center flex-shrink-0">
              <span className="text-3xl font-black leading-none">{score}</span>
              <span className="text-xs font-semibold opacity-80">/ 100</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{getScoreEmoji(score)}</span>
                <span className="text-xl font-black">{analysis.comprehensionLevel}</span>
              </div>
              <p className="text-sm opacity-90 leading-relaxed">{analysis.encouragement}</p>
            </div>
          </div>
        </div>

        {/* Caught / Missed */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Caught */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-center gap-2 mb-3">
              <Check size={16} className="text-emerald-600" />
              <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">Đã hiểu đúng ({analysis.caughtPoints?.length ?? 0})</span>
            </div>
            {analysis.caughtPoints?.length > 0 ? (
              <ul className="space-y-2">
                {analysis.caughtPoints.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-emerald-800 dark:text-emerald-300">
                    <Check size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">Hãy cố gắng nắm bắt nội dung hơn nhé!</p>
            )}
          </div>

          {/* Missed */}
          <div className="bg-rose-50 dark:bg-rose-950/20 rounded-2xl p-4 border border-rose-200 dark:border-rose-800">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-rose-500" />
              <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">Còn bỏ lỡ ({analysis.missedPoints?.length ?? 0})</span>
            </div>
            {analysis.missedPoints?.length > 0 ? (
              <ul className="space-y-2">
                {analysis.missedPoints.map((p, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-rose-800 dark:text-rose-300">
                    <X size={13} className="text-rose-500 flex-shrink-0 mt-0.5" />
                    {p}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-rose-600 dark:text-rose-400 font-semibold">Bạn đã nắm được tất cả điểm chính! 🎉</p>
            )}
          </div>
        </div>

        {/* Language Feedback */}
        {(analysis.languageFeedback?.strengths?.length > 0 || analysis.languageFeedback?.improvements?.length > 0) && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-blue-500" />
              <span className="font-bold text-[var(--text)] text-sm">Nhận xét bài viết</span>
            </div>
            {analysis.languageFeedback?.strengths?.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">Điểm tốt</p>
                <ul className="space-y-1.5">
                  {analysis.languageFeedback.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--text)]">
                      <Star size={12} className="text-amber-400 fill-amber-400 flex-shrink-0 mt-0.5" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {analysis.languageFeedback?.improvements?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Cần cải thiện</p>
                <ul className="space-y-1.5">
                  {analysis.languageFeedback.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[var(--text)]">
                      <Lightbulb size={12} className="text-blue-400 flex-shrink-0 mt-0.5" />
                      {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Vocabulary Usage */}
        {analysis.vocabularyUsage?.length > 0 && (
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Award size={16} className="text-purple-500" />
              <span className="font-bold text-[var(--text)] text-sm">Từ vựng</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.vocabularyUsage.map((v, i) => (
                <div key={i} className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${v.status === 'used_well' ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300' : 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'}`}>
                  {v.status === 'used_well' ? '✓ ' : '💡 '}{v.word}
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1.5">
              {analysis.vocabularyUsage.filter(v => v.tip).map((v, i) => (
                <p key={i} className="text-xs text-[var(--text-muted)]">
                  <span className="font-semibold text-[var(--text)]">{v.word}:</span> {v.tip}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Model Answer */}
        {analysis.suggestedSummary && (
          <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare size={15} className="text-indigo-600 flex-shrink-0" />
              <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Đáp án mẫu (tham khảo)</span>
            </div>
            <p className="text-sm text-indigo-800 dark:text-indigo-200 leading-relaxed italic">
              &quot;{analysis.suggestedSummary}&quot;
            </p>
          </div>
        )}

        {/* Full Script */}
        <div className="border border-[var(--border)] rounded-xl overflow-hidden">
          <button
            onClick={() => setShowScript(s => !s)}
            className="w-full flex items-center justify-between px-4 py-3 bg-[var(--bg)] text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
          >
            <span className="flex items-center gap-2"><FileText size={15} /> Xem toàn bộ script hội thoại</span>
            {showScript ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {showScript && (
            <div className="p-4 border-t border-[var(--border)] bg-[var(--card)] max-h-80 overflow-y-auto">
              <div className="flex flex-col gap-4">
                {dialogueData.dialogue.map((turn, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${turn.speaker === 'Alex' ? 'bg-violet-500' : 'bg-indigo-500'}`}>
                      {turn.speaker[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-muted)] mb-1">{turn.speaker}</p>
                      <p className="text-sm text-[var(--text)] leading-relaxed">{turn.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Key Points reference */}
        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-2">Các điểm chính của hội thoại</p>
          <ul className="space-y-1.5">
            {dialogueData.keyPoints.map((kp, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text)]">
                <span className="w-5 h-5 rounded-full bg-[var(--primary-light)] text-[var(--primary)] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                {kp}
              </li>
            ))}
          </ul>
        </div>

        {/* Finish */}
        <button
          onClick={() => onComplete(Math.round(score / 10), 10)}
          className="btn-primary py-3.5 flex items-center justify-center gap-2 text-base shadow-lg"
        >
          Hoàn thành <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  // Error fallback
  if (errorMsg) {
    return (
      <div className="text-center py-10 bg-[var(--card)] rounded-2xl border border-[var(--border)] p-6">
        <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
        <p className="font-bold text-red-500 text-lg">Lỗi tạo bài tập</p>
        <p className="text-sm text-[var(--text-muted)] mt-2">{errorMsg}</p>
        <button onClick={() => window.location.reload()} className="btn-primary mt-4">Thử lại</button>
      </div>
    );
  }

  return null;
}
