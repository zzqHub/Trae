import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useUIStore } from '@/lib/stores';
import { PageHeader } from '@/components/AppShell';
import { Save, ShieldCheck, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Role, Resource, PermissionAction } from '../../shared/types';

const ROLES: Role[] = ['ADMIN', 'ENGINEER', 'TEMPLATE_MAINTAINER', 'GUEST'];
const RESOURCES: Resource[] = ['project', 'template', 'user', 'permission', 'export', 'bom'];
const ACTIONS: PermissionAction[] = ['read', 'write', 'delete', 'approve'];

const ACTION_LABEL: Record<PermissionAction, string> = {
  read: '查看', write: '编辑', delete: '删除', approve: '审批',
};
const RESOURCE_LABEL: Record<Resource, string> = {
  project: '项目', template: '模板', user: '用户', permission: '权限', export: '导出', bom: 'BOM',
};
const ROLE_LABEL: Record<Role, string> = {
  ADMIN: '管理员', ENGINEER: '工程师', TEMPLATE_MAINTAINER: '模板维护员', GUEST: '访客',
};

export default function Permissions() {
  const { showToast } = useUIStore();
  const [matrix, setMatrix] = useState<Record<string, Record<string, PermissionAction[]>>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPermissionMatrix().then((m) => {
      setMatrix(m || {});
      setLoading(false);
    }).catch((e) => { showToast('error', e.message); setLoading(false); });
  }, []);

  function toggle(role: Role, resource: Resource, action: PermissionAction) {
    setMatrix((prev) => {
      const next = { ...prev };
      if (!next[role]) next[role] = {};
      const arr = next[role][resource] || [];
      if (arr.includes(action)) next[role][resource] = arr.filter((a) => a !== action);
      else next[role][resource] = [...arr, action];
      return next;
    });
  }

  async function save() {
    try {
      await api.updatePermissionMatrix(matrix);
      showToast('success', '权限矩阵已保存');
    } catch (e: any) {
      showToast('error', e.message);
    }
  }

  if (loading) return <div className="flex-1 grid place-items-center text-ink-400 text-sm">加载中...</div>;

  return (
    <>
      <PageHeader
        title="权限矩阵"
        subtitle="RBAC 角色 × 资源 × 操作 — 多人并发访问控制核心"
        actions={<button onClick={save} className="btn-primary text-xs"><Save className="w-3.5 h-3.5" />保存矩阵</button>}
      />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 并发协作说明 */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-cyan-brand" />
              <span className="text-sm font-medium text-ink-100">并发访问控制</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded bg-ink-950 border border-ink-700">
                <div className="text-cyan-brand font-medium mb-1">JWT + RBAC</div>
                <div className="text-ink-400">四角色矩阵，每路由声明资源+操作，中间件校验放行</div>
              </div>
              <div className="p-3 rounded bg-ink-950 border border-ink-700">
                <div className="text-amber-signal font-medium mb-1">节点级编辑锁</div>
                <div className="text-ink-400">同一节点同时仅一人编辑，30s TTL 心跳续期，超时自动释放</div>
              </div>
              <div className="p-3 rounded bg-ink-950 border border-ink-700">
                <div className="text-green-signal font-medium mb-1">乐观锁版本号</div>
                <div className="text-ink-400">提交变更带 baseVersion，冲突返回 409 + 最新版本触发合并</div>
              </div>
            </div>
          </div>

          {/* 权限矩阵表 */}
          <div className="card overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-ink-800 text-ink-400">
                <tr>
                  <th className="px-4 py-3 text-left font-medium sticky left-0">角色 \ 资源</th>
                  {ACTIONS.map((a) => (
                    <th key={a} className="px-4 py-3 text-center font-medium w-32">{ACTION_LABEL[a]}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-800">
                {ROLES.flatMap((role) =>
                  RESOURCES.map((resource, idx) => (
                    <tr key={`${role}-${resource}`} className="hover:bg-ink-800/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {idx === 0 && (
                            <span className="badge bg-cyan-deep/30 text-cyan-brand mr-2 row-span-6">{ROLE_LABEL[role]}</span>
                          )}
                          <span className="text-ink-200">{RESOURCE_LABEL[resource]}</span>
                          <span className="text-[10px] text-ink-500 font-mono">{resource}</span>
                        </div>
                      </td>
                      {ACTIONS.map((a) => {
                        const checked = (matrix[role]?.[resource] || []).includes(a);
                        return (
                          <td key={a} className="px-4 py-3 text-center">
                            <input type="checkbox" checked={checked}
                              onChange={() => toggle(role, resource, a)}
                              className="w-4 h-4 accent-cyan-brand cursor-pointer" />
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 矩阵 JSON 预览 */}
          <div className="card p-0 overflow-hidden">
            <div className="px-4 py-2 border-b border-ink-700 flex items-center justify-between">
              <span className="text-xs text-ink-300 font-medium flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-amber-signal" />矩阵 JSON 预览
              </span>
              <span className="text-[10px] text-ink-500">实时更新</span>
            </div>
            <pre className="p-4 text-[11px] font-mono text-ink-300 bg-ink-950 overflow-x-auto">
              {JSON.stringify(matrix, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </>
  );
}
