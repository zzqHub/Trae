import { useState, useCallback } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Settings2,
  GripVertical,
  Search,
  ChevronRight,
  Clock,
  Timer,
  Link2,
  Cpu,
  Info,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle,
  MoreHorizontal,
  Edit3,
  X,
  GanttChart,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';
import { cn } from '@/lib/utils';
import type { Station, Device } from '@/types';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';

type StationStatus = 'running' | 'standby' | 'fault';

interface TimelineAction {
  id: string;
  name: string;
  startTime: number;
  duration: number;
  color: string;
}

interface InterlockCondition {
  id: string;
  sourceStationId: string;
  condition: string;
  targetStationId: string;
  enabled: boolean;
}

const statusConfig: Record<StationStatus, { label: string; color: string; bgColor: string; dotColor: string; glowClass: string }> = {
  running: {
    label: '运行',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    dotColor: 'bg-emerald-500',
    glowClass: 'glow-green',
  },
  standby: {
    label: '待机',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    dotColor: 'bg-amber-500',
    glowClass: 'glow-yellow',
  },
  fault: {
    label: '故障',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    dotColor: 'bg-red-500',
    glowClass: 'glow-red',
  },
};

const mockTimelineActions: TimelineAction[] = [
  { id: 'act-1', name: '上料', startTime: 0, duration: 2000, color: 'bg-industrial-500' },
  { id: 'act-2', name: '定位', startTime: 2000, duration: 1500, color: 'bg-emerald-500' },
  { id: 'act-3', name: '夹紧', startTime: 3500, duration: 1000, color: 'bg-purple-500' },
  { id: 'act-4', name: '加工', startTime: 4500, duration: 5000, color: 'bg-amber-500' },
  { id: 'act-5', name: '检测', startTime: 9500, duration: 2000, color: 'bg-pink-500' },
  { id: 'act-6', name: '下料', startTime: 11500, duration: 1500, color: 'bg-cyan-500' },
];

