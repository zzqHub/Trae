import { Project } from '@/types';
import { Calendar, Clock, Cpu } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface ProjectCardProps {
  project: Project;
  onClick?: () => void;
}

export const ProjectCard = ({ project, onClick }: ProjectCardProps) => {
  const statusColors: Record<string, string> = {
    'draft': 'from-yellow-500 to-orange-500',
    'in-progress': 'from-blue-500 to-cyan-500',
    'completed': 'from-green-500 to-emerald-500'
  };

  const statusLabels: Record<string, string> = {
    'draft': '草稿',
    'in-progress': '进行中',
    'completed': '已完成'
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
          <Cpu className="w-6 h-6 text-white" />
        </div>
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r text-white",
          statusColors[project.status]
        )}>
          {statusLabels[project.status]}
        </span>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">
        {project.name}
      </h3>

      {project.deviceInfo && (
        <p className="text-slate-500 text-sm mb-4">
          {project.deviceInfo.type} · {project.deviceInfo.name}
        </p>
      )}

      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">进度</span>
            <span className="text-slate-700 font-medium">{project.progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full bg-gradient-to-r transition-all duration-500",
                statusColors[project.status]
              )}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{new Date(project.updatedAt).toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {project.selectedMaterials.length > 0 && (
            <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
              {project.selectedMaterials.length} 物料
            </span>
          )}
          {project.drawings.length > 0 && (
            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
              {project.drawings.length} 图纸
            </span>
          )}
          {project.programs.length > 0 && (
            <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-full">
              {project.programs.length} 程序
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
