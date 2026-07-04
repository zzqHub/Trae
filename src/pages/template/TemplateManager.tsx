import { useState, useCallback, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  Import,
  Download,
  LayoutTemplate,
  Cpu,
  Layers,
  Boxes,
  FolderOpen,
  ChevronRight,
  Edit3,
  Trash2,
  Copy,
  Eye,
  Code2,
  Settings,
  PlusCircle,
  X,
  Save,
  GripVertical,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  XCircle,
  MoreHorizontal,
  FileJson,
  Upload,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useTemplateStore } from '@/store/templateStore';
import { cn } from '@/lib/utils';
import Badge from '@/components/common/Badge';
import type {
  Template,
  TemplateCategory,
  TemplateVariable,
  TemplateVariableType,
  PlcBrand,
} from '@/types';

const categoryConfig: { value: TemplateCategory | 'all'; label: string; icon: any; color: string }[] = [
  { value: 'all', label: '全部模板', icon: LayoutTemplate, color: 'text-industrial-400 bg-industrial-500/20' },
  { value: 'device', label: '设备模板', icon: Cpu, color: 'text-purple-400 bg-purple-500/20' },
  { value: 'station', label: '工位模板', icon: Layers, color: 'text-emerald-400 bg-emerald-500/20' },
  { value: 'module', label: '模块模板', icon: Boxes, color: 'text-warning-400 bg-warning-500/20' },
  { value: 'project', label: '项目模板', icon: FolderOpen, color: 'text-sky-400 bg-sky-500/20' },
];

const plcBrands: PlcBrand[] = ['siemens', 'mitsubishi', 'omron', 'delta'];

const brandLabels: Record<string, string> = {
  siemens: '西门子',
  mitsubishi: '三菱',
  omron: '欧姆龙',
  delta: '台达',
};

const variableTypeOptions: { value: TemplateVariableType; label: string }[] = [
  { value: 'string', label: '字符串' },
  { value: 'number', label: '数字' },
  { value: 'boolean', label: '布尔' },
  { value: 'enum', label: '枚举' },
  { value: 'ioAddress', label: 'IO地址' },
];

