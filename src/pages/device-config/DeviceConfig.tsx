import { useState, useCallback } from 'react';
import {
  Lightbulb,
  Square,
  Gauge,
  Cog,
  Wind,
  MoreHorizontal,
  Plus,
  Trash2,
  Settings2,
  Move,
  Search,
  ChevronDown,
  ChevronRight,
  Power,
  Zap,
  Activity,
  Thermometer,
  Eye,
  Target,
  Timer,
  ShieldAlert,
} from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';
import { cn } from '@/lib/utils';
import type { Device, DeviceType, Station } from '@/types';

interface DeviceConfigItem {
  type: DeviceType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

const deviceLibrary: DeviceConfigItem[] = [
  {
    type: 'threeColorLight',
    label: '三色灯',
    description: '红黄绿三色状态指示',
    icon: Lightbulb,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  {
    type: 'button',
    label: '按钮',
    description: '常开/常闭按钮开关',
    icon: Square,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  {
    type: 'sensor',
    label: '传感器',
    description: '光电/接近/压力传感器',
    icon: Gauge,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
  },
  {
    type: 'motor',
    label: '电机',
    description: '伺服/步进/变频电机',
    icon: Cog,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/30',
  },
  {
    type: 'valve',
    label: '气缸/电磁阀',
    description: '气动元件控制',
    icon: Wind,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
  },
  {
    type: 'actuator',
    label: '其他',
    description: '其他执行器设备',
    icon: MoreHorizontal,
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/30',
  },
];

interface ThreeColorLightConfig {
  redEnabled: boolean;
  yellowEnabled: boolean;
  greenEnabled: boolean;
  blinkMode: 'off' | 'slow' | 'fast' | 'strobe';
  brightness: number;
}

interface ButtonConfig {
  contactType: 'normallyOpen' | 'normallyClosed';
  debounceTime: number;
}

interface SensorConfig {
  sensorType: 'photoelectric' | 'proximity' | 'pressure';
  triggerThreshold: number;
}

interface MotorConfig {
  ratedPower: number;
  maxSpeed: number;
  overloadProtection: boolean;
}

export default function DeviceConfig() {
  const currentProject = useProjectStore((s) => s.currentProject);
  const addDevice = useProjectStore((s) => s.addDevice);
  const updateDevice = useProjectStore((s) => s.updateDevice);
  const deleteDevice = useProjectStore((s) => s.deleteDevice);
  const selectedNode = useProjectStore((s) => s.selectedNode);
  const setSelectedNode = useProjectStore((s) => s.setSelectedNode);

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['threeColorLight', 'button', 'sensor', 'motor', 'valve', 'actuator'])
  );
  const [draggedType, setDraggedType] = useState<DeviceType | null>(null);
  const [dragOverStation, setDragOverStation] = useState<string | null>(null);

  const currentStation = currentProject?.stations.find(
    (s) => s.id === selectedNode?.stationId
  );

  const selectedDevice =
    selectedNode?.deviceId && currentStation
      ? currentStation.devices.find((d) => d.id === selectedNode.deviceId)
      : null;

  const toggleCategory = (type: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const handleDragStart = (type: DeviceType) => {
    setDraggedType(type);
  };

  const handleDragEnd = () => {
    setDraggedType(null);
    setDragOverStation(null);
  };

  const handleDragOver = (e: React.DragEvent, stationId: string) => {
    e.preventDefault();
    setDragOverStation(stationId);
  };

  const handleDragLeave = () => {
    setDragOverStation(null);
  };

  const handleDrop = (stationId: string) => {
    if (!draggedType) return;
    const deviceInfo = deviceLibrary.find((d) => d.type === draggedType);
    if (!deviceInfo) return;

    const deviceCount =
      currentProject?.stations
        .find((s) => s.id === stationId)
        ?.devices.filter((d) => d.type === draggedType).length || 0;

    addDevice(currentProject!.id, stationId, {
      name: `${deviceInfo.label}${deviceCount + 1}`,
      type: draggedType,
      description: deviceInfo.description,
      ioPoints: [],
    });
    setDraggedType(null);
    setDragOverStation(null);
  };

  const handleSelectDevice = (deviceId: string) => {
    if (!currentStation) return;
    setSelectedNode({
      type: 'device',
      id: deviceId,
      stationId: currentStation.id,
      deviceId,
    });
  };

  const handleAddDevice = (type: DeviceType) => {
    if (!currentStation) return;
    const deviceInfo = deviceLibrary.find((d) => d.type === type);
    if (!deviceInfo) return;

    const deviceCount = currentStation.devices.filter((d) => d.type === type).length;

    addDevice(currentProject!.id, currentStation.id, {
      name: `${deviceInfo.label}${deviceCount + 1}`,
      type,
      description: deviceInfo.description,
      ioPoints: [],
    });
  };

  const handleDeleteDevice = (deviceId: string) => {
    if (!currentStation || !currentProject) return;
    if (confirm('确定要删除这个设备吗？')) {
      deleteDevice(currentProject.id, currentStation.id, deviceId);
    }
  };

  const handleUpdateDevice = (deviceId: string, updates: Partial<Device>) => {
    if (!currentStation || !currentProject) return;
    updateDevice(currentProject.id, currentStation.id, deviceId, updates);
  };

  const getDeviceInfo = (type: DeviceType) =>
    deviceLibrary.find((d) => d.type === type);

  const filteredStations = currentProject?.stations.filter(
    (s) =>
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.devices.some((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const renderPropertyPanel = () => {
    if (!selectedDevice) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div className="w-16 h-16 rounded-2xl bg-dark-800 flex items-center justify-center mb-4">
            <Settings2 className="w-8 h-8 text-dark-500" />
          </div>
          <h3 className="text-dark-200 font-medium mb-2">选择设备</h3>
          <p className="text-dark-500 text-sm">
            从设备列表中选择一个设备以编辑其属性
          </p>
        </div>
      );
    }

    const deviceInfo = getDeviceInfo(selectedDevice.type);
    const Icon = deviceInfo?.icon || MoreHorizontal;

    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-dark-700/50">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center',
                deviceInfo?.bgColor
              )}
            >
              <Icon className={cn('w-6 h-6', deviceInfo?.color)} />
            </div>
            <div>
              <h3 className="font-semibold text-dark-100">{selectedDevice.name}</h3>
              <p className="text-sm text-dark-500">{deviceInfo?.label}</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h4 className="section-title">
              <Activity className="w-4 h-4" />
              基本信息
            </h4>
            <div className="space-y-4">
              <div>
                <label className="label-text">设备名称</label>
                <input
                  type="text"
                  className="input-field"
                  value={selectedDevice.name}
                  onChange={(e) =>
                    handleUpdateDevice(selectedDevice.id, { name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="label-text">设备描述</label>
                <textarea
                  className="input-field min-h-[80px] resize-none"
                  value={selectedDevice.description || ''}
                  onChange={(e) =>
                    handleUpdateDevice(selectedDevice.id, {
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <div className="divider" />

          {selectedDevice.type === 'threeColorLight' && (
            <ThreeColorLightProperties
              device={selectedDevice}
              onUpdate={(updates) => handleUpdateDevice(selectedDevice.id, updates)}
            />
          )}

          {selectedDevice.type === 'button' && (
            <ButtonProperties
              device={selectedDevice}
              onUpdate={(updates) => handleUpdateDevice(selectedDevice.id, updates)}
            />
          )}

          {selectedDevice.type === 'sensor' && (
            <SensorProperties
              device={selectedDevice}
              onUpdate={(updates) => handleUpdateDevice(selectedDevice.id, updates)}
            />
          )}

          {selectedDevice.type === 'motor' && (
            <MotorProperties
              device={selectedDevice}
              onUpdate={(updates) => handleUpdateDevice(selectedDevice.id, updates)}
            />
          )}

          <div className="divider" />

          <div>
            <h4 className="section-title">
              <Zap className="w-4 h-4" />
              IO 点 ({selectedDevice.ioPoints.length})
            </h4>
            <div className="space-y-2">
              {selectedDevice.ioPoints.length === 0 ? (
                <div className="text-center py-6 text-dark-500 text-sm">
                  暂无 IO 点配置
                </div>
              ) : (
                selectedDevice.ioPoints.map((io) => (
                  <div
                    key={io.id}
                    className="config-card flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center',
                          io.type === 'DI' || io.type === 'AI'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : 'bg-blue-500/10 text-blue-400'
                        )}
                      >
                        {io.type === 'DI' || io.type === 'AI' ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <Power className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-dark-200">
                          {io.name}
                        </div>
                        <div className="text-xs text-dark-500">
                          {io.type} · {io.address}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-dark-700/50">
          <button
            className="btn-danger w-full justify-center"
            onClick={() => handleDeleteDevice(selectedDevice.id)}
          >
            <Trash2 className="w-4 h-4" />
            删除设备
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex bg-dark-950">
      <div className="w-64 border-r border-dark-700/50 flex flex-col bg-dark-900/50">
        <div className="p-4 border-b border-dark-700/50">
          <h2 className="font-semibold text-dark-100 flex items-center gap-2">
            <Move className="w-4 h-4 text-industrial-400" />
            设备组件库
          </h2>
          <p className="text-xs text-dark-500 mt-1">拖拽添加到工位</p>
        </div>

        <div className="p-3 border-b border-dark-700/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              type="text"
              placeholder="搜索设备..."
              className="input-field pl-9 py-1.5 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {deviceLibrary.map((device) => {
            const Icon = device.icon;
            const isExpanded = expandedCategories.has(device.type);
            return (
              <div
                key={device.type}
                className={cn(
                  'rounded-lg border transition-all duration-200 overflow-hidden',
                  device.borderColor,
                  'bg-dark-900/50'
                )}
              >
                <button
                  className="w-full p-3 flex items-center gap-3 hover:bg-dark-800/50 transition-colors"
                  onClick={() => toggleCategory(device.type)}
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      device.bgColor
                    )}
                  >
                    <Icon className={cn('w-5 h-5', device.color)} />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-dark-200">
                      {device.label}
                    </div>
                    <div className="text-xs text-dark-500">{device.description}</div>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-dark-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-dark-500" />
                  )}
                </button>

                {isExpanded && (
                  <div className="px-3 pb-3">
                    <div
                      className={cn(
                        'p-3 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200',
                        'bg-dark-800/50 hover:bg-dark-700/50 border border-dark-600/50 hover:border-dark-500/50',
                        draggedType === device.type && 'opacity-50'
                      )}
                      draggable
                      onDragStart={() => handleDragStart(device.type)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleAddDevice(device.type)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4 text-industrial-400" />
                          <span className="text-sm text-dark-300">
                            添加 {device.label}
                          </span>
                        </div>
                        <Move className="w-4 h-4 text-dark-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 border-b border-dark-700/50 flex items-center px-4 justify-between bg-dark-900/30">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-dark-100">设备配置</h2>
            <span className="text-dark-500 text-sm">
              {currentProject?.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-dark-500">
              共 {currentProject?.stations.reduce((sum, s) => sum + s.devices.length, 0) || 0} 个设备
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {filteredStations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-dark-800 flex items-center justify-center mb-4">
                <Cog className="w-10 h-10 text-dark-600" />
              </div>
              <h3 className="text-lg font-medium text-dark-200 mb-2">
                {searchQuery ? '未找到匹配结果' : '暂无工位'}
              </h3>
              <p className="text-dark-500">
                {searchQuery
                  ? '请尝试其他搜索关键词'
                  : '请先在项目中创建工位'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredStations.map((station, stationIndex) => (
                <StationDeviceSection
                  key={station.id}
                  station={station}
                  stationIndex={stationIndex}
                  isDragOver={dragOverStation === station.id}
                  selectedDeviceId={selectedNode?.deviceId || null}
                  onDragOver={(e) => handleDragOver(e, station.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={() => handleDrop(station.id)}
                  onSelectDevice={handleSelectDevice}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="w-80 border-l border-dark-700/50 bg-dark-900/50">
        <div className="h-14 border-b border-dark-700/50 flex items-center px-4">
          <h2 className="font-semibold text-dark-100">属性面板</h2>
        </div>
        <div className="h-[calc(100%-3.5rem)]">{renderPropertyPanel()}</div>
      </div>
    </div>
  );
}

interface StationDeviceSectionProps {
  station: Station;
  stationIndex: number;
  isDragOver: boolean;
  selectedDeviceId: string | null;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onSelectDevice: (deviceId: string) => void;
}

function StationDeviceSection({
  station,
  stationIndex,
  isDragOver,
  selectedDeviceId,
  onDragOver,
  onDragLeave,
  onDrop,
  onSelectDevice,
}: StationDeviceSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const statusColor = stationIndex % 3 === 0 ? 'bg-emerald-500' : stationIndex % 3 === 1 ? 'bg-amber-500' : 'bg-red-500';
  const statusLabel = stationIndex % 3 === 0 ? '运行' : stationIndex % 3 === 1 ? '待机' : '故障';

  return (
    <div
      className={cn(
        'rounded-xl border transition-all duration-300 overflow-hidden',
        isDragOver
          ? 'border-industrial-500 bg-industrial-500/5 shadow-industrial'
          : 'border-dark-700 bg-dark-900/50 hover:border-dark-600'
      )}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-dark-800/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-dark-800 flex items-center justify-center">
            <Target className="w-5 h-5 text-industrial-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-dark-100">{station.name}</h3>
              <span className="text-xs text-dark-500">#{station.position || stationIndex + 1}</span>
            </div>
            <p className="text-sm text-dark-500">{station.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={cn('w-2 h-2 rounded-full', statusColor, 'glow-green')} />
            <span className="text-xs text-dark-400">{statusLabel}</span>
          </div>
          <span className="text-xs text-dark-500">
            {station.devices.length} 个设备
          </span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-dark-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-dark-500" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 pt-0">
          {station.devices.length === 0 ? (
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200',
                isDragOver
                  ? 'border-industrial-500 bg-industrial-500/10'
                  : 'border-dark-700 hover:border-dark-600'
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-dark-500" />
              </div>
              <p className="text-dark-400 text-sm">拖拽设备到此处添加</p>
              <p className="text-dark-600 text-xs mt-1">或点击左侧设备库中的添加按钮</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {station.devices.map((device) => {
                const deviceInfo = deviceLibrary.find((d) => d.type === device.type);
                const Icon = deviceInfo?.icon || MoreHorizontal;
                const isSelected = selectedDeviceId === device.id;

                return (
                  <div
                    key={device.id}
                    className={cn(
                      'config-card cursor-pointer group relative',
                      isSelected && 'border-industrial-500 bg-industrial-500/5',
                      'animate-fade-in'
                    )}
                    onClick={() => onSelectDevice(device.id)}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={cn(
                          'w-14 h-14 rounded-xl flex items-center justify-center mb-3 transition-all duration-300',
                          deviceInfo?.bgColor,
                          'group-hover:scale-110'
                        )}
                      >
                        <Icon className={cn('w-7 h-7', deviceInfo?.color)} />
                      </div>
                      <div className="text-sm font-medium text-dark-200 truncate w-full">
                        {device.name}
                      </div>
                      <div className="text-xs text-dark-500 mt-0.5">
                        {deviceInfo?.label}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-industrial-500 glow-blue" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface DevicePropertiesProps {
  device: Device;
  onUpdate: (updates: Partial<Device>) => void;
}

function ThreeColorLightProperties({ device, onUpdate }: DevicePropertiesProps) {
  const config = (device as Device & { config?: ThreeColorLightConfig }).config || {
    redEnabled: true,
    yellowEnabled: true,
    greenEnabled: true,
    blinkMode: 'off' as const,
    brightness: 100,
  };

  const updateConfig = (updates: Partial<ThreeColorLightConfig>) => {
    onUpdate({ ...device, config: { ...config, ...updates } } as Partial<Device>);
  };

  return (
    <div>
      <h4 className="section-title">
        <Lightbulb className="w-4 h-4" />
        三色灯配置
      </h4>
      <div className="space-y-4">
        <div>
          <label className="label-text">颜色通道</label>
          <div className="grid grid-cols-3 gap-2">
            <ColorToggle
              label="红灯"
              color="bg-red-500"
              glowClass="glow-red"
              enabled={config.redEnabled}
              onToggle={() => updateConfig({ redEnabled: !config.redEnabled })}
            />
            <ColorToggle
              label="黄灯"
              color="bg-amber-500"
              glowClass="glow-yellow"
              enabled={config.yellowEnabled}
              onToggle={() => updateConfig({ yellowEnabled: !config.yellowEnabled })}
            />
            <ColorToggle
              label="绿灯"
              color="bg-emerald-500"
              glowClass="glow-green"
              enabled={config.greenEnabled}
              onToggle={() => updateConfig({ greenEnabled: !config.greenEnabled })}
            />
          </div>
        </div>

        <div>
          <label className="label-text">闪烁模式</label>
          <select
            className="select-field"
            value={config.blinkMode}
            onChange={(e) =>
              updateConfig({ blinkMode: e.target.value as ThreeColorLightConfig['blinkMode'] })
            }
          >
            <option value="off">常亮</option>
            <option value="slow">慢闪 (1Hz)</option>
            <option value="fast">快闪 (2Hz)</option>
            <option value="strobe">爆闪</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label-text mb-0">亮度</label>
            <span className="text-sm text-dark-400 font-mono">{config.brightness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={config.brightness}
            onChange={(e) => updateConfig({ brightness: Number(e.target.value) })}
            className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-industrial-500"
          />
        </div>
      </div>
    </div>
  );
}

function ColorToggle({
  label,
  color,
  glowClass,
  enabled,
  onToggle,
}: {
  label: string;
  color: string;
  glowClass: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      className={cn(
        'p-3 rounded-lg border transition-all duration-200 flex flex-col items-center gap-2',
        enabled
          ? 'border-dark-500 bg-dark-800'
          : 'border-dark-700 bg-dark-900 opacity-50'
      )}
      onClick={onToggle}
    >
      <div
        className={cn(
          'w-6 h-6 rounded-full transition-all duration-200',
          color,
          enabled && glowClass
        )}
      />
      <span className="text-xs text-dark-300">{label}</span>
    </button>
  );
}

function ButtonProperties({ device, onUpdate }: DevicePropertiesProps) {
  const config = (device as Device & { config?: ButtonConfig }).config || {
    contactType: 'normallyOpen' as const,
    debounceTime: 10,
  };

  const updateConfig = (updates: Partial<ButtonConfig>) => {
    onUpdate({ ...device, config: { ...config, ...updates } } as Partial<Device>);
  };

  return (
    <div>
      <h4 className="section-title">
        <Square className="w-4 h-4" />
        按钮配置
      </h4>
      <div className="space-y-4">
        <div>
          <label className="label-text">触点类型</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              className={cn(
                'p-3 rounded-lg border transition-all duration-200 text-left',
                config.contactType === 'normallyOpen'
                  ? 'border-industrial-500 bg-industrial-500/10'
                  : 'border-dark-700 bg-dark-800/50 hover:border-dark-600'
              )}
              onClick={() => updateConfig({ contactType: 'normallyOpen' })}
            >
              <div className="text-sm font-medium text-dark-200">常开 (NO)</div>
              <div className="text-xs text-dark-500 mt-1">按下时导通</div>
            </button>
            <button
              className={cn(
                'p-3 rounded-lg border transition-all duration-200 text-left',
                config.contactType === 'normallyClosed'
                  ? 'border-industrial-500 bg-industrial-500/10'
                  : 'border-dark-700 bg-dark-800/50 hover:border-dark-600'
              )}
              onClick={() => updateConfig({ contactType: 'normallyClosed' })}
            >
              <div className="text-sm font-medium text-dark-200">常闭 (NC)</div>
              <div className="text-xs text-dark-500 mt-1">按下时断开</div>
            </button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label-text mb-0 flex items-center gap-2">
              <Timer className="w-4 h-4" />
              防抖时间
            </label>
            <span className="text-sm text-dark-400 font-mono">{config.debounceTime}ms</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={config.debounceTime}
            onChange={(e) => updateConfig({ debounceTime: Number(e.target.value) })}
            className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-industrial-500"
          />
        </div>
      </div>
    </div>
  );
}

function SensorProperties({ device, onUpdate }: DevicePropertiesProps) {
  const config = (device as Device & { config?: SensorConfig }).config || {
    sensorType: 'photoelectric' as const,
    triggerThreshold: 50,
  };

  const updateConfig = (updates: Partial<SensorConfig>) => {
    onUpdate({ ...device, config: { ...config, ...updates } } as Partial<Device>);
  };

  const sensorTypes = [
    { value: 'photoelectric', label: '光电传感器', icon: Eye, description: '对射/漫反射/镜面反射' },
    { value: 'proximity', label: '接近传感器', icon: Activity, description: '电感式/电容式' },
    { value: 'pressure', label: '压力传感器', icon: Gauge, description: '气压/液压检测' },
  ];

  return (
    <div>
      <h4 className="section-title">
        <Gauge className="w-4 h-4" />
        传感器配置
      </h4>
      <div className="space-y-4">
        <div>
          <label className="label-text">传感器类型</label>
          <div className="space-y-2">
            {sensorTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = config.sensorType === type.value;
              return (
                <button
                  key={type.value}
                  className={cn(
                    'w-full p-3 rounded-lg border transition-all duration-200 flex items-center gap-3 text-left',
                    isSelected
                      ? 'border-industrial-500 bg-industrial-500/10'
                      : 'border-dark-700 bg-dark-800/50 hover:border-dark-600'
                  )}
                  onClick={() =>
                    updateConfig({ sensorType: type.value as SensorConfig['sensorType'] })
                  }
                >
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      isSelected ? 'bg-industrial-500/20 text-industrial-400' : 'bg-dark-700 text-dark-400'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-dark-200">{type.label}</div>
                    <div className="text-xs text-dark-500">{type.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label-text mb-0 flex items-center gap-2">
              <Thermometer className="w-4 h-4" />
              触发阈值
            </label>
            <span className="text-sm text-dark-400 font-mono">{config.triggerThreshold}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={config.triggerThreshold}
            onChange={(e) => updateConfig({ triggerThreshold: Number(e.target.value) })}
            className="w-full h-2 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-industrial-500"
          />
        </div>
      </div>
    </div>
  );
}

function MotorProperties({ device, onUpdate }: DevicePropertiesProps) {
  const config = (device as Device & { config?: MotorConfig }).config || {
    ratedPower: 1.5,
    maxSpeed: 3000,
    overloadProtection: true,
  };

  const updateConfig = (updates: Partial<MotorConfig>) => {
    onUpdate({ ...device, config: { ...config, ...updates } } as Partial<Device>);
  };

  return (
    <div>
      <h4 className="section-title">
        <Cog className="w-4 h-4" />
        电机配置
      </h4>
      <div className="space-y-4">
        <div>
          <label className="label-text">额定功率 (kW)</label>
          <input
            type="number"
            step="0.1"
            className="input-field"
            value={config.ratedPower}
            onChange={(e) => updateConfig({ ratedPower: Number(e.target.value) })}
          />
        </div>

        <div>
          <label className="label-text">额定转速 (RPM)</label>
          <input
            type="number"
            className="input-field"
            value={config.maxSpeed}
            onChange={(e) => updateConfig({ maxSpeed: Number(e.target.value) })}
          />
        </div>

        <div>
          <label className="label-text flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              过载保护
            </span>
            <button
              className={cn(
                'relative w-11 h-6 rounded-full transition-colors duration-200',
                config.overloadProtection ? 'bg-industrial-600' : 'bg-dark-600'
              )}
              onClick={() => updateConfig({ overloadProtection: !config.overloadProtection })}
            >
              <div
                className={cn(
                  'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200',
                  config.overloadProtection && 'translate-x-5'
                )}
              />
            </button>
          </label>
          <p className="text-xs text-dark-500 mt-2">
            启用后电机过载时自动停机保护
          </p>
        </div>
      </div>
    </div>
  );
}
