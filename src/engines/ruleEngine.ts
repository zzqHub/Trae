/**
 * 规则引擎
 * 支持条件评估（AND/OR逻辑）、动作执行、规则链执行、前向链式推理
 */

import type {
  Rule,
  RuleCondition,
  RuleConditionGroup,
  RuleAction,
  ConditionOperator,
  RuleExecutionLog,
} from '../types/rule';

export interface RuleEngineData {
  [key: string]: unknown;
}

export interface RuleExecutionContext {
  data: RuleEngineData;
  actions: RuleActionResult[];
  logs: RuleExecutionLog[];
  triggeredRules: Set<string>;
  iteration: number;
}

export interface RuleActionResult {
  actionId: string;
  ruleId: string;
  ruleName: string;
  type: string;
  targetName?: string;
  parameters: Record<string, unknown>;
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  delay?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExecuteOptions {
  maxIterations?: number;
  forwardChaining?: boolean;
  onRuleTriggered?: (rule: Rule, result: RuleActionResult[]) => void;
  onActionExecuted?: (action: RuleAction, result: RuleActionResult) => void;
}

const MAX_ITERATIONS = 10;

function compareValues(
  actual: unknown,
  operator: ConditionOperator,
  expected: string | number | boolean,
  expected2?: string | number
): boolean {
  const actualNum = Number(actual);
  const expectedNum = Number(expected);
  const actualStr = String(actual);
  const expectedStr = String(expected);

  switch (operator) {
    case 'eq':
      return actual === expected || actualStr === expectedStr;
    case 'ne':
      return actual !== expected && actualStr !== expectedStr;
    case 'gt':
      return actualNum > expectedNum;
    case 'lt':
      return actualNum < expectedNum;
    case 'gte':
      return actualNum >= expectedNum;
    case 'lte':
      return actualNum <= expectedNum;
    case 'between':
      if (expected2 === undefined) return false;
      const num2 = Number(expected2);
      return actualNum >= expectedNum && actualNum <= num2;
    case 'contains':
      return actualStr.includes(expectedStr);
    case 'startsWith':
      return actualStr.startsWith(expectedStr);
    case 'endsWith':
      return actualStr.endsWith(expectedStr);
    default:
      return false;
  }
}

function getConditionValue(condition: RuleCondition, data: RuleEngineData): unknown {
  const sourceName = condition.sourceName;
  if (!sourceName) return undefined;

  const keys = sourceName.split('.');
  let current: unknown = data;

  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return current;
}

export function evaluateCondition(
  condition: RuleCondition,
  data: RuleEngineData
): { result: boolean; actualValue?: unknown } {
  const actualValue = getConditionValue(condition, data);
  const result = compareValues(
    actualValue,
    condition.operator,
    condition.value,
    condition.value2
  );
  return { result, actualValue };
}

export function evaluateConditionGroup(
  group: RuleConditionGroup,
  data: RuleEngineData
): { result: boolean; conditions: { conditionId: string; result: boolean; actualValue?: unknown }[] } {
  const conditionResults: { conditionId: string; result: boolean; actualValue?: unknown }[] = [];

  for (const condition of group.conditions) {
    const { result, actualValue } = evaluateCondition(condition, data);
    conditionResults.push({
      conditionId: condition.id,
      result,
      actualValue,
    });
  }

  let groupResult: boolean;
  if (group.logicalOperator === 'and') {
    groupResult = conditionResults.every(c => c.result);
  } else {
    groupResult = conditionResults.some(c => c.result);
  }

  if (group.groups && group.groups.length > 0) {
    for (const subGroup of group.groups) {
      const subResult = evaluateConditionGroup(subGroup, data);
      conditionResults.push(...subResult.conditions.map(c => ({ ...c, conditionId: c.conditionId })));
      
      if (group.logicalOperator === 'and') {
        groupResult = groupResult && subResult.result;
      } else {
        groupResult = groupResult || subResult.result;
      }
    }
  }

  return { result: groupResult, conditions: conditionResults };
}

export function executeAction(
  action: RuleAction,
  rule: Rule,
  data: RuleEngineData
): RuleActionResult {
  const params: Record<string, unknown> = {};
  for (const param of action.parameters) {
    params[param.name] = param.value;
  }

  try {
    switch (action.type) {
      case 'setOutput':
        if (action.targetName) {
          data[action.targetName] = params.value;
        }
        break;
      case 'callModule':
        break;
      case 'sendNotification':
        break;
      case 'logEvent':
        break;
      case 'startTimer':
        break;
      case 'stopTimer':
        break;
      case 'resetCounter':
        if (params.counterId) {
          const counterKey = `counter_${params.counterId}`;
          data[counterKey] = 0;
        }
        break;
      case 'incrementCounter':
        if (params.counterId) {
          const counterKey = `counter_${params.counterId}`;
          const current = Number(data[counterKey] || 0);
          const step = Number(params.step || 1);
          data[counterKey] = current + step;
        }
        break;
      case 'decrementCounter':
        if (params.counterId) {
          const counterKey = `counter_${params.counterId}`;
          const current = Number(data[counterKey] || 0);
          const step = Number(params.step || 1);
          data[counterKey] = current - step;
        }
        break;
      default:
        break;
    }

    return {
      actionId: action.id,
      ruleId: rule.id,
      ruleName: rule.name,
      type: action.type,
      targetName: action.targetName,
      parameters: params,
      status: 'success',
      delay: action.delay,
    };
  } catch (error) {
    return {
      actionId: action.id,
      ruleId: rule.id,
      ruleName: rule.name,
      type: action.type,
      targetName: action.targetName,
      parameters: params,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : String(error),
      delay: action.delay,
    };
  }
}

function sortRulesByPriority(rules: Rule[]): Rule[] {
  return [...rules].sort((a, b) => a.priority - b.priority);
}

export function validateRule(rule: Rule): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!rule.id) {
    errors.push('规则ID不能为空');
  }
  if (!rule.name) {
    errors.push('规则名称不能为空');
  }
  if (!rule.conditions) {
    errors.push('规则条件不能为空');
  }
  if (rule.conditions && rule.conditions.conditions.length === 0) {
    warnings.push('规则条件列表为空，规则将永远不会触发');
  }
  if (!rule.actions || rule.actions.length === 0) {
    warnings.push('规则没有定义任何动作');
  }
  if (rule.priority < 0) {
    errors.push('规则优先级不能为负数');
  }
  if (rule.actions) {
    for (const action of rule.actions) {
      if (!action.type) {
        errors.push(`动作 ${action.id} 缺少类型`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

export function validateRules(rules: Rule[]): ValidationResult {
  const allErrors: string[] = [];
  const allWarnings: string[] = [];

  const idSet = new Set<string>();
  for (const rule of rules) {
    if (idSet.has(rule.id)) {
      allErrors.push(`规则ID重复: ${rule.id}`);
    }
    idSet.add(rule.id);

    const result = validateRule(rule);
    if (!result.valid) {
      allErrors.push(`[${rule.name}] ${result.errors.join('; ')}`);
    }
    if (result.warnings.length > 0) {
      allWarnings.push(`[${rule.name}] ${result.warnings.join('; ')}`);
    }
  }

  return {
    valid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings,
  };
}

export function executeRules(
  rules: Rule[],
  data: RuleEngineData,
  options: ExecuteOptions = {}
): {
  data: RuleEngineData;
  actionResults: RuleActionResult[];
  logs: RuleExecutionLog[];
  iterations: number;
} {
  const { maxIterations = MAX_ITERATIONS, forwardChaining = true, onRuleTriggered, onActionExecuted } = options;

  const context: RuleExecutionContext = {
    data: { ...data },
    actions: [],
    logs: [],
    triggeredRules: new Set(),
    iteration: 0,
  };

  const sortedRules = sortRulesByPriority(rules.filter(r => r.enabled && r.status === 'active'));

  for (let i = 0; i < maxIterations; i++) {
    context.iteration = i;
    let ruleTriggeredInIteration = false;

    for (const rule of sortedRules) {
      const { result, conditions } = evaluateConditionGroup(rule.conditions, context.data);

      if (result) {
        const actionResults: RuleActionResult[] = [];

        for (const action of rule.actions) {
          if (!action.enabled) continue;
          const actionResult = executeAction(action, rule, context.data);
          actionResults.push(actionResult);
          context.actions.push(actionResult);
          
          if (onActionExecuted) {
            onActionExecuted(action, actionResult);
          }
        }

        const log: RuleExecutionLog = {
          id: `log-${rule.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ruleId: rule.id,
          ruleName: rule.name,
          triggeredAt: new Date().toISOString(),
          status: actionResults.every(a => a.status === 'success') ? 'success' : 'failed',
          conditions: conditions.map(c => ({
            conditionId: c.conditionId,
            result: c.result,
            actualValue: c.actualValue as string | number | boolean | undefined,
          })),
          actions: actionResults.map(a => ({
            actionId: a.actionId,
            status: a.status,
            errorMessage: a.errorMessage,
          })),
        };
        context.logs.push(log);

        if (!context.triggeredRules.has(rule.id)) {
          context.triggeredRules.add(rule.id);
          ruleTriggeredInIteration = true;

          if (onRuleTriggered) {
            onRuleTriggered(rule, actionResults);
          }
        }
      }
    }

    if (!forwardChaining || !ruleTriggeredInIteration) {
      break;
    }
  }

  return {
    data: context.data,
    actionResults: context.actions,
    logs: context.logs,
    iterations: context.iteration + 1,
  };
}

export interface RuleEngine {
  execute: typeof executeRules;
  validate: typeof validateRules;
  validateRule: typeof validateRule;
  evaluateCondition: typeof evaluateCondition;
  evaluateConditionGroup: typeof evaluateConditionGroup;
  executeAction: typeof executeAction;
}

export function createRuleEngine(): RuleEngine {
  return {
    execute: executeRules,
    validate: validateRules,
    validateRule: validateRule,
    evaluateCondition: evaluateCondition,
    evaluateConditionGroup: evaluateConditionGroup,
    executeAction: executeAction,
  };
}

export const ruleEngine = createRuleEngine();
export default ruleEngine;
