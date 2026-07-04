import type { Project } from '../types/project';

export const mockProjects: Project[] = [
  {
    id: 'proj-001',
    name: '汽车零部件装配线',
    description: '汽车发动机零部件自动化装配生产线，包含上料、装配、检测、下料四个工位',
    plcBrand: 'siemens',
    createdAt: '2026-01-15T08:30:00Z',
    updatedAt: '2026-06-28T14:20:00Z',
    stations: [
      {
        id: 'stn-001',
        name: '上料工位',
        description: '工件自动上料及定位',
        position: 1,
        devices: [
          {
            id: 'dev-001',
            name: '三色警示灯',
            type: 'threeColorLight',
            description: '设备状态指示',
            ioPoints: [
              { id: 'io-001', name: '红灯', type: 'DO', address: 'Q0.0', description: '故障指示' },
              { id: 'io-002', name: '黄灯', type: 'DO', address: 'Q0.1', description: '待机/警告指示' },
              { id: 'io-003', name: '绿灯', type: 'DO', address: 'Q0.2', description: '运行指示' },
            ],
          },
          {
            id: 'dev-002',
            name: '启动按钮',
            type: 'button',
            description: '手动启动按钮',
            ioPoints: [
              { id: 'io-004', name: '启动信号', type: 'DI', address: 'I0.0', description: '常开触点' },
            ],
          },
          {
            id: 'dev-003',
            name: '停止按钮',
            type: 'button',
            description: '紧急停止按钮',
            ioPoints: [
              { id: 'io-005', name: '停止信号', type: 'DI', address: 'I0.1', description: '常闭触点' },
            ],
          },
          {
            id: 'dev-004',
            name: '工件检测传感器',
            type: 'sensor',
            description: '电感式接近开关，检测工件是否到位',
            ioPoints: [
              { id: 'io-006', name: '工件到位信号', type: 'DI', address: 'I0.2', description: 'PNP输出' },
            ],
          },
          {
            id: 'dev-005',
            name: '上料电机',
            type: 'motor',
            description: '伺服电机，驱动上料机械手',
            ioPoints: [
              { id: 'io-007', name: '电机使能', type: 'DO', address: 'Q0.3', description: '伺服使能信号' },
              { id: 'io-008', name: '电机故障', type: 'DI', address: 'I0.3', description: '伺服报警信号' },
            ],
          },
        ],
        modules: [
          {
            id: 'mod-001',
            name: '电机启停控制',
            type: 'FB',
            description: '标准电机启停控制功能块',
            inputParameters: [
              { id: 'param-001', name: 'Start', dataType: 'BOOL', description: '启动按钮', defaultValue: 'FALSE' },
              { id: 'param-002', name: 'Stop', dataType: 'BOOL', description: '停止按钮', defaultValue: 'FALSE' },
              { id: 'param-003', name: 'Overload', dataType: 'BOOL', description: '过载保护', defaultValue: 'FALSE' },
            ],
            outputParameters: [
              { id: 'param-004', name: 'Run', dataType: 'BOOL', description: '电机运行', defaultValue: 'FALSE' },
              { id: 'param-005', name: 'Fault', dataType: 'BOOL', description: '故障输出', defaultValue: 'FALSE' },
            ],
            inOutParameters: [],
            staticVariables: [
              { id: 'var-001', name: 'RunLatch', dataType: 'BOOL', description: '运行锁存', defaultValue: 'FALSE' },
            ],
            tempVariables: [],
            code: `// 电机启停控制
A     #Start
O     #RunLatch
AN    #Stop
AN    #Overload
=     #RunLatch

#Run := #RunLatch;
#Fault := #Overload;`,
          },
          {
            id: 'mod-002',
            name: '三色灯控制',
            type: 'FC',
            description: '三色灯状态控制函数',
            inputParameters: [
              { id: 'param-006', name: 'Fault', dataType: 'BOOL', description: '故障信号', defaultValue: 'FALSE' },
              { id: 'param-007', name: 'Running', dataType: 'BOOL', description: '运行信号', defaultValue: 'FALSE' },
            ],
            outputParameters: [
              { id: 'param-008', name: 'RedLight', dataType: 'BOOL', description: '红灯输出', defaultValue: 'FALSE' },
              { id: 'param-009', name: 'YellowLight', dataType: 'BOOL', description: '黄灯输出', defaultValue: 'FALSE' },
              { id: 'param-010', name: 'GreenLight', dataType: 'BOOL', description: '绿灯输出', defaultValue: 'FALSE' },
            ],
            inOutParameters: [],
            staticVariables: [],
            tempVariables: [],
            code: `// 红灯：故障
#RedLight := #Fault;
// 绿灯：无故障且运行中
#GreenLight := NOT #Fault AND #Running;
// 黄灯：无故障且待机
#YellowLight := NOT #Fault AND NOT #Running;`,
          },
        ],
      },
      {
        id: 'stn-002',
        name: '装配工位',
        description: '核心零部件压装及拧紧',
        position: 2,
        devices: [
          {
            id: 'dev-006',
            name: '压力传感器',
            type: 'sensor',
            description: '压力检测传感器，量程0-500N',
            ioPoints: [
              { id: 'io-009', name: '压力值', type: 'AI', address: 'IW256', description: '模拟量输入 4-20mA' },
            ],
          },
          {
            id: 'dev-007',
            name: '压装气缸电磁阀',
            type: 'valve',
            description: '二位五通电磁阀，控制压装气缸',
            ioPoints: [
              { id: 'io-010', name: '压装动作', type: 'DO', address: 'Q0.4', description: '电磁阀线圈控制' },
            ],
          },
          {
            id: 'dev-008',
            name: '拧紧枪',
            type: 'motor',
            description: '电动拧紧枪，扭矩5-50Nm',
            ioPoints: [
              { id: 'io-011', name: '拧紧启动', type: 'DO', address: 'Q0.5', description: '触发拧紧' },
              { id: 'io-012', name: '拧紧完成', type: 'DI', address: 'I0.4', description: '拧紧完成信号' },
              { id: 'io-013', name: '拧紧扭矩', type: 'AI', address: 'IW258', description: '扭矩反馈值' },
            ],
          },
        ],
        modules: [
          {
            id: 'mod-003',
            name: '模拟量采集',
            type: 'FB',
            description: '模拟量信号采集与滤波',
            inputParameters: [
              { id: 'param-011', name: 'RawInput', dataType: 'INT', description: '原始模拟量输入', defaultValue: '0' },
              { id: 'param-012', name: 'Enable', dataType: 'BOOL', description: '使能信号', defaultValue: 'TRUE' },
            ],
            outputParameters: [
              { id: 'param-013', name: 'FilteredValue', dataType: 'INT', description: '滤波后数值', defaultValue: '0' },
              { id: 'param-014', name: 'Valid', dataType: 'BOOL', description: '数据有效标志', defaultValue: 'FALSE' },
            ],
            inOutParameters: [],
            staticVariables: [
              { id: 'var-002', name: 'SampleBuffer', dataType: 'ARRAY[0..9] OF INT', description: '采样缓冲区', defaultValue: '' },
              { id: 'var-003', name: 'Index', dataType: 'INT', description: '缓冲区索引', defaultValue: '0' },
            ],
            tempVariables: [
              { id: 'var-004', name: 'Sum', dataType: 'DINT', description: '求和变量', defaultValue: '0' },
            ],
            code: `// 模拟量均值滤波
IF #Enable THEN
    #SampleBuffer[#Index] := #RawInput;
    #Index := (#Index + 1) MOD 10;
    
    #Sum := 0;
    FOR #i := 0 TO 9 DO
        #Sum := #Sum + #SampleBuffer[#i];
    END_FOR;
    
    #FilteredValue := INT(#Sum / 10);
    #Valid := TRUE;
END_IF;`,
          },
        ],
      },
      {
        id: 'stn-003',
        name: '检测工位',
        description: '成品尺寸及功能检测',
        position: 3,
        devices: [
          {
            id: 'dev-009',
            name: '激光位移传感器',
            type: 'sensor',
            description: '高精度激光位移传感器，检测工件尺寸',
            ioPoints: [
              { id: 'io-014', name: '位移值', type: 'AI', address: 'IW260', description: '0-10V模拟量输出' },
              { id: 'io-015', name: '测量完成', type: 'DI', address: 'I0.5', description: '测量完成信号' },
            ],
          },
          {
            id: 'dev-010',
            name: '合格指示灯',
            type: 'threeColorLight',
            description: '检测结果指示',
            ioPoints: [
              { id: 'io-016', name: '合格灯', type: 'DO', address: 'Q0.6', description: '绿色-合格' },
              { id: 'io-017', name: '不合格灯', type: 'DO', address: 'Q0.7', description: '红色-不合格' },
            ],
          },
        ],
        modules: [
          {
            id: 'mod-004',
            name: '尺寸检测判定',
            type: 'FB',
            description: '尺寸检测与合格判定',
            inputParameters: [
              { id: 'param-015', name: 'MeasureValue', dataType: 'REAL', description: '测量值(mm)', defaultValue: '0.0' },
              { id: 'param-016', name: 'NominalValue', dataType: 'REAL', description: '名义值(mm)', defaultValue: '10.0' },
              { id: 'param-017', name: 'Tolerance', dataType: 'REAL', description: '公差(±mm)', defaultValue: '0.1' },
              { id: 'param-018', name: 'MeasureDone', dataType: 'BOOL', description: '测量完成', defaultValue: 'FALSE' },
            ],
            outputParameters: [
              { id: 'param-019', name: 'IsQualified', dataType: 'BOOL', description: '是否合格', defaultValue: 'FALSE' },
              { id: 'param-020', name: 'Deviation', dataType: 'REAL', description: '偏差值(mm)', defaultValue: '0.0' },
              { id: 'param-021', name: 'ResultValid', dataType: 'BOOL', description: '结果有效', defaultValue: 'FALSE' },
            ],
            inOutParameters: [],
            staticVariables: [],
            tempVariables: [],
            code: `// 尺寸合格判定
IF #MeasureDone THEN
    #Deviation := #MeasureValue - #NominalValue;
    #IsQualified := ABS(#Deviation) <= #Tolerance;
    #ResultValid := TRUE;
ELSE
    #ResultValid := FALSE;
END_IF;`,
          },
        ],
      },
      {
        id: 'stn-004',
        name: '下料工位',
        description: '成品分拣及下料',
        position: 4,
        devices: [
          {
            id: 'dev-011',
            name: '输送带电机',
            type: 'motor',
            description: '变频器驱动输送带电机',
            ioPoints: [
              { id: 'io-018', name: '电机正转', type: 'DO', address: 'Q1.0', description: '变频器正转信号' },
              { id: 'io-019', name: '电机速度', type: 'AO', address: 'QW256', description: '速度给定 0-10V' },
              { id: 'io-020', name: '电机运行反馈', type: 'DI', address: 'I0.6', description: '变频器运行信号' },
            ],
          },
          {
            id: 'dev-012',
            name: '分拣气缸',
            type: 'valve',
            description: '分拣推料气缸',
            ioPoints: [
              { id: 'io-021', name: '分拣动作', type: 'DO', address: 'Q1.1', description: '气缸电磁阀控制' },
            ],
          },
          {
            id: 'dev-013',
            name: '物料到位传感器',
            type: 'sensor',
            description: '光电传感器，检测物料到达',
            ioPoints: [
              { id: 'io-022', name: '物料到位', type: 'DI', address: 'I0.7', description: 'NPN输出' },
            ],
          },
        ],
        modules: [
          {
            id: 'mod-005',
            name: '输送带控制',
            type: 'FB',
            description: '输送带启停及速度控制',
            inputParameters: [
              { id: 'param-022', name: 'RunCmd', dataType: 'BOOL', description: '运行命令', defaultValue: 'FALSE' },
              { id: 'param-023', name: 'SpeedSetpoint', dataType: 'INT', description: '速度设定(0-27648)', defaultValue: '13824' },
              { id: 'param-024', name: 'StopCmd', dataType: 'BOOL', description: '停止命令', defaultValue: 'FALSE' },
            ],
            outputParameters: [
              { id: 'param-025', name: 'RunOutput', dataType: 'BOOL', description: '运行输出', defaultValue: 'FALSE' },
              { id: 'param-026', name: 'SpeedOutput', dataType: 'INT', description: '速度输出', defaultValue: '0' },
              { id: 'param-027', name: 'Running', dataType: 'BOOL', description: '运行反馈', defaultValue: 'FALSE' },
            ],
            inOutParameters: [],
            staticVariables: [],
            tempVariables: [],
            code: `// 输送带控制
#RunOutput := #RunCmd AND NOT #StopCmd;
#SpeedOutput := SEL(#RunOutput, 0, #SpeedSetpoint);`,
          },
        ],
      },
    ],
    mainProgram: {
      id: 'main-001',
      name: '主程序',
      description: '汽车零部件装配线主程序',
      blocks: [
        { id: 'block-001', type: 'call', moduleId: 'mod-001', order: 1 },
        { id: 'block-002', type: 'call', moduleId: 'mod-002', order: 2 },
        { id: 'block-003', type: 'call', moduleId: 'mod-003', order: 3 },
        { id: 'block-004', type: 'network', order: 4 },
        { id: 'block-005', type: 'call', moduleId: 'mod-004', order: 5 },
        { id: 'block-006', type: 'call', moduleId: 'mod-005', order: 6 },
      ],
      networks: [
        {
          id: 'net-001',
          title: '系统初始化',
          description: 'PLC上电首次扫描初始化',
          order: 1,
          logic: 'A M0.0 // 首次扫描\nR M0.0',
        },
        {
          id: 'net-002',
          title: '状态标志管理',
          description: '系统运行、故障等状态标志',
          order: 2,
          logic: '// 系统运行状态\nO "自动模式"\nO "手动模式"\n= "系统运行"',
        },
      ],
    },
    eventConfigs: [
      {
        id: 'event-cfg-001',
        name: '电机过载保护',
        description: '检测到电机过载时触发保护动作',
        priority: 'high',
        status: 'enabled',
        triggerCondition: {
          id: 'cond-001',
          type: 'logical',
          operator: 'and',
          children: [
            { id: 'cond-002', type: 'comparison', operator: 'eq', leftOperand: '电机故障', rightOperand: 'TRUE' },
            { id: 'cond-003', type: 'comparison', operator: 'eq', leftOperand: '系统运行', rightOperand: 'TRUE' },
          ],
        },
        actions: [
          { id: 'action-001', type: 'setOutput', name: '停止电机', description: '切断电机电源', params: { output: '电机使能', value: false }, order: 1 },
          { id: 'action-002', type: 'setOutput', name: '故障灯亮', description: '点亮红色警示灯', params: { output: '红灯', value: true }, order: 2 },
          { id: 'action-003', type: 'triggerEvent', name: '触发报警', description: '触发过载报警事件', params: { alarmCode: 'ALM-001' }, order: 3 },
        ],
        createdAt: '2026-01-20T10:00:00Z',
        updatedAt: '2026-06-15T14:30:00Z',
      },
      {
        id: 'event-cfg-002',
        name: '工件到位检测',
        description: '工件到达指定位置时启动加工工序',
        priority: 'medium',
        status: 'enabled',
        triggerCondition: {
          id: 'cond-004',
          type: 'logical',
          operator: 'and',
          children: [
            { id: 'cond-005', type: 'comparison', operator: 'eq', leftOperand: '工件到位信号', rightOperand: 'TRUE' },
            { id: 'cond-006', type: 'comparison', operator: 'eq', leftOperand: '系统就绪', rightOperand: 'TRUE' },
          ],
        },
        actions: [
          { id: 'action-004', type: 'callModule', name: '启动压装工序', description: '调用压装控制模块', params: { moduleId: 'mod-003' }, order: 1 },
          { id: 'action-005', type: 'delay', name: '延时等待', description: '压装完成等待时间', params: { duration: 1000 }, order: 2 },
        ],
        createdAt: '2026-02-10T09:00:00Z',
        updatedAt: '2026-05-20T11:00:00Z',
      },
      {
        id: 'event-cfg-003',
        name: '温度超限预警',
        description: '设备温度超过预警值时发出警告',
        priority: 'low',
        status: 'disabled',
        triggerCondition: {
          id: 'cond-007',
          type: 'comparison',
          operator: 'gt',
          leftOperand: '设备温度',
          rightOperand: '80',
        },
        actions: [
          { id: 'action-006', type: 'setOutput', name: '黄灯闪烁', description: '黄色警示灯闪烁', params: { output: '黄灯', value: true, blink: true }, order: 1 },
        ],
        createdAt: '2026-03-01T08:00:00Z',
        updatedAt: '2026-04-10T16:00:00Z',
      },
    ],
    mainProgramConfig: {
      startLogic: [
        { id: 'step-001', name: '安全回路检测', description: '检查安全门、急停等安全信号', order: 1, type: 'condition', params: { condition: '安全回路正常' } },
        { id: 'step-002', name: '初始化变量', description: '复位所有中间变量和输出', order: 2, type: 'action', params: { action: 'resetAll' } },
        { id: 'step-003', name: '启动延时', description: '设备启动前等待时间', order: 3, type: 'delay', params: { duration: 2000 } },
        { id: 'step-004', name: '启动液压系统', description: '启动液压泵并建立压力', order: 4, type: 'action', params: { action: 'startHydraulic' } },
        { id: 'step-005', name: '压力建立检测', description: '等待系统压力达到设定值', order: 5, type: 'condition', params: { condition: '系统压力正常' } },
        { id: 'step-006', name: '进入待机状态', description: '系统准备就绪，进入待机', order: 6, type: 'action', params: { action: 'setIdle' } },
      ],
      stopLogic: {
        normal: {
          type: 'normal',
          name: '正常停止',
          description: '按正常流程停止设备运行',
          steps: [
            { id: 'nstep-001', name: '完成当前周期', description: '等待当前工序完成', order: 1, type: 'condition', params: { condition: '当前工序完成' } },
            { id: 'nstep-002', name: '关闭执行机构', description: '停止所有运动轴和气缸', order: 2, type: 'action', params: { action: 'stopActuators' } },
            { id: 'nstep-003', name: '关闭液压系统', description: '停止液压泵', order: 3, type: 'action', params: { action: 'stopHydraulic' } },
            { id: 'nstep-004', name: '待机状态', description: '系统进入待机', order: 4, type: 'action', params: { action: 'setIdle' } },
          ],
        },
        emergency: {
          type: 'emergency',
          name: '紧急停止',
          description: '立即停止所有运动，切断动力',
          steps: [
            { id: 'estep-001', name: '切断动力输出', description: '立即切断所有输出', order: 1, type: 'action', params: { action: 'cutAllOutputs' } },
            { id: 'estep-002', name: '触发急停报警', description: '记录急停事件并报警', order: 2, type: 'action', params: { action: 'triggerEmergencyAlarm' } },
          ],
        },
        safety: {
          type: 'safety',
          name: '安全停止',
          description: '安全回路触发时的有序停止',
          steps: [
            { id: 'sstep-001', name: '减速停止运动轴', description: '按减速度停止所有运动轴', order: 1, type: 'action', params: { action: 'decelerateAll' } },
            { id: 'sstep-002', name: '关闭高压系统', description: '关闭液压、气动等高压系统', order: 2, type: 'action', params: { action: 'stopHighPressure' } },
            { id: 'sstep-003', name: '安全状态确认', description: '确认所有危险能量已释放', order: 3, type: 'condition', params: { condition: '安全状态确认' } },
          ],
        },
      },
      alarms: [
        {
          id: 'alarm-001',
          code: 'ALM-001',
          name: '电机过载',
          level: 'error',
          description: '伺服电机过载保护触发',
          triggerCondition: '电机故障 = TRUE',
          handlingLogic: '停止电机输出，点亮红色警示灯，记录故障日志',
          autoReset: false,
          enabled: true,
        },
        {
          id: 'alarm-002',
          code: 'ALM-002',
          name: '气压不足',
          level: 'warning',
          description: '气源压力低于设定下限',
          triggerCondition: '气压 < 0.5MPa',
          handlingLogic: '点亮黄色警示灯，暂停自动运行',
          autoReset: true,
          enabled: true,
        },
        {
          id: 'alarm-003',
          code: 'ALM-003',
          name: '温度过高',
          level: 'critical',
          description: '设备温度超过安全阈值',
          triggerCondition: '设备温度 > 95°C',
          handlingLogic: '立即停机，启动冷却风扇，触发蜂鸣器报警',
          autoReset: false,
          enabled: true,
        },
        {
          id: 'alarm-004',
          code: 'ALM-004',
          name: '物料不足',
          level: 'info',
          description: '料仓物料即将用尽',
          triggerCondition: '料位 < 低位阈值',
          handlingLogic: '提示补料，不影响当前生产',
          autoReset: true,
          enabled: true,
        },
      ],
      stateTransitions: [
        { id: 'trans-001', from: 'idle', to: 'running', trigger: '启动按钮', condition: '安全回路正常 AND 无故障', action: '启动运行流程' },
        { id: 'trans-002', from: 'running', to: 'paused', trigger: '暂停按钮', condition: '当前动作可暂停', action: '暂停当前工序' },
        { id: 'trans-003', from: 'paused', to: 'running', trigger: '继续按钮', condition: '无故障', action: '继续当前工序' },
        { id: 'trans-004', from: 'running', to: 'idle', trigger: '停止按钮', condition: '', action: '执行正常停止流程' },
        { id: 'trans-005', from: 'idle', to: 'fault', trigger: '故障发生', condition: '', action: '触发故障处理' },
        { id: 'trans-006', from: 'running', to: 'fault', trigger: '故障发生', condition: '', action: '立即停机，触发故障处理' },
        { id: 'trans-007', from: 'paused', to: 'fault', trigger: '故障发生', condition: '', action: '触发故障处理' },
        { id: 'trans-008', from: 'fault', to: 'idle', trigger: '故障复位', condition: '所有故障已清除', action: '复位至待机状态' },
        { id: 'trans-009', from: 'idle', to: 'maintenance', trigger: '进入维护', condition: '授权确认', action: '进入维护模式' },
        { id: 'trans-010', from: 'maintenance', to: 'idle', trigger: '退出维护', condition: '', action: '退出维护模式' },
      ],
    },
  },
  {
    id: 'proj-002',
    name: '食品包装流水线',
    description: '休闲食品自动包装生产线，包含送料、制袋、灌装、封口、喷码',
    plcBrand: 'mitsubishi',
    createdAt: '2025-11-20T09:00:00Z',
    updatedAt: '2026-05-10T16:30:00Z',
    stations: [
      {
        id: 'stn-005',
        name: '送料工位',
        description: '物料输送及整理',
        position: 1,
        devices: [
          {
            id: 'dev-014',
            name: '状态指示灯',
            type: 'threeColorLight',
            description: '流水线状态指示',
            ioPoints: [
              { id: 'io-023', name: '红色灯', type: 'DO', address: 'Y000', description: '故障' },
              { id: 'io-024', name: '黄色灯', type: 'DO', address: 'Y001', description: '待机' },
              { id: 'io-025', name: '绿色灯', type: 'DO', address: 'Y002', description: '运行' },
            ],
          },
          {
            id: 'dev-015',
            name: '振动盘',
            type: 'actuator',
            description: '振动送料盘，整理物料方向',
            ioPoints: [
              { id: 'io-026', name: '振动器控制', type: 'DO', address: 'Y003', description: '振动盘启停' },
            ],
          },
          {
            id: 'dev-016',
            name: '料满传感器',
            type: 'sensor',
            description: '对射式光电开关，检测料仓是否满料',
            ioPoints: [
              { id: 'io-027', name: '料满信号', type: 'DI', address: 'X000', description: '料满检测' },
            ],
          },
          {
            id: 'dev-017',
            name: '复位按钮',
            type: 'button',
            description: '故障复位按钮',
            ioPoints: [
              { id: 'io-028', name: '复位信号', type: 'DI', address: 'X001', description: '复位按钮' },
            ],
          },
        ],
        modules: [
          {
            id: 'mod-006',
            name: '振动送料控制',
            type: 'FB',
            description: '振动盘送料控制，料满停机',
            inputParameters: [
              { id: 'param-028', name: 'StartCmd', dataType: 'BOOL', description: '启动命令', defaultValue: 'FALSE' },
              { id: 'param-029', name: 'FeedFull', dataType: 'BOOL', description: '料满信号', defaultValue: 'FALSE' },
              { id: 'param-030', name: 'FeedEmpty', dataType: 'BOOL', description: '料空信号', defaultValue: 'FALSE' },
            ],
            outputParameters: [
              { id: 'param-031', name: 'VibratorRun', dataType: 'BOOL', description: '振动器运行', defaultValue: 'FALSE' },
              { id: 'param-032', name: 'LowMaterial', dataType: 'BOOL', description: '缺料报警', defaultValue: 'FALSE' },
            ],
            inOutParameters: [],
            staticVariables: [],
            tempVariables: [],
            code: `// 振动送料控制
// 料空启动，料满停止
#VibratorRun := #StartCmd AND NOT #FeedFull;
#LowMaterial := #FeedEmpty AND #StartCmd;`,
          },
        ],
      },
      {
        id: 'stn-006',
        name: '灌装工位',
        description: '物料灌装及称重',
        position: 2,
        devices: [
          {
            id: 'dev-018',
            name: '称重传感器',
            type: 'sensor',
            description: '高精度称重传感器，量程0-2kg',
            ioPoints: [
              { id: 'io-029', name: '重量值', type: 'AI', address: 'AD1', description: '称重模块读数' },
            ],
          },
          {
            id: 'dev-019',
            name: '下料电磁阀',
            type: 'valve',
            description: '二位二通电磁阀，控制物料灌装',
            ioPoints: [
              { id: 'io-030', name: '粗灌阀', type: 'DO', address: 'Y004', description: '大流量灌装' },
              { id: 'io-031', name: '精灌阀', type: 'DO', address: 'Y005', description: '小流量灌装' },
            ],
          },
        ],
        modules: [
          {
            id: 'mod-007',
            name: '称重灌装控制',
            type: 'FB',
            description: '双速称重灌装，粗细两级灌装',
            inputParameters: [
              { id: 'param-033', name: 'StartFill', dataType: 'BOOL', description: '开始灌装', defaultValue: 'FALSE' },
              { id: 'param-034', name: 'TargetWeight', dataType: 'REAL', description: '目标重量(g)', defaultValue: '500.0' },
              { id: 'param-035', name: 'CoarseStop', dataType: 'REAL', description: '粗灌停止重量(g)', defaultValue: '450.0' },
              { id: 'param-036', name: 'CurrentWeight', dataType: 'REAL', description: '当前重量(g)', defaultValue: '0.0' },
            ],
            outputParameters: [
              { id: 'param-037', name: 'CoarseValve', dataType: 'BOOL', description: '粗灌阀输出', defaultValue: 'FALSE' },
              { id: 'param-038', name: 'FineValve', dataType: 'BOOL', description: '精灌阀输出', defaultValue: 'FALSE' },
              { id: 'param-039', name: 'FillComplete', dataType: 'BOOL', description: '灌装完成', defaultValue: 'FALSE' },
            ],
            inOutParameters: [],
            staticVariables: [
              { id: 'var-005', name: 'Filling', dataType: 'BOOL', description: '正在灌装', defaultValue: 'FALSE' },
            ],
            tempVariables: [],
            code: `// 双速灌装控制
IF #StartFill AND NOT #Filling THEN
    #Filling := TRUE;
    #FillComplete := FALSE;
END_IF;

IF #Filling THEN
    IF #CurrentWeight < #CoarseStop THEN
        #CoarseValve := TRUE;
        #FineValve := TRUE;
    ELSIF #CurrentWeight < #TargetWeight THEN
        #CoarseValve := FALSE;
        #FineValve := TRUE;
    ELSE
        #CoarseValve := FALSE;
        #FineValve := FALSE;
        #FillComplete := TRUE;
        #Filling := FALSE;
    END_IF;
END_IF;`,
          },
        ],
      },
      {
        id: 'stn-007',
        name: '封口喷码工位',
        description: '包装袋封口及日期喷码',
        position: 3,
        devices: [
          {
            id: 'dev-020',
            name: '封口加热棒',
            type: 'actuator',
            description: '固态继电器控制封口加热',
            ioPoints: [
              { id: 'io-032', name: '封口加热', type: 'DO', address: 'Y006', description: '加热控制' },
            ],
          },
          {
            id: 'dev-021',
            name: '喷码机',
            type: 'actuator',
            description: '生产日期喷码机',
            ioPoints: [
              { id: 'io-033', name: '喷码触发', type: 'DO', address: 'Y007', description: '触发喷码' },
              { id: 'io-034', name: '喷码完成', type: 'DI', address: 'X002', description: '喷码反馈' },
            ],
          },
          {
            id: 'dev-022',
            name: '温度传感器',
            type: 'sensor',
            description: '封口温度检测',
            ioPoints: [
              { id: 'io-035', name: '封口温度', type: 'AI', address: 'AD2', description: 'PT100温度值' },
            ],
          },
        ],
        modules: [
          {
            id: 'mod-008',
            name: '温度PID控制',
            type: 'FB',
            description: '封口温度PID调节控制',
            inputParameters: [
              { id: 'param-040', name: 'Setpoint', dataType: 'REAL', description: '设定温度(°C)', defaultValue: '150.0' },
              { id: 'param-041', name: 'ProcessValue', dataType: 'REAL', description: '当前温度(°C)', defaultValue: '25.0' },
              { id: 'param-042', name: 'Enable', dataType: 'BOOL', description: '使能控制', defaultValue: 'FALSE' },
            ],
            outputParameters: [
              { id: 'param-043', name: 'Output', dataType: 'REAL', description: '输出(0-100%)', defaultValue: '0.0' },
              { id: 'param-044', name: 'AtSetpoint', dataType: 'BOOL', description: '到达设定温度', defaultValue: 'FALSE' },
            ],
            inOutParameters: [],
            staticVariables: [
              { id: 'var-006', name: 'IntegralTerm', dataType: 'REAL', description: '积分项', defaultValue: '0.0' },
              { id: 'var-007', name: 'LastError', dataType: 'REAL', description: '上次误差', defaultValue: '0.0' },
            ],
            tempVariables: [
              { id: 'var-008', name: 'Error', dataType: 'REAL', description: '当前误差', defaultValue: '0.0' },
            ],
            code: `// PID温度控制（简化版）
IF #Enable THEN
    #Error := #Setpoint - #ProcessValue;
    
    // 积分项
    #IntegralTerm := #IntegralTerm + #Error * 0.1;
    #IntegralTerm := LIMIT(MN := -50.0, IN := #IntegralTerm, MX := 50.0);
    
    // PID输出 = P + I + D
    #Output := 2.0 * #Error + #IntegralTerm + 0.5 * (#Error - #LastError);
    #Output := LIMIT(MN := 0.0, IN := #Output, MX := 100.0);
    
    #LastError := #Error;
    #AtSetpoint := ABS(#Error) < 2.0;
ELSE
    #Output := 0.0;
    #IntegralTerm := 0.0;
    #AtSetpoint := FALSE;
END_IF;`,
          },
        ],
      },
    ],
    mainProgram: {
      id: 'main-002',
      name: '主程序',
      description: '食品包装流水线主程序',
      blocks: [
        { id: 'block-007', type: 'call', moduleId: 'mod-006', order: 1 },
        { id: 'block-008', type: 'call', moduleId: 'mod-007', order: 2 },
        { id: 'block-009', type: 'call', moduleId: 'mod-008', order: 3 },
        { id: 'block-010', type: 'network', order: 4 },
      ],
      networks: [
        {
          id: 'net-003',
          title: '流水线联动控制',
          description: '各工位之间的联动逻辑',
          order: 1,
          logic: '// 工位间联动\n// 前一工位完成 → 后一工位启动',
        },
      ],
    },
    eventConfigs: [
      {
        id: 'event-cfg-004',
        name: '料满自动停机',
        description: '料仓满料时停止振动送料',
        priority: 'medium',
        status: 'enabled',
        triggerCondition: {
          id: 'cond-008',
          type: 'comparison',
          operator: 'eq',
          leftOperand: '料满信号',
          rightOperand: 'TRUE',
        },
        actions: [
          { id: 'action-007', type: 'setOutput', name: '停止振动盘', description: '关闭振动送料', params: { output: '振动器控制', value: false }, order: 1 },
        ],
        createdAt: '2025-12-01T10:00:00Z',
        updatedAt: '2026-04-15T09:00:00Z',
      },
      {
        id: 'event-cfg-005',
        name: '灌装完成检测',
        description: '灌装完成后触发下一工序',
        priority: 'high',
        status: 'enabled',
        triggerCondition: {
          id: 'cond-009',
          type: 'comparison',
          operator: 'eq',
          leftOperand: '灌装完成',
          rightOperand: 'TRUE',
        },
        actions: [
          { id: 'action-008', type: 'callModule', name: '调用封口模块', description: '启动封口工序', params: { moduleId: 'mod-008' }, order: 1 },
        ],
        createdAt: '2025-12-10T14:00:00Z',
        updatedAt: '2026-03-20T11:00:00Z',
      },
    ],
    mainProgramConfig: {
      startLogic: [
        { id: 'step-007', name: '急停检测', description: '检测急停按钮状态', order: 1, type: 'condition', params: { condition: '急停未触发' } },
        { id: 'step-008', name: '输送带回零', description: '输送带回到原点位置', order: 2, type: 'action', params: { action: 'conveyorHome' } },
        { id: 'step-009', name: '待机就绪', description: '系统进入待机状态', order: 3, type: 'action', params: { action: 'setIdle' } },
      ],
      stopLogic: {
        normal: {
          type: 'normal',
          name: '正常停止',
          description: '完成当前包装后停止',
          steps: [
            { id: 'nstep-005', name: '完成当前包装', description: '等待当前包装周期完成', order: 1, type: 'condition', params: { condition: '包装完成' } },
            { id: 'nstep-006', name: '停止各工位', description: '依次停止各工位设备', order: 2, type: 'action', params: { action: 'stopAllStations' } },
          ],
        },
        emergency: {
          type: 'emergency',
          name: '紧急停止',
          description: '立即切断所有动力',
          steps: [
            { id: 'estep-003', name: '全机停止', description: '立即停止所有电机和加热器', order: 1, type: 'action', params: { action: 'emergencyStopAll' } },
          ],
        },
        safety: {
          type: 'safety',
          name: '安全停止',
          description: '安全门打开时的停机',
          steps: [
            { id: 'sstep-004', name: '停止加热', description: '关闭封口加热', order: 1, type: 'action', params: { action: 'stopHeating' } },
            { id: 'sstep-005', name: '停止输送', description: '停止输送带运行', order: 2, type: 'action', params: { action: 'stopConveyor' } },
          ],
        },
      },
      alarms: [
        {
          id: 'alarm-005',
          code: 'ALM-101',
          name: '料仓缺料',
          level: 'warning',
          description: '振动盘料仓物料不足',
          triggerCondition: '料空信号 = TRUE',
          handlingLogic: '点亮黄灯，暂停自动运行等待补料',
          autoReset: true,
          enabled: true,
        },
        {
          id: 'alarm-006',
          code: 'ALM-102',
          name: '封口温度异常',
          level: 'error',
          description: '封口温度超过设定范围',
          triggerCondition: '封口温度 > 上限 OR 封口温度 < 下限',
          handlingLogic: '停止封口工序，触发报警',
          autoReset: false,
          enabled: true,
        },
      ],
      stateTransitions: [
        { id: 'trans-011', from: 'idle', to: 'running', trigger: '启动', condition: '无故障 AND 物料充足', action: '启动流水线' },
        { id: 'trans-012', from: 'running', to: 'idle', trigger: '停止', condition: '', action: '正常停机' },
        { id: 'trans-013', from: 'running', to: 'fault', trigger: '故障', condition: '', action: '故障处理' },
        { id: 'trans-014', from: 'fault', to: 'idle', trigger: '复位', condition: '故障清除', action: '复位系统' },
      ],
    },
  },
];
