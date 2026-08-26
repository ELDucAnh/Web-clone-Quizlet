import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2, ArrowRight, Check, X, Type, Sparkles, AlertCircle, TrendingUp, MessageSquare } from 'lucide-react';
import type { Card } from '@/lib/types';
import { ProgressBar } from './ProgressBar';

type ConversationItem = 
  | { type: 'repeat_sentence', speaker: string, text: string }
  | { type: 'translate_typing', vietnamese: string, expectedEnglish: string };

interface GrammarError {
  original: string;
  correction: string;
  explanation: string;
}

interface VocabTip {
  studentWord: string;
  betterAlternative: string;
  reason: string;
}

interface TranslationAnalysis {
  score: number;
  grammarErrors: GrammarError[];
  vocabularyTips: VocabTip[];
  structureFeedback: string;
  correctedSentence: string;
}

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
  const [analysis, setAnalysis] = useState<TranslationAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Shared
  const [correctCount, setCorrectCount] = useState(0);

  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);
  const errorCountRef = useRef<number>(0);
  const lastErrorTimeRef = useRef<number>(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const words = cards.map(c => c.term);
    fetch('/api/ai/generate-conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
            alert(`Lỗi Micro liên tục (${event.error}). Vui lòng kiểm tra lại!`);
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

  // Gọi AI phân tích bản dịch
  const analyzeTranslation = async (userText: string, item: Extract<ConversationItem, { type: 'translate_typing' }>) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch('/api/ai/analyze-translation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userTranslation: userText,
          expectedEnglish: item.expectedEnglish,
          vietnameseSentence: item.vietnamese,
        }),
      });
      const data = await res.json();
      if (!data.error) {
        setAnalysis(data);
        // Coi là đúng nếu score >= 60
        setIsTranslationCorrect((data.score ?? 0) >= 60);
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const checkTranslation = () => {
    const item = conversation[currentIdx];
    if (item.type !== 'translate_typing') return;
    setTranslationChecked(true);
    analyzeTranslation(translationInput, item);
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
    setAnalysis(null);

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

  // Score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-green-400';
    if (score >= 60) return 'from-amber-500 to-yellow-400';
    return 'from-red-500 to-rose-400';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
        <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
        <p className="text-[var(--text-muted)] text-sm font-medium">AI đang soạn bài tập dịch từ vựng của bạn...</p>
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
      <div className="flex flex-col gap-5 bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm animate-fade-in">
        <ProgressBar current={currentIdx} total={conversation.length} label={`Câu ${currentIdx + 1}/${conversation.length} (Dịch)`} />
        
        {/* Vietnamese sentence */}
        <div className="mt-2">
          <h3 className="font-bold text-[var(--text-muted)] mb-2 flex items-center gap-2 text-sm">
            <Type size={16} className="text-blue-500" /> Dịch câu sau sang tiếng Anh:
          </h3>
          <p className="text-lg font-semibold text-[var(--text)] bg-[var(--primary-light)] p-4 rounded-xl border border-[var(--primary)]/20 leading-relaxed">
            {currentItem.vietnamese}
          </p>
        </div>

        {/* Translation input */}
        <div>
          <textarea
            ref={textareaRef}
            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl p-4 text-[var(--text)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary-light)] resize-none h-28 transition-all"
            placeholder="Gõ bản dịch tiếng Anh của bạn vào đây..."
            value={translationInput}
            onChange={(e) => setTranslationInput(e.target.value)}
            disabled={translationChecked}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !translationChecked && translationInput.trim()) {
                checkTranslation();
              }
            }}
          />
          {!translationChecked && (
            <p className="text-xs text-[var(--text-muted)] mt-1 ml-1">Ctrl+Enter để kiểm tra nhanh</p>
          )}
        </div>

        {/* AI Analysis Result */}
        {translationChecked && (
          <div className="flex flex-col gap-4 animate-fade-in">
            
            {/* Loading state */}
            {isAnalyzing && (
              <div className="flex items-center gap-3 p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                <Loader2 size={20} className="animate-spin text-[var(--primary)] flex-shrink-0" />
                <div>
                  <p className="font-semibold text-[var(--text)] text-sm">AI đang phân tích bài dịch của bạn...</p>
                  <p className="text-xs text-[var(--text-muted)]">Đang kiểm tra ngữ pháp, từ vựng và cấu trúc câu</p>
                </div>
              </div>
            )}

            {/* Analysis result */}
            {analysis && !isAnalyzing && (
              <div className="flex flex-col gap-4">

                {/* Score header */}
                <div className={`flex items-center gap-4 p-4 rounded-2xl text-white bg-gradient-to-r ${getScoreBg(analysis.score)}`}>
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-black leading-none">{analysis.score}</span>
                    <span className="text-xs font-semibold opacity-80">/ 100</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-base">
                      {analysis.score >= 80 ? '🎉 Xuất sắc!' : analysis.score >= 60 ? '👍 Khá tốt!' : '💪 Cần luyện thêm!'}
                    </p>
                    <p className="text-sm opacity-90 leading-relaxed mt-0.5">{analysis.structureFeedback}</p>
                  </div>
                </div>

                {/* Corrected sentence */}
                {analysis.correctedSentence && analysis.correctedSentence.trim() !== translationInput.trim() && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Check size={16} className="text-emerald-600 flex-shrink-0" />
                      <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Câu đúng hoàn chỉnh</span>
                      <button
                        onClick={() => speak(analysis.correctedSentence)}
                        className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors"
                        title="Nghe phát âm"
                      >
                        <Volume2 size={14} />
                      </button>
                    </div>
                    <p className="text-emerald-800 dark:text-emerald-300 font-medium leading-relaxed">{analysis.correctedSentence}</p>
                  </div>
                )}

                {/* Grammar errors */}
                {analysis.grammarErrors && analysis.grammarErrors.length > 0 && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">Lỗi ngữ pháp ({analysis.grammarErrors.length})</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {analysis.grammarErrors.map((err, i) => (
                        <div key={i} className="text-sm">
                          <div className="flex items-start gap-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded font-mono line-through decoration-red-400">
                              {err.original}
                            </span>
                            <span className="text-[var(--text-muted)]">→</span>
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded font-mono font-semibold">
                              {err.correction}
                            </span>
                          </div>
                          <p className="text-[var(--text-muted)] mt-1 ml-1">{err.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vocabulary tips */}
                {analysis.vocabularyTips && analysis.vocabularyTips.length > 0 && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp size={16} className="text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">Cải thiện từ vựng</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      {analysis.vocabularyTips.map((tip, i) => (
                        <div key={i} className="text-sm">
                          <div className="flex items-start gap-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 rounded font-medium">
                              {tip.studentWord}
                            </span>
                            <span className="text-[var(--text-muted)]">→</span>
                            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded font-semibold">
                              {tip.betterAlternative}
                            </span>
                          </div>
                          <p className="text-[var(--text-muted)] mt-1 ml-1">{tip.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expected answer reference */}
                <div className="p-4 bg-[var(--bg)] rounded-xl border border-[var(--border)]">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={14} className="text-[var(--text-muted)] flex-shrink-0" />
                    <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Đáp án gợi ý từ AI</span>
                    <button
                      onClick={() => speak(currentItem.expectedEnglish)}
                      className="ml-auto w-6 h-6 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--border)] transition-colors"
                    >
                      <Volume2 size={12} />
                    </button>
                  </div>
                  <p className="text-[var(--text)] text-sm leading-relaxed">{currentItem.expectedEnglish}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-center mt-2">
          {!translationChecked ? (
            <button
              onClick={checkTranslation}
              disabled={!translationInput.trim()}
              className="btn-primary w-full max-w-xs py-3 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              Phân tích bài dịch
            </button>
          ) : (
            <button
              onClick={nextItem}
              disabled={isAnalyzing}
              className="btn-primary w-full max-w-xs py-3 disabled:opacity-50"
            >
              Tiếp tục <ArrowRight size={18} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return <div>Unknown exercise type</div>;
}
