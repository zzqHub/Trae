import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Rule,
  RuleConditionGroup,
  RuleCondition,
  RuleAction,
  RuleSet,
  RuleExecutionLog,
  RuleType,
  RuleStatus,
} from '../types';
import { mockRules } from '../data';

interface RuleStore {
  rules: Rule[];
  currentRuleId: string | null;
  ruleSets: RuleSet[];
  executionLogs: RuleExecutionLog[];
  searchQuery: string;
  filterStatus: RuleStatus | 'all';
  filterType: RuleType | 'all';

  get currentRule(): Rule | undefined;
  get filteredRules(): Rule[];
  get activeRules(): Rule[];

  setCurrentRule: (ruleId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setFilterStatus: (status: RuleStatus | 'all') => void;
  setFilterType: (type: RuleType | 'all') => void;

  addRule: (rule: Omit<Rule, 'id' | 'createdAt' | 'updatedAt' | 'lastTriggered' | 'triggerCount'> & {
    lastTriggered?: string;
    triggerCount?: number;
  }) => Rule;
  updateRule: (ruleId: string, updates: Partial<Rule>) => void;
  deleteRule: (ruleId: string) => void;
  duplicateRule: (ruleId: string) => Rule;

  enableRule: (ruleId: string) => void;
  disableRule: (ruleId: string) => void;
  toggleRule: (ruleId: string) => void;

  updateConditionGroup: (ruleId: string, groupId: string, updates: Partial<RuleConditionGroup>) => void;
  addCondition: (ruleId: string, groupId: string, condition: Omit<RuleCondition, 'id'>) => RuleCondition;
  updateCondition: (ruleId: string, conditionId: string, updates: Partial<RuleCondition>) => void;
  deleteCondition: (ruleId: string, conditionId: string) => void;

  addAction: (ruleId: string, action: Omit<RuleAction, 'id'>) => RuleAction;
  updateAction: (ruleId: string, actionId: string, updates: Partial<RuleAction>) => void;
  deleteAction: (ruleId: string, actionId: string) => void;
  reorderActions: (ruleId: string, actionIds: string[]) => void;
  toggleAction: (ruleId: string, actionId: string) => void;

  addRuleSet: (ruleSet: Omit<RuleSet, 'id' | 'createdAt' | 'updatedAt'>) => RuleSet;
  updateRuleSet: (ruleSetId: string, updates: Partial<RuleSet>) => void;
  deleteRuleSet: (ruleSetId: string) => void;
  addRuleToSet: (ruleSetId: string, ruleId: string) => void;
  removeRuleFromSet: (ruleSetId: string, ruleId: string) => void;

  testRule: (ruleId: string, testData?: Record<string, unknown>) => Promise<{ success: boolean; logs: RuleExecutionLog }>;
  executeRule: (ruleId: string) => void;
  triggerRule: (ruleId: string) => void;

  addExecutionLog: (log: Omit<RuleExecutionLog, 'id'>) => void;
  clearExecutionLogs: () => void;
  getExecutionLogsByRule: (ruleId: string) => RuleExecutionLog[];

  exportRule: (ruleId: string) => string;
  importRule: (jsonString: string) => Rule | null;
  exportAllRules: () => string;
  importRules: (jsonString: string) => Rule[];

  getRulesByType: (type: RuleType) => Rule[];
  getRulesByStatus: (status: RuleStatus) => Rule[];
  getEnabledRules: () => Rule[];
}

export type { RuleStore };

export const useRuleStore = create<RuleStore>((set, get) => ({
  rules: mockRules,
  currentRuleId: mockRules.length > 0 ? mockRules[0].id : null,
  ruleSets: [],
  executionLogs: [],
  searchQuery: '',
  filterStatus: 'all',
  filterType: 'all',

  get currentRule() {
    const { rules, currentRuleId } = get();
    return rules.find((r) => r.id === currentRuleId);
  },

  get filteredRules() {
    const { rules, searchQuery, filterStatus, filterType } = get();
    return rules.filter((r) => {
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
      const matchesType = filterType === 'all' || r.type === filterType;
      const matchesSearch =
        searchQuery === '' ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    });
  },

  get activeRules() {
    return get().rules.filter((r) => r.enabled && r.status === 'active');
  },

  setCurrentRule: (ruleId) => set({ currentRuleId: ruleId }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilterStatus: (status) => set({ filterStatus: status }),

  setFilterType: (type) => set({ filterType: type }),

  addRule: (rule) => {
    const now = new Date().toISOString();
    const newRule: Rule = {
      id: `rule-${uuidv4().slice(0, 8)}`,
      createdAt: now,
      updatedAt: now,
      lastTriggered: rule.lastTriggered,
      triggerCount: rule.triggerCount ?? 0,
      ...rule,
    };
    set((state) => ({ rules: [...state.rules, newRule] }));
    return newRule;
  },

  updateRule: (ruleId, updates) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      ),
    })),

