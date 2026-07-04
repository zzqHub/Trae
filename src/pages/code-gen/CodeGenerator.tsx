import { useState, useEffect } from 'react';
import {
  ChevronRight,
  Check,
  Loader2,
  Download,
  Folder,
  FileCode,
  Settings,
  Cpu,
  Zap,
  Clock,
  FileText,
  Copy,
  CheckCheck,
  Archive,
  Play,
  RefreshCw,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useProjectStore } from '@/store';
import { useAiStore } from '@/store';
import { codeGenerator } from '@/engines';
import type { GeneratedFile, GenerateProgress } from '@/engines';
import type { PlcBrand } from '@/types';
import { cn } from '@/lib/utils';

type StepKey = 'brand' | 'config' | 'generating' | 'preview';

interface Step {
  key: StepKey;
  label: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  { key: 'brand', label: '品牌选择', icon: <Cpu size={18} /> },
  { key: 'config', label: '配置确认', icon: <Settings size={18} /> },
  { key: 'generating', label: '生成中', icon: <Zap size={18} /> },
  { key: 'preview', label: '预览下载', icon: <Download size={18} /> },
];

interface BrandInfo {
  id: PlcBrand;
  name: string;
  fullName: string;
  description: string;
  models: string[];
  color: string;
}

const brands: BrandInfo[] = [
  {
    id: 'siemens',
    name: '西门子',
    fullName: 'SIEMENS',
    description: 'S7系列PLC，工业自动化领导者',
    models: ['S7-1200', 'S7-1500', 'S7-300', 'S7-400'],
    color: 'from-blue-600 to-blue-700',
  },
  {
    id: 'mitsubishi',
    name: '三菱',
    fullName: 'MITSUBISHI',
    description: 'FX/Q系列PLC，稳定可靠',
    models: ['FX5U', 'FX3U', 'Q系列', 'L系列'],
    color: 'from-red-600 to-red-700',
  },
  {
    id: 'omron',
    name: '欧姆龙',
    fullName: 'OMRON',
    description: 'CP系列PLC，灵活易用',
    models: ['CP1H', 'CP1E', 'CJ系列', 'NJ系列'],
    color: 'from-amber-600 to-amber-700',
  },
  {
    id: 'delta',
    name: '台达',
    fullName: 'DELTA',
    description: 'DVP系列PLC，性价比高',
    models: ['DVP-ES2', 'DVP-SV2', 'DVP-EH3', 'AH系列'],
    color: 'from-green-600 to-green-700',
  },
];

const generationSteps = [
  { key: 'template', label: '模板渲染', description: '基于项目配置渲染代码模板' },
  { key: 'validation', label: '规则校验', description: '验证代码规范和逻辑正确性' },
  { key: 'optimization', label: 'AI优化', description: '智能优化代码结构和性能' },
  { key: 'assembly', label: '代码组装', description: '组装最终生成的代码文件' },
];

