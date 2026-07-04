import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Download,
  Upload,
  Save,
  X,
  Box,
  FunctionSquare,
  Puzzle,
  ChevronRight,
  ArrowLeftRight,
  ArrowRight,
  ArrowLeft,
  Code,
  Info,
  Settings,
  Pin,
  FileCode,
  Filter,
  RefreshCw,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { useProjectStore } from '@/store/projectStore';
import type { Module, ModuleType, Parameter, Variable } from '@/types';
import { cn } from '@/lib/utils';

type CategoryTab = 'fb' | 'fc' | 'custom';
type DetailTab = 'basic' | 'params' | 'pins' | 'code';

const ModuleConfig = () => {
  const { currentProject, addModule, updateModule, deleteModule } = useProjectStore();

  const [categoryTab, setCategoryTab] = useState<CategoryTab>('fb');
  const [detailTab, setDetailTab] = useState<DetailTab>('basic');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newModuleType, setNewModuleType] = useState<ModuleType>('FB');
  const [newModuleName, setNewModuleName] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [paramTab, setParamTab] = useState<'input' | 'output' | 'inout'>('input');

  const currentStation = currentProject?.stations[0];
  const modules = currentStation?.modules || [];

  const filteredModules = useMemo(() => {
    let result = modules;
    if (categoryTab === 'fb') {
      result = result.filter((m) => m.type === 'FB');
    } else if (categoryTab === 'fc') {
      result = result.filter((m) => m.type === 'FC');
    } else {
      result = result.filter((m) => m.type === 'FB');
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) => m.name.toLowerCase().includes(q) || m.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [modules, categoryTab, searchQuery]);

  const selectedModule = useMemo(
    () => modules.find((m) => m.id === selectedModuleId) || null,
    [modules, selectedModuleId]
  );

  const handleSelectModule = (moduleId: string) => {
    setSelectedModuleId(moduleId);
    setIsEditing(false);
    setEditingModule(null);
  };

  const handleStartEdit = () => {
    if (selectedModule) {
      setEditingModule(JSON.parse(JSON.stringify(selectedModule)));
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingModule(null);
  };

  const handleSaveEdit = () => {
    if (editingModule && currentProject && currentStation) {
      updateModule(currentProject.id, currentStation.id, editingModule.id, editingModule);
      setIsEditing(false);
      setEditingModule(null);
    }
  };

  const handleNewModule = () => {
    if (!newModuleName.trim() || !currentProject || !currentStation) return;
    const newMod = addModule(currentProject.id, currentStation.id, {
      name: newModuleName,
      type: newModuleType,
      description: newModuleDesc,
    });
    setSelectedModuleId(newMod.id);
    setShowNewModal(false);
    setNewModuleName('');
    setNewModuleDesc('');
  };

  const handleDeleteModule = () => {
    if (!selectedModule || !currentProject || !currentStation) return;
    if (confirm(`确定要删除模块 "${selectedModule.name}" 吗？`)) {
      deleteModule(currentProject.id, currentStation.id, selectedModule.id);
      setSelectedModuleId(null);
    }
  };

  const handleDuplicateModule = () => {
    if (!selectedModule || !currentProject || !currentStation) return;
    const copy: Module = JSON.parse(JSON.stringify(selectedModule));
    addModule(currentProject.id, currentStation.id, {
      name: `${copy.name}_副本`,
      type: copy.type,
      description: copy.description,
      inputParameters: copy.inputParameters,
      outputParameters: copy.outputParameters,
      inOutParameters: copy.inOutParameters,
      staticVariables: copy.staticVariables,
      tempVariables: copy.tempVariables,
      code: copy.code,
    });
  };

  const updateEditingField = <K extends keyof Module>(key: K, value: Module[K]) => {
    if (!editingModule) return;
    setEditingModule({ ...editingModule, [key]: value });
  };

  const handleAddParameter = (type: 'input' | 'output' | 'inout') => {
    if (!editingModule) return;
    const newParam: Parameter = {
      id: `param-${Date.now()}`,
      name: `NewParam`,
      dataType: 'BOOL',
      description: '',
      defaultValue: '',
    };
    const key = type === 'input' ? 'inputParameters' : type === 'output' ? 'outputParameters' : 'inOutParameters';
    updateEditingField(key, [...editingModule[key], newParam]);
  };

  const handleUpdateParameter = (type: 'input' | 'output' | 'inout', paramId: string, updates: Partial<Parameter>) => {
    if (!editingModule) return;
    const key = type === 'input' ? 'inputParameters' : type === 'output' ? 'outputParameters' : 'inOutParameters';
    updateEditingField(
      key,
      editingModule[key].map((p) => (p.id === paramId ? { ...p, ...updates } : p))
    );
  };

  const handleDeleteParameter = (type: 'input' | 'output' | 'inout', paramId: string) => {
    if (!editingModule) return;
    const key = type === 'input' ? 'inputParameters' : type === 'output' ? 'outputParameters' : 'inOutParameters';
    updateEditingField(key, editingModule[key].filter((p) => p.id !== paramId));
  };

  const displayModule = isEditing && editingModule ? editingModule : selectedModule;

  const getCategoryIcon = (type: ModuleType) => {
    return type === 'FB' ? <Box className="w-4 h-4" /> : <FunctionSquare className="w-4 h-4" />;
  };

  const getCategoryBadge = (type: ModuleType) => {
    return (
      <Badge variant={type === 'FB' ? 'info' : 'success'} size="sm">
        {type}
      </Badge>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-3">
          <Puzzle className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-100">模块配置</h2>
          <Badge variant="default" size="sm">{modules.length} 个模块</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4" />
            导入
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4" />
            导出
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowNewModal(true)}>
            <Plus className="w-4 h-4" />
            新建模块
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 border-r border-slate-700 flex flex-col bg-slate-800/30">
          <div className="p-3 border-b border-slate-700/50">
            <Tabs defaultValue="fb" value={categoryTab} onValueChange={(v) => setCategoryTab(v as CategoryTab)}>
              <TabsList className="w-full">
                <TabsTrigger value="fb" className="flex-1">
                  <Box className="w-4 h-4 mr-1.5" />
                  FB功能块
                </TabsTrigger>
                <TabsTrigger value="fc" className="flex-1">
                  <FunctionSquare className="w-4 h-4 mr-1.5" />
                  FC函数
                </TabsTrigger>
                <TabsTrigger value="custom" className="flex-1">
                  <Puzzle className="w-4 h-4 mr-1.5" />
                  自定义
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="p-3 border-b border-slate-700/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="搜索模块..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredModules.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Box className="w-12 h-12 mb-3 opacity-50" />
                <p className="text-sm">暂无模块</p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {filteredModules.map((module) => (
                  <button
                    key={module.id}
                    onClick={() => handleSelectModule(module.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded text-left transition-colors',
                      selectedModuleId === module.id
                        ? 'bg-amber-600/20 border border-amber-600/40 text-amber-100'
                        : 'hover:bg-slate-700/50 border border-transparent text-slate-300'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 flex items-center justify-center rounded',
                      selectedModuleId === module.id ? 'bg-amber-600/30 text-amber-400' : 'bg-slate-700 text-slate-400'
                    )}>
                      {getCategoryIcon(module.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{module.name}</span>
                        {getCategoryBadge(module.type)}
                      </div>
                      {module.description && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">{module.description}</p>
                      )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          {selectedModule && displayModule ? (
            <>
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-amber-600/20 text-amber-400">
                    {getCategoryIcon(displayModule.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-100">{displayModule.name}</h3>
                      {getCategoryBadge(displayModule.type)}
                    </div>
                    <p className="text-sm text-slate-400">{displayModule.description || '无描述'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing ? (
                    <>
                      <Button variant="ghost" size="sm" onClick={handleDuplicateModule}>
                        <Copy className="w-4 h-4" />
                        复制
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleDeleteModule}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                        删除
                      </Button>
                      <Button variant="primary" size="sm" onClick={handleStartEdit}>
                        <Edit3 className="w-4 h-4" />
                        编辑
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                        <X className="w-4 h-4" />
                        取消
                      </Button>
                      <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                        <Save className="w-4 h-4" />
                        保存
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <Tabs defaultValue="basic" value={detailTab} onValueChange={(v) => setDetailTab(v as DetailTab)} className="flex-1 flex flex-col">
                <div className="px-4 pt-3 border-b border-slate-700">
                  <TabsList>
                    <TabsTrigger value="basic">
                      <Info className="w-4 h-4 mr-1.5" />
                      基本信息
                    </TabsTrigger>
                    <TabsTrigger value="params">
                      <Settings className="w-4 h-4 mr-1.5" />
                      参数配置
                    </TabsTrigger>
                    <TabsTrigger value="pins">
                      <Pin className="w-4 h-4 mr-1.5" />
                      引脚定义
                    </TabsTrigger>
                    <TabsTrigger value="code">
                      <Code className="w-4 h-4 mr-1.5" />
                      代码预览
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 overflow-auto p-4">
                  <TabsContent value="basic" className="mt-0 h-full">
                    <Card className="max-w-2xl">
                      <CardHeader>
                        <CardTitle>基本信息</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">模块名称</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingModule?.name || ''}
                              onChange={(e) => updateEditingField('name', e.target.value)}
                              className="w-full h-9 px-3 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                            />
                          ) : (
                            <p className="text-sm text-slate-200 h-9 flex items-center">{displayModule.name}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">模块类型</label>
                          {isEditing ? (
                            <select
                              value={editingModule?.type || 'FB'}
                              onChange={(e) => updateEditingField('type', e.target.value as ModuleType)}
                              className="w-full h-9 px-3 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                            >
                              <option value="FB">FB - 功能块</option>
                              <option value="FC">FC - 函数</option>
                            </select>
                          ) : (
                            <div className="h-9 flex items-center">
                              {getCategoryBadge(displayModule.type)}
                              <span className="ml-2 text-sm text-slate-400">
                                {displayModule.type === 'FB' ? '功能块（有静态变量）' : '函数（无静态变量）'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">分类</label>
                          <div className="h-9 flex items-center">
                            <Badge variant="info" size="sm">
                              {categoryTab === 'fb' ? 'FB功能块' : categoryTab === 'fc' ? 'FC函数' : '自定义模块'}
                            </Badge>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-1.5">描述</label>
                          {isEditing ? (
                            <textarea
                              value={editingModule?.description || ''}
                              onChange={(e) => updateEditingField('description', e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 resize-none"
                            />
                          ) : (
                            <p className="text-sm text-slate-200 leading-relaxed min-h-[6rem] bg-slate-900/50 p-3 rounded border border-slate-700">
                              {displayModule.description || '暂无描述'}
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                            <p className="text-xs text-slate-500 mb-1">输入参数</p>
                            <p className="text-lg font-semibold text-sky-400">{displayModule.inputParameters.length}</p>
                          </div>
                          <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                            <p className="text-xs text-slate-500 mb-1">输出参数</p>
                            <p className="text-lg font-semibold text-emerald-400">{displayModule.outputParameters.length}</p>
                          </div>
                          <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                            <p className="text-xs text-slate-500 mb-1">输入输出参数</p>
                            <p className="text-lg font-semibold text-amber-400">{displayModule.inOutParameters.length}</p>
                          </div>
                          <div className="bg-slate-900/50 p-3 rounded border border-slate-700">
                            <p className="text-xs text-slate-500 mb-1">静态变量</p>
                            <p className="text-lg font-semibold text-violet-400">{displayModule.staticVariables.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="params" className="mt-0 h-full">
                    <Card className="h-full flex flex-col">
                      <CardHeader className="flex-shrink-0">
                        <div className="flex items-center justify-between">
                          <CardTitle>参数配置</CardTitle>
                          {isEditing && (
                            <Button variant="outline" size="sm" onClick={() => handleAddParameter(paramTab)}>
                              <Plus className="w-4 h-4" />
                              添加参数
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col p-0">
                        <div className="px-4 pt-2 pb-3 border-b border-slate-700/50">
                          <Tabs defaultValue="input" value={paramTab} onValueChange={(v) => setParamTab(v as 'input' | 'output' | 'inout')}>
                            <TabsList>
                              <TabsTrigger value="input">
                                <ArrowRight className="w-4 h-4 mr-1.5 text-sky-400" />
                                输入参数 ({displayModule.inputParameters.length})
                              </TabsTrigger>
                              <TabsTrigger value="output">
                                <ArrowLeft className="w-4 h-4 mr-1.5 text-emerald-400" />
                                输出参数 ({displayModule.outputParameters.length})
                              </TabsTrigger>
                              <TabsTrigger value="inout">
                                <ArrowLeftRight className="w-4 h-4 mr-1.5 text-amber-400" />
                                输入输出 ({displayModule.inOutParameters.length})
                              </TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </div>
                        <div className="flex-1 overflow-auto">
                          <table className="w-full">
                            <thead className="sticky top-0 bg-slate-800 z-10">
                              <tr className="border-b border-slate-700">
                                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">名称</th>
                                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">数据类型</th>
                                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">默认值</th>
                                <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">描述</th>
                                {isEditing && (
                                  <th className="text-right px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider w-20">操作</th>
                                )}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                              {(paramTab === 'input'
                                ? displayModule.inputParameters
                                : paramTab === 'output'
                                ? displayModule.outputParameters
                                : displayModule.inOutParameters
                              ).length === 0 ? (
                                <tr>
                                  <td colSpan={isEditing ? 5 : 4} className="px-4 py-12 text-center text-slate-500">
                                    暂无参数
                                  </td>
                                </tr>
                              ) : (
                                (paramTab === 'input'
                                  ? displayModule.inputParameters
                                  : paramTab === 'output'
                                  ? displayModule.outputParameters
                                  : displayModule.inOutParameters
                                ).map((param) => (
                                  <tr key={param.id} className="hover:bg-slate-700/30">
                                    <td className="px-4 py-2.5">
                                      {isEditing ? (
                                        <input
                                          type="text"
                                          value={param.name}
                                          onChange={(e) =>
                                            handleUpdateParameter(paramTab, param.id, { name: e.target.value })
                                          }
                                          className="w-full h-8 px-2 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                                        />
                                      ) : (
                                        <span className="text-sm text-slate-200 font-mono">{param.name}</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2.5">
                                      {isEditing ? (
                                        <select
                                          value={param.dataType}
                                          onChange={(e) =>
                                            handleUpdateParameter(paramTab, param.id, { dataType: e.target.value })
                                          }
                                          className="h-8 px-2 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                                        >
                                          <option value="BOOL">BOOL</option>
                                          <option value="INT">INT</option>
                                          <option value="DINT">DINT</option>
                                          <option value="REAL">REAL</option>
                                          <option value="WORD">WORD</option>
                                          <option value="DWORD">DWORD</option>
                                          <option value="STRING">STRING</option>
                                        </select>
                                      ) : (
                                        <Badge variant="default" size="sm">{param.dataType}</Badge>
                                      )}
                                    </td>
                                    <td className="px-4 py-2.5">
                                      {isEditing ? (
                                        <input
                                          type="text"
                                          value={param.defaultValue || ''}
                                          onChange={(e) =>
                                            handleUpdateParameter(paramTab, param.id, { defaultValue: e.target.value })
                                          }
                                          className="w-full h-8 px-2 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 font-mono"
                                        />
                                      ) : (
                                        <span className="text-sm text-slate-400 font-mono">{param.defaultValue || '-'}</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-2.5">
                                      {isEditing ? (
                                        <input
                                          type="text"
                                          value={param.description || ''}
                                          onChange={(e) =>
                                            handleUpdateParameter(paramTab, param.id, { description: e.target.value })
                                          }
                                          className="w-full h-8 px-2 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 focus:outline-none focus:border-amber-500/50"
                                        />
                                      ) : (
                                        <span className="text-sm text-slate-400">{param.description || '-'}</span>
                                      )}
                                    </td>
                                    {isEditing && (
                                      <td className="px-4 py-2.5 text-right">
                                        <button
                                          onClick={() => handleDeleteParameter(paramTab, param.id)}
                                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="pins" className="mt-0 h-full">
                    <div className="grid grid-cols-2 gap-4 h-full">
                      <Card className="flex flex-col">
                        <CardHeader className="flex-shrink-0">
                          <CardTitle className="flex items-center gap-2">
                            <ArrowRight className="w-4 h-4 text-sky-400" />
                            输入引脚
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto p-0">
                          <div className="p-3 space-y-2">
                            {displayModule.inputParameters.length === 0 ? (
                              <p className="text-sm text-slate-500 text-center py-8">暂无输入引脚</p>
                            ) : (
                              displayModule.inputParameters.map((param, idx) => (
                                <div
                                  key={param.id}
                                  className="flex items-center gap-3 p-2.5 bg-slate-900/50 rounded border border-slate-700 hover:border-sky-600/50 transition-colors"
                                >
                                  <div className="w-3 h-3 rounded-full bg-sky-500 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-200 font-mono truncate">{param.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{param.description || param.dataType}</p>
                                  </div>
                                  <Badge variant="info" size="sm">{param.dataType}</Badge>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="flex flex-col">
                        <CardHeader className="flex-shrink-0">
                          <CardTitle className="flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4 text-emerald-400" />
                            输出引脚
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-auto p-0">
                          <div className="p-3 space-y-2">
                            {displayModule.outputParameters.length === 0 ? (
                              <p className="text-sm text-slate-500 text-center py-8">暂无输出引脚</p>
                            ) : (
                              displayModule.outputParameters.map((param, idx) => (
                                <div
                                  key={param.id}
                                  className="flex items-center gap-3 p-2.5 bg-slate-900/50 rounded border border-slate-700 hover:border-emerald-600/50 transition-colors"
                                >
                                  <Badge variant="success" size="sm">{param.dataType}</Badge>
                                  <div className="flex-1 min-w-0 text-right">
                                    <p className="text-sm font-medium text-slate-200 font-mono truncate">{param.name}</p>
                                    <p className="text-xs text-slate-500 truncate">{param.description || param.dataType}</p>
                                  </div>
                                  <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="code" className="mt-0 h-full">
                    <Card className="h-full flex flex-col">
                      <CardHeader className="flex-shrink-0">
                        <div className="flex items-center justify-between">
                          <CardTitle>代码预览</CardTitle>
                          <div className="flex items-center gap-2">
                            <Badge variant="default" size="sm">结构化文本 (ST)</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 p-0 overflow-hidden rounded-b-lg">
                        {isEditing ? (
                          <Editor
                            height="100%"
                            defaultLanguage="plaintext"
                            value={editingModule?.code || ''}
                            onChange={(value) => updateEditingField('code', value || '')}
                            theme="vs-dark"
                            options={{
                              minimap: { enabled: false },
                              fontSize: 13,
                              lineNumbers: 'on',
                              scrollBeyondLastLine: false,
                              automaticLayout: true,
                              wordWrap: 'on',
                            }}
                          />
                        ) : (
                          <Editor
                            height="100%"
                            defaultLanguage="plaintext"
                            value={displayModule.code || '// 暂无代码'}
                            theme="vs-dark"
                            options={{
                              minimap: { enabled: false },
                              fontSize: 13,
                              lineNumbers: 'on',
                              readOnly: true,
                              scrollBeyondLastLine: false,
                              automaticLayout: true,
                              wordWrap: 'on',
                            }}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </Tabs>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <Puzzle className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-base mb-1">选择一个模块查看详情</p>
              <p className="text-sm">从左侧列表中选择或创建新模块</p>
              <Button variant="primary" size="sm" className="mt-4" onClick={() => setShowNewModal(true)}>
                <Plus className="w-4 h-4" />
                新建模块
              </Button>
            </div>
          )}
        </div>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>新建模块</CardTitle>
                <button
                  onClick={() => setShowNewModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">模块类型</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNewModuleType('FB')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors',
                      newModuleType === 'FB'
                        ? 'bg-amber-600/20 border-amber-500 text-amber-200'
                        : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                    )}
                  >
                    <Box className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">FB</p>
                      <p className="text-xs opacity-70">功能块</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setNewModuleType('FC')}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors',
                      newModuleType === 'FC'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200'
                        : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                    )}
                  >
                    <FunctionSquare className="w-5 h-5" />
                    <div className="text-left">
                      <p className="font-medium">FC</p>
                      <p className="text-xs opacity-70">函数</p>
                    </div>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">模块名称 *</label>
                <input
                  type="text"
                  value={newModuleName}
                  onChange={(e) => setNewModuleName(e.target.value)}
                  placeholder="输入模块名称"
                  className="w-full h-9 px-3 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">描述</label>
                <textarea
                  value={newModuleDesc}
                  onChange={(e) => setNewModuleDesc(e.target.value)}
                  placeholder="输入模块描述（可选）"
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 resize-none"
                />
              </div>
              <div className="pt-2">
                <div className="flex items-center gap-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                  <FileCode className="w-5 h-5 text-sky-400 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-200">从模板创建</p>
                    <p className="text-xs text-slate-500">使用预设模板快速创建模块</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4" />
                    选择模板
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowNewModal(false)}>
                  取消
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNewModule}
                  disabled={!newModuleName.trim()}
                >
                  <Plus className="w-4 h-4" />
                  创建
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ModuleConfig;
