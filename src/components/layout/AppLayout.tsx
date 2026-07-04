import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PanelLeft, PanelLeftClose, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import TopNavbar from './TopNavbar';
import RightPanel from './RightPanel';
import ProjectTree from '@/components/tree/ProjectTree';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function AppLayout({ children, className }: AppLayoutProps) {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(true);

  return (
    <div className={cn('h-screen w-full flex flex-col bg-dark-950 text-dark-100 overflow-hidden', className)}>
      <TopNavbar />

      <div className="flex-1 flex overflow-hidden relative">
        <aside
          className={cn(
            'h-full bg-dark-900 border-r border-dark-700 flex flex-col flex-shrink-0 transition-all duration-300 relative',
            sidebarCollapsed ? 'w-0 border-r-0' : 'w-64'
          )}
        >
          {!sidebarCollapsed && (
            <>
              <div className="h-12 flex items-center justify-between px-3 border-b border-dark-700 flex-shrink-0">
                <span className="text-xs font-medium text-dark-400 uppercase tracking-wider">
                  项目资源
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => navigate('/')}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
                    title="返回工作台"
                  >
                    <Home className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className="w-6 h-6 flex items-center justify-center rounded hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
                    title="收起侧边栏"
                  >
                    <PanelLeftClose className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <ProjectTree />
              </div>
            </>
          )}

          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-5 h-16 bg-dark-800 border border-dark-700 border-l-0 rounded-r-md flex items-center justify-center text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors z-10"
              title="展开侧边栏"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
        </aside>

        <main className="flex-1 overflow-hidden bg-dark-950 relative">
          <div className="h-full w-full overflow-auto">
            {children}
          </div>
        </main>

        <RightPanel collapsed={rightPanelCollapsed} onToggle={() => setRightPanelCollapsed(!rightPanelCollapsed)} />
      </div>
    </div>
  );
}
