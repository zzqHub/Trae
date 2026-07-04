import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUIStore, useAuthStore } from '@/lib/stores';
import { PageHeader } from '@/components/AppShell';
import {
  Plus, Trash2, Edit3, Save, X, UserCog, ShieldCheck, User, Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Role, UserStatus } from '../../shared/types';

const ROLE_META: Record<Role, { label: string; color: string; icon: any }> = {
  ADMIN: { label: '管理员',       color: 'red',    icon: ShieldCheck },
  ENGINEER: { label: '工程师',     color: 'cyan',   icon: UserCog },
  TEMPLATE_MAINTAINER: { label: '模板维护员', color: 'amber',  icon: Edit3 },
  GUEST: { label: '访客',         color: 'violet', icon: Eye },
};

export default function Users() {
  const { showToast } = useUIStore();
  const { user: currentUser } = useAuthStore();
  const [list, setList] = useState<any[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ username: '', password: '', role: 'ENGINEER' });

  function load() {
    api.listUsers().then(setList).catch((e) => showToast('error', e.message));
  }
  useEffect(() => { load(); }, []);

  function startEdit(u: any) {
    setEditing(u.id);
    setEditForm({ role: u.role, status: u.status, password: '' });
  }
  function cancelEdit() { setEditing(null); setEditForm({}); }
  async function saveEdit(id: string) {
    try {
      const patch: any = { role: editForm.role, status: editForm.status };
      if (editForm.password) patch.password = editForm.password;
      await api.updateUser(id, patch);
      showToast('success', '已更新');
      setEditing(null);
      load();
    } catch (e: any) { showToast('error', e.message); }
  }
  async function remove(id: string) {
    if (!confirm('确认删除该用户?')) return;
    try {
      await api.deleteUser(id);
      showToast('success', '已删除');
      load();
    } catch (e: any) { showToast('error', e.message); }
  }
  async function create() {
    try {
      await api.createUser(createForm.username, createForm.password, createForm.role);
      showToast('success', '用户已创建');
      setShowCreate(false);
      setCreateForm({ username: '', password: '', role: 'ENGINEER' });
      load();
    } catch (e: any) { showToast('error', e.message); }
  }

  return (
    <>
      <PageHeader
        title="用户管理"
        subtitle="用户列表 / 角色分配 / 状态切换"
        actions={
          <button onClick={() => setShowCreate(true)} className="btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" />新增用户
          </button>
        }
      />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          {/* 角色概览 */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {(Object.keys(ROLE_META) as Role[]).map((r) => {
              const m = ROLE_META[r];
              const Icon = m.icon;
              const count = list.filter((u) => u.role === r).length;
              return (
                <div key={r} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={cn("w-8 h-8 rounded grid place-items-center",
                      m.color === 'red' && "bg-red-deep/30 text-red-signal",
                      m.color === 'cyan' && "bg-cyan-deep/30 text-cyan-brand",
                      m.color === 'amber' && "bg-amber-deep/30 text-amber-signal",
                      m.color === 'violet' && "bg-violet-deep/30 text-violet-signal",
                    )}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xl font-bold text-ink-100">{count}</span>
                  </div>
                  <div className="text-xs text-ink-200">{m.label}</div>
                </div>
              );
            })}
          </div>

          {/* 用户表格 */}
          <div className="card overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-ink-800 text-ink-400">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">用户</th>
                  <th className="px-4 py-3 text-left font-medium">角色</th>
                  <th className="px-4 py-3 text-left font-medium">状态</th>
                  <th className="px-4 py-3 text-left font-medium">创建时间</th>
                  <th className="px-4 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {list.map((u) => {
                  const m = ROLE_META[u.role as Role];
                  const isEditing = editing === u.id;
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-ink-800/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-brand to-violet-signal grid place-items-center text-ink-950 text-xs font-bold">
                            {u.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-ink-100">{u.username}</div>
                            {isSelf && <div className="text-[10px] text-cyan-brand">当前登录</div>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select className="input py-1 text-xs" value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                            {Object.keys(ROLE_META).map((r) => <option key={r} value={r}>{ROLE_META[r as Role].label}</option>)}
                          </select>
                        ) : (
                          <span className={cn("badge",
                            m.color === 'red' && "bg-red-deep/30 text-red-signal",
                            m.color === 'cyan' && "bg-cyan-deep/30 text-cyan-brand",
                            m.color === 'amber' && "bg-amber-deep/30 text-amber-signal",
                            m.color === 'violet' && "bg-violet-deep/30 text-violet-signal")}>
                            {m.label}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select className="input py-1 text-xs" value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                            <option value="ACTIVE">启用</option>
                            <option value="DISABLED">禁用</option>
                          </select>
                        ) : (
                          <span className={cn("badge",
                            u.status === 'ACTIVE' ? "bg-green-deep/30 text-green-signal" : "bg-ink-700 text-ink-400")}>
                            {u.status === 'ACTIVE' ? '启用' : '禁用'}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-ink-400">{new Date(u.createdAt).toLocaleDateString('zh-CN')}</td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1">
                            <input type="password" placeholder="新密码(可选)" className="input py-1 text-xs w-32"
                              value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} />
                            <button onClick={() => saveEdit(u.id)} className="btn-primary text-[10px] py-1 px-2"><Save className="w-3 h-3" /></button>
                            <button onClick={cancelEdit} className="btn-ghost text-[10px] py-1 px-2"><X className="w-3 h-3" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => startEdit(u)} className="text-ink-400 hover:text-cyan-brand p-1"><Edit3 className="w-3.5 h-3.5" /></button>
                            {!isSelf && <button onClick={() => remove(u.id)} className="text-ink-400 hover:text-red-signal p-1"><Trash2 className="w-3.5 h-3.5" /></button>}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 新建用户弹窗 */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 grid place-items-center z-50" onClick={() => setShowCreate(false)}>
          <div className="card p-5 w-96" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-semibold text-ink-100 mb-4">新增用户</div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-ink-400 block mb-1">用户名</label>
                <input className="input" value={createForm.username} onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-ink-400 block mb-1">密码</label>
                <input type="password" className="input" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} />
              </div>
              <div>
                <label className="text-xs text-ink-400 block mb-1">角色</label>
                <select className="input" value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}>
                  {Object.keys(ROLE_META).map((r) => <option key={r} value={r}>{ROLE_META[r as Role].label}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowCreate(false)} className="btn-ghost text-xs">取消</button>
                <button onClick={create} className="btn-primary text-xs"><Plus className="w-3.5 h-3.5" />创建</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
