'use client';
import { useDialogStore } from '@/lib/dialog';

export function GlobalDialog() {
  const { isOpen, type, message, close } = useDialogStore();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl animate-scale-in flex flex-col">
        <p className="text-gray-800 font-bold text-center text-lg leading-relaxed mb-8">{message}</p>
        <div className="flex w-full gap-3">
          {type === 'confirm' && (
            <button 
              onClick={() => close(false)} 
              className="flex-1 py-3 px-4 rounded-xl bg-gray-100 text-gray-500 font-bold shadow-[0_4px_10px_rgba(0,0,0,0.05)] hover:bg-gray-200 hover:text-gray-700 transition-all active:scale-95"
            >
              Hủy
            </button>
          )}
          <button 
            onClick={() => close(true)} 
            className="flex-1 py-3 px-4 rounded-xl bg-[var(--primary)] text-white font-bold shadow-[0_4px_14px_rgba(66,85,255,0.4)] hover:bg-[var(--primary-hover)] transition-all active:scale-95"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
}
