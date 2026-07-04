import { useState } from 'react';
import {
  Play,
  Square,
  AlertTriangle,
  Activity,
  Settings,
  GitBranch,
  ArrowRight,
  Clock,
  ShieldAlert,
  Zap,
  Power,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronUp,
  Gauge,
  Timer,
  CheckCircle2,
  XCircle,
  Wrench,
  Pause,
  AlertCircle,
  Info,
  Cpu,
  Layers,
  Boxes,
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';
import type {
  DeviceState,
  AlarmLevel,
  StartLogicStep,
  StopType,
  ProgramBlock,
} from '@/types';

const stateConfig: Record<DeviceState, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof Power }> = {
  idle: { label: '待机', color: 'text-sky-400', bgColor: 'bg-sky-900/30', borderColor: 'border-sky-600/50', icon: Power },
  running: { label: '运行', color: 'text-emerald-400', bgColor: 'bg-emerald-900/30', borderColor: 'border-emerald-600/50', icon: Play },
  paused: { label: '暂停', color: 'text-amber-400', bgColor: 'bg-amber-900/30', borderColor: 'border-amber-600/50', icon: Pause },
  fault: { label: '故障', color: 'text-red-400', bgColor: 'bg-red-900/30', borderColor: 'border-red-600/50', icon: AlertCircle },
  maintenance: { label: '维护', color: 'text-purple-400', bgColor: 'bg-purple-900/30', borderColor: 'border-purple-600/50', icon: Wrench },
};

const alarmLevelConfig: Record<AlarmLevel, { label: string; color: string; bgColor: string; borderColor: string; icon: typeof Info }> = {
  info: { label: '信息', color: 'text-sky-400', bgColor: 'bg-sky-900/30', borderColor: 'border-sky-700/50', icon: Info },
  warning: { label: '警告', color: 'text-amber-400', bgColor: 'bg-amber-900/30', borderColor: 'border-amber-700/50', icon: AlertTriangle },
  error: { label: '错误', color: 'text-red-400', bgColor: 'bg-red-900/30', borderColor: 'border-red-700/50', icon: XCircle },
  critical: { label: '严重', color: 'text-rose-400', bgColor: 'bg-rose-900/30', borderColor: 'border-rose-700/50', icon: ShieldAlert },
};

const stepTypeConfig: Record<string, { label: string; icon: typeof Gauge; color: string }> = {
  condition: { label: '条件判断', icon: GitBranch, color: 'text-sky-400' },
  action: { label: '执行动作', icon: Zap, color: 'text-emerald-400' },
  delay: { label: '延时等待', icon: Timer, color: 'text-amber-400' },
};

