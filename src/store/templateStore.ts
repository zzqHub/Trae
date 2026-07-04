import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Template,
  TemplateVariable,
  TemplateContent,
  TemplateCategory,
  TemplateInstance,
} from '../types';
import { mockTemplates } from '../data';

interface TemplateStore {
  templates: Template[];
  currentTemplateId: string | null;
  isEditing: boolean;
  searchQuery: string;
  filterCategory: TemplateCategory | 'all';
  instances: TemplateInstance[];

  get currentTemplate(): Template | undefined;
  get filteredTemplates(): Template[];

  setCurrentTemplate: (templateId: string | null) => void;
  setIsEditing: (editing: boolean) => void;
  setSearchQuery: (query: string) => void;
  setFilterCategory: (category: TemplateCategory | 'all') => void;

  addTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'> & { usageCount?: number }) => Template;
  updateTemplate: (templateId: string, updates: Partial<Template>) => void;
  deleteTemplate: (templateId: string) => void;
  duplicateTemplate: (templateId: string) => Template;

  addVariable: (templateId: string, variable: Omit<TemplateVariable, 'id'>) => TemplateVariable;
  updateVariable: (templateId: string, variableId: string, updates: Partial<TemplateVariable>) => void;
  deleteVariable: (templateId: string, variableId: string) => void;
  reorderVariables: (templateId: string, variableIds: string[]) => void;

  updateTemplateContent: (templateId: string, content: Partial<TemplateContent>) => void;

  incrementUsageCount: (templateId: string) => void;

  createInstance: (templateId: string, name: string, variables: Record<string, string | number | boolean>) => TemplateInstance;
  deleteInstance: (instanceId: string) => void;
  getInstancesByTemplate: (templateId: string) => TemplateInstance[];

  exportTemplate: (templateId: string) => string;
  importTemplate: (jsonString: string) => Template | null;
  exportAllTemplates: () => string;
  importTemplates: (jsonString: string) => Template[];

  getTemplatesByCategory: (category: TemplateCategory) => Template[];
  getTemplatesByBrand: (brand: string) => Template[];
  getPopularTemplates: (limit?: number) => Template[];
  searchTemplates: (query: string) => Template[];
}

