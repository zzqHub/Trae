import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore, useUIStore } from '@/lib/stores';
import {
  LayoutDashboard, FolderTree, FileCode2, Users, ShieldCheck,
  LogOut, ChevronLeft, Boxes, Cpu, Radio, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/dashboard', label: '工作台', icon: LayoutDashboard, role: ['ADMIN','ENGINEER','GUEST','TEMPLATE_MAINTAINER'] },
  { to: '/projects/new', label: '新建项目', icon: FolderTree, role: ['ADMIN','ENGINEER'] },
  { to: '/templates', label: '模板管理', icon: Boxes, role: ['ADMIN','TEMPLATE_MAINTAINER','ENGINEER'] },
  { to: '/admin/users', label: '用户管理', icon: Users, role: ['ADMIN'] },
  { to: '/admin/permissions', label: '权限矩阵', icon: ShieldCheck, role: ['ADMIN'] },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar, toast, clearToast } = useUIStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const allowedNav = NAV.filter(n => user && (n.role as string[]).includes(user.role));

  return (
    <div className="flex h-screen overflow-hidden bg-ink-900 text-ink-200">
      {/* 侧边栏 */}
      <aside className={cn(
        "flex flex-col bg-ink-950 border-r border-ink-700 transition-all duration-300 relative",
        sidebarCollapsed ? "w-16" : "w-60"
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-4 border-b border-ink-700">
          <div className="w-8 h-8 rounded-md bg-cyan-brand grid place-items-center shrink-0">
            <Cpu className="w-5 h-5 text-ink-950" />
          </div>
          {!sidebarCollapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold text-ink-100">XGenCode</span>
              <span className="text-[10px] text-ink-400 uppercase tracking-widest">PLC Generator</span>
            </div>
          )}
        </div>

        {/* 三色灯指示 */}
        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-ink-800 flex items-center gap-2">
            <div className="traffic-light on-green">
              <span></span><span></span><span></span>
            </div>
            <span className="text-[10px] text-ink-400 font-mono">SYS.RUNNING</span>
          </div>
        )}

        {/* 导航 */}
        <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin">
          {allowedNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors border-l-2",
                isActive
                  ? "bg-ink-800 text-cyan-brand border-cyan-brand"
                  : "text-ink-300 border-transparent hover:bg-ink-800/50 hover:text-ink-100"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* 用户卡片 */}
        <div className="border-t border-ink-700 p-3">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-brand to-violet-signal grid place-items-center text-ink-950 text-xs font-bold">
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-ink-100 truncate">{user?.username}</div>
                <div className="text-[10px] text-ink-400">{user?.role}</div>
              </div>
              <button onClick={handleLogout} title="退出"
                className="p-1.5 rounded hover:bg-ink-700 text-ink-400 hover:text-red-signal">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button onClick={handleLogout} className="w-full p-2 rounded hover:bg-ink-700 text-ink-400 hover:text-red-signal grid place-items-center">
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 折叠按钮 */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-ink-700 border border-ink-600 grid place-items-center hover:bg-cyan-brand hover:text-ink-950 transition-colors"
        >
          <ChevronLeft className={cn("w-3.5 h-3.5 transition-transform", sidebarCollapsed && "rotate-180")} />
        </button>
      </aside>

      {/* 主区域 */}
      <main className="flex-1 overflow-auto">
        <div className="min-h-full flex flex-col">
          {children}
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 z-50 px-4 py-3 rounded-md shadow-lg border flex items-center gap-3 max-w-md",
          toast.type === 'success' && "bg-ink-850 border-green-signal/40 text-green-signal",
          toast.type === 'error' && "bg-ink-850 border-red-signal/40 text-red-signal",
          toast.type === 'warning' && "bg-ink-850 border-amber-signal/40 text-amber-signal",
          toast.type === 'info' && "bg-ink-850 border-cyan-brand/40 text-cyan-brand",
        )}>
          <Radio className="w-4 h-4 shrink-0" />
          <span className="text-sm text-ink-100">{toast.msg}</span>
          <button onClick={clearToast} className="text-ink-400 hover:text-ink-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// 页头
export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700 bg-ink-900/60 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold text-ink-100">{title}</h1>
        {subtitle && <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// 空状态
export function EmptyState({ icon: Icon, title, hint }: { icon: any; title: string; hint?: string }) {
  return (
    <div className="flex-1 grid place-items-center text-center p-8">
      <div>
        <Icon className="w-12 h-12 text-ink-600 mx-auto mb-3" />
        <div className="text-ink-300 font-medium">{title}</div>
        {hint && <div className="text-xs text-ink-500 mt-1">{hint}</div>}
      </div>
    </div>
  );
}

// 文件代码图标 (用于代码预览 Tab)
export { FileCode2 };
