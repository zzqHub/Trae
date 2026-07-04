import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FolderPlus,
  Import,
  LayoutTemplate,
  BookOpen,
  FolderOpen,
  TrendingUp,
  Cpu,
  Layers,
  Boxes,
  Clock,
  ChevronRight,
  Sparkles,
  Gauge,
  Zap,
  Activity,
} from 'lucide-react';
import { useProjectStore } from '@/store/projectStore';
import { useTemplateStore } from '@/store/templateStore';
import { cn } from '@/lib/utils';
import ProjectCard from './ProjectCard';
import TemplateCard from './TemplateCard';
import CreateProjectModal from './CreateProjectModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [favoriteTemplates, setFavoriteTemplates] = useState<Set<string>>(new Set());

  const projects = useProjectStore((s) => s.projects);
  const deleteProject = useProjectStore((s) => s.deleteProject);
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject);

  const templates = useTemplateStore((s) => s.templates);
  const getPopularTemplates = useTemplateStore((s) => s.getPopularTemplates);

  const recentProjects = [...projects].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  ).slice(0, 6);

  const popularTemplates = getPopularTemplates(8);

  const totalStations = projects.reduce((sum, p) => sum + p.stations.length, 0);
  const totalDevices = projects.reduce(
    (sum, p) => sum + p.stations.reduce((s, st) => s + st.devices.length, 0),
    0
  );
  const totalModules = projects.reduce(
    (sum, p) => sum + p.stations.reduce((s, st) => s + st.modules.length, 0),
    0
  );

  const handleOpenProject = (projectId: string) => {
    setCurrentProject(projectId);
    navigate(`/project/${projectId}/device`);
  };

  const handleDeleteProject = (projectId: string) => {
    if (confirm('确定要删除这个项目吗？此操作不可撤销。')) {
      deleteProject(projectId);
    }
  };

  const handleToggleFavorite = (templateId: string) => {
    setFavoriteTemplates((prev) => {
      const next = new Set(prev);
      if (next.has(templateId)) {
        next.delete(templateId);
      } else {
        next.add(templateId);
      }
      return next;
    });
  };

  const quickActions = [
    {
      icon: Plus,
      label: '新建项目',
      description: '从头创建新项目',
      color: 'from-industrial-500 to-industrial-600',
      hoverColor: 'hover:from-industrial-400 hover:to-industrial-500',
      onClick: () => setShowCreateModal(true),
    },
    {
      icon: Import,
      label: '导入项目',
      description: '从JSON文件导入',
      color: 'from-emerald-500 to-emerald-600',
      hoverColor: 'hover:from-emerald-400 hover:to-emerald-500',
      onClick: () => {},
    },
    {
      icon: LayoutTemplate,
      label: '模板库',
      description: '浏览模板资源',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-400 hover:to-purple-500',
      onClick: () => {},
    },
    {
      icon: BookOpen,
      label: '文档中心',
      description: '查看使用文档',
      color: 'from-warning-500 to-warning-600',
      hoverColor: 'hover:from-warning-400 hover:to-warning-500',
      onClick: () => {},
    },
  ];

  const stats = [
    {
      icon: FolderOpen,
      label: '项目总数',
      value: projects.length,
      color: 'text-industrial-400',
      bgColor: 'bg-industrial-500/10',
      trend: '+2 本月',
      trendUp: true,
    },
    {
      icon: Layers,
      label: '工位总数',
      value: totalStations,
      color: 'text-success-500',
      bgColor: 'bg-success-500/10',
      trend: '+5 本月',
      trendUp: true,
    },
    {
      icon: Cpu,
      label: '设备总数',
      value: totalDevices,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      trend: '+12 本月',
      trendUp: true,
    },
    {
      icon: Boxes,
      label: '模块总数',
      value: totalModules,
      color: 'text-warning-500',
      bgColor: 'bg-warning-500/10',
      trend: '+8 本月',
      trendUp: true,
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '凌晨好';
    if (hour < 12) return '早上好';
    if (hour < 14) return '中午好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-industrial-900/60 via-dark-900 to-dark-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-industrial-500/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-0 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl -translate-y-1/2" />

        <div className="relative px-6 lg:px-8 pt-8 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-industrial-400 animate-pulse-slow" />
                  <span className="text-industrial-400 text-sm font-medium">PLC 编程工作台</span>
                </div>
                <h1 className="text-3xl font-bold text-dark-50 mb-2">
                  {getGreeting()}，工程师 👋
                </h1>
                <p className="text-dark-400">
                  欢迎回到工作台，今天是 {new Date().toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })}
                </p>
              </div>

              <button
                className="btn-primary h-11 px-6 self-start md:self-auto shadow-industrial"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="w-5 h-5" />
                新建项目
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    className={cn(
                      'group relative overflow-hidden rounded-xl p-5 text-left transition-all duration-300',
                      'bg-dark-900/60 backdrop-blur border border-dark-700/50',
                      'hover:border-dark-600 hover:shadow-dark-lg hover:-translate-y-0.5'
                    )}
                    onClick={action.onClick}
                  >
                    <div
                      className={cn(
                        'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4',
                        'transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg',
                        action.color,
                        action.hoverColor
                      )}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-dark-100 mb-1 group-hover:text-industrial-300 transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-xs text-dark-500">{action.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className={cn(
                    'relative overflow-hidden rounded-xl p-5',
                    'bg-dark-900 border border-dark-700',
                    'transition-all duration-300 hover:border-dark-600 hover:shadow-dark-lg'
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={cn(
                        'w-11 h-11 rounded-xl flex items-center justify-center',
                        stat.bgColor
                      )}
                    >
                      <Icon className={cn('w-5 h-5', stat.color)} />
                    </div>
                    <div
                      className={cn(
                        'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
                        stat.trendUp
                          ? 'bg-success-500/10 text-success-500'
                          : 'bg-danger-500/10 text-danger-500'
                      )}
                    >
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-dark-50 mb-1">{stat.value}</div>
                  <div className="text-sm text-dark-400">{stat.label}</div>
                </div>
              );
            })}
          </div>

          <div className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-industrial-500/20 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-industrial-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-dark-100">最近项目</h2>
                  <p className="text-sm text-dark-500">继续您的工作</p>
                </div>
              </div>
              <button className="flex items-center gap-1 text-sm text-industrial-400 hover:text-industrial-300 transition-colors">
                查看全部
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {recentProjects.length === 0 ? (
              <div className="bg-dark-900 border border-dark-700 rounded-xl p-12 text-center">
                <FolderPlus className="w-14 h-14 mx-auto mb-4 text-dark-600" />
                <h3 className="text-lg font-medium text-dark-300 mb-2">暂无项目</h3>
                <p className="text-dark-500 mb-5">创建您的第一个PLC项目开始编程</p>
                <button
                  className="btn-primary mx-auto"
                  onClick={() => setShowCreateModal(true)}
                >
                  <Plus className="w-4 h-4" />
                  新建项目
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ProjectCard
                      project={project}
                      onOpen={handleOpenProject}
                      onDelete={handleDeleteProject}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-dark-100">热门模板推荐</h2>
                  <p className="text-sm text-dark-500">快速复用成熟的逻辑模块</p>
                </div>
              </div>
              <button className="flex items-center gap-1 text-sm text-industrial-400 hover:text-industrial-300 transition-colors">
                更多模板
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularTemplates.slice(0, 4).map((template, index) => (
                <div
                  key={template.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <TemplateCard
                    template={template}
                    onFavorite={handleToggleFavorite}
                    isFavorite={favoriteTemplates.has(template.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
}
