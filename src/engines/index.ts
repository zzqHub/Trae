/**
 * 核心引擎统一导出
 * 
 * 包含四大核心引擎:
 * - templateEngine: 模板引擎（变量替换、条件渲染、循环、过滤器）
 * - ruleEngine: 规则引擎（条件评估、动作执行、规则链、前向链式推理）
 * - aiEngine: AI引擎（智能代码补全、逻辑推荐、异常检测、自然语言生成）
 * - codeGenerator: 代码生成器（整合三大引擎，多品牌PLC程序生成）
 */

export * from './templateEngine';
export { default as templateEngine } from './templateEngine';

export * from './ruleEngine';
export { default as ruleEngine } from './ruleEngine';

export * from './aiEngine';
export { default as aiEngine } from './aiEngine';

export * from './codeGenerator';
export { default as codeGenerator } from './codeGenerator';
