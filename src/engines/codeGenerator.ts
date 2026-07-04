/**
 * 代码生成器
 * 整合模板引擎、规则引擎、AI引擎，生成完整PLC程序
 * 支持多品牌输出（西门子/三菱/欧姆龙/台达）
 */

import type { Project, Station, Module, Device, PlcBrand, ProgramBlock, Network } from '../types/project';
import type { Template } from '../types/template';
import type { Rule } from '../types/rule';
import { templateEngine } from './templateEngine';
import { ruleEngine } from './ruleEngine';
import { aiEngine } from './aiEngine';

export interface GeneratedFile {
  name: string;
  path: string;
  content: string;
  language: string;
  description?: string;
}

export interface GeneratedProgram {
  project: Project;
  files: GeneratedFile[];
  totalLines: number;
  generatedAt: string;
  warnings: string[];
}

export type GenerateProgressPhase =
  | 'initializing'
  | 'analyzing'
  | 'generating_modules'
  | 'generating_stations'
  | 'generating_main'
  | 'generating_rules'
  | 'optimizing'
  | 'complete';

export interface GenerateProgress {
  phase: GenerateProgressPhase;
  phaseLabel: string;
  progress: number;
  total: number;
  currentItem?: string;
  message: string;
}

export type ProgressCallback = (progress: GenerateProgress) => void;

export interface GenerateOptions {
  templates?: Template[];
  rules?: Rule[];
  onProgress?: ProgressCallback;
  includeComments?: boolean;
  optimizationLevel?: 'none' | 'basic' | 'full';
}

const brandConfig: Record<PlcBrand, {
  name: string;
  fileExtension: string;
  commentPrefix: string;
  networkKeyword: string;
}> = {
  siemens: {
    name: '西门子',
    fileExtension: '.scl',
    commentPrefix: '//',
    networkKeyword: 'NETWORK',
  },
  mitsubishi: {
    name: '三菱',
    fileExtension: '.gxw',
    commentPrefix: '\'',
    networkKeyword: '// Network',
  },
  omron: {
    name: '欧姆龙',
    fileExtension: '.cxp',
    commentPrefix: '//',
    networkKeyword: '// Section',
  },
  delta: {
    name: '台达',
    fileExtension: '.dvp',
    commentPrefix: '\'',
    networkKeyword: '// Step',
  },
};

const phaseLabels: Record<GenerateProgressPhase, string> = {
  initializing: '初始化',
  analyzing: '分析项目配置',
  generating_modules: '生成模块代码',
  generating_stations: '生成工位程序',
  generating_main: '生成主程序',
  generating_rules: '生成规则逻辑',
  optimizing: '优化代码',
  complete: '生成完成',
};

function createProgress(
  phase: GenerateProgressPhase,
  current: number,
  total: number,
  currentItem?: string
): GenerateProgress {
  return {
    phase,
    phaseLabel: phaseLabels[phase],
    progress: current,
    total,
    currentItem,
    message: `${phaseLabels[phase]} ${current}/${total}`,
  };
}

