import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2, ArrowRight, Check, X, ArrowLeft } from 'lucide-react';
import type { Card } from '@/lib/types';
import { ProgressBar } from './ProgressBar';

interface Message {
  speaker: string;
  text: string;
}

interface ConversationPracticeProps {
  cards: Card[];
  onComplete: (correct: number, total: number) => void;
}

export function ConversationPractice({ cards, onComplete }: ConversationPracticeProps) {
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [currentMsgIdx, setCurrentMsgIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorWords, setErrorWords] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Generate conversation
    const words = cards.map(c => c.term);
    fetch('/api/ai/generate-conversation', {
      method: 'POST',
      body: JSON.stringify({ words })
    })
    .then(res => res.json())
    .then(data => {
      if (data.conversation) {
        setConversation(data.conversation);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [cards]);

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

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      checkPronunciation();
    } else {
      setTranscript('');
      setErrorWords([]);
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const checkPronunciation = () => {
    if (!conversation[currentMsgIdx]) return;
    const targetText = conversation[currentMsgIdx].text.toLowerCase().replace(/[^\w\s]/gi, '');
    const spokenText = transcript.toLowerCase().replace(/[^\w\s]/gi, '');
    
    const targetWords = targetText.split(/\s+/).filter(Boolean);
    const spokenWords = spokenText.split(/\s+/).filter(Boolean);
    
    // Very basic check: which target words are missing in spoken text
    const missing = targetWords.filter(w => !spokenWords.includes(w));
    setErrorWords(missing);
  };

  const nextMessage = () => {
    setTranscript('');
    setErrorWords([]);
    if (currentMsgIdx + 1 < conversation.length) {
      setCurrentMsgIdx(i => i + 1);
    } else {
      onComplete(cards.length, cards.length);
    }
  };

  const speak = (text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'en-US';
    window.speechSynthesis.speak(utter);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
        <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
        <p className="text-[var(--text-muted)] text-sm font-medium">AI đang tạo kịch bản hội thoại từ từ vựng của bạn...</p>
      </div>
    );
  }

  if (conversation.length === 0) {
    return <div className="text-center py-10">Lỗi tạo hội thoại.</div>;
  }

  const currentMsg = conversation[currentMsgIdx];
  const words = currentMsg.text.split(' ');

  return (
    <div className="flex flex-col gap-6 bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
      <ProgressBar current={currentMsgIdx} total={conversation.length} label={`Câu ${currentMsgIdx + 1}/${conversation.length}`} />
      
      <div className="flex items-start gap-4 mt-4">
        <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] text-[var(--primary)] font-bold flex items-center justify-center flex-shrink-0">
          {currentMsg.speaker}
        </div>
        <div className="flex-1">
          <p className="text-xl font-medium text-[var(--text)] leading-relaxed">
            {words.map((w, i) => {
              const cleanWord = w.toLowerCase().replace(/[^\w]/g, '');
              const isError = errorWords.includes(cleanWord);
              return (
                <span key={i} className={isError ? "text-red-500 font-bold underline decoration-red-200 decoration-2 underline-offset-4" : ""}>
                  {w}{' '}
                </span>
              );
            })}
          </p>
          <div className="flex items-center gap-2 mt-3">
             <button onClick={() => speak(currentMsg.text)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors" title="Nghe người bản xứ đọc">
               <Volume2 size={16} />
             </button>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col items-center gap-4">
        <p className="text-sm font-medium text-[var(--text-muted)]">Đọc to câu trên để kiểm tra phát âm</p>
        
        <button 
          onClick={toggleRecording}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-[var(--primary)] hover:scale-105'}`}
        >
          {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
        </button>

        {transcript && !isRecording && (
          <div className="w-full bg-[var(--bg)] p-4 rounded-xl text-center">
            <p className="text-sm text-[var(--text-muted)] mb-1">Bạn đã đọc:</p>
            <p className="text-[var(--text)] font-medium">"{transcript}"</p>
            {errorWords.length > 0 ? (
              <p className="text-red-500 text-sm mt-2 font-bold"><X size={14} className="inline mr-1"/> Phát âm sai hoặc thiếu từ bị bôi đỏ</p>
            ) : (
              <p className="text-emerald-500 text-sm mt-2 font-bold"><Check size={14} className="inline mr-1"/> Phát âm rất tốt!</p>
            )}
          </div>
        )}

        {(!isRecording && transcript) && (
          <button onClick={nextMessage} className="btn-primary w-full max-w-xs mt-4 py-3">
            Tiếp tục <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
}
