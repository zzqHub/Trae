import { ChevronRight, ChevronLeft, Settings, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';
import { Card, CardContent } from '@/components/common/Card';
import Badge from '@/components/common/Badge';

interface RightPanelProps {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

function ProjectProperties() {
  const { currentProject } = useProjectStore();
  if (!currentProject) return null;

  const brandMap: Record<string, string> = {
    siemens: '西门子',
    mitsubishi: '三菱',
    omron: '欧姆龙',
    delta: '台达',
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-dark-400">项目名称</label>
        <input
          type="text"
          value={currentProject.name}
          readOnly
          className="w-full h-9 px-3 bg-dark-900/50 border border-dark-700 rounded text-sm text-dark-200 focus:outline-none focus:border-industrial-500/50"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-dark-400">PLC 品牌</label>
        <div className="flex items-center h-9 px-3 bg-dark-900/50 border border-dark-700 rounded">
          <Badge variant="info" size="sm">
            {brandMap[currentProject.plcBrand] || currentProject.plcBrand}
          </Badge>
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-dark-400">项目描述</label>
        <textarea
          value={currentProject.description || ''}
          readOnly
          rows={3}
          className="w-full px-3 py-2 bg-dark-900/50 border border-dark-700 rounded text-sm text-dark-300 resize-none focus:outline-none focus:border-industrial-500/50"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-dark-400">工位数量</label>
          <div className="h-9 px-3 flex items-center bg-dark-900/50 border border-dark-700 rounded text-sm text-dark-200">
            {currentProject.stations.length}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-dark-400">创建时间</label>
          <div className="h-9 px-3 flex items-center bg-dark-900/50 border border-dark-700 rounded text-xs text-dark-400">
            {new Date(currentProject.createdAt).toLocaleDateString('zh-CN')}
          </div>
        </div>
      </div>
    </div>
  );
}

function StationProperties() {
  const { currentProject, selectedNode } = useProjectStore();
  if (!currentProject || !selectedNode?.stationId) return null;

  const station = currentProject.stations.find((s) => s.id === selectedNode.stationId);
  if (!station) return null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-medium text-dark-400">工位名称</label>
        <input
          type="text"
          value={station.name}
          readOnly
          className="w-full h-9 px-3 bg-dark-900/50 border border-dark-700 rounded text-sm text-dark-200 focus:outline-none focus:border-industrial-500/50"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-dark-400">工位描述</label>
        <textarea
          value={station.description || ''}
          readOnly
          rows={2}
          className="w-full px-3 py-2 bg-dark-900/50 border border-dark-700 rounded text-sm text-dark-300 resize-none focus:outline-none focus:border-industrial-500/50"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <label className="text-xs font-medium text-dark-400">设备数量</label>
          <div className="h-9 px-3 flex items-center bg-dark-900/50 border border-dark-700 rounded text-sm text-dark-200">
            {station.devices.length}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-dark-400">模块数量</label>
          <div className="h-9 px-3 flex items-center bg-dark-900/50 border border-dark-700 rounded text-sm text-dark-200">
            {station.modules.length}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-12 h-12 rounded-full bg-dark-800 flex items-center justify-center mb-3">
        <Info className="w-6 h-6 text-dark-500" />
      </div>
      <p className="text-sm text-dark-400">选择一个节点查看属性</p>
      <p className="text-xs text-dark-600 mt-1">点击左侧项目树中的任意项</p>
    </div>
  );
}

export default function RightPanel({ className, collapsed, onToggle }: RightPanelProps) {
  const { selectedNode } = useProjectStore();

  const getPanelTitle = () => {
    if (!selectedNode) return '属性面板';
    const typeMap: Record<string, string> = {
      project: '项目属性',
      mainProgram: '主程序属性',
      station: '工位属性',
      devices: '设备配置',
      io: 'IO配置',
      modules: '模块库',
      events: '事件配置',
      templates: '模板管理',
      rules: '规则引擎',
      ai: 'AI助手',
      codeGen: '代码生成',
    };
    return typeMap[selectedNode.type] || '属性面板';
  };

  const renderContent = () => {
    if (!selectedNode) return <EmptyState />;

    switch (selectedNode.type) {
      case 'project':
        return <ProjectProperties />;
      case 'station':
        return <StationProperties />;
      default:
        return <EmptyState />;
    }
  };

  return (
    <div
      className={cn(
        'h-full bg-dark-900 border-l border-dark-700 flex flex-col transition-all duration-300',
        collapsed ? 'w-0 border-l-0' : 'w-72',
        className
      )}
    >
      {!collapsed && (
        <>
          <div className="h-12 flex items-center justify-between px-4 border-b border-dark-700 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-industrial-500" />
              <span className="text-sm font-medium text-dark-200">{getPanelTitle()}</span>
            </div>
            <button
              onClick={onToggle}
              className="w-7 h-7 flex items-center justify-center rounded hover:bg-dark-800 text-dark-400 hover:text-dark-200 transition-colors"
              title="收起面板"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {selectedNode && (selectedNode.type === 'project' || selectedNode.type === 'station') ? (
              <Tabs defaultValue="properties" className="p-3">
                <TabsList className="w-full">
                  <TabsTrigger value="properties" className="flex-1">属性</TabsTrigger>
                  <TabsTrigger value="advanced" className="flex-1">高级</TabsTrigger>
                </TabsList>
                <TabsContent value="properties">
                  <Card>
                    <CardContent className="pt-4">
                      {renderContent()}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="advanced">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-dark-500 text-center py-4">高级设置</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="p-3">{renderContent()}</div>
            )}
          </div>
        </>
      )}

      {collapsed && (
        <button
          onClick={onToggle}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-16 bg-dark-800 border border-dark-700 border-r-0 rounded-l-md flex items-center justify-center text-dark-400 hover:text-dark-200 hover:bg-dark-700 transition-colors z-10"
          title="展开面板"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
