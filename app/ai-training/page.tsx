'use client';
import { useState, useEffect, useRef } from 'react';
import { PenLine, Mic, Sparkles, BookOpen, Check, X, Loader2, Play, Square, AlertCircle, Plus, Upload, History, Trash2, Search, ChevronRight } from 'lucide-react';
import { useStore } from '@/lib/store';
import { appAlert, appConfirm } from '@/lib/dialog';
import Link from 'next/link';
import { LoadingScreen } from '@/components/LoadingScreen';

// SpeechRecognition type definitions
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function AITrainingPage() {
  const { addCardToDeck, createDeck, decks, isHydrated } = useStore();
  const [activeTab, setActiveTab] = useState<'writing' | 'speaking' | 'history'>('writing');
  const [mounted, setMounted] = useState(false);
  const deckList = Object.values(decks);
  const defaultDeckId = deckList.length > 0 ? deckList[0].id : '';

  useEffect(() => { setMounted(true); }, []);

  if (!mounted || !isHydrated) return <LoadingScreen />;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto w-full animate-fade-in pb-12">
      <div className="relative flex flex-col items-center justify-center text-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-3xl shadow-2xl overflow-hidden">
        {/* Animated glowing border */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
          background: 'transparent',
          boxShadow: '0 0 0 2px rgba(99,102,241,0.3), 0 0 40px 4px rgba(99,102,241,0.15), 0 0 80px 8px rgba(139,92,246,0.08)',
        }}></div>
        {/* Glowing top streak */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"></div>

        <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center text-purple-600 mb-2 z-10 ring-1 ring-purple-100">
          <Sparkles size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-[var(--text)] tracking-tight z-10">AI Training Room</h1>
        <p className="text-[var(--text-muted)] max-w-xl z-10">
          Luyện tập Speaking & Writing chuẩn format IELTS. AI đóng vai cựu giám khảo để chấm điểm 4 tiêu chí, bắt lỗi chi tiết và gợi ý từ vựng Band 8+.
        </p>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl shadow-sm mt-4 z-10 ring-1 ring-gray-100">
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
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'history' ? 'bg-amber-500 text-white shadow-md' : 'text-[var(--text-muted)] hover:bg-[var(--bg)]'
            }`}
          >
            <History size={16} /> Bài đã chữa
          </button>
        </div>
      </div>

      <div className="mt-2">
        {activeTab === 'writing' && <AIWritingRoom defaultDeckId={defaultDeckId} />}
        {activeTab === 'speaking' && <AISpeakingRoom defaultDeckId={defaultDeckId} />}
        {activeTab === 'history' && <AIHistoryRoom />}
      </div>
    </div>
  );
}

// ─── AI History Room ────────────────────────────────────────────────────────────
function AIHistoryRoom() {
  const { writingSamples, speakingSubmissions, deleteWritingSample, deleteSpeakingSubmission } = useStore();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [writeFilter, setWriteFilter] = useState<'all' | 'task1' | 'task2'>('all');
  const [writeSearch, setWriteSearch] = useState('');
  const [speakFilter, setSpeakFilter] = useState<any>('all');
  const [speakSearch, setSpeakSearch] = useState('');

  const gradedWritings = Object.values(writingSamples || {})
    .filter(s => s.tags?.includes('ai_graded'))
    .filter(s => writeFilter === 'all' || s.task === writeFilter)
    .filter(s => !writeSearch || s.title.toLowerCase().includes(writeSearch.toLowerCase()) || s.topic.toLowerCase().includes(writeSearch.toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt);

  const gradedSpeakings = Object.values(speakingSubmissions || {})
    .filter(s => speakFilter === 'all' || s.part === speakFilter)
    .filter(s => !speakSearch || (s.topic || '').toLowerCase().includes(speakSearch.toLowerCase()))
    .sort((a, b) => b.createdAt - a.createdAt);

  if (selectedItem) {
    const isWriting = selectedItem.task !== undefined;
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedItem(null)} className="self-start text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1">
            ← Quay lại Lịch sử
          </button>
          <button 
            onClick={async () => {
              if (await appConfirm('Bạn có chắc chắn muốn xoá bài đã chữa này?')) {
                if (isWriting) deleteWritingSample(selectedItem.id);
                else deleteSpeakingSubmission(selectedItem.id);
                setSelectedItem(null);
              }
            }}
            className="text-sm font-bold text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <Trash2 size={16} /> Xoá bài
          </button>
        </div>
        <div className="flex flex-col gap-6">
          <div className="w-full bg-[var(--card)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">{isWriting ? selectedItem.title : `Speaking ${selectedItem.part === 'Full Test' ? 'Full Test' : 'Part ' + selectedItem.part}: ${selectedItem.topic || 'No topic'}`}</h2>
            
            {isWriting && selectedItem.aiFeedback?.topicImage && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Ảnh đề bài:</p>
                <img src={selectedItem.aiFeedback.topicImage} alt="Topic" className="max-h-64 object-contain rounded-xl border border-gray-200 p-2 bg-white" />
              </div>
            )}
            
            {selectedItem.topic && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">Đề bài / Chủ đề:</p>
                <div className="p-4 bg-gray-50 rounded-xl whitespace-pre-wrap text-[15px] text-gray-800 border border-gray-100 font-medium leading-relaxed">
                  {selectedItem.topic}
                </div>
              </div>
            )}
            
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">Bài làm:</p>
            <div className="p-4 bg-gray-50 rounded-xl whitespace-pre-wrap text-sm text-gray-800 border border-gray-100">
              {isWriting ? selectedItem.content : selectedItem.transcript}
            </div>
          </div>
          <div className="w-full">
            <FeedbackPanel feedback={selectedItem.aiFeedback} isGrading={false} defaultDeckId="" type={isWriting ? "writing" : "speaking"} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      {/* Cột Writing */}
      <div className="bg-[var(--card)] rounded-2xl p-6 shadow-sm border border-[var(--border)]">
        <div className="flex items-center gap-2 mb-4 text-blue-600">
          <PenLine size={20} />
          <h2 className="text-lg font-bold text-[var(--text)]">Bài Writing đã chữa</h2>
        </div>
        
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex gap-2">
            {(['all', 'task1', 'task2'] as const).map(f => (
              <button key={f} onClick={() => setWriteFilter(f)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${writeFilter === f ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {f === 'all' ? 'Tất cả' : f === 'task1' ? 'Task 1' : 'Task 2'}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Tìm kiếm đề bài hoặc tiêu đề..." value={writeSearch} onChange={e => setWriteSearch(e.target.value)} className="w-full pl-8 pr-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all" />
          </div>
        </div>
        {gradedWritings.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Chưa có bài nào được AI chấm.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {gradedWritings.map(item => (
              <div key={item.id} onClick={() => setSelectedItem(item)} className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)] cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-sm text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">{item.title}</h3>
                  {item.band !== undefined && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-black rounded-md">{Number(item.band).toFixed(1)}</span>
                )}
                </div>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span className="uppercase font-bold text-gray-400">{item.task}</span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                  {item.aiFeedback?.topicImage && <span className="text-blue-500 font-bold ml-auto flex items-center gap-1"><Sparkles size={12}/> Có ảnh</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cột Speaking */}
      <div className="bg-[var(--card)] rounded-2xl p-6 shadow-sm border border-[var(--border)]">
        <div className="flex items-center gap-2 mb-4 text-purple-600">
          <Mic size={20} />
          <h2 className="text-lg font-bold text-[var(--text)]">Bài Speaking đã chữa</h2>
        </div>

        <div className="flex flex-col gap-3 mb-4">
          <div className="flex gap-2">
            {(['all', 1, 2, 3, 'Full Test'] as const).map(f => (
              <button key={f} onClick={() => setSpeakFilter(f)} className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${speakFilter === f ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                {f === 'all' ? 'Tất cả' : f === 'Full Test' ? 'Full Test' : `Part ${f}`}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Tìm kiếm chủ đề speaking..." value={speakSearch} onChange={e => setSpeakSearch(e.target.value)} className="w-full pl-8 pr-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm font-medium outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/10 transition-all" />
          </div>
        </div>
        {gradedSpeakings.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Chưa có bài nào được AI chấm.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {gradedSpeakings.map(item => (
              <div key={item.id} onClick={() => setSelectedItem(item)} className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)] cursor-pointer hover:border-purple-300 hover:shadow-md transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-sm text-gray-800 group-hover:text-purple-600 transition-colors line-clamp-1">{item.topic || 'Part ' + item.part}</h3>
                  {item.band !== undefined && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-black rounded-md">{Number(item.band).toFixed(1)}</span>
                )}
                </div>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span className="uppercase font-bold text-gray-400">{item.part === 'Full Test' ? 'Full Test' : 'Part ' + item.part}</span>
                  <span>•</span>
                  <span>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Utility: Nén ảnh để tránh lỗi Payload Too Large khi lưu DB ────────────────
const compressImage = (file: File, callback: (base64: string) => void) => {
  const reader = new FileReader();
  reader.onload = (evt) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const MAX_SIZE = 1200;
      if (width > height) {
        if (width > MAX_SIZE) { height *= MAX_SIZE / width; width = MAX_SIZE; }
      } else {
        if (height > MAX_SIZE) { width *= MAX_SIZE / height; height = MAX_SIZE; }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.src = evt.target?.result as string;
  };
  reader.readAsDataURL(file);
};

// ─── AI Writing Room ────────────────────────────────────────────────────────────
function AIWritingRoom({ defaultDeckId }: { defaultDeckId: string }) {
  const { createWritingSample } = useStore();
  const [topic, setTopic] = useState('');
  const [content, setContent] = useState('');
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const [task, setTask] = useState<'task1' | 'task2'>('task2');
  const [isGrading, setIsGrading] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [topicImage, setTopicImage] = useState<string | null>(null);

  const handlePaste = (e: any) => {
    if (task !== 'task1') return;
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          compressImage(file, setTopicImage);
        }
        e.preventDefault();
        break;
      }
    }
  };

  const handleGrade = async () => {
    if (task === 'task1' && !topicImage) return appAlert('Vui lòng tải lên ảnh đề bài!');
    if (task === 'task2' && !topic.trim()) return appAlert('Vui lòng nhập đề bài!');
    if (!content.trim()) return appAlert('Vui lòng cung cấp bài làm!');
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
        if (topicImage) data.topicImage = topicImage; // Save image to JSON DB
        setFeedback(data);
        createWritingSample({
          task, title: topic.trim() ? topic.slice(0, 30) + '...' : 'Task 1 (Ảnh)', topic, content, band: data.overallBand, aiFeedback: data, tags: ['ai_graded']
        });
        
        // Save Band 8 suggested essay to the repo
        const band8Text = data.improvedVersion?.band8Sample || (typeof data.improvedVersion === 'string' ? data.improvedVersion : null);
        if (band8Text) {
          createWritingSample({
            task, 
            title: `[Band 8] ${topic.trim() ? topic.slice(0, 30) + '...' : 'Task 1'}`, 
            topic, 
            content: band8Text, 
            band: 8.0, 
            tags: [], 
            aiFeedback: { topicImage } 
          });
        }
      } else {
        appAlert(data.error);
      }
    } catch (e) {
      appAlert('Lỗi kết nối tới AI!');
    } finally {
      setIsGrading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full flex flex-col gap-4">
        <div className="bg-[var(--card)] rounded-2xl p-5 shadow-sm" onPaste={handlePaste}>
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
                  <span className="text-xs text-[var(--text-muted)] font-medium text-center">Bấm tải ảnh lên, hoặc <b>Ctrl+V</b> dán ảnh trực tiếp vào bất cứ đâu</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) compressImage(file, setTopicImage);
                  }} />
                </label>
              )}
            </div>
          )}
          {task === 'task2' && (
            <textarea
              className="q-input resize-y font-sans font-medium text-[15px] leading-relaxed mb-4 w-full bg-[var(--bg)] border border-[var(--border)] focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 shadow-inner rounded-xl p-4 transition-all"
              rows={3} placeholder="Dán đề bài (Prompt) vào đây..."
              value={topic} onChange={e => setTopic(e.target.value)}
            />
          )}
          <div className="relative">
            <textarea
              className="q-input resize-y font-sans font-medium text-[15px] leading-relaxed w-full min-h-[300px] bg-[var(--bg)] border border-[var(--border)] focus:border-blue-300 focus:ring-4 focus:ring-blue-500/10 shadow-inner rounded-xl p-4 transition-all"
              placeholder="Viết bài làm của bạn vào đây..."
              value={content} onChange={e => setContent(e.target.value)}
            />
            <div className="absolute bottom-4 right-4 text-xs font-bold text-gray-400 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-md shadow-sm border border-gray-100">
              {wordCount} words
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleGrade}
              disabled={isGrading || (task === 'task1' && !topicImage) || (task === 'task2' && !topic.trim()) || !content.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white font-bold rounded-xl hover:bg-[var(--primary-hover)] shadow-md disabled:opacity-50 transition-all"
            >
              {isGrading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {isGrading ? 'Giám khảo đang chấm...' : 'Gửi cho Giám Khảo AI'}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full">
        <FeedbackPanel feedback={feedback} isGrading={isGrading} defaultDeckId={defaultDeckId} type="writing" />
      </div>
    </div>
  );
}

// ─── AI Speaking Room ───────────────────────────────────────────────────────────
function AISpeakingRoom({ defaultDeckId }: { defaultDeckId: string }) {
  const { createSpeakingSubmission } = useStore();
  const [mode, setMode] = useState('Full Test');
  const [topicStr, setTopicStr] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  const [messages, setMessages] = useState<any[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const [transcript, setTranscript] = useState('');
  const [isExaminerTyping, setIsExaminerTyping] = useState(false);
  const [isTestOver, setIsTestOver] = useState(false);
  const [grading, setGrading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [feedback, setFeedback] = useState<any>(null);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const errorCountRef = useRef<number>(0);
  const lastErrorTimeRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transcript]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const initSpeechRecognition = () => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTrans = '';
        let interimTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          } else {
            interimTrans += event.results[i][0].transcript;
          }
        }
        if (finalTrans) {
          setTranscript(prev => {
            const cleanPrev = prev.replace(/\[\.\.\.\]$/, '').trim();
            return cleanPrev + (cleanPrev ? ' ' : '') + finalTrans;
          });
        } else if (interimTrans) {
          setTranscript(prev => {
            const cleanPrev = prev.replace(/\[\.\.\.\]$/, '').trim();
            return cleanPrev + (cleanPrev ? ' ' : '') + '[...]';
          });
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        if (event.error === 'not-allowed') {
          isRecordingRef.current = false;
          setIsRecording(false);
          alert('Trình duyệt đã chặn Micro. Vui lòng cấp quyền trong cài đặt trình duyệt!');
        } else if (event.error !== 'no-speech') {
          const now = Date.now();
          if (now - lastErrorTimeRef.current > 3000) {
            errorCountRef.current = 1;
          } else {
            errorCountRef.current += 1;
          }
          lastErrorTimeRef.current = now;

          if (errorCountRef.current > 3) {
            isRecordingRef.current = false;
            setIsRecording(false);
            alert(`Lỗi Micro liên tục (${event.error}). Vui lòng kiểm tra lại đường truyền mạng hoặc đổi trình duyệt!`);
          }
        }
      };

      recognition.onend = () => {
        if (isRecordingRef.current) {
          try {
            recognition.start();
          } catch (e) {
            console.error('Failed to restart recognition', e);
          }
        }
      };

      recognitionRef.current = recognition;
      return recognition;
    }
    return null;
  };

  const speak = async (text: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    window.speechSynthesis.cancel();

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error('TTS failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
    } catch (err) {
      console.error('TTS API error, falling back to browser TTS:', err);
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
  };

  const handleExaminerTurn = async (currentHistory: any[]) => {
    setIsExaminerTyping(true);
    try {
      const res = await fetch('/api/ai/speaking-examiner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: currentHistory, mode, topic: topicStr || 'General IELTS Speaking' })
      });
      const data = await res.json();
      
      if (data.response) {
        const examinerText = data.response.trim();
        setMessages(prev => [...prev, { role: 'examiner', text: examinerText }]);
        speak(examinerText);

        if (examinerText.toLowerCase().includes("that is the end of the speaking test")) {
          setIsTestOver(true);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsExaminerTyping(false);
    }
  };

  const startTest = () => {
    setHasStarted(true);
    setFeedback(null);
    handleExaminerTurn([]);
  };

  const toggleRecording = () => {
    if (audioRef.current) audioRef.current.pause();
    window.speechSynthesis.cancel();
    if (isRecording) {
      isRecordingRef.current = false;
      recognitionRef.current?.stop();
      setIsRecording(false);

      if (transcript.trim()) {
        const cleanTrans = transcript.replace(/\[\.\.\.\]$/, '').trim();
        const newMsg = { role: 'user', text: cleanTrans };
        const newHistory = [...messages, newMsg];
        setMessages(newHistory);
        setTranscript('');
        handleExaminerTurn(newHistory);
      }
    } else {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      const recognition = initSpeechRecognition();
      if (!recognition) {
        alert("Trình duyệt không hỗ trợ ghi âm.");
        return;
      }
      isRecordingRef.current = true;
      setTranscript('');
      try {
        recognition.start();
      } catch(e) {
        console.error('Start error', e);
      }
      setIsRecording(true);
    }
  };

  const abortTest = () => {
    if (audioRef.current) audioRef.current.pause();
    window.speechSynthesis.cancel();
    if (recognitionRef.current) {
      isRecordingRef.current = false;
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    setHasStarted(false);
    setMessages([]);
    setTranscript('');
    setIsTestOver(false);
  };

  const finishAndGrade = async () => {
    setGrading(true);
    const fullTranscript = messages.map(m => m.role === 'examiner' ? `Examiner: ${m.text}` : `Candidate: ${m.text}`).join('\n\n');
    
    try {
      const res = await fetch('/api/ai/speaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          part: mode,
          topic: topicStr,
          transcript: fullTranscript
        })
      });
      const data = await res.json();
      
      if (data.overallBand) {
        let partNum: any = 1;
        if (mode.includes('2')) partNum = 2;
        else if (mode.includes('3')) partNum = 3;
        else if (mode === 'Full Test') partNum = 'Full Test';

        createSpeakingSubmission({
          part: partNum,
          topic: topicStr || 'General IELTS Speaking',
          transcript: fullTranscript,
          band: data.overallBand,
          aiFeedback: data,
        });

        const band8Text = data.improvedVersion?.band8Sample || (typeof data.improvedVersion === 'string' ? data.improvedVersion : null);
        if (band8Text) {
          createSpeakingSubmission({
            part: partNum,
            topic: `[Band 8] ${topicStr || 'Speaking Mock Test'}`,
            transcript: band8Text,
            band: 8.0,
            aiFeedback: { },
          });
        }
        
        setFeedback(data);
        setHasStarted(false);
        setMessages([]);
        setIsTestOver(false);
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi chấm bài');
    } finally {
      setGrading(false);
    }
  };

  useEffect(() => {
    if (isTestOver && !grading && messages.length > 0) {
      finishAndGrade();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTestOver]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="w-full flex flex-col gap-4">
        {!hasStarted ? (
          <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] shadow-sm flex flex-col gap-4">
             <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-fuchsia-50 text-purple-600 flex items-center justify-center shadow-sm border border-purple-100">
                <Mic size={18} />
              </div>
              <h3 className="font-extrabold text-lg text-[var(--text)] whitespace-nowrap tracking-tight">Phòng thi Nói ảo</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select 
                className="q-input flex-shrink-0 sm:w-64 bg-purple-50 text-purple-900 border-purple-200 focus:ring-purple-500/20"
                value={mode}
                onChange={e => setMode(e.target.value)}
              >
                <option value="Part 1">Part 1 (Phỏng vấn)</option>
                <option value="Part 2">Part 2 (Độc thoại)</option>
                <option value="Part 3">Part 3 (Thảo luận)</option>
                <option value="Full Test">Full Test</option>
              </select>
              <input 
                type="text" 
                className="q-input flex-1"
                placeholder="Chủ đề / Đề bài (ví dụ: Describe a person...)"
                value={topicStr}
                onChange={e => setTopicStr(e.target.value)}
              />
            </div>
            <button onClick={startTest} className="w-full py-4 text-lg mt-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-lg transition-all transform hover:scale-[1.01] flex justify-center items-center gap-2">
              Bắt đầu bài thi <Play size={20} fill="currentColor" />
            </button>
          </div>
        ) : (
          <div className="bg-[var(--card)] p-4 md:p-6 rounded-3xl border border-[var(--border)] shadow-sm flex flex-col items-center justify-center min-h-[250px] relative">
            {!isTestOver ? (
              <div className="flex flex-col items-center gap-6 w-full py-8">
                <button 
                  onClick={toggleRecording}
                  disabled={isExaminerTyping}
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 ${
                    isRecording 
                      ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-red-500/50' 
                      : 'bg-gradient-to-br from-purple-500 to-indigo-600 hover:scale-105 shadow-purple-500/30'
                  } disabled:opacity-50 disabled:hover:scale-100`}
                >
                  {isRecording ? <Square size={36} fill="currentColor" /> : <Mic size={40} />}
                </button>
                
                <div className="text-center">
                  {isRecording ? (
                    <p className="text-red-500 font-bold text-lg animate-pulse">
                      Đang ghi âm ({formatTime(recordingTime)})... Bấm để Gửi
                    </p>
                  ) : isExaminerTyping ? (
                    <p className="text-[var(--text-muted)] font-medium text-lg flex items-center gap-2 justify-center">
                      <Loader2 size={20} className="animate-spin" /> Giám khảo đang suy nghĩ...
                    </p>
                  ) : (
                    <p className="text-[var(--text)] font-medium text-lg">
                      Nhấn vào Micro để trả lời
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-full flex items-center justify-center">
                  <Loader2 size={40} className="animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-[var(--text)]">Bài thi kết thúc</h3>
                <p className="text-[var(--text-muted)]">Hệ thống đang tự động chấm điểm...</p>
              </div>
            )}

            <div className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-inner flex flex-col h-[300px] mt-6">
              <div className="bg-white/50 px-4 py-3 border-b border-[var(--border)]">
                <h3 className="text-xs font-bold text-[var(--text-muted)] tracking-wider uppercase">Văn bản bóc băng (Live Transcript)</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {messages.length === 0 && !transcript && (
                  <p className="text-[var(--text-muted)] text-sm italic opacity-70">Chữ sẽ tự động hiện ở đây khi bạn hoặc giám khảo nói...</p>
                )}
                
                {messages.map((m, i) => (
                  <div key={i} className={`flex w-full ${m.role === 'examiner' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 ${m.role === 'examiner' ? 'bg-white border border-[var(--border)] text-[var(--text)] shadow-sm' : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md'}`}>
                      <p className="text-xs font-bold mb-1 opacity-70 uppercase tracking-wider">{m.role === 'examiner' ? 'Giám khảo' : 'Bạn'}</p>
                      <p className="leading-relaxed text-sm whitespace-pre-wrap">{m.text}</p>
                    </div>
                  </div>
                ))}
                
                {transcript && (
                  <div className="flex w-full justify-end">
                     <div className="max-w-[85%] rounded-2xl p-4 bg-gradient-to-br from-purple-500/80 to-indigo-600/80 text-white shadow-md">
                       <p className="text-xs font-bold mb-1 opacity-70 uppercase tracking-wider">Đang nháp...</p>
                       <p className="leading-relaxed text-sm whitespace-pre-wrap">{transcript.replace(/\[\.\.\.\]$/, '')}</p>
                     </div>
                   </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            <div className="w-full flex justify-between items-center mt-6">
              <button onClick={abortTest} className="px-4 py-2 text-red-500 font-bold hover:bg-red-50 rounded-xl transition-colors">
                Kết thúc (Không lưu)
              </button>
              <button onClick={finishAndGrade} disabled={grading || messages.length === 0} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                {grading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                Nộp bài & Chấm điểm
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="w-full">
        <FeedbackPanel feedback={feedback} isGrading={grading} defaultDeckId={defaultDeckId} type="speaking" />
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
            {Object.entries(feedback.scores || {}).map(([crit, score]: any) => {
              const critFeedback = feedback.feedback[crit];
              const isObject = typeof critFeedback === 'object' && critFeedback !== null;
              const summaryText = isObject ? critFeedback.summary : critFeedback;
              const detailedReasons = isObject ? critFeedback.detailedReasons || [] : [];
              
              return (
                <div key={crit} className="bg-[var(--bg)] p-3 rounded-xl border border-[var(--border)]">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-black text-${themeColor}-600`}>{crit}</span>
                    <span className="font-bold text-lg">{score}</span>
                  </div>
                  <p className="text-[14px] text-[var(--text-muted)] leading-relaxed">{summaryText}</p>
                  
                  {detailedReasons.length > 0 && (
                    <details className="mt-3 text-sm group cursor-pointer border-t border-[var(--border)] pt-2">
                      <summary className="font-semibold text-[var(--primary)] flex items-center justify-between outline-none select-none">
                        Chi tiết các lỗi mất điểm ({detailedReasons.length})
                        <ChevronRight size={16} className="transform group-open:rotate-90 transition-transform text-[var(--primary)]" />
                      </summary>
                      <ul className="mt-3 space-y-3">
                        {detailedReasons.map((reason: string, i: number) => (
                          <li key={i} className="leading-relaxed bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 flex items-start gap-2">
                            <span className="mt-0.5 text-red-500 font-bold">•</span>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              );
            })}
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
                appAlert(`Đã thêm nhanh ${count} từ vựng Band 8 vào bộ học!`);
              }}
              className={`px-4 py-1.5 bg-${themeColor}-600 text-white text-xs font-bold rounded-lg hover:bg-${themeColor}-700 transition-colors whitespace-nowrap shadow-sm`}
            >
              Lưu tất cả
            </button>
          </div>
        )}

        {/* Bài mẫu Band 8+ tham khảo */}
        {feedback.improvedVersion && (
          <div className="mt-4">
            <h4 className="font-bold text-indigo-600 mb-3 text-sm uppercase tracking-wide border-b border-indigo-100 pb-2 flex items-center gap-1">
              <Sparkles size={14}/> Bài Mẫu Tham Khảo Band 8+
            </h4>
            <div className="flex flex-col gap-3">
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 shadow-inner">
                <p className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                  {feedback.improvedVersion.band8Sample}
                </p>
              </div>
              <div className="p-4 bg-white rounded-xl border border-indigo-100">
                <p className="font-bold text-indigo-800 mb-2 text-base">💡 Điểm khác biệt mấu chốt:</p>
                <p className="text-gray-800 leading-relaxed text-[15px]">{feedback.improvedVersion.differences}</p>
              </div>
            </div>
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
