import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuthStore, useUIStore } from '@/lib/stores';
import { PageHeader } from '@/components/AppShell';
import {
  Battery, Sun, Square, ChevronRight, ChevronDown, Lock,
  Boxes, FileCode2, Workflow, AlertCircle, Check, ArrowRight, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const INDUSTRIES = [
  { id: 'lithium', label: '锂电产线', desc: '电池组装/化成/分容', icon: Battery, color: 'cyan' },
  { id: 'pv',      label: '光伏组件', desc: '组件层压/测试/包装',  icon: Sun,    color: 'amber' },
  { id: 'glass',   label: '玻璃检测', desc: '光学检测/分选/打包',  icon: Square, color: 'violet' },
];

export default function NewProject() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { showToast } = useUIStore();
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTpl, setSelectedTpl] = useState<any | null>(null);
  const [skeleton, setSkeleton] = useState<any | null>(null);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.listTemplates().then(setTemplates).catch(() => showToast('error', '加载模板失败'));
  }, []);

  function selectTemplate(t: any) {
    setSelectedTpl(t);
    api.getTemplateVersion(t.id, t.currentVersionId).then((v) => {
      try { setSkeleton(JSON.parse(v.content)); } catch { setSkeleton(null); }
    });
  }

  async function create() {
    if (!selectedTpl) { showToast('warning', '请先选择模板'); return; }
    if (!name.trim()) { showToast('warning', '请输入项目名称'); return; }
    setCreating(true);
    try {
      const p = await api.createProject(name.trim(), selectedTpl.industry, selectedTpl.id);
      showToast('success', '项目创建成功');
      navigate(`/projects/${p.id}`);
    } catch (e: any) {
      showToast('error', e.message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <>
      <PageHeader title="新建项目" subtitle="选择行业业务模板 → 自动加载骨架 → 开始配置" />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Step 1: 选行业模板 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-cyan-brand text-ink-950 grid place-items-center text-xs font-bold">1</span>
              <h2 className="text-sm font-semibold text-ink-100">选择业务模板</h2>
              <span className="text-xs text-ink-500">外部独立模板文件，新增行业仅需新增模板</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INDUSTRIES.map((ind) => {
                const tpls = templates.filter((t) => t.industry === ind.id);
                return (
                  <div key={ind.id}
                    className={cn(
                      "card p-5 cursor-pointer transition-all",
                      selectedTpl?.industry === ind.id ? "border-cyan-brand shadow-glow" : "hover:border-ink-500"
                    )}
                    onClick={() => tpls[0] && selectTemplate(tpls[0])}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn("w-10 h-10 rounded grid place-items-center",
                        ind.color === 'cyan' && "bg-cyan-deep/30 text-cyan-brand",
                        ind.color === 'amber' && "bg-amber-deep/30 text-amber-signal",
                        ind.color === 'violet' && "bg-violet-deep/30 text-violet-signal",
                      )}>
                        <ind.icon className="w-5 h-5" />
                      </div>
                      {tpls.length > 0 && (
                        <span className="badge bg-ink-700 text-ink-300">v{tpls[0].currentVersionNo}</span>
                      )}
                    </div>
                    <div className="text-sm font-semibold text-ink-100">{ind.label}</div>
                    <div className="text-xs text-ink-400 mt-1">{ind.desc}</div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-ink-500">{tpls.length} 个模板可用</span>
                      {selectedTpl?.industry === ind.id && (
                        <Check className="w-4 h-4 text-cyan-brand" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Step 2: 骨架预览 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className={cn("w-6 h-6 rounded-full grid place-items-center text-xs font-bold",
                selectedTpl ? "bg-cyan-brand text-ink-950" : "bg-ink-700 text-ink-400")}>2</span>
              <h2 className="text-sm font-semibold text-ink-100">解析树形骨架</h2>
              <span className="text-xs text-ink-500">根节点强制保留，下级支持增删改查</span>
            </div>
            <div className="card p-0 overflow-hidden min-h-[300px]">
              {!skeleton ? (
                <div className="p-12 text-center text-ink-400 text-sm flex flex-col items-center gap-3">
                  <Workflow className="w-10 h-10 text-ink-600" />
                  请先选择行业模板查看骨架结构
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="p-4 border-r border-ink-700">
                    <div className="text-xs text-ink-400 mb-3 flex items-center gap-2">
                      <Boxes className="w-4 h-4" /> 节点树
                    </div>
                    <SkeletonNode node={skeleton.root} depth={0} />
                  </div>
                  <div className="p-4 bg-ink-900/40">
                    <div className="text-xs text-ink-400 mb-3 flex items-center gap-2">
                      <FileCode2 className="w-4 h-4" /> 节点类型说明
                    </div>
                    <div className="space-y-2 text-xs">
                      <NodeTypeRow type="PRG"    desc="主程序入口，根节点强制保留" perm="内部可改 / 节点不可删" />
                      <NodeTypeRow type="GVL"    desc="全局变量区，所有工位共用" perm="基础字段固定，可扩展" />
                      <NodeTypeRow type="STRUCT" desc="自定义数据结构体" perm="用户可新增/修改" />
                      <NodeTypeRow type="FB"     desc="功能块 (气缸/光栅/三色灯)" perm="支持新增自定义 FB" />
                      <NodeTypeRow type="FC"     desc="功能函数 (手动/报警/换算)" perm="支持增删改查" />
                      <NodeTypeRow type="VAR"    desc="局部变量" perm="随实例自动生成" />
                    </div>
                    {skeleton.root.methods && (
                      <div className="mt-4 p-3 rounded bg-ink-950 border border-ink-700">
                        <div className="text-[10px] text-ink-500 mb-1">主程序 Method 调用顺序 (可重排)</div>
                        <div className="flex flex-wrap gap-1">
                          {skeleton.root.methods.map((m: string, i: number) => (
                            <span key={m} className="badge bg-cyan-deep/30 text-cyan-brand font-mono">
                              {i + 1}.{m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Step 3: 项目名称 + 创建 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className={cn("w-6 h-6 rounded-full grid place-items-center text-xs font-bold",
                selectedTpl ? "bg-cyan-brand text-ink-950" : "bg-ink-700 text-ink-400")}>3</span>
              <h2 className="text-sm font-semibold text-ink-100">命名并创建</h2>
            </div>
            <div className="card p-5">
              <label className="text-xs text-ink-400 block mb-1">项目名称</label>
              <div className="flex gap-2">
                <input className="input" placeholder="例如: 锂电A线组装项目"
                  value={name} onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && create()} />
                <button onClick={create} disabled={!selectedTpl || creating || !name.trim()}
                  className="btn-primary whitespace-nowrap">
                  {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  创建并进入
                </button>
              </div>
              {selectedTpl && (
                <div className="mt-3 text-xs text-ink-400 flex items-center gap-3">
                  <span>行业: <span className="text-ink-200">{selectedTpl.industry}</span></span>
                  <span>·</span>
                  <span>模板: <span className="text-ink-200">{selectedTpl.name}</span></span>
                  <span>·</span>
                  <span>所有者: <span className="text-ink-200">{user?.username}</span></span>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}

function SkeletonNode({ node, depth }: { node: any; depth: number }) {
  const [open, setOpen] = useState(depth < 2);
  const children = node.children || [];
  const type = node.type || 'VAR';
  return (
    <div className="text-xs">
      <div className="flex items-center gap-1.5 py-1 hover:bg-ink-800 rounded px-1 cursor-pointer"
        onClick={() => setOpen(!open)}
        style={{ paddingLeft: depth * 12 }}>
        {children.length > 0 ? (
          open ? <ChevronDown className="w-3 h-3 text-ink-400" /> : <ChevronRight className="w-3 h-3 text-ink-400" />
        ) : <span className="w-3" />}
        <span className={`badge node-${type.toLowerCase()} font-mono`}>{type}</span>
        <span className="text-ink-100 font-mono">{node.name}</span>
        {node.locked && <Lock className="w-3 h-3 text-amber-signal" />}
        {node.comment && <span className="text-ink-500 text-[10px]">— {node.comment}</span>}
      </div>
      {open && children.map((c: any, i: number) => (
        <SkeletonNode key={i} node={c} depth={depth + 1} />
      ))}
    </div>
  );
}

function NodeTypeRow({ type, desc, perm }: { type: string; desc: string; perm: string }) {
  return (
    <div className="flex items-center gap-3 p-2 rounded hover:bg-ink-800">
      <span className={`badge node-${type.toLowerCase()} font-mono w-16 justify-center`}>{type}</span>
      <div className="flex-1">
        <div className="text-ink-200">{desc}</div>
        <div className="text-[10px] text-ink-500">{perm}</div>
      </div>
    </div>
  );
}

export { AlertCircle };