function generateModuleCode(
  module: Module,
  brand: PlcBrand,
  options: GenerateOptions
): string {
  const config = brandConfig[brand];
  const { includeComments = true } = options;
  
  let code = '';
  
  if (includeComments) {
    code += `${config.commentPrefix} ========================================\n`;
    code += `${config.commentPrefix} ${module.name}\n`;
    if (module.description) {
      code += `${config.commentPrefix} ${module.description}\n`;
    }
    code += `${config.commentPrefix} 类型: ${module.type}\n`;
    code += `${config.commentPrefix} ========================================\n\n`;
  }
  
  if (module.type === 'FB') {
    code += `FUNCTION_BLOCK ${module.name}\n\n`;
  } else {
    code += `FUNCTION ${module.name} : VOID\n\n`;
  }
  
  if (module.inputParameters.length > 0) {
    code += `VAR_INPUT\n`;
    for (const param of module.inputParameters) {
      const desc = includeComments && param.description ? ` ${config.commentPrefix} ${param.description}` : '';
      const defaultVal = param.defaultValue !== undefined ? ` := ${param.defaultValue}` : '';
      code += `    ${param.name} : ${param.dataType}${defaultVal};${desc}\n`;
    }
    code += `END_VAR\n\n`;
  }
  
  if (module.outputParameters.length > 0) {
    code += `VAR_OUTPUT\n`;
    for (const param of module.outputParameters) {
      const desc = includeComments && param.description ? ` ${config.commentPrefix} ${param.description}` : '';
      const defaultVal = param.defaultValue !== undefined ? ` := ${param.defaultValue}` : '';
      code += `    ${param.name} : ${param.dataType}${defaultVal};${desc}\n`;
    }
    code += `END_VAR\n\n`;
  }
  
  if (module.inOutParameters.length > 0) {
    code += `VAR_IN_OUT\n`;
    for (const param of module.inOutParameters) {
      const desc = includeComments && param.description ? ` ${config.commentPrefix} ${param.description}` : '';
      code += `    ${param.name} : ${param.dataType};${desc}\n`;
    }
    code += `END_VAR\n\n`;
  }
  
  if (module.staticVariables.length > 0) {
    code += `VAR\n`;
    for (const variable of module.staticVariables) {
      const desc = includeComments && variable.description ? ` ${config.commentPrefix} ${variable.description}` : '';
      const defaultVal = variable.defaultValue ? ` := ${variable.defaultValue}` : '';
      code += `    ${variable.name} : ${variable.dataType}${defaultVal};${desc}\n`;
    }
    code += `END_VAR\n\n`;
  }
  
  if (module.tempVariables.length > 0) {
    code += `VAR_TEMP\n`;
    for (const variable of module.tempVariables) {
      const desc = includeComments && variable.description ? ` ${config.commentPrefix} ${variable.description}` : '';
      code += `    ${variable.name} : ${variable.dataType};${desc}\n`;
    }
    code += `END_VAR\n\n`;
  }
  
  code += `${config.commentPrefix} -------------------- 程序代码 --------------------\n\n`;
  
  if (module.code) {
    code += module.code;
  } else {
    code += `${config.commentPrefix} TODO: 实现 ${module.name} 的逻辑\n`;
  }
  
  code += '\n';
  
  if (module.type === 'FB') {
    code += `END_FUNCTION_BLOCK\n`;
  } else {
    code += `END_FUNCTION\n`;
  }
  
  return code;
}