export default function TemplateManager() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const templates = useTemplateStore((s) => s.templates);
  const filteredTemplates = useTemplateStore((s) => s.filteredTemplates);
  const currentTemplate = useTemplateStore((s) => s.currentTemplate);
  const searchQuery = useTemplateStore((s) => s.searchQuery);
  const filterCategory = useTemplateStore((s) => s.filterCategory);
  const isEditing = useTemplateStore((s) => s.isEditing);

  const setCurrentTemplate = useTemplateStore((s) => s.setCurrentTemplate);
  const setSearchQuery = useTemplateStore((s) => s.setSearchQuery);
  const setFilterCategory = useTemplateStore((s) => s.setFilterCategory);
  const setIsEditing = useTemplateStore((s) => s.setIsEditing);
  const addTemplate = useTemplateStore((s) => s.addTemplate);
  const updateTemplate = useTemplateStore((s) => s.updateTemplate);
  const deleteTemplate = useTemplateStore((s) => s.deleteTemplate);
  const duplicateTemplate = useTemplateStore((s) => s.duplicateTemplate);
  const addVariable = useTemplateStore((s) => s.addVariable);
  const updateVariable = useTemplateStore((s) => s.updateVariable);
  const deleteVariable = useTemplateStore((s) => s.deleteVariable);
  const updateTemplateContent = useTemplateStore((s) => s.updateTemplateContent);
  const exportTemplate = useTemplateStore((s) => s.exportTemplate);
  const importTemplate = useTemplateStore((s) => s.importTemplate);

  const [showEditor, setShowEditor] = useState(false);
  const [editorTab, setEditorTab] = useState<'basic' | 'variables' | 'content' | 'preview'>('basic');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState('');

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: templates.length };
    categoryConfig.forEach((cat) => {
      if (cat.value !== 'all') {
        counts[cat.value] = templates.filter((t) => t.category === cat.value).length;
      }
    });
    return counts;
  }, [templates]);

  const handleSelectTemplate = useCallback((template: Template) => {
    setCurrentTemplate(template.id);
    setShowEditor(true);
    setIsEditing(false);
    setEditingTemplate(null);
    setEditorTab('basic');
  }, [setCurrentTemplate, setIsEditing]);

  const handleNewTemplate = useCallback(() => {
    const newTemplate = addTemplate({
      name: '新模板',
      description: '',
      category: 'module',
      plcBrands: ['siemens'],
      variables: [],
      content: { code: '// 新模板代码\n' },
      usageCount: 0,
    });
    setCurrentTemplate(newTemplate.id);
    setShowEditor(true);
    setIsEditing(true);
    setEditingTemplate(newTemplate);
    setEditorTab('basic');
  }, [addTemplate, setCurrentTemplate, setIsEditing]);

  const handleEditTemplate = useCallback(() => {
    if (currentTemplate) {
      setEditingTemplate(JSON.parse(JSON.stringify(currentTemplate)));
      setIsEditing(true);
    }
  }, [currentTemplate, setIsEditing]);

  const handleSaveTemplate = useCallback(() => {
    if (editingTemplate && currentTemplate) {
      updateTemplate(currentTemplate.id, editingTemplate);
      setIsEditing(false);
      setEditingTemplate(null);
    }
  }, [editingTemplate, currentTemplate, updateTemplate, setIsEditing]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditingTemplate(null);
  }, [setIsEditing]);

  const handleDeleteTemplate = useCallback((templateId: string) => {
    if (confirm('确定要删除这个模板吗？此操作不可撤销。')) {
      deleteTemplate(templateId);
      setShowEditor(false);
    }
  }, [deleteTemplate]);

  const handleDuplicateTemplate = useCallback((templateId: string) => {
    const newTpl = duplicateTemplate(templateId);
    setCurrentTemplate(newTpl.id);
  }, [duplicateTemplate, setCurrentTemplate]);

  const handleExportTemplate = useCallback((templateId: string) => {
    const json = exportTemplate(templateId);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template-${templateId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportTemplate]);

  const handleImportTemplate = useCallback(() => {
    const result = importTemplate(importJson);
    if (result) {
      setShowImportModal(false);
      setImportJson('');
      setCurrentTemplate(result.id);
      setShowEditor(true);
    } else {
      alert('导入失败：JSON格式不正确');
    }
  }, [importTemplate, importJson, setCurrentTemplate]);

  const handleFileImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImportJson(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  }, []);

  const handleAddVariable = useCallback(() => {
    if (!editingTemplate) return;
    const newVar: TemplateVariable = {
      id: `var-${Date.now()}`,
      name: 'newVariable',
      label: '新变量',
      type: 'string',
      required: false,
      description: '',
      defaultValue: '',
    };
    setEditingTemplate({
      ...editingTemplate,
      variables: [...editingTemplate.variables, newVar],
    });
  }, [editingTemplate]);

  const handleUpdateVariable = useCallback((varId: string, updates: Partial<TemplateVariable>) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      variables: editingTemplate.variables.map((v) =>
        v.id === varId ? { ...v, ...updates } : v
      ),
    });
  }, [editingTemplate]);

  const handleDeleteVariable = useCallback((varId: string) => {
    if (!editingTemplate) return;
    setEditingTemplate({
      ...editingTemplate,
      variables: editingTemplate.variables.filter((v) => v.id !== varId),
    });
  }, [editingTemplate]);

  const handleCodeChange = useCallback((value: string | undefined) => {
    if (!editingTemplate || value === undefined) return;
    setEditingTemplate({
      ...editingTemplate,
      content: { ...editingTemplate.content, code: value },
    });
  }, [editingTemplate]);

  const renderPreview = useCallback((template: Template) => {
    let code = template.content.code;
    template.variables.forEach((v) => {
      const defaultValue = v.defaultValue ?? '';
      code = code.replace(new RegExp(`#${v.name}`, 'g'), String(defaultValue));
      code = code.replace(new RegExp(`{{.*?${v.name}.*?}}`, 'gs'), String(defaultValue));
    });
    code = code.replace(/{{.*?}}.*?{{\/.*?}}/gs, '');
    code = code.replace(/{{.*?}}/g, '');
    return code;
  }, []);

  const displayTemplate = isEditing && editingTemplate ? editingTemplate : currentTemplate;

  return (
    <div className="h-screen flex flex-col bg-dark-950">
      <div className="h-14 border-b border-dark-700 bg-dark-900/50 backdrop-blur flex items-center px-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-industrial-500/20 flex items-center justify-center">
            <LayoutTemplate className="w-4 h-4 text-industrial-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-dark-100">模板管理</h1>
          </div>
        </div>

        <div className="flex-1 max-w-md ml-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="搜索模板..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-800 border border-dark-600 rounded-lg pl-9 pr-4 py-2 text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:border-industrial-500 focus:ring-1 focus:ring-industrial-500 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => setShowImportModal(true)}
            className="btn-secondary h-9 px-4 text-sm"
          >
            <Import className="w-4 h-4" />
            导入模板
          </button>
          <button
            onClick={handleNewTemplate}
            className="btn-primary h-9 px-4 text-sm"
          >
            <Plus className="w-4 h-4" />
            新建模板
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-56 border-r border-dark-700 bg-dark-900/30 flex flex-col">
          <div className="p-4">
            <p className="text-xs font-medium text-dark-500 uppercase tracking-wider mb-3">
              模板分类
            </p>
            <div className="space-y-1">
              {categoryConfig.map((cat) => {
                const Icon = cat.icon;
                const isActive = filterCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setFilterCategory(cat.value)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group',
                      isActive
                        ? 'bg-dark-800 text-dark-100'
                        : 'text-dark-400 hover:bg-dark-800/50 hover:text-dark-200'
                    )}
                  >
                    <div className={cn(
                      'w-7 h-7 rounded-md flex items-center justify-center transition-all',
                      isActive ? cat.color : 'bg-dark-700/50 text-dark-500 group-hover:text-dark-400'
                    )}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="flex-1 text-left">{cat.label}</span>
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded',
                      isActive ? 'bg-industrial-500/20 text-industrial-400' : 'bg-dark-700 text-dark-500'
                    )}>
                      {categoryCounts[cat.value] || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-auto p-4 border-t border-dark-700/50">
            <div className="text-xs text-dark-500">
              共 {templates.length} 个模板
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {filteredTemplates.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-dark-500">
              <LayoutTemplate className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">暂无模板</p>
              <p className="text-sm mb-4">创建您的第一个模板开始使用</p>
              <button onClick={handleNewTemplate} className="btn-primary">
                <Plus className="w-4 h-4" />
                新建模板
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTemplates.map((template, index) => {
                const catInfo = categoryConfig.find((c) => c.value === template.category);
                const Icon = catInfo?.icon || LayoutTemplate;
                const isSelected = currentTemplate?.id === template.id;

                return (
                  <div
                    key={template.id}
                    className={cn(
                      'group relative bg-dark-900 border rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-dark-lg hover:-translate-y-0.5',
                      isSelected ? 'border-industrial-500 ring-1 ring-industrial-500/50' : 'border-dark-700 hover:border-dark-600'
                    )}
                    style={{ animationDelay: `${index * 30}ms` }}
                    onClick={() => handleSelectTemplate(template)}
                  >
                    <div className={cn(
                      'h-24 flex items-center justify-center relative overflow-hidden',
                      catInfo?.color || 'bg-industrial-500/10'
                    )}>
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-dark-900/50" />
                      <Icon className="w-10 h-10 opacity-80 relative z-10" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTemplate(template.id);
                        }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-md bg-dark-900/60 backdrop-blur flex items-center justify-center text-dark-400 hover:text-danger-500 hover:bg-dark-900 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-dark-100 truncate flex-1">
                          {template.name}
                        </h3>
                      </div>

                      <p className="text-xs text-dark-500 line-clamp-2 mb-3 min-h-[32px]">
                        {template.description || '暂无描述'}
                      </p>

                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        <Badge size="sm" variant="info">
                          {catInfo?.label?.replace('模板', '')}
                        </Badge>
                        {template.plcBrands.slice(0, 2).map((brand) => (
                          <Badge key={brand} size="sm" variant="default">
                            {brandLabels[brand] || brand}
                          </Badge>
                        ))}
                        {template.plcBrands.length > 2 && (
                          <Badge size="sm" variant="default">
                            +{template.plcBrands.length - 2}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-dark-700/50">
                        <div className="flex items-center gap-1 text-xs text-dark-500">
                          <Code2 className="w-3.5 h-3.5" />
                          {template.variables.length} 变量
                        </div>
                        <div className="flex items-center gap-1 text-xs text-dark-500">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {template.usageCount || 0} 次使用
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showEditor && displayTemplate && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-dark-950/60 backdrop-blur-sm"
            onClick={() => {
              if (isEditing) {
                if (confirm('有未保存的更改，确定要关闭吗？')) {
                  setShowEditor(false);
                  setIsEditing(false);
                  setEditingTemplate(null);
                }
              } else {
                setShowEditor(false);
              }
            }}
          />
          <div className="relative w-[700px] h-full bg-dark-900 border-l border-dark-700 shadow-2xl flex flex-col animate-slide-in">
            <div className="h-14 border-b border-dark-700 flex items-center justify-between px-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-dark-100">
                  {isEditing ? '编辑模板' : '模板详情'}
                </h2>
                {!isEditing && (
                  <Badge size="sm" variant="info">
                    {categoryConfig.find((c) => c.value === displayTemplate.category)?.label}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => handleDuplicateTemplate(displayTemplate.id)}
                      className="w-8 h-8 rounded-lg bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-200 transition-colors"
                      title="复制模板"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExportTemplate(displayTemplate.id)}
                      className="w-8 h-8 rounded-lg bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-200 transition-colors"
                      title="导出模板"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleEditTemplate}
                      className="btn-primary h-8 px-3 text-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      编辑
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="btn-secondary h-8 px-3 text-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                      取消
                    </button>
                    <button
                      onClick={handleSaveTemplate}
                      className="btn-primary h-8 px-3 text-sm"
                    >
                      <Save className="w-3.5 h-3.5" />
                      保存
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    if (isEditing) {
                      if (confirm('有未保存的更改，确定要关闭吗？')) {
                        setShowEditor(false);
                        setIsEditing(false);
                        setEditingTemplate(null);
                      }
                    } else {
                      setShowEditor(false);
                    }
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-dark-800 flex items-center justify-center text-dark-400 hover:text-dark-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="border-b border-dark-700 px-4 flex-shrink-0">
              <div className="flex gap-1">
                {[
                  { value: 'basic', label: '基本信息', icon: Settings },
                  { value: 'variables', label: '变量定义', icon: Code2 },
                  { value: 'content', label: '模板内容', icon: LayoutTemplate },
                  { value: 'preview', label: '预览渲染', icon: Eye },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = editorTab === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setEditorTab(tab.value as any)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                        isActive
                          ? 'text-industrial-400 border-industrial-500'
                          : 'text-dark-400 border-transparent hover:text-dark-200'
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex-1 overflow-auto p-5">
              {editorTab === 'basic' && (
                <div className="space-y-5">
                  <div>
                    <label className="label-text">模板名称</label>
                    <input
                      type="text"
                      value={displayTemplate.name}
                      onChange={(e) =>
                        isEditing &&
                        setEditingTemplate({ ...editingTemplate!, name: e.target.value })
                      }
                      disabled={!isEditing}
                      className="input-field"
                      placeholder="请输入模板名称"
                    />
                  </div>

                  <div>
                    <label className="label-text">模板描述</label>
                    <textarea
                      value={displayTemplate.description || ''}
                      onChange={(e) =>
                        isEditing &&
                        setEditingTemplate({ ...editingTemplate!, description: e.target.value })
                      }
                      disabled={!isEditing}
                      className="input-field min-h-[80px] resize-none"
                      placeholder="请输入模板描述"
                    />
                  </div>

                  <div>
                    <label className="label-text">模板分类</label>
                    <select
                      value={displayTemplate.category}
                      onChange={(e) =>
                        isEditing &&
                        setEditingTemplate({
                          ...editingTemplate!,
                          category: e.target.value as TemplateCategory,
                        })
                      }
                      disabled={!isEditing}
                      className="select-field"
                    >
                      {categoryConfig
                        .filter((c) => c.value !== 'all')
                        .map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="label-text">支持品牌</label>
                    <div className="grid grid-cols-2 gap-2">
                      {plcBrands.map((brand) => {
                        const checked = displayTemplate.plcBrands.includes(brand);
                        return (
                          <label
                            key={brand}
                            className={cn(
                              'flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all',
                              checked
                                ? 'border-industrial-500 bg-industrial-500/10 text-industrial-300'
                                : 'border-dark-600 bg-dark-800 text-dark-300 hover:border-dark-500',
                              !isEditing && 'cursor-not-allowed opacity-70'
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(e) => {
                                if (!isEditing || !editingTemplate) return;
                                const brands = e.target.checked
                                  ? [...editingTemplate.plcBrands, brand]
                                  : editingTemplate.plcBrands.filter((b) => b !== brand);
                                setEditingTemplate({ ...editingTemplate, plcBrands: brands });
                              }}
                              disabled={!isEditing}
                              className="hidden"
                            />
                            {checked ? (
                              <CheckCircle2 className="w-4 h-4 text-industrial-400" />
                            ) : (
                              <XCircle className="w-4 h-4 text-dark-500" />
                            )}
                            <span className="text-sm">{brandLabels[brand]}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dark-700">
                    <div>
                      <p className="text-xs text-dark-500 mb-1">创建时间</p>
                      <p className="text-sm text-dark-300">
                        {new Date(displayTemplate.createdAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500 mb-1">更新时间</p>
                      <p className="text-sm text-dark-300">
                        {new Date(displayTemplate.updatedAt).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500 mb-1">使用次数</p>
                      <p className="text-sm text-dark-300">{displayTemplate.usageCount || 0} 次</p>
                    </div>
                    <div>
                      <p className="text-xs text-dark-500 mb-1">作者</p>
                      <p className="text-sm text-dark-300">{displayTemplate.author || '-'}</p>
                    </div>
                  </div>
                </div>
              )}

              {editorTab === 'variables' && (
                <div className="space-y-4">
                  {isEditing && (
                    <button
                      onClick={handleAddVariable}
                      className="w-full p-3 border-2 border-dashed border-dark-600 rounded-lg flex items-center justify-center gap-2 text-dark-400 hover:border-industrial-500 hover:text-industrial-400 transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      添加变量
                    </button>
                  )}

                  {displayTemplate.variables.length === 0 ? (
                    <div className="py-12 text-center">
                      <Code2 className="w-12 h-12 mx-auto mb-3 text-dark-600" />
                      <p className="text-dark-400">暂无变量定义</p>
                      {isEditing && (
                        <p className="text-sm text-dark-500 mt-1">点击上方按钮添加第一个变量</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {displayTemplate.variables.map((variable, index) => (
                        <div
                          key={variable.id}
                          className="bg-dark-800/50 border border-dark-700 rounded-lg p-4 transition-all hover:border-dark-600"
                        >
                          <div className="flex items-start gap-3">
                            {isEditing && (
                              <div className="mt-2 cursor-grab text-dark-600 hover:text-dark-400">
                                <GripVertical className="w-4 h-4" />
                              </div>
                            )}
                            <div className="flex-1 space-y-3">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs text-dark-500 mb-1 block">变量名</label>
                                  <input
                                    type="text"
                                    value={variable.name}
                                    onChange={(e) =>
                                      isEditing &&
                                      handleUpdateVariable(variable.id, { name: e.target.value })
                                    }
                                    disabled={!isEditing}
                                    className="w-full bg-dark-900 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:outline-none focus:border-industrial-500 disabled:opacity-70"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs text-dark-500 mb-1 block">显示标签</label>
                                  <input
                                    type="text"
                                    value={variable.label}
                                    onChange={(e) =>
                                      isEditing &&
                                      handleUpdateVariable(variable.id, { label: e.target.value })
                                    }
                                    disabled={!isEditing}
                                    className="w-full bg-dark-900 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:outline-none focus:border-industrial-500 disabled:opacity-70"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs text-dark-500 mb-1 block">类型</label>
                                  <select
                                    value={variable.type}
                                    onChange={(e) =>
                                      isEditing &&
                                      handleUpdateVariable(variable.id, {
                                        type: e.target.value as TemplateVariableType,
                                      })
                                    }
                                    disabled={!isEditing}
                                    className="w-full bg-dark-900 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:outline-none focus:border-industrial-500 disabled:opacity-70"
                                  >
                                    {variableTypeOptions.map((opt) => (
                                      <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div className="flex items-end gap-2">
                                  <div className="flex-1">
                                    <label className="text-xs text-dark-500 mb-1 block">默认值</label>
                                    <input
                                      type="text"
                                      value={String(variable.defaultValue ?? '')}
                                      onChange={(e) =>
                                        isEditing &&
                                        handleUpdateVariable(variable.id, {
                                          defaultValue: e.target.value,
                                        })
                                      }
                                      disabled={!isEditing}
                                      className="w-full bg-dark-900 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:outline-none focus:border-industrial-500 disabled:opacity-70"
                                    />
                                  </div>
                                  <div className="flex items-center gap-1 pb-1.5">
                                    <button
                                      onClick={() =>
                                        isEditing &&
                                        handleUpdateVariable(variable.id, {
                                          required: !variable.required,
                                        })
                                      }
                                      disabled={!isEditing}
                                      className="text-xs text-dark-400 flex items-center gap-1 disabled:opacity-70"
                                    >
                                      {variable.required ? (
                                        <ToggleRight className="w-8 h-8 text-industrial-500" />
                                      ) : (
                                        <ToggleLeft className="w-8 h-8 text-dark-600" />
                                      )}
                                      必填
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="text-xs text-dark-500 mb-1 block">描述</label>
                                <input
                                  type="text"
                                  value={variable.description || ''}
                                  onChange={(e) =>
                                    isEditing &&
                                    handleUpdateVariable(variable.id, { description: e.target.value })
                                  }
                                  disabled={!isEditing}
                                  className="w-full bg-dark-900 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:outline-none focus:border-industrial-500 disabled:opacity-70"
                                  placeholder="变量描述说明"
                                />
                              </div>
                            </div>
                            {isEditing && (
                              <button
                                onClick={() => handleDeleteVariable(variable.id)}
                                className="w-7 h-7 rounded hover:bg-danger-500/20 flex items-center justify-center text-dark-500 hover:text-danger-500 transition-colors flex-shrink-0"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {editorTab === 'content' && (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-dark-400">模板代码</p>
                    <div className="flex items-center gap-2">
                      <Badge size="sm" variant="info">
                        {displayTemplate.content.code.split('\n').length} 行
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-1 min-h-[400px] rounded-lg overflow-hidden border border-dark-700">
                    <Editor
                      height="100%"
                      defaultLanguage="javascript"
                      value={displayTemplate.content.code}
                      onChange={isEditing ? handleCodeChange : undefined}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        readOnly: !isEditing,
                      }}
                    />
                  </div>
                </div>
              )}

              {editorTab === 'preview' && (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm text-dark-400">渲染预览（使用默认变量值）</p>
                    <Badge size="sm" variant="success">
                      实时预览
                    </Badge>
                  </div>
                  <div className="flex-1 min-h-[400px] rounded-lg overflow-hidden border border-dark-700 bg-dark-950">
                    <Editor
                      height="100%"
                      defaultLanguage="javascript"
                      value={renderPreview(displayTemplate)}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        wordWrap: 'on',
                        readOnly: true,
                        domReadOnly: true,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-dark-950/70 backdrop-blur-sm"
            onClick={() => setShowImportModal(false)}
          />
          <div className="relative w-[500px] bg-dark-900 border border-dark-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="h-14 border-b border-dark-700 flex items-center justify-between px-5">
              <h3 className="font-semibold text-dark-100">导入模板</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-dark-800 flex items-center justify-center text-dark-400 hover:text-dark-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="border-2 border-dashed border-dark-600 rounded-lg p-8 text-center hover:border-industrial-500/50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
                <FileJson className="w-12 h-12 mx-auto mb-3 text-dark-500" />
                <p className="text-dark-300 mb-2">拖拽JSON文件到此处</p>
                <p className="text-sm text-dark-500 mb-4">或选择文件导入</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-secondary"
                >
                  <Upload className="w-4 h-4" />
                  选择文件
                </button>
              </div>

              <div>
                <label className="label-text">或粘贴JSON内容</label>
                <textarea
                  value={importJson}
                  onChange={(e) => setImportJson(e.target.value)}
                  className="input-field min-h-[200px] resize-none font-mono text-xs"
                  placeholder='{"id": "tpl-xxx", "name": "模板名称", ...}'
                />
              </div>
            </div>

            <div className="h-14 border-t border-dark-700 flex items-center justify-end gap-2 px-5">
              <button
                onClick={() => setShowImportModal(false)}
                className="btn-secondary h-8 px-4 text-sm"
              >
                取消
              </button>
              <button
                onClick={handleImportTemplate}
                disabled={!importJson.trim()}
                className="btn-primary h-8 px-4 text-sm disabled:opacity-50"
              >
                <Import className="w-4 h-4" />
                导入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
