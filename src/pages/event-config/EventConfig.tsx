import { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Play,
  Pause,
  ChevronRight,
  AlertTriangle,
  Zap,
  Clock,
  Settings,
  Gauge,
  ToggleLeft,
  ToggleRight,
  X,
  ArrowUp,
  ArrowDown,
  GitBranch,
  Activity,
  Layers,
  Timer,
  Send,
  Cpu,
} from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';
import { cn } from '@/lib/utils';
import Badge from '@/components/common/Badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/common/Card';
import Button from '@/components/common/Button';
import type {
  EventConfig,
  EventPriority,
  EventStatus,
  EventCondition,
  EventAction,
  EventActionType,
} from '@/types';

const priorityConfig: Record<EventPriority, { label: string; color: string; bgColor: string; borderColor: string }> = {
  high: { label: '高', color: 'text-red-400', bgColor: 'bg-red-900/30', borderColor: 'border-red-700/50' },
  medium: { label: '中', color: 'text-amber-400', bgColor: 'bg-amber-900/30', borderColor: 'border-amber-700/50' },
  low: { label: '低', color: 'text-emerald-400', bgColor: 'bg-emerald-900/30', borderColor: 'border-emerald-700/50' },
};

const actionTypeConfig: Record<EventActionType, { label: string; icon: typeof Zap; color: string }> = {
  setOutput: { label: '设置输出', icon: Zap, color: 'text-sky-400' },
  callModule: { label: '调用模块', icon: Cpu, color: 'text-purple-400' },
  delay: { label: '延时', icon: Timer, color: 'text-amber-400' },
  triggerEvent: { label: '触发事件', icon: Send, color: 'text-rose-400' },
  setVariable: { label: '设置变量', icon: Settings, color: 'text-emerald-400' },
};

function ConditionRenderer({ condition, depth = 0 }: { condition: EventCondition; depth?: number }) {
  if (condition.type === 'logical') {
    return (
      <div className={cn('space-y-2', depth > 0 && 'ml-4 pl-4 border-l-2 border-slate-600')}>
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-300">
            {condition.operator === 'and' ? 'AND (全部满足)' : 'OR (任一满足)'}
          </span>
        </div>
        {condition.children?.map((child) => (
          <ConditionRenderer key={child.id} condition={child} depth={depth + 1} />
        ))}
      </div>
    );
  }

  const operatorLabels: Record<string, string> = {
    eq: '=',
    ne: '≠',
    gt: '>',
    lt: '<',
    ge: '≥',
    le: '≤',
  };

  return (
    <div className={cn('flex items-center gap-3 bg-slate-800/50 rounded-lg px-3 py-2', depth > 0 && 'ml-4')}>
      <Activity className="w-4 h-4 text-industrial-400" />
      <span className="text-sm text-slate-200 font-mono">{condition.leftOperand}</span>
      <span className="text-sm text-industrial-400 font-bold">{operatorLabels[condition.operator] || condition.operator}</span>
      <span className="text-sm text-slate-200 font-mono">{condition.rightOperand}</span>
    </div>
  );
}

