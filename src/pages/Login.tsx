import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores';
import { Cpu, Lock, User, KeyRound, ArrowRight, AlertCircle, Zap } from 'lucide-react';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [inviteCode, setInviteCode] = useState('xgencode2024');
  const [error, setError] = useState<string | null>(null);
  const { login, register, loading } = useAuthStore();
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === 'login') await login(username, password);
      else await register(username, password, inviteCode);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* 左侧品牌区 */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-ink-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(circle at 30% 30%, black, transparent 80%)',
          }} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-lg bg-cyan-brand grid place-items-center shadow-glow">
              <Cpu className="w-7 h-7 text-ink-950" />
            </div>
            <div>
              <div className="text-xl font-bold text-ink-100">XGenCode</div>
              <div className="text-[10px] tracking-[0.3em] text-cyan-brand uppercase">PLC Code Generator</div>
            </div>
          </div>
        </div>

        <div className="relative space-y-8">
          <h1 className="text-4xl font-bold text-ink-100 leading-tight">
            一套配置<br/>
            <span className="text-cyan-brand">多端</span>输出
          </h1>
          <p className="text-ink-400 text-sm leading-relaxed max-w-md">
            工业级 PLC 代码生成器 — 项目初始化 → 业务配置 → 跨平台导出。
            通过外部模板 + 树形节点骨架机制，一键生成 CODESYS / 西门子 / 欧姆龙 多品牌工程。
          </p>
          <div className="grid grid-cols-3 gap-3 max-w-md">
            {[
              { label: '强制根节点', sub: 'PRG/GVL' },
              { label: '非根全自定义', sub: 'FB/FC/STRUCT' },
              { label: '多人并发', sub: '节点级锁' },
            ].map((f) => (
              <div key={f.label} className="card p-3">
                <div className="text-xs text-cyan-brand font-medium">{f.label}</div>
                <div className="text-[10px] text-ink-500 mt-0.5">{f.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-ink-500">
          <div className="traffic-light on-green"><span></span><span></span><span></span></div>
          <span className="font-mono">SYSTEM.READY · CODESYS / SIEMENS / OMRON</span>
        </div>
      </div>

      {/* 右侧登录卡片 */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="text-2xl font-bold text-ink-100 flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-brand" />
              {mode === 'login' ? '欢迎回来' : '注册账号'}
            </div>
            <div className="text-sm text-ink-400 mt-1">
              {mode === 'login' ? '请使用账号登录 XGenCode 控制台' : '需邀请码，注册后默认工程师角色'}
            </div>
          </div>

          {/* 模式切换 */}
          <div className="flex gap-1 mb-6 p-1 bg-ink-850 rounded-md border border-ink-700">
            {(['login', 'register'] as const).map((m) => (
              <button key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm rounded transition-colors ${
                  mode === m ? 'bg-cyan-brand text-ink-950 font-medium' : 'text-ink-300 hover:text-ink-100'
                }`}
              >
                {m === 'login' ? '登录' : '注册'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs text-ink-400 mb-1 block">用户名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                <input className="input pl-9" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="请输入用户名" />
              </div>
            </div>
            <div>
              <label className="text-xs text-ink-400 mb-1 block">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                <input type="password" className="input pl-9" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="请输入密码" />
              </div>
            </div>
            {mode === 'register' && (
              <div>
                <label className="text-xs text-ink-400 mb-1 block">邀请码</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500" />
                  <input className="input pl-9" value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="请输入邀请码" />
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded bg-red-deep/20 border border-red-signal/40 text-red-signal text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />{error}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="btn-primary w-full">
              {loading ? '处理中...' : mode === 'login' ? '登录' : '注册'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 p-3 rounded-md bg-ink-850 border border-ink-700 text-xs text-ink-400">
            <div className="font-medium text-ink-300 mb-1">演示账号</div>
            <div className="font-mono text-[11px] space-y-0.5">
              <div>admin / admin123 (管理员)</div>
              <div>engineer / engineer123 (工程师)</div>
              <div>tpl / tpl123 (模板维护员)</div>
              <div>guest / guest123 (访客)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
