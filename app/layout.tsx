import type { Metadata } from 'next';
import './globals.css';
import { MainLayout } from '@/components/MainLayout';

export const metadata: Metadata = {
  title: 'Quizlu — Học từ vựng IELTS thông minh',
  description:
    'Ứng dụng học từ vựng miễn phí với thuật toán spaced repetition, nhiều chế độ học: flashcard, học, kiểm tra, ghép thẻ và gravity.',
  keywords: ['học từ vựng', 'flashcard', 'spaced repetition', 'quizlet', 'ielts'],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};


import { AuthProvider } from '@/components/AuthProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