export default function EventConfig() {
  const currentProject = useProjectStore((s) => s.currentProject);
  const addEventConfig = useProjectStore((s) => s.addEventConfig);
  const updateEventConfig = useProjectStore((s) => s.updateEventConfig);
  const deleteEventConfig = useProjectStore((s) => s.deleteEventConfig);
  const toggleEventConfigStatus = useProjectStore((s) => s.toggleEventConfigStatus);

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventConfig | null>(null);
  const [filterPriority, setFilterPriority] = useState<EventPriority | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<EventStatus | 'all'>('all');

  const events = currentProject?.eventConfigs || [];

  const filteredEvents = events.filter((e) => {
    if (filterPriority !== 'all' && e.priority !== filterPriority) return false;
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    return true;
  });

  const selectedEvent = events.find((e) => e.id === selectedEventId) || null;

  const handleAddEvent = () => {
    if (!currentProject) return;
    const newEvent = addEventConfig(currentProject.id, {
      name: '新事件',
      description: '',
      priority: 'medium',
      status: 'disabled',
      triggerCondition: {
        id: `cond-${Date.now()}`,
        type: 'comparison',
        operator: 'eq',
        leftOperand: '变量1',
        rightOperand: 'TRUE',
      },
      actions: [],
    });
    setSelectedEventId(newEvent.id);
    setEditingEvent(newEvent);
    setShowEditor(true);
  };

  const handleEditEvent = (event: EventConfig) => {
    setSelectedEventId(event.id);
    setEditingEvent({ ...event });
    setShowEditor(true);
  };

  const handleSaveEvent = () => {
    if (!currentProject || !editingEvent) return;
    updateEventConfig(currentProject.id, editingEvent.id, editingEvent);
    setShowEditor(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!currentProject) return;
    if (confirm('确定要删除这个事件配置吗？')) {
      deleteEventConfig(currentProject.id, eventId);
      if (selectedEventId === eventId) {
        setSelectedEventId(null);
      }
    }
  };

  const handleToggleStatus = (eventId: string) => {
    if (!currentProject) return;
    toggleEventConfigStatus(currentProject.id, eventId);
  };

  return (
    <div className="h-full flex bg-dark-950">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-700 bg-dark-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-industrial-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-industrial-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-dark-50">事件配置</h1>
                <p className="text-sm text-dark-400">管理系统事件触发条件与响应动作</p>
              </div>
            </div>
            <Button variant="primary" onClick={handleAddEvent}>
              <Plus className="w-4 h-4" />
              新建事件
            </Button>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-dark-400">优先级:</span>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as EventPriority | 'all')}
                className="select-field w-28 text-sm"
              >
                <option value="all">全部</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-dark-400">状态:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as EventStatus | 'all')}
                className="select-field w-28 text-sm"
              >
                <option value="all">全部</option>
                <option value="enabled">启用</option>
                <option value="disabled">禁用</option>
              </select>
            </div>
            <div className="ml-auto text-sm text-dark-500">
              共 {filteredEvents.length} 个事件
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {filteredEvents.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-dark-500">
              <Zap className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg mb-2">暂无事件配置</p>
              <p className="text-sm">点击"新建事件"按钮创建第一个事件</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredEvents.map((event) => {
                const pConf = priorityConfig[event.priority];
                return (
                  <Card
                    key={event.id}
                    className={cn(
                      'cursor-pointer transition-all duration-200 hover:shadow-dark-lg',
                      selectedEventId === event.id && 'ring-2 ring-industrial-500/50',
                      event.status === 'disabled' && 'opacity-60'
                    )}
                    onClick={() => setSelectedEventId(event.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-3 h-3 rounded-full', pConf.bgColor, pConf.borderColor, 'border')} />
                          <CardTitle className="text-base">{event.name}</CardTitle>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleStatus(event.id);
                          }}
                          className="text-dark-400 hover:text-dark-200 transition-colors"
                        >
                          {event.status === 'enabled' ? (
                            <ToggleRight className="w-5 h-5 text-industrial-400" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <CardDescription className="line-clamp-1">{event.description || '无描述'}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-4 mb-3">
                        <Badge variant={event.status === 'enabled' ? 'success' : 'default'} size="sm">
                          {event.status === 'enabled' ? '已启用' : '已禁用'}
                        </Badge>
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded border', pConf.color, pConf.bgColor, pConf.borderColor)}>
                          {pConf.label}优先级
                        </span>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <GitBranch className="w-3.5 h-3.5 text-dark-400" />
                            <span className="text-xs font-medium text-dark-400">触发条件</span>
                          </div>
                          <div className="text-xs text-dark-300 bg-dark-800/50 rounded px-2 py-1.5 font-mono">
                            {event.triggerCondition.type === 'logical'
                              ? `${event.triggerCondition.operator?.toUpperCase()} (${event.triggerCondition.children?.length || 0} 个条件)`
                              : `${event.triggerCondition.leftOperand} ${event.triggerCondition.operator} ${event.triggerCondition.rightOperand}`}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Layers className="w-3.5 h-3.5 text-dark-400" />
                            <span className="text-xs font-medium text-dark-400">响应动作</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {event.actions.slice(0, 4).map((action) => {
                              const aConf = actionTypeConfig[action.type];
                              const Icon = aConf.icon;
                              return (
                                <span
                                  key={action.id}
                                  className="inline-flex items-center gap-1 text-xs bg-dark-800/50 rounded px-2 py-0.5 text-dark-300"
                                >
                                  <Icon className={cn('w-3 h-3', aConf.color)} />
                                  {action.name}
                                </span>
                              );
                            })}
                            {event.actions.length > 4 && (
                              <span className="text-xs text-dark-500 px-2 py-0.5">
                                +{event.actions.length - 4}
                              </span>
                            )}
                            {event.actions.length === 0 && (
                              <span className="text-xs text-dark-500">无动作</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-dark-700/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event);
                          }}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          删除
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {selectedEvent && !showEditor && (
        <div className="w-96 border-l border-dark-700 bg-dark-900/50 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-dark-700 flex items-center justify-between">
            <h3 className="font-semibold text-dark-100">事件详情</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedEventId(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
                <AlertTriangle className={cn('w-4 h-4', priorityConfig[selectedEvent.priority].color)} />
                基本信息
              </h4>
              <div className="bg-dark-800/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-dark-400">名称</span>
                  <span className="text-sm text-dark-100">{selectedEvent.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-dark-400">优先级</span>
                  <span className={cn('text-sm font-medium', priorityConfig[selectedEvent.priority].color)}>
                    {priorityConfig[selectedEvent.priority].label}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-dark-400">状态</span>
                  <Badge variant={selectedEvent.status === 'enabled' ? 'success' : 'default'} size="sm">
                    {selectedEvent.status === 'enabled' ? '已启用' : '已禁用'}
                  </Badge>
                </div>
                {selectedEvent.description && (
                  <div>
                    <span className="text-sm text-dark-400">描述</span>
                    <p className="text-sm text-dark-300 mt-1">{selectedEvent.description}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-industrial-400" />
                触发条件
              </h4>
              <div className="bg-dark-800/50 rounded-lg p-3">
                <ConditionRenderer condition={selectedEvent.triggerCondition} />
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-dark-300 mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-industrial-400" />
                响应动作 ({selectedEvent.actions.length})
              </h4>
              <div className="space-y-2">
                {selectedEvent.actions.map((action, index) => {
                  const aConf = actionTypeConfig[action.type];
                  const Icon = aConf.icon;
                  return (
                    <div key={action.id} className="bg-dark-800/50 rounded-lg p-3 flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center text-xs font-bold text-dark-300">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className={cn('w-4 h-4', aConf.color)} />
                          <span className="text-sm font-medium text-dark-100">{action.name}</span>
                        </div>
                        <p className="text-xs text-dark-400 mt-0.5">{aConf.label}</p>
                        {action.description && (
                          <p className="text-xs text-dark-500 mt-1">{action.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
                {selectedEvent.actions.length === 0 && (
                  <div className="text-center text-dark-500 text-sm py-4">
                    暂无响应动作
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-dark-700">
            <Button variant="primary" className="w-full" onClick={() => handleEditEvent(selectedEvent)}>
              <Edit3 className="w-4 h-4" />
              编辑事件
            </Button>
          </div>
        </div>
      )}

      {showEditor && editingEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-dark-900 border border-dark-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-industrial-500/20 flex items-center justify-center">
                  <Edit3 className="w-4 h-4 text-industrial-400" />
                </div>
                <h2 className="text-lg font-semibold text-dark-50">
                  {editingEvent.id.startsWith('event-cfg-') && editingEvent.name === '新事件' ? '新建事件' : '编辑事件'}
                </h2>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setShowEditor(false); setEditingEvent(null); }}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-auto p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-industrial-400" />
                  基本信息
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">事件名称</label>
                    <input
                      type="text"
                      value={editingEvent.name}
                      onChange={(e) => setEditingEvent({ ...editingEvent, name: e.target.value })}
                      className="input-field"
                      placeholder="输入事件名称"
                    />
                  </div>
                  <div>
                    <label className="label-text">优先级</label>
                    <select
                      value={editingEvent.priority}
                      onChange={(e) => setEditingEvent({ ...editingEvent, priority: e.target.value as EventPriority })}
                      className="select-field"
                    >
                      <option value="high">高优先级</option>
                      <option value="medium">中优先级</option>
                      <option value="low">低优先级</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="label-text">描述</label>
                  <textarea
                    value={editingEvent.description || ''}
                    onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                    className="input-field min-h-[60px] resize-y"
                    placeholder="事件描述信息"
                  />
                </div>
                <div className="flex items-center gap-3 mt-4">
                  <span className="text-sm text-dark-400">启用状态</span>
                  <button
                    onClick={() => setEditingEvent({
                      ...editingEvent,
                      status: editingEvent.status === 'enabled' ? 'disabled' : 'enabled',
                    })}
                    className="flex items-center gap-2"
                  >
                    {editingEvent.status === 'enabled' ? (
                      <ToggleRight className="w-6 h-6 text-industrial-400" />
                    ) : (
                      <ToggleLeft className="w-6 h-6 text-dark-500" />
                    )}
                    <span className="text-sm text-dark-300">
                      {editingEvent.status === 'enabled' ? '已启用' : '已禁用'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="h-px bg-dark-700" />

              <div>
                <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-industrial-400" />
                  触发条件
                </h3>
                <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-4">
                  <ConditionRenderer condition={editingEvent.triggerCondition} />
                  <div className="mt-4 pt-4 border-t border-dark-700/50 flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Plus className="w-3.5 h-3.5" />
                      添加条件
                    </Button>
                    <Button variant="outline" size="sm">
                      <Plus className="w-3.5 h-3.5" />
                      添加条件组
                    </Button>
                  </div>
                </div>
              </div>

              <div className="h-px bg-dark-700" />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-industrial-400" />
                    响应动作链
                  </h3>
                  <Button variant="outline" size="sm">
                    <Plus className="w-3.5 h-3.5" />
                    添加动作
                  </Button>
                </div>
                <div className="space-y-2">
                  {editingEvent.actions.map((action, index) => {
                    const aConf = actionTypeConfig[action.type];
                    const Icon = aConf.icon;
                    return (
                      <div key={action.id} className="bg-dark-800/50 border border-dark-700 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-industrial-500/20 flex items-center justify-center text-xs font-bold text-industrial-400">
                            {index + 1}
                          </div>
                          <Icon className={cn('w-5 h-5', aConf.color)} />
                          <div className="flex-1">
                            <input
                              type="text"
                              value={action.name}
                              onChange={(e) => {
                                const newActions = [...editingEvent.actions];
                                newActions[index] = { ...action, name: e.target.value };
                                setEditingEvent({ ...editingEvent, actions: newActions });
                              }}
                              className="bg-transparent text-sm font-medium text-dark-100 border-b border-transparent hover:border-dark-600 focus:border-industrial-500 focus:outline-none w-full"
                            />
                            <p className="text-xs text-dark-400 mt-0.5">{aConf.label}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="w-7 h-7">
                              <ArrowUp className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-7 h-7">
                              <ArrowDown className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="w-7 h-7 text-red-400 hover:text-red-300 hover:bg-red-900/20">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {editingEvent.actions.length === 0 && (
                    <div className="text-center text-dark-500 text-sm py-8 border border-dashed border-dark-700 rounded-lg">
                      暂无动作，点击上方按钮添加
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-dark-700 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => { setShowEditor(false); setEditingEvent(null); }}>
                取消
              </Button>
              <Button variant="primary" onClick={handleSaveEvent}>
                保存配置
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
