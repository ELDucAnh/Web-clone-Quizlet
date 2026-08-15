'use client';
import { useState, useEffect, useRef } from 'react';
import { PenLine, Mic, Sparkles, BookOpen, Check, X, Loader2, Play, Square, AlertCircle, Plus, Upload } from 'lucide-react';
import { useStore } from '@/lib/store';
import Link from 'next/link';

// SpeechRecognition type definitions
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function AITrainingPage() {
  const { addCardToDeck, createDeck, decks } = useStore();
  const [activeTab, setActiveTab] = useState<'writing' | 'speaking'>('writing');
  const [mounted, setMounted] = useState(false);
  const deckList = Object.values(decks);
  const defaultDeckId = deckList.length > 0 ? deckList[0].id : '';

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full animate-fade-in pb-12">
      <div className="flex flex-col items-center justify-center text-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-3xl">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-purple-600 mb-2">
          <Sparkles size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">AI Training Room</h1>
        <p className="text-[var(--text-muted)] max-w-xl">
          Luyện tập Speaking & Writing chuẩn format IELTS. AI đóng vai cựu giám khảo để chấm điểm 4 tiêu chí, bắt lỗi chi tiết và gợi ý từ vựng Band 8+.
        </p>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm mt-4">
          <button
            onClick={() => setActiveTab('writing')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'writing' ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--text-muted)] hover:bg-[var(--bg)]'
            }`}
          >
            <PenLine size={16} /> AI Writing
          </button>
          <button
            onClick={() => setActiveTab('speaking')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'speaking' ? 'bg-purple-600 text-white shadow-md' : 'text-[var(--text-muted)] hover:bg-[var(--bg)]'
            }`}
          >
            <Mic size={16} /> AI Speaking
          </button>
        </div>
      </div>

      <div className="mt-2">
        {activeTab === 'writing' ? <AIWritingRoom defaultDeckId={defaultDeckId} /> : <AISpeakingRoom defaultDeckId={defaultDeckId} />}
      </div>
    </div>
  );
}

// ─── AI Writing Room ────────────────────────────────────────────────────────────
function AIWritingRoom({ defaultDeckId }: { defaultDeckId: string }) {
  const { createWritingSample } = useStore();
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const [task, setTask] = useState<'task1' | 'task2'>('task2');
  const [isGrading, setIsGrading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [topicImage, setTopicImage] = useState<string | null>(null);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (task !== 'task1') return;
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = (evt) => {
          setTopicImage(evt.target?.result as string);
        };
        reader.readAsDataURL(file);
        e.preventDefault();
        break;
      }
    }
  };

  const handleGrade = async () => {
    if (!topic.trim() || !content.trim()) return alert('Vui lòng nhập đủ đề bài và bài làm!');
    setIsGrading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/ai/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskType: task, topic, essay: content, topicImage })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback(data);
        createWritingSample({
          task, title: topic.slice(0, 50) + '...', topic, content, band: data.overallBand, aiFeedback: data
        });
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert('Lỗi kết nối tới AI!');
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-[var(--card)] rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600 flex items-center justify-center shadow-sm border border-blue-100">
                <PenLine size={18} />
              </div>
              <h3 className="font-extrabold text-lg text-[var(--text)] whitespace-nowrap tracking-tight">Nhập bài viết</h3>
            </div>
            <select className="q-input w-auto text-sm font-bold bg-[var(--bg)] border-none" value={task} onChange={e => setTask(e.target.value as any)}>
              <option value="task1">IELTS Task 1</option>
              <option value="task2">IELTS Task 2</option>
            </select>
          </div>
          {task === 'task1' && (
            <div className="mb-4">
              <p className="text-xs font-bold text-[var(--text-muted)] mb-2 uppercase">Đính kèm biểu đồ (Tùy chọn):</p>
              {topicImage ? (
                <div className="relative inline-block border border-[var(--border)] rounded-xl overflow-hidden shadow-sm bg-white">
                  <img src={topicImage} alt="Topic Chart" className="max-h-48 object-contain p-2" />
                  <button onClick={() => setTopicImage(null)} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-[var(--border)] rounded-xl cursor-pointer hover:bg-[var(--bg)] transition-colors">
                  <Upload size={24} className="text-[var(--text-muted)] mb-1" />
                  <span className="text-xs text-[var(--text-muted)] font-medium text-center">Bấm tải ảnh lên, hoặc <b>Ctrl+V</b> dán ảnh trực tiếp vào ô Đề bài bên dưới</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => setTopicImage(evt.target?.result as string);
                      reader.readAsDataURL(file);
                    }
                  }} />
                </label>
              )}
            </div>
          )}
          <textarea
            className="q-input resize-y font-sans font-medium text-[15px] leading-relaxed mb-4 w-full bg-[var(--bg)] border border-[var(--border)] focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 shadow-inner rounded-xl p-4 transition-all"
            rows={3} placeholder="Dán đề bài (Prompt) vào đây..."
            value={topic} onChange={e => setTopic(e.target.value)}
            onPaste={handlePaste}
          />
          <textarea
            className="q-input resize-y font-sans font-medium text-[15px] leading-relaxed w-full min-h-[300px] bg-[var(--bg)] border border-[var(--border)] focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 shadow-inner rounded-xl p-4 transition-all"
            placeholder="Viết bài làm của bạn vào đây..."
            value={content} onChange={e => setContent(e.target.value)}
          />
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleGrade}
              disabled={isGrading || !topic.trim() || !content.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:bg-[var(--primary-hover)] shadow-md disabled:opacity-50 transition-all"
            >
              {isGrading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {isGrading ? 'Giám khảo đang chấm...' : 'Gửi cho Giám Khảo AI'}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full md:w-[45%]">
        <FeedbackPanel feedback={feedback} isGrading={isGrading} defaultDeckId={defaultDeckId} type="writing" />
      </div>
    </div>
  );
}

