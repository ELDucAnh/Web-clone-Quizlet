'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Sparkles, ArrowRight, Check, Loader2, Trash2 } from 'lucide-react';

export default function AIGeneratorPage() {
  const router = useRouter();
  const { importDeck, isHydrated } = useStore();
  const [text, setText] = useState('');
  const [deckName, setDeckName] = useState('');
  const [loading, setLoading] = useState(false);
  const [cards, setCards] = useState<{term: string, definition: string}[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isHydrated) return null;

  const handleGenerate = async () => {
    if (text.trim().length < 10) {
      setError('Văn bản quá ngắn. Vui lòng nhập tối thiểu vài câu.');
      return;
    }
    setError('');
    setLoading(true);
    setCards([]);
    
    try {
      const res = await fetch('/api/ai/generate-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra');
      if (Array.isArray(data) && data.length > 0) {
        setCards(data);
      } else {
        throw new Error('AI không tìm thấy từ vựng nào phù hợp.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (cards.length === 0) return;
    const finalName = deckName.trim() || 'Học phần AI Tạo';
    const deckId = importDeck(finalName, cards);
    setSuccess(true);
    setTimeout(() => router.push(`/study/${deckId}`), 1500);
  };

  const removeCard = (idx: number) => {
    setCards(prev => prev.filter((_, i) => i !== idx));
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-scale-in">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <Check size={40} />
        </div>
        <h2 className="text-xl font-bold">Lưu học phần thành công!</h2>
        <p className="text-gray-500">Đang chuyển đến trang học...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 animate-fade-in pb-12">
      <div className="flex items-center gap-3 bg-gradient-to-r from-purple-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <Sparkles size={32} className="opacity-80" />
        <div className="z-10">
          <h1 className="text-2xl font-bold">AI Tạo Học Phần</h1>
          <p className="text-white/80 text-sm mt-1">Dán văn bản tiếng Anh (Reading/Transcript) vào đây, AI sẽ tự lọc ra các từ vựng đắt giá nhất.</p>
        </div>
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 scale-150">
          <Sparkles size={120} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-bold text-gray-700">Đoạn văn bản tiếng Anh:</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Dán bài đọc IELTS Reading hoặc Listening transcript vào đây..."
          className="w-full h-48 p-4 rounded-xl border border-gray-200 focus:border-purple-500 outline-none resize-y text-[15px]"
        />
        {error && <p className="text-red-500 text-sm font-semibold mt-1">{error}</p>}
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || text.trim().length === 0}
        className="self-end px-8 py-3 bg-gray-900 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
        {loading ? 'Đang phân tích...' : 'Phân tích & Tạo thẻ'}
      </button>

      {cards.length > 0 && (
        <div className="flex flex-col gap-6 mt-8 pt-8 border-t border-gray-200 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Kết quả ({cards.length} thẻ)</h2>
              <p className="text-sm text-gray-500 mt-1">Bạn có thể xóa bớt các từ đã biết trước khi lưu.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((c, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 group">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg text-gray-900 truncate">{c.term}</p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{c.definition}</p>
                </div>
                <button
                  onClick={() => removeCard(i)}
                  className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Xóa thẻ này"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2 mt-4 bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <label className="font-bold text-gray-700">Tên học phần mới:</label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={deckName}
                onChange={e => setDeckName(e.target.value)}
                placeholder="VD: Từ vựng Reading Test 1..."
                className="flex-1 p-3 rounded-xl border border-gray-200 focus:border-purple-500 outline-none"
                maxLength={60}
              />
              <button
                onClick={handleSave}
                disabled={cards.length === 0}
                className="px-8 py-3 bg-purple-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-purple-700 disabled:opacity-50"
              >
                Lưu Học Phần <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