export default function StationConfig() {
  const currentProject = useProjectStore((s) => s.currentProject);
  const addStation = useProjectStore((s) => s.addStation);
  const updateStation = useProjectStore((s) => s.updateStation);
  const deleteStation = useProjectStore((s) => s.deleteStation);
  const reorderStations = useProjectStore((s) => s.reorderStations);
  const selectedNode = useProjectStore((s) => s.selectedNode);
  const setSelectedNode = useProjectStore((s) => s.setSelectedNode);

  const [searchQuery, setSearchQuery] = useState('');
  const [draggedStationId, setDraggedStationId] = useState<string | null>(null);
  const [dragOverStationId, setDragOverStationId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  const stations = currentProject?.stations || [];
  const selectedStation = stations.find((s) => s.id === selectedNode?.stationId);

  const filteredStations = stations.filter(
    (s) =>
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStationStatus = (index: number): StationStatus => {
    const statuses: StationStatus[] = ['running', 'standby', 'fault'];
    return statuses[index % 3];
  };

  const handleDragStart = (stationId: string) => {
    setDraggedStationId(stationId);
  };

  const handleDragEnd = () => {
    setDraggedStationId(null);
    setDragOverStationId(null);
  };

  const handleDragOver = (e: React.DragEvent, stationId: string) => {
    e.preventDefault();
    setDragOverStationId(stationId);
  };

  const handleDragLeave = () => {
    setDragOverStationId(null);
  };

  const handleDrop = (targetStationId: string) => {
    if (!draggedStationId || draggedStationId === targetStationId || !currentProject) return;

    const newOrder = stations.map((s) => s.id);
    const dragIndex = newOrder.indexOf(draggedStationId);
    const dropIndex = newOrder.indexOf(targetStationId);

    newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, draggedStationId);

    reorderStations(currentProject.id, newOrder);
    setDraggedStationId(null);
    setDragOverStationId(null);
  };

  const handleSelectStation = (stationId: string) => {
    setSelectedNode({
      type: 'station',
      id: stationId,
      stationId,
    });
  };

  const handleAddStation = () => {
    if (!currentProject) return;
    const stationCount = stations.length;
    const newStation = addStation(currentProject.id, {
      name: `工位${stationCount + 1}`,
      description: '新建工位',
      position: stationCount + 1,
    });
    handleSelectStation(newStation.id);
  };

  const handleDeleteStation = (stationId: string) => {
    if (!currentProject) return;
    if (confirm('确定要删除这个工位吗？')) {
      deleteStation(currentProject.id, stationId);
    }
  };

  const handleUpdateStation = (stationId: string, updates: Partial<Station>) => {
    if (!currentProject) return;
    updateStation(currentProject.id, stationId, updates);
  };

  return (
    <div className="h-full flex bg-dark-950">
      <div className="w-72 border-r border-dark-700/50 flex flex-col bg-dark-900/50">
        <div className="p-4 border-b border-dark-700/50">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold text-dark-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-industrial-400" />
              工位列表
            </h2>
            <button
              className="w-7 h-7 rounded-lg bg-industrial-600 hover:bg-industrial-500 text-white flex items-center justify-center transition-colors"
              onClick={handleAddStation}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-dark-500">拖拽排序工位顺序</p>
        </div>

        <div className="p-3 border-b border-dark-700/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="搜索工位..."
              className="input-field pl-9 py-1.5 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredStations.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center mx-auto mb-3">
                <Layers className="w-6 h-6 text-dark-600" />
              </div>
              <p className="text-dark-500 text-sm">
                {searchQuery ? '未找到匹配工位' : '暂无工位'}
              </p>
              {!searchQuery && (
                <button
                  className="btn-primary mt-4 mx-auto text-sm py-1.5"
                  onClick={handleAddStation}
                >
                  <Plus className="w-3.5 h-3.5" />
                  添加工位
                </button>
              )}
            </div>
          ) : (
            filteredStations.map((station, index) => {
              const status = getStationStatus(index);
              const statusInfo = statusConfig[status];
              const isSelected = selectedNode?.stationId === station.id;
              const isDragging = draggedStationId === station.id;
              const isDragOver = dragOverStationId === station.id;

              return (
                <div
                  key={station.id}
                  className={cn(
                    'group relative rounded-lg border transition-all duration-200 cursor-pointer overflow-hidden',
                    isSelected
                      ? 'border-industrial-500 bg-industrial-500/10'
                      : 'border-dark-700 bg-dark-900 hover:border-dark-600',
                    isDragging && 'opacity-50',
                    isDragOver && 'border-t-2 border-t-industrial-500'
                  )}
                  draggable
                  onDragStart={() => handleDragStart(station.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, station.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(station.id)}
                  onClick={() => handleSelectStation(station.id)}
                >
                  <div className="p-3 flex items-start gap-3">
                    <div className="cursor-grab active:cursor-grabbing text-dark-600 hover:text-dark-400 transition-colors pt-1">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-dark-500">
                          #{station.position || index + 1}
                        </span>
                        <h3 className="font-medium text-dark-200 truncate">{station.name}</h3>
                      </div>
                      <p className="text-xs text-dark-500 mt-0.5 truncate">
                        {station.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5">
                          <div className={cn('w-1.5 h-1.5 rounded-full', statusInfo.dotColor, statusInfo.glowClass)} />
                          <span className={cn('text-xs', statusInfo.color)}>{statusInfo.label}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-dark-500">
                          <Cpu className="w-3 h-3" />
                          {station.devices.length}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        className="w-7 h-7 rounded-lg hover:bg-dark-700 text-dark-400 hover:text-dark-200 flex items-center justify-center transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        className="w-7 h-7 rounded-lg hover:bg-red-500/20 text-dark-400 hover:text-red-400 flex items-center justify-center transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStation(station.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-industrial-500" />
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 border-t border-dark-700/50">
          <div className="text-xs text-dark-500 text-center">
            共 {stations.length} 个工位
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {selectedStation ? (
          <StationDetail
            station={selectedStation}
            allStations={stations}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onUpdate={(updates) => handleUpdateStation(selectedStation.id, updates)}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-20 h-20 rounded-2xl bg-dark-800 flex items-center justify-center mb-4">
              <Settings2 className="w-10 h-10 text-dark-600" />
            </div>
            <h3 className="text-lg font-medium text-dark-200 mb-2">选择工位</h3>
            <p className="text-dark-500 max-w-xs">
              从左侧工位列表中选择一个工位以查看和编辑其详细配置
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface StationDetailProps {
  station: Station;
  allStations: Station[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onUpdate: (updates: Partial<Station>) => void;
}

function StationDetail({ station, allStations, activeTab, onTabChange, onUpdate }: StationDetailProps) {
  const [timelineActions, setTimelineActions] = useState<TimelineAction[]>(mockTimelineActions);
  const [interlockConditions, setInterlockConditions] = useState<InterlockCondition[]>([
    {
      id: 'il-1',
      sourceStationId: allStations[0]?.id || '',
      condition: '完成信号',
      targetStationId: station.id,
      enabled: true,
    },
  ]);

  const totalDuration = timelineActions.reduce((sum, a) => sum + a.duration, 0);
  const maxTime = Math.max(...timelineActions.map((a) => a.startTime + a.duration), 1);

  const addInterlock = () => {
    const newCondition: InterlockCondition = {
      id: `il-${Date.now()}`,
      sourceStationId: allStations[0]?.id || '',
      condition: '',
      targetStationId: station.id,
      enabled: true,
    };
    setInterlockConditions([...interlockConditions, newCondition]);
  };

  const toggleInterlock = (id: string) => {
    setInterlockConditions(
      interlockConditions.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  const deleteInterlock = (id: string) => {
    setInterlockConditions(interlockConditions.filter((c) => c.id !== id));
  };

  const getSourceStationName = (id: string) => {
    return allStations.find((s) => s.id === id)?.name || '未知工位';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="h-14 border-b border-dark-700/50 flex items-center px-4 justify-between bg-dark-900/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-industrial-500/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-industrial-400" />
          </div>
          <div>
            <h2 className="font-semibold text-dark-100">{station.name}</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary text-sm py-1.5">
            <Play className="w-4 h-4" />
            模拟运行
          </button>
        </div>
      </div>

      <div className="px-4 pt-4 border-b border-dark-700/50">
        <Tabs defaultValue="basic" value={activeTab} onValueChange={onTabChange}>
          <TabsList>
            <TabsTrigger value="basic">
              <Info className="w-4 h-4 mr-1.5" />
              基本信息
            </TabsTrigger>
            <TabsTrigger value="timing">
              <Clock className="w-4 h-4 mr-1.5" />
              时序配置
            </TabsTrigger>
            <TabsTrigger value="interlock">
              <Shield className="w-4 h-4 mr-1.5" />
              互锁配置
            </TabsTrigger>
            <TabsTrigger value="devices">
              <Cpu className="w-4 h-4 mr-1.5" />
              关联设备
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-y-auto">
        <TabsContent value="basic" className="p-6">
          <BasicInfoTab station={station} onUpdate={onUpdate} allStations={allStations} />
        </TabsContent>
        <TabsContent value="timing" className="p-6">
          <TimingTab
            actions={timelineActions}
            totalDuration={totalDuration}
            maxTime={maxTime}
            onActionsChange={setTimelineActions}
          />
        </TabsContent>
        <TabsContent value="interlock" className="p-6">
          <InterlockTab
            conditions={interlockConditions}
            allStations={allStations}
            currentStationId={station.id}
            getSourceStationName={getSourceStationName}
            onAdd={addInterlock}
            onToggle={toggleInterlock}
            onDelete={deleteInterlock}
          />
        </TabsContent>
        <TabsContent value="devices" className="p-6">
          <DevicesTab devices={station.devices} />
        </TabsContent>
      </div>
    </div>
  );
}

function BasicInfoTab({
  station,
  onUpdate,
  allStations,
}: {
  station: Station;
  onUpdate: (updates: Partial<Station>) => void;
  allStations: Station[];
}) {
  const stationIndex = allStations.findIndex((s) => s.id === station.id);
  const status = (stationIndex % 3 === 0 ? 'running' : stationIndex % 3 === 1 ? 'standby' : 'fault') as StationStatus;
  const statusInfo = statusConfig[status];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="config-card">
        <h3 className="section-title">
          <Info className="w-4 h-4" />
          基本信息
        </h3>
        <div className="space-y-4">
          <div>
            <label className="label-text">工位名称</label>
            <input
              type="text"
              className="input-field"
              value={station.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
            />
          </div>
          <div>
            <label className="label-text">工位描述</label>
            <textarea
              className="input-field min-h-[100px] resize-none"
              value={station.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-text">顺序</label>
              <input
                type="number"
                className="input-field"
                value={station.position || stationIndex + 1}
                onChange={(e) => onUpdate({ position: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label-text">当前状态</label>
              <div className={cn(
                'flex items-center gap-2 h-9 px-3 rounded-lg border border-dark-600',
                statusInfo.bgColor
              )}>
                <div className={cn('w-2 h-2 rounded-full', statusInfo.dotColor, statusInfo.glowClass)} />
                <span className={cn('text-sm font-medium', statusInfo.color)}>{statusInfo.label}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="config-card">
        <h3 className="section-title">
          <Clock className="w-4 h-4" />
          统计信息
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={Cpu}
            label="设备数量"
            value={station.devices.length}
            color="text-industrial-400"
            bgColor="bg-industrial-500/10"
          />
          <StatCard
            icon={Layers}
            label="模块数量"
            value={station.modules.length}
            color="text-purple-400"
            bgColor="bg-purple-500/10"
          />
          <StatCard
            icon={Timer}
            label="循环周期"
            value="12s"
            color="text-emerald-400"
            bgColor="bg-emerald-500/10"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="text-center p-4 rounded-lg bg-dark-800/50 border border-dark-700">
      <div className={cn('w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center', bgColor)}>
        <Icon className={cn('w-5 h-5', color)} />
      </div>
      <div className="text-2xl font-bold text-dark-100">{value}</div>
      <div className="text-xs text-dark-500 mt-1">{label}</div>
    </div>
  );
}

function TimingTab({
  actions,
  totalDuration,
  maxTime,
  onActionsChange,
}: {
  actions: TimelineAction[];
  totalDuration: number;
  maxTime: number;
  onActionsChange: (actions: TimelineAction[]) => void;
}) {
  const [selectedActionId, setSelectedActionId] = useState<string | null>(actions[0]?.id || null);
  const selectedAction = actions.find((a) => a.id === selectedActionId);

  const updateAction = (id: string, updates: Partial<TimelineAction>) => {
    onActionsChange(
      actions.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  const timeMarkers = [0, 25, 50, 75, 100];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="config-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title mb-0">
            <GanttChart className="w-4 h-4" />
            时序甘特图
          </h3>
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <Timer className="w-4 h-4" />
            总周期: <span className="font-mono text-industrial-400">{(totalDuration / 1000).toFixed(1)}s</span>
          </div>
        </div>

        <div className="relative">
          <div className="flex border-b border-dark-700 pb-2 mb-3">
            <div className="w-32 text-xs text-dark-500 font-medium">动作</div>
            <div className="flex-1 relative">
              <div className="absolute inset-0 flex justify-between">
                {timeMarkers.map((marker) => (
                  <div key={marker} className="text-xs text-dark-600 font-mono">
                    {((maxTime * marker) / 100 / 1000).toFixed(1)}s
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {actions.map((action) => {
              const leftPercent = (action.startTime / maxTime) * 100;
              const widthPercent = (action.duration / maxTime) * 100;
              const isSelected = selectedActionId === action.id;

              return (
                <div
                  key={action.id}
                  className={cn(
                    'flex items-center h-10 rounded-lg transition-all duration-200 cursor-pointer',
                    isSelected ? 'bg-dark-800' : 'hover:bg-dark-800/50'
                  )}
                  onClick={() => setSelectedActionId(action.id)}
                >
                  <div className="w-32 pl-3 text-sm text-dark-300 font-medium truncate pr-3">
                    {action.name}
                  </div>
                  <div className="flex-1 relative h-full">
                    <div
                      className={cn(
                        'absolute top-1/2 -translate-y-1/2 h-6 rounded-md transition-all duration-200',
                        action.color,
                        isSelected ? 'opacity-100 ring-2 ring-white/30' : 'opacity-80 hover:opacity-100'
                      )}
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                        {(action.duration / 1000).toFixed(1)}s
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedAction && (
        <div className="config-card">
          <h3 className="section-title">
            <Edit3 className="w-4 h-4" />
            编辑动作
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label-text">动作名称</label>
              <input
                type="text"
                className="input-field"
                value={selectedAction.name}
                onChange={(e) => updateAction(selectedAction.id, { name: e.target.value })}
              />
            </div>
            <div>
              <label className="label-text">开始时间 (ms)</label>
              <input
                type="number"
                className="input-field"
                value={selectedAction.startTime}
                onChange={(e) => updateAction(selectedAction.id, { startTime: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label-text">持续时间 (ms)</label>
              <input
                type="number"
                className="input-field"
                value={selectedAction.duration}
                onChange={(e) => updateAction(selectedAction.id, { duration: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InterlockTab({
  conditions,
  allStations,
  currentStationId,
  getSourceStationName,
  onAdd,
  onToggle,
  onDelete,
}: {
  conditions: InterlockCondition[];
  allStations: Station[];
  currentStationId: string;
  getSourceStationName: (id: string) => string;
  onAdd: () => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const currentStationName = allStations.find((s) => s.id === currentStationId)?.name || '';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-dark-100">互锁配置</h3>
            <p className="text-sm text-dark-500">
              配置工位间的互锁条件，确保安全运行
            </p>
          </div>
        </div>
        <button className="btn-primary" onClick={onAdd}>
          <Plus className="w-4 h-4" />
          添加互锁
        </button>
      </div>

      {conditions.length === 0 ? (
        <div className="config-card text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-dark-600" />
          </div>
          <h4 className="text-dark-200 font-medium mb-2">暂无互锁条件</h4>
          <p className="text-dark-500 text-sm mb-4">
            添加互锁条件以确保工位间的安全协调
          </p>
          <button className="btn-secondary" onClick={onAdd}>
            <Plus className="w-4 h-4" />
            添加第一个互锁
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {conditions.map((condition) => (
            <div
              key={condition.id}
              className={cn(
                'config-card flex items-center gap-4',
                !condition.enabled && 'opacity-60'
              )}
            >
              <div className="flex-1 flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800 border border-dark-700">
                  <div className="w-2 h-2 rounded-full bg-industrial-500" />
                  <span className="text-sm text-dark-200 font-medium">
                    {getSourceStationName(condition.sourceStationId)}
                  </span>
                </div>

                <ArrowRight className="w-5 h-5 text-dark-500" />

                <div className="px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <span className="text-sm text-amber-400 font-medium">
                    {condition.condition || '未设置条件'}
                  </span>
                </div>

                <ArrowRight className="w-5 h-5 text-dark-500" />

                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-800 border border-dark-700">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-sm text-dark-200 font-medium">
                    {currentStationName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className={cn(
                    'relative w-11 h-6 rounded-full transition-colors duration-200',
                    condition.enabled ? 'bg-industrial-600' : 'bg-dark-600'
                  )}
                  onClick={() => onToggle(condition.id)}
                >
                  <div
                    className={cn(
                      'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200',
                      condition.enabled && 'translate-x-5'
                    )}
                  />
                </button>
                <button
                  className="w-8 h-8 rounded-lg hover:bg-red-500/20 text-dark-400 hover:text-red-400 flex items-center justify-center transition-colors"
                  onClick={() => onDelete(condition.id)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="config-card bg-amber-500/5 border-amber-500/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-400 mb-1">互锁安全提示</h4>
            <p className="text-sm text-dark-400">
              互锁条件用于确保工位之间的安全协调。当前工位需要等待前一工位完成信号后才能启动，
              防止设备冲突和安全事故。请根据实际工艺需求合理配置互锁条件。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DevicesTab({ devices }: { devices: Device[] }) {
  const deviceTypeLabels: Record<string, string> = {
    threeColorLight: '三色灯',
    button: '按钮',
    sensor: '传感器',
    motor: '电机',
    valve: '气缸/电磁阀',
    actuator: '执行器',
  };

  const deviceTypeColors: Record<string, { bg: string; text: string }> = {
    threeColorLight: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
    button: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    sensor: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
    motor: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
    valve: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
    actuator: { bg: 'bg-slate-500/10', text: 'text-slate-400' },
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-industrial-500/10 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-industrial-400" />
          </div>
          <div>
            <h3 className="font-semibold text-dark-100">关联设备</h3>
            <p className="text-sm text-dark-500">
              该工位包含的所有设备，共 {devices.length} 个
            </p>
          </div>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="config-card text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mx-auto mb-4">
            <Cpu className="w-8 h-8 text-dark-600" />
          </div>
          <h4 className="text-dark-200 font-medium mb-2">暂无设备</h4>
          <p className="text-dark-500 text-sm">
            前往设备配置页面添加设备到此工位
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map((device) => {
            const typeColor = deviceTypeColors[device.type] || deviceTypeColors.actuator;
            return (
              <div
                key={device.id}
                className="config-card group hover:border-dark-500 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', typeColor.bg)}>
                    <Cpu className={cn('w-6 h-6', typeColor.text)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-dark-200 truncate">{device.name}</h4>
                    <p className="text-xs text-dark-500 mt-0.5">
                      {deviceTypeLabels[device.type] || device.type}
                    </p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4 text-dark-500" />
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-dark-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-dark-500">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                    {device.ioPoints.length} 个 IO 点
                  </div>
                  <span className="text-xs text-dark-500 font-mono">{device.id}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
