import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useUIStore } from '@/lib/stores';
import { PageHeader } from '@/components/AppShell';
import {
  Download, Boxes, Cable, FileSpreadsheet, RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BOM() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useUIStore();
  const [data, setData] = useState<{ bom: any[]; eplan: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'bom' | 'eplan'>('bom');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.bom(id).then(setData).catch((e) => showToast('error', e.message)).finally(() => setLoading(false));
  }, [id]);

  function exportBOMCsv() {
    if (!data) return;
    const rows = [['No.', 'Device', 'Spec', 'Qty', 'Manufacturer', 'Remark']];
    data.bom.forEach((b) => rows.push([String(b.no), b.device, b.spec, String(b.quantity), b.manufacturer, b.remark]));
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bom.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'BOM CSV 已导出');
  }

  function exportEplanXml() {
    if (!data) return;
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<eplan>\n  <terminals>\n` +
      data.eplan.terminals.map((t: any) => `    <terminal no="${t.no}" signal="${t.signal}" address="${t.address}" cable="${t.cable}"/>`).join('\n') +
      `\n  </terminals>\n  <cables>\n` +
      data.eplan.cables.map((c: any) => `    <cable no="${c.no}" from="${c.from}" to="${c.to}" cores="${c.cores}" spec="${c.spec}"/>`).join('\n') +
      `\n  </cables>\n</eplan>`;
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'eplan.xml'; a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'EPLAN XML 已导出');
  }

  return (
    <>
      <PageHeader
        title="BOM / 图纸输出"
        subtitle="同一套工位/IO配置 → 电气 BOM 清单 + EPLAN 图纸数据"
        actions={
          <>
            <button onClick={() => navigate(`/projects/${id}`)} className="btn-ghost text-xs">返回工作区</button>
            <button onClick={() => setTab('bom')} className="btn-ghost text-xs">BOM</button>
            <button onClick={() => setTab('eplan')} className="btn-ghost text-xs">EPLAN</button>
            {tab === 'bom' ? (
              <button onClick={exportBOMCsv} className="btn-primary text-xs"><Download className="w-3.5 h-3.5" />导出 CSV</button>
            ) : (
              <button onClick={exportEplanXml} className="btn-primary text-xs"><Download className="w-3.5 h-3.5" />导出 XML</button>
            )}
          </>
        }
      />
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="card p-12 text-center text-ink-400 text-sm">生成中...</div>
          ) : !data ? (
            <div className="card p-12 text-center text-ink-400 text-sm">无数据</div>
          ) : tab === 'bom' ? (
            <div className="card overflow-hidden">
              <div className="px-4 py-2 border-b border-ink-700 flex items-center justify-between">
                <span className="text-xs text-ink-300 font-medium flex items-center gap-2"><Boxes className="w-3.5 h-3.5" />电气 BOM 清单</span>
                <span className="text-[10px] text-ink-500">{data.bom.length} 项</span>
              </div>
              <table className="w-full text-xs">
                <thead className="bg-ink-800 text-ink-400">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">No.</th>
                    <th className="px-3 py-2 text-left font-medium">设备 (FB)</th>
                    <th className="px-3 py-2 text-left font-medium">规格</th>
                    <th className="px-3 py-2 text-center font-medium">数量</th>
                    <th className="px-3 py-2 text-left font-medium">制造商</th>
                    <th className="px-3 py-2 text-left font-medium">备注</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-800">
                  {data.bom.map((b: any) => (
                    <tr key={b.no} className="hover:bg-ink-800/50">
                      <td className="px-3 py-2 text-ink-400">{b.no}</td>
                      <td className="px-3 py-2 font-mono text-cyan-brand">{b.device}</td>
                      <td className="px-3 py-2 text-ink-200">{b.spec}</td>
                      <td className="px-3 py-2 text-center text-amber-signal">{b.quantity}</td>
                      <td className="px-3 py-2 text-ink-200">{b.manufacturer}</td>
                      <td className="px-3 py-2 text-ink-400 text-[10px]">{b.remark}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="card overflow-hidden">
                <div className="px-4 py-2 border-b border-ink-700 flex items-center gap-2">
                  <Cable className="w-3.5 h-3.5 text-cyan-brand" />
                  <span className="text-xs text-ink-300 font-medium">端子排 ({data.eplan.terminals.length})</span>
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-ink-800 text-ink-400">
                    <tr>
                      <th className="px-3 py-2 text-left">No.</th>
                      <th className="px-3 py-2 text-left">信号</th>
                      <th className="px-3 py-2 text-left">地址</th>
                      <th className="px-3 py-2 text-left">电缆</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-800 max-h-96 overflow-y-auto">
                    {data.eplan.terminals.map((t: any, i: number) => (
                      <tr key={i} className="hover:bg-ink-800/50">
                        <td className="px-3 py-2 text-ink-400">{t.no}</td>
                        <td className="px-3 py-2 font-mono text-cyan-brand">{t.signal}</td>
                        <td className="px-3 py-2 font-mono text-amber-signal">{t.address}</td>
                        <td className="px-3 py-2 font-mono text-ink-300">{t.cable}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card overflow-hidden">
                <div className="px-4 py-2 border-b border-ink-700 flex items-center gap-2">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-amber-signal" />
                  <span className="text-xs text-ink-300 font-medium">电缆清单 ({data.eplan.cables.length})</span>
                </div>
                <table className="w-full text-xs">
                  <thead className="bg-ink-800 text-ink-400">
                    <tr>
                      <th className="px-3 py-2 text-left">编号</th>
                      <th className="px-3 py-2 text-left">起</th>
                      <th className="px-3 py-2 text-left">止</th>
                      <th className="px-3 py-2 text-center">芯数</th>
                      <th className="px-3 py-2 text-left">规格</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-800">
                    {data.eplan.cables.map((c: any, i: number) => (
                      <tr key={i} className="hover:bg-ink-800/50">
                        <td className="px-3 py-2 font-mono text-cyan-brand">{c.no}</td>
                        <td className="px-3 py-2 text-ink-300">{c.from}</td>
                        <td className="px-3 py-2 text-ink-300">{c.to}</td>
                        <td className="px-3 py-2 text-center text-amber-signal">{c.cores}</td>
                        <td className="px-3 py-2 text-ink-300">{c.spec}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
