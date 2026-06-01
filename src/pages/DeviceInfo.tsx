import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Save, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { DeviceInfo as DeviceInfoType } from '@/types';

export const DeviceInfo = () => {
  const navigate = useNavigate();
  const { currentProject, setDeviceInfo } = useStore();
  
  const [formData, setFormData] = useState({
    name: currentProject?.deviceInfo?.name || '',
    type: currentProject?.deviceInfo?.type || '',
    description: '',
    parameters: {
      power: currentProject?.deviceInfo?.parameters?.power || '',
      voltage: currentProject?.deviceInfo?.parameters?.voltage || '',
      speed: currentProject?.deviceInfo?.parameters?.speed || '',
      weight: currentProject?.deviceInfo?.parameters?.weight || ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const deviceInfo: DeviceInfoType = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      parameters: formData.parameters,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setDeviceInfo(deviceInfo);
    navigate('/material-selection');
  };

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
        <Cpu className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500">请先创建或选择一个项目</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          返回首页
        </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">设备信息</h1>
        <p className="text-slate-500">录入设备基本信息和参数</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl p-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-blue-500" />
            基本信息
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">设备名称</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：自动化装配设备"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">设备类型</label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">请选择类型</option>
                <option value="装配设备">装配设备</option>
                <option value="检测设备">检测设备</option>
                <option value="搬运设备">搬运设备</option>
                <option value="包装设备">包装设备</option>
                <option value="焊接设备">焊接设备</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">设备描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="描述设备的功能和用途..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 mb-6">技术参数</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">额定功率 (kW)</label>
              <input
                type="text"
                value={formData.parameters.power}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: {...formData.parameters, power: e.target.value}
                })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：5.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">工作电压 (V)</label>
              <input
                type="text"
                value={formData.parameters.voltage}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: {...formData.parameters, voltage: e.target.value}
                })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：380"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">工作速度 (m/min)</label>
              <input
                type="text"
                value={formData.parameters.speed}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: {...formData.parameters, speed: e.target.value}
                })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">设备重量 (kg)</label>
              <input
                type="text"
                value={formData.parameters.weight}
                onChange={(e) => setFormData({
                  ...formData,
                  parameters: {...formData.parameters, weight: e.target.value}
                })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：1500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            <Save className="w-5 h-5" />
            保存并继续
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};
