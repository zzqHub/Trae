import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, ArrowRight, RefreshCw, Eye, Cpu } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { generateDrawing, exportDrawing } from '@/utils/drawingGenerator';
import { Drawing } from '@/types';

export const DrawingOutput = () => {
  const navigate = useNavigate();
  const { currentProject, addDrawing } = useStore();
  const [drawingData, setDrawingData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">请先创建或选择一个项目</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const svg = generateDrawing(currentProject.deviceInfo, currentProject.selectedMaterials);
    setDrawingData(svg);
    
    const drawing: Drawing = {
      id: Date.now().toString(),
      name: `${currentProject.name}_装配图`,
      type: '2d',
      format: 'svg',
      data: svg,
      createdAt: new Date()
    };
    addDrawing(drawing);
    
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (drawingData) {
      exportDrawing(drawingData, currentProject.name);
    }
  };

  const hasExistingDrawing = currentProject.drawings.length > 0;
  const displayDrawing = drawingData || (hasExistingDrawing ? currentProject.drawings[currentProject.drawings.length - 1].data : null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">图纸输出</h1>
          <p className="text-slate-500">自动生成设备装配图纸</p>
        </div>
        {hasExistingDrawing && (
          <button
            onClick={() => navigate('/program-generation')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            继续下一步
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-500" />
                图纸预览
              </h3>
              {displayDrawing && (
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  下载 SVG
                </button>
              )}
            </div>
            <div className="p-8 bg-slate-50 min-h-[500px] flex items-center justify-center">
              {isGenerating ? (
                <div className="text-center">
                  <RefreshCw className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
                  <p className="text-slate-600 font-medium">正在生成图纸...</p>
                </div>
              ) : displayDrawing ? (
                <div dangerouslySetInnerHTML={{ __html: displayDrawing }} className="bg-white shadow-lg rounded-lg" />
              ) : (
                <div className="text-center">
                  <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 mb-4">还没有生成图纸</p>
                  <p className="text-slate-400 text-sm">点击下方按钮生成设备装配图</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">生成图纸</h3>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !currentProject.deviceInfo}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? '生成中...' : '生成图纸'}
            </button>
            {!currentProject.deviceInfo && (
              <p className="text-sm text-orange-600 mt-3">请先完成设备信息录入</p>
            )}
          </div>

          {currentProject.deviceInfo && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-slate-500" />
                项目信息
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-500">项目名称</p>
                  <p className="font-medium text-slate-800">{currentProject.name}</p>
                </div>
                {currentProject.deviceInfo && (
                  <>
                    <div>
                      <p className="text-sm text-slate-500">设备名称</p>
                      <p className="font-medium text-slate-800">{currentProject.deviceInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">设备类型</p>
                      <p className="font-medium text-slate-800">{currentProject.deviceInfo.type}</p>
                    </div>
                  </>
                )}
                <div>
                  <p className="text-sm text-slate-500">物料数量</p>
                  <p className="font-medium text-slate-800">{currentProject.selectedMaterials.length} 件</p>
                </div>
              </div>
            </div>
          )}

          {hasExistingDrawing && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4">历史图纸</h3>
              <div className="space-y-2">
                {currentProject.drawings.map((drawing, idx) => (
                  <div key={drawing.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{drawing.name}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(drawing.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setDrawingData(drawing.data)}
                      className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasExistingDrawing && (
            <button
              onClick={() => navigate('/program-generation')}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              继续下一步
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
