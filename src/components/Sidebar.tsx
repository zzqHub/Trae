import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Cpu, 
  Package, 
  FileText, 
  Code2,
  CheckCircle2
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar = () => {
  const currentProject = useStore(state => state.currentProject);
  const progress = currentProject?.progress || 0;

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard', targetProgress: 0 },
    { path: '/device-info', icon: Cpu, label: '设备信息', targetProgress: 25 },
    { path: '/material-selection', icon: Package, label: '物料选型', targetProgress: 50 },
    { path: '/drawing-output', icon: FileText, label: '图纸输出', targetProgress: 75 },
    { path: '/program-generation', icon: Code2, label: '程序编写', targetProgress: 100 },
  ];

  return (
    <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col h-screen fixed left-0 top-0 shadow-2xl">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              设备设计流
            </h1>
            <p className="text-xs text-slate-400">DesignFlow Pro</p>
          </div>
        </div>
      </div>

      {currentProject && (
        <div className="p-4 border-b border-slate-700">
          <div className="bg-slate-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{currentProject.name}</span>
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                currentProject.status === 'completed' 
                  ? "bg-green-500/20 text-green-400"
                  : currentProject.status === 'in-progress'
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-yellow-500/20 text-yellow-400"
              )}>
                {currentProject.status === 'completed' ? '已完成' : 
                 currentProject.status === 'in-progress' ? '进行中' : '草稿'}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-400">
                <span>项目进度</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-500/25"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
            {currentProject && progress >= item.targetProgress && item.targetProgress > 0 && (
              <CheckCircle2 className="w-4 h-4 ml-auto text-green-400" />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-xs text-slate-400 mb-2">💡 提示</p>
          <p className="text-sm text-slate-300">
            按步骤完成设计流程，系统将自动生成图纸和程序。
          </p>
        </div>
      </div>
    </div>
  );
};
