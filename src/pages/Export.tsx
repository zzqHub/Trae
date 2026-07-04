import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useUIStore } from '@/lib/stores';
import { PageHeader } from '@/components/AppShell';
import {
  ChevronRight, ChevronDown, FileCode2, Download, RefreshCw,
  Cpu, Boxes, Workflow, Code2, ArrowRight, Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const VENDORS = [
  { id: 'CODESYS',  label: 'CODESYS',  sub: '汇川/倍福 软PLC',  color: 'cyan',   fmt: 'PLCopenXML + .st' },
  { id: 'SIEMENS',  label: '西门子',   sub: 'TIA Portal STL/LAD', color: 'amber',  fmt: '.stl' },
  { id: 'OMRON',    label: '欧姆龙',   sub: 'CX-Programmer',    color: 'violet', fmt: '.cxp' },
];

export default function Export() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const [ast, setAst] = useState<any | null>(null);
  const [vendor, setVendor] = useState<string>('CODESYS');
  const [files, setFiles] = useState<any[] | null>(null);
  const [activeFile, setActiveFile] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'ast' | 'export'>('ast');

  useEffect(() => {
    if (!id) return;
    api.buildAST(id).then(setAst).catch((e) => showToast('error', e.message));
  }, [id]);

  async function doExport(v: string) {
    if (!id) return;
    setVendor(v);
    setLoading(true);
    setFiles(null);
    try {
      const r = await api.exportCode(id, v);
      setFiles(r);
      setActiveFile(0);
      setTab('export');
      showToast('success', `${v} 导出完成: ${r.length} 个文件`);
    } catch (e: any) {
      showToast('error', e.message);
    } finally {
      setLoading(false);
    }
  }

  function download(file: any) {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = file.filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadAll() {
    if (!files) return;
    files.forEach((f, i) => setTimeout(() => download(f), i * 200));
  }

  return (
    <>
      <PageHeader
        title="跨平台导出"
        subtitle="统一 AST 中间层 → 厂商适配 → 多品牌工程包"
        actions={
          <>
            <button onClick={() => navigate(`/projects/${id}`)} className="btn-ghost text-xs">返回工作区</button>
            <button onClick={() => navigate(`/projects/${id}/validate`)} className="btn-ghost text-xs">冲突校验</button>
            <button onClick={() => navigate(`/projects/${id}/bom`)} className="btn-ghost text-xs">BOM/图纸</button>
          </>
        }
      />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 厂商适配 Tab */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {VENDORS.map((v) => (
              <button key={v.id}
                onClick={() => doExport(v.id)}
                className={cn(
                  "card p-4 text-left transition-all relative overflow-hidden",
                  vendor === v.id && files ? "border-cyan-brand shadow-glow" : "hover:border-ink-500"
                )}
              >
                {loading && vendor === v.id && (
                  <div className="absolute inset-0 scan-line pointer-events-none" />
                )}
                <div className="flex items-center justify-between mb-2">
                  <div className={cn("w-10 h-10 rounded grid place-items-center font-bold text-sm",
                    v.color === 'cyan' && "bg-cyan-deep/30 text-cyan-brand",
                    v.color === 'amber' && "bg-amber-deep/30 text-amber-signal",
                    v.color === 'violet' && "bg-violet-deep/30 text-violet-signal",
                  )}>{v.id[0]}</div>
                  {vendor === v.id && files && (
                    <span className="badge bg-green-deep/30 text-green-signal">{files.length} 文件</span>
                  )}
                </div>
                <div className="text-sm font-semibold text-ink-100">{v.label}</div>
                <div className="text-xs text-ink-400 mt-0.5">{v.sub}</div>
                <div className="text-[10px] text-ink-500 mt-2 font-mono">{v.fmt}</div>
              </button>
            ))}
          </div>

          {/* 切换 AST / 导出预览 */}
          <div className="flex gap-1 p-1 bg-ink-850 rounded-md border border-ink-700 w-fit">
            <button onClick={() => setTab('ast')}
              className={cn("px-3 py-1.5 text-xs rounded", tab === 'ast' ? "bg-cyan-brand text-ink-950" : "text-ink-300")}>
              AST 预览
            </button>
            <button onClick={() => setTab('export')}
              className={cn("px-3 py-1.5 text-xs rounded", tab === 'export' ? "bg-cyan-brand text-ink-950" : "text-ink-300")}>
              导出文件 {files ? `(${files.length})` : ''}
            </button>
          </div>

          {tab === 'ast' ? (
            <div className="card p-0 overflow-hidden">
              <div className="px-4 py-2 border-b border-ink-700 text-xs text-ink-300 font-medium flex items-center justify-between">
                <span className="flex items-center gap-2"><FileCode2 className="w-3.5 h-3.5" />统一抽象语法树 (AST)</span>
                <span className="text-[10px] text-ink-500">屏蔽厂商语法差异的中间层</span>
              </div>
              <div className="p-4 max-h-[600px] overflow-y-auto">
                {ast ? <ASTNodeView node={ast} depth={0} /> : <div className="text-ink-400 text-sm">加载中...</div>}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* 文件列表 */}
              <div className="card p-0 overflow-hidden">
                <div className="px-3 py-2 border-b border-ink-700 flex items-center justify-between">
                  <span className="text-xs text-ink-300 font-medium">文件</span>
                  {files && (
                    <button onClick={downloadAll} className="text-[10px] text-cyan-brand hover:text-cyan-brand/80 flex items-center gap-1">
                      <Download className="w-3 h-3" />全部下载
                    </button>
                  )}
                </div>
                <div className="divide-y divide-ink-800 max-h-[600px] overflow-y-auto">
                  {!files ? (
                    <div className="p-4 text-center text-ink-500 text-xs">选择厂商导出</div>
                  ) : files.map((f, i) => (
                    <div key={i} onClick={() => setActiveFile(i)}
                      className={cn("px-3 py-2 cursor-pointer hover:bg-ink-800 flex items-center gap-2",
                        i === activeFile && "bg-ink-800 text-cyan-brand")}>
                      <FileCode2 className="w-3.5 h-3.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-mono truncate">{f.filename}</div>
                        <div className="text-[10px] text-ink-500">{(f.size / 1024).toFixed(2)} KB · {f.language}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* 文件预览 */}
              <div className="card p-0 overflow-hidden lg:col-span-3">
                <div className="px-3 py-2 border-b border-ink-700 flex items-center justify-between">
                  <span className="text-xs font-mono text-cyan-brand">{files?.[activeFile]?.filename}</span>
                  {files && (
                    <button onClick={() => download(files[activeFile])}
                      className="text-[10px] text-cyan-brand hover:text-cyan-brand/80 flex items-center gap-1">
                      <Download className="w-3 h-3" />下载
                    </button>
                  )}
                </div>
                <pre className="p-4 text-[11px] font-mono text-ink-200 bg-ink-950 max-h-[600px] overflow-auto leading-relaxed">
                  {files?.[activeFile]?.content || '// 选择文件查看内容'}
                </pre>
              </div>
            </div>
          )}

          {/* 流程说明 */}
          <div className="card p-4">
            <div className="text-xs text-ink-300 font-medium mb-3">导出流程</div>
            <div className="flex items-center gap-2 text-xs flex-wrap">
              <span className="badge bg-ink-700 text-ink-200 flex items-center gap-1"><Cpu className="w-3 h-3" />配置树</span>
              <ArrowRight className="w-3 h-3 text-ink-500" />
              <span className="badge bg-cyan-deep/30 text-cyan-brand flex items-center gap-1"><Workflow className="w-3 h-3" />AST 中间层</span>
              <ArrowRight className="w-3 h-3 text-ink-500" />
              <span className="badge bg-amber-deep/30 text-amber-signal flex items-center gap-1"><Code2 className="w-3 h-3" />厂商适配器</span>
              <ArrowRight className="w-3 h-3 text-ink-500" />
              <span className="badge bg-green-deep/30 text-green-signal flex items-center gap-1"><Boxes className="w-3 h-3" />PLCopenXML / STL / LAD</span>
              <ArrowRight className="w-3 h-3 text-ink-500" />
              <span className="badge bg-violet-deep/30 text-violet-signal">工程包下载</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function ASTNodeView({ node, depth }: { node: any; depth: number }) {
  const [open, setOpen] = useState(depth < 2);
  const children = node.children || [];
  const colorMap: Record<string, string> = {
    Program: 'text-cyan-brand',
    VariableList: 'text-violet-signal',
    StructDecl: 'text-ink-200',
    FunctionBlock: 'text-amber-signal',
    Function: 'text-green-signal',
    MainBody: 'text-cyan-brand',
    Variable: 'text-ink-300',
    Field: 'text-ink-300',
    Pin: 'text-ink-300',
    Call: 'text-cyan-brand',
  };
  return (
    <div className="text-xs font-mono">
      <div className="flex items-center gap-2 py-0.5 hover:bg-ink-800 rounded px-1"
        style={{ paddingLeft: depth * 12 }}>
        {children.length > 0 ? (
          <button onClick={() => setOpen(!open)} className="text-ink-400 hover:text-ink-100">
            {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : <span className="w-3" />}
        <span className={cn("text-[10px] px-1.5 py-0 rounded bg-ink-700", colorMap[node.type] || 'text-ink-300')}>{node.type}</span>
        <span className="text-ink-100">{node.name}</span>
        {node.dataType && <span className="text-ink-400">: {node.dataType}</span>}
        {node.meta?.comment && <span className="text-ink-500 text-[10px]">// {node.meta.comment}</span>}
        {node.meta?.direction && <span className="text-[10px] text-cyan-brand">[{node.meta.direction}]</span>}
      </div>
      {open && children.map((c: any, i: number) => (
        <ASTNodeView key={i} node={c} depth={depth + 1} />
      ))}
    </div>
  );
}
