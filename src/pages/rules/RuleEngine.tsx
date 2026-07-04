import { useState, useCallback, useMemo, useRef } from 'react';
import {
  Search,
  Plus,
  Import,
  Download,
  Settings,
  Play,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Zap,
  Shield,
  RefreshCw,
  Trash2,
  Copy,
  Edit3,
  X,
  Save,
  PlusCircle,
  GripVertical,
  ChevronDown,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Filter,
  Activity,
  Cpu,
  Layers,
  Timer,
  Hash,
  Send,
  Bell,
  FileText,
  List,
  GitBranch,
  CircleDot,
  MoreHorizontal,
  FileJson,
  Upload,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useRuleStore } from '@/store/ruleStore';
import { cn } from '@/lib/utils';
import Badge from '@/components/common/Badge';
import type {
  Rule,
  RuleType,
  RuleStatus,
  RuleCondition,
  RuleConditionGroup,
  RuleAction,
  ConditionOperator,
  ActionType,
  LogicalOperator,
  ActionParameter,
  RuleExecutionLog,
} from '@/types';

const ruleTypeConfig: { value: RuleType | 'all'; label: string; icon: any; color: string }[] = [
  { value: 'all', label: '全部规则', icon: List, color: 'text-industrial-400 bg-industrial-500/20' },
  { value: 'event', label: '事件触发', icon: Zap, color: 'text-amber-400 bg-amber-500/20' },
  { value: 'condition', label: '条件触发', icon: Shield, color: 'text-emerald-400 bg-emerald-500/20' },
  { value: 'cycle', label: '周期触发', icon: RefreshCw, color: 'text-purple-400 bg-purple-500/20' },
  { value: 'manual', label: '手动触发', icon: Play, color: 'text-sky-400 bg-sky-500/20' },
];

const statusConfig: Record<RuleStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
  active: { label: '运行中', variant: 'success' },
  inactive: { label: '已停用', variant: 'warning' },
  paused: { label: '已暂停', variant: 'info' },
  error: { label: '异常', variant: 'error' },
};

const conditionTypeOptions: { value: RuleCondition['type']; label: string; icon: any; color: string }[] = [
  { value: 'io', label: 'IO信号', icon: Cpu, color: 'text-emerald-400' },
  { value: 'variable', label: '变量', icon: Hash, color: 'text-purple-400' },
  { value: 'timer', label: '定时器', icon: Timer, color: 'text-amber-400' },
  { value: 'counter', label: '计数器', icon: Layers, color: 'text-sky-400' },
  { value: 'time', label: '时间', icon: Clock, color: 'text-pink-400' },
];

const operatorOptions: { value: ConditionOperator; label: string }[] = [
  { value: 'eq', label: '等于 (==)' },
  { value: 'ne', label: '不等于 (!=)' },
  { value: 'gt', label: '大于 (>)' },
  { value: 'lt', label: '小于 (<)' },
  { value: 'gte', label: '大于等于 (>=)' },
  { value: 'lte', label: '小于等于 (<=)' },
  { value: 'between', label: '在...之间' },
  { value: 'contains', label: '包含' },
  { value: 'startsWith', label: '开头为' },
  { value: 'endsWith', label: '结尾为' },
];

const actionTypeOptions: { value: ActionType; label: string; icon: any; color: string }[] = [
  { value: 'setOutput', label: '设置输出', icon: Cpu, color: 'text-emerald-400' },
  { value: 'callModule', label: '调用模块', icon: GitBranch, color: 'text-purple-400' },
  { value: 'sendNotification', label: '发送通知', icon: Bell, color: 'text-amber-400' },
  { value: 'logEvent', label: '记录事件', icon: FileText, color: 'text-sky-400' },
  { value: 'startTimer', label: '启动定时器', icon: Timer, color: 'text-pink-400' },
  { value: 'stopTimer', label: '停止定时器', icon: Timer, color: 'text-rose-400' },
  { value: 'resetCounter', label: '重置计数器', icon: Hash, color: 'text-indigo-400' },
  { value: 'incrementCounter', label: '增加计数', icon: Plus, color: 'text-teal-400' },
  { value: 'decrementCounter', label: '减少计数', icon: Trash2, color: 'text-orange-400' },
];