  deleteRule: (ruleId) =>
    set((state) => ({
      rules: state.rules.filter((r) => r.id !== ruleId),
      currentRuleId: state.currentRuleId === ruleId ? null : state.currentRuleId,
    })),

  duplicateRule: (ruleId) => {
    const rule = get().rules.find((r) => r.id === ruleId);
    if (!rule) throw new Error('Rule not found');
    const now = new Date().toISOString();
    const idMap = new Map<string, string>();

    const generateId = (prefix: string, oldId: string) => {
      if (idMap.has(oldId)) return idMap.get(oldId)!;
      const newId = `${prefix}-${uuidv4().slice(0, 8)}`;
      idMap.set(oldId, newId);
      return newId;
    };

    const duplicateConditionGroup = (group: RuleConditionGroup): RuleConditionGroup => ({
      ...group,
      id: generateId('cond-group', group.id),
      conditions: group.conditions.map((c) => ({
        ...c,
        id: generateId('cond', c.id),
      })),
      groups: group.groups?.map((g) => duplicateConditionGroup(g)),
    });

    const newRule: Rule = JSON.parse(JSON.stringify(rule));
    newRule.id = generateId('rule', rule.id);
    newRule.name = `${rule.name} 副本`;
    newRule.createdAt = now;
    newRule.updatedAt = now;
    newRule.triggerCount = 0;
    newRule.lastTriggered = undefined;
    newRule.conditions = duplicateConditionGroup(rule.conditions);
    newRule.actions = rule.actions.map((a) => ({
      ...a,
      id: generateId('action', a.id),
    }));

    set((state) => ({ rules: [...state.rules, newRule] }));
    return newRule;
  },

