'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Award, CheckCircle2, AlertTriangle, BookOpen, MessageSquare, Volume2, Calendar, FileText } from 'lucide-react';
import { useStore } from '@/lib/store';
import { LoadingScreen } from '@/components/LoadingScreen';

export default function SpeakingReportPage() {
  const params = useParams();
  const subId = params.id as string;
  const { speakingSubmissions, isHydrated } = useStore();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'feedback' | 'transcript'>('feedback');

  useEffect(() => { setMounted(true); }, []);
  if (!mounted || !isHydrated) return <LoadingScreen />;

  const sub = speakingSubmissions?.[subId];

  if (!sub) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-[var(--text-muted)]">Không tìm thấy bài chấm thi.</p>
        <Link href="/speaking" className="btn-primary mt-4">Về Kho chủ đề</Link>
      </div>
    );
  }

  const fb = sub.aiFeedback;

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full pb-20 animate-fade-in">
      <div className="flex items-center gap-3 p-4">
        <Link href="/speaking" className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[var(--text)]">Kết quả chấm điểm Speaking</h1>
          <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
            <Calendar size={12} /> {new Date(sub.createdAt).toLocaleString('vi-VN')}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 p-4">
        {/* Left Column: Overall Band */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-4">
          <div className="bg-[var(--card)] border border-[var(--border)] p-6 rounded-3xl text-center card-shadow">
            <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Overall Band</h2>
            <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-purple-600">
              {fb?.overallBand?.toFixed(1) || '?'}
            </div>
          </div>
          
          <div className="bg-[var(--card)] border border-[var(--border)] p-4 rounded-2xl flex flex-col gap-3">
            <h3 className="font-bold text-[var(--text)] text-sm mb-1">Tiêu chí chấm</h3>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--text-muted)]">Fluency & Coherence</span>
              <span className="font-bold text-[var(--text)] bg-[var(--bg)] px-2 py-0.5 rounded">{fb?.scores?.FC?.toFixed(1) || '?'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--text-muted)]">Lexical Resource</span>
              <span className="font-bold text-[var(--text)] bg-[var(--bg)] px-2 py-0.5 rounded">{fb?.scores?.LR?.toFixed(1) || '?'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--text-muted)]">Grammar Range</span>
              <span className="font-bold text-[var(--text)] bg-[var(--bg)] px-2 py-0.5 rounded">{fb?.scores?.GRA?.toFixed(1) || '?'}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--text-muted)]">Pronunciation</span>
              <span className="font-bold text-[var(--text)] bg-[var(--bg)] px-2 py-0.5 rounded">{fb?.scores?.PR?.toFixed(1) || '?'}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Feedback Details */}
        <div className="flex-1 bg-[var(--card)] border border-[var(--border)] rounded-3xl overflow-hidden">
          <div className="flex border-b border-[var(--border)] p-2 gap-2">
            <button 
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${activeTab === 'feedback' ? 'bg-[var(--bg)] text-[var(--primary)] shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--bg)]/50'}`}
              onClick={() => setActiveTab('feedback')}
            >
              Nhận xét chi tiết
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-bold rounded-xl transition-colors ${activeTab === 'transcript' ? 'bg-[var(--bg)] text-[var(--primary)] shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--bg)]/50'}`}
              onClick={() => setActiveTab('transcript')}
            >
              Lịch sử hội thoại
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[600px]">
            {activeTab === 'feedback' ? (
              <div className="flex flex-col gap-8 animate-fade-in">
                {/* General Comment */}
                <section>
                  <h3 className="flex items-center gap-2 font-bold text-lg text-[var(--text)] mb-3">
                    <MessageSquare size={20} className="text-[var(--primary)]" /> Nhận xét chung
                  </h3>
                  <div className="p-4 bg-[var(--bg)] rounded-2xl text-[var(--text)] leading-relaxed text-sm">
                    {fb?.generalComment || 'Chưa có nhận xét.'}
                  </div>
                </section>

                {/* Vocabulary Upgrades */}
                {fb?.vocabularyUpgrades && fb.vocabularyUpgrades.length > 0 && (
                  <section>
                    <h3 className="flex items-center gap-2 font-bold text-lg text-[var(--text)] mb-3">
                      <BookOpen size={20} className="text-purple-500" /> Nâng cấp Từ vựng
                    </h3>
                    <div className="flex flex-col gap-3">
                      {fb.vocabularyUpgrades.map((item: any, i: number) => (
                        <div key={i} className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900">
                          <div className="flex items-center gap-2 text-sm mb-2">
                            <span className="text-red-500 line-through">{item.original}</span>
                            <ArrowLeft size={14} className="text-purple-400 rotate-180" />
                            <span className="font-bold text-purple-700 dark:text-purple-400">{item.upgrade}</span>
                          </div>
                          <p className="text-xs text-purple-800/70 dark:text-purple-300/70 leading-relaxed">{item.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Grammar Errors */}
                {fb?.grammarErrors && fb.grammarErrors.length > 0 && (
                  <section>
                    <h3 className="flex items-center gap-2 font-bold text-lg text-[var(--text)] mb-3">
                      <AlertTriangle size={20} className="text-amber-500" /> Lỗi Ngữ pháp
                    </h3>
                    <div className="flex flex-col gap-3">
                      {fb.grammarErrors.map((item: any, i: number) => (
                        <div key={i} className="p-4 bg-amber-50 dark:bg-amber-950/20 rounded-2xl border border-amber-100 dark:border-amber-900">
                          <div className="flex items-center gap-2 text-sm mb-2">
                            <span className="text-red-500 line-through">{item.error}</span>
                            <ArrowLeft size={14} className="text-amber-500 rotate-180" />
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.correction}</span>
                          </div>
                          <p className="text-xs text-amber-800/70 dark:text-amber-300/70 leading-relaxed">{item.explanation}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Improved Version */}
                {fb?.improvedVersion && (
                  <section>
                    <h3 className="flex items-center gap-2 font-bold text-lg text-[var(--text)] mb-3">
                      <Award size={20} className="text-emerald-500" /> Bài mẫu hoàn thiện
                    </h3>
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900 text-sm leading-relaxed text-emerald-900 dark:text-emerald-100 whitespace-pre-wrap">
                      {fb.improvedVersion}
                    </div>
                  </section>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4 animate-fade-in">
                {sub.transcript.split('\n\n').map((line, i) => {
                  const isExaminer = line.startsWith('Examiner:');
                  const text = line.replace(/^(Examiner|Candidate):\s*/, '');
                  if (!text.trim()) return null;
                  
                  return (
                    <div key={i} className={`flex w-full ${isExaminer ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${isExaminer ? 'bg-[var(--bg)] border border-[var(--border)] text-[var(--text)]' : 'bg-[var(--primary)] text-white'}`}>
                        <p className="text-xs font-semibold mb-1 opacity-70 uppercase tracking-wider">{isExaminer ? 'Giám khảo' : 'Bạn'}</p>
                        <p className="leading-relaxed text-sm whitespace-pre-wrap">{text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
