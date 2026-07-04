import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useUIStore } from '@/lib/stores';
import { PageHeader } from '@/components/AppShell';
import {
  CheckCircle2, AlertCircle, AlertTriangle, Info, RefreshCw,
  ArrowRight, ShieldAlert, Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const CATEGORY_LABEL: Record<string, string> = {
  IO_ADDRESS: 'IO 地址',
  STRUCT_NAME: '结构体重名',
  FB_INSTANCE: 'FB 实例命名',
  SAFETY_SIGNAL: '安全信号缺失',
  OTHER: '其他',
};

export default function Validate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const [result, setResult] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!id) return;
    setLoading(true);
    try {
      const r = await api.validate(id);
      setResult(r);
      showToast(r.ok ? 'success' : 'warning', r.ok ? '校验通过' : `发现 ${r.issues.length} 个问题`);
    } catch (e: any) {
      showToast('error', e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { run(); }, [id]);

  const issues = result?.issues || [];
  const byLevel = {
    error: issues.filter((i: any) => i.level === 'error'),
    warning: issues.filter((i: any) => i.level === 'warning'),
    info: issues.filter((i: any) => i.level === 'info'),
  };

  return (
    <>
      <PageHeader
        title="冲突校验"
        subtitle="生成代码前自动校验：IO 地址 / 结构体重名 / FB 实例 / 安全信号"
        actions={
          <>
            <button onClick={() => navigate(`/projects/${id}`)} className="btn-ghost text-xs">返回工作区</button>
            <button onClick={() => navigate(`/projects/${id}/export`)} className="btn-ghost text-xs">去导出</button>
            <button onClick={run} disabled={loading} className="btn-primary text-xs">
              <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />重新校验
            </button>
          </>
        }
      />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* 通过率 */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-ink-400">校验结果</div>
                <div className={cn("text-3xl font-bold mt-1",
                  result?.ok ? "text-green-signal" : "text-red-signal")}>
                  {result?.ok ? '通过' : '未通过'}
                </div>
              </div>
              <div className={cn("w-16 h-16 rounded-full grid place-items-center",
                result?.ok ? "bg-green-deep/30 text-green-signal" : "bg-red-deep/30 text-red-signal")}>
                {result?.ok ? <CheckCircle2 className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-400">通过率</span>
                <span className="text-ink-100 font-mono">{result?.passRate ?? 0}%</span>
              </div>
              <div className="h-2 bg-ink-950 rounded-full overflow-hidden">
                <div className={cn("h-full transition-all duration-500",
                  (result?.passRate ?? 0) >= 80 ? "bg-green-signal" : (result?.passRate ?? 0) >= 50 ? "bg-amber-signal" : "bg-red-signal")}
                  style={{ width: `${result?.passRate ?? 0}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <StatBox label="错误" value={byLevel.error.length} color="red" />
                <StatBox label="警告" value={byLevel.warning.length} color="amber" />
                <StatBox label="信息" value={byLevel.info.length} color="cyan" />
              </div>
            </div>
          </div>

          {/* 问题列表 */}
          <div className="space-y-3">
            {issues.length === 0 ? (
              <div className="card p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-signal mx-auto mb-3" />
                <div className="text-ink-100 font-medium">所有校验项通过</div>
                <div className="text-xs text-ink-400 mt-1">可以安全导出代码</div>
                <button onClick={() => navigate(`/projects/${id}/export`)} className="btn-primary mt-4">
                  去导出 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              issues.map((issue: any, i: number) => (
                <IssueRow key={i} issue={issue} />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: any = {
    red: 'text-red-signal bg-red-deep/20',
    amber: 'text-amber-signal bg-amber-deep/20',
    cyan: 'text-cyan-brand bg-cyan-deep/20',
  };
  return (
    <div className={cn("rounded p-3 text-center", colorMap[color])}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-[10px] mt-0.5">{label}</div>
    </div>
  );
}

function IssueRow({ issue }: { issue: any }) {
  const colorMap: any = {
    error:   { icon: AlertCircle,    color: 'red',   cls: 'border-red-signal/40 bg-red-deep/10 text-red-signal' },
    warning: { icon: AlertTriangle,  color: 'amber', cls: 'border-amber-signal/40 bg-amber-deep/10 text-amber-signal' },
    info:    { icon: Info,           color: 'cyan',  cls: 'border-cyan-brand/40 bg-cyan-deep/10 text-cyan-brand' },
  };
  const cfg = colorMap[issue.level];
  const Icon = cfg.icon;
  return (
    <div className={cn("card border p-4 flex items-start gap-3", cfg.cls)}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-ink-100">{CATEGORY_LABEL[issue.category] || issue.category}</span>
          <span className="badge bg-ink-700 text-ink-300 text-[10px]">{issue.level}</span>
          {issue.nodeId && <span className="text-[10px] text-ink-500 font-mono">[{issue.nodeId}]</span>}
        </div>
        <div className="text-sm text-ink-200">{issue.message}</div>
        {issue.suggestion && (
          <div className="mt-2 flex items-center gap-2 text-xs">
            <Wrench className="w-3 h-3 text-cyan-brand" />
            <span className="text-ink-400">建议: </span>
            <span className="text-cyan-brand">{issue.suggestion}</span>
            <button className="ml-auto btn-ghost text-[10px] py-0.5 px-2">一键修复</button>
          </div>
        )}
      </div>
    </div>
  );
}
