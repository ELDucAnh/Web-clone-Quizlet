import { useState, useEffect } from 'react';
import { Headphones, Loader2, ArrowRight, Check, X, Play, HelpCircle, FileText } from 'lucide-react';
import type { Card } from '@/lib/types';

interface ListeningData {
  dialogue: { speaker: string; text: string }[];
  questions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
}

interface ListeningPracticeProps {
  cards: Card[];
  onComplete: (correct: number, total: number) => void;
}

export function ListeningPractice({ cards, onComplete }: ListeningPracticeProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ListeningData | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const words = cards.map(c => c.term);
    fetch('/api/ai/generate-listening', {
      method: 'POST',
      body: JSON.stringify({ words })
    })
    .then(res => res.json())
    .then((result: any) => {
      if (result.error) {
        setErrorMsg(result.error);
        alert('Lỗi từ AI (Listening): ' + result.error);
      } else if (result.dialogue && result.questions) {
        setData(result);
        const fullText = result.dialogue.map((d: any) => d.text).join('. ');
        setAudioUrl(`/api/tts?text=${encodeURIComponent(fullText)}`);
        setAnswers(new Array(result.questions.length).fill(-1));
      } else {
        setErrorMsg('Invalid response format from AI');
        alert('Lỗi: AI trả về sai định dạng!');
      }
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setErrorMsg(err.message || 'Network error');
      alert('Lỗi kết nối: ' + err.message);
      setLoading(false);
    });
  }, [cards]);

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
        <p className="text-[var(--text-muted)] text-sm font-medium">AI đang soạn bài nghe IELTS Part 3 từ từ vựng của bạn...</p>
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
        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
          <Headphones size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-[var(--text)]">IELTS Listening Section 3</h2>
          <p className="text-sm text-[var(--text-muted)]">Nghe đoạn hội thoại học thuật và trả lời {data.questions.length} câu hỏi.</p>
        </div>
      </div>

      <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100 flex flex-col items-center justify-center gap-4">
        <p className="font-medium text-purple-900">Audio Bài Nghe</p>
        {audioUrl ? (
          <audio controls className="w-full max-w-md">
            <source src={audioUrl} type="audio/mpeg" />
            Trình duyệt không hỗ trợ audio.
          </audio>
        ) : (
          <p className="text-red-500">Không thể tải Audio</p>
        )}
        {!submitted && <p className="text-sm text-purple-700 mt-2">* Script hội thoại đã bị ẩn. Hãy nghe và chọn đáp án.</p>}
      </div>

      <div className="space-y-8 mt-4">
        {data.questions.map((q, qIdx) => (
          <div key={qIdx} className="bg-[var(--bg)] p-5 rounded-xl border border-[var(--border)]">
            <p className="font-bold text-[var(--text)] mb-4 text-lg flex items-start gap-2">
              <span className="bg-[var(--primary)] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5">{qIdx + 1}</span>
              {q.question}
            </p>
            <div className="space-y-3 pl-8">
              {q.options.map((opt, oIdx) => {
                const isSelected = answers[qIdx] === oIdx;
                const isCorrectAnswer = q.correctAnswer === oIdx;
                
                let optClass = "p-4 rounded-xl border transition-all cursor-pointer ";
                
                if (!submitted) {
                  optClass += isSelected ? "border-[var(--primary)] bg-blue-50 text-blue-800 font-medium shadow-sm" : "border-gray-200 hover:bg-gray-50 text-[var(--text-muted)]";
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
          </div>
        ))}
      </div>

      {submitted && (
        <div className="mt-8 animate-slide-up">
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 text-center mb-6">
            <h3 className="text-2xl font-black text-emerald-700 mb-2">Kết quả: {score}/{data.questions.length}</h3>
            <p className="text-emerald-600 font-medium">Bạn đã hoàn thành bài nghe. Vui lòng đối chiếu với Script bên dưới.</p>
          </div>

          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
            <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg border-b pb-3">
              <FileText size={20} className="text-indigo-500"/> Transcript Hội Thoại
            </h4>
            <div className="space-y-4">
              {data.dialogue.map((d, i) => (
                <p key={i} className="text-[var(--text)] leading-relaxed">
                  <span className="font-bold text-indigo-700 mr-2 bg-indigo-100 px-2 py-0.5 rounded">{d.speaker}:</span>
                  {d.text}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-center mt-8 sticky bottom-4">
        {!submitted ? (
          <button 
            onClick={handleSubmit} 
            disabled={!isAllAnswered} 
            className="btn-primary w-full max-w-sm py-4 text-lg shadow-xl disabled:opacity-50"
          >
            Nộp bài
          </button>
        ) : (
          <button onClick={handleFinish} className="btn-primary w-full max-w-sm py-4 text-lg shadow-xl">
            Tiếp tục <ArrowRight size={20} className="ml-2" />
          </button>
        )}
      </div>
    </div>
  );
}
