import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { MainLayout } from '@/components/MainLayout';

export const metadata: Metadata = {
  title: 'VocabMaster — Học từ vựng thông minh',
  description:
    'Ứng dụng học từ vựng miễn phí với thuật toán spaced repetition SM-2, nhiều chế độ học: flashcard, học, kiểm tra, ghép thẻ và gravity.',
  keywords: ['học từ vựng', 'flashcard', 'spaced repetition', 'quizlet', 'anki', 'ielts'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <MainLayout>{children}</MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
