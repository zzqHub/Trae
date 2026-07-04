export type RuleType = 'event' | 'condition' | 'cycle' | 'manual';

export type ConditionOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'between'
  | 'contains'
  | 'startsWith'
  | 'endsWith';

export type LogicalOperator = 'and' | 'or';

export type ActionType =
  | 'setOutput'
  | 'callModule'
  | 'sendNotification'
  | 'logEvent'
  | 'startTimer'
  | 'stopTimer'
  | 'resetCounter'
  | 'incrementCounter'
  | 'decrementCounter';

export type RuleStatus = 'active' | 'inactive' | 'paused' | 'error';

export interface Rule {
  id: string;
  name: string;
  description?: string;
  type: RuleType;
  status: RuleStatus;
  priority: number;
  conditions: RuleConditionGroup;
  actions: RuleAction[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
  triggerCount?: number;
}

export interface RuleConditionGroup {
  id: string;
  logicalOperator: LogicalOperator;
  conditions: RuleCondition[];
  groups?: RuleConditionGroup[];
}

export interface RuleCondition {
  id: string;
  type: 'io' | 'variable' | 'timer' | 'counter' | 'time';
  sourceId?: string;
  sourceName?: string;
  operator: ConditionOperator;
  value: string | number | boolean;
  value2?: string | number;
  description?: string;
}

export interface RuleAction {
  id: string;
  type: ActionType;
  name?: string;
  description?: string;
  targetId?: string;
  targetName?: string;
  parameters: ActionParameter[];
  delay?: number;
  enabled: boolean;
}

export interface ActionParameter {
  name: string;
  value: string | number | boolean;
  dataType: string;
}

export interface RuleSet {
  id: string;
  name: string;
  description?: string;
  rules: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RuleExecutionLog {
  id: string;
  ruleId: string;
  ruleName: string;
  triggeredAt: string;
  status: 'success' | 'failed' | 'skipped';
  conditions?: {
    conditionId: string;
    result: boolean;
    actualValue?: string | number | boolean;
  }[];
  actions?: {
    actionId: string;
    status: 'success' | 'failed' | 'pending';
    errorMessage?: string;
  }[];
  duration?: number;
}

export interface TimerCondition extends RuleCondition {
  type: 'timer';
  timerId: string;
  timerValue: number;
  timerUnit: 'ms' | 's' | 'min' | 'h';
}

export interface CounterCondition extends RuleCondition {
  type: 'counter';
  counterId: string;
  counterValue: number;
}

export interface TimeCondition extends RuleCondition {
  type: 'time';
  startTime?: string;
  endTime?: string;
  daysOfWeek?: number[];
}
