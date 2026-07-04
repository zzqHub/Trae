import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, collab } from '@/lib/api';
import { useUIStore, useCollabStore, useAuthStore } from '@/lib/stores';
import {
  ChevronRight, ChevronDown, Lock, Plus, Trash2, Edit3, Save, X,
  Boxes, FileCode2, Shield, Workflow, Variable, Grid3x3, Bell,
  AlertTriangle, Users, GitBranch, Eye, EyeOff, Download, RefreshCw,
  Cpu, ListTree, Code2, CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ConfigModulePanel from '@/components/ConfigModulePanel';

const CONFIG_MODULES = [
  { id: 'structure',   label: '结构配置', icon: ListTree,   desc: '设备结构树 (应用-MAIN-EM)' },
  { id: 'safety',       label: '安全配置', icon: Shield,    desc: '急停/安全光栅/停机警告' },
  { id: 'workstation',  label: '工位配置', icon: Grid3x3,   desc: 'EM01/EM02 工位 + 设备清单' },
  { id: 'variable',     label: '变量生成', icon: Variable,  desc: '工位号+配置名 → 变量名' },
  { id: 'mainProgram',  label: '主程序',   icon: Code2,     desc: 'Method 调用顺序编排' },
  { id: 'module',       label: '模块生成', icon: Boxes,     desc: 'FB/FC 批量实例化' },
  { id: 'io',           label: 'IO 生成',  icon: Workflow,  desc: 'FB 实例 → 引脚 → 物理地址' },
  { id: 'alarm',        label: '报警生成', icon: Bell,      desc: '报警结构体 + 处理 FC' },
];

export default function ProjectWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const { user } = useAuthStore();
  const { presence, lockedNodes, setPresence, setLocked, setUnlocked, reset } = useCollabStore();

  const [project, setProject] = useState<any | null>(null);
  const [tree, setTree] = useState<any[] | null>(null);
  const [version, setVersion] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<string>('structure');
  const [dirty, setDirty] = useState(false);
  const [editing, setEditing] = useState(false);

  // 加载项目
  const loadProject = useCallback(async () => {
    if (!id) return;
    try {
      const [p, t] = await Promise.all([api.getProject(id), api.getProjectTree(id)]);
      setProject(p);
      setTree(t);
      setVersion(p.currentVersion);
    } catch (e: any) {
      showToast('error', '加载项目失败: ' + e.message);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
    if (!id) return;
    // 连接 WebSocket 协作
    collab.connect(id);
    const off = collab.on((msg) => {
      switch (msg.type) {
        case 'presence': setPresence(msg.users); break;
        case 'locked':   setLocked(msg.nodeId, msg.by); break;
        case 'unlocked': setUnlocked(msg.nodeId); break;
        case 'updated':  loadProject(); break;
        case 'conflict': showToast('warning', `节点冲突: ${msg.reason}`); break;
      }
    });
    return () => { off(); collab.disconnect(); reset(); };
  }, [id]);

  // 保存树
  async function saveTree(changeNote?: string) {
    if (!id || !tree) return;
    try {
      const r = await api.updateProjectTree(id, tree, version, changeNote || '更新节点');
      setVersion(r.version);
      setDirty(false);
      showToast('success', '保存成功');
    } catch (e: any) {
      if (e.status === 409) {
        showToast('warning', '版本冲突，已加载最新版本');
        if (e.body?.data?.serverTree) {
          setTree(e.body.data.serverTree);
          setVersion(e.body.data.currentVersion);
        }
      } else {
        showToast('error', e.message);
      }
    }
  }

  // 树节点操作
  function updateNode(nodeId: string, updater: (n: any) => void) {
    if (!tree) return;
    const clone = JSON.parse(JSON.stringify(tree));
    function walk(nodes: any[]) {
      for (const n of nodes) {
        if (n.id === nodeId) { updater(n); return true; }
        if (n.children && walk(n.children)) return true;
      }
      return false;
    }
    walk(clone);
    setTree(clone);
    setDirty(true);
  }

  function deleteNode(nodeId: string) {
    if (!tree) return;
    const clone = JSON.parse(JSON.stringify(tree));
    function walk(nodes: any[]): boolean {
      const idx = nodes.findIndex((n) => n.id === nodeId);
      if (idx >= 0) {
        if (nodes[idx].locked) { showToast('warning', '根节点不可删除'); return false; }
        nodes.splice(idx, 1);
        return true;
      }
      for (const n of nodes) { if (n.children && walk(n.children)) return true; }
      return false;
    }
    if (walk(clone)) {
      setTree(clone);
      setDirty(true);
      setSelectedNodeId(null);
      showToast('success', '节点已删除');
    }
  }

  function addChild(parentId: string, type: string) {
    const newNode = {
      id: 'n-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      parentId, type, name: `New${type}_${Math.floor(Math.random() * 1000)}`,
      comment: '', locked: false, children: [], config: {},
    };
    updateNode(parentId, (n) => { (n.children ||= []).push(newNode); });
    setSelectedNodeId(newNode.id);
  }

  function lockForEdit(nodeId: string) {
    if (!id) return;
    if (lockedNodes[nodeId] && lockedNodes[nodeId] !== user?.username) {
      showToast('warning', `节点已被 ${lockedNodes[nodeId]} 锁定`);
      return;
    }
    collab.lockNode(id, nodeId);
    setEditing(true);
  }

  function unlockEdit(nodeId: string) {
    if (!id) return;
    collab.unlockNode(id, nodeId);
    setEditing(false);
  }

  if (!project || !tree) {
    return <div className="flex-1 grid place-items-center text-ink-400 text-sm">加载项目...</div>;
  }

  const selectedNode = findNode(tree, selectedNodeId || '');

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* 项目头 */}
      <div className="px-6 py-3 border-b border-ink-700 bg-ink-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => navigate('/dashboard')} className="text-ink-400 hover:text-ink-100 text-sm">工作台</button>
          <ChevronRight className="w-4 h-4 text-ink-600" />
          <h1 className="text-sm font-semibold text-ink-100 truncate">{project.name}</h1>
          <span className="badge bg-cyan-deep/30 text-cyan-brand">v{version}</span>
          {dirty && <span className="badge bg-amber-deep/30 text-amber-signal animate-blink">未保存</span>}
          <span className="badge bg-ink-700 text-ink-300">{project.status}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* 协作者 */}
          <div className="flex -space-x-1 mr-2">
            {presence.slice(0, 4).map((u) => (
              <div key={u.userId} title={u.username}
                className="w-6 h-6 rounded-full border-2 border-ink-900 grid place-items-center text-[10px] font-bold text-ink-950"
                style={{ background: u.color }}>
                {u.username[0].toUpperCase()}
              </div>
            ))}
            {presence.length > 4 && (
              <div className="w-6 h-6 rounded-full bg-ink-700 border-2 border-ink-900 grid place-items-center text-[10px] text-ink-300">+{presence.length - 4}</div>
            )}
          </div>
          <button onClick={() => navigate(`/projects/${id}/validate`)} className="btn-ghost text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />校验
          </button>
          <button onClick={() => navigate(`/projects/${id}/export`)} className="btn-ghost text-xs">
            <Download className="w-3.5 h-3.5" />导出
          </button>
          <button onClick={() => saveTree()} disabled={!dirty} className="btn-primary text-xs">
            <Save className="w-3.5 h-3.5" />保存
          </button>
        </div>
      </div>

      {/* 三栏布局 */}
      <div className="flex-1 flex min-h-0">
        {/* 左：节点树 */}
        <div className="w-72 border-r border-ink-700 bg-ink-950/40 flex flex-col">
          <div className="px-3 py-2 border-b border-ink-700 flex items-center justify-between">
            <span className="text-xs font-medium text-ink-200 flex items-center gap-1.5">
              <ListTree className="w-3.5 h-3.5" />节点树
            </span>
            <button onClick={() => addChild(tree[0].id, 'FC')}
              className="text-ink-400 hover:text-cyan-brand p-1 rounded hover:bg-ink-800" title="新增子节点">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
            {tree.map((n) => (
              <TreeNodeView key={n.id} node={n} depth={0}
                selectedId={selectedNodeId}
                lockedNodes={lockedNodes}
                currentUser={user?.username || ''}
                onSelect={(id) => { setSelectedNodeId(id); }}
                onAddChild={addChild}
                onDelete={deleteNode}
              />
            ))}
          </div>
        </div>

        {/* 中：业务配置模块 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 模块 Tab */}
          <div className="px-4 border-b border-ink-700 bg-ink-900/40 flex items-center gap-1 overflow-x-auto scrollbar-thin">
            {CONFIG_MODULES.map((m) => (
              <button key={m.id}
                onClick={() => setActiveModule(m.id)}
                className={cn(
                  "px-3 py-2.5 text-xs border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5",
                  activeModule === m.id
                    ? "border-cyan-brand text-cyan-brand bg-ink-850"
                    : "border-transparent text-ink-400 hover:text-ink-100"
                )}
              >
                <m.icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ConfigModulePanel
              module={activeModule}
              tree={tree}
              selectedNode={selectedNode}
              project={project}
              onUpdateNode={updateNode}
              onAddChild={addChild}
              onDeleteNode={deleteNode}
              onLockEdit={lockForEdit}
              onUnlockEdit={unlockEdit}
              editing={editing}
              lockedBy={selectedNode ? lockedNodes[selectedNode.id] : undefined}
              currentUser={user?.username || ''}
            />
          </div>
        </div>

        {/* 右：属性 / 协作者 */}
        <div className="w-64 border-l border-ink-700 bg-ink-950/40 flex flex-col">
          <div className="px-3 py-2 border-b border-ink-700">
            <span className="text-xs font-medium text-ink-200 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />属性
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-3 scrollbar-thin text-xs space-y-3">
            {selectedNode ? (
              <>
                <div>
                  <div className="text-[10px] text-ink-500 uppercase">名称</div>
                  <div className="text-ink-100 font-mono">{selectedNode.name}</div>
                </div>
                <div>
                  <div className="text-[10px] text-ink-500 uppercase">类型</div>
                  <span className={`badge node-${selectedNode.type.toLowerCase()} font-mono`}>{selectedNode.type}</span>
                </div>
                <div>
                  <div className="text-[10px] text-ink-500 uppercase">编辑权限</div>
                  {selectedNode.locked ? (
                    <div className="flex items-center gap-1 text-amber-signal"><Lock className="w-3 h-3" />根节点强制保留</div>
                  ) : lockedNodes[selectedNode.id] ? (
                    <div className="text-red-signal">已被 {lockedNodes[selectedNode.id]} 锁定</div>
                  ) : (
                    <div className="text-green-signal">可编辑</div>
                  )}
                </div>
                {selectedNode.comment && (
                  <div>
                    <div className="text-[10px] text-ink-500 uppercase">注释</div>
                    <div className="text-ink-300">{selectedNode.comment}</div>
                  </div>
                )}
                {selectedNode.config?.fields && (
                  <div>
                    <div className="text-[10px] text-ink-500 uppercase">字段 ({(selectedNode.config.fields as any[]).length})</div>
                    <div className="space-y-0.5 mt-1">
                      {(selectedNode.config.fields as any[]).map((f: any, i: number) => (
                        <div key={i} className="font-mono text-[10px] text-ink-300">
                          {typeof f === 'string' ? f : `${f.name} : ${f.type}`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedNode.config?.pins && (
                  <div>
                    <div className="text-[10px] text-ink-500 uppercase">引脚 ({(selectedNode.config.pins as any[]).length})</div>
                    <div className="space-y-0.5 mt-1">
                      {(selectedNode.config.pins as any[]).map((p: any, i: number) => (
                        <div key={i} className="font-mono text-[10px] text-ink-300">
                          <span className={p.dir === 'INPUT' ? 'text-cyan-brand' : 'text-amber-signal'}>{p.dir}</span>
                          {' '}{p.name} : {p.type}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-ink-500">选择左侧节点查看属性</div>
            )}
          </div>

          {/* 协作者列表 */}
          <div className="border-t border-ink-700 p-3">
            <div className="text-xs font-medium text-ink-200 mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />协作者 ({presence.length})
            </div>
            <div className="space-y-1">
              {presence.length === 0 ? (
                <div className="text-[10px] text-ink-500">仅你在线</div>
              ) : presence.map((u) => (
                <div key={u.userId} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full animate-pulse-slow" style={{ background: u.color }} />
                  <span className="text-ink-200">{u.username}</span>
                  {u.username === user?.username && <span className="text-[9px] text-ink-500">(你)</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function findNode(nodes: any[], id: string): any | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const r = findNode(n.children, id);
      if (r) return r;
    }
  }
  return null;
}

function TreeNodeView({
  node, depth, selectedId, lockedNodes, currentUser,
  onSelect, onAddChild, onDelete,
}: {
  node: any; depth: number; selectedId: string | null;
  lockedNodes: Record<string, string>; currentUser: string;
  onSelect: (id: string) => void;
  onAddChild: (parentId: string, type: string) => void;
  onDelete: (nodeId: string) => void;
}) {
  const [open, setOpen] = useState(depth < 2);
  const [menuOpen, setMenuOpen] = useState(false);
  const children = node.children || [];
  const isSelected = selectedId === node.id;
  const lockBy = lockedNodes[node.id];
  const isLockedByOther = lockBy && lockBy !== currentUser;
  const canAddChild = ['PRG', 'FB', 'FC', 'STRUCT'].includes(node.type);

  return (
    <div className="text-xs">
      <div
        className={cn(
          "flex items-center gap-1 py-1 px-1 rounded cursor-pointer transition-colors group relative",
          isSelected ? "bg-cyan-deep/20 text-cyan-brand" : "hover:bg-ink-800 text-ink-200"
        )}
        style={{ paddingLeft: depth * 12 + 4 }}
        onClick={() => onSelect(node.id)}
      >
        {children.length > 0 ? (
          <button onClick={(e) => { e.stopPropagation(); setOpen(!open); }} className="hover:text-ink-100">
            {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          </button>
        ) : <span className="w-3" />}
        <span className={`badge node-${node.type.toLowerCase()} font-mono text-[9px] px-1.5 py-0`}>{node.type}</span>
        <span className="font-mono truncate flex-1">{node.name}</span>
        {node.locked && <Lock className="w-3 h-3 text-amber-signal" />}
        {isLockedByOther && <div className="w-1.5 h-1.5 rounded-full bg-red-signal animate-blink" title={`已被 ${lockBy} 锁定`} />}
        <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity">
          {canAddChild && (
            <button onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              className="p-0.5 hover:text-cyan-brand" title="新增">
              <Plus className="w-3 h-3" />
            </button>
          )}
          {!node.locked && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
              className="p-0.5 hover:text-red-signal" title="删除">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 z-20 bg-ink-850 border border-ink-600 rounded shadow-lg p-1 min-w-[120px]"
            onClick={(e) => e.stopPropagation()}>
            {['STRUCT', 'FB', 'FC', 'VAR'].map((t) => (
              <button key={t}
                onClick={() => { onAddChild(node.id, t); setMenuOpen(false); }}
                className="w-full text-left px-2 py-1 text-xs hover:bg-ink-700 rounded flex items-center gap-2">
                <span className={`badge node-${t.toLowerCase()} text-[9px] px-1`}>{t}</span>
                新增 {t}
              </button>
            ))}
          </div>
        )}
      </div>
      {open && children.map((c: any) => (
        <TreeNodeView key={c.id} node={c} depth={depth + 1}
          selectedId={selectedId} lockedNodes={lockedNodes} currentUser={currentUser}
          onSelect={onSelect} onAddChild={onAddChild} onDelete={onDelete} />
      ))}
    </div>
  );
}
