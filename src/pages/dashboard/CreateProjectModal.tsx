import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Cpu,
  ChevronDown,
  FileText,
  Check,
  Loader2,
} from 'lucide-react';
import type { PlcBrand } from '@/types/project';
import type { Template } from '@/types/template';
import { useTemplateStore } from '@/store/templateStore';
import { useProjectStore } from '@/store/projectStore';
import { cn } from '@/lib/utils';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (projectId: string) => void;
}

const plcBrands: { value: PlcBrand; label: string; description: string; color: string }[] = [
  { value: 'siemens', label: '西门子', description: 'S7-1200/1500/300/400', color: 'cyan' },
  { value: 'mitsubishi', label: '三菱', description: 'FX/Q/L/R系列', color: 'red' },
  { value: 'omron', label: '欧姆龙', description: 'CP/CJ/CS/NX系列', color: 'yellow' },
  { value: 'delta', label: '台达', description: 'DVP/AS/AH系列', color: 'green' },
];

const plcModels: Record<PlcBrand, string[]> = {
  siemens: ['S7-1200', 'S7-1500', 'S7-300', 'S7-400', 'S7-200 SMART'],
  mitsubishi: ['FX5U', 'FX3U', 'FX3GA', 'Q系列', 'L系列', 'R系列'],
  omron: ['CP1E', 'CP1H', 'CJ2M', 'CS1G', 'NX1P'],
  delta: ['DVP-ES2', 'DVP-SS2', 'DVP-EH3', 'AS系列', 'AH系列'],
};

const colorClasses: Record<string, { border: string; bg: string; text: string; ring: string }> = {
  cyan: {
    border: 'border-cyan-500/50',
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    ring: 'ring-cyan-500/30',
  },
  red: {
    border: 'border-red-500/50',
    bg: 'bg-red-500/10',
    text: 'text-red-400',
    ring: 'ring-red-500/30',
  },
  yellow: {
    border: 'border-yellow-500/50',
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-400',
    ring: 'ring-yellow-500/30',
  },
  green: {
    border: 'border-green-500/50',
    bg: 'bg-green-500/10',
    text: 'text-green-400',
    ring: 'ring-green-500/30',
  },
};

