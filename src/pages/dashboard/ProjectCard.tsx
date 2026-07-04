import { useState } from 'react';
import {
  FolderOpen,
  Trash2,
  Clock,
  Cpu,
  Boxes,
  Layers,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import type { Project, PlcBrand } from '@/types/project';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onOpen: (projectId: string) => void;
  onDelete: (projectId: string) => void;
}

const plcBrandConfig: Record<PlcBrand, { name: string; color: string; bgColor: string }> = {
  siemens: { name: '西门子', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
  mitsubishi: { name: '三菱', color: 'text-red-400', bgColor: 'bg-red-500/10' },
  omron: { name: '欧姆龙', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  delta: { name: '台达', color: 'text-green-400', bgColor: 'bg-green-500/10' },
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days}天前`;
  if (days < 30) return `${Math.floor(days / 7)}周前`;
  if (days < 365) return `${Math.floor(days / 30)}个月前`;
  return date.toLocaleDateString('zh-CN');
}

export default function ProjectCard({ project, onOpen, onDelete }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const brandConfig = plcBrandConfig[project.plcBrand];

  const stationCount = project.stations.length;
  const deviceCount = project.stations.reduce((sum, s) => sum + s.devices.length, 0);
  const moduleCount = project.stations.reduce((sum, s) => sum + s.modules.length, 0);

  return (
    <div
      className={cn(
        'group relative bg-dark-900 border border-dark-700 rounded-xl overflow-hidden',
        'transition-all duration-300 ease-out cursor-pointer',
        'hover:border-industrial-500/50 hover:shadow-industrial hover:-translate-y-1',
        isHovered && 'border-industrial-500/50 shadow-industrial -translate-y-1'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
      onClick={() => onOpen(project.id)}
    >
      <div className="h-1.5 bg-gradient-to-r from-industrial-500 via-industrial-400 to-industrial-600" />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-11 h-11 rounded-lg flex items-center justify-center transition-all duration-300',
                brandConfig.bgColor,
                isHovered && 'scale-110'
              )}
            >
              <Cpu className={cn('w-5 h-5', brandConfig.color)} />
            </div>
            <div>
              <h3 className="font-semibold text-dark-100 text-base leading-tight group-hover:text-industrial-300 transition-colors duration-200">
                {project.name}
              </h3>
              <span
                className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block',
                  brandConfig.bgColor,
                  brandConfig.color
                )}
              >
                {brandConfig.name}
              </span>
            </div>
          </div>

          <div
            className={cn(
              'relative transition-all duration-200',
              isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 w-40 bg-dark-800 border border-dark-600 rounded-lg shadow-dark-lg z-10 overflow-hidden animate-fade-in">
                <button
                  className="w-full px-3 py-2 text-left text-sm text-dark-200 hover:bg-dark-700 flex items-center gap-2 transition-colors"
                  onClick={() => onOpen(project.id)}
                >
                  <ExternalLink className="w-4 h-4" />
                  打开项目
                </button>
                <button
                  className="w-full px-3 py-2 text-left text-sm text-danger-500 hover:bg-dark-700 flex items-center gap-2 transition-colors"
                  onClick={() => onDelete(project.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  删除项目
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-dark-400 text-sm mb-4 line-clamp-2 h-10">
          {project.description || '暂无描述'}
        </p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-dark-800/50 rounded-lg p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-industrial-400 mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span className="text-sm font-semibold">{stationCount}</span>
            </div>
            <span className="text-xs text-dark-500">工位</span>
          </div>
          <div className="bg-dark-800/50 rounded-lg p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-success-500 mb-1">
              <Cpu className="w-3.5 h-3.5" />
              <span className="text-sm font-semibold">{deviceCount}</span>
            </div>
            <span className="text-xs text-dark-500">设备</span>
          </div>
          <div className="bg-dark-800/50 rounded-lg p-2.5 text-center">
            <div className="flex items-center justify-center gap-1 text-warning-500 mb-1">
              <Boxes className="w-3.5 h-3.5" />
              <span className="text-sm font-semibold">{moduleCount}</span>
            </div>
            <span className="text-xs text-dark-500">模块</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-dark-700">
          <div className="flex items-center gap-1.5 text-dark-500 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>更新于 {formatDate(project.updatedAt)}</span>
          </div>

          <button
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
              isHovered
                ? 'bg-industrial-600 text-white'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700'
            )}
            onClick={(e) => {
              e.stopPropagation();
              onOpen(project.id);
            }}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            打开
          </button>
        </div>
      </div>
    </div>
  );
}