// ─── AI Speaking Room ───────────────────────────────────────────────────────────
function AISpeakingRoom({ defaultDeckId }: { defaultDeckId: string }) {
  const { createSpeakingSubmission } = useStore();
  const [topic, setTopic] = useState('');
  const [part, setPart] = useState<'1' | '2' | '3'>('2');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
      };
      recognition.onerror = (e: any) => console.error('Speech error:', e.error);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return alert('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói (Hãy dùng Chrome).');
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleGrade = async () => {
    if (!transcript.trim()) return alert('Chưa có nội dung nói!');
    setIsGrading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/ai/speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ part: parseInt(part), topic, transcript })
      });
      const data = await res.json();
      if (res.ok) {
        setFeedback(data);
        createSpeakingSubmission({
          part: parseInt(part) as any, topic, transcript, band: data.overallBand, aiFeedback: data
        });
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert('Lỗi kết nối tới AI!');
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-[var(--card)] rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-50 text-purple-600 flex items-center justify-center shadow-sm border border-purple-100">
                <Mic size={18} />
              </div>
              <h3 className="font-extrabold text-lg text-[var(--text)] whitespace-nowrap tracking-tight">Phòng thi Nói ảo</h3>
            </div>
            <select className="q-input w-auto text-sm font-bold bg-[var(--bg)] border-none text-purple-700" value={part} onChange={e => setPart(e.target.value as any)}>
              <option value="1">Part 1 (Phỏng vấn)</option>
              <option value="2">Part 2 (Độc thoại)</option>
              <option value="3">Part 3 (Thảo luận)</option>
            </select>
          </div>
          
          <input
            className="w-full h-12 px-4 rounded-xl bg-[var(--bg)] border border-[var(--border)] font-sans font-medium text-[15px] outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-500/10 shadow-inner transition-all mb-5"
            placeholder="Chủ đề / Đề bài (ví dụ: Describe a memorable trip...)"
            value={topic} onChange={e => setTopic(e.target.value)}
          />

          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-purple-200 rounded-2xl bg-purple-50/50 mb-4">
            <button
              onClick={toggleRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all transform hover:scale-105 ${
                isRecording ? 'bg-red-500 animate-pulse' : 'bg-purple-600'
              }`}
            >
              {isRecording ? <Square size={28} className="fill-current"/> : <Mic size={32} />}
            </button>
            <p className="mt-4 font-semibold text-purple-900">
              {isRecording ? 'Đang ghi âm (Bấm để Dừng)...' : 'Bấm để Bắt đầu nói'}
            </p>
          </div>

          <div className="bg-[var(--bg)] rounded-xl p-5 min-h-[150px] shadow-inner border border-[var(--border)]">
            <p className="text-xs font-bold text-[var(--text-muted)] mb-3 uppercase tracking-wider">Văn bản bóc băng (Live Transcript):</p>
            {transcript ? (
              <p className="text-[var(--text)] text-[15px] font-medium leading-relaxed">{transcript}</p>
            ) : (
              <p className="text-[var(--text-faint)] italic text-[15px]">Chữ sẽ tự động hiện ở đây khi bạn nói...</p>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleGrade}
              disabled={isGrading || !transcript.trim() || isRecording}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-md disabled:opacity-50 transition-all"
            >
              {isGrading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {isGrading ? 'AI đang phân tích...' : 'Nộp bài & Chấm điểm'}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full md:w-[45%]">
        <FeedbackPanel feedback={feedback} isGrading={isGrading} defaultDeckId={defaultDeckId} type="speaking" />
      </div>
    </div>
  );
}

// ─── Feedback Panel UI ──────────────────────────────────────────────────────────
function FeedbackPanel({ feedback, isGrading, defaultDeckId, type }: { feedback: any, isGrading: boolean, defaultDeckId: string, type: 'writing'|'speaking' }) {
  const { addCardToDeck, decks } = useStore();
  const deckList = Object.values(decks);
  const [selectedDeckId, setSelectedDeckId] = useState(defaultDeckId);
  
  // Keep default deck synced if it changes
  useEffect(() => {
    if (!selectedDeckId && defaultDeckId) setSelectedDeckId(defaultDeckId);
  }, [defaultDeckId, selectedDeckId]);

  const themeColor = type === 'speaking' ? 'purple' : 'blue';

  if (isGrading) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-[var(--card)] rounded-2xl p-8 text-center shadow-sm border border-transparent">
        <Loader2 size={40} className={`animate-spin text-${themeColor}-500 mb-4`} />
        <h3 className="font-bold text-lg mb-2">Giám khảo AI đang chấm bài...</h3>
        <p className="text-[var(--text-muted)] text-sm">Quá trình này có thể mất 10-15 giây để đọc và phân tích từng lỗi sai chi tiết.</p>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-[var(--bg)] rounded-2xl p-8 text-center border-2 border-dashed border-[var(--border)]">
        <Sparkles size={40} className="text-[var(--text-faint)] mb-4" />
        <h3 className="font-bold text-[var(--text-muted)] text-lg">Bảng điểm AI</h3>
        <p className="text-[var(--text-faint)] text-sm mt-2">Gửi bài của bạn để xem phân tích cực chi tiết từ AI.</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card)] rounded-2xl shadow-sm border border-transparent overflow-hidden h-full flex flex-col">
      <div className={`bg-gradient-to-br from-${themeColor}-600 to-${themeColor}-800 p-8 flex flex-col items-center justify-center relative overflow-hidden`}>
        {/* Vòng tròn trang trí background */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="text-xs font-bold uppercase tracking-widest text-white/80 mb-4 z-10">Overall Band Score</div>
        <div className={`w-36 h-36 rounded-full bg-white flex items-center justify-center shadow-[0_0_40px_rgba(0,0,0,0.2)] border-4 border-white/20 z-10 relative`}>
          <div className="absolute inset-2 rounded-full border-2 border-dashed border-gray-200 opacity-50"></div>
          <div className={`text-6xl font-black text-${themeColor}-600 tracking-tighter`}>{feedback.overallBand}</div>
        </div>
      </div>
      
      <div className="p-5 overflow-y-auto custom-scrollbar flex-1 flex flex-col gap-6">
        
        {/* Điểm thành phần */}
        <div>
          <h4 className="font-bold text-[var(--text)] mb-3 text-sm uppercase tracking-wide border-b pb-2">Điểm 4 Tiêu Chí</h4>
          <div className="flex flex-col gap-3">
            {Object.entries(feedback.scores || {}).map(([crit, score]: any) => (
              <div key={crit} className="bg-[var(--bg)] p-3 rounded-xl border border-[var(--border)]">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-black text-${themeColor}-600`}>{crit}</span>
                  <span className="font-bold text-lg">{score}</span>
                </div>
                <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">{feedback.feedback[crit]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nhận xét chung */}
        <div>
          <h4 className="font-bold text-[var(--text)] mb-3 text-sm uppercase tracking-wide border-b pb-2">Nhận xét từ Giám khảo</h4>
          <p className="text-[15px] text-[var(--text)] leading-relaxed bg-amber-50 text-amber-900 p-4 rounded-xl shadow-inner border border-amber-100/50 font-medium">
            {feedback.generalComment}
          </p>
        </div>

        {/* Lỗi ngữ pháp */}
        {feedback.grammarErrors?.length > 0 && (
          <div>
            <h4 className="font-bold text-red-600 mb-3 text-sm uppercase tracking-wide border-b border-red-100 pb-2 flex items-center gap-1">
              <AlertCircle size={14}/> Lỗi cần sửa
            </h4>
            <div className="flex flex-col gap-3">
              {feedback.grammarErrors.map((err: any, idx: number) => (
                <div key={idx} className="bg-red-50 p-3 rounded-xl border border-red-100">
                  <p className="text-sm line-through text-red-400 mb-1">{err.error}</p>
                  <p className="text-sm font-bold text-green-600 mb-1">→ {err.correction}</p>
                  <p className="text-xs text-red-800">{err.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Từ vựng Band 8 */}
        {feedback.vocabularyUpgrades?.length > 0 && (
          <div>
            <h4 className="font-bold text-emerald-600 mb-3 text-sm uppercase tracking-wide border-b border-emerald-100 pb-2 flex items-center gap-1">
              <Sparkles size={14}/> Gợi ý từ vựng Band 8+
            </h4>
            <div className="flex flex-col gap-3">
              {feedback.vocabularyUpgrades.map((vocab: any, idx: number) => (
                <div key={idx} className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-emerald-600/70 mb-0.5">Thay vì dùng: <span className="line-through">{vocab.original}</span></p>
                    <p className="text-base font-black text-emerald-700 mb-1">{vocab.upgrade}</p>
                    <p className="text-xs text-emerald-800">{vocab.explanation}</p>
                  </div>
                  {selectedDeckId ? (
                    <button
                      onClick={() => {
                        addCardToDeck(selectedDeckId, vocab.upgrade, vocab.explanation);
                        alert(`Đã thêm "${vocab.upgrade}" vào bộ học!`);
                      }}
                      className="w-8 h-8 rounded-lg bg-emerald-200 text-emerald-800 hover:bg-emerald-300 flex items-center justify-center flex-shrink-0 transition-colors"
                      title="Lưu vào thẻ bài"
                    >
                      <Plus size={16} />
                    </button>
                  ) : (
                    <Link href="/create-set" className="text-[10px] text-emerald-700 underline font-bold whitespace-nowrap">
                      Tạo bộ học
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deck Selector cho Gợi ý từ vựng */}
        {feedback.vocabularyUpgrades?.length > 0 && deckList.length > 0 && (
          <div className="mt-2 bg-[var(--bg)] p-3 rounded-xl border border-[var(--border)] flex items-center justify-between gap-3">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Lưu từ vựng vào:</span>
            <select 
              className="q-input py-1.5 px-3 text-xs w-auto flex-1 font-bold bg-white"
              value={selectedDeckId}
              onChange={e => setSelectedDeckId(e.target.value)}
            >
              {deckList.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <button
              onClick={() => {
                let count = 0;
                feedback.vocabularyUpgrades.forEach((vocab: any) => {
                  addCardToDeck(selectedDeckId, vocab.upgrade, vocab.explanation);
                  count++;
                });
                alert(`Đã thêm nhanh ${count} từ vựng Band 8 vào bộ học!`);
              }}
              className={`px-4 py-1.5 bg-${themeColor}-600 text-white text-xs font-bold rounded-lg hover:bg-${themeColor}-700 transition-colors whitespace-nowrap shadow-sm`}
            >
              Lưu tất cả
            </button>
          </div>
        )}

        {/* Thông báo lưu tự động */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl text-center flex items-center justify-center gap-2">
          <Check size={16} className="text-blue-600" />
          <p className="text-xs font-bold text-blue-800">
            Bài làm và Bảng điểm đã được tự động lưu vào Kho bài mẫu!
          </p>
        </div>

      </div>
    </div>
  );
}
