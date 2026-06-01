import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Cpu, Package, FileText, Code2, TrendingUp, Zap, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ProjectCard } from '@/components/ProjectCard';
import { Project } from '@/types';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { projects, addProject, setCurrentProject } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      const newProject: Project = {
        id: Date.now().toString(),
        name: newProjectName,
        status: 'in-progress',
        deviceInfo: null,
        selectedMaterials: [],
        drawings: [],
        programs: [],
        progress: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      addProject(newProject);
      setShowModal(false);
      setNewProjectName('');
      navigate('/device-info');
    }
  };

  const handleOpenProject = (project: Project) => {
    setCurrentProject(project);
    navigate('/device-info');
  };

  const stats = [
    { 
      label: '总项目数', 
      value: projects.length, 
      icon: Cpu, 
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50'
    },
    { 
      label: '进行中', 
      value: projects.filter(p => p.status === 'in-progress').length, 
      icon: Zap, 
      color: 'from-yellow-500 to-orange-500',
      bg: 'bg-yellow-50'
    },
    { 
      label: '已完成', 
      value: projects.filter(p => p.status === 'completed').length, 
      icon: CheckCircle2, 
      color: 'from-green-500 to-emerald-500',
      bg: 'bg-green-50'
    },
    { 
      label: '物料总数', 
      value: projects.reduce((sum, p) => sum + p.selectedMaterials.length, 0), 
      icon: Package, 
      color: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50'
    }
  ];

  const quickActions = [
    { 
      title: '设备信息', 
      description: '录入设备基本信息和参数', 
      icon: Cpu,
      path: '/device-info',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      title: '物料选型', 
      description: '智能推荐和选择物料', 
      icon: Package,
      path: '/material-selection',
      color: 'from-orange-500 to-pink-500'
    },
    { 
      title: '图纸输出', 
      description: '自动生成设备图纸', 
      icon: FileText,
      path: '/drawing-output',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      title: '程序编写', 
      description: '自动生成控制程序', 
      icon: Code2,
      path: '/program-generation',
      color: 'from-purple-500 to-indigo-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">欢迎使用设备设计流工具</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          新建项目
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">快速开始</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, idx) => (
            <button
              key={idx}
              onClick={() => projects.length > 0 && navigate(action.path)}
              disabled={projects.length === 0}
              className={`text-left p-6 rounded-2xl border-2 transition-all ${
                projects.length === 0 
                  ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                  : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-lg'
              }`}
            >
              <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{action.title}</h3>
              <p className="text-sm text-slate-500">{action.description}</p>
            </button>
          ))}
        </div>
        {projects.length === 0 && (
          <p className="text-center text-slate-400 mt-4">请先创建一个项目</p>
        )}
      </div>

      {projects.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4">我的项目</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onClick={() => handleOpenProject(project)}
              />
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">新建项目</h3>
            <p className="text-slate-500 mb-6">输入项目名称开始设计</p>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="例如：自动化装配线"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newProjectName.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
