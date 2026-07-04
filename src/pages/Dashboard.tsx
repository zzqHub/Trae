import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore, useUIStore } from '@/lib/stores';
import { PageHeader } from '@/components/AppShell';
import {
  Plus, FolderPlus, Activity, Users, Boxes, CheckCircle2,
  AlertTriangle, Clock, FileCode2, ChevronRight,
} from 'lucide-react';

const INDUSTRY_LABEL: Record<string, string> = {
  lithium: '锂电产线', pv: '光伏组件', glass: '玻璃检测',
};

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  DRAFT:       { text: '草稿',    cls: 'bg-ink-700 text-ink-300' },
  CONFIGURING: { text: '配置中',  cls: 'bg-amber-deep/40 text-amber-signal' },
  VALIDATED:   { text: '已校验',  cls: 'bg-cyan-deep/40 text-cyan-brand' },
  EXPORTED:    { text: '已导出',  cls: 'bg-green-deep/40 text-green-signal' },
  ARCHIVED:    { text: '已归档',  cls: 'bg-ink-700 text-ink-400' },
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const { showToast } = useUIStore();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, configs: 0, validated: 0, exported: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listProjects().then((list) => {
      setProjects(list);
      setStats({
        total: list.length,
        configs: list.filter((p) => p.status === 'CONFIGURING' || p.status === 'DRAFT').length,
        validated: list.filter((p) => p.status === 'VALIDATED').length,
        exported: list.filter((p) => p.status === 'EXPORTED').length,
      });
    }).catch(() => showToast('error', '加载项目失败'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader
        title={`欢迎, ${user?.username}`}
        subtitle={`${user?.role} · ${new Date().toLocaleString('zh-CN')}`}
        actions={
          <button onClick={() => navigate('/projects/new')} className="btn-primary">
            <Plus className="w-4 h-4" />新建项目
          </button>
        }
      />

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label="项目总数" value={stats.total} icon={FolderPlus} color="cyan" />
          <StatCard label="配置中" value={stats.configs} icon={Activity} color="amber" />
          <StatCard label="已校验" value={stats.validated} icon={CheckCircle2} color="cyan" />
          <StatCard label="已导出" value={stats.exported} icon={FileCode2} color="green" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 项目列表 */}
          <div className="lg:col-span-2 card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-ink-700 flex items-center justify-between">
              <h3 className="text-sm font-medium text-ink-100">最近项目</h3>
              <span className="text-xs text-ink-400">{projects.length} 个</span>
            </div>
            {loading ? (
              <div className="p-8 text-center text-ink-400 text-sm">加载中...</div>
            ) : projects.length === 0 ? (
              <div className="p-8 text-center">
                <FolderPlus className="w-10 h-10 text-ink-600 mx-auto mb-3" />
                <div className="text-ink-300 text-sm">还没有项目</div>
                <button onClick={() => navigate('/projects/new')} className="btn-primary mt-4">
                  <Plus className="w-4 h-4" />创建第一个项目
                </button>
              </div>
            ) : (
              <div className="divide-y divide-ink-800">
                {projects.map((p) => {
                  const status = STATUS_LABEL[p.status] || STATUS_LABEL.DRAFT;
                  return (
                    <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
                      className="px-4 py-3 flex items-center gap-4 hover:bg-ink-800 cursor-pointer transition-colors">
                      <div className="w-10 h-10 rounded bg-ink-700 grid place-items-center shrink-0">
                        <Boxes className="w-5 h-5 text-cyan-brand" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ink-100 truncate">{p.name}</span>
                          <span className={`badge ${status.cls}`}>{status.text}</span>
                        </div>
                        <div className="text-xs text-ink-400 mt-0.5 flex items-center gap-3">
                          <span>{INDUSTRY_LABEL[p.industry] || p.industry}</span>
                          <span>v{p.currentVersion}</span>
                          <span>所有者: {p.ownerName}</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(p.updatedAt).toLocaleDateString('zh-CN')}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-ink-500" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 活动流 */}
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-3 border-b border-ink-700">
              <h3 className="text-sm font-medium text-ink-100">系统活动</h3>
            </div>
            <div className="p-4 space-y-3 text-xs">
              <ActivityItem color="cyan" text="admin 登录系统" time="刚刚" />
              <ActivityItem color="green" text="项目 [测试项目1] 创建成功" time="2 分钟前" />
              <ActivityItem color="amber" text="模板 [锂电产线] 发布新版本 v2" time="10 分钟前" />
              <ActivityItem color="cyan" text="engineer 进入项目协作" time="30 分钟前" />
              <ActivityItem color="violet" text="项目 [光伏A线] 导出 CODESYS 工程" time="1 小时前" />
              <ActivityItem color="red" text="节点 [EM02.IO] 冲突被工程师合并" time="2 小时前" />
              <ActivityItem color="cyan" text="权限矩阵更新" time="1 天前" />
            </div>
          </div>
        </div>

        {/* 三色灯状态栏 */}
        <div className="card p-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="traffic-light on-green"><span></span><span></span><span></span></div>
              <div>
                <div className="text-xs font-medium text-ink-100">系统正常</div>
                <div className="text-[10px] text-ink-500">所有服务在线</div>
              </div>
            </div>
            <div className="h-8 w-px bg-ink-700" />
            <div className="text-xs">
              <div className="text-ink-400">协作引擎</div>
              <div className="font-mono text-green-signal">WS.CONNECTED</div>
            </div>
            <div className="h-8 w-px bg-ink-700" />
            <div className="text-xs">
              <div className="text-ink-400">代码生成</div>
              <div className="font-mono text-cyan-brand">AST.READY</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-ink-400">
            <Users className="w-4 h-4" />
            <span>4 名用户在线</span>
          </div>
        </div>
      </div>
    </>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  const colorMap: any = {
    cyan: 'text-cyan-brand bg-cyan-deep/20',
    amber: 'text-amber-signal bg-amber-deep/20',
    green: 'text-green-signal bg-green-deep/20',
    violet: 'text-violet-signal bg-violet-deep/20',
  };
  return (
    <div className="card p-4 flex items-center gap-4">
      <div className={`w-12 h-12 rounded grid place-items-center ${colorMap[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className="text-2xl font-bold text-ink-100">{value}</div>
        <div className="text-xs text-ink-400">{label}</div>
      </div>
    </div>
  );
}

function ActivityItem({ color, text, time }: { color: string; text: string; time: string }) {
  const colorMap: any = {
    cyan: 'bg-cyan-brand', amber: 'bg-amber-signal', green: 'bg-green-signal',
    violet: 'bg-violet-signal', red: 'bg-red-signal',
  };
  return (
    <div className="flex items-start gap-2">
      <div className={`w-1.5 h-1.5 rounded-full ${colorMap[color]} mt-1.5 shrink-0`} />
      <div className="flex-1">
        <div className="text-ink-200">{text}</div>
        <div className="text-[10px] text-ink-500 mt-0.5">{time}</div>
      </div>
    </div>
  );
}

// 兼容 AlertTriangle 引用
export { AlertTriangle };
