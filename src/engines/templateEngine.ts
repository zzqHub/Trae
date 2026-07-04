/**
 * 模板引擎
 * 支持变量替换、条件渲染、循环渲染、过滤器、模板嵌套和包含
 */

export interface TemplateFilters {
  [name: string]: (value: unknown, ...args: string[]) => unknown;
}

export interface TemplateIncludes {
  [name: string]: string;
}

export interface RenderOptions {
  filters?: TemplateFilters;
  includes?: TemplateIncludes;
}

const defaultFilters: TemplateFilters = {
  uppercase: (value) => String(value).toUpperCase(),
  lowercase: (value) => String(value).toLowerCase(),
  trim: (value) => String(value).trim(),
  capitalize: (value) => {
    const str = String(value);
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },
  default: (value, defaultValue) => (value === undefined || value === null || value === '' ? defaultValue : value),
  length: (value) => {
    if (Array.isArray(value) || typeof value === 'string') return value.length;
    if (typeof value === 'object' && value !== null) return Object.keys(value).length;
    return 0;
  },
  json: (value) => JSON.stringify(value, null, 2),
  replace: (value, search, replace) => String(value).replace(new RegExp(search, 'g'), replace),
  add: (value, num) => Number(value) + Number(num),
  subtract: (value, num) => Number(value) - Number(num),
  multiply: (value, num) => Number(value) * Number(num),
  divide: (value, num) => Number(value) / Number(num),
};

