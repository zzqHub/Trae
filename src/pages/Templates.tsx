import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useUIStore, useAuthStore } from '@/lib/stores';
import { PageHeader } from '@/components/AppShell';
import {
  Battery, Sun, Square, Plus, History, RotateCcw, FileCode2,
  ChevronRight, Boxes, Lock, Eye, Save,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const INDUSTRY_META: any = {
  lithium: { label: '锂电产线', icon: Battery, color: 'cyan' },
  pv:      { label: '光伏组件', icon: Sun,    color: 'amber' },
  glass:   { label: '玻璃检测', icon: Square, color: 'violet' },
};

export default function Templates() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const { user } = useAuthStore();
  const [templates, setTemplates] = useState<any[]>([]);
  const [selected, setSelected] = useState<any | null>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [activeVersion, setActiveVersion] = useState<any | null>(null);

  useEffect(() => {
    api.listTemplates().then((list) => {
      setTemplates(list);
      if (id) {
        const found = list.find((t) => t.id === id);
        if (found) selectTemplate(found);
      } else if (list.length > 0) {
        selectTemplate(list[0]);
      }
    }).catch(() => showToast('error', '加载模板失败'));
  }, [id]);

  async function selectTemplate(t: any) {
    setSelected(t);
    navigate(`/templates/${t.id}`, { replace: true });
    try {
      const vs = await api.listTemplateVersions(t.id);
      setVersions(vs);
      if (vs.length > 0) {
        setActiveVersion(vs[0]);
        setContent(vs[0].content);
      }
    } catch (e: any) {
      showToast('error', e.message);
    }
  }

  async function loadVersion(v: any) {
    setActiveVersion(v);
    setContent(v.content);
  }

  async function rollback(v: any) {
    if (!selected) return;
    try {
      await api.rollbackTemplate(selected.id, v.id);
      showToast('success', `已回滚到 v${v.versionNo}`);
      const vs = await api.listTemplateVersions(selected.id);
      setVersions(vs);
    } catch (e: any) {
      showToast('error', e.message);
    }
  }

  async function saveNewVersion() {
    if (!selected) return;
    const note = prompt('版本说明:', '更新模板') || '更新模板';
    try {
      await api.addTemplateVersion(selected.id, content, note);
      showToast('success', '新版本已发布');
      const vs = await api.listTemplateVersions(selected.id);
      setVersions(vs);
      if (vs.length > 0) setActiveVersion(vs[0]);
    } catch (e: any) {
      showToast('error', e.message);
    }
  }

  const canEdit = user && ['ADMIN', 'TEMPLATE_MAINTAINER'].includes(user.role);

  return (
    <>
      <PageHeader
        title="模板管理"
        subtitle="外部独立模板文件 (JSON/YAML) · 版本管理 · 回滚"
        actions={
          <button className="btn-primary text-xs"><Plus className="w-3.5 h-3.5" />新建模板</button>
        }
      />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 左：模板列表 */}
          <div className="lg:col-span-3 space-y-2">
            {templates.map((t) => {
              const meta = INDUSTRY_META[t.industry] || { label: t.industry, icon: Boxes, color: 'cyan' };
              const Icon = meta.icon;
              return (
                <div key={t.id} onClick={() => selectTemplate(t)}
                  className={cn("card p-3 cursor-pointer transition-all",
                    selected?.id === t.id ? "border-cyan-brand shadow-glow" : "hover:border-ink-500")}>
                  <div className="flex items-start gap-2">
                    <div className={cn("w-8 h-8 rounded grid place-items-center shrink-0",
                      meta.color === 'cyan' && "bg-cyan-deep/30 text-cyan-brand",
                      meta.color === 'amber' && "bg-amber-deep/30 text-amber-signal",
                      meta.color === 'violet' && "bg-violet-deep/30 text-violet-signal")}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-ink-100 truncate">{t.name}</div>
                      <div className="text-[10px] text-ink-400 mt-0.5 flex items-center gap-2">
                        <span>{meta.label}</span>
                        <span className="badge bg-ink-700 text-ink-300">v{t.currentVersionNo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 中：版本列表 */}
          <div className="lg:col-span-3 card p-0 overflow-hidden">
            <div className="px-3 py-2 border-b border-ink-700 flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-cyan-brand" />
              <span className="text-xs font-medium text-ink-200">版本历史</span>
            </div>
            <div className="divide-y divide-ink-800 max-h-[600px] overflow-y-auto">
              {versions.length === 0 ? (
                <div className="p-4 text-center text-ink-500 text-xs">无版本</div>
              ) : versions.map((v) => (
                <div key={v.id} onClick={() => loadVersion(v)}
                  className={cn("p-3 cursor-pointer hover:bg-ink-800",
                    activeVersion?.id === v.id && "bg-ink-800")}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-sm text-cyan-brand">v{v.versionNo}</span>
                    {selected?.currentVersionId === v.id && (
                      <span className="badge bg-green-deep/30 text-green-signal">当前</span>
                    )}
                  </div>
                  <div className="text-xs text-ink-300 truncate">{v.note}</div>
                  <div className="text-[10px] text-ink-500 mt-1">{new Date(v.createdAt).toLocaleString('zh-CN')}</div>
                  {canEdit && selected?.currentVersionId !== v.id && (
                    <button onClick={(e) => { e.stopPropagation(); rollback(v); }}
                      className="mt-2 text-[10px] text-amber-signal hover:text-amber-signal/80 flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" />回滚到此版本
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 右：模板内容编辑 */}
          <div className="lg:col-span-6 card p-0 overflow-hidden">
            <div className="px-4 py-2 border-b border-ink-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-3.5 h-3.5 text-cyan-brand" />
                <span className="text-xs font-medium text-ink-200">{selected?.name}</span>
                {activeVersion && (
                  <span className="badge bg-ink-700 text-ink-300 font-mono">v{activeVersion.versionNo}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {canEdit ? (
                  <button onClick={saveNewVersion} className="btn-primary text-xs">
                    <Save className="w-3 h-3" />发布新版本
                  </button>
                ) : (
                  <span className="text-[10px] text-ink-500 flex items-center gap-1"><Lock className="w-3 h-3" />仅查看</span>
                )}
              </div>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              readOnly={!canEdit}
              className="w-full h-[600px] bg-ink-950 p-4 text-[11px] font-mono text-ink-200 resize-none focus:outline-none"
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}
