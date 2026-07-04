import { useState } from 'react';
import {
  Star,
  Download,
  Cpu,
  Tag,
  Zap,
  Heart,
} from 'lucide-react';
import type { Template, TemplateCategory } from '@/types/template';
import type { PlcBrand } from '@/types/project';
import { cn } from '@/lib/utils';

interface TemplateCardProps {
  template: Template;
  onUse?: (templateId: string) => void;
  onFavorite?: (templateId: string) => void;
  isFavorite?: boolean;
}

const plcBrandConfig: Record<PlcBrand, { name: string; color: string }> = {
  siemens: { name: '西门子', color: 'text-cyan-400' },
  mitsubishi: { name: '三菱', color: 'text-red-400' },
  omron: { name: '欧姆龙', color: 'text-yellow-400' },
  delta: { name: '台达', color: 'text-green-400' },
};

const categoryConfig: Record<TemplateCategory, { label: string; color: string; bgColor: string }> = {
  device: { label: '设备', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  module: { label: '模块', color: 'text-industrial-400', bgColor: 'bg-industrial-500/10' },
  station: { label: '工位', color: 'text-warning-500', bgColor: 'bg-warning-500/10' },
  project: { label: '项目', color: 'text-success-500', bgColor: 'bg-success-500/10' },
};

export default function TemplateCard({ template, onUse, onFavorite, isFavorite = false }: TemplateCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [favorite, setFavorite] = useState(isFavorite);

  const categoryInfo = categoryConfig[template.category];

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorite(!favorite);
    onFavorite?.(template.id);
  };

  return (
    <div
      className={cn(
        'group relative bg-dark-900 border border-dark-700 rounded-xl overflow-hidden',
        'transition-all duration-300 ease-out cursor-pointer',
        'hover:border-industrial-500/40 hover:shadow-dark-lg hover:-translate-y-1',
        isHovered && 'border-industrial-500/40 shadow-dark-lg -translate-y-1'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300',
                categoryInfo.bgColor,
                isHovered && 'scale-110'
              )}
            >
              <Zap className={cn('w-5 h-5', categoryInfo.color)} />
            </div>
            <div>
              <h3 className="font-semibold text-dark-100 text-sm leading-tight group-hover:text-industrial-300 transition-colors duration-200">
                {template.name}
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={cn(
                    'text-xs font-medium px-1.5 py-0.5 rounded',
                    categoryInfo.bgColor,
                    categoryInfo.color
                  )}
                >
                  {categoryInfo.label}
                </span>
                {template.moduleType && (
                  <span className="text-xs font-medium px-1.5 py-0.5 rounded bg-dark-800 text-dark-400">
                    {template.moduleType}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            className={cn(
              'p-1.5 rounded-lg transition-all duration-200',
              favorite
                ? 'text-warning-500 bg-warning-500/10'
                : 'text-dark-500 hover:text-warning-500 hover:bg-dark-800',
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
            )}
            onClick={handleFavorite}
          >
            <Star className={cn('w-4 h-4', favorite && 'fill-current')} />
          </button>
        </div>

        <p className="text-dark-400 text-xs mb-4 line-clamp-2 h-8">
          {template.description || '暂无描述'}
        </p>

        <div className="flex items-center gap-1.5 mb-4">
          <span className="text-xs text-dark-500">支持品牌:</span>
          <div className="flex items-center gap-1">
            {template.plcBrands.slice(0, 3).map((brand) => (
              <div
                key={brand}
                className="w-5 h-5 rounded-full bg-dark-800 flex items-center justify-center"
                title={plcBrandConfig[brand as PlcBrand]?.name || brand}
              >
                <Cpu className={cn('w-3 h-3', plcBrandConfig[brand as PlcBrand]?.color)} />
              </div>
            ))}
            {template.plcBrands.length > 3 && (
              <span className="text-xs text-dark-500">+{template.plcBrands.length - 3}</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-dark-700">
          <div className="flex items-center gap-1 text-dark-500 text-xs">
            <Download className="w-3.5 h-3.5" />
            <span>{template.usageCount ?? 0} 次使用</span>
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
              onUse?.(template.id);
            }}
          >
            <Tag className="w-3.5 h-3.5" />
            使用
          </button>
        </div>
      </div>
    </div>
  );
}
