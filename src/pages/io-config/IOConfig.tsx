import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Edit3,
  Download,
  Upload,
  Save,
  X,
  Zap,
  ArrowRight,
  ArrowLeft,
  Gauge,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Layers,
  Grid3x3,
  GitBranch,
  Copy,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/common/Tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { useProjectStore } from '@/store/projectStore';
import type { IoPoint, IoType, Device } from '@/types';
import { cn } from '@/lib/utils';

type IOTab = 'matrix' | 'mapping';
type MatrixTab = 'di' | 'ai' | 'do' | 'ao';

interface IOWithDevice extends IoPoint {
  deviceId: string;
  deviceName: string;
}

const IOConfig = () => {
  const { currentProject, updateIoPoint, deleteIoPoint, addIoPoint } = useProjectStore();

  const [ioTab, setIoTab] = useState<IOTab>('matrix');
  const [matrixTab, setMatrixTab] = useState<MatrixTab>('di');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingIo, setEditingIo] = useState<(IOWithDevice & { stationId: string }) | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [newIoType, setNewIoType] = useState<IoType>('DI');
  const [newIoName, setNewIoName] = useState('');
  const [newIoAddress, setNewIoAddress] = useState('');
  const [newIoDesc, setNewIoDesc] = useState('');
  const [newIoDeviceId, setNewIoDeviceId] = useState<string>('');

  const currentStation = currentProject?.stations[0];
  const devices = currentStation?.devices || [];

  const allIoPoints = useMemo<IOWithDevice[]>(() => {
    const points: IOWithDevice[] = [];
    devices.forEach((device) => {
      device.ioPoints.forEach((io) => {
        points.push({
          ...io,
          deviceId: device.id,
          deviceName: device.name,
        });
      });
    });
    return points;
  }, [devices]);

  const filteredIoPoints = useMemo(() => {
    let result = allIoPoints;
    if (matrixTab === 'di') {
      result = result.filter((io) => io.type === 'DI');
    } else if (matrixTab === 'ai') {
      result = result.filter((io) => io.type === 'AI');
    } else if (matrixTab === 'do') {
      result = result.filter((io) => io.type === 'DO');
    } else if (matrixTab === 'ao') {
      result = result.filter((io) => io.type === 'AO');
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (io) =>
          io.name.toLowerCase().includes(q) ||
          io.address.toLowerCase().includes(q) ||
          io.deviceName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allIoPoints, matrixTab, searchQuery]);

  const ioStats = useMemo(() => {
    return {
      di: allIoPoints.filter((io) => io.type === 'DI').length,
      ai: allIoPoints.filter((io) => io.type === 'AI').length,
      do: allIoPoints.filter((io) => io.type === 'DO').length,
      ao: allIoPoints.filter((io) => io.type === 'AO').length,
      total: allIoPoints.length,
    };
  }, [allIoPoints]);

  const getIoTypeIcon = (type: IoType) => {
    switch (type) {
      case 'DI':
        return <ToggleLeft className="w-4 h-4" />;
      case 'DO':
        return <ToggleRight className="w-4 h-4" />;
      case 'AI':
        return <Gauge className="w-4 h-4" />;
      case 'AO':
        return <Zap className="w-4 h-4" />;
    }
  };

  const getIoTypeBadge = (type: IoType) => {
    const variantMap = {
      DI: 'info' as const,
      DO: 'success' as const,
      AI: 'warning' as const,
      AO: 'error' as const,
    };
    return (
      <Badge variant={variantMap[type]} size="sm">
        {type}
      </Badge>
    );
  };

  const handleStartEdit = (io: IOWithDevice) => {
    if (!currentStation) return;
    setEditingIo({ ...io, stationId: currentStation.id });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingIo(null);
  };

  const handleSaveEdit = () => {
    if (!editingIo || !currentProject || !currentStation) return;
    updateIoPoint(currentProject.id, currentStation.id, editingIo.deviceId, editingIo.id, {
      name: editingIo.name,
      address: editingIo.address,
      description: editingIo.description,
      type: editingIo.type,
      defaultValue: editingIo.defaultValue,
    });
    setIsEditing(false);
    setEditingIo(null);
  };

  const handleDeleteIo = (io: IOWithDevice) => {
    if (!currentProject || !currentStation) return;
    if (confirm(`确定要删除IO点 "${io.name}" 吗？`)) {
      deleteIoPoint(currentProject.id, currentStation.id, io.deviceId, io.id);
    }
  };

  const handleAutoAddress = () => {
    if (!currentProject || !currentStation) return;
    alert('地址自动分配功能：将按顺序重新分配IO地址');
  };

  const handleNewIo = () => {
    if (!newIoName.trim() || !newIoAddress.trim() || !newIoDeviceId || !currentProject || !currentStation) return;
    addIoPoint(currentProject.id, currentStation.id, newIoDeviceId, {
      name: newIoName,
      type: newIoType,
      address: newIoAddress,
      description: newIoDesc,
    });
    setShowNewModal(false);
    setNewIoName('');
    setNewIoAddress('');
    setNewIoDesc('');
    setNewIoDeviceId('');
  };

  const updateEditingIoField = <K extends keyof IOWithDevice>(key: K, value: IOWithDevice[K]) => {
    if (!editingIo) return;
    setEditingIo({ ...editingIo, [key]: value });
  };

  const handleExport = () => {
    const data = JSON.stringify(allIoPoints, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'io-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 bg-slate-800/50">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg font-semibold text-slate-100">IO配置</h2>
          <Badge variant="default" size="sm">{ioStats.total} 个点</Badge>
          <div className="flex items-center gap-1 ml-2 text-xs text-slate-500">
            <span className="text-sky-400">DI: {ioStats.di}</span>
            <span>/</span>
            <span className="text-emerald-400">DO: {ioStats.do}</span>
            <span>/</span>
            <span className="text-amber-400">AI: {ioStats.ai}</span>
            <span>/</span>
            <span className="text-red-400">AO: {ioStats.ao}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAutoAddress}>
            <RefreshCw className="w-4 h-4" />
            自动分配
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4" />
            导出
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="w-4 h-4" />
            导入
          </Button>
          <Button variant="primary" size="sm" onClick={() => setShowNewModal(true)}>
            <Plus className="w-4 h-4" />
            新建IO点
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs defaultValue="matrix" value={ioTab} onValueChange={(v) => setIoTab(v as IOTab)} className="flex-1 flex flex-col">
          <div className="px-4 pt-3 border-b border-slate-700 bg-slate-800/30">
            <TabsList>
              <TabsTrigger value="matrix">
                <Grid3x3 className="w-4 h-4 mr-1.5" />
                IO矩阵视图
              </TabsTrigger>
              <TabsTrigger value="mapping">
                <GitBranch className="w-4 h-4 mr-1.5" />
                IO映射表
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="matrix" className="mt-0 flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-4">
              <Tabs defaultValue="di" value={matrixTab} onValueChange={(v) => setMatrixTab(v as MatrixTab)}>
                <TabsList>
                  <TabsTrigger value="di">
                    <ToggleLeft className="w-4 h-4 mr-1.5 text-sky-400" />
                    DI 输入 ({ioStats.di})
                  </TabsTrigger>
                  <TabsTrigger value="ai">
                    <Gauge className="w-4 h-4 mr-1.5 text-amber-400" />
                    AI 模拟 ({ioStats.ai})
                  </TabsTrigger>
                  <TabsTrigger value="do">
                    <ToggleRight className="w-4 h-4 mr-1.5 text-emerald-400" />
                    DO 输出 ({ioStats.do})
                  </TabsTrigger>
                  <TabsTrigger value="ao">
                    <Zap className="w-4 h-4 mr-1.5 text-red-400" />
                    AO 模拟 ({ioStats.ao})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex-1" />
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="搜索IO点..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
                筛选
              </Button>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-800 z-10">
                  <tr className="border-b border-slate-700">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider w-20">地址</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider w-20">类型</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">名称</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">绑定设备</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider">描述</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider w-24">状态</th>
                    <th className="text-right px-4 py-2.5 text-xs font-medium text-slate-400 uppercase tracking-wider w-28">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {filteredIoPoints.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-16 text-center text-slate-500">
                        <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p>暂无IO点</p>
                      </td>
                    </tr>
                  ) : (
                    filteredIoPoints.map((io) => (
                      <tr key={io.id} className="hover:bg-slate-700/30">
                        <td className="px-4 py-2.5">
                          <code className="text-sm font-mono text-amber-400 bg-slate-800 px-2 py-1 rounded">
                            {io.address}
                          </code>
                        </td>
                        <td className="px-4 py-2.5">{getIoTypeBadge(io.type)}</td>
                        <td className="px-4 py-2.5">
                          <span className="text-sm text-slate-200 font-medium">{io.name}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge variant="default" size="sm">{io.deviceName}</Badge>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-sm text-slate-400">{io.description || '-'}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              'w-2.5 h-2.5 rounded-full',
                              Math.random() > 0.3 ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-slate-600'
                            )} />
                            <span className="text-xs text-slate-500">
                              {Math.random() > 0.3 ? '正常' : '未使用'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleStartEdit(io)}
                              className="p-1.5 text-slate-500 hover:text-amber-400 hover:bg-slate-700/50 rounded transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteIo(io)}
                              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-700/50 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="mapping" className="mt-0 flex-1 flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/50 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-400" />
                <span className="text-sm text-slate-300">设备IO映射关系</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-sky-500" />
                  输入点
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  输出点
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                {devices.length === 0 ? (
                  <div className="text-center py-16 text-slate-500">
                    <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>暂无设备</p>
                  </div>
                ) : (
                  devices.map((device) => (
                    <Card key={device.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700 text-slate-300">
                              <Zap className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className="text-sm">{device.name}</CardTitle>
                              <p className="text-xs text-slate-500 mt-0.5">{device.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="info" size="sm">
                              {device.ioPoints.filter((io) => io.type === 'DI' || io.type === 'AI').length} 输入
                            </Badge>
                            <Badge variant="success" size="sm">
                              {device.ioPoints.filter((io) => io.type === 'DO' || io.type === 'AO').length} 输出
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <ArrowRight className="w-4 h-4 text-sky-400" />
                              <span className="text-sm font-medium text-slate-300">输入信号</span>
                            </div>
                            <div className="space-y-1.5">
                              {device.ioPoints.filter((io) => io.type === 'DI' || io.type === 'AI').length === 0 ? (
                                <p className="text-xs text-slate-600 pl-6">无输入点</p>
                              ) : (
                                device.ioPoints
                                  .filter((io) => io.type === 'DI' || io.type === 'AI')
                                  .map((io) => (
                                    <div
                                      key={io.id}
                                      className="flex items-center gap-2 p-2 bg-slate-900/50 rounded border border-slate-700 hover:border-sky-600/50 transition-colors cursor-pointer"
                                    >
                                      <div className={cn(
                                        'w-2 h-2 rounded-full',
                                        io.type === 'DI' ? 'bg-sky-500' : 'bg-amber-500'
                                      )} />
                                      <code className="text-xs font-mono text-amber-400 w-16">{io.address}</code>
                                      <span className="text-sm text-slate-300 flex-1 truncate">{io.name}</span>
                                      {getIoTypeBadge(io.type)}
                                    </div>
                                  ))
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-2 justify-end">
                              <span className="text-sm font-medium text-slate-300">输出信号</span>
                              <ArrowLeft className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div className="space-y-1.5">
                              {device.ioPoints.filter((io) => io.type === 'DO' || io.type === 'AO').length === 0 ? (
                                <p className="text-xs text-slate-600 text-center pr-6">无输出点</p>
                              ) : (
                                device.ioPoints
                                  .filter((io) => io.type === 'DO' || io.type === 'AO')
                                  .map((io) => (
                                    <div
                                      key={io.id}
                                      className="flex items-center gap-2 p-2 bg-slate-900/50 rounded border border-slate-700 hover:border-emerald-600/50 transition-colors cursor-pointer"
                                    >
                                      {getIoTypeBadge(io.type)}
                                      <span className="text-sm text-slate-300 flex-1 truncate text-right">{io.name}</span>
                                      <code className="text-xs font-mono text-amber-400 w-16 text-right">{io.address}</code>
                                      <div className={cn(
                                        'w-2 h-2 rounded-full',
                                        io.type === 'DO' ? 'bg-emerald-500' : 'bg-red-500'
                                      )} />
                                    </div>
                                  ))
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {isEditing && editingIo && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>编辑IO点</CardTitle>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">IO名称</label>
                <input
                  type="text"
                  value={editingIo.name}
                  onChange={(e) => updateEditingIoField('name', e.target.value)}
                  className="w-full h-9 px-3 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">类型</label>
                  <select
                    value={editingIo.type}
                    onChange={(e) => updateEditingIoField('type', e.target.value as IoType)}
                    className="w-full h-9 px-3 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                  >
                    <option value="DI">DI - 数字输入</option>
                    <option value="DO">DO - 数字输出</option>
                    <option value="AI">AI - 模拟输入</option>
                    <option value="AO">AO - 模拟输出</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">地址</label>
                  <input
                    type="text"
                    value={editingIo.address}
                    onChange={(e) => updateEditingIoField('address', e.target.value)}
                    className="w-full h-9 px-3 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">绑定设备</label>
                <div className="h-9 px-3 bg-slate-800/50 border border-slate-700 rounded flex items-center">
                  <Badge variant="default" size="sm">{editingIo.deviceName}</Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">描述</label>
                <textarea
                  value={editingIo.description || ''}
                  onChange={(e) => updateEditingIoField('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                  取消
                </Button>
                <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                  <Save className="w-4 h-4" />
                  保存
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>新建IO点</CardTitle>
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
                <label className="block text-sm font-medium text-slate-300 mb-1.5">IO类型</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['DI', 'DO', 'AI', 'AO'] as IoType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewIoType(type)}
                      className={cn(
                        'flex flex-col items-center justify-center py-3 rounded-lg border transition-colors',
                        newIoType === type
                          ? type === 'DI'
                            ? 'bg-sky-600/20 border-sky-500 text-sky-200'
                            : type === 'DO'
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-200'
                            : type === 'AI'
                            ? 'bg-amber-600/20 border-amber-500 text-amber-200'
                            : 'bg-red-600/20 border-red-500 text-red-200'
                          : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'
                      )}
                    >
                      {getIoTypeIcon(type)}
                      <span className="text-xs mt-1 font-medium">{type}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">IO名称 *</label>
                <input
                  type="text"
                  value={newIoName}
                  onChange={(e) => setNewIoName(e.target.value)}
                  placeholder="输入IO点名称"
                  className="w-full h-9 px-3 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">地址 *</label>
                <input
                  type="text"
                  value={newIoAddress}
                  onChange={(e) => setNewIoAddress(e.target.value)}
                  placeholder="例如: I0.0, Q0.0, IW256"
                  className="w-full h-9 px-3 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">绑定设备 *</label>
                <select
                  value={newIoDeviceId}
                  onChange={(e) => setNewIoDeviceId(e.target.value)}
                  className="w-full h-9 px-3 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30"
                >
                  <option value="">选择设备</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">描述</label>
                <textarea
                  value={newIoDesc}
                  onChange={(e) => setNewIoDesc(e.target.value)}
                  placeholder="输入描述（可选）"
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" onClick={() => setShowNewModal(false)}>
                  取消
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNewIo}
                  disabled={!newIoName.trim() || !newIoAddress.trim() || !newIoDeviceId}
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

export default IOConfig;
