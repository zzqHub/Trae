import { useNavigate, useParams } from 'react-router-dom';
import {
  Save,
  Undo2,
  Redo2,
  Code2,
  Settings,
  Sparkles,
  User,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { useProjectStore } from '@/store';

interface TopNavbarProps {
  className?: string;
}

export default function TopNavbar({ className }: TopNavbarProps) {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  const { currentProject } = useProjectStore();

  const brandMap: Record<string, { label: string; color: string }> = {
    siemens: { label: '西门子', color: 'info' },
    mitsubishi: { label: '三菱', color: 'danger' },
    omron: { label: '欧姆龙', color: 'warning' },
    delta: { label: '台达', color: 'success' },
  };

  const brandInfo = currentProject
    ? brandMap[currentProject.plcBrand] || { label: currentProject.plcBrand, color: 'default' }
    : null;

  const handleGenerateCode = () => {
    if (projectId) {
      navigate(`/project/${projectId}/generate`);
    }
  };

  return (
    <header
      className={cn(
        'h-14 bg-dark-900 border-b border-dark-700 flex items-center justify-between px-4 flex-shrink-0',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 group"
        >
          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-industrial-500 to-industrial-700 flex items-center justify-center shadow-lg shadow-industrial-500/20 group-hover:shadow-industrial transition-shadow">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold text-dark-50 leading-tight">
              PLC Genie
            </span>
            <span className="text-[10px] text-dark-500 leading-tight">
              智能PLC编程平台
            </span>
          </div>
        </button>

        <div className="h-8 w-px bg-dark-700" />

        {currentProject && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
              title="返回工作台"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-dark-100 leading-tight">
                {currentProject.name}
              </span>
              <span className="text-[11px] text-dark-500 leading-tight">
                上次保存：{new Date(currentProject.updatedAt).toLocaleString('zh-CN')}
              </span>
            </div>
            {brandInfo && (
              <Badge variant={brandInfo.color as 'default'} size="sm">
                {brandInfo.label}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1 bg-dark-800/50 rounded-md p-0.5 border border-dark-700/50">
          <Button variant="ghost" size="icon" title="撤销">
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" title="重做">
            <Redo2 className="w-4 h-4" />
          </Button>
        </div>

        <div className="h-6 w-px bg-dark-700 mx-1" />

        <Button variant="secondary" size="sm">
          <Save className="w-4 h-4" />
          <span>保存</span>
        </Button>

        <Button variant="primary" size="sm" onClick={handleGenerateCode}>
          <Code2 className="w-4 h-4" />
          <span>生成代码</span>
        </Button>

        <div className="h-6 w-px bg-dark-700 mx-1" />

        <Button variant="ghost" size="icon" title="设置">
          <Settings className="w-4 h-4" />
        </Button>

        <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center border border-dark-600 cursor-pointer hover:border-industrial-500/50 transition-colors">
          <User className="w-4 h-4 text-dark-300" />
        </div>
      </div>
    </header>
  );
}
