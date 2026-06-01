import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, Download, RefreshCw, CheckCircle2, Home, Cpu } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { CodeEditor } from '@/components/CodeEditor';
import { generatePLCProgram, generateGCode, exportProgram } from '@/utils/programGenerator';
import { Program } from '@/types';

export const ProgramGeneration = () => {
  const navigate = useNavigate();
  const { currentProject, addProgram } = useStore();
  const [programType, setProgramType] = useState<'plc' | 'gcode'>('plc');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Code2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
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
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    let code = '';
    if (programType === 'plc') {
      code = generatePLCProgram(currentProject.deviceInfo, currentProject.selectedMaterials);
    } else {
      code = generateGCode(currentProject.deviceInfo);
    }
    
    setGeneratedCode(code);
    
    const program: Program = {
      id: Date.now().toString(),
      name: `${currentProject.name}_${programType === 'plc' ? 'PLC程序' : 'G代码'}`,
      language: programType === 'plc' ? 'ST' : 'GCode',
      code,
      version: '1.0',
      createdAt: new Date()
    };
    addProgram(program);
    
    setIsGenerating(false);
  };

  const handleDownload = () => {
    if (generatedCode) {
      exportProgram(generatedCode, currentProject.name, programType === 'plc' ? 'ST' : 'GCode');
    }
  };

  const hasExistingProgram = currentProject.programs.length > 0;
  const displayCode = generatedCode || (hasExistingProgram ? currentProject.programs[currentProject.programs.length - 1].code : null);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">程序编写</h1>
          <p className="text-slate-500">自动生成设备控制程序</p>
        </div>
        {currentProject.status === 'completed' && (
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-green-500/25 transition-all"
          >
            <Home className="w-5 h-5" />
            完成项目
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {displayCode && (
              <CodeEditor
                code={displayCode}
                language={programType === 'plc' ? 'ST' : 'GCode'}
                filename={`${currentProject.name}.${programType === 'plc' ? 'st' : 'gcode'}`}
                onDownload={handleDownload}
              />
            )}
            
            {!displayCode && !isGenerating && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Code2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 mb-2">还没有生成程序</p>
                <p className="text-slate-400 text-sm">选择程序类型并点击生成按钮</p>
              </div>
            )}
            
            {isGenerating && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <RefreshCw className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
                <p className="text-slate-600 font-medium">正在生成程序...</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">程序类型</h3>
            <div className="space-y-3">
              <button
                onClick={() => setProgramType('plc')}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  programType === 'plc'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  programType === 'plc' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Cpu className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-800">PLC 程序</p>
                  <p className="text-sm text-slate-500">结构化文本 (ST)</p>
                </div>
              </button>
              <button
                onClick={() => setProgramType('gcode')}
                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  programType === 'gcode'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  programType === 'gcode' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Code2 className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-slate-800">G 代码</p>
                  <p className="text-sm text-slate-500">数控加工程序</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-4">生成程序</h3>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !currentProject.deviceInfo}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? '生成中...' : '生成程序'}
            </button>
            {!currentProject.deviceInfo && (
              <p className="text-sm text-orange-600 mt-3">请先完成设备信息录入</p>
            )}
          </div>

          {hasExistingProgram && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="font-bold text-slate-800 mb-4">历史程序</h3>
              <div className="space-y-2">
                {currentProject.programs.map((program, idx) => (
                  <button
                    key={program.id}
                    onClick={() => setGeneratedCode(program.code)}
                    className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left"
                  >
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{program.name}</p>
                      <p className="text-xs text-slate-500">
                        {program.language} · v{program.version}
                      </p>
                    </div>
                    <Code2 className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentProject.status === 'completed' && (
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle2 className="w-8 h-8" />
                <h3 className="text-xl font-bold">项目完成!</h3>
              </div>
              <p className="text-green-100 mb-4">
                恭喜您完成了整个设备设计流程，您可以返回首页查看项目。
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-green-600 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <Home className="w-5 h-5" />
                返回首页
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