function StateMachineDiagram() {
  const currentProject = useProjectStore((s) => s.currentProject);
  const transitions = currentProject?.mainProgramConfig.stateTransitions || [];

  const statePositions: Record<DeviceState, { x: number; y: number }> = {
    idle: { x: 200, y: 80 },
    running: { x: 400, y: 80 },
    paused: { x: 400, y: 200 },
    fault: { x: 200, y: 200 },
    maintenance: { x: 60, y: 140 },
  };

  const states: DeviceState[] = ['idle', 'running', 'paused', 'fault', 'maintenance'];

  return (
    <div className="relative w-full h-[340px] bg-dark-800/30 rounded-lg border border-dark-700 overflow-hidden">
      <svg className="w-full h-full" viewBox="0 0 500 300">
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#505d6f" />
          </marker>
        </defs>

        {transitions.map((trans) => {
          const from = statePositions[trans.from];
          const to = statePositions[trans.to];
          if (!from || !to) return null;

          const dx = to.x - from.x;
          const dy = to.y - from.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const offsetX = (dx / dist) * 45;
          const offsetY = (dy / dist) * 30;

          const startX = from.x + offsetX;
          const startY = from.y + offsetY;
          const endX = to.x - offsetX;
          const endY = to.y - offsetY;

          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;

          return (
            <g key={trans.id}>
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#505d6f"
                strokeWidth="1.5"
                strokeDasharray="4 2"
                markerEnd="url(#arrowhead)"
              />
              <text
                x={midX}
                y={midY - 5}
                textAnchor="middle"
                fill="#8592a6"
                fontSize="10"
                className="font-mono"
              >
                {trans.trigger}
              </text>
            </g>
          );
        })}

        {states.map((state) => {
          const pos = statePositions[state];
          const conf = stateConfig[state];
          const Icon = conf.icon;
          return (
            <g key={state}>
              <rect
                x={pos.x - 45}
                y={pos.y - 25}
                width="90"
                height="50"
                rx="8"
                stroke="currentColor"
                strokeWidth="2"
                className={cn(conf.borderColor, 'fill-current', conf.bgColor)}
              />
              <foreignObject x={pos.x - 40} y={pos.y - 20} width="80" height="40">
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <Icon className={cn('w-4 h-4 mb-0.5', conf.color)} />
                  <span className={cn('text-xs font-medium', conf.color)}>{conf.label}</span>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function StartLogicFlow() {
  const currentProject = useProjectStore((s) => s.currentProject);
  const steps = currentProject?.mainProgramConfig.startLogic || [];

  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const conf = stepTypeConfig[step.type];
        const Icon = conf.icon;
        return (
          <div key={step.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={cn(
                'w-10 h-10 rounded-lg border-2 flex items-center justify-center',
                conf.color,
                `border-${conf.color.replace('text-', '')}/50`,
                `bg-${conf.color.replace('text-', '')}/10`
              )}>
                <Icon className="w-5 h-5" />
              </div>
              {index < steps.length - 1 && (
                <div className="w-0.5 flex-1 bg-dark-700 my-1" style={{ minHeight: '24px' }} />
              )}
            </div>
            <div className="flex-1 bg-dark-800/50 border border-dark-700 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-dark-500">步骤 {step.order}</span>
                    <Badge variant="default" size="sm">{conf.label}</Badge>
                  </div>
                  <h4 className="text-sm font-medium text-dark-100 mt-1">{step.name}</h4>
                  {step.description && (
                    <p className="text-xs text-dark-400 mt-0.5">{step.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="w-7 h-7">
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-7 h-7 text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {steps.length === 0 && (
        <div className="text-center text-dark-500 text-sm py-8 border border-dashed border-dark-700 rounded-lg">
          暂无启动步骤，点击上方按钮添加
        </div>
      )}
    </div>
  );
}

function StopLogicSection({ stopType }: { stopType: StopType }) {
  const currentProject = useProjectStore((s) => s.currentProject);
  const config = currentProject?.mainProgramConfig.stopLogic[stopType];
  const steps = config?.steps || [];

  const stopTypeConfig: Record<StopType, { label: string; icon: typeof Square; color: string; desc: string }> = {
    normal: { label: '正常停止', icon: Square, color: 'text-emerald-400', desc: '按正常流程停止设备运行' },
    emergency: { label: '紧急停止', icon: ShieldAlert, color: 'text-red-400', desc: '立即停止所有运动，切断动力' },
    safety: { label: '安全停止', icon: AlertTriangle, color: 'text-amber-400', desc: '安全回路触发时的有序停止' },
  };

  const conf = stopTypeConfig[stopType];
  const Icon = conf.icon;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', `${conf.color.replace('text-', 'bg-')}/10`)}>
              <Icon className={cn('w-5 h-5', conf.color)} />
            </div>
            <div>
              <CardTitle>{conf.label}</CardTitle>
              <CardDescription>{conf.desc}</CardDescription>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="w-3.5 h-3.5" />
            添加步骤
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {steps.map((step, index) => {
            const sConf = stepTypeConfig[step.type];
            const StepIcon = sConf.icon;
            return (
              <div key={step.id} className="flex items-center gap-3 bg-dark-800/30 rounded-lg p-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-dark-700 flex items-center justify-center text-xs font-bold text-dark-300">
                  {index + 1}
                </div>
                <StepIcon className={cn('w-4 h-4', sConf.color)} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-dark-100">{step.name}</div>
                  {step.description && (
                    <div className="text-xs text-dark-500">{step.description}</div>
                  )}
                </div>
                <Badge variant="default" size="sm">{sConf.label}</Badge>
              </div>
            );
          })}
          {steps.length === 0 && (
            <div className="text-center text-dark-500 text-sm py-6">
              暂无停止步骤
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AlarmList() {
  const currentProject = useProjectStore((s) => s.currentProject);
  const alarms = currentProject?.mainProgramConfig.alarms || [];
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {alarms.map((alarm) => {
        const conf = alarmLevelConfig[alarm.level];
        const Icon = conf.icon;
        const isExpanded = expandedId === alarm.id;

        return (
          <Card key={alarm.id} className={cn('overflow-hidden transition-all duration-200')}>
            <div
              className="p-4 cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : alarm.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', conf.bgColor, 'border', conf.borderColor)}>
                    <Icon className={cn('w-4 h-4', conf.color)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-dark-500">{alarm.code}</span>
                      <span className={cn('text-xs font-medium px-1.5 py-0.5 rounded', conf.color, conf.bgColor)}>
                        {conf.label}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-dark-100 mt-0.5">{alarm.name}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={alarm.enabled ? 'success' : 'default'} size="sm">
                    {alarm.enabled ? '已启用' : '已禁用'}
                  </Badge>
                  {alarm.autoReset && (
                    <Badge variant="info" size="sm">自动复位</Badge>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-dark-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-dark-500" />
                  )}
                </div>
              </div>
            </div>
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-dark-700/50 pt-3">
                {alarm.description && (
                  <p className="text-sm text-dark-400 mb-3">{alarm.description}</p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium text-dark-500 mb-1">触发条件</div>
                    <div className="text-sm text-dark-200 bg-dark-800/50 rounded px-3 py-2 font-mono">
                      {alarm.triggerCondition}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-dark-500 mb-1">处理逻辑</div>
                    <div className="text-sm text-dark-200 bg-dark-800/50 rounded px-3 py-2">
                      {alarm.handlingLogic}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dark-700/30">
                  <Button variant="ghost" size="sm">
                    <Edit3 className="w-3.5 h-3.5" />
                    编辑
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    <Trash2 className="w-3.5 h-3.5" />
                    删除
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
      {alarms.length === 0 && (
        <div className="text-center text-dark-500 text-sm py-12 border border-dashed border-dark-700 rounded-lg">
          暂无报警配置
        </div>
      )}
    </div>
  );
}

function ProgramBlockList() {
  const currentProject = useProjectStore((s) => s.currentProject);
  const blocks = currentProject?.mainProgram.blocks || [];
  const allModules = currentProject?.stations.flatMap(s => s.modules) || [];

  return (
    <div className="bg-dark-800/30 border border-dark-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-industrial-400" />
          程序块调用顺序
        </h4>
        <Button variant="outline" size="sm">
          <Plus className="w-3.5 h-3.5" />
          添加块
        </Button>
      </div>
      <div className="space-y-2">
        {blocks.map((block, index) => {
          const module = allModules.find(m => m.id === block.moduleId);
          return (
            <div key={block.id} className="flex items-center gap-3 bg-dark-900/50 rounded-lg p-3 border border-dark-700/50">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-industrial-500/20 flex items-center justify-center text-xs font-bold text-industrial-400">
                {index + 1}
              </div>
              {block.type === 'call' ? (
                <>
                  <Boxes className="w-4 h-4 text-purple-400" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-dark-100">{module?.name || '未知模块'}</div>
                    <div className="text-xs text-dark-500">
                      {module?.type === 'FB' ? '功能块 (FB)' : '功能 (FC)'} 调用
                    </div>
                  </div>
                  <Badge variant="default" size="sm">{module?.type}</Badge>
                </>
              ) : block.type === 'network' ? (
                <>
                  <GitBranch className="w-4 h-4 text-emerald-400" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-dark-100">网络段</div>
                    <div className="text-xs text-dark-500">梯形图逻辑网络</div>
                  </div>
                  <Badge variant="info" size="sm">Network</Badge>
                </>
              ) : (
                <>
                  <Activity className="w-4 h-4 text-amber-400" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-dark-100">注释</div>
                    <div className="text-xs text-dark-500">程序注释段</div>
                  </div>
                </>
              )}
            </div>
          );
        })}
        {blocks.length === 0 && (
          <div className="text-center text-dark-500 text-sm py-6">
            暂无程序块
          </div>
        )}
      </div>
    </div>
  );
}

export default function MainProgramConfig() {
  const currentProject = useProjectStore((s) => s.currentProject);
  const [activeTab, setActiveTab] = useState('start');

  return (
    <div className="h-full flex flex-col bg-dark-950 overflow-hidden">
      <div className="px-6 py-4 border-b border-dark-700 bg-dark-900/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-industrial-500/20 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-industrial-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-dark-50">主程序配置</h1>
              <p className="text-sm text-dark-400">
                {currentProject?.name || '当前项目'} - 主程序结构与逻辑配置
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-dark-500">程序块数量</div>
              <div className="text-lg font-bold text-dark-100">
                {currentProject?.mainProgram.blocks.length || 0}
              </div>
            </div>
            <Button variant="primary">
              <RefreshCw className="w-4 h-4" />
              生成程序
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="px-6 pt-4 flex-shrink-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="start">
                  <Play className="w-4 h-4 mr-1.5" />
                  启动逻辑
                </TabsTrigger>
                <TabsTrigger value="stop">
                  <Square className="w-4 h-4 mr-1.5" />
                  停止逻辑
                </TabsTrigger>
                <TabsTrigger value="alarm">
                  <AlertTriangle className="w-4 h-4 mr-1.5" />
                  报警管理
                </TabsTrigger>
                <TabsTrigger value="state">
                  <Activity className="w-4 h-4 mr-1.5" />
                  状态机
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex-1 overflow-auto p-6">
            <TabsContent value="start">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-industrial-400" />
                      启动流程配置
                    </h3>
                    <Button variant="outline" size="sm">
                      <Plus className="w-3.5 h-3.5" />
                      添加步骤
                    </Button>
                  </div>
                  <StartLogicFlow />
                </div>
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-industrial-400" />
                    程序块列表
                  </h3>
                  <ProgramBlockList />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="stop">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <StopLogicSection stopType="normal" />
                <StopLogicSection stopType="emergency" />
                <StopLogicSection stopType="safety" />
              </div>
            </TabsContent>

            <TabsContent value="alarm">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-industrial-400" />
                    报警配置列表
                  </h3>
                  <div className="flex items-center gap-2">
                    <select className="select-field w-32 text-sm">
                      <option value="all">全部等级</option>
                      <option value="info">信息</option>
                      <option value="warning">警告</option>
                      <option value="error">错误</option>
                      <option value="critical">严重</option>
                    </select>
                    <Button variant="primary" size="sm">
                      <Plus className="w-3.5 h-3.5" />
                      新建报警
                    </Button>
                  </div>
                </div>
                <AlarmList />
              </div>
            </TabsContent>

            <TabsContent value="state">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-dark-200 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-industrial-400" />
                    设备状态流转图
                  </h3>
                  <StateMachineDiagram />
                  <div className="flex flex-wrap gap-2 mt-4">
                    {Object.entries(stateConfig).map(([key, conf]) => {
                      const Icon = conf.icon;
                      return (
                        <div key={key} className="flex items-center gap-1.5 bg-dark-800/50 px-2 py-1 rounded text-xs">
                          <Icon className={cn('w-3.5 h-3.5', conf.color)} />
                          <span className="text-dark-300">{conf.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-dark-200 flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-industrial-400" />
                      状态转移配置
                    </h3>
                    <Button variant="outline" size="sm">
                      <Plus className="w-3.5 h-3.5" />
                      添加转移
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-[400px] overflow-auto pr-2">
                    {currentProject?.mainProgramConfig.stateTransitions.map((trans) => {
                      const fromConf = stateConfig[trans.from];
                      const toConf = stateConfig[trans.to];
                      return (
                        <Card key={trans.id}>
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={cn('text-xs font-medium px-2 py-0.5 rounded', fromConf.color, fromConf.bgColor)}>
                                {fromConf.label}
                              </span>
                              <ArrowRight className="w-4 h-4 text-dark-500" />
                              <span className={cn('text-xs font-medium px-2 py-0.5 rounded', toConf.color, toConf.bgColor)}>
                                {toConf.label}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-dark-100">{trans.trigger}</div>
                            {trans.condition && (
                              <div className="text-xs text-dark-500 mt-1">
                                条件: <span className="font-mono">{trans.condition}</span>
                              </div>
                            )}
                            {trans.action && (
                              <div className="text-xs text-dark-500">
                                动作: {trans.action}
                              </div>
                            )}
                            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-dark-700/30">
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                                <Edit3 className="w-3 h-3 mr-1" />
                                编辑
                              </Button>
                              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20">
                                <Trash2 className="w-3 h-3 mr-1" />
                                删除
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                    {(!currentProject?.mainProgramConfig.stateTransitions.length) && (
                      <div className="text-center text-dark-500 text-sm py-8 border border-dashed border-dark-700 rounded-lg">
                        暂无状态转移配置
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </div>
      </div>
    </div>
  );
}
