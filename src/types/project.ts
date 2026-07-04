export type PlcBrand = 'siemens' | 'mitsubishi' | 'omron' | 'delta';

export type DeviceType = 'threeColorLight' | 'button' | 'sensor' | 'actuator' | 'motor' | 'valve';

export type ModuleType = 'FB' | 'FC';

export type IoType = 'DI' | 'DO' | 'AI' | 'AO';

export interface Project {
  id: string;
  name: string;
  description?: string;
  plcBrand: PlcBrand;
  createdAt: string;
  updatedAt: string;
  stations: Station[];
  mainProgram: MainProgram;
  eventConfigs: EventConfig[];
  mainProgramConfig: MainProgramConfig;
}

export interface Station {
  id: string;
  name: string;
  description?: string;
  position?: number;
  devices: Device[];
  modules: Module[];
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  description?: string;
  ioPoints: IoPoint[];
  position?: {
    x: number;
    y: number;
  };
}

export interface IoPoint {
  id: string;
  name: string;
  type: IoType;
  address: string;
  description?: string;
  defaultValue?: number | boolean;
}

export interface Module {
  id: string;
  name: string;
  type: ModuleType;
  description?: string;
  inputParameters: Parameter[];
  outputParameters: Parameter[];
  inOutParameters: Parameter[];
  staticVariables: Variable[];
  tempVariables: Variable[];
  code?: string;
}

export interface Parameter {
  id: string;
  name: string;
  dataType: string;
  description?: string;
  defaultValue?: string;
}

export interface Variable {
  id: string;
  name: string;
  dataType: string;
  description?: string;
  defaultValue?: string;
}

export interface MainProgram {
  id: string;
  name: string;
  description?: string;
  blocks: ProgramBlock[];
  networks: Network[];
}

export interface ProgramBlock {
  id: string;
  type: 'call' | 'network' | 'comment';
  moduleId?: string;
  order: number;
}

export interface Network {
  id: string;
  title: string;
  description?: string;
  order: number;
  logic?: string;
}

export interface ProjectEvent {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  source?: string;
}

export interface DeviceEvent {
  id: string;
  deviceId: string;
  eventType: string;
  description?: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

export type EventPriority = 'high' | 'medium' | 'low';

export type EventStatus = 'enabled' | 'disabled';

export type EventConditionOperator = 'eq' | 'ne' | 'gt' | 'lt' | 'ge' | 'le' | 'and' | 'or';

export interface EventCondition {
  id: string;
  type: 'comparison' | 'logical';
  operator: EventConditionOperator;
  leftOperand?: string;
  rightOperand?: string;
  children?: EventCondition[];
}

export type EventActionType = 'setOutput' | 'callModule' | 'delay' | 'triggerEvent' | 'setVariable';

export interface EventAction {
  id: string;
  type: EventActionType;
  name: string;
  description?: string;
  params: Record<string, unknown>;
  order: number;
}

export interface EventConfig {
  id: string;
  name: string;
  description?: string;
  priority: EventPriority;
  status: EventStatus;
  triggerCondition: EventCondition;
  actions: EventAction[];
  createdAt: string;
  updatedAt: string;
}

export type StopType = 'normal' | 'emergency' | 'safety';

export type AlarmLevel = 'info' | 'warning' | 'error' | 'critical';

export interface AlarmConfig {
  id: string;
  code: string;
  name: string;
  level: AlarmLevel;
  description?: string;
  triggerCondition: string;
  handlingLogic: string;
  autoReset: boolean;
  enabled: boolean;
}

export type DeviceState = 'idle' | 'running' | 'paused' | 'fault' | 'maintenance';

export interface StateTransition {
  id: string;
  from: DeviceState;
  to: DeviceState;
  trigger: string;
  condition?: string;
  action?: string;
}

export interface StartLogicStep {
  id: string;
  name: string;
  description?: string;
  order: number;
  type: 'condition' | 'action' | 'delay';
  params: Record<string, unknown>;
}

export interface StopLogicConfig {
  type: StopType;
  name: string;
  description?: string;
  steps: StartLogicStep[];
}

export interface MainProgramConfig {
  startLogic: StartLogicStep[];
  stopLogic: {
    normal: StopLogicConfig;
    emergency: StopLogicConfig;
    safety: StopLogicConfig;
  };
  alarms: AlarmConfig[];
  stateTransitions: StateTransition[];
}
