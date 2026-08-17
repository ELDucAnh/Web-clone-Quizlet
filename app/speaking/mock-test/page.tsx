'use client';
import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, ArrowLeft, Loader2, Send, Check } from 'lucide-react';
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
  const mode = searchParams.get('mode') || 'Full Test';
  const topicId = searchParams.get('topicId') || '';

  const { speakingTopics, createSpeakingSubmission } = useStore();
  const topicObj = speakingTopics[topicId];
  const topicStr = topicObj ? topicObj.topic : 'General IELTS Speaking';

  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isExaminerTyping, setIsExaminerTyping] = useState(false);
  const [isTestOver, setIsTestOver] = useState(false);
  const [grading, setGrading] = useState(false);

  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transcript]);

  useEffect(() => {
    // Initial start
    if (messages.length === 0) {
      handleExaminerTurn([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTrans = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTrans += event.results[i][0].transcript;
          }
        }
        if (finalTrans) {
          setTranscript(prev => prev + ' ' + finalTrans);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const speak = (text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    // When examiner finishes speaking, you can auto-start recording if needed, 
    // but better let user manually click to avoid accidental noise.
    window.speechSynthesis.speak(utter);
  };

  const handleExaminerTurn = async (currentHistory: Message[]) => {
    setIsExaminerTyping(true);
    try {
      const res = await fetch('/api/ai/speaking-examiner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: currentHistory, mode, topic: topicStr })
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

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript('');
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const submitTurn = () => {
    if (!transcript.trim()) return;
    const newMsg: Message = { role: 'user', text: transcript.trim() };
    const newHistory = [...messages, newMsg];
    setMessages(newHistory);
    setTranscript('');
    handleExaminerTurn(newHistory);
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
        // Save submission
        const subId = createSpeakingSubmission({
          part: mode.includes('1') ? 1 : mode.includes('2') ? 2 : mode.includes('3') ? 3 : 1, // Defaulting to 1 for Full Test or parsing from mode string if needed
          topic: topicStr,
          transcript: fullTranscript,
          band: data.overallBand,
          aiFeedback: data,
        });
        
        router.push(`/speaking/report/${subId}`);
      }
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi chấm bài');
    } finally {
      setGrading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto w-full bg-[var(--bg)]">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-[var(--card)] border-b border-[var(--border)]">
        <Link href="/speaking" className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-bold text-[var(--text)]">Mock Test: {mode}</h1>
          <p className="text-xs text-[var(--text-muted)]">{topicStr}</p>
        </div>
        {isTestOver && (
          <button onClick={finishAndGrade} disabled={grading} className="btn-primary ml-auto flex items-center gap-2">
            {grading ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />} 
            Chấm điểm
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex w-full ${m.role === 'examiner' ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${m.role === 'examiner' ? 'bg-[var(--card)] border border-[var(--border)] text-[var(--text)]' : 'bg-[var(--primary)] text-white'}`}>
              <p className="text-sm font-semibold mb-1 opacity-70 uppercase tracking-wider">{m.role === 'examiner' ? 'Giám khảo' : 'Bạn'}</p>
              <p className="leading-relaxed">{m.text}</p>
            </div>
          </div>
        ))}
        {isExaminerTyping && (
           <div className="flex w-full justify-start">
             <div className="max-w-[80%] rounded-2xl p-4 bg-[var(--card)] border border-[var(--border)] text-[var(--text-muted)] flex items-center gap-2">
               <Loader2 size={16} className="animate-spin" /> Giám khảo đang suy nghĩ...
             </div>
           </div>
        )}
        {transcript && !isRecording && (
          <div className="flex w-full justify-end">
             <div className="max-w-[80%] rounded-2xl p-4 bg-[var(--primary)] text-white opacity-80">
               <p className="text-sm font-semibold mb-1 opacity-70 uppercase tracking-wider">Nháp</p>
               <p className="leading-relaxed">{transcript}</p>
             </div>
           </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Controls */}
      <div className="p-4 bg-[var(--card)] border-t border-[var(--border)]">
        {!isTestOver ? (
          <div className="flex flex-col items-center gap-4 max-w-lg mx-auto">
            {isRecording && (
              <div className="w-full bg-[var(--bg)] p-3 rounded-xl min-h-[60px] text-[var(--text)] text-sm">
                <span className="animate-pulse inline-block w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                {transcript || 'Đang nghe...'}
              </div>
            )}
            
            <div className="flex items-center gap-3 w-full justify-center">
              <button 
                onClick={toggleRecording}
                disabled={isExaminerTyping}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-[var(--primary)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100'}`}
              >
                {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              
              {!isRecording && transcript && (
                <button onClick={submitTurn} className="h-16 px-6 rounded-full bg-emerald-500 text-white font-bold shadow-lg hover:scale-105 transition-all flex items-center gap-2">
                  Gửi <Send size={18} />
                </button>
              )}
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              {isRecording ? 'Nhấn để dừng ghi âm' : 'Nhấn nút Micro để trả lời Giám khảo'}
            </p>
          </div>
        ) : (
          <div className="text-center py-4">
            <h3 className="font-bold text-[var(--text)] mb-2">Bài thi kết thúc</h3>
            <p className="text-sm text-[var(--text-muted)] mb-4">Bạn đã hoàn thành bài thi. Nhấn nút &quot;Chấm điểm&quot; ở góc phải phía trên để xem kết quả.</p>
          </div>
        )}
      </div>
    </div>
  );
}
