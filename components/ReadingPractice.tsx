import { useState, useEffect } from 'react';
import { BookOpen, Loader2, ArrowRight, Check, X, HelpCircle, Info } from 'lucide-react';
import type { Card } from '@/lib/types';

interface ReadingData {
  title: string;
  paragraphs: string[];
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }[];
}

interface ReadingPracticeProps {
  cards: Card[];
  onComplete: (correct: number, total: number) => void;
}

export function ReadingPractice({ cards, onComplete }: ReadingPracticeProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ReadingData | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>('Đang khởi động hệ thống...');
  const [loadingPhase2, setLoadingPhase2] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const generatePipeline = async () => {
      try {
        const words = cards.map(c => c.term);
        
        setLoadingStep('Bước 1/5: Đang viết đoạn mở bài (20% hoàn thành)...');
        const res1 = await fetch('/api/ai/reading-pipeline/passage', { method: 'POST', body: JSON.stringify({ words, part: 1 }) });
        const part1 = await res1.json();
        if (part1.error) throw new Error(part1.error);
        
        if (!isMounted) return;
        setLoadingStep('Bước 2/5: Đang viết đoạn thân bài (40% hoàn thành)...');
        const res2 = await fetch('/api/ai/reading-pipeline/passage', { method: 'POST', body: JSON.stringify({ words, part: 2, previousContext: part1.paragraphs.join('\\n\\n') }) });
        const part2 = await res2.json();
        if (part2.error) throw new Error(part2.error);
        
        if (!isMounted) return;
        setLoadingStep('Bước 3/5: Đang viết đoạn kết bài (60% hoàn thành)...');
        const res3 = await fetch('/api/ai/reading-pipeline/passage', { method: 'POST', body: JSON.stringify({ words, part: 3, previousContext: [...part1.paragraphs, ...part2.paragraphs].join('\\n\\n') }) });
        const part3 = await res3.json();
        if (part3.error) throw new Error(part3.error);

        const fullParagraphs = [...part1.paragraphs, ...part2.paragraphs, ...part3.paragraphs];
        
        if (!isMounted) return;
        setLoadingStep('Bước 4/5: Đang soạn 10 câu hỏi đầu (80% hoàn thành)...');
        const res4 = await fetch('/api/ai/reading-pipeline/questions-phase1', { method: 'POST', body: JSON.stringify({ paragraphs: fullParagraphs }) });
        const q1 = await res4.json();
        if (q1.error) throw new Error(q1.error);

        if (!isMounted) return;
        setLoadingStep('Bước 5/5: Đang soạn 10 câu khó cuối cùng (100% hoàn thành)...');
        const res5 = await fetch('/api/ai/reading-pipeline/questions-phase2', { method: 'POST', body: JSON.stringify({ paragraphs: fullParagraphs }) });
        const q2 = await res5.json();
        if (q2.error) throw new Error(q2.error);

        if (isMounted) {
          setData({
            title: part1.title,
            paragraphs: fullParagraphs,
            questions: [...q1.questions, ...q2.questions]
          });
          setAnswers(new Array(q1.questions.length + q2.questions.length).fill(-1));
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error(err);
          setErrorMsg(err.message || 'Pipeline Error');
          alert('Lỗi Pipeline (Reading): ' + err.message);
          setLoading(false);
        }
      }
    };
    generatePipeline();
    return () => { isMounted = false; };
  }, [cards]);

  const handleLoadPhase2 = async () => {
    // Không dùng nữa vì giờ pipeline đã làm 20 câu 1 lúc
  };

  const handleSubmit = () => {
    if (!data) return;
    let correct = 0;
    data.questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });
    setScore(correct);
    setSubmitted(true);
  };

  const handleFinish = () => {
    if (!data) return;
    onComplete(score, data.questions.length);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[var(--card)] rounded-2xl border border-[var(--border)]">
        <Loader2 size={32} className="animate-spin text-[var(--primary)]" />
        <p className="text-[var(--text-muted)] text-sm font-medium">{loadingStep}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-10 font-bold text-red-500">
        Lỗi tạo bài tập. Vui lòng thử lại.<br/>
        <span className="text-sm font-normal text-gray-500 mt-2 block">Chi tiết lỗi: {errorMsg}</span>
      </div>
    );
  }

  const isAllAnswered = answers.every(a => a !== -1);

  return (
    <div className="flex flex-col gap-6 bg-[var(--card)] p-6 rounded-2xl border border-[var(--border)] shadow-sm animate-fade-in">
      <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
          <BookOpen size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--text)]">IELTS Reading Passage 3</h2>
          <p className="text-sm text-[var(--text-muted)]">Đọc văn bản học thuật và trả lời {data.questions.length} câu hỏi khó.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Cột trái: Bài đọc */}
        <div className="w-full lg:w-7/12 lg:sticky lg:top-4 lg:max-h-[85vh] overflow-y-auto custom-scrollbar pr-2 pb-10">
          <div className="bg-blue-50 p-6 or p-8 rounded-2xl border border-blue-100 shadow-inner h-full">
            <h3 className="text-2xl font-black text-blue-900 mb-6 text-center leading-snug">{data.title}</h3>
            <div className="space-y-4 text-[var(--text)] text-left leading-relaxed">
              {data.paragraphs.map((p, i) => (
                <p key={i} className="text-[15px] indent-6">{p}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Cột phải: Câu hỏi */}
        <div className="w-full lg:w-5/12 flex flex-col gap-6">
          {submitted && (
            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 text-center mb-2 shrink-0">
              <h3 className="text-2xl font-black text-emerald-700 mb-2">Kết quả: {score}/{data.questions.length}</h3>
              <p className="text-emerald-600 font-medium">Kéo xuống để xem giải thích chi tiết từng câu.</p>
            </div>
          )}

          {data.questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-[var(--bg)] p-5 rounded-xl border border-[var(--border)] shrink-0">
              <p className="font-bold text-[var(--text)] mb-4 text-lg flex items-start gap-2">
                <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5">{qIdx + 1}</span>
                {q.question}
              </p>
              <div className="space-y-3 pl-8">
                {q.options.map((opt, oIdx) => {
                  const isSelected = answers[qIdx] === oIdx;
                  const isCorrectAnswer = q.correctAnswer === oIdx;
                  
                  let optClass = "p-4 rounded-xl border transition-all cursor-pointer ";
                  
                  if (!submitted) {
                    optClass += isSelected ? "border-blue-500 bg-blue-50 text-blue-800 font-medium shadow-sm" : "border-gray-200 hover:bg-gray-50 text-[var(--text-muted)]";
                  } else {
                    if (isCorrectAnswer) optClass += "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold";
                    else if (isSelected && !isCorrectAnswer) optClass += "border-red-500 bg-red-50 text-red-800 line-through";
                    else optClass += "border-gray-100 opacity-50";
                  }

                  return (
                    <div key={oIdx} className={optClass} onClick={() => {
                      if (submitted) return;
                      const newAns = [...answers];
                      newAns[qIdx] = oIdx;
                      setAnswers(newAns);
                    }}>
                      {opt}
                    </div>
                  );
                })}
              </div>
              
              {submitted && (
                <div className="mt-4 pl-8 animate-fade-in">
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800">
                    <p className="font-bold mb-1 flex items-center gap-2"><Info size={16}/> Giải thích:</p>
                    <p className="text-sm leading-relaxed">{q.explanation}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          <div className="flex flex-col gap-3 justify-center mt-6 sticky bottom-0 bg-[var(--card)] py-4 shrink-0 border-t border-[var(--border)] z-10">

            {!submitted ? (
              <button 
                onClick={handleSubmit} 
                disabled={!isAllAnswered} 
                className="btn-primary w-full py-4 text-lg shadow-xl disabled:opacity-50 bg-blue-600 hover:bg-blue-700"
              >
                Nộp bài
              </button>
            ) : (
              <button onClick={handleFinish} className="btn-primary w-full py-4 text-lg shadow-xl bg-blue-600 hover:bg-blue-700">
                Tiếp tục <ArrowRight size={20} className="ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
