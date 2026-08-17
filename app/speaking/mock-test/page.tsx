'use client';
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, ArrowLeft, Loader2, Send, Check, Play, Square, StopCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';

interface Message {
  role: 'examiner' | 'user';
  text: string;
}

export default function MockTestPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialMode = searchParams.get('mode') || 'Full Test';
  const initialTopic = searchParams.get('customTopic') || '';

  const { createSpeakingSubmission } = useStore();

  const [mode, setMode] = useState(initialMode);
  const [topicStr, setTopicStr] = useState(initialTopic);
  const [hasStarted, setHasStarted] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);
  const [transcript, setTranscript] = useState('');
  const [isExaminerTyping, setIsExaminerTyping] = useState(false);
  const [isTestOver, setIsTestOver] = useState(false);
  const [grading, setGrading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transcript]);

  // Timer for UI
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

  const speak = (text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    window.speechSynthesis.speak(utter);
  };

  const handleExaminerTurn = async (currentHistory: Message[]) => {
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
    handleExaminerTurn([]);
  };

  const toggleRecording = () => {
    window.speechSynthesis.cancel();
    if (isRecording) {
      isRecordingRef.current = false;
      recognitionRef.current?.stop();
      setIsRecording(false);

      if (transcript.trim()) {
        const cleanTrans = transcript.replace(/\[\.\.\.\]$/, '').trim();
        const newMsg: Message = { role: 'user', text: cleanTrans };
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

        const subId = createSpeakingSubmission({
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
        
        router.push(`/speaking/report/${subId}`);
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
    <div className="flex flex-col min-h-screen bg-[var(--bg)] p-4 md:p-8 animate-fade-in">
      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/speaking" className="w-10 h-10 bg-[var(--card)] flex items-center justify-center rounded-xl border border-[var(--border)] hover:border-[var(--primary)] text-[var(--text-muted)] transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-black text-[var(--text)] flex items-center gap-2">
            <Mic className="text-purple-500" /> Phòng thi Nói ảo
          </h1>
        </div>

        {/* Configuration Box */}
        {!hasStarted && (
          <div className="bg-[var(--card)] p-6 rounded-3xl border border-[var(--border)] shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <select 
                className="q-input flex-shrink-0 sm:w-64"
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
            <button onClick={startTest} className="btn-primary w-full py-4 text-lg mt-2">
              Bắt đầu bài thi <Play size={20} className="inline ml-1" fill="currentColor" />
            </button>
          </div>
        )}

        {/* Active Test Area */}
        {hasStarted && (
          <>
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
                    {isRecording ? <StopCircle size={40} fill="currentColor" /> : <Mic size={40} />}
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
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center">
                    <Loader2 size={40} className="animate-spin" />
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text)]">Bài thi kết thúc</h3>
                  <p className="text-[var(--text-muted)]">Hệ thống đang tự động chấm điểm và đánh giá câu trả lời của bạn...</p>
                </div>
              )}
            </div>

            {/* Live Transcript Box */}
            <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm flex flex-col h-[300px]">
              <div className="bg-[var(--bg)] px-4 py-3 border-b border-[var(--border)]">
                <h3 className="text-xs font-bold text-[var(--text-muted)] tracking-wider uppercase">Văn bản bóc băng (Live Transcript)</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[var(--bg)]/50">
                {messages.length === 0 && !transcript && (
                  <p className="text-[var(--text-muted)] text-sm italic opacity-70">Chữ sẽ tự động hiện ở đây khi bạn hoặc giám khảo nói...</p>
                )}
                
                {messages.map((m, i) => (
                  <div key={i} className={`flex w-full ${m.role === 'examiner' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[85%] rounded-2xl p-4 ${m.role === 'examiner' ? 'bg-[var(--card)] border border-[var(--border)] text-[var(--text)]' : 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md'}`}>
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

            <div className="flex justify-between items-center mt-2">
              <button onClick={abortTest} className="px-4 py-2 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                Kết thúc (Không lưu)
              </button>
              <button onClick={finishAndGrade} disabled={grading || messages.length === 0} className="btn-primary py-3 px-6 text-base font-bold shadow-xl shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50">
                {grading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                Nộp bài & Chấm điểm
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
