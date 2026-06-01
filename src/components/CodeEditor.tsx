import { useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';

interface CodeEditorProps {
  code: string;
  language?: string;
  filename?: string;
  onDownload?: () => void;
}

export const CodeEditor = ({ code, language = 'text', filename = 'program', onDownload }: CodeEditorProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const lines = code.split('\n');

  return (
    <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <span className="ml-4 text-sm text-slate-400 font-mono">{filename}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '已复制' : '复制'}</span>
          </button>
          {onDownload && (
            <button
              onClick={onDownload}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-gradient-to-r from-blue-500 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/25 rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>下载</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="overflow-auto max-h-[600px]">
        <div className="flex">
          <div className="select-none bg-slate-800/50 text-slate-500 text-right px-4 py-4 font-mono text-sm border-r border-slate-700">
            {lines.map((_, idx) => (
              <div key={idx} className="leading-6">{idx + 1}</div>
            ))}
          </div>
          <pre className="flex-1 p-4 font-mono text-sm overflow-x-auto">
            <code className="text-slate-300 whitespace-pre leading-6">
              {code}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
};
