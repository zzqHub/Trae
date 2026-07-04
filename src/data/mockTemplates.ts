import type { Template } from '../types/template';

export const mockTemplates: Template[] = [
  {
    id: 'tpl-001',
    name: '电机启停控制',
    description: '标准电机启停控制逻辑，包含自锁、互锁、过载保护',
    category: 'module',
    moduleType: 'FB',
    plcBrands: ['siemens', 'mitsubishi', 'omron', 'delta'],
    variables: [
      { id: 'var-1', name: 'startInput', label: '启动输入', type: 'ioAddress', description: '启动按钮地址', required: true, defaultValue: 'I0.0', placeholder: '例如: I0.0' },
      { id: 'var-2', name: 'stopInput', label: '停止输入', type: 'ioAddress', description: '停止按钮地址', required: true, defaultValue: 'I0.1', placeholder: '例如: I0.1' },
      { id: 'var-3', name: 'output', label: '电机输出', type: 'ioAddress', description: '电机接触器输出', required: true, defaultValue: 'Q0.0', placeholder: '例如: Q0.0' },
      { id: 'var-4', name: 'hasOverload', label: '过载保护', type: 'boolean', description: '是否使用过载保护', required: false, defaultValue: false },
      { id: 'var-5', name: 'overloadInput', label: '过载输入', type: 'ioAddress', description: '热继电器输入', required: false, defaultValue: 'I0.2', placeholder: '例如: I0.2' },
    ],
    content: {
      code: `// 电机启停控制
// 启动自锁 + 停止按钮 + 过载保护

NETWORK 1: 电机启停控制
    LDX     #startInput
    OR      #runLatch
    ANX     #stopInput
    {{if hasOverload}}
    ANX     #overloadInput
    {{/if}}
    =       #runLatch

    #output := #runLatch;`,
      variables: {
        startInput: '启动输入地址',
        stopInput: '停止输入地址',
        output: '输出地址',
        runLatch: '内部锁存位',
      },
      ioMappings: [
        { variableName: 'startInput', ioType: 'DI', defaultAddress: 'I0.0' },
        { variableName: 'stopInput', ioType: 'DI', defaultAddress: 'I0.1' },
        { variableName: 'output', ioType: 'DO', defaultAddress: 'Q0.0' },
      ],
    },
    preview: '电机启停控制模块，支持自锁和过载保护',
    createdAt: '2025-06-15T10:00:00Z',
    updatedAt: '2026-03-20T14:30:00Z',
    usageCount: 128,
    author: 'PLC_Library',
  },
  {
    id: 'tpl-002',
    name: '三色灯状态指示',
    description: '三色警示灯状态控制，支持运行、待机、故障三种状态',
    category: 'module',
    moduleType: 'FC',
    plcBrands: ['siemens', 'mitsubishi', 'omron'],
    variables: [
      { id: 'var-6', name: 'faultSignal', label: '故障信号', type: 'ioAddress', description: '系统故障输入', required: true, defaultValue: 'M0.0', placeholder: '例如: M0.0' },
      { id: 'var-7', name: 'runSignal', label: '运行信号', type: 'ioAddress', description: '系统运行信号', required: true, defaultValue: 'M0.1', placeholder: '例如: M0.1' },
      { id: 'var-8', name: 'redLight', label: '红灯输出', type: 'ioAddress', description: '红色灯输出', required: true, defaultValue: 'Q0.0', placeholder: '例如: Q0.0' },
      { id: 'var-9', name: 'yellowLight', label: '黄灯输出', type: 'ioAddress', description: '黄色灯输出', required: true, defaultValue: 'Q0.1', placeholder: '例如: Q0.1' },
      { id: 'var-10', name: 'greenLight', label: '绿灯输出', type: 'ioAddress', description: '绿色灯输出', required: true, defaultValue: 'Q0.2', placeholder: '例如: Q0.2' },
    ],
    content: {
      code: `// 三色灯状态控制
// 优先级：故障 > 运行 > 待机

// 红灯：故障状态
#redLight := #faultSignal;

// 绿灯：无故障且运行中
#greenLight := NOT #faultSignal AND #runSignal;

// 黄灯：无故障且待机
#yellowLight := NOT #faultSignal AND NOT #runSignal;`,
      ioMappings: [
        { variableName: 'redLight', ioType: 'DO', defaultAddress: 'Q0.0' },
        { variableName: 'yellowLight', ioType: 'DO', defaultAddress: 'Q0.1' },
        { variableName: 'greenLight', ioType: 'DO', defaultAddress: 'Q0.2' },
      ],
    },
    preview: '红黄绿三色灯状态指示模块',
    createdAt: '2025-07-10T09:00:00Z',
    updatedAt: '2026-01-15T11:20:00Z',
    usageCount: 256,
    author: 'Auto_Engineer',
  },
  {
    id: 'tpl-003',
    name: '标准气缸控制',
    description: '单线圈气缸控制，带到位检测和超时报警',
    category: 'module',
    moduleType: 'FB',
    plcBrands: ['siemens', 'mitsubishi', 'omron', 'delta'],
    variables: [
      { id: 'var-11', name: 'extendCmd', label: '伸出命令', type: 'ioAddress', description: '气缸伸出命令', required: true, defaultValue: 'M0.0' },
      { id: 'var-12', name: 'retractCmd', label: '缩回命令', type: 'ioAddress', description: '气缸缩回命令', required: true, defaultValue: 'M0.1' },
      { id: 'var-13', name: 'extendOutput', label: '伸出输出', type: 'ioAddress', description: '电磁阀输出', required: true, defaultValue: 'Q0.0' },
      { id: 'var-14', name: 'extendSensor', label: '伸出到位', type: 'ioAddress', description: '伸出到位传感器', required: true, defaultValue: 'I0.0' },
      { id: 'var-15', name: 'retractSensor', label: '缩回到位', type: 'ioAddress', description: '缩回到位传感器', required: true, defaultValue: 'I0.1' },
      { id: 'var-16', name: 'timeout', label: '超时时间', type: 'number', description: '动作超时时间(ms)', required: false, defaultValue: 2000 },
    ],
    content: {
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
      ioMappings: [
        { variableName: 'extendOutput', ioType: 'DO', defaultAddress: 'Q0.0' },
        { variableName: 'extendSensor', ioType: 'DI', defaultAddress: 'I0.0' },
        { variableName: 'retractSensor', ioType: 'DI', defaultAddress: 'I0.1' },
      ],
    },
    preview: '标准单线圈气缸控制模块',
    createdAt: '2025-08-20T14:00:00Z',
    updatedAt: '2026-04-10T09:30:00Z',
    usageCount: 189,
    author: 'Pneumatic_Pro',
  },
  {
    id: 'tpl-004',
    name: '模拟量滤波',
    description: '模拟量信号软件滤波，支持均值、一阶滞后算法',
    category: 'module',
    moduleType: 'FB',
    plcBrands: ['siemens', 'mitsubishi'],
    variables: [
      { id: 'var-17', name: 'inputAddress', label: '输入地址', type: 'ioAddress', description: '模拟量输入地址', required: true, defaultValue: 'IW256' },
      { id: 'var-18', name: 'filterType', label: '滤波类型', type: 'enum', description: '选择滤波算法', required: true, defaultValue: 'average', options: [{ label: '均值滤波', value: 'average' }, { label: '一阶滞后', value: 'first_order' }] },
      { id: 'var-19', name: 'filterStrength', label: '滤波强度', type: 'number', description: '滤波强度 1-10', required: false, defaultValue: 5 },
      { id: 'var-20', name: 'outputValue', label: '输出值', type: 'number', description: '滤波后输出值', required: false, defaultValue: 0 },
    ],
    content: {
      code: `// 模拟量滤波功能块

IF #Enable THEN
    {{if filterType === 'average'}}
    // 均值滤波
    #sampleBuffer[#index] := #inputAddress;
    #index := (#index + 1) MOD 10;
    
    #sum := 0;
    FOR #i := 0 TO 9 DO
        #sum := #sum + #sampleBuffer[#i];
    END_FOR;
    
    #outputValue := INT(#sum / 10);
    {{else}}
    // 一阶滞后滤波
    #alpha := 0.1 + (#filterStrength * 0.09);
    #firstOrder := #firstOrder + #alpha * (REAL(#inputAddress) - #firstOrder);
    #outputValue := INT(#firstOrder);
    {{/if}}
    
    #valid := TRUE;
END_IF;`,
      ioMappings: [
        { variableName: 'inputAddress', ioType: 'AI', defaultAddress: 'IW256' },
      ],
    },
    preview: '模拟量信号滤波处理模块',
    createdAt: '2025-09-15T11:00:00Z',
    updatedAt: '2026-05-20T16:45:00Z',
    usageCount: 92,
    author: 'Analog_Specialist',
  },
  {
    id: 'tpl-005',
    name: '按钮输入防抖',
    description: '数字量输入防抖消抖处理，防止误触发',
    category: 'module',
    moduleType: 'FB',
    plcBrands: ['siemens', 'mitsubishi', 'omron', 'delta'],
    variables: [
      { id: 'var-21', name: 'inputAddr', label: '输入地址', type: 'ioAddress', description: '原始输入地址', required: true, defaultValue: 'I0.0' },
      { id: 'var-22', name: 'debounceTime', label: '防抖时间', type: 'number', description: '防抖时间(ms)', required: false, defaultValue: 20 },
      { id: 'var-23', name: 'output', label: '防抖输出', type: 'boolean', description: '防抖后输出', required: false, defaultValue: false },
    ],
    content: {
      code: `// 输入防抖功能块

#debounceTimer.IN := #inputAddr;
#debounceTimer.PT := #debounceTime;

IF #debounceTimer.Q THEN
    #output := TRUE;
ELSIF NOT #inputAddr THEN
    #output := FALSE;
END_IF;`,
      ioMappings: [
        { variableName: 'inputAddr', ioType: 'DI', defaultAddress: 'I0.0' },
      ],
    },
    preview: '数字量输入防抖消抖模块',
    createdAt: '2025-10-05T10:30:00Z',
    updatedAt: '2026-02-28T13:20:00Z',
    usageCount: 145,
    author: 'DI_Consistent',
  },
  {
    id: 'tpl-006',
    name: 'Modbus RTU通信',
    description: 'Modbus RTU主站通信功能块，支持读写寄存器',
    category: 'module',
    moduleType: 'FB',
    plcBrands: ['siemens', 'delta'],
    variables: [
      { id: 'var-24', name: 'slaveAddress', label: '从站地址', type: 'number', description: 'Modbus从站地址 1-247', required: true, defaultValue: 1 },
      { id: 'var-25', name: 'baudRate', label: '波特率', type: 'enum', description: '通信波特率', required: true, defaultValue: '9600', options: [{ label: '9600', value: '9600' }, { label: '19200', value: '19200' }, { label: '38400', value: '38400' }, { label: '115200', value: '115200' }] },
      { id: 'var-26', name: 'functionCode', label: '功能码', type: 'enum', description: 'Modbus功能码', required: true, defaultValue: '03', options: [{ label: '03-读保持寄存器', value: '03' }, { label: '06-写单个寄存器', value: '06' }, { label: '16-写多个寄存器', value: '16' }] },
      { id: 'var-27', name: 'startAddress', label: '起始地址', type: 'number', description: '寄存器起始地址', required: true, defaultValue: 0 },
      { id: 'var-28', name: 'dataLength', label: '数据长度', type: 'number', description: '寄存器数量', required: true, defaultValue: 10 },
    ],
    content: {
      code: `// Modbus RTU 主站通信功能块

CASE #state OF
    0: // 空闲
        IF #execute THEN
            #state := 10;
        END_IF;
    
    10: // 发送请求
        #mbMaster.REQ := TRUE;
        #mbMaster.MB_ADDR := #slaveAddress;
        #mbMaster.MODE := #functionCode;
        #mbMaster.DATA_ADDR := #startAddress;
        #mbMaster.DATA_LEN := #dataLength;
        #state := 20;
    
    20: // 等待响应
        IF #mbMaster.DONE THEN
            #done := TRUE;
            #state := 30;
        ELSIF #mbMaster.ERROR THEN
            #error := TRUE;
            #errorID := #mbMaster.STATUS;
            #state := 30;
        END_IF;
    
    30: // 完成
        #mbMaster.REQ := FALSE;
        IF NOT #execute THEN
            #state := 0;
        END_IF;
END_CASE;`,
      variables: {
        done: '完成标志',
        error: '错误标志',
        errorID: '错误代码',
      },
    },
    preview: 'Modbus RTU通信功能块',
    createdAt: '2025-05-20T13:00:00Z',
    updatedAt: '2026-06-01T15:40:00Z',
    usageCount: 156,
    author: 'Comm_Guru',
  },
  {
    id: 'tpl-007',
    name: '计数器模块',
    description: '多功能计数器，支持加计数、减计数、加/减计数',
    category: 'module',
    moduleType: 'FB',
    plcBrands: ['siemens', 'mitsubishi', 'omron'],
    variables: [
      { id: 'var-29', name: 'countUp', label: '加计数脉冲', type: 'ioAddress', description: '加计数输入脉冲', required: false, defaultValue: 'I0.0' },
      { id: 'var-30', name: 'countDown', label: '减计数脉冲', type: 'ioAddress', description: '减计数输入脉冲', required: false, defaultValue: 'I0.1' },
      { id: 'var-31', name: 'reset', label: '复位', type: 'ioAddress', description: '计数器复位', required: true, defaultValue: 'I0.2' },
      { id: 'var-32', name: 'presetValue', label: '预置值', type: 'number', description: '计数预置值', required: false, defaultValue: 1000 },
      { id: 'var-33', name: 'currentValue', label: '当前值', type: 'number', description: '当前计数值', required: false, defaultValue: 0 },
    ],
    content: {
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
      ioMappings: [
        { variableName: 'countUp', ioType: 'DI', defaultAddress: 'I0.0' },
        { variableName: 'countDown', ioType: 'DI', defaultAddress: 'I0.1' },
        { variableName: 'reset', ioType: 'DI', defaultAddress: 'I0.2' },
      ],
    },
    preview: '多功能加减计数器模块',
    createdAt: '2025-07-25T09:00:00Z',
    updatedAt: '2026-03-18T10:15:00Z',
    usageCount: 110,
    author: 'Counter_Pro',
  },
  {
    id: 'tpl-008',
    name: 'PID温度控制',
    description: 'PID温度调节控制，带自整定功能',
    category: 'module',
    moduleType: 'FB',
    plcBrands: ['siemens', 'mitsubishi'],
    variables: [
      { id: 'var-34', name: 'setpoint', label: '设定值', type: 'number', description: '温度设定值(°C)', required: true, defaultValue: 150 },
      { id: 'var-35', name: 'processValue', label: '反馈值', type: 'ioAddress', description: '温度反馈地址', required: true, defaultValue: 'IW256' },
      { id: 'var-36', name: 'kp', label: '比例系数', type: 'number', description: '比例增益P', required: false, defaultValue: 2.0 },
      { id: 'var-37', name: 'ki', label: '积分系数', type: 'number', description: '积分时间I', required: false, defaultValue: 0.5 },
      { id: 'var-38', name: 'kd', label: '微分系数', type: 'number', description: '微分时间D', required: false, defaultValue: 0.1 },
      { id: 'var-39', name: 'output', label: '输出值', type: 'number', description: 'PID输出(0-100%)', required: false, defaultValue: 0 },
    ],
    content: {
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
      ioMappings: [
        { variableName: 'processValue', ioType: 'AI', defaultAddress: 'IW256' },
      ],
    },
    preview: 'PID温度调节控制模块',
    createdAt: '2025-11-10T14:30:00Z',
    updatedAt: '2026-04-25T11:00:00Z',
    usageCount: 78,
    author: 'Temp_Control',
  },
  {
    id: 'tpl-009',
    name: '传送带控制',
    description: '传送带启停及速度控制，支持多段速',
    category: 'station',
    plcBrands: ['siemens', 'mitsubishi', 'omron'],
    variables: [
      { id: 'var-40', name: 'startButton', label: '启动按钮', type: 'ioAddress', description: '启动按钮地址', required: true, defaultValue: 'I0.0' },
      { id: 'var-41', name: 'stopButton', label: '停止按钮', type: 'ioAddress', description: '停止按钮地址', required: true, defaultValue: 'I0.1' },
      { id: 'var-42', name: 'motorOutput', label: '电机输出', type: 'ioAddress', description: '电机接触器输出', required: true, defaultValue: 'Q0.0' },
      { id: 'var-43', name: 'speedSelect', label: '速度选择', type: 'enum', description: '速度档位选择', required: false, defaultValue: 'low', options: [{ label: '低速', value: 'low' }, { label: '中速', value: 'mid' }, { label: '高速', value: 'high' }] },
      { id: 'var-44', name: 'speedOutput', label: '速度输出', type: 'ioAddress', description: '模拟量速度输出', required: false, defaultValue: 'QW256' },
    ],
    content: {
      code: `// 传送带控制

// 启停控制
A     #startButton
O     #runLatch
AN    #stopButton
=     #runLatch

#motorOutput := #runLatch;

// 速度控制
{{if speedSelect === 'low'}}
#speedOutput := 6912;   // 25%
{{elif speedSelect === 'mid'}}
#speedOutput := 13824;  // 50%
{{else}}
#speedOutput := 27648;  // 100%
{{/if}}`,
      ioMappings: [
        { variableName: 'motorOutput', ioType: 'DO', defaultAddress: 'Q0.0' },
        { variableName: 'speedOutput', ioType: 'AO', defaultAddress: 'QW256' },
      ],
    },
    preview: '传送带启停及多段速控制模块',
    createdAt: '2025-12-01T10:00:00Z',
    updatedAt: '2026-05-15T14:20:00Z',
    usageCount: 105,
    author: 'Conveyor_Spec',
  },
  {
    id: 'tpl-010',
    name: '报警管理',
    description: '报警消息管理，支持报警锁存、确认、历史记录',
    category: 'module',
    moduleType: 'FB',
    plcBrands: ['siemens', 'mitsubishi'],
    variables: [
      { id: 'var-45', name: 'alarmCount', label: '报警数量', type: 'number', description: '报警点数量', required: false, defaultValue: 8 },
      { id: 'var-46', name: 'acknowledge', label: '确认信号', type: 'ioAddress', description: '报警确认按钮', required: true, defaultValue: 'I0.0' },
      { id: 'var-47', name: 'buzzer', label: '蜂鸣器输出', type: 'ioAddress', description: '报警蜂鸣器', required: false, defaultValue: 'Q0.0' },
      { id: 'var-48', name: 'hasActiveAlarm', label: '有活动报警', type: 'boolean', description: '是否有活动报警', required: false, defaultValue: false },
    ],
    content: {
      code: `// 报警管理功能块

// 报警检测与锁存
FOR #i := 0 TO (#alarmCount - 1) DO
    IF #alarmSignals[#i] AND NOT #alarmLatched[#i] THEN
        #alarmLatched[#i] := TRUE;
        #alarmTimes[#i] := RD_SYS_T();
        // 记录历史
        #history[#historyIndex].id := #i;
        #history[#historyIndex].time := RD_SYS_T();
        #history[#historyIndex].type := 0; // 产生
        #historyIndex := (#historyIndex + 1) MOD 100;
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
      ioMappings: [
        { variableName: 'buzzer', ioType: 'DO', defaultAddress: 'Q0.0' },
      ],
    },
    preview: '报警消息锁存与确认管理模块',
    createdAt: '2025-08-12T11:30:00Z',
    updatedAt: '2026-03-30T09:45:00Z',
    usageCount: 134,
    author: 'Alarm_Manager',
  },
  {
    id: 'tpl-011',
    name: '伺服定位控制',
    description: '伺服电机位置控制，支持回原点、绝对定位、相对定位',
    category: 'module',
    moduleType: 'FB',
    plcBrands: ['siemens', 'mitsubishi', 'omron'],
    variables: [
      { id: 'var-49', name: 'axisNo', label: '轴号', type: 'number', description: '伺服轴号', required: true, defaultValue: 1 },
      { id: 'var-50', name: 'homeCmd', label: '回原点命令', type: 'boolean', description: '触发回原点', required: false, defaultValue: false },
      { id: 'var-51', name: 'absolutePos', label: '绝对定位命令', type: 'boolean', description: '绝对定位触发', required: false, defaultValue: false },
      { id: 'var-52', name: 'targetPosition', label: '目标位置', type: 'number', description: '目标位置(pulse)', required: false, defaultValue: 10000 },
      { id: 'var-53', name: 'targetSpeed', label: '目标速度', type: 'number', description: '运行速度(pulse/s)', required: false, defaultValue: 5000 },
    ],
    content: {
      code: `// 伺服定位控制功能块

CASE #state OF
    0: // 待机
        #busy := FALSE;
        #done := FALSE;
        IF #homeCmd THEN
            #state := 10;
        ELSIF #absolutePos THEN
            #state := 20;
        END_IF;
    
    10: // 回原点
        #busy := TRUE;
        // 启动回原点指令
        #axis.MoveHome.Velocity := #targetSpeed * 0.1;
        #axis.MoveHome.Execute := TRUE;
        
        IF #axis.HomingDone THEN
            #state := 100;
        END_IF;
    
    20: // 绝对定位
        #busy := TRUE;
        #axis.MoveAbsolute.Position := #targetPosition;
        #axis.MoveAbsolute.Velocity := #targetSpeed;
        #axis.MoveAbsolute.Execute := TRUE;
        
        IF #axis.Done THEN
            #state := 100;
        END_IF;
    
    100: // 完成
        #busy := FALSE;
        #done := TRUE;
        IF NOT #homeCmd AND NOT #absolutePos THEN
            #state := 0;
        END_IF;
END_CASE;`,
      variables: {
        busy: '执行中',
        done: '完成',
        error: '错误',
      },
    },
    preview: '伺服电机位置控制模块',
    createdAt: '2026-01-20T15:00:00Z',
    updatedAt: '2026-06-20T10:30:00Z',
    usageCount: 67,
    author: 'Motion_Engineer',
  },
];