function generateStationCode(
  station: Station,
  brand: PlcBrand,
  options: GenerateOptions
): string {
  const config = brandConfig[brand];
  const { includeComments = true } = options;
  
  let code = '';
  
  if (includeComments) {
    code += `${config.commentPrefix} ========================================\n`;
    code += `${config.commentPrefix} 工位: ${station.name}\n`;
    if (station.description) {
      code += `${config.commentPrefix} ${station.description}\n`;
    }
    code += `${config.commentPrefix} 设备数量: ${station.devices.length}\n`;
    code += `${config.commentPrefix} 模块数量: ${station.modules.length}\n`;
    code += `${config.commentPrefix} ========================================\n\n`;
  }
  
  if (includeComments) {
    code += `${config.commentPrefix} -------------------- 设备IO映射 --------------------\n\n`;
    for (const device of station.devices) {
      code += `${config.commentPrefix} [${device.name}] ${device.description || ''}\n`;
      for (const io of device.ioPoints) {
        code += `${config.commentPrefix}   ${io.type} ${io.address} - ${io.name}\n`;
      }
      code += '\n';
    }
  }
  
  code += `${config.commentPrefix} -------------------- 模块调用 --------------------\n\n`;
  
  for (let i = 0; i < station.modules.length; i++) {
    const module = station.modules[i];
    const instanceName = `${module.name}_${station.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    code += `${config.networkKeyword} ${i + 1}: 调用${module.name}\n`;
    code += `${instanceName}(\n`;
    
    const allParams = [
      ...module.inputParameters.map(p => ({ ...p, direction: 'input' })),
      ...module.outputParameters.map(p => ({ ...p, direction: 'output' })),
      ...module.inOutParameters.map(p => ({ ...p, direction: 'inout' })),
    ];
    
    for (let j = 0; j < allParams.length; j++) {
      const param = allParams[j];
      const comma = j < allParams.length - 1 ? ',' : '';
      code += `    ${param.name} := ${param.name}${comma}\n`;
    }
    
    code += `);\n\n`;
  }
  
  return code;
}

function generateMainProgramCode(
  project: Project,
  brand: PlcBrand,
  options: GenerateOptions
): string {
  const config = brandConfig[brand];
  const { includeComments = true } = options;
  const mainProgram = project.mainProgram;
  
  let code = '';
  
  if (includeComments) {
    code += `${config.commentPrefix} ========================================\n`;
    code += `${config.commentPrefix} 项目: ${project.name}\n`;
    if (project.description) {
      code += `${config.commentPrefix} ${project.description}\n`;
    }
    code += `${config.commentPrefix} PLC品牌: ${config.name}\n`;
    code += `${config.commentPrefix} 工位数量: ${project.stations.length}\n`;
    code += `${config.commentPrefix} 生成时间: ${new Date().toISOString()}\n`;
    code += `${config.commentPrefix} ========================================\n\n`;
  }
  
  code += `ORGANIZATION_BLOCK OB1\n`;
  code += `TITLE = Main Program\n\n`;
  code += `VAR\n`;
  code += `    // 临时变量\n`;
  code += `END_VAR\n\n`;
  
  code += `${config.commentPrefix} ========================================\n`;
  code += `${config.commentPrefix} 主程序循环\n`;
  code += `${config.commentPrefix} ========================================\n\n`;
  
  let networkIndex = 1;
  
  if (mainProgram.networks && mainProgram.networks.length > 0) {
    const sortedNetworks = [...mainProgram.networks].sort((a, b) => a.order - b.order);
    for (const network of sortedNetworks) {
      code += `${config.networkKeyword} ${networkIndex}: ${network.title}\n`;
      if (includeComments && network.description) {
        code += `${config.commentPrefix} ${network.description}\n`;
      }
      if (network.logic) {
        code += network.logic + '\n';
      }
      code += '\n';
      networkIndex++;
    }
  }
  
  code += `${config.commentPrefix} -------------------- 各工位调用 --------------------\n\n`;
  
  for (const station of project.stations) {
    code += `${config.networkKeyword} ${networkIndex}: ${station.name} 调用\n`;
    if (includeComments && station.description) {
      code += `${config.commentPrefix} ${station.description}\n`;
    }
    code += `${config.commentPrefix} 调用工位 ${station.name} 的所有模块\n`;
    code += `\n`;
    networkIndex++;
    
    for (const module of station.modules) {
      const instanceName = `${module.name}_${station.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
      code += `    ${instanceName}();\n`;
    }
    code += '\n';
  }
  
  code += `END_ORGANIZATION_BLOCK\n`;
  
  return code;
}

function generateTagTable(
  project: Project,
  brand: PlcBrand,
  options: GenerateOptions
): string {
  const config = brandConfig[brand];
  const { includeComments = true } = options;
  
  let code = '';
  
  if (includeComments) {
    code += `${config.commentPrefix} ========================================\n`;
    code += `${config.commentPrefix} IO变量表 / Tag Table\n`;
    code += `${config.commentPrefix} ========================================\n\n`;
  }
  
  const allDevices = project.stations.flatMap(s => 
    s.devices.map(d => ({ ...d, stationName: s.name }))
  );
  
  const digitalInputs: { address: string; name: string; comment: string }[] = [];
  const digitalOutputs: { address: string; name: string; comment: string }[] = [];
  const analogInputs: { address: string; name: string; comment: string }[] = [];
  const analogOutputs: { address: string; name: string; comment: string }[] = [];
  
  for (const device of allDevices) {
    for (const io of device.ioPoints) {
      const entry = {
        address: io.address,
        name: `${device.stationName}_${device.name}_${io.name}`.replace(/[^a-zA-Z0-9_]/g, '_'),
        comment: `${device.stationName} - ${device.name} - ${io.name}${io.description ? ' (' + io.description + ')' : ''}`,
      };
      
      switch (io.type) {
        case 'DI': digitalInputs.push(entry); break;
        case 'DO': digitalOutputs.push(entry); break;
        case 'AI': analogInputs.push(entry); break;
        case 'AO': analogOutputs.push(entry); break;
      }
    }
  }
  
  code += `${config.commentPrefix} --- 数字量输入 (DI) ---\n`;
  for (const di of digitalInputs) {
    code += `${di.name}\t${di.address}\t${di.comment}\n`;
  }
  code += '\n';
  
  code += `${config.commentPrefix} --- 数字量输出 (DO) ---\n`;
  for (const dO of digitalOutputs) {
    code += `${dO.name}\t${dO.address}\t${dO.comment}\n`;
  }
  code += '\n';
  
  if (analogInputs.length > 0) {
    code += `${config.commentPrefix} --- 模拟量输入 (AI) ---\n`;
    for (const ai of analogInputs) {
      code += `${ai.name}\t${ai.address}\t${ai.comment}\n`;
    }
    code += '\n';
  }
  
  if (analogOutputs.length > 0) {
    code += `${config.commentPrefix} --- 模拟量输出 (AO) ---\n`;
    for (const ao of analogOutputs) {
      code += `${ao.name}\t${ao.address}\t${ao.comment}\n`;
    }
    code += '\n';
  }
  
  return code;
}

function generateRuleCode(
  rules: Rule[],
  brand: PlcBrand,
  options: GenerateOptions
): string {
  const config = brandConfig[brand];
  const { includeComments = true } = options;
  
  let code = '';
  
  if (includeComments) {
    code += `${config.commentPrefix} ========================================\n`;
    code += `${config.commentPrefix} 规则引擎逻辑\n`;
    code += `${config.commentPrefix} 规则数量: ${rules.length}\n`;
    code += `${config.commentPrefix} ========================================\n\n`;
  }
  
  const activeRules = rules.filter(r => r.enabled && r.status === 'active');
  const sortedRules = [...activeRules].sort((a, b) => a.priority - b.priority);
  
  for (let i = 0; i < sortedRules.length; i++) {
    const rule = sortedRules[i];
    
    code += `${config.commentPrefix} --- 规则 ${i + 1}: ${rule.name} (优先级: ${rule.priority}) ---\n`;
    if (includeComments && rule.description) {
      code += `${config.commentPrefix} ${rule.description}\n`;
    }
    
    code += `${config.commentPrefix} 条件:\n`;
    for (const cond of rule.conditions.conditions) {
      const opDisplay = {
        eq: '等于', ne: '不等于', gt: '大于', lt: '小于',
        gte: '大于等于', lte: '小于等于', between: '介于',
        contains: '包含', startsWith: '开头是', endsWith: '结尾是',
      }[cond.operator] || cond.operator;
      code += `${config.commentPrefix}   - ${cond.sourceName || cond.id} ${opDisplay} ${cond.value}\n`;
    }
    
    code += `${config.commentPrefix} 动作:\n`;
    for (const action of rule.actions) {
      code += `${config.commentPrefix}   - [${action.type}] ${action.name || action.id}`;
      if (action.targetName) {
        code += ` -> ${action.targetName}`;
      }
      code += '\n';
    }
    code += '\n';
  }
  
  return code;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function generateProgram(
  project: Project,
  options: GenerateOptions = {}
): Promise<GeneratedProgram> {
  const { templates = [], rules = [], onProgress, optimizationLevel = 'basic' } = options;
  const brand = project.plcBrand;
  const config = brandConfig[brand];
  const warnings: string[] = [];
  
  const totalSteps = 7;
  let currentStep = 0;
  
  if (onProgress) {
    onProgress(createProgress('initializing', currentStep++, totalSteps));
  }
  await delay(50);
  
  if (onProgress) {
    onProgress(createProgress('analyzing', currentStep++, totalSteps, project.name));
  }
  await delay(100);
  
  const anomalies = aiEngine.detectAnomalies(project);
  for (const anomaly of anomalies) {
    if (anomaly.severity === 'high' || anomaly.severity === 'critical') {
      warnings.push(`[${anomaly.severity}] ${anomaly.title}: ${anomaly.description}`);
    }
  }
  
  const files: GeneratedFile[] = [];
  const allModules: Module[] = [];
  
  for (const station of project.stations) {
    allModules.push(...station.modules);
  }
  
  if (onProgress) {
    onProgress(createProgress('generating_modules', currentStep++, totalSteps));
  }
  await delay(150);
  
  const uniqueModules = new Map<string, Module>();
  for (const module of allModules) {
    if (!uniqueModules.has(module.name)) {
      uniqueModules.set(module.name, module);
    }
  }
  
  let moduleIndex = 0;
  for (const [name, module] of uniqueModules) {
    if (onProgress) {
      onProgress(createProgress(
        'generating_modules',
        2,
        totalSteps,
        `${name} (${moduleIndex + 1}/${uniqueModules.size})`
      ));
    }
    
    const moduleCode = generateModuleCode(module, brand, options);
    files.push({
      name: `${module.name}${config.fileExtension}`,
      path: `modules/${module.name}${config.fileExtension}`,
      content: moduleCode,
      language: brand === 'siemens' ? 'structured_text' : 'ladder',
      description: module.description,
    });
    
    moduleIndex++;
    await delay(30);
  }
  
  if (onProgress) {
    onProgress(createProgress('generating_stations', currentStep++, totalSteps));
  }
  await delay(100);
  
  for (let i = 0; i < project.stations.length; i++) {
    const station = project.stations[i];
    if (onProgress) {
      onProgress(createProgress(
        'generating_stations',
        3,
        totalSteps,
        `${station.name} (${i + 1}/${project.stations.length})`
      ));
    }
    
    const stationCode = generateStationCode(station, brand, options);
    files.push({
      name: `${station.name}${config.fileExtension}`,
      path: `stations/${station.id}/${station.name}${config.fileExtension}`,
      content: stationCode,
      language: brand === 'siemens' ? 'structured_text' : 'ladder',
      description: station.description,
    });
    
    await delay(50);
  }
  
  if (onProgress) {
    onProgress(createProgress('generating_main', currentStep++, totalSteps));
  }
  await delay(100);
  
  const mainCode = generateMainProgramCode(project, brand, options);
  files.push({
    name: `OB1${config.fileExtension}`,
    path: `OB1${config.fileExtension}`,
    content: mainCode,
    language: brand === 'siemens' ? 'structured_text' : 'ladder',
    description: '主程序循环组织块',
  });
  
  const tagTableCode = generateTagTable(project, brand, options);
  files.push({
    name: `TagTable${config.fileExtension}`,
    path: `TagTable${config.fileExtension}`,
    content: tagTableCode,
    language: 'text',
    description: 'IO变量表',
  });
  
  if (onProgress) {
    onProgress(createProgress('generating_rules', currentStep++, totalSteps));
  }
  await delay(80);
  
  if (rules.length > 0) {
    const ruleCode = generateRuleCode(rules, brand, options);
    files.push({
      name: `Rules${config.fileExtension}`,
      path: `rules/Rules${config.fileExtension}`,
      content: ruleCode,
      language: brand === 'siemens' ? 'structured_text' : 'ladder',
      description: '规则逻辑',
    });
  }
  
  if (onProgress) {
    onProgress(createProgress('optimizing', currentStep++, totalSteps));
  }
  await delay(80);
  
  if (optimizationLevel !== 'none') {
    for (const file of files) {
      file.content = file.content.replace(/\n{3,}/g, '\n\n');
    }
  }
  
  if (onProgress) {
    onProgress(createProgress('complete', currentStep++, totalSteps));
  }
  await delay(30);
  
  const totalLines = files.reduce((sum, f) => sum + f.content.split('\n').length, 0);
  
  return {
    project,
    files,
    totalLines,
    generatedAt: new Date().toISOString(),
    warnings,
  };
}

export interface CodeGenerator {
  generateProgram: typeof generateProgram;
  generateModuleCode: (module: Module, brand: PlcBrand, options?: GenerateOptions) => string;
  generateStationCode: (station: Station, brand: PlcBrand, options?: GenerateOptions) => string;
  generateMainProgramCode: (project: Project, brand: PlcBrand, options?: GenerateOptions) => string;
  generateTagTable: (project: Project, brand: PlcBrand, options?: GenerateOptions) => string;
  generateRuleCode: (rules: Rule[], brand: PlcBrand, options?: GenerateOptions) => string;
}

export function createCodeGenerator(): CodeGenerator {
  return {
    generateProgram,
    generateModuleCode: (module, brand, options = {}) => generateModuleCode(module, brand, options),
    generateStationCode: (station, brand, options = {}) => generateStationCode(station, brand, options),
    generateMainProgramCode: (project, brand, options = {}) => generateMainProgramCode(project, brand, options),
    generateTagTable: (project, brand, options = {}) => generateTagTable(project, brand, options),
    generateRuleCode: (rules, brand, options = {}) => generateRuleCode(rules, brand, options),
  };
}

export const codeGenerator = createCodeGenerator();
export default codeGenerator;