export type { TemplateStore };

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: mockTemplates,
  currentTemplateId: mockTemplates.length > 0 ? mockTemplates[0].id : null,
  isEditing: false,
  searchQuery: '',
  filterCategory: 'all',
  instances: [],

  get currentTemplate() {
    const { templates, currentTemplateId } = get();
    return templates.find((t) => t.id === currentTemplateId);
  },

  get filteredTemplates() {
    const { templates, searchQuery, filterCategory } = get();
    return templates.filter((t) => {
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      const matchesSearch =
        searchQuery === '' ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  },

  setCurrentTemplate: (templateId) => set({ currentTemplateId: templateId, isEditing: false }),

  setIsEditing: (editing) => set({ isEditing: editing }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilterCategory: (category) => set({ filterCategory: category }),

  addTemplate: (template) => {
    const now = new Date().toISOString();
    const newTemplate: Template = {
      id: `tpl-${uuidv4().slice(0, 8)}`,
      createdAt: now,
      updatedAt: now,
      usageCount: template.usageCount ?? 0,
      ...template,
    };
    set((state) => ({ templates: [...state.templates, newTemplate] }));
    return newTemplate;
  },

  updateTemplate: (templateId, updates) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === templateId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    })),

  deleteTemplate: (templateId) =>
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== templateId),
      currentTemplateId: state.currentTemplateId === templateId ? null : state.currentTemplateId,
    })),

  duplicateTemplate: (templateId) => {
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) throw new Error('Template not found');
    const now = new Date().toISOString();
    const idMap = new Map<string, string>();

    const generateId = (prefix: string, oldId: string) => {
      if (idMap.has(oldId)) return idMap.get(oldId)!;
      const newId = `${prefix}-${uuidv4().slice(0, 8)}`;
      idMap.set(oldId, newId);
      return newId;
    };

    const newTemplate: Template = JSON.parse(JSON.stringify(template));
    newTemplate.id = generateId('tpl', template.id);
    newTemplate.name = `${template.name} 副本`;
    newTemplate.createdAt = now;
    newTemplate.updatedAt = now;
    newTemplate.usageCount = 0;
    newTemplate.variables = newTemplate.variables.map((v) => ({
      ...v,
      id: generateId('var', v.id),
    }));

    set((state) => ({ templates: [...state.templates, newTemplate] }));
    return newTemplate;
  },

  addVariable: (templateId, variable) => {
    const newVariable: TemplateVariable = {
      id: `var-${uuidv4().slice(0, 8)}`,
      ...variable,
    };
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === templateId
          ? {
              ...t,
              variables: [...t.variables, newVariable],
              updatedAt: new Date().toISOString(),
            }
          : t
      ),
    }));
    return newVariable;
  },

  updateVariable: (templateId, variableId, updates) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === templateId
          ? {
              ...t,
              variables: t.variables.map((v) =>
                v.id === variableId ? { ...v, ...updates } : v
              ),
              updatedAt: new Date().toISOString(),
            }
          : t
      ),
    })),

  deleteVariable: (templateId, variableId) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === templateId
          ? {
              ...t,
              variables: t.variables.filter((v) => v.id !== variableId),
              updatedAt: new Date().toISOString(),
            }
          : t
      ),
    })),

  reorderVariables: (templateId, variableIds) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === templateId
          ? {
              ...t,
              variables: variableIds
                .map((id) => t.variables.find((v) => v.id === id))
                .filter((v): v is TemplateVariable => v !== undefined),
              updatedAt: new Date().toISOString(),
            }
          : t
      ),
    })),

  updateTemplateContent: (templateId, content) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === templateId
          ? {
              ...t,
              content: { ...t.content, ...content },
              updatedAt: new Date().toISOString(),
            }
          : t
      ),
    })),

  incrementUsageCount: (templateId) =>
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === templateId
          ? { ...t, usageCount: (t.usageCount ?? 0) + 1 }
          : t
      ),
    })),

  createInstance: (templateId, name, variables) => {
    const instance: TemplateInstance = {
      id: `inst-${uuidv4().slice(0, 8)}`,
      templateId,
      name,
      variables,
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ instances: [...state.instances, instance] }));
    get().incrementUsageCount(templateId);
    return instance;
  },

  deleteInstance: (instanceId) =>
    set((state) => ({
      instances: state.instances.filter((i) => i.id !== instanceId),
    })),

  getInstancesByTemplate: (templateId) =>
    get().instances.filter((i) => i.templateId === templateId),

  exportTemplate: (templateId) => {
    const template = get().templates.find((t) => t.id === templateId);
    if (!template) throw new Error('Template not found');
    return JSON.stringify(template, null, 2);
  },

  importTemplate: (jsonString) => {
    try {
      const template = JSON.parse(jsonString) as Template;
      if (!template.id || !template.name) return null;
      set((state) => ({ templates: [...state.templates, template] }));
      return template;
    } catch {
      return null;
    }
  },

  exportAllTemplates: () => JSON.stringify(get().templates, null, 2),

  importTemplates: (jsonString) => {
    try {
      const templates = JSON.parse(jsonString) as Template[];
      if (!Array.isArray(templates)) return [];
      set((state) => ({ templates: [...state.templates, ...templates] }));
      return templates;
    } catch {
      return [];
    }
  },

  getTemplatesByCategory: (category) =>
    get().templates.filter((t) => t.category === category),

  getTemplatesByBrand: (brand) =>
    get().templates.filter((t) => t.plcBrands.includes(brand as any)),

  getPopularTemplates: (limit = 10) =>
    [...get().templates]
      .sort((a, b) => (b.usageCount ?? 0) - (a.usageCount ?? 0))
      .slice(0, limit),

  searchTemplates: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().templates.filter(
      (t) =>
        t.name.toLowerCase().includes(lowerQuery) ||
        t.description?.toLowerCase().includes(lowerQuery)
    );
  },
}));