export default function RuleEngine() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rules = useRuleStore((s) => s.rules);
  const filteredRules = useRuleStore((s) => s.filteredRules);
  const currentRule = useRuleStore((s) => s.currentRule);
  const searchQuery = useRuleStore((s) => s.searchQuery);
  const executionLogs = useRuleStore((s) => s.executionLogs);

  const setCurrentRule = useRuleStore((s) => s.setCurrentRule);
  const setSearchQuery = useRuleStore((s) => s.setSearchQuery);
  const addRule = useRuleStore((s) => s.addRule);
  const updateRule = useRuleStore((s) => s.updateRule);
  const deleteRule = useRuleStore((s) => s.deleteRule);
  const duplicateRule = useRuleStore((s) => s.duplicateRule);
  const toggleRule = useRuleStore((s) => s.toggleRule);
  const updateConditionGroup = useRuleStore((s) => s.updateConditionGroup);
  const addCondition = useRuleStore((s) => s.addCondition);
  const updateCondition = useRuleStore((s) => s.updateCondition);
  const deleteCondition = useRuleStore((s) => s.deleteCondition);
  const addAction = useRuleStore((s) => s.addAction);
  const updateAction = useRuleStore((s) => s.updateAction);
  const deleteAction = useRuleStore((s) => s.deleteAction);
  const toggleAction = useRuleStore((s) => s.toggleAction);
  const testRule = useRuleStore((s) => s.testRule);
  const exportRule = useRuleStore((s) => s.exportRule);
  const importRule = useRuleStore((s) => s.importRule);
  const getExecutionLogsByRule = useRuleStore((s) => s.getExecutionLogsByRule);

  const [filterType, setFilterType] = useState<RuleType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<RuleStatus | 'all'>('all');
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [testData, setTestData] = useState('{\n  "电机运行": true,\n  "热继电器": true\n}');
  const [testResult, setTestResult] = useState<RuleExecutionLog | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTestTab, setActiveTestTab] = useState<'input' | 'result'>('input');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const filteredByTypeAndStatus = useMemo(() => {
    return filteredRules.filter((r) => {
      const matchesType = filterType === 'all' || r.type === filterType;
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
      return matchesType && matchesStatus;
    });
  }, [filteredRules, filterType, filterStatus]);

  const groupedRules = useMemo(() => {
    const groups: Record<string, Rule[]> = {};
    filteredByTypeAndStatus.forEach((rule) => {
      const type = rule.type;
      if (!groups[type]) groups[type] = [];
      groups[type].push(rule);
    });
    return groups;
  }, [filteredByTypeAndStatus]);

  const handleSelectRule = useCallback((rule: Rule) => {
    setCurrentRule(rule.id);
    setIsEditing(false);
    setEditingRule(null);
    setTestResult(null);
    setActiveTestTab('input');
  }, [setCurrentRule]);

  const handleNewRule = useCallback(() => {
    const newRule = addRule({
      name: '新规则',
      description: '',
      type: 'condition',
      status: 'inactive',
      priority: 5,
      enabled: false,
      conditions: {
        id: `cond-group-${Date.now()}`,
        logicalOperator: 'and',
        conditions: [],
        groups: [],
      },
      actions: [],
      triggerCount: 0,
    });
    setCurrentRule(newRule.id);
    setIsEditing(true);
    setEditingRule(newRule);
  }, [addRule, setCurrentRule]);

  const handleEditRule = useCallback(() => {
    if (currentRule) {
      setEditingRule(JSON.parse(JSON.stringify(currentRule)));
      setIsEditing(true);
    }
  }, [currentRule]);

  const handleSaveRule = useCallback(() => {
    if (editingRule && currentRule) {
      updateRule(currentRule.id, editingRule);
      setIsEditing(false);
      setEditingRule(null);
    }
  }, [editingRule, currentRule, updateRule]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditingRule(null);
  }, []);

  const handleDeleteRule = useCallback((ruleId: string) => {
    if (confirm('确定要删除这个规则吗？此操作不可撤销。')) {
      deleteRule(ruleId);
    }
  }, [deleteRule]);

  const handleDuplicateRule = useCallback((ruleId: string) => {
    const newRule = duplicateRule(ruleId);
    setCurrentRule(newRule.id);
  }, [duplicateRule, setCurrentRule]);

  const handleToggleRule = useCallback((ruleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleRule(ruleId);
  }, [toggleRule]);

  const handleExportRule = useCallback((ruleId: string) => {
    const json = exportRule(ruleId);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rule-${ruleId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportRule]);

  const handleImportRule = useCallback(() => {
    const result = importRule(importJson);
    if (result) {
      setShowImportModal(false);
      setImportJson('');
      setCurrentRule(result.id);
    } else {
      alert('导入失败：JSON格式不正确');
    }
  }, [importRule, importJson, setCurrentRule]);

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

  const displayRule = isEditing && editingRule ? editingRule : currentRule;

  const handleAddCondition = useCallback((groupId: string) => {
    if (!editingRule) return;
    const newCondition: RuleCondition = {
      id: `cond-${Date.now()}`,
      type: 'io',
      sourceName: '信号名',
      operator: 'eq',
      value: true,
      description: '',
    };

    const addToGroup = (group: RuleConditionGroup): RuleConditionGroup => {
      if (group.id === groupId) {
        return { ...group, conditions: [...group.conditions, newCondition] };
      }
      return { ...group, groups: group.groups?.map(addToGroup) };
    };

    setEditingRule({
      ...editingRule,
      conditions: addToGroup(editingRule.conditions),
    });
  }, [editingRule]);

  const handleUpdateCondition = useCallback((conditionId: string, updates: Partial<RuleCondition>) => {
    if (!editingRule) return;

    const updateInGroup = (group: RuleConditionGroup): RuleConditionGroup => ({
      ...group,
      conditions: group.conditions.map((c) =>
        c.id === conditionId ? { ...c, ...updates } : c
      ),
      groups: group.groups?.map(updateInGroup),
    });

    setEditingRule({
      ...editingRule,
      conditions: updateInGroup(editingRule.conditions),
    });
  }, [editingRule]);

  const handleDeleteCondition = useCallback((conditionId: string) => {
    if (!editingRule) return;

    const deleteFromGroup = (group: RuleConditionGroup): RuleConditionGroup => ({
      ...group,
      conditions: group.conditions.filter((c) => c.id !== conditionId),
      groups: group.groups?.map(deleteFromGroup),
    });

    setEditingRule({
      ...editingRule,
      conditions: deleteFromGroup(editingRule.conditions),
    });
  }, [editingRule]);

  const handleAddGroup = useCallback((parentGroupId: string) => {
    if (!editingRule) return;
    const newGroup: RuleConditionGroup = {
      id: `cond-group-${Date.now()}`,
      logicalOperator: 'and',
      conditions: [],
      groups: [],
    };

    const addGroupToParent = (group: RuleConditionGroup): RuleConditionGroup => {
      if (group.id === parentGroupId) {
        return { ...group, groups: [...(group.groups || []), newGroup] };
      }
      return { ...group, groups: group.groups?.map(addGroupToParent) };
    };

    setEditingRule({
      ...editingRule,
      conditions: addGroupToParent(editingRule.conditions),
    });
    setExpandedGroups((prev) => new Set(prev).add(newGroup.id));
  }, [editingRule]);

  const handleUpdateGroup = useCallback((groupId: string, updates: Partial<RuleConditionGroup>) => {
    if (!editingRule) return;

    const updateGroup = (group: RuleConditionGroup): RuleConditionGroup => {
      if (group.id === groupId) {
        return { ...group, ...updates };
      }
      return { ...group, groups: group.groups?.map(updateGroup) };
    };

    setEditingRule({
      ...editingRule,
      conditions: updateGroup(editingRule.conditions),
    });
  }, [editingRule]);

  const handleDeleteGroup = useCallback((groupId: string) => {
    if (!editingRule) return;

    const deleteGroup = (group: RuleConditionGroup): RuleConditionGroup => ({
      ...group,
      groups: group.groups?.filter((g) => g.id !== groupId).map(deleteGroup),
    });

    if (editingRule.conditions.id === groupId) return;

    setEditingRule({
      ...editingRule,
      conditions: deleteGroup(editingRule.conditions),
    });
  }, [editingRule]);

  const toggleGroupExpand = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  const handleAddAction = useCallback(() => {
    if (!editingRule) return;
    const newAction: RuleAction = {
      id: `action-${Date.now()}`,
      type: 'setOutput',
      name: '新动作',
      description: '',
      enabled: true,
      parameters: [
        { name: 'value', value: true, dataType: 'BOOL' },
      ],
    };
    setEditingRule({
      ...editingRule,
      actions: [...editingRule.actions, newAction],
    });
  }, [editingRule]);

  const handleUpdateAction = useCallback((actionId: string, updates: Partial<RuleAction>) => {
    if (!editingRule) return;
    setEditingRule({
      ...editingRule,
      actions: editingRule.actions.map((a) =>
        a.id === actionId ? { ...a, ...updates } : a
      ),
    });
  }, [editingRule]);

  const handleDeleteAction = useCallback((actionId: string) => {
    if (!editingRule) return;
    setEditingRule({
      ...editingRule,
      actions: editingRule.actions.filter((a) => a.id !== actionId),
    });
  }, [editingRule]);

  const handleToggleAction = useCallback((actionId: string) => {
    if (!editingRule) return;
    const action = editingRule.actions.find((a) => a.id === actionId);
    if (!action) return;
    handleUpdateAction(actionId, { enabled: !action.enabled });
  }, [editingRule, handleUpdateAction]);

  const handleUpdateActionParam = useCallback((actionId: string, paramIndex: number, value: string | number | boolean) => {
    if (!editingRule) return;
    setEditingRule({
      ...editingRule,
      actions: editingRule.actions.map((a) => {
        if (a.id !== actionId) return a;
        const newParams = [...a.parameters];
        newParams[paramIndex] = { ...newParams[paramIndex], value };
        return { ...a, parameters: newParams };
      }),
    });
  }, [editingRule]);

  const handleRunTest = useCallback(async () => {
    if (!currentRule) return;
    setIsTesting(true);
    try {
      const testDataObj = JSON.parse(testData);
      const result = await testRule(currentRule.id, testDataObj);
      setTestResult(result.logs);
      setActiveTestTab('result');
    } catch (e) {
      alert('测试失败：请检查JSON格式是否正确');
    } finally {
      setIsTesting(false);
    }
  }, [currentRule, testData, testRule]);

  const renderConditionGroup = useCallback((group: RuleConditionGroup, level: number = 0) => {
    const isExpanded = !expandedGroups.has(group.id);
    const isRoot = level === 0;

    return (
      <div
        key={group.id}
        className={cn(
          'border border-dark-700 rounded-lg bg-dark-800/30',
          level > 0 && 'ml-6'
        )}
      >
        <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-700/50">
          {group.groups && group.groups.length > 0 && (
            <button
              onClick={() => toggleGroupExpand(group.id)}
              className="w-5 h-5 flex items-center justify-center text-dark-400 hover:text-dark-200"
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
          <span className="text-xs font-medium text-dark-400">
            {isRoot ? '条件组' : `嵌套组 ${level}`}
          </span>
          {isEditing && (
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center bg-dark-900 rounded-md p-0.5 border border-dark-600">
                <button
                  onClick={() => handleUpdateGroup(group.id, { logicalOperator: 'and' })}
                  className={cn(
                    'px-2 py-1 text-xs rounded transition-colors',
                    group.logicalOperator === 'and'
                      ? 'bg-industrial-500 text-white'
                      : 'text-dark-400 hover:text-dark-200'
                  )}
                >
                  AND
                </button>
                <button
                  onClick={() => handleUpdateGroup(group.id, { logicalOperator: 'or' })}
                  className={cn(
                    'px-2 py-1 text-xs rounded transition-colors',
                    group.logicalOperator === 'or'
                      ? 'bg-industrial-500 text-white'
                      : 'text-dark-400 hover:text-dark-200'
                  )}
                >
                  OR
                </button>
              </div>
              {!isRoot && (
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="w-6 h-6 rounded hover:bg-danger-500/20 flex items-center justify-center text-dark-500 hover:text-danger-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="p-3 space-y-2">
            {group.conditions.length === 0 ? (
              <div className="text-center py-4 text-dark-500 text-sm">
                暂无条件
                {isEditing && '，点击下方按钮添加'}
              </div>
            ) : (
              <div className="space-y-2">
                {group.conditions.map((condition, idx) => {
                  const typeInfo = conditionTypeOptions.find((t) => t.value === condition.type);
                  const TypeIcon = typeInfo?.icon || CircleDot;
                  return (
                    <div
                      key={condition.id}
                      className="flex items-start gap-2 bg-dark-900/50 border border-dark-700 rounded-lg p-3 group"
                    >
                      {isEditing && (
                        <div className="mt-1.5 cursor-grab text-dark-600 group-hover:text-dark-400">
                          <GripVertical className="w-4 h-4" />
                        </div>
                      )}
                      <div className={cn(
                        'w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5',
                        typeInfo ? `${typeInfo.color} bg-dark-800` : 'text-dark-500'
                      )}>
                        <TypeIcon className="w-4 h-4" />
                      </div>

                      {isEditing ? (
                        <div className="flex-1 space-y-2">
                          <div className="grid grid-cols-3 gap-2">
                            <select
                              value={condition.type}
                              onChange={(e) =>
                                handleUpdateCondition(condition.id, {
                                  type: e.target.value as RuleCondition['type'],
                                })
                              }
                              className="bg-dark-800 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:outline-none focus:border-industrial-500"
                            >
                              {conditionTypeOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              value={condition.sourceName || ''}
                              onChange={(e) =>
                                handleUpdateCondition(condition.id, { sourceName: e.target.value })
                              }
                              className="bg-dark-800 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:outline-none focus:border-industrial-500"
                              placeholder="信号/变量名"
                            />
                            <select
                              value={condition.operator}
                              onChange={(e) =>
                                handleUpdateCondition(condition.id, {
                                  operator: e.target.value as ConditionOperator,
                                })
                              }
                              className="bg-dark-800 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:outline-none focus:border-industrial-500"
                            >
                              {operatorOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={String(condition.value)}
                              onChange={(e) =>
                                handleUpdateCondition(condition.id, { value: e.target.value })
                              }
                              className="flex-1 bg-dark-800 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:outline-none focus:border-industrial-500"
                              placeholder="目标值"
                            />
                            <button
                              onClick={() => handleDeleteCondition(condition.id)}
                              className="w-7 h-7 rounded hover:bg-danger-500/20 flex items-center justify-center text-dark-500 hover:text-danger-500"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-dark-200 font-medium">{condition.sourceName}</span>
                            <span className="text-dark-500">
                              {operatorOptions.find((o) => o.value === condition.operator)?.label || condition.operator}
                            </span>
                            <span className="text-industrial-400 font-mono">{String(condition.value)}</span>
                          </div>
                          {condition.description && (
                            <p className="text-xs text-dark-500 mt-1">{condition.description}</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {isEditing && (
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => handleAddCondition(group.id)}
                  className="flex-1 py-2 border border-dashed border-dark-600 rounded-lg text-sm text-dark-400 hover:border-industrial-500 hover:text-industrial-400 transition-colors flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  添加条件
                </button>
                <button
                  onClick={() => handleAddGroup(group.id)}
                  className="py-2 px-4 border border-dashed border-dark-600 rounded-lg text-sm text-dark-400 hover:border-purple-500 hover:text-purple-400 transition-colors flex items-center justify-center gap-2"
                >
                  <GitBranch className="w-4 h-4" />
                  嵌套组
                </button>
              </div>
            )}

            {group.groups && group.groups.length > 0 && isExpanded && (
              <div className="space-y-2 mt-3 pt-3 border-t border-dark-700/50">
                {group.groups.map((g) => renderConditionGroup(g, level + 1))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }, [isEditing, expandedGroups, toggleGroupExpand, handleUpdateGroup, handleDeleteGroup, handleAddCondition, handleAddGroup, handleUpdateCondition, handleDeleteCondition]);

  const currentRuleLogs = useMemo(() => {
    if (!currentRule) return [];
    return getExecutionLogsByRule(currentRule.id).slice(0, 10);
  }, [currentRule, getExecutionLogsByRule, executionLogs]);

  return (
    <div className="h-screen flex flex-col bg-dark-950">
      <div className="h-14 border-b border-dark-700 bg-dark-900/50 backdrop-blur flex items-center px-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-dark-100">规则引擎</h1>
          </div>
        </div>

        <div className="flex-1 max-w-md ml-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="搜索规则..."
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
            导入规则
          </button>
          <button
            onClick={handleNewRule}
            className="btn-primary h-9 px-4 text-sm"
          >
            <Plus className="w-4 h-4" />
            新建规则
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 border-r border-dark-700 bg-dark-900/30 flex flex-col">
          <div className="p-4 border-b border-dark-700/50">
            <p className="text-xs font-medium text-dark-500 uppercase tracking-wider mb-3">
              筛选条件
            </p>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-dark-500 mb-1 block">规则类型</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-dark-100 focus:outline-none focus:border-industrial-500"
                >
                  {ruleTypeConfig.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-dark-500 mb-1 block">状态</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg px-3 py-1.5 text-sm text-dark-100 focus:outline-none focus:border-industrial-500"
                >
                  <option value="all">全部状态</option>
                  {Object.entries(statusConfig).map(([value, config]) => (
                    <option key={value} value={value}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {Object.entries(groupedRules).length === 0 ? (
              <div className="text-center py-12">
                <Zap className="w-12 h-12 mx-auto mb-3 text-dark-600" />
                <p className="text-dark-400 text-sm">暂无规则</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedRules).map(([type, rulesList]) => {
                  const typeInfo = ruleTypeConfig.find((t) => t.value === type);
                  const TypeIcon = typeInfo?.icon || Zap;
                  return (
                    <div key={type}>
                      <div className="flex items-center gap-2 mb-3 px-1">
                        <div className={cn('w-5 h-5 rounded flex items-center justify-center', typeInfo?.color)}>
                          <TypeIcon className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-medium text-dark-300">
                          {typeInfo?.label}
                        </span>
                        <span className="text-xs text-dark-500">
                          ({rulesList.length})
                        </span>
                      </div>
                      <div className="space-y-1">
                        {rulesList.map((rule) => {
                          const isSelected = currentRule?.id === rule.id;
                          return (
                            <div
                              key={rule.id}
                              onClick={() => handleSelectRule(rule)}
                              className={cn(
                                'group relative px-3 py-2.5 rounded-lg cursor-pointer transition-all',
                                isSelected
                                  ? 'bg-dark-800 border border-industrial-500/50'
                                  : 'hover:bg-dark-800/50 border border-transparent'
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={cn(
                                      'w-2 h-2 rounded-full',
                                      rule.enabled && rule.status === 'active'
                                        ? 'bg-success-500 glow-green'
                                        : 'bg-dark-600'
                                    )} />
                                    <h4 className="text-sm font-medium text-dark-200 truncate">
                                      {rule.name}
                                    </h4>
                                  </div>
                                  <p className="text-xs text-dark-500 truncate">
                                    {rule.description || '暂无描述'}
                                  </p>
                                </div>
                                <button
                                  onClick={(e) => handleToggleRule(rule.id, e)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  {rule.enabled ? (
                                    <ToggleRight className="w-8 h-8 text-success-500" />
                                  ) : (
                                    <ToggleLeft className="w-8 h-8 text-dark-600" />
                                  )}
                                </button>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-dark-500">
                                  优先级 {rule.priority}
                                </span>
                                <span className="text-xs text-dark-600">·</span>
                                <span className="text-xs text-dark-500">
                                  {rule.triggerCount || 0} 次触发
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-dark-700/50">
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-dark-800/50 rounded-lg p-2">
                <div className="text-lg font-semibold text-success-400">
                  {rules.filter((r) => r.enabled).length}
                </div>
                <div className="text-xs text-dark-500">运行中</div>
              </div>
              <div className="bg-dark-800/50 rounded-lg p-2">
                <div className="text-lg font-semibold text-dark-300">
                  {rules.length}
                </div>
                <div className="text-xs text-dark-500">总规则</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {!displayRule ? (
            <div className="flex-1 flex flex-col items-center justify-center text-dark-500">
              <Zap className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">选择一个规则</p>
              <p className="text-sm mb-4">从左侧列表选择规则进行查看和编辑</p>
              <button onClick={handleNewRule} className="btn-primary">
                <Plus className="w-4 h-4" />
                新建规则
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="h-14 border-b border-dark-700 flex items-center justify-between px-5">
                  <div className="flex items-center gap-3">
                    <Badge variant={statusConfig[displayRule.status].variant}>
                      {statusConfig[displayRule.status].label}
                    </Badge>
                    <h2 className="font-semibold text-dark-100">{displayRule.name}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isEditing ? (
                      <>
                        <button
                          onClick={() => handleDuplicateRule(displayRule.id)}
                          className="w-8 h-8 rounded-lg bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-200 transition-colors"
                          title="复制规则"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportRule(displayRule.id)}
                          className="w-8 h-8 rounded-lg bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-200 transition-colors"
                          title="导出规则"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(displayRule.id)}
                          className="w-8 h-8 rounded-lg bg-dark-800 hover:bg-dark-700 flex items-center justify-center text-dark-400 hover:text-danger-500 transition-colors"
                          title="删除规则"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleEditRule}
                          className="btn-primary h-8 px-3 text-sm ml-2"
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
                          onClick={handleSaveRule}
                          className="btn-primary h-8 px-3 text-sm"
                        >
                          <Save className="w-3.5 h-3.5" />
                          保存
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-5 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-text">规则名称</label>
                      <input
                        type="text"
                        value={displayRule.name}
                        onChange={(e) =>
                          isEditing &&
                          setEditingRule({ ...editingRule!, name: e.target.value })
                        }
                        disabled={!isEditing}
                        className="input-field"
                        placeholder="请输入规则名称"
                      />
                    </div>
                    <div>
                      <label className="label-text">优先级</label>
                      <input
                        type="number"
                        value={displayRule.priority}
                        onChange={(e) =>
                          isEditing &&
                          setEditingRule({
                            ...editingRule!,
                            priority: parseInt(e.target.value) || 0,
                          })
                        }
                        disabled={!isEditing}
                        className="input-field"
                        placeholder="数字越小优先级越高"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label-text">规则类型</label>
                      <select
                        value={displayRule.type}
                        onChange={(e) =>
                          isEditing &&
                          setEditingRule({ ...editingRule!, type: e.target.value as RuleType })
                        }
                        disabled={!isEditing}
                        className="select-field"
                      >
                        {ruleTypeConfig
                          .filter((t) => t.value !== 'all')
                          .map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="label-text">启用状态</label>
                      <div className="h-9 flex items-center">
                        <button
                          onClick={() => {
                            if (!isEditing) {
                              toggleRule(displayRule.id);
                            } else {
                              setEditingRule({
                                ...editingRule!,
                                enabled: !editingRule!.enabled,
                              });
                            }
                          }}
                          className="flex items-center gap-2 text-sm text-dark-300"
                        >
                          {displayRule.enabled ? (
                            <>
                              <ToggleRight className="w-10 h-10 text-success-500" />
                              <span className="text-success-400">已启用</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-10 h-10 text-dark-600" />
                              <span className="text-dark-500">已停用</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="label-text">规则描述</label>
                    <textarea
                      value={displayRule.description || ''}
                      onChange={(e) =>
                        isEditing &&
                        setEditingRule({ ...editingRule!, description: e.target.value })
                      }
                      disabled={!isEditing}
                      className="input-field min-h-[60px] resize-none"
                      placeholder="请输入规则描述"
                    />
                  </div>

                  <div className="pt-4 border-t border-dark-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="section-title !mb-0">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        条件配置
                      </h3>
                    </div>
                    {renderConditionGroup(displayRule.conditions)}
                  </div>

                  <div className="pt-4 border-t border-dark-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="section-title !mb-0">
                        <Activity className="w-5 h-5 text-amber-400" />
                        动作配置
                      </h3>
                      <span className="text-xs text-dark-500">
                        {displayRule.actions.length} 个动作
                      </span>
                    </div>

                    {isEditing && (
                      <button
                        onClick={handleAddAction}
                        className="w-full mb-4 p-3 border-2 border-dashed border-dark-600 rounded-lg flex items-center justify-center gap-2 text-dark-400 hover:border-amber-500 hover:text-amber-400 transition-colors"
                      >
                        <PlusCircle className="w-4 h-4" />
                        添加动作
                      </button>
                    )}

                    {displayRule.actions.length === 0 ? (
                      <div className="text-center py-8 text-dark-500">
                        <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">暂无动作配置</p>
                        {isEditing && (
                          <p className="text-xs mt-1">点击上方按钮添加第一个动作</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {displayRule.actions.map((action, index) => {
                          const typeInfo = actionTypeOptions.find((t) => t.value === action.type);
                          const ActionIcon = typeInfo?.icon || Play;
                          return (
                            <div
                              key={action.id}
                              className={cn(
                                'bg-dark-800/50 border border-dark-700 rounded-lg overflow-hidden transition-all',
                                !action.enabled && 'opacity-50'
                              )}
                            >
                              <div className="flex items-center gap-3 px-4 py-3 border-b border-dark-700/50">
                                <div className="flex items-center gap-2 text-dark-500 text-sm font-mono">
                                  <span className="w-5 h-5 rounded bg-dark-700 flex items-center justify-center text-xs">
                                    {index + 1}
                                  </span>
                                </div>
                                <div className={cn(
                                  'w-8 h-8 rounded-md flex items-center justify-center',
                                  typeInfo?.color || 'text-dark-500',
                                  'bg-dark-700/50'
                                )}>
                                  <ActionIcon className="w-4 h-4" />
                                </div>
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={action.name || ''}
                                    onChange={(e) =>
                                      handleUpdateAction(action.id, { name: e.target.value })
                                    }
                                    className="flex-1 bg-transparent text-dark-100 font-medium focus:outline-none"
                                    placeholder="动作名称"
                                  />
                                ) : (
                                  <span className="flex-1 font-medium text-dark-100">
                                    {action.name || action.type}
                                  </span>
                                )}
                                <Badge size="sm" variant="default">
                                  {typeInfo?.label}
                                </Badge>
                                {isEditing && (
                                  <>
                                    <button
                                      onClick={() => handleToggleAction(action.id)}
                                      className="text-dark-400 hover:text-dark-200"
                                    >
                                      {action.enabled ? (
                                        <ToggleRight className="w-8 h-8 text-success-500" />
                                      ) : (
                                        <ToggleLeft className="w-8 h-8 text-dark-600" />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteAction(action.id)}
                                      className="w-7 h-7 rounded hover:bg-danger-500/20 flex items-center justify-center text-dark-500 hover:text-danger-500"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </>
                                )}
                              </div>
                              <div className="px-4 py-3">
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                      <div>
                                        <label className="text-xs text-dark-500 mb-1 block">
                                          动作类型
                                        </label>
                                        <select
                                          value={action.type}
                                          onChange={(e) =>
                                            handleUpdateAction(action.id, {
                                              type: e.target.value as ActionType,
                                            })
                                          }
                                          className="w-full bg-dark-900 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:outline-none focus:border-industrial-500"
                                        >
                                          {actionTypeOptions.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                              {opt.label}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                      <div>
                                        <label className="text-xs text-dark-500 mb-1 block">
                                          目标名称
                                        </label>
                                        <input
                                          type="text"
                                          value={action.targetName || ''}
                                          onChange={(e) =>
                                            handleUpdateAction(action.id, {
                                              targetName: e.target.value,
                                            })
                                          }
                                          className="w-full bg-dark-900 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:outline-none focus:border-industrial-500"
                                          placeholder="目标名称"
                                        />
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-xs text-dark-500 mb-1 block">
                                        参数配置
                                      </label>
                                      <div className="space-y-1">
                                        {action.parameters.map((param, pIdx) => (
                                          <div
                                            key={pIdx}
                                            className="flex items-center gap-2"
                                          >
                                            <span className="text-xs text-dark-400 w-20 truncate">
                                              {param.name}
                                            </span>
                                            <input
                                              type="text"
                                              value={String(param.value)}
                                              onChange={(e) =>
                                                handleUpdateActionParam(
                                                  action.id,
                                                  pIdx,
                                                  e.target.value
                                                )
                                              }
                                              className="flex-1 bg-dark-900 border border-dark-600 rounded px-2 py-1 text-sm text-dark-100 focus:outline-none focus:border-industrial-500"
                                            />
                                            <span className="text-xs text-dark-500 w-12 text-right">
                                              {param.dataType}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <label className="text-xs text-dark-500 mb-1 block">
                                        描述
                                      </label>
                                      <input
                                        type="text"
                                        value={action.description || ''}
                                        onChange={(e) =>
                                          handleUpdateAction(action.id, {
                                            description: e.target.value,
                                          })
                                        }
                                        className="w-full bg-dark-900 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:outline-none focus:border-industrial-500"
                                        placeholder="动作描述"
                                      />
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    {action.targetName && (
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="text-dark-500">目标:</span>
                                        <span className="text-dark-300">{action.targetName}</span>
                                      </div>
                                    )}
                                    {action.parameters.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        {action.parameters.map((param, idx) => (
                                          <div
                                            key={idx}
                                            className="px-2 py-1 bg-dark-700/50 rounded text-xs"
                                          >
                                            <span className="text-dark-500">{param.name}:</span>{' '}
                                            <span className="text-industrial-400 font-mono">
                                              {String(param.value)}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {action.description && (
                                      <p className="text-xs text-dark-500 mt-2">
                                        {action.description}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-dark-700">
                    <h3 className="section-title">
                      <Clock className="w-5 h-5 text-sky-400" />
                      执行记录
                    </h3>
                    {currentRuleLogs.length === 0 ? (
                      <div className="text-center py-6 text-dark-500">
                        <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
                        <p className="text-sm">暂无执行记录</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {currentRuleLogs.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center gap-3 p-3 bg-dark-800/50 border border-dark-700 rounded-lg"
                          >
                            {log.status === 'success' ? (
                              <CheckCircle2 className="w-5 h-5 text-success-500 flex-shrink-0" />
                            ) : log.status === 'failed' ? (
                              <XCircle className="w-5 h-5 text-danger-500 flex-shrink-0" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-warning-500 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-dark-200">
                                  {log.status === 'success' ? '执行成功' : log.status === 'failed' ? '执行失败' : '已跳过'}
                                </span>
                                {log.duration !== undefined && (
                                  <span className="text-xs text-dark-500">
                                    {log.duration.toFixed(2)}ms
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-dark-500">
                                {new Date(log.triggeredAt).toLocaleString('zh-CN')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-80 border-l border-dark-700 bg-dark-900/30 flex flex-col">
                <div className="h-14 border-b border-dark-700 flex items-center justify-between px-4">
                  <h3 className="font-semibold text-dark-100 text-sm">规则测试</h3>
                  <Badge size="sm" variant="info">
                    模拟
                  </Badge>
                </div>

                <div className="border-b border-dark-700 px-2">
                  <div className="flex">
                    <button
                      onClick={() => setActiveTestTab('input')}
                      className={cn(
                        'flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors',
                        activeTestTab === 'input'
                          ? 'text-industrial-400 border-industrial-500'
                          : 'text-dark-400 border-transparent hover:text-dark-200'
                      )}
                    >
                      测试数据
                    </button>
                    <button
                      onClick={() => setActiveTestTab('result')}
                      className={cn(
                        'flex-1 py-2.5 text-sm font-medium border-b-2 transition-colors',
                        activeTestTab === 'result'
                          ? 'text-industrial-400 border-industrial-500'
                          : 'text-dark-400 border-transparent hover:text-dark-200'
                      )}
                    >
                      执行结果
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                  {activeTestTab === 'input' ? (
                    <div className="flex-1 flex flex-col p-4">
                      <p className="text-xs text-dark-500 mb-2">
                        输入JSON格式的测试数据，模拟变量和IO状态
                      </p>
                      <div className="flex-1 rounded-lg overflow-hidden border border-dark-700 min-h-0">
                        <Editor
                          height="100%"
                          defaultLanguage="json"
                          value={testData}
                          onChange={(v) => setTestData(v || '')}
                          theme="vs-dark"
                          options={{
                            minimap: { enabled: false },
                            fontSize: 12,
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            wordWrap: 'on',
                          }}
                        />
                      </div>
                      <button
                        onClick={handleRunTest}
                        disabled={isTesting}
                        className="mt-4 w-full btn-primary h-10"
                      >
                        {isTesting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            测试中...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            运行测试
                          </>
                        )}
                      </button>

                      <div className="mt-4 pt-4 border-t border-dark-700/50">
                        <p className="text-xs text-dark-500 mb-2">快速示例</p>
                        <div className="space-y-2">
                          <button
                            onClick={() =>
                              setTestData('{\n  "电机运行": true,\n  "热继电器": false\n}')
                            }
                            className="w-full text-left px-3 py-2 bg-dark-800/50 hover:bg-dark-800 border border-dark-700 rounded-lg text-xs text-dark-300 transition-colors"
                          >
                            电机过载场景
                          </button>
                          <button
                            onClick={() =>
                              setTestData('{\n  "封口温度": 185,\n  "加热输出": true\n}')
                            }
                            className="w-full text-left px-3 py-2 bg-dark-800/50 hover:bg-dark-800 border border-dark-700 rounded-lg text-xs text-dark-300 transition-colors"
                          >
                            温度过高场景
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-auto p-4">
                      {!testResult ? (
                        <div className="h-full flex flex-col items-center justify-center text-dark-500">
                          <Activity className="w-12 h-12 mb-3 opacity-30" />
                          <p className="text-sm">暂无测试结果</p>
                          <p className="text-xs mt-1">运行测试查看执行结果</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className={cn(
                            'p-4 rounded-lg border',
                            testResult.status === 'success'
                              ? 'bg-success-500/10 border-success-500/30'
                              : testResult.status === 'failed'
                              ? 'bg-danger-500/10 border-danger-500/30'
                              : 'bg-warning-500/10 border-warning-500/30'
                          )}>
                            <div className="flex items-center gap-2 mb-2">
                              {testResult.status === 'success' ? (
                                <CheckCircle2 className="w-5 h-5 text-success-400" />
                              ) : testResult.status === 'failed' ? (
                                <XCircle className="w-5 h-5 text-danger-400" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-warning-400" />
                              )}
                              <span className="font-semibold text-dark-100">
                                {testResult.status === 'success' ? '条件满足，规则触发' : testResult.status === 'failed' ? '执行失败' : '条件不满足，已跳过'}
                              </span>
                            </div>
                            {testResult.duration !== undefined && (
                              <p className="text-xs text-dark-400">
                                执行耗时: {testResult.duration.toFixed(2)}ms
                              </p>
                            )}
                          </div>

                          {testResult.conditions && testResult.conditions.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">
                                条件检查结果
                              </p>
                              <div className="space-y-1">
                                {testResult.conditions.map((cond, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 p-2 bg-dark-800/50 rounded border border-dark-700/50"
                                  >
                                    {cond.result ? (
                                      <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0" />
                                    ) : (
                                      <XCircle className="w-4 h-4 text-danger-500 flex-shrink-0" />
                                    )}
                                    <span className="text-xs text-dark-300 flex-1 truncate">
                                      条件 {idx + 1}
                                    </span>
                                    {cond.actualValue !== undefined && (
                                      <span className="text-xs text-dark-500 font-mono">
                                        {String(cond.actualValue)}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {testResult.actions && testResult.actions.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-dark-400 uppercase tracking-wider mb-2">
                                动作执行结果
                              </p>
                              <div className="space-y-1">
                                {testResult.actions.map((action, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 p-2 bg-dark-800/50 rounded border border-dark-700/50"
                                  >
                                    {action.status === 'success' ? (
                                      <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0" />
                                    ) : action.status === 'failed' ? (
                                      <XCircle className="w-4 h-4 text-danger-500 flex-shrink-0" />
                                    ) : (
                                      <AlertCircle className="w-4 h-4 text-warning-500 flex-shrink-0" />
                                    )}
                                    <span className="text-xs text-dark-300 flex-1 truncate">
                                      动作 {idx + 1}
                                    </span>
                                    <span className="text-xs text-dark-500">
                                      {action.status === 'success' ? '已执行' : action.status === 'failed' ? '失败' : '已跳过'}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-2 border-t border-dark-700/50">
                            <p className="text-xs text-dark-500">
                              触发时间: {new Date(testResult.triggeredAt).toLocaleString('zh-CN')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-dark-950/70 backdrop-blur-sm"
            onClick={() => setShowImportModal(false)}
          />
          <div className="relative w-[500px] bg-dark-900 border border-dark-700 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
            <div className="h-14 border-b border-dark-700 flex items-center justify-between px-5">
              <h3 className="font-semibold text-dark-100">导入规则</h3>
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
                  placeholder='{"id": "rule-xxx", "name": "规则名称", ...}'
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
                onClick={handleImportRule}
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
