/**
 * AI引擎（模拟实现）
 * 支持智能代码补全、逻辑推荐、异常检测、自然语言生成
 */

import type { Project, Station, Device, PlcBrand, DeviceType } from '../types/project';
import type { Template } from '../types/template';
import type { AiRecommendation, RecommendationType, RecommendationSource, CodeBlock } from '../types/ai';

export interface CodeCompletionSuggestion {
  id: string;
  label: string;
  detail: string;
  insertText: string;
  kind: 'function' | 'keyword' | 'snippet' | 'variable';
  confidence: number;
}

export interface AnomalyIssue {
  id: string;
  type: 'warning' | 'error' | 'info';
  title: string;
  description: string;
  location?: string;
  suggestion?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface LogicRecommendation {
  id: string;
  title: string;
  description: string;
  logicType: string;
  templateId?: string;
  confidence: number;
  applicableDevices?: string[];
}

export interface NlpPlcSuggestion {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  confidence: number;
  relatedTemplates?: string[];
}

const codeCompletionSnippets: Record<PlcBrand, CodeCompletionSuggestion[]> = {
  siemens: [
    { id: 'sc-001', label: 'NETWORK', detail: '创建新的网络段', insertText: 'NETWORK ${1:标题}\n    // 逻辑代码\n', kind: 'keyword', confidence: 0.95 },
    { id: 'sc-002', label: 'A (AND)', detail: '与运算 - 常开触点', insertText: 'A     ${1:地址}', kind: 'keyword', confidence: 0.92 },
    { id: 'sc-003', label: 'AN (AND NOT)', detail: '与非运算 - 常闭触点', insertText: 'AN    ${1:地址}', kind: 'keyword', confidence: 0.92 },
    { id: 'sc-004', label: 'O (OR)', detail: '或运算 - 并联常开', insertText: 'O     ${1:地址}', kind: 'keyword', confidence: 0.92 },
    { id: 'sc-005', label: 'ON (OR NOT)', detail: '或非运算 - 并联常闭', insertText: 'ON    ${1:地址}', kind: 'keyword', confidence: 0.92 },
    { id: 'sc-006', label: '= (赋值)', detail: '输出线圈赋值', insertText: '=     ${1:输出地址}', kind: 'keyword', confidence: 0.90 },
    { id: 'sc-007', label: 'CALL', detail: '调用功能块', insertText: 'CALL  ${1:FB名称}\n    ${2:参数列表}\n', kind: 'function', confidence: 0.88 },
    { id: 'sc-008', label: 'IF THEN END_IF', detail: '条件语句块', insertText: 'IF ${1:条件} THEN\n    ${2:语句}\nEND_IF;', kind: 'snippet', confidence: 0.85 },
    { id: 'sc-009', label: 'FOR DO END_FOR', detail: '循环语句块', insertText: 'FOR ${1:变量} := ${2:起始值} TO ${3:结束值} DO\n    ${4:语句}\nEND_FOR;', kind: 'snippet', confidence: 0.85 },
    { id: 'sc-010', label: 'CASE OF END_CASE', detail: '多分支选择', insertText: 'CASE ${1:变量} OF\n    ${2:值1}: ${3:语句}\nELSE\n    ${4:默认语句}\nEND_CASE;', kind: 'snippet', confidence: 0.82 },
    { id: 'sc-011', label: 'RISING', detail: '上升沿检测', insertText: 'RISING(${1:输入})', kind: 'function', confidence: 0.80 },
    { id: 'sc-012', label: 'FALLING', detail: '下降沿检测', insertText: 'FALLING(${1:输入})', kind: 'function', confidence: 0.80 },
    { id: 'sc-013', label: 'TON', detail: '接通延时定时器', insertText: '#${1:定时器}.IN := ${2:输入};\n#${1:定时器}.PT := ${3:时间};', kind: 'snippet', confidence: 0.78 },
    { id: 'sc-014', label: 'TOF', detail: '断开延时定时器', insertText: '#${1:定时器}.IN := ${2:输入};\n#${1:定时器}.PT := ${3:时间};', kind: 'snippet', confidence: 0.78 },
    { id: 'sc-015', label: 'LIMIT', detail: '限值函数', insertText: 'LIMIT(MN := ${1:最小值}, IN := ${2:输入}, MX := ${3:最大值})', kind: 'function', confidence: 0.75 },
  ],
  mitsubishi: [
    { id: 'mc-001', label: 'LD', detail: '取指令 - 常开触点', insertText: 'LD ${1:地址}', kind: 'keyword', confidence: 0.95 },
    { id: 'mc-002', label: 'LDI', detail: '取反指令 - 常闭触点', insertText: 'LDI ${1:地址}', kind: 'keyword', confidence: 0.92 },
    { id: 'mc-003', label: 'AND', detail: '与指令', insertText: 'AND ${1:地址}', kind: 'keyword', confidence: 0.92 },
    { id: 'mc-004', label: 'ANI', detail: '与非指令', insertText: 'ANI ${1:地址}', kind: 'keyword', confidence: 0.92 },
    { id: 'mc-005', label: 'OR', detail: '或指令', insertText: 'OR ${1:地址}', kind: 'keyword', confidence: 0.92 },
    { id: 'mc-006', label: 'ORI', detail: '或非指令', insertText: 'ORI ${1:地址}', kind: 'keyword', confidence: 0.92 },
    { id: 'mc-007', label: 'OUT', detail: '输出指令', insertText: 'OUT ${1:输出地址}', kind: 'keyword', confidence: 0.90 },
    { id: 'mc-008', label: 'SET', detail: '置位指令', insertText: 'SET ${1:地址}', kind: 'keyword', confidence: 0.88 },
    { id: 'mc-009', label: 'RST', detail: '复位指令', insertText: 'RST ${1:地址}', kind: 'keyword', confidence: 0.88 },
    { id: 'mc-010', label: 'MOV', detail: '传送指令', insertText: 'MOV ${1:源} ${2:目标}', kind: 'function', confidence: 0.85 },
    { id: 'mc-011', label: 'ADD', detail: '加法指令', insertText: 'ADD ${1:源1} ${2:源2} ${3:目标}', kind: 'function', confidence: 0.82 },
    { id: 'mc-012', label: 'SUB', detail: '减法指令', insertText: 'SUB ${1:源1} ${2:源2} ${3:目标}', kind: 'function', confidence: 0.82 },
    { id: 'mc-013', label: 'TMR', detail: '定时器', insertText: 'TMR T${1:定时器号} K${2:设定值}', kind: 'snippet', confidence: 0.78 },
    { id: 'mc-014', label: 'CNT', detail: '计数器', insertText: 'CNT C${1:计数器号} K${2:设定值}', kind: 'snippet', confidence: 0.78 },
    { id: 'mc-015', label: 'CALL', detail: '调用子程序', insertText: 'CALL P${1:子程序号}', kind: 'function', confidence: 0.75 },
  ],
  omron: [
    { id: 'oc-001', label: 'LD', detail: '装载指令', insertText: 'LD ${1:地址}', kind: 'keyword', confidence: 0.95 },
    { id: 'oc-002', label: 'LD NOT', detail: '装载非指令', insertText: 'LD NOT ${1:地址}', kind: 'keyword', confidence: 0.92 },
    { id: 'oc-003', label: 'AND', detail: '与指令', insertText: 'AND ${1:地址}', kind: 'keyword', confidence: 0.92 },
    { id: 'oc-004', label: 'AND NOT', detail: '与非指令', insertText: 'AND NOT ${1:地址}', kind: 'keyword', confidence: 0.92 },
    { id: 'oc-005', label: 'OR', detail: '或指令', insertText: 'OR ${1:地址}', kind: 'keyword', confidence: 0.92 },
    { id: 'oc-006', label: 'OUT', detail: '输出指令', insertText: 'OUT ${1:输出地址}', kind: 'keyword', confidence: 0.90 },
    { id: 'oc-007', label: 'TIM', detail: '定时器', insertText: 'TIM ${1:定时器号} ${2:设定值}', kind: 'snippet', confidence: 0.85 },
    { id: 'oc-008', label: 'CNT', detail: '计数器', insertText: 'CNT ${1:计数器号} ${2:设定值}', kind: 'snippet', confidence: 0.85 },
    { id: 'oc-009', label: 'MOV', detail: '传送指令', insertText: 'MOV ${1:源} ${2:目标}', kind: 'function', confidence: 0.82 },
  ],
  delta: [
    { id: 'dc-001', label: 'LD', detail: '取指令', insertText: 'LD ${1:地址}', kind: 'keyword', confidence: 0.95 },
    { id: 'dc-002', label: 'LDI', detail: '取反指令', insertText: 'LDI ${1:地址}', kind: 'keyword', confidence: 0.92 },
    { id: 'dc-003', label: 'AND', detail: '与指令', insertText: 'AND ${1:地址}', kind: 'keyword', confidence: 0.92 },
    { id: 'dc-004', label: 'ANI', detail: '与非指令', insertText: 'ANI ${1:地址}', kind: 'keyword', confidence: 0.92 },
    { id: 'dc-005', label: 'OR', detail: '或指令', insertText: 'OR ${1:地址}', kind: 'keyword', confidence: 0.92 },
    { id: 'dc-006', label: 'OUT', detail: '输出指令', insertText: 'OUT ${1:输出地址}', kind: 'keyword', confidence: 0.90 },
    { id: 'dc-007', label: 'MOV', detail: '传送指令', insertText: 'MOV ${1:源} ${2:目标}', kind: 'function', confidence: 0.85 },
    { id: 'dc-008', label: 'TMR', detail: '定时器', insertText: 'TMR T${1:定时器号} K${2:设定值}', kind: 'snippet', confidence: 0.82 },
  ],
};

const logicRecommendations: Record<DeviceType, LogicRecommendation[]> = {
  threeColorLight: [
    { id: 'lr-001', title: '标准三色灯状态指示', description: '红黄绿三色灯，故障优先，运行/待机状态指示', logicType: 'status_indicator', confidence: 0.92 },
    { id: 'lr-002', title: '闪烁报警灯控制', description: '故障时红灯闪烁，蜂鸣器同步', logicType: 'blink_alarm', confidence: 0.85 },
  ],
  button: [
    { id: 'lr-003', title: '按钮输入防抖', description: '软件消抖处理，防止误触发', logicType: 'debounce', confidence: 0.95 },
    { id: 'lr-004', title: '按钮自锁逻辑', description: '按一次启动，再按一次停止', logicType: 'toggle', confidence: 0.88 },
  ],
  sensor: [
    { id: 'lr-005', title: '传感器信号滤波', description: '数字滤波，消除干扰', logicType: 'filter', confidence: 0.90 },
    { id: 'lr-006', title: '产品计数逻辑', description: '检测到产品时计数', logicType: 'counter', confidence: 0.85 },
  ],
  actuator: [
    { id: 'lr-007', title: '执行器启停控制', description: '标准启停逻辑，带状态反馈', logicType: 'start_stop', confidence: 0.92 },
  ],
  motor: [
    { id: 'lr-008', title: '电机启停控制', description: '自锁+停止+过载保护', logicType: 'motor_control', templateId: 'tpl-001', confidence: 0.95 },
    { id: 'lr-009', title: '电机正反转控制', description: '正反转互锁控制', logicType: 'forward_reverse', confidence: 0.88 },
    { id: 'lr-010', title: '电机星三角启动', description: '降压启动控制', logicType: 'star_delta', confidence: 0.80 },
  ],
  valve: [
    { id: 'lr-011', title: '标准气缸控制', description: '单线圈控制，带到位检测和超时报警', logicType: 'cylinder_control', templateId: 'tpl-003', confidence: 0.93 },
    { id: 'lr-012', title: '双线圈气缸控制', description: '双电磁阀控制，记忆位置', logicType: 'double_coil', confidence: 0.85 },
  ],
};

const nlpTemplateMap: { keywords: string[]; suggestion: NlpPlcSuggestion }[] = [
  {
    keywords: ['电机', '启动', '停止', 'motor', 'start', 'stop'],
    suggestion: {
      id: 'nlp-001',
      title: '电机启停控制逻辑',
      description: '标准电机启停控制，包含自锁、停止按钮和过载保护',
      code: `// 电机启停控制
NETWORK 1: 电机启停逻辑
    LDX     #startButton
    OR      #runLatch
    ANX     #stopButton
    ANX     #overload
    =       #runLatch

    #motorOutput := #runLatch;
    #faultOutput := #overload;`,
      language: 'structured_text',
      confidence: 0.92,
      relatedTemplates: ['tpl-001'],
    },
  },
  {
    keywords: ['气缸', '电磁阀', 'cylinder', 'valve'],
    suggestion: {
      id: 'nlp-002',
      title: '气缸控制逻辑',
      description: '单线圈气缸控制，带到位检测和超时报警',
      code: `// 气缸控制功能块
// 单线圈控制，带到位检测和超时报警

IF #extendCmd AND NOT #retractCmd AND #retractSensor THEN
    #extendOutput := TRUE;
END_IF;

IF #retractCmd OR #extendSensor THEN
    #extendOutput := FALSE;
END_IF;

// 超时检测
#actionTimer.IN := #extendCmd AND NOT #extendSensor;
#actionTimer.PT := #timeout;

IF #actionTimer.Q THEN
    #timeoutFault := TRUE;
END_IF;`,
      language: 'structured_text',
      confidence: 0.88,
      relatedTemplates: ['tpl-003'],
    },
  },
  {
    keywords: ['三色灯', '指示灯', '状态', 'three color', 'light'],
    suggestion: {
      id: 'nlp-003',
      title: '三色灯状态控制',
      description: '红黄绿三色灯状态指示，故障优先级最高',
      code: `// 三色灯状态控制
// 优先级：故障 > 运行 > 待机

// 红灯：故障状态
#redLight := #faultSignal;

// 绿灯：无故障且运行中
#greenLight := NOT #faultSignal AND #runSignal;

// 黄灯：无故障且待机
#yellowLight := NOT #faultSignal AND NOT #runSignal;`,
      language: 'structured_text',
      confidence: 0.90,
      relatedTemplates: ['tpl-002'],
    },
  },
  {
    keywords: ['PID', '温度', '恒温', '控制', 'temperature'],
    suggestion: {
      id: 'nlp-004',
      title: 'PID温度控制',
      description: 'PID温度调节控制，带积分限幅和输出限幅',
      code: `// PID控制功能块（简化版）

IF #enable THEN
    #error := #setpoint - #processValue;
    
    // 积分项
    #integral := #integral + #error * #ki * #cycleTime;
    #integral := LIMIT(-50, #integral, 50);
    
    // 微分项
    #derivative := (#error - #lastError) / #cycleTime * #kd;
    
    // PID输出
    #output := #kp * #error + #integral + #derivative;
    #output := LIMIT(0, #output, 100);
    
    #lastError := #error;
    #atSetpoint := ABS(#error) < 2.0;
ELSE
    #output := 0;
    #integral := 0;
    #atSetpoint := FALSE;
END_IF;`,
      language: 'structured_text',
      confidence: 0.85,
      relatedTemplates: ['tpl-008'],
    },
  },
  {
    keywords: ['计数', '计数器', 'count', 'counter'],
    suggestion: {
      id: 'nlp-005',
      title: '计数器模块',
      description: '多功能加减计数器，带复位和预置值',
      code: `// 多功能计数器

// 加计数
IF RISING(#countUp) AND NOT #reset THEN
    #currentValue := #currentValue + 1;
END_IF;

// 减计数
IF RISING(#countDown) AND NOT #reset THEN
    #currentValue := #currentValue - 1;
END_IF;

// 复位
IF #reset THEN
    #currentValue := 0;
END_IF;

// 到达预置值
#reached := #currentValue >= #presetValue;

// 下限限制
IF #currentValue < 0 THEN
    #currentValue := 0;
END_IF;`,
      language: 'structured_text',
      confidence: 0.82,
      relatedTemplates: ['tpl-007'],
    },
  },
  {
    keywords: ['模拟量', '滤波', 'analog', 'filter'],
    suggestion: {
      id: 'nlp-006',
      title: '模拟量滤波',
      description: '模拟量信号软件滤波，支持均值和一阶滞后算法',
      code: `// 模拟量滤波功能块

IF #Enable THEN
    // 均值滤波
    #sampleBuffer[#index] := #inputAddress;
    #index := (#index + 1) MOD 10;
    
    #sum := 0;
    FOR #i := 0 TO 9 DO
        #sum := #sum + #sampleBuffer[#i];
    END_FOR;
    
    #outputValue := INT(#sum / 10);
    
    #valid := TRUE;
END_IF;`,
      language: 'structured_text',
      confidence: 0.80,
      relatedTemplates: ['tpl-004'],
    },
  },
  {
    keywords: ['传送带', '输送带', 'conveyor', 'belt'],
    suggestion: {
      id: 'nlp-007',
      title: '传送带控制',
      description: '传送带启停及速度控制，支持多段速',
      code: `// 传送带控制

// 启停控制
A     #startButton
O     #runLatch
AN    #stopButton
=     #runLatch

#motorOutput := #runLatch;

// 速度控制
CASE #speedSelect OF
    0: // 低速
        #speedOutput := 6912;   // 25%
    1: // 中速
        #speedOutput := 13824;  // 50%
    2: // 高速
        #speedOutput := 27648;  // 100%
END_CASE;`,
      language: 'structured_text',
      confidence: 0.85,
      relatedTemplates: ['tpl-009'],
    },
  },
  {
    keywords: ['报警', '异常', 'alarm', 'warning'],
    suggestion: {
      id: 'nlp-008',
      title: '报警管理',
      description: '报警消息管理，支持锁存、确认和历史记录',
      code: `// 报警管理功能块

// 报警检测与锁存
FOR #i := 0 TO (#alarmCount - 1) DO
    IF #alarmSignals[#i] AND NOT #alarmLatched[#i] THEN
        #alarmLatched[#i] := TRUE;
        #alarmTimes[#i] := RD_SYS_T();
    END_IF;
END_FOR;

// 确认报警
IF #acknowledge THEN
    FOR #i := 0 TO (#alarmCount - 1) DO
        IF #alarmLatched[#i] AND NOT #alarmSignals[#i] THEN
            #alarmLatched[#i] := FALSE;
        END_IF;
    END_FOR;
END_IF;

// 活动报警状态
#hasActiveAlarm := OR_OF_ARR(#alarmLatched);

// 蜂鸣器控制
#buzzer := #hasActiveAlarm AND NOT #acknowledged;`,
      language: 'structured_text',
      confidence: 0.78,
      relatedTemplates: ['tpl-010'],
    },
  },
];

export function getCodeCompletions(
  context: string,
  plcBrand: PlcBrand,
  cursorPosition?: { line: number; column: number }
): CodeCompletionSuggestion[] {
  const suggestions = codeCompletionSnippets[plcBrand] || [];
  
  if (!context) {
    return suggestions.slice(0, 10);
  }

  const lowerContext = context.toLowerCase();
  const scored = suggestions.map(s => {
    let score = s.confidence;
    const lowerLabel = s.label.toLowerCase();
    
    if (lowerLabel.startsWith(lowerContext)) {
      score += 0.3;
    } else if (lowerLabel.includes(lowerContext)) {
      score += 0.1;
    }
    
    return { ...s, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .filter(s => s.score > 0.3)
    .slice(0, 15);
}

export function getLogicRecommendations(
  devices: Device[],
  templates?: Template[]
): LogicRecommendation[] {
  const recommendations: LogicRecommendation[] = [];
  const seenTypes = new Set<string>();

  for (const device of devices) {
    if (!seenTypes.has(device.type)) {
      seenTypes.add(device.type);
      const deviceRecs = logicRecommendations[device.type] || [];
      for (const rec of deviceRecs) {
        recommendations.push({
          ...rec,
          applicableDevices: devices.filter(d => d.type === device.type).map(d => d.id),
        });
      }
    }
  }

  return recommendations.sort((a, b) => b.confidence - a.confidence);
}

export function detectAnomalies(project: Project): AnomalyIssue[] {
  const issues: AnomalyIssue[] = [];

  const allIoAddresses = new Set<string>();
  for (const station of project.stations) {
    for (const device of station.devices) {
      for (const io of device.ioPoints) {
        if (allIoAddresses.has(io.address)) {
          issues.push({
            id: `anomaly-${io.id}`,
            type: 'error',
            title: 'IO地址冲突',
            description: `地址 ${io.address} 在多个设备中重复使用`,
            location: `${station.name} / ${device.name} / ${io.name}`,
            suggestion: '请检查并修改重复的IO地址',
            severity: 'high',
          });
        }
        allIoAddresses.add(io.address);
      }
    }
  }

  for (const station of project.stations) {
    const diCount = station.devices.reduce(
      (sum, d) => sum + d.ioPoints.filter(io => io.type === 'DI').length,
      0
    );
    const doCount = station.devices.reduce(
      (sum, d) => sum + d.ioPoints.filter(io => io.type === 'DO').length,
      0
    );

    if (doCount > 0 && diCount === 0) {
      issues.push({
        id: `anomaly-di-${station.id}`,
        type: 'warning',
        title: '缺少输入信号',
        description: `${station.name} 有 ${doCount} 个输出点，但没有输入点`,
        location: station.name,
        suggestion: '建议添加必要的反馈和状态检测输入',
        severity: 'medium',
      });
    }

    const hasMotor = station.devices.some(d => d.type === 'motor');
    const hasOverload = station.devices.some(d => 
      d.ioPoints.some(io => io.name.includes('过载') || io.name.includes('故障') || io.name.includes('热继'))
    );
    if (hasMotor && !hasOverload) {
      issues.push({
        id: `anomaly-overload-${station.id}`,
        type: 'warning',
        title: '电机缺少过载保护',
        description: `${station.name} 有电机设备，但未检测到过载/故障输入`,
        location: station.name,
        suggestion: '建议添加热继电器过载保护输入',
        severity: 'medium',
      });
    }
  }

  if (project.stations.length === 0) {
    issues.push({
      id: 'anomaly-no-station',
      type: 'info',
      title: '项目为空',
      description: '项目中没有任何工位',
      suggestion: '添加至少一个工位以开始设计',
      severity: 'low',
    });
  }

  return issues.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

export function nlpToPlcLogic(
  naturalLanguage: string,
  plcBrand?: PlcBrand
): NlpPlcSuggestion[] {
  if (!naturalLanguage || naturalLanguage.trim().length === 0) {
    return [];
  }

  const lowerText = naturalLanguage.toLowerCase();
  const results: { suggestion: NlpPlcSuggestion; matchScore: number }[] = [];

  for (const item of nlpTemplateMap) {
    let matchCount = 0;
    for (const keyword of item.keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }
    
    if (matchCount > 0) {
      const matchScore = matchCount / item.keywords.length;
      results.push({
        suggestion: {
          ...item.suggestion,
          confidence: item.suggestion.confidence * (0.5 + matchScore * 0.5),
        },
        matchScore,
      });
    }
  }

  if (results.length === 0) {
    results.push({
      suggestion: {
        id: 'nlp-default',
        title: '通用逻辑模板',
        description: '基于您的描述生成的通用逻辑框架，请根据实际需求调整',
        code: `// 根据描述生成的逻辑框架
// 请根据实际需求修改以下代码

NETWORK 1: 主逻辑
    // 在此处添加您的逻辑
    // 输入: 请定义输入信号
    // 输出: 请定义输出信号
    // 逻辑: 请描述控制逻辑`,
        language: 'structured_text',
        confidence: 0.5,
      },
      matchScore: 0,
    });
  }

  return results
    .sort((a, b) => b.matchScore - a.matchScore)
    .map(r => r.suggestion);
}

export function generateRecommendations(
  project: Project,
  templates: Template[]
): AiRecommendation[] {
  const recommendations: AiRecommendation[] = [];
  let recId = 0;

  const anomalies = detectAnomalies(project);
  for (const issue of anomalies) {
    recommendations.push({
      id: `rec-${++recId}`,
      type: 'optimization',
      title: issue.title,
      description: issue.description,
      source: 'ai',
      confidence: issue.severity === 'high' ? 0.95 : issue.severity === 'medium' ? 0.8 : 0.6,
      createdAt: new Date().toISOString(),
      metadata: {
        severity: issue.severity,
        location: issue.location,
        suggestion: issue.suggestion,
      },
      actions: [
        {
          id: `action-${recId}-1`,
          label: '查看详情',
          type: 'view',
        },
      ],
    });
  }

  const allDevices = project.stations.flatMap(s => s.devices);
  const logicRecs = getLogicRecommendations(allDevices, templates);
  
  for (const rec of logicRecs.slice(0, 5)) {
    recommendations.push({
      id: `rec-${++recId}`,
      type: 'module',
      title: rec.title,
      description: rec.description,
      source: 'ai',
      confidence: rec.confidence,
      createdAt: new Date().toISOString(),
      targetId: rec.templateId,
      targetType: 'template',
      metadata: {
        logicType: rec.logicType,
        applicableDevices: rec.applicableDevices,
      },
      actions: [
        {
          id: `action-${recId}-1`,
          label: '应用模板',
          type: 'apply',
          actionData: { templateId: rec.templateId },
        },
      ],
    });
  }

  const deviceCount = allDevices.length;
  const moduleCount = project.stations.flatMap(s => s.modules).length;
  
  if (deviceCount > 0 && moduleCount < deviceCount * 0.5) {
    recommendations.push({
      id: `rec-${++recId}`,
      title: '建议添加控制模块',
      description: `您有 ${deviceCount} 个设备，但只有 ${moduleCount} 个控制模块，建议为设备添加对应的控制逻辑`,
      type: 'bestPractice',
      source: 'ai',
      confidence: 0.75,
      createdAt: new Date().toISOString(),
      actions: [
        {
          id: `action-${recId}-1`,
          label: '浏览模板库',
          type: 'view',
        },
      ],
    });
  }

  return recommendations.sort((a, b) => b.confidence - a.confidence);
}

export interface AiEngine {
  getCodeCompletions: typeof getCodeCompletions;
  getLogicRecommendations: typeof getLogicRecommendations;
  detectAnomalies: typeof detectAnomalies;
  nlpToPlcLogic: typeof nlpToPlcLogic;
  generateRecommendations: typeof generateRecommendations;
}

export function createAiEngine(): AiEngine {
  return {
    getCodeCompletions,
    getLogicRecommendations,
    detectAnomalies,
    nlpToPlcLogic,
    generateRecommendations,
  };
}

export const aiEngine = createAiEngine();
export default aiEngine;
