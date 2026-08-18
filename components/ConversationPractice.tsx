import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2, ArrowRight, Check, X, Play, Type, Headphones, HelpCircle } from 'lucide-react';
import type { Card } from '@/lib/types';
import { ProgressBar } from './ProgressBar';

type ConversationItem = 
  | { type: 'repeat_sentence', speaker: string, text: string }
  | { type: 'translate_typing', vietnamese: string, expectedEnglish: string };

interface ConversationPracticeProps {
  cards: Card[];
  onComplete: (correct: number, total: number) => void;
}

export function ConversationPractice({ cards, onComplete }: ConversationPracticeProps) {
  const [loading, setLoading] = useState(true);
  const [conversation, setConversation] = useState<ConversationItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // States for repeat_sentence
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorWords, setErrorWords] = useState<string[]>([]);
  
  // States for translate_typing
  const [translationInput, setTranslationInput] = useState('');
  const [translationChecked, setTranslationChecked] = useState(false);
  const [isTranslationCorrect, setIsTranslationCorrect] = useState(false);


  // Shared
  const [correctCount, setCorrectCount] = useState(0);

  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);
  const errorCountRef = useRef<number>(0);
  const lastErrorTimeRef = useRef<number>(0);

  useEffect(() => {
    const words = cards.map(c => c.term);
    fetch('/api/ai/generate-conversation', {
      method: 'POST',
      body: JSON.stringify({ words })
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert('Lỗi từ AI (Conversation): ' + data.error);
        setConversation([]);
      } else if (data.conversation && Array.isArray(data.conversation)) {
        setConversation(data.conversation);
      } else {
        alert('Lỗi: AI trả về sai định dạng!');
        setConversation([]);
      }
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      alert('Lỗi kết nối: ' + err.message);
      setLoading(false);
    });
  }, [cards]);

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
          try { recognition.start(); } catch (e) {}
        }
      };

      recognitionRef.current = recognition;
      return recognition;
    }
    return null;
  };

  const toggleRecording = () => {
    if (isRecording) {
      isRecordingRef.current = false;
      recognitionRef.current?.stop();
      setIsRecording(false);
      checkPronunciation();
    } else {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e) {}
      }
      const recognition = initSpeechRecognition();
      if (!recognition) {
        alert("Trình duyệt của bạn không hỗ trợ thu âm.");
        return;
      }
      isRecordingRef.current = true;
      setTranscript('');
      try { recognition.start(); } catch(e) {}
      setIsRecording(true);
    }
  };

  const checkPronunciation = () => {
    const item = conversation[currentIdx];
    if (item.type !== 'repeat_sentence') return;
    const targetText = item.text.toLowerCase().replace(/[^\w\s]/gi, '');
    const spokenText = transcript.toLowerCase().replace(/[^\w\s]/gi, '');
    const targetWords = targetText.split(/\s+/).filter(Boolean);
    const spokenWords = spokenText.split(/\s+/).filter(Boolean);
    const missing = targetWords.filter(w => !spokenWords.includes(w));
    setErrorWords(missing);
  };

  const checkTranslation = () => {
    const item = conversation[currentIdx];
    if (item.type !== 'translate_typing') return;
    
    // Very basic validation: Check if user included key vocabulary words
    const expectedWords = item.expectedEnglish.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/).filter(Boolean);
    const userWords = translationInput.toLowerCase().replace(/[^\w\s]/gi, '').split(/\s+/).filter(Boolean);
    
    // Find intersection. If they got at least 50% of the words, we consider it a pass for learning purposes.
    const intersection = expectedWords.filter(w => userWords.includes(w));
    const isCorrect = intersection.length >= expectedWords.length * 0.5;
    
    setIsTranslationCorrect(isCorrect);
    setTranslationChecked(true);
  };

  const nextItem = () => {
    let wasCorrect = false;
    const item = conversation[currentIdx];
    
    if (item.type === 'repeat_sentence') {
      wasCorrect = transcript.length > 0 && errorWords.length <= 2;
    } else if (item.type === 'translate_typing') {
      wasCorrect = isTranslationCorrect;
    }

    if (wasCorrect) setCorrectCount(c => c + 1);
    
    // Reset states
    setTranscript('');
    setErrorWords([]);
    setTranslationInput('');
    setTranslationChecked(false);
    setIsTranslationCorrect(false);

    if (currentIdx + 1 < conversation.length) {
      setCurrentIdx(i => i + 1);
    } else {
      onComplete(correctCount + (wasCorrect ? 1 : 0), conversation.length);
    }
  };

  const speak = (text: string) => {
    const url = `/api/tts?text=${encodeURIComponent(text)}`;
    const audio = new Audio(url);
    audio.play().catch(e => console.error("Audio play failed:", e));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
        <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
        <p className="text-[var(--text-muted)] text-sm font-medium">AI đang soạn 20 bài tập ngẫu nhiên từ từ vựng của bạn...</p>
      </div>
    );
  }

  if (conversation.length === 0) {
    return <div className="text-center py-10 font-bold text-red-500">Lỗi tạo bài tập. Bộ từ vựng cần có ít nhất 1 từ.</div>;
  }

  const currentItem = conversation[currentIdx];

  // 1. Render Repeat Sentence
  if (currentItem.type === 'repeat_sentence') {
    const words = currentItem.text.split(' ');
    const spokenTextLower = transcript.toLowerCase().replace(/[^\w\s]/gi, '');
    const spokenWordsArray = spokenTextLower.split(/\s+/).filter(Boolean);

    return (
      <div className="flex flex-col gap-6 bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm animate-fade-in">
        <ProgressBar current={currentIdx} total={conversation.length} label={`Câu ${currentIdx + 1}/${conversation.length} (Đọc)`} />
        
        <div className="flex items-start gap-4 mt-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold flex items-center justify-center flex-shrink-0 shadow-md">
            {currentItem.speaker}
          </div>
          <div className="flex-1">
            <p className="text-xl font-medium text-[var(--text)] leading-relaxed">
              {words.map((w, i) => {
                const cleanWord = w.toLowerCase().replace(/[^\w]/g, '');
                const isSpoken = spokenWordsArray.includes(cleanWord);
                const isError = errorWords.includes(cleanWord);
                let colorClass = "";
                if (isSpoken) colorClass = "text-emerald-500 font-bold drop-shadow-sm transition-colors";
                else if (!isRecording && transcript && !isSpoken) colorClass = "text-red-500 font-bold underline decoration-red-200 decoration-2 underline-offset-4 transition-colors";
                return <span key={i} className={colorClass}>{w} </span>;
              })}
            </p>
            <div className="flex items-center gap-2 mt-3">
               <button onClick={() => speak(currentItem.text)} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors" title="Nghe người bản xứ đọc">
                 <Volume2 size={16} />
               </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--border)] flex flex-col items-center gap-4">
          <p className="text-sm font-medium text-[var(--text-muted)]">Đọc to câu trên để kiểm tra phát âm</p>
          <button onClick={toggleRecording} className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${isRecording ? 'bg-red-500 animate-pulse scale-110' : 'bg-[var(--primary)] hover:scale-105'}`}>
            {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
          </button>

          {isRecording && transcript && (
            <div className="w-full bg-[var(--bg)] p-4 rounded-xl text-center">
              <p className="text-[var(--text)] font-medium">&quot;{transcript.replace(/\[\.\.\.\]$/, '')}&quot;</p>
            </div>
          )}

          {transcript && !isRecording && (
            <div className="w-full bg-[var(--bg)] p-4 rounded-xl text-center">
              <p className="text-[var(--text)] font-medium">&quot;{transcript.replace(/\[\.\.\.\]$/, '')}&quot;</p>
              {errorWords.length > 0 ? (
                <p className="text-red-500 text-sm mt-2 font-bold"><X size={14} className="inline mr-1"/> Phát âm sai hoặc thiếu từ bị bôi đỏ</p>
              ) : (
                <p className="text-emerald-500 text-sm mt-2 font-bold"><Check size={14} className="inline mr-1"/> Phát âm rất tốt!</p>
              )}
            </div>
          )}

          {(!isRecording && transcript) && (
            <button onClick={nextItem} className="btn-primary w-full max-w-xs mt-4 py-3">Tiếp tục <ArrowRight size={18} /></button>
          )}
        </div>
      </div>
    );
  }

  // 2. Render Translate Typing
  if (currentItem.type === 'translate_typing') {
    return (
      <div className="flex flex-col gap-6 bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm animate-fade-in">
        <ProgressBar current={currentIdx} total={conversation.length} label={`Câu ${currentIdx + 1}/${conversation.length} (Dịch)`} />
        
        <div className="mt-4">
          <h3 className="font-bold text-[var(--text-muted)] mb-2 flex items-center gap-2">
            <Type size={18} className="text-blue-500" /> Dịch câu sau sang tiếng Anh:
          </h3>
          <p className="text-xl font-medium text-[var(--text)] bg-blue-50 p-4 rounded-xl border border-blue-100">{currentItem.vietnamese}</p>
        </div>

        <div className="mt-4">
          <textarea
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4 text-[var(--text)] focus:outline-none focus:border-[var(--primary)] resize-none h-32"
            placeholder="Gõ bản dịch tiếng Anh của bạn vào đây..."
            value={translationInput}
            onChange={(e) => setTranslationInput(e.target.value)}
            disabled={translationChecked}
          />
        </div>

        {translationChecked && (
          <div className={`p-4 rounded-xl border ${isTranslationCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
            <p className={`font-bold flex items-center gap-2 mb-2 ${isTranslationCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
              {isTranslationCorrect ? <><Check size={18} /> Khá tốt!</> : <><X size={18} /> Cần cố gắng hơn</>}
            </p>
            <p className="text-sm text-[var(--text-muted)]">Đáp án gợi ý từ AI:</p>
            <p className="font-medium text-[var(--text)]">{currentItem.expectedEnglish}</p>
          </div>
        )}

        <div className="flex justify-center mt-4">
          {!translationChecked ? (
            <button onClick={checkTranslation} disabled={!translationInput.trim()} className="btn-primary w-full max-w-xs py-3 disabled:opacity-50">
              Kiểm tra
            </button>
          ) : (
            <button onClick={nextItem} className="btn-primary w-full max-w-xs py-3">
              Tiếp tục <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    );
  }



  return <div>Unknown exercise type</div>;
}