function getNestedValue(data: unknown, path: string): unknown {
  const keys = path.split('.');
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

function evaluateExpression(expr: string, data: Record<string, unknown>): unknown {
  const trimmed = expr.trim();
  
  if (trimmed === 'true') return true;
  if (trimmed === 'false') return false;
  if (trimmed === 'null') return null;
  if (trimmed === 'undefined') return undefined;
  
  const numMatch = trimmed.match(/^-?\d+\.?\d*$/);
  if (numMatch) return Number(trimmed);
  
  const strMatch = trimmed.match(/^["'](.+)["']$/);
  if (strMatch) return strMatch[1];
  
  return getNestedValue(data, trimmed);
}

function evaluateCondition(condition: string, data: Record<string, unknown>): boolean {
  const trimmed = condition.trim();
  
  const compareMatch = trimmed.match(/^(.+?)\s*(===|!==|==|!=|>=|<=|>|<)\s*(.+)$/);
  if (compareMatch) {
    const [, left, op, right] = compareMatch;
    const leftVal = evaluateExpression(left.trim(), data);
    const rightVal = evaluateExpression(right.trim(), data);
    
    switch (op) {
      case '===': return leftVal === rightVal;
      case '!==': return leftVal !== rightVal;
      case '==': return leftVal == rightVal;
      case '!=': return leftVal != rightVal;
      case '>=': return Number(leftVal) >= Number(rightVal);
      case '<=': return Number(leftVal) <= Number(rightVal);
      case '>': return Number(leftVal) > Number(rightVal);
      case '<': return Number(leftVal) < Number(rightVal);
    }
  }
  
  const notMatch = trimmed.match(/^!\s*(.+)$/);
  if (notMatch) {
    return !evaluateCondition(notMatch[1], data);
  }
  
  const andMatch = trimmed.match(/^(.+?)\s*&&\s*(.+)$/);
  if (andMatch) {
    return evaluateCondition(andMatch[1], data) && evaluateCondition(andMatch[2], data);
  }
  
  const orMatch = trimmed.match(/^(.+?)\s*\|\|\s*(.+)$/);
  if (orMatch) {
    return evaluateCondition(orMatch[1], data) || evaluateCondition(orMatch[2], data);
  }
  
  const value = evaluateExpression(trimmed, data);
  return Boolean(value);
}

function applyFilters(value: unknown, filterStr: string, filters: TemplateFilters): unknown {
  const filterParts = filterStr.split('|').map(f => f.trim());
  let result = value;
  
  for (const part of filterParts) {
    const argsMatch = part.match(/^(\w+)(?:\((.*)\))?$/);
    if (argsMatch) {
      const [, filterName, argsStr] = argsMatch;
      const filter = filters[filterName];
      if (filter) {
        const args = argsStr ? argsStr.split(',').map(a => a.trim().replace(/^["']|["']$/g, '')) : [];
        result = filter(result, ...args);
      }
    }
  }
  
  return result;
}

function findBlockEnd(template: string, startIndex: number, blockName: string): number {
  const openPattern = new RegExp(`\\{\\{#${blockName}\\s+[^}]+\\}\\}`, 'g');
  const closePattern = new RegExp(`\\{\\{/${blockName}\\}\\}`, 'g');
  
  let depth = 1;
  let index = startIndex;
  
  while (depth > 0 && index < template.length) {
    openPattern.lastIndex = index;
    closePattern.lastIndex = index;
    
    const openMatch = openPattern.exec(template);
    const closeMatch = closePattern.exec(template);
    
    if (!closeMatch) break;
    
    if (openMatch && openMatch.index < closeMatch.index) {
      depth++;
      index = openMatch.index + openMatch[0].length;
    } else {
      depth--;
      if (depth === 0) {
        return closeMatch.index;
      }
      index = closeMatch.index + closeMatch[0].length;
    }
  }
  
  return -1;
}

function renderEach(template: string, data: Record<string, unknown>, filters: TemplateFilters): string {
  const eachPattern = /\{\{#each\s+(\w+(?:\.\w+)*)\s*(?:as\s+(\w+))?\s*\}\}/;
  
  let result = template;
  let match = eachPattern.exec(result);
  
  while (match) {
    const [fullMatch, arrayPath, itemName] = match;
    const startIndex = match.index;
    const endIndex = findBlockEnd(result, startIndex + fullMatch.length, 'each');
    
    if (endIndex === -1) break;
    
    const contentStart = startIndex + fullMatch.length;
    const content = result.slice(contentStart, endIndex);
    const closeTagLength = '{{/each}}'.length;
    
    const arrayValue = getNestedValue(data, arrayPath);
    const items = Array.isArray(arrayValue) ? arrayValue : [];
    const itemVar = itemName || 'item';
    
    let rendered = '';
    for (let i = 0; i < items.length; i++) {
      const itemData: Record<string, unknown> = {
        ...data,
        [itemVar]: items[i],
        '@index': i,
        '@first': i === 0,
        '@last': i === items.length - 1,
        '@key': i,
      };
      rendered += renderTemplate(content, itemData, { filters });
    }
    
    result = result.slice(0, startIndex) + rendered + result.slice(endIndex + closeTagLength);
    match = eachPattern.exec(result);
  }
  
  return result;
}

function renderIf(template: string, data: Record<string, unknown>, filters: TemplateFilters): string {
  const ifPattern = /\{\{#if\s+(.+?)\s*\}\}/;
  
  let result = template;
  let match = ifPattern.exec(result);
  
  while (match) {
    const [fullMatch, condition] = match;
    const startIndex = match.index;
    const endIndex = findBlockEnd(result, startIndex + fullMatch.length, 'if');
    
    if (endIndex === -1) break;
    
    const contentStart = startIndex + fullMatch.length;
    const fullContent = result.slice(contentStart, endIndex);
    const closeTagLength = '{{/if}}'.length;
    
    const elifPattern = /\{\{elif\s+(.+?)\s*\}\}/g;
    const elsePattern = /\{\{else\}\}/;
    
    let trueContent = fullContent;
    let falseContent = '';
    
    const elseMatch = fullContent.match(elsePattern);
    if (elseMatch) {
      const elseIndex = elseMatch.index || 0;
      trueContent = fullContent.slice(0, elseIndex);
      falseContent = fullContent.slice(elseIndex + elseMatch[0].length);
    }
    
    elifPattern.lastIndex = 0;
    let elifMatch = elifPattern.exec(fullContent);
    let rendered = '';
    
    if (elifMatch && (!elseMatch || elifMatch.index < (elseMatch.index || Infinity))) {
      const branches: { condition: string; content: string }[] = [];
      
      let lastIndex = 0;
      let currentMatch: RegExpExecArray | null = elifMatch;
      
      while (currentMatch) {
        if (currentMatch.index > lastIndex) {
          branches.push({
            condition: '',
            content: fullContent.slice(lastIndex, currentMatch.index),
          });
        }
        lastIndex = currentMatch.index + currentMatch[0].length;
        branches[branches.length - 1].condition = currentMatch[1];
        
        currentMatch = elifPattern.exec(fullContent);
      }
      
      if (elseMatch && elseMatch.index > lastIndex) {
        branches.push({
          condition: 'true',
          content: fullContent.slice(elseMatch.index + elseMatch[0].length),
        });
      } else if (lastIndex < fullContent.length) {
        branches.push({
          condition: 'true',
          content: fullContent.slice(lastIndex),
        });
      }
      
      let conditionMet = false;
      for (const branch of branches) {
        if (!conditionMet && evaluateCondition(branch.condition, data)) {
          rendered = renderTemplate(branch.content, data, { filters });
          conditionMet = true;
        }
      }
    } else {
      const conditionResult = evaluateCondition(condition, data);
      rendered = conditionResult
        ? renderTemplate(trueContent, data, { filters })
        : renderTemplate(falseContent, data, { filters });
    }
    
    result = result.slice(0, startIndex) + rendered + result.slice(endIndex + closeTagLength);
    match = ifPattern.exec(result);
  }
  
  return result;
}

function renderIncludes(template: string, includes: TemplateIncludes, data: Record<string, unknown>, filters: TemplateFilters): string {
  const includePattern = /\{\{>\s*(\w+)\s*\}\}/g;
  
  return template.replace(includePattern, (_, name) => {
    const includeTemplate = includes[name];
    if (!includeTemplate) return '';
    return renderTemplate(includeTemplate, data, { filters, includes });
  });
}

function renderVariables(template: string, data: Record<string, unknown>, filters: TemplateFilters): string {
  const varPattern = /\{\{\s*([^{}]+?)\s*\}\}/g;
  
  return template.replace(varPattern, (_, expr: string) => {
    if (expr.startsWith('#') || expr.startsWith('/') || expr.startsWith('>') || expr.startsWith('elif')) {
      return _;
    }
    
    const filterIndex = expr.indexOf('|');
    if (filterIndex !== -1) {
      const varName = expr.slice(0, filterIndex).trim();
      const filterStr = expr.slice(filterIndex + 1);
      const value = evaluateExpression(varName, data);
      return String(applyFilters(value, filterStr, filters));
    }
    
    const value = evaluateExpression(expr, data);
    return value !== undefined && value !== null ? String(value) : '';
  });
}

export function renderTemplate(
  template: string,
  data: Record<string, unknown> = {},
  options: RenderOptions = {}
): string {
  const filters = { ...defaultFilters, ...(options.filters || {}) };
  const includes = options.includes || {};
  
  let result = template;
  
  result = renderIncludes(result, includes, data, filters);
  result = renderEach(result, data, filters);
  result = renderIf(result, data, filters);
  result = renderVariables(result, data, filters);
  
  return result;
}

export interface TemplateEngine {
  render: typeof renderTemplate;
  registerFilter: (name: string, fn: TemplateFilters[string]) => void;
  registerInclude: (name: string, template: string) => void;
  filters: TemplateFilters;
  includes: TemplateIncludes;
}

export function createTemplateEngine(): TemplateEngine {
  const filters: TemplateFilters = { ...defaultFilters };
  const includes: TemplateIncludes = {};
  
  return {
    render: (template, data, options) =>
      renderTemplate(template, data, {
        filters: { ...filters, ...(options?.filters || {}) },
        includes: { ...includes, ...(options?.includes || {}) },
      }),
    registerFilter: (name, fn) => {
      filters[name] = fn;
    },
    registerInclude: (name, template) => {
      includes[name] = template;
    },
    filters,
    includes,
  };
}

export const templateEngine = createTemplateEngine();
export default templateEngine;
