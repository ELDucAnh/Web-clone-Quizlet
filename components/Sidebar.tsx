'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home,
  Library,
  Folder,
  Plus,
  ChevronLeft,
  ChevronRight,
  Users,
  Bell,
  Settings,
  CreditCard,
  Zap,
  Gamepad2,
  X,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useStore } from '@/lib/store';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
}

function NavItem({ href, icon, label, active, collapsed }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`sidebar-nav-item ${active ? 'active' : ''}`}
      title={collapsed ? label : undefined}
    >
      <span className="nav-icon flex-shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  showCreateFolderModal?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose, showCreateFolderModal }: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { folders, sidebarCollapsed, toggleSidebar } = useStore();
  const folderList = Object.values(folders).sort((a, b) => b.createdAt - a.createdAt);
  const collapsed = sidebarCollapsed;

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* ── Brand Header ─────────────────────────────────────── */}
        <div className="h-[60px] flex items-center justify-between px-3 border-b border-[var(--border)] flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2.5 overflow-hidden min-w-0"
            onClick={onMobileClose}
          >
            <div className="w-8 h-8 bg-[var(--quizlet-blue)] text-white rounded-lg flex items-center justify-center font-black text-base flex-shrink-0">
              Q
            </div>
            {!collapsed && (
              <span className="font-bold text-[15px] text-[var(--text)] tracking-tight truncate">
                VocabMaster
              </span>
            )}
          </Link>

          {/* Toggle collapse button (desktop only) */}
          <button
            onClick={toggleSidebar}
            className="hidden md:flex w-7 h-7 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)] transition-colors flex-shrink-0 ml-1"
            aria-label={collapsed ? 'Mở rộng menu' : 'Thu nhỏ menu'}
          >
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>

          {/* Mobile close button */}
          {mobileOpen && (
            <button
              onClick={onMobileClose}
              className="md:hidden w-7 h-7 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg)]"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* ── Main Navigation ───────────────────────────────────── */}
        <nav className="p-2 space-y-0.5 flex-shrink-0">
          <NavItem
            href="/"
            icon={<Home size={18} />}
            label="Trang chủ"
            active={pathname === '/'}
            collapsed={collapsed}
          />
          <NavItem
            href="/library"
            icon={<Library size={18} />}
            label="Thư viện của bạn"
            active={pathname.startsWith('/library')}
            collapsed={collapsed}
          />
          <NavItem
            href="/library?tab=groups"
            icon={<Users size={18} />}
            label="Nhóm học"
            active={false}
            collapsed={collapsed}
          />
          <NavItem
            href="/library?tab=notifications"
            icon={<Bell size={18} />}
            label="Thông báo"
            active={false}
            collapsed={collapsed}
          />
        </nav>

        {/* ── Divider ───────────────────────────────────────────── */}
        {!collapsed && (
          <div className="mx-3 my-1 border-t border-[var(--border)]" />
        )}

        {/* ── Study Modes ───────────────────────────────────────── */}
        <nav className="p-2 space-y-0.5 flex-shrink-0">
          {!collapsed && (
            <p className="px-3 pt-1 pb-0.5 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Trò chơi
            </p>
          )}
          <NavItem
            href="/library?mode=flashcard"
            icon={<CreditCard size={18} />}
            label="Thẻ ghi nhớ"
            active={false}
            collapsed={collapsed}
          />
          <NavItem
            href="/library?mode=learn"
            icon={<Zap size={18} />}
            label="Học"
            active={false}
            collapsed={collapsed}
          />
          <NavItem
            href="/library?mode=match"
            icon={<Gamepad2 size={18} />}
            label="Trò chơi ghép thẻ"
            active={false}
            collapsed={collapsed}
          />
        </nav>

        {/* ── Folders Section ───────────────────────────────────── */}
        {!collapsed && (
          <div className="px-3 pt-3 pb-1 flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Thư mục của bạn
              </p>
              <button
                onClick={showCreateFolderModal}
                className="w-5 h-5 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] transition-colors"
                title="Tạo thư mục mới"
              >
                <Plus size={13} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-0.5 pr-1">
              {folderList.length === 0 ? (
                <p className="text-[12px] text-[var(--text-muted)] px-2 py-1">
                  Chưa có thư mục nào
                </p>
              ) : (
                folderList.map((folder) => (
                  <Link
                    key={folder.id}
                    href={`/folder/${folder.id}`}
                    onClick={onMobileClose}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm truncate transition-colors ${
                      pathname === `/folder/${folder.id}`
                        ? 'bg-[var(--primary-light)] text-[var(--primary)] font-medium'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text)]'
                    }`}
                  >
                    <Folder size={14} className="flex-shrink-0" />
                    <span className="truncate text-[13px]">{folder.name}</span>
                  </Link>
                ))
              )}
              <button
                onClick={showCreateFolderModal}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-[13px] text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--primary)] w-full transition-colors"
              >
                <Plus size={14} />
                <span>Thư mục mới</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Bottom Settings ───────────────────────────────────── */}
        <div className="p-2 border-t border-[var(--border)] flex-shrink-0 mt-auto">
          <NavItem
            href="/settings"
            icon={<Settings size={18} />}
            label="Cài đặt"
            active={pathname === '/settings'}
            collapsed={collapsed}
          />
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`sidebar-nav-item w-full text-left`}
            title={collapsed ? (theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối') : undefined}
          >
            <span className="nav-icon flex-shrink-0 text-lg">
              {theme === 'dark' ? '☀️' : '🌙'}
            </span>
            {!collapsed && (
              <span>{theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
