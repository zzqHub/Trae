import { Material } from '@/types';
import { Plus, Trash2, Check, Eye } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

interface MaterialCardProps {
  material: Material;
  isSelected?: boolean;
  onSelect?: (material: Material) => void;
  onRemove?: (materialId: string) => void;
  onView?: (material: Material) => void;
  showActions?: boolean;
}

export const MaterialCard = ({ 
  material, 
  isSelected = false, 
  onSelect, 
  onRemove,
  onView,
  showActions = true
}: MaterialCardProps) => {
  const categoryColors: Record<string, string> = {
    '电机': 'from-blue-500 to-blue-600',
    '控制器': 'from-purple-500 to-purple-600',
    '传动件': 'from-green-500 to-green-600',
    '气动元件': 'from-orange-500 to-orange-600',
    '传感器': 'from-cyan-500 to-cyan-600',
    '减速器': 'from-pink-500 to-pink-600'
  };

  return (
    <div className={cn(
      "bg-white rounded-2xl border-2 transition-all duration-300 overflow-hidden",
      isSelected 
        ? "border-blue-500 shadow-xl shadow-blue-500/20" 
        : "border-slate-200 hover:border-slate-300 hover:shadow-lg"
    )}>
      <div className={cn(
        "h-3 bg-gradient-to-r",
        categoryColors[material.category] || 'from-slate-400 to-slate-500'
      )} />
      
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">{material.name}</h3>
            <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full mt-1">
              {material.category}
            </span>
          </div>
          {isSelected && (
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <div className="space-y-2 mb-4">
          {Object.entries(material.specifications).slice(0, 3).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="text-slate-500">{key}</span>
              <span className="text-slate-700 font-medium">{value}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div>
            <p className="text-2xl font-bold text-slate-800">¥{material.price}</p>
            <p className="text-xs text-slate-500">{material.supplier}</p>
          </div>
          
          {showActions && (
            <div className="flex gap-2">
              {onView && (
                <button
                  onClick={() => onView(material)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Eye className="w-5 h-5" />
                </button>
              )}
              {isSelected && onRemove ? (
                <button
                  onClick={() => onRemove(material.id)}
                  className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              ) : onSelect && (
                <button
                  onClick={() => onSelect(material)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
