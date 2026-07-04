import type { ModuleType, PlcBrand } from './project';

export type TemplateCategory = 'device' | 'module' | 'station' | 'project';

export type TemplateVariableType = 'string' | 'number' | 'boolean' | 'enum' | 'ioAddress';

export interface TemplateVariable {
  id: string;
  name: string;
  label: string;
  type: TemplateVariableType;
  description?: string;
  required: boolean;
  defaultValue?: string | number | boolean;
  options?: TemplateVariableOption[];
  placeholder?: string;
}

export interface TemplateVariableOption {
  label: string;
  value: string | number;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category: TemplateCategory;
  moduleType?: ModuleType;
  plcBrands: PlcBrand[];
  variables: TemplateVariable[];
  content: TemplateContent;
  preview?: string;
  createdAt: string;
  updatedAt: string;
  usageCount?: number;
  author?: string;
}

export interface TemplateContent {
  code: string;
  variables?: Record<string, string>;
  ioMappings?: IoMapping[];
}

export interface IoMapping {
  variableName: string;
  ioType: 'DI' | 'DO' | 'AI' | 'AO';
  defaultAddress?: string;
}

export interface TemplateInstance {
  id: string;
  templateId: string;
  name: string;
  variables: Record<string, string | number | boolean>;
  createdAt: string;
}

export interface DeviceTemplate extends Template {
  category: 'device';
  deviceType: string;
}

export interface ModuleTemplate extends Template {
  category: 'module';
  moduleType: ModuleType;
}

export interface StationTemplate extends Template {
  category: 'station';
  deviceTemplates: string[];
  moduleTemplates: string[];
}

export interface ProjectTemplate extends Template {
  category: 'project';
  stationTemplates: string[];
}
