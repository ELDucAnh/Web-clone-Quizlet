export function LoadingScreen({ message = "Đang tải dữ liệu..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[var(--bg)] animate-fade-in">
      <div className="dot-flashing mb-8">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
      <p className="text-sm font-semibold gradient-text-primary tracking-wide animate-pulse">
        {message}
      </p>
    </div>
  );
}