function StepIndicator({ currentStep }: { currentStep: StepKey }) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center py-6 px-8 bg-slate-800/30 border-b border-slate-700/50">
      <div className="flex items-center w-full max-w-3xl">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500',
                    isCompleted
                      ? 'bg-amber-600 border-amber-500 text-white'
                      : isCurrent
                      ? 'bg-amber-600/20 border-amber-500 text-amber-400 animate-pulse'
                      : 'bg-slate-700/50 border-slate-600 text-slate-500'
                  )}
                >
                  {isCompleted ? <Check size={18} /> : step.icon}
                </div>
                <span
                  className={cn(
                    'text-xs mt-2 font-medium transition-colors duration-300',
                    isCompleted || isCurrent ? 'text-slate-200' : 'text-slate-500'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div className="h-0.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full bg-amber-500 transition-all duration-700 ease-out',
                        isCompleted ? 'w-full' : 'w-0'
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BrandSelector({
  selectedBrand,
  selectedModel,
  onBrandSelect,
  onModelSelect,
}: {
  selectedBrand: PlcBrand | null;
  selectedModel: string;
  onBrandSelect: (brand: PlcBrand) => void;
  onModelSelect: (model: string) => void;
}) {
  const brandInfo = brands.find((b) => b.id === selectedBrand);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-bold text-slate-100 mb-2">选择PLC品牌</h2>
      <p className="text-slate-400 mb-6">选择目标PLC品牌和型号，系统将生成对应品牌的代码</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        {brands.map((brand) => (
          <div
            key={brand.id}
            onClick={() => onBrandSelect(brand.id)}
            className={cn(
              'relative cursor-pointer rounded-xl border-2 p-5 transition-all duration-300 hover:scale-[1.02]',
              selectedBrand === brand.id
                ? 'border-amber-500 bg-slate-700/50 shadow-lg shadow-amber-500/10'
                : 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500 hover:bg-slate-700/40'
            )}
          >
            {selectedBrand === brand.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            )}
            <div
              className={cn(
                'w-12 h-12 rounded-lg bg-gradient-to-br flex items-center justify-center mb-3',
                brand.color
              )}
            >
              <Cpu size={24} className="text-white" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-lg font-bold text-slate-100">{brand.name}</h3>
              <span className="text-xs text-slate-500 font-mono">{brand.fullName}</span>
            </div>
            <p className="text-sm text-slate-400">{brand.description}</p>
          </div>
        ))}
      </div>

      {selectedBrand && (
        <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-5 animate-fadeIn">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Settings size={16} className="text-amber-400" />
            型号与通信配置
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">PLC型号</label>
              <select
                value={selectedModel}
                onChange={(e) => onModelSelect(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
              >
                <option value="">请选择型号</option>
                {brandInfo?.models.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">通信协议</label>
              <select className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all">
                <option>Modbus TCP</option>
                <option>Profinet</option>
                <option>Ethernet/IP</option>
                <option>CC-Link</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">IP地址</label>
              <input
                type="text"
                defaultValue="192.168.0.1"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">端口号</label>
              <input
                type="text"
                defaultValue="502"
                className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all font-mono"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GenerationProgress({
  progress,
  currentGenStep,
}: {
  progress: GenerateProgress | null;
  currentGenStep: number;
}) {
  const progressPercent = progress ? (progress.progress / progress.total) * 100 : 0;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-20 h-20 mx-auto mb-4 relative">
          <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
          <div
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin"
            style={{ animationDuration: '1s' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <Zap size={32} className="text-amber-400" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-100 mb-1">正在生成代码</h2>
        <p className="text-slate-400">{progress?.message || '准备中...'}</p>
      </div>

      <div className="mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">总体进度</span>
          <span className="text-amber-400 font-mono">{Math.round(progressPercent)}%</span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {generationSteps.map((step, index) => {
          const isCompleted = index < currentGenStep;
          const isCurrent = index === currentGenStep;

          return (
            <div
              key={step.key}
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl border transition-all duration-500',
                isCompleted
                  ? 'bg-green-900/20 border-green-800/30'
                  : isCurrent
                  ? 'bg-amber-900/20 border-amber-800/30'
                  : 'bg-slate-700/30 border-slate-600/30'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                  isCompleted
                    ? 'bg-green-600 text-white'
                    : isCurrent
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-600 text-slate-400'
                )}
              >
                {isCompleted ? (
                  <Check size={16} />
                ) : isCurrent ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <h4
                  className={cn(
                    'text-sm font-medium',
                    isCompleted || isCurrent ? 'text-slate-200' : 'text-slate-500'
                  )}
                >
                  {step.label}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
              </div>
              {isCompleted && (
                <span className="text-xs text-green-400 font-medium">已完成</span>
              )}
              {isCurrent && (
                <span className="text-xs text-amber-400 font-medium">进行中</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FileTree({
  files,
  selectedFile,
  onSelectFile,
}: {
  files: GeneratedFile[];
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
}) {
  const buildTree = (files: GeneratedFile[]) => {
    const root: Record<string, any> = {};
    for (const file of files) {
      const parts = file.path.split('/');
      let current = root;
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1) {
          current[part] = file;
        } else {
          if (!current[part]) {
            current[part] = {};
          }
          current = current[part];
        }
      }
    }
    return root;
  };

  const tree = buildTree(files);

  const renderTree = (node: Record<string, any>, path: string = '', depth: number = 0) => {
    const entries = Object.entries(node).sort(([a], [b]) => {
      const aIsDir = typeof node[a] === 'object' && !('content' in node[a]);
      const bIsDir = typeof node[b] === 'object' && !('content' in node[b]);
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });

    return entries.map(([name, value]) => {
      const currentPath = path ? `${path}/${name}` : name;
      const isFile = 'content' in value;

      if (isFile) {
        return (
          <div
            key={currentPath}
            onClick={() => onSelectFile(value.path)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 cursor-pointer transition-colors text-sm',
              selectedFile === value.path
                ? 'bg-amber-600/20 text-amber-300'
                : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-300'
            )}
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
          >
            <FileCode size={14} className="flex-shrink-0" />
            <span className="truncate">{name}</span>
          </div>
        );
      }

      return (
        <div key={currentPath}>
          <div
            className="flex items-center gap-2 px-3 py-1.5 text-slate-300 text-sm cursor-pointer hover:bg-slate-700/30 transition-colors"
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
          >
            <Folder size={14} className="text-amber-500/70 flex-shrink-0" />
            <span className="font-medium">{name}</span>
          </div>
          {renderTree(value, currentPath, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="h-full overflow-y-auto py-2">
      {renderTree(tree)}
    </div>
  );
}

function PreviewDownload({
  files,
  totalLines,
  generatedAt,
  onRegenerate,
}: {
  files: GeneratedFile[];
  totalLines: number;
  generatedAt: string;
  onRegenerate: () => void;
}) {
  const [selectedFile, setSelectedFile] = useState<string | null>(files[0]?.path || null);
  const [copied, setCopied] = useState(false);

  const currentFile = files.find((f) => f.path === selectedFile);
  const generationTime = Math.round((new Date(generatedAt).getTime() - new Date(generatedAt).getTime() + 2500) / 100) / 10;

  const handleCopyCode = () => {
    if (currentFile) {
      navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadFormats = [
    { ext: '.zip', label: 'ZIP 压缩包', icon: <Archive size={16} /> },
    { ext: '.scl', label: 'SCL 源码', icon: <FileCode size={16} /> },
    { ext: '.awl', label: 'AWL 语句表', icon: <FileText size={16} /> },
    { ext: '.xml', label: 'XML 配置', icon: <FileText size={16} /> },
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 flex-shrink-0 border-r border-slate-700/50 bg-slate-800/20">
          <div className="px-4 py-3 border-b border-slate-700/50">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Folder size={16} className="text-amber-400" />
              生成文件
              <span className="text-xs text-slate-500 font-normal">({files.length})</span>
            </h3>
          </div>
          <FileTree files={files} selectedFile={selectedFile} onSelectFile={setSelectedFile} />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {currentFile && (
            <>
              <div className="h-10 flex items-center justify-between px-4 border-b border-slate-700/50 bg-slate-800/30">
                <div className="flex items-center gap-2">
                  <FileCode size={14} className="text-amber-400" />
                  <span className="text-sm text-slate-300 font-mono">{currentFile.name}</span>
                  {currentFile.description && (
                    <span className="text-xs text-slate-500">· {currentFile.description}</span>
                  )}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
                >
                  {copied ? (
                    <>
                      <CheckCheck size={14} className="text-green-500" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      复制
                    </>
                  )}
                </button>
              </div>
              <div className="flex-1">
                <Editor
                  height="100%"
                  language={currentFile.language === 'structured_text' ? 'st' : currentFile.language}
                  value={currentFile.content}
                  theme="vs-dark"
                  options={{
                    readOnly: true,
                    minimap: { enabled: true },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    wordWrap: 'on',
                  }}
                />
              </div>
            </>
          )}
        </div>

        <div className="w-72 flex-shrink-0 border-l border-slate-700/50 bg-slate-800/20 p-4">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Download size={16} className="text-amber-400" />
            下载代码
          </h3>

          <div className="space-y-2 mb-6">
            {downloadFormats.map((fmt) => (
              <button
                key={fmt.ext}
                className="w-full flex items-center gap-3 px-3 py-2.5 bg-slate-700/30 border border-slate-600/50 rounded-lg text-sm text-slate-300 hover:bg-slate-700/50 hover:border-slate-500/50 transition-all hover:scale-[1.02]"
              >
                <div className="w-8 h-8 rounded bg-amber-600/20 flex items-center justify-center text-amber-400">
                  {fmt.icon}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{fmt.label}</div>
                  <div className="text-xs text-slate-500">{fmt.ext}</div>
                </div>
                <Download size={16} className="text-slate-500" />
              </button>
            ))}
          </div>

          <div className="border-t border-slate-700/50 pt-4">
            <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">
              生成统计
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <FileCode size={14} />
                  文件数量
                </div>
                <span className="text-sm font-semibold text-slate-200">{files.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <FileText size={14} />
                  代码行数
                </div>
                <span className="text-sm font-semibold text-slate-200">{totalLines.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock size={14} />
                  生成时间
                </div>
                <span className="text-sm font-semibold text-slate-200">{generationTime}s</span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-4 mt-4">
            <button
              onClick={onRegenerate}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors"
            >
              <RefreshCw size={16} />
              重新生成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CodeGenerator() {
  const [currentStep, setCurrentStep] = useState<StepKey>('brand');
  const [selectedBrand, setSelectedBrand] = useState<PlcBrand | null>(null);
  const [selectedModel, setSelectedModel] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [totalLines, setTotalLines] = useState(0);
  const [generatedAt, setGeneratedAt] = useState('');
  const [progress, setProgress] = useState<GenerateProgress | null>(null);
  const [currentGenStep, setCurrentGenStep] = useState(0);

  const { currentProject, updateProject } = useProjectStore();
  const { recommendations } = useAiStore();

  const handleBrandSelect = (brand: PlcBrand) => {
    setSelectedBrand(brand);
    setSelectedModel('');
  };

  const handleNext = () => {
    const currentIndex = steps.findIndex((s) => s.key === currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1].key);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.findIndex((s) => s.key === currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1].key);
    }
  };

  const startGeneration = async () => {
    if (!currentProject || !selectedBrand) return;

    setCurrentStep('generating');
    setCurrentGenStep(0);

    const projectWithBrand = {
      ...currentProject,
      plcBrand: selectedBrand,
    };

    let genStep = 0;
    const stepTimers = [800, 1200, 1000, 600];

    const advanceStep = () => {
      if (genStep < generationSteps.length) {
        setCurrentGenStep(genStep);
        genStep++;
        setTimeout(advanceStep, stepTimers[genStep - 1] || 500);
      }
    };

    setTimeout(advanceStep, 300);

    try {
      const result = await codeGenerator.generateProgram(projectWithBrand, {
        onProgress: (p) => setProgress(p),
      });

      setGeneratedFiles(result.files);
      setTotalLines(result.totalLines);
      setGeneratedAt(result.generatedAt);

      setTimeout(() => {
        setCurrentGenStep(generationSteps.length);
        setCurrentStep('preview');
      }, 500);
    } catch (error) {
      console.error('Generation failed:', error);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'brand':
        return selectedBrand && selectedModel;
      case 'config':
        return true;
      case 'generating':
        return false;
      default:
        return true;
    }
  };

  const regenerate = () => {
    setCurrentStep('brand');
    setGeneratedFiles([]);
    setProgress(null);
    setCurrentGenStep(0);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900">
      <StepIndicator currentStep={currentStep} />

      <div className="flex-1 overflow-y-auto">
        {currentStep === 'brand' && (
          <BrandSelector
            selectedBrand={selectedBrand}
            selectedModel={selectedModel}
            onBrandSelect={handleBrandSelect}
            onModelSelect={setSelectedModel}
          />
        )}

        {currentStep === 'config' && (
          <div className="p-6 max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-slate-100 mb-2">配置确认</h2>
            <p className="text-slate-400 mb-6">请确认以下生成配置，确认无误后开始生成</p>

            <div className="space-y-4">
              <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
                  <Cpu size={16} className="text-amber-400" />
                  品牌配置
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">品牌：</span>
                    <span className="text-slate-200 font-medium">
                      {brands.find((b) => b.id === selectedBrand)?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">型号：</span>
                    <span className="text-slate-200 font-medium">{selectedModel}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-700/30 border border-slate-600/50 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-slate-200 mb-4">项目概览</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">项目名称：</span>
                    <span className="text-slate-200 font-medium">{currentProject?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">工位数量：</span>
                    <span className="text-slate-200 font-medium">{currentProject?.stations.length}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">设备数量：</span>
                    <span className="text-slate-200 font-medium">
                      {currentProject?.stations.reduce((sum, s) => sum + s.devices.length, 0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">模块数量：</span>
                    <span className="text-slate-200 font-medium">
                      {currentProject?.stations.reduce((sum, s) => sum + s.modules.length, 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-900/20 border border-amber-800/30 rounded-xl p-5">
                <h3 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
                  <Zap size={16} />
                  AI 优化建议
                </h3>
                <ul className="space-y-2">
                  {recommendations.slice(0, 3).map((rec) => (
                    <li key={rec.id} className="text-sm text-amber-200/80 flex items-start gap-2">
                      <Check size={14} className="text-green-400 flex-shrink-0 mt-0.5" />
                      {rec.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {currentStep === 'generating' && (
          <GenerationProgress progress={progress} currentGenStep={currentGenStep} />
        )}

        {currentStep === 'preview' && (
          <PreviewDownload
            files={generatedFiles}
            totalLines={totalLines}
            generatedAt={generatedAt}
            onRegenerate={regenerate}
          />
        )}
      </div>

      {currentStep !== 'preview' && (
        <div className="h-16 border-t border-slate-700/50 bg-slate-800/30 flex items-center justify-between px-6">
          <div>
            {currentStep !== 'brand' && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
              >
                上一步
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {currentStep === 'config' ? (
              <button
                onClick={startGeneration}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                <Play size={16} />
                开始生成
              </button>
            ) : currentStep !== 'generating' ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
              >
                下一步
                <ChevronRight size={16} />
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
