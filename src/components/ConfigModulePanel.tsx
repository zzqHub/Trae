import { useState } from 'react';
import {
  Lock, Unlock, Save, Plus, Trash2, AlertTriangle,
  Cpu, Zap, Shield, Workflow, Variable, Boxes, Code2, Bell,
  ArrowRight, RefreshCw, FileCode2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  module: string;
  tree: any[];
  selectedNode: any | null;
  project: any;
  onUpdateNode: (nodeId: string, updater: (n: any) => void) => void;
  onAddChild: (parentId: string, type: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onLockEdit: (nodeId: string) => void;
  onUnlockEdit: (nodeId: string) => void;
  editing: boolean;
  lockedBy?: string;
  currentUser: string;
}

export default function ConfigModulePanel(props: Props) {
  switch (props.module) {
    case 'structure':   return <StructurePanel {...props} />;
    case 'safety':      return <SafetyPanel {...props} />;
    case 'workstation': return <WorkstationPanel {...props} />;
    case 'variable':    return <VariablePanel {...props} />;
    case 'mainProgram': return <MainProgramPanel {...props} />;
    case 'module':      return <ModulePanel {...props} />;
    case 'io':          return <IOPanel {...props} />;
    case 'alarm':       return <AlarmPanel {...props} />;
    default:            return null;
  }
}

// 通用模块头
function ModuleHeader({ icon: Icon, title, desc, actions }: { icon: any; title: string; desc: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded bg-cyan-deep/30 text-cyan-brand grid place-items-center shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-ink-100">{title}</h2>
          <p className="text-xs text-ink-400 mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  );
}

// 锁定提示条
function LockBanner({ selectedNode, lockedBy, currentUser, onLock, onUnlock, editing }: any) {
  if (!selectedNode) return null;
  const isRoot = selectedNode.locked;
  if (isRoot) {
    return (
      <div className="mb-3 px-3 py-2 rounded bg-amber-deep/20 border border-amber-signal/40 text-amber-signal text-xs flex items-center gap-2">
        <Lock className="w-3.5 h-3.5" />根节点强制保留 — 内部 Method 调用顺序可改，节点本身不可删除
      </div>
    );
  }
  if (lockedBy && lockedBy !== currentUser) {
    return (
      <div className="mb-3 px-3 py-2 rounded bg-red-deep/20 border border-red-signal/40 text-red-signal text-xs flex items-center gap-2">
        <Lock className="w-3.5 h-3.5" />已被 {lockedBy} 锁定，仅可查看
      </div>
    );
  }
  return (
    <div className="mb-3 flex items-center gap-2">
      {editing ? (
        <>
          <span className="text-xs text-green-signal flex items-center gap-1"><Unlock className="w-3.5 h-3.5" />编辑中 (已获取节点锁)</span>
          <button onClick={() => onUnlock(selectedNode.id)} className="btn-ghost text-xs py-1 px-2">
            <Unlock className="w-3 h-3" />释放锁
          </button>
        </>
      ) : (
        <button onClick={() => onLock(selectedNode.id)} className="btn-ghost text-xs py-1 px-2">
          <Lock className="w-3 h-3" />获取编辑锁
        </button>
      )}
    </div>
  );
}

// === 1. 结构配置 ===
function StructurePanel({ tree, selectedNode, onUpdateNode, onLockEdit, onUnlockEdit, editing, lockedBy, currentUser }: Props) {
  const [name, setName] = useState(selectedNode?.name || '');
  const [comment, setComment] = useState(selectedNode?.comment || '');

  function save() {
    if (!selectedNode) return;
    onUpdateNode(selectedNode.id, (n) => { n.name = name; n.comment = comment; });
  }

  return (
    <div>
      <ModuleHeader icon={Workflow} title="结构配置" desc="定义设备结构树 (应用-MAIN-EM00/EM01)，节点增删改查" />
      <LockBanner selectedNode={selectedNode} lockedBy={lockedBy} currentUser={currentUser}
        onLock={onLockEdit} onUnlock={onUnlockEdit} editing={editing} />
      {!selectedNode ? (
        <EmptyHint text="请从左侧节点树选择要配置的节点" />
      ) : (
        <div className="card p-4 space-y-3 max-w-xl">
          <div>
            <label className="text-xs text-ink-400 block mb-1">节点名称</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} disabled={!editing && !selectedNode.locked} />
          </div>
          <div>
            <label className="text-xs text-ink-400 block mb-1">注释</label>
            <input className="input" value={comment} onChange={(e) => setComment(e.target.value)} disabled={!editing && !selectedNode.locked} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={save} disabled={!editing && !selectedNode.locked}
              className="btn-primary text-xs"><Save className="w-3.5 h-3.5" />应用变更</button>
            <span className="text-[10px] text-ink-500">变更会在主操作栏点击"保存"后写入版本历史</span>
          </div>
        </div>
      )}

      {/* 设备结构树概览 */}
      <div className="mt-6 card p-4">
        <div className="text-xs text-ink-300 mb-2 font-medium">设备结构概览</div>
        <div className="text-[11px] font-mono text-ink-400 space-y-1">
          <div>应用 (Application)</div>
          <div className="pl-3">└─ MAIN (PRG)</div>
          <div className="pl-6">├─ GVL (全局变量)</div>
          <div className="pl-6">├─ STRUCT × N (设备数据结构)</div>
          <div className="pl-6">├─ FB × N (功能块实例)</div>
          <div className="pl-6">└─ FC × N (功能函数)</div>
          <div className="pl-3">└─ EM00 (扩展模块)</div>
          <div className="pl-3">└─ EM01 (工位 1)</div>
          <div className="pl-6">├─ 三色灯 FB_TripleLight</div>
          <div className="pl-6">├─ 气缸 FB_Cylinder</div>
          <div className="pl-6">└─ 安全光栅 FB_SafetyLightCurtain</div>
          <div className="pl-3">└─ EM02 (工位 2)</div>
        </div>
      </div>
    </div>
  );
}

// === 2. 安全配置 ===
function SafetyPanel(_: Props) {
  const [rules, setRules] = useState([
    { id: 'r1', signal: 'g_bEmergencyStop',   level: 'STOP',    action: '立即停止所有运动 + 触发主报警', enabled: true },
    { id: 'r2', signal: 'g_bSafetyLightCurtain', level: 'STOP', action: '停止危险区域运动 + 黄灯闪', enabled: true },
    { id: 'r3', signal: 'g_bDoorOpen',        level: 'WARNING', action: '触发蜂鸣 + 触摸屏弹窗', enabled: true },
    { id: 'r4', signal: 'g_bAirPressureLow',  level: 'WARNING', action: '气缸回原位 + 等待气压恢复', enabled: false },
  ]);

  return (
    <div>
      <ModuleHeader icon={Shield} title="安全配置" desc="急停 / 安全光栅专属规则，区分停机/警告报警等级" />
      <div className="card overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-ink-800 text-ink-400">
            <tr>
              <th className="px-3 py-2 text-left font-medium">安全信号</th>
              <th className="px-3 py-2 text-left font-medium">等级</th>
              <th className="px-3 py-2 text-left font-medium">处理动作</th>
              <th className="px-3 py-2 text-center font-medium">启用</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800">
            {rules.map((r) => (
              <tr key={r.id} className="hover:bg-ink-800/50">
                <td className="px-3 py-2 font-mono text-cyan-brand">{r.signal}</td>
                <td className="px-3 py-2">
                  <span className={cn("badge",
                    r.level === 'STOP' ? "bg-red-deep/30 text-red-signal" : "bg-amber-deep/30 text-amber-signal")}>
                    {r.level === 'STOP' ? '停机' : '警告'}
                  </span>
                </td>
                <td className="px-3 py-2 text-ink-300">{r.action}</td>
                <td className="px-3 py-2 text-center">
                  <input type="checkbox" checked={r.enabled} onChange={(e) => setRules(rules.map(x => x.id === r.id ? { ...x, enabled: e.target.checked } : x))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs">
        <button className="btn-ghost"><Plus className="w-3.5 h-3.5" />新增规则</button>
        <div className="px-3 py-1.5 rounded bg-amber-deep/20 border border-amber-signal/40 text-amber-signal flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />安全类设备 (急停/光栅) 在生成时自动附加安全逻辑校验
        </div>
      </div>
    </div>
  );
}

// === 3. 工位配置 ===
function WorkstationPanel(_: Props) {
  const [stations, setStations] = useState([
    { id: 'em01', name: 'EM01 - 上料工位',  devices: ['FB_TripleLight × 1', 'FB_Cylinder × 2', 'FB_SafetyLightCurtain × 1'] },
    { id: 'em02', name: 'EM02 - 组装工位',  devices: ['FB_TripleLight × 1', 'FB_Cylinder × 4', 'FB_SafetyLightCurtain × 1'] },
    { id: 'em03', name: 'EM03 - 检测工位',  devices: ['FB_TripleLight × 1', 'FB_Cylinder × 1'] },
    { id: 'em04', name: 'EM04 - 下料工位',  devices: ['FB_TripleLight × 1', 'FB_Cylinder × 2'] },
  ]);

  return (
    <div>
      <ModuleHeader icon={Boxes} title="工位配置" desc="划分 EM01/EM02 等工位，绑定对应设备清单"
        actions={<button className="btn-ghost text-xs"><Plus className="w-3.5 h-3.5" />新增工位</button>} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {stations.map((s) => (
          <div key={s.id} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-brand" />
                <span className="font-medium text-ink-100 text-sm">{s.name}</span>
              </div>
              <span className="badge bg-cyan-deep/30 text-cyan-brand">{s.devices.length}</span>
            </div>
            <div className="space-y-1">
              {s.devices.map((d, i) => (
                <div key={i} className="text-xs font-mono text-ink-300 px-2 py-1 rounded bg-ink-950/50">{d}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// === 4. 变量生成 ===
function VariablePanel(_: Props) {
  const samples = [
    { station: 'EM01', config: 'TripleLight',  var: 'stEM01_Light',        type: 'ST_TripleLight' },
    { station: 'EM01', config: 'Cylinder_Fwd',  var: 'stEM01_Cyl1',         type: 'ST_Cylinder' },
    { station: 'EM01', config: 'Cylinder_Bwd',  var: 'stEM01_Cyl2',         type: 'ST_Cylinder' },
    { station: 'EM01', config: 'Safety',         var: 'stEM01_Safety',       type: 'ST_Safety' },
    { station: 'EM02', config: 'TripleLight',  var: 'stEM02_Light',        type: 'ST_TripleLight' },
    { station: 'EM02', config: 'Cylinder_1',     var: 'stEM02_Cyl1',         type: 'ST_Cylinder' },
    { station: 'EM03', config: 'TripleLight',  var: 'stEM03_Light',        type: 'ST_TripleLight' },
    { station: 'EM04', config: 'TripleLight',  var: 'stEM04_Light',        type: 'ST_TripleLight' },
  ];
  return (
    <div>
      <ModuleHeader icon={Variable} title="变量生成" desc="基于工位号 + 工位配置名称自动生成变量名"
        actions={<button className="btn-primary text-xs"><RefreshCw className="w-3.5 h-3.5" />重新生成</button>} />
      <div className="card overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-ink-800 text-ink-400">
            <tr>
              <th className="px-3 py-2 text-left font-medium">工位</th>
              <th className="px-3 py-2 text-left font-medium">配置名</th>
              <th className="px-3 py-2 text-left font-medium">生成变量名</th>
              <th className="px-3 py-2 text-left font-medium">数据类型</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800">
            {samples.map((s, i) => (
              <tr key={i} className="hover:bg-ink-800/50">
                <td className="px-3 py-2"><span className="badge bg-cyan-deep/30 text-cyan-brand">{s.station}</span></td>
                <td className="px-3 py-2 text-ink-300">{s.config}</td>
                <td className="px-3 py-2 font-mono text-amber-signal">{s.var}</td>
                <td className="px-3 py-2 font-mono text-ink-300">{s.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 p-3 rounded bg-ink-950 border border-ink-700 text-xs">
        <div className="text-[10px] text-ink-500 mb-1">命名规则</div>
        <code className="text-cyan-brand font-mono">st{`{工位号}`}_{`{配置名}`} : {`{结构体类型}`}</code>
      </div>
    </div>
  );
}

// === 5. 主程序生成 ===
function MainProgramPanel({ tree }: Props) {
  const root = tree[0];
  const [methods, setMethods] = useState<string[]>(root?.config?.methods || ['Init', 'ManualMode', 'AutoMode', 'AlarmHandle', 'SafetyCheck']);

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= methods.length) return;
    const next = [...methods];
    [next[i], next[j]] = [next[j], next[i]];
    setMethods(next);
  }

  function remove(i: number) {
    setMethods(methods.filter((_, idx) => idx !== i));
  }

  function add() {
    const name = prompt('输入 Method 名称:');
    if (name) setMethods([...methods, name]);
  }

  const code = `PROGRAM MAIN
VAR
END_VAR

(* 主程序 - 调用顺序由用户编排 *)
${methods.map((m) => `${m}();`).join('\n')}

END_PROGRAM`;

  return (
    <div>
      <ModuleHeader icon={Code2} title="主程序生成" desc="根节点 PRG 强制生成；Method 调用顺序完全自定义"
        actions={<button onClick={add} className="btn-ghost text-xs"><Plus className="w-3.5 h-3.5" />新增 Method</button>} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-4">
          <div className="text-xs text-ink-300 mb-3 font-medium">调用顺序 (拖拽或上下移动)</div>
          <div className="space-y-2">
            {methods.map((m, i) => (
              <div key={m + i} className="flex items-center gap-2 px-3 py-2 rounded bg-ink-950 border border-ink-700 group">
                <span className="text-[10px] text-ink-500 font-mono w-5">{i + 1}.</span>
                <span className="font-mono text-sm text-cyan-brand flex-1">{m}()</span>
                <button onClick={() => move(i, -1)} disabled={i === 0} className="opacity-50 group-hover:opacity-100 disabled:opacity-20 text-ink-400 hover:text-cyan-brand text-xs">↑</button>
                <button onClick={() => move(i, 1)} disabled={i === methods.length - 1} className="opacity-50 group-hover:opacity-100 disabled:opacity-20 text-ink-400 hover:text-cyan-brand text-xs">↓</button>
                <button onClick={() => remove(i)} className="opacity-50 group-hover:opacity-100 text-ink-400 hover:text-red-signal">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-ink-300 mb-3 font-medium flex items-center gap-2">
            <FileCode2 className="w-3.5 h-3.5" />代码预览
          </div>
          <pre className="text-[11px] font-mono text-ink-300 bg-ink-950 p-3 rounded border border-ink-700 overflow-x-auto">{code}</pre>
        </div>
      </div>
    </div>
  );
}

// === 6. 模块生成 ===
function ModulePanel(_: Props) {
  const instances = [
    { fb: 'FB_TripleLight',         instance: 'EM01_Light',       status: '已生成' },
    { fb: 'FB_Cylinder',            instance: 'EM01_Cyl1',         status: '已生成' },
    { fb: 'FB_Cylinder',            instance: 'EM01_Cyl2',         status: '已生成' },
    { fb: 'FB_SafetyLightCurtain',  instance: 'EM01_Safety',       status: '已生成' },
    { fb: 'FB_TripleLight',         instance: 'EM02_Light',       status: '已生成' },
    { fb: 'FB_Cylinder',            instance: 'EM02_Cyl1',         status: '已生成' },
    { fb: 'FB_Cylinder',            instance: 'EM02_Cyl2',         status: '已生成' },
    { fb: 'FB_Cylinder',            instance: 'EM02_Cyl3',         status: '冲突' },
    { fb: 'FB_Cylinder',            instance: 'EM02_Cyl4',         status: '已生成' },
    { fb: 'FB_SafetyLightCurtain',  instance: 'EM02_Safety',       status: '已生成' },
  ];
  return (
    <div>
      <ModuleHeader icon={Boxes} title="模块生成" desc="批量实例化 FB/FC 功能块，自动检测命名冲突"
        actions={<button className="btn-primary text-xs"><RefreshCw className="w-3.5 h-3.5" />批量实例化</button>} />
      <div className="card overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-ink-800 text-ink-400">
            <tr>
              <th className="px-3 py-2 text-left font-medium">FB 类型</th>
              <th className="px-3 py-2 text-left font-medium">实例名</th>
              <th className="px-3 py-2 text-left font-medium">状态</th>
              <th className="px-3 py-2 text-right font-medium">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800">
            {instances.map((it, i) => (
              <tr key={i} className="hover:bg-ink-800/50">
                <td className="px-3 py-2 font-mono text-amber-signal">{it.fb}</td>
                <td className="px-3 py-2 font-mono text-cyan-brand">{it.instance}</td>
                <td className="px-3 py-2">
                  {it.status === '已生成' ? (
                    <span className="badge bg-green-deep/30 text-green-signal">{it.status}</span>
                  ) : (
                    <span className="badge bg-red-deep/30 text-red-signal">{it.status}</span>
                  )}
                </td>
                <td className="px-3 py-2 text-right">
                  <button className="text-ink-400 hover:text-red-signal"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// === 7. IO 生成 ===
function IOPanel(_: Props) {
  const ioMap = [
    { inst: 'EM01_Light',       pin: 'bEnable', addr: '%IX0.0',  type: 'DI', conflict: false },
    { inst: 'EM01_Light',       pin: 'bAlarm',  addr: '%IX0.1',  type: 'DI', conflict: false },
    { inst: 'EM01_Light',       pin: 'stLight', addr: '%QX0.0',  type: 'DO', conflict: false },
    { inst: 'EM01_Cyl1',        pin: 'bCmd',    addr: '%QX0.1',  type: 'DO', conflict: false },
    { inst: 'EM01_Cyl1',        pin: 'bExtend', addr: '%IX0.2',  type: 'DI', conflict: false },
    { inst: 'EM01_Cyl2',        pin: 'bCmd',    addr: '%QX0.2',  type: 'DO', conflict: false },
    { inst: 'EM01_Safety',      pin: 'bTrigger',addr: '%IX0.3',  type: 'DI', conflict: false },
    { inst: 'EM02_Light',       pin: 'bEnable', addr: '%IX0.0',  type: 'DI', conflict: true  }, // 冲突
    { inst: 'EM02_Cyl1',        pin: 'bCmd',    addr: '%QX0.3',  type: 'DO', conflict: false },
    { inst: 'EM02_Safety',      pin: 'bTrigger',addr: '%IX0.4',  type: 'DI', conflict: false },
  ];
  return (
    <div>
      <ModuleHeader icon={Workflow} title="IO 生成" desc="完整链路: FB 实例声明 → 实例调用 → 引脚接口对接 → IO 物理地址映射"
        actions={<button className="btn-primary text-xs"><RefreshCw className="w-3.5 h-3.5" />自动映射</button>} />
      <div className="card overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-ink-800 text-ink-400">
            <tr>
              <th className="px-3 py-2 text-left font-medium">FB 实例</th>
              <th className="px-3 py-2 text-left font-medium">引脚</th>
              <th className="px-3 py-2 text-left font-medium">物理地址</th>
              <th className="px-3 py-2 text-left font-medium">类型</th>
              <th className="px-3 py-2 text-left font-medium">状态</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800">
            {ioMap.map((io, i) => (
              <tr key={i} className={cn("hover:bg-ink-800/50", io.conflict && "bg-red-deep/10")}>
                <td className="px-3 py-2 font-mono text-cyan-brand">{io.inst}</td>
                <td className="px-3 py-2 font-mono text-ink-300">.{io.pin}</td>
                <td className="px-3 py-2 font-mono text-amber-signal">{io.addr}</td>
                <td className="px-3 py-2">
                  <span className={cn("badge", io.type === 'DI' ? "bg-cyan-deep/30 text-cyan-brand" : "bg-amber-deep/30 text-amber-signal")}>{io.type}</span>
                </td>
                <td className="px-3 py-2">
                  {io.conflict ? (
                    <span className="badge bg-red-deep/30 text-red-signal flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3" />地址冲突</span>
                  ) : (
                    <span className="badge bg-green-deep/30 text-green-signal">已映射</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 p-3 rounded bg-cyan-deep/20 border border-cyan-brand/40 text-cyan-brand text-xs flex items-center gap-2">
        <ArrowRight className="w-3.5 h-3.5" />
        安全类设备 (急停/光栅) 自动附加安全逻辑校验
      </div>
    </div>
  );
}

// === 8. 报警生成 ===
function AlarmPanel(_: Props) {
  const alarms = [
    { no: 1, code: 'A001', text: 'EM01 气缸 1 伸出超时', level: 'WARNING', hmi: true },
    { no: 2, code: 'A002', text: 'EM01 气缸 1 缩回超时', level: 'WARNING', hmi: true },
    { no: 3, code: 'A003', text: 'EM01 安全光栅触发',    level: 'STOP',    hmi: true },
    { no: 4, code: 'A004', text: 'EM01 三色灯红灯异常',  level: 'WARNING', hmi: true },
    { no: 5, code: 'A005', text: 'EM02 气缸 3 命令冲突',  level: 'STOP',    hmi: true },
    { no: 6, code: 'A006', text: 'EM02 安全光栅触发',    level: 'STOP',    hmi: true },
    { no: 7, code: 'A007', text: '系统急停按下',          level: 'STOP',    hmi: true },
    { no: 8, code: 'A008', text: '气压低于阈值',          level: 'WARNING', hmi: true },
  ];
  return (
    <div>
      <ModuleHeader icon={Bell} title="报警生成" desc="自动生成报警结构体、报警处理 FC，适配触摸屏报警映射"
        actions={<button className="btn-primary text-xs"><RefreshCw className="w-3.5 h-3.5" />生成报警</button>} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-4 py-2 border-b border-ink-700 text-xs text-ink-300 font-medium">报警清单</div>
          <table className="w-full text-xs">
            <thead className="bg-ink-800 text-ink-400">
              <tr>
                <th className="px-3 py-2 text-left font-medium">No.</th>
                <th className="px-3 py-2 text-left font-medium">代码</th>
                <th className="px-3 py-2 text-left font-medium">描述</th>
                <th className="px-3 py-2 text-left font-medium">等级</th>
                <th className="px-3 py-2 text-center font-medium">HMI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800">
              {alarms.map((a) => (
                <tr key={a.no} className="hover:bg-ink-800/50">
                  <td className="px-3 py-2 text-ink-400">{a.no}</td>
                  <td className="px-3 py-2 font-mono text-cyan-brand">{a.code}</td>
                  <td className="px-3 py-2 text-ink-200">{a.text}</td>
                  <td className="px-3 py-2">
                    <span className={cn("badge",
                      a.level === 'STOP' ? "bg-red-deep/30 text-red-signal" : "bg-amber-deep/30 text-amber-signal")}>
                      {a.level === 'STOP' ? '停机' : '警告'}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center text-green-signal">{a.hmi ? '✓' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card p-4">
          <div className="text-xs text-ink-300 mb-3 font-medium flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-signal" />自动生成内容
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-2 rounded bg-ink-950 border border-ink-700">
              <div className="text-[10px] text-ink-500 mb-1">报警结构体</div>
              <code className="font-mono text-cyan-brand">ST_AlarmItem</code>
              <div className="text-[10px] text-ink-400 mt-1">.code : INT / .text : STRING / .level : INT / .active : BOOL</div>
            </div>
            <div className="p-2 rounded bg-ink-950 border border-ink-700">
              <div className="text-[10px] text-ink-500 mb-1">报警处理 FC</div>
              <code className="font-mono text-cyan-brand">FC_AlarmHandle</code>
              <div className="text-[10px] text-ink-400 mt-1">扫描所有报警变量 → 写入 HMI 报警缓冲区</div>
            </div>
            <div className="p-2 rounded bg-ink-950 border border-ink-700">
              <div className="text-[10px] text-ink-500 mb-1">触摸屏映射表</div>
              <code className="font-mono text-cyan-brand">HMI_AlarmMap</code>
              <div className="text-[10px] text-ink-400 mt-1">{alarms.length} 条报警映射到触摸屏 DB 块</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyHint({ text }: { text: string }) {
  return (
    <div className="card p-8 text-center text-ink-400 text-sm">
      <FileCode2 className="w-8 h-8 text-ink-600 mx-auto mb-2" />
      {text}
    </div>
  );
}
