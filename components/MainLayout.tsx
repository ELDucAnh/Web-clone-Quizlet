'use client';
import { useState } from 'react';
import { X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { useStore } from '@/lib/store';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { LandingPage } from './LandingPage';
import { LoadingScreen } from './LoadingScreen';
import { GlobalDialog } from './GlobalDialog';

interface CreateFolderModalProps {
  onClose: () => void;
}

function CreateFolderModal({ onClose }: CreateFolderModalProps) {
  const { createFolder } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createFolder(name.trim(), description.trim());
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-md bg-[var(--card)] rounded-2xl shadow-2xl animate-scale-in pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
            <h2 className="font-bold text-lg text-[var(--text)]">Tạo thư mục mới</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg)] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[var(--text)]">
                Tên thư mục <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: IELTS Vocabulary, TOEIC Prep..."
                maxLength={80}
                autoFocus
                className="q-input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-[var(--text)]">
                Mô tả <span className="text-[var(--text-muted)] font-normal">(tùy chọn)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả nội dung thư mục..."
                maxLength={200}
                rows={3}
                className="q-input resize-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose} className="btn-ghost flex-1">
                Hủy
              </button>
              <button
                type="submit"
                disabled={!name.trim()}
                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tạo thư mục
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarCollapsed, hydrate, clearData } = useStore() as any;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/user-data')
        .then((res) => res.json())
        .then((data) => {
          if (!data.error) {
            hydrate(data);
          }
        })
        .catch((err) => console.error('Failed to hydrate data', err));
    } else if (status === 'unauthenticated') {
      clearData();
    }
  }, [status, hydrate, clearData]);

  const isAuthenticated = status === 'authenticated';
  const isUnauthenticated = status === 'unauthenticated';
  const isLoading = status === 'loading';

  if (isLoading) {
    return <LoadingScreen />;
  }

  // Full-screen landing page when unauthenticated — no sidebar, no navbar
  if (isUnauthenticated) {
    return (
      <>
        <LandingPage />
        {/* No sidebar or topbar */}
      </>
    );
  }

  return (
    <div className="app-shell">
      {isAuthenticated && (
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
          showCreateFolderModal={() => setShowCreateFolder(true)}
        />
      )}

      <div 
        className={`app-main ${sidebarCollapsed && isAuthenticated ? 'sidebar-collapsed' : ''}`}
      >
        <TopNavbar
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
          onCreateFolder={() => setShowCreateFolder(true)}
        />
        <div className="app-content">
          {children}
        </div>
      </div>

      {showCreateFolder && isAuthenticated && (
        <CreateFolderModal onClose={() => setShowCreateFolder(false)} />
      )}
      <GlobalDialog />
    </div>
  );
}