export default function CreateProjectModal({ isOpen, onClose, onCreated }: CreateProjectModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<PlcBrand | null>(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const templates = useTemplateStore((s) => s.templates);
  const projectTemplates = templates.filter((t) => t.category === 'project');
  const addProject = useProjectStore((s) => s.addProject);
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject);

  useEffect(() => {
    if (isOpen) {
      setName('');
      setDescription('');
      setSelectedBrand(null);
      setSelectedModel('');
      setSelectedTemplate(null);
      setIsCreating(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedBrand) {
      const models = plcModels[selectedBrand];
      if (models.length > 0 && !models.includes(selectedModel)) {
        setSelectedModel(models[0]);
      }
    } else {
      setSelectedModel('');
    }
  }, [selectedBrand]);

  const handleCreate = async () => {
    if (!name.trim() || !selectedBrand) return;

    setIsCreating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const newProject = addProject({
        name: name.trim(),
        description: description.trim() || undefined,
        plcBrand: selectedBrand,
      });

      setCurrentProject(newProject.id);
      onCreated?.(newProject.id);
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-dark-900 border border-dark-700 rounded-2xl shadow-dark-lg overflow-hidden animate-fade-in">
        <div className="h-1 bg-gradient-to-r from-industrial-500 via-industrial-400 to-industrial-600" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-industrial-500/20 flex items-center justify-center">
                <Plus className="w-5 h-5 text-industrial-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-dark-100">新建项目</h2>
                <p className="text-sm text-dark-500">创建一个新的PLC项目</p>
              </div>
            </div>
            <button
              className="p-2 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="label-text">项目名称 <span className="text-danger-500">*</span></label>
              <input
                type="text"
                className="input-field"
                placeholder="请输入项目名称"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>

            <div>
              <label className="label-text">项目描述</label>
              <textarea
                className="input-field min-h-[80px] resize-none"
                placeholder="请输入项目描述（可选）"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="label-text">PLC品牌 <span className="text-danger-500">*</span></label>
              <div className="grid grid-cols-2 gap-2">
                {plcBrands.map((brand) => {
                  const colors = colorClasses[brand.color];
                  const isSelected = selectedBrand === brand.value;
                  return (
                    <button
                      key={brand.value}
                      className={cn(
                        'relative p-3 rounded-xl border-2 text-left transition-all duration-200',
                        isSelected
                          ? `${colors.border} ${colors.bg} ring-2 ${colors.ring}`
                          : 'border-dark-700 hover:border-dark-600 bg-dark-800/50'
                      )}
                      onClick={() => setSelectedBrand(brand.value)}
                    >
                      <div className="flex items-center gap-2.5 mb-1">
                        <Cpu className={cn('w-4 h-4', isSelected ? colors.text : 'text-dark-400')} />
                        <span className={cn('font-medium text-sm', isSelected ? colors.text : 'text-dark-200')}>
                          {brand.label}
                        </span>
                      </div>
                      <p className="text-xs text-dark-500 ml-6">{brand.description}</p>
                      {isSelected && (
                        <div className={cn('absolute top-2 right-2', colors.text)}>
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedBrand && (
              <div className="relative">
                <label className="label-text">PLC型号</label>
                <button
                  className="w-full input-field flex items-center justify-between text-left"
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                >
                  <span>{selectedModel || '请选择型号'}</span>
                  <ChevronDown
                    className={cn('w-4 h-4 text-dark-400 transition-transform', showModelDropdown && 'rotate-180')}
                  />
                </button>
                {showModelDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-dark-800 border border-dark-600 rounded-lg shadow-dark-lg z-10 overflow-hidden max-h-48 overflow-y-auto animate-fade-in">
                    {plcModels[selectedBrand].map((model) => (
                      <button
                        key={model}
                        className={cn(
                          'w-full px-3 py-2 text-left text-sm transition-colors',
                          selectedModel === model
                            ? 'bg-industrial-500/20 text-industrial-300'
                            : 'text-dark-200 hover:bg-dark-700'
                        )}
                        onClick={() => {
                          setSelectedModel(model);
                          setShowModelDropdown(false);
                        }}
                      >
                        {model}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="relative">
              <label className="label-text">
                使用模板 <span className="text-dark-500 font-normal">（可选）</span>
              </label>
              <button
                className="w-full input-field flex items-center justify-between text-left"
                onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
              >
                <span className={selectedTemplate ? 'text-dark-100' : 'text-dark-500'}>
                  {selectedTemplate
                    ? templates.find((t) => t.id === selectedTemplate)?.name
                    : '选择项目模板'}
                </span>
                <ChevronDown
                  className={cn('w-4 h-4 text-dark-400 transition-transform', showTemplateDropdown && 'rotate-180')}
                />
              </button>
              {showTemplateDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-dark-800 border border-dark-600 rounded-lg shadow-dark-lg z-10 overflow-hidden max-h-48 overflow-y-auto animate-fade-in">
                  <button
                    className={cn(
                      'w-full px-3 py-2 text-left text-sm transition-colors',
                      !selectedTemplate
                        ? 'bg-industrial-500/20 text-industrial-300'
                        : 'text-dark-200 hover:bg-dark-700'
                    )}
                    onClick={() => {
                      setSelectedTemplate(null);
                      setShowTemplateDropdown(false);
                    }}
                  >
                    不使用模板
                  </button>
                  {projectTemplates.length === 0 ? (
                    <div className="px-3 py-4 text-center text-dark-500 text-sm">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      暂无项目模板
                    </div>
                  ) : (
                    projectTemplates.map((template) => (
                      <button
                        key={template.id}
                        className={cn(
                          'w-full px-3 py-2 text-left text-sm transition-colors',
                          selectedTemplate === template.id
                            ? 'bg-industrial-500/20 text-industrial-300'
                            : 'text-dark-200 hover:bg-dark-700'
                        )}
                        onClick={() => {
                          setSelectedTemplate(template.id);
                          setShowTemplateDropdown(false);
                        }}
                      >
                        {template.name}
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-dark-700">
            <button
              className="btn-secondary"
              onClick={onClose}
              disabled={isCreating}
            >
              取消
            </button>
            <button
              className={cn(
                'btn-primary min-w-[100px] justify-center',
                (!name.trim() || !selectedBrand || isCreating) && 'opacity-50 cursor-not-allowed'
              )}
              onClick={handleCreate}
              disabled={!name.trim() || !selectedBrand || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  创建中
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  创建项目
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