  enableRule: (ruleId) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId
          ? { ...r, enabled: true, status: 'active', updatedAt: new Date().toISOString() }
          : r
      ),
    })),

  disableRule: (ruleId) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId
          ? { ...r, enabled: false, status: 'inactive', updatedAt: new Date().toISOString() }
          : r
      ),
    })),

  toggleRule: (ruleId) => {
    const rule = get().rules.find((r) => r.id === ruleId);
    if (!rule) return;
    if (rule.enabled) {
      get().disableRule(ruleId);
    } else {
      get().enableRule(ruleId);
    }
  },

  updateConditionGroup: (ruleId, groupId, updates) => {
    const updateGroup = (group: RuleConditionGroup): RuleConditionGroup => {
      if (group.id === groupId) {
      return { ...group, ...updates };
    }
    return {
      ...group,
      groups: group.groups?.map(updateGroup),
    };
  };

  set((state) => ({
    rules: state.rules.map((r) =>
      r.id === ruleId
        ? {
            ...r,
            conditions: updateGroup(r.conditions),
            updatedAt: new Date().toISOString(),
          }
        : r
    ),
  }));
  },

  addCondition: (ruleId, groupId, condition) => {
    const newCondition: RuleCondition = {
      id: `cond-${uuidv4().slice(0, 8)}`,
      ...condition,
    };

    const addToGroup = (group: RuleConditionGroup): RuleConditionGroup => {
      if (group.id === groupId) {
      return {
        ...group,
        conditions: [...group.conditions, newCondition],
      };
    }
      return {
        ...group,
        groups: group.groups?.map(addToGroup),
      };
    };

    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              conditions: addToGroup(r.conditions),
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    }));
    return newCondition;
  },

  updateCondition: (ruleId, conditionId, updates) => {
    const updateInGroup = (group: RuleConditionGroup): RuleConditionGroup => ({
      ...group,
      conditions: group.conditions.map((c) =>
        c.id === conditionId ? { ...c, ...updates } : c
      ),
      groups: group.groups?.map(updateInGroup),
    });

    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              conditions: updateInGroup(r.conditions),
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    }));
  },

  deleteCondition: (ruleId, conditionId) => {
    const deleteFromGroup = (group: RuleConditionGroup): RuleConditionGroup => ({
      ...group,
      conditions: group.conditions.filter((c) => c.id !== conditionId),
      groups: group.groups?.map(deleteFromGroup),
    });

    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              conditions: deleteFromGroup(r.conditions),
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    }));
  },

  addAction: (ruleId, action) => {
    const newAction: RuleAction = {
      id: `action-${uuidv4().slice(0, 8)}`,
      ...action,
    };
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              actions: [...r.actions, newAction],
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    }));
    return newAction;
  },

  updateAction: (ruleId, actionId, updates) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              actions: r.actions.map((a) =>
                a.id === actionId ? { ...a, ...updates } : a
              ),
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    })),

  deleteAction: (ruleId, actionId) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              actions: r.actions.filter((a) => a.id !== actionId),
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    })),

  reorderActions: (ruleId, actionIds) =>
    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              actions: actionIds
                .map((id) => r.actions.find((a) => a.id === id))
                .filter((a): a is RuleAction => a !== undefined),
              updatedAt: new Date().toISOString(),
            }
          : r
      ),
    })),

  toggleAction: (ruleId, actionId) => {
    const rule = get().rules.find((r) => r.id === ruleId);
    const action = rule?.actions.find((a) => a.id === actionId);
    if (!action) return;
    get().updateAction(ruleId, actionId, { enabled: !action.enabled });
  },

  addRuleSet: (ruleSet) => {
    const now = new Date().toISOString();
    const newRuleSet: RuleSet = {
      id: `ruleset-${uuidv4().slice(0, 8)}`,
      createdAt: now,
      updatedAt: now,
      ...ruleSet,
    };
    set((state) => ({ ruleSets: [...state.ruleSets, newRuleSet] }));
    return newRuleSet;
  },

  updateRuleSet: (ruleSetId, updates) =>
    set((state) => ({
      ruleSets: state.ruleSets.map((rs) =>
        rs.id === ruleSetId ? { ...rs, ...updates, updatedAt: new Date().toISOString() } : rs
      ),
    })),

  deleteRuleSet: (ruleSetId) =>
    set((state) => ({
      ruleSets: state.ruleSets.filter((rs) => rs.id !== ruleSetId),
    })),

  addRuleToSet: (ruleSetId, ruleId) =>
    set((state) => ({
      ruleSets: state.ruleSets.map((rs) =>
        rs.id === ruleSetId && !rs.rules.includes(ruleId)
          ? { ...rs, rules: [...rs.rules, ruleId], updatedAt: new Date().toISOString() }
          : rs
      ),
    })),

  removeRuleFromSet: (ruleSetId, ruleId) =>
    set((state) => ({
      ruleSets: state.ruleSets.map((rs) =>
        rs.id === ruleSetId
          ? { ...rs, rules: rs.rules.filter((id) => id !== ruleId), updatedAt: new Date().toISOString() }
          : rs
      ),
    })),

  testRule: async (ruleId, testData) => {
    const rule = get().rules.find((r) => r.id === ruleId);
    if (!rule) throw new Error('Rule not found');

    await new Promise((resolve) => setTimeout(resolve, 500));

    const conditionResults = rule.conditions.conditions.map((c) => ({
      conditionId: c.id,
      result: testData?.[c.sourceName ?? ''] !== undefined
        ? testData[c.sourceName!] === c.value
        : Math.random() > 0.5,
      actualValue: testData?.[c.sourceName ?? ''] as string | number | boolean | undefined,
    }));

    const allConditionsMet = conditionResults.every((c) => c.result);

    const actionResults = rule.actions.map((a) => ({
      actionId: a.id,
      status: (allConditionsMet && a.enabled ? 'success' : 'skipped') as 'success' | 'failed' | 'pending',
      errorMessage: undefined,
    }));

    const log: RuleExecutionLog = {
      id: `log-${uuidv4().slice(0, 8)}`,
      ruleId,
      ruleName: rule.name,
      triggeredAt: new Date().toISOString(),
      status: allConditionsMet ? 'success' : 'skipped',
      conditions: conditionResults,
      actions: actionResults,
      duration: Math.random() * 100,
    };

    get().addExecutionLog(log);

    return { success: allConditionsMet, logs: log };
  },

  executeRule: (ruleId) => {
    const rule = get().rules.find((r) => r.id === ruleId);
    if (!rule || !rule.enabled) return;

    set((state) => ({
      rules: state.rules.map((r) =>
        r.id === ruleId
          ? {
              ...r,
              lastTriggered: new Date().toISOString(),
              triggerCount: (r.triggerCount ?? 0) + 1,
            }
          : r
      ),
    }));
  },

  triggerRule: (ruleId) => {
    get().executeRule(ruleId);
  },

  addExecutionLog: (log) => {
    const fullLog: RuleExecutionLog = {
      id: `log-${uuidv4().slice(0, 8)}`,
      ...log,
    };
    set((state) => ({
      executionLogs: [fullLog, ...state.executionLogs].slice(0, 500),
    }));
  },

  clearExecutionLogs: () => set({ executionLogs: [] }),

  getExecutionLogsByRule: (ruleId) =>
    get().executionLogs.filter((log) => log.ruleId === ruleId),

  exportRule: (ruleId) => {
    const rule = get().rules.find((r) => r.id === ruleId);
    if (!rule) throw new Error('Rule not found');
    return JSON.stringify(rule, null, 2);
  },

  importRule: (jsonString) => {
    try {
      const rule = JSON.parse(jsonString) as Rule;
      if (!rule.id || !rule.name) return null;
      set((state) => ({ rules: [...state.rules, rule] }));
      return rule;
    } catch {
      return null;
    }
  },

  exportAllRules: () => JSON.stringify(get().rules, null, 2),

  importRules: (jsonString) => {
    try {
      const rules = JSON.parse(jsonString) as Rule[];
      if (!Array.isArray(rules)) return [];
      set((state) => ({ rules: [...state.rules, ...rules] }));
      return rules;
    } catch {
      return [];
    }
  },

  getRulesByType: (type) => get().rules.filter((r) => r.type === type),

  getRulesByStatus: (status) => get().rules.filter((r) => r.status === status),

  getEnabledRules: () => get().rules.filter((r) => r.enabled),
}));
