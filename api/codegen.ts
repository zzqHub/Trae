import type { TreeNode, ASTNode, ExportFile, Vendor, BOMItem, EplanData, Conflict, ValidationResult } from '../shared/types.js';

// === AST 生成器：将配置树转换为统一抽象语法树 ===
export function buildAST(tree: TreeNode[]): ASTNode {
  const root = tree[0]; // PRG 主程序
  if (!root) {
    return { type: 'Program', name: 'MAIN', children: [] };
  }

  const programNode: ASTNode = {
    type: 'Program',
    name: root.name,
    meta: { comment: root.comment },
    children: [],
  };

  // 1. 全局变量声明 (GVL)
  const gvl = findNodeByType(root, 'GVL');
  if (gvl) {
    programNode.children!.push({
      type: 'VariableList',
      name: 'GVL',
      meta: { comment: gvl.comment },
      children: ((gvl.config?.fields as string[]) || []).map((f) => ({
        type: 'Variable',
        name: f,
        dataType: 'BOOL',
      })),
    });
  }

  // 2. 结构体声明 (STRUCT)
  findNodesByType(root, 'STRUCT').forEach((s) => {
    programNode.children!.push({
      type: 'StructDecl',
      name: s.name,
      meta: { comment: s.comment },
      children: ((s.config?.fields as any[]) || []).map((f) => ({
        type: 'Field',
        name: f.name,
        dataType: f.type,
      })),
    });
  });

  // 3. 功能块声明 (FB)
  findNodesByType(root, 'FB').forEach((fb) => {
    programNode.children!.push({
      type: 'FunctionBlock',
      name: fb.name,
      meta: { comment: fb.comment },
      children: ((fb.config?.pins as any[]) || []).map((p) => ({
        type: 'Pin',
        name: p.name,
        dataType: p.type,
        meta: { direction: p.dir },
      })),
    });
  });

  // 4. 功能函数声明 (FC)
  findNodesByType(root, 'FC').forEach((fc) => {
    programNode.children!.push({
      type: 'Function',
      name: fc.name,
      meta: { comment: fc.comment },
      children: [],
    });
  });

  // 5. 主程序调用序列
  const calls = (root.config?.methods as string[]) || ['Init', 'ManualMode', 'AutoMode', 'AlarmHandle', 'SafetyCheck'];
  programNode.children!.push({
    type: 'MainBody',
    name: root.name + '_Body',
    children: calls.map((m) => ({
      type: 'Call',
      name: m,
      dataType: 'VOID',
    })),
  });

  return programNode;
}

function findNodeByType(root: TreeNode, type: string): TreeNode | null {
  if (root.type === type) return root;
  for (const c of root.children || []) {
    const r = findNodeByType(c, type);
    if (r) return r;
  }
  return null;
}

function findNodesByType(root: TreeNode, type: string): TreeNode[] {
  const out: TreeNode[] = [];
  if (root.type === type) out.push(root);
  for (const c of root.children || []) {
    out.push(...findNodesByType(c, type));
  }
  return out;
}

// === 厂商适配器 ===
export function generateCode(ast: ASTNode, vendor: Vendor): ExportFile[] {
  switch (vendor) {
    case 'CODESYS':
      return generateCodesys(ast);
    case 'SIEMENS':
      return generateSiemens(ast);
    case 'OMRON':
      return generateOmron(ast);
  }
}

function generateCodesys(ast: ASTNode): ExportFile[] {
  const files: ExportFile[] = [];
  // GVL
  const gvl = ast.children?.find((c) => c.type === 'VariableList');
  if (gvl) {
    const content = `(* ${gvl.meta?.comment || 'Global Variables'} *)\nVAR_GLOBAL\n` +
      (gvl.children || []).map((v) => `    ${v.name} : ${v.dataType};`).join('\n') + '\nEND_VAR\n';
    files.push({ filename: 'GVL.st', content, language: 'iecst', size: content.length });
  }
  // STRUCT
  ast.children?.filter((c) => c.type === 'StructDecl').forEach((s) => {
    const content = `(* ${s.meta?.comment || ''} *)\nTYPE ${s.name} :\nSTRUCT\n` +
      (s.children || []).map((f) => `    ${f.name} : ${f.dataType};`).join('\n') + '\nEND_STRUCT\nEND_TYPE\n';
    files.push({ filename: `${s.name}.st`, content, language: 'iecst', size: content.length });
  });
  // FB
  ast.children?.filter((c) => c.type === 'FunctionBlock').forEach((fb) => {
    const inputs = (fb.children || []).filter((p) => p.meta?.direction === 'INPUT');
    const outputs = (fb.children || []).filter((p) => p.meta?.direction === 'OUTPUT');
    const content = `(* ${fb.meta?.comment || ''} *)\nFUNCTION_BLOCK ${fb.name}\n` +
      `VAR_INPUT\n` + inputs.map((p) => `    ${p.name} : ${p.dataType};`).join('\n') + '\nEND_VAR\n' +
      `VAR_OUTPUT\n` + outputs.map((p) => `    ${p.name} : ${p.dataType};`).join('\n') + '\nEND_VAR\n' +
      `\n(* TODO: FB 逻辑 *)\nEND_FUNCTION_BLOCK\n`;
    files.push({ filename: `${fb.name}.st`, content, language: 'iecst', size: content.length });
  });
  // FC
  ast.children?.filter((c) => c.type === 'Function').forEach((fc) => {
    const content = `(* ${fc.meta?.comment || ''} *)\nFUNCTION ${fc.name} : BOOL\n` +
      `VAR_INPUT\nEND_VAR\n\n(* TODO: FC 逻辑 *)\nEND_FUNCTION\n`;
    files.push({ filename: `${fc.name}.st`, content, language: 'iecst', size: content.length });
  });
  // PRG
  const body = ast.children?.find((c) => c.type === 'MainBody');
  if (body) {
    const content = `PROGRAM ${ast.name}\nVAR\nEND_VAR\n\n` +
      (body.children || []).map((c) => `${c.name}();`).join('\n') + '\nEND_PROGRAM\n';
    files.push({ filename: 'MAIN.st', content, language: 'iecst', size: content.length });
  }
  // PLCopenXML 摘要
  const xml = buildPLCopenXML(ast);
  files.push({ filename: 'project.plcopen.xml', content: xml, language: 'xml', size: xml.length });
  return files;
}

function generateSiemens(ast: ASTNode): ExportFile[] {
  const files: ExportFile[] = [];
  const lines: string[] = [`// === Siemens TIA STL 导出 ===`, `// 项目: ${ast.name}`];
  ast.children?.forEach((node) => {
    if (node.type === 'VariableList') {
      lines.push(`// ${node.meta?.comment || 'Global Variables'}`);
      (node.children || []).forEach((v) => lines.push(`  ${v.name} : ${v.dataType};`));
    } else if (node.type === 'StructDecl') {
      lines.push(`TYPE ${node.name}`);
      lines.push(`STRUCT`);
      (node.children || []).forEach((f) => lines.push(`  ${f.name} : ${f.dataType};`));
      lines.push(`END_STRUCT;`);
      lines.push(`END_TYPE`);
    } else if (node.type === 'FunctionBlock') {
      lines.push(`FUNCTION_BLOCK "${node.name}"`);
      lines.push(`VAR_INPUT`);
      (node.children || []).filter((p) => p.meta?.direction === 'INPUT').forEach((p) => lines.push(`  ${p.name} : ${p.dataType};`));
      lines.push(`END_VAR`);
      lines.push(`VAR_OUTPUT`);
      (node.children || []).filter((p) => p.meta?.direction === 'OUTPUT').forEach((p) => lines.push(`  ${p.name} : ${p.dataType};`));
      lines.push(`END_VAR`);
      lines.push(`BEGIN`);
      lines.push(`  // TODO: FB 逻辑`);
      lines.push(`END_FUNCTION_BLOCK`);
    } else if (node.type === 'Function') {
      lines.push(`FUNCTION "${node.name}" : BOOL`);
      lines.push(`BEGIN`);
      lines.push(`  // TODO: FC 逻辑`);
      lines.push(`END_FUNCTION`);
    } else if (node.type === 'MainBody') {
      lines.push(`ORGANIZATION_BLOCK "MAIN"`);
      lines.push(`BEGIN`);
      (node.children || []).forEach((c) => lines.push(`  CALL "${c.name}"`));
      lines.push(`END_ORGANIZATION_BLOCK`);
    }
  });
  const content = lines.join('\n') + '\n';
  files.push({ filename: 'project.stl', content, language: 'stl', size: content.length });
  return files;
}

function generateOmron(ast: ASTNode): ExportFile[] {
  const files: ExportFile[] = [];
  const lines: string[] = [`; === Omron CX-Programmer 导出 ===`, `; 项目: ${ast.name}`];
  ast.children?.forEach((node) => {
    if (node.type === 'VariableList') {
      lines.push(`; ${node.meta?.comment || 'Global Variables'}`);
      (node.children || []).forEach((v) => lines.push(`  ${v.name}  AT %W0 : ${v.dataType};`));
    } else if (node.type === 'StructDecl') {
      lines.push(`; STRUCT ${node.name}`);
      (node.children || []).forEach((f) => lines.push(`  ${f.name} : ${f.dataType};`));
    } else if (node.type === 'FunctionBlock') {
      lines.push(`; FUNCTION_BLOCK ${node.name}`);
      (node.children || []).forEach((p) => lines.push(`  ${p.meta?.direction} ${p.name} : ${p.dataType};`));
    } else if (node.type === 'Function') {
      lines.push(`; FUNCTION ${node.name}`);
    } else if (node.type === 'MainBody') {
      lines.push(`; MAIN PROGRAM`);
      (node.children || []).forEach((c) => lines.push(`  LD  ${c.name}`));
    }
  });
  const content = lines.join('\n') + '\n';
  files.push({ filename: 'project.cxp', content, language: 'text', size: content.length });
  return files;
}

function buildPLCopenXML(ast: ASTNode): string {
  const types = ast.children?.filter((c) => c.type === 'StructDecl').map((s) =>
    `      <dataType name="${s.name}">\n        <baseType>STRUCT</baseType>\n` +
    (s.children || []).map((f) => `        <variable name="${f.name}"><type><${f.dataType.toLowerCase()}/></type></variable>`).join('\n') +
    `\n      </dataType>`
  ).join('\n') || '';
  const pous = ast.children?.filter((c) => c.type === 'FunctionBlock' || c.type === 'Function' || c.type === 'MainBody').map((p) =>
    `      <pou name="${p.name}" pouType="${p.type === 'MainBody' ? 'program' : p.type === 'Function' ? 'function' : 'functionBlock'}">\n` +
    `        <interface>` +
    (p.children || []).map((v) => `<${(v.meta?.direction as string)?.toLowerCase() || 'local'} name="${v.name}"><type><${(v.dataType || 'BOOL').toLowerCase()}/></type></${(v.meta?.direction as string)?.toLowerCase() || 'local'}>`).join('') +
    `</interface>\n      </pou>`
  ).join('\n') || '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://www.plcopen.org/xml/tc6_0201">
  <fileHeader companyName="XGenCode" productName="XGenCode" productVersion="0.1" creationDateTime="${new Date().toISOString()}" />
  <contentHeader name="${ast.name}" modificationDateTime="${new Date().toISOString()}">
    <coordinateSystemInfo />
  </contentHeader>
  <types>
    <dataTypes>
${types}
    </dataTypes>
    <pous>
${pous}
    </pous>
  </types>
</project>
`;
}

// === 冲突校验 ===
export function validateProject(tree: TreeNode[]): ValidationResult {
  const issues: Conflict[] = [];
  const root = tree[0];
  if (!root) {
    issues.push({ level: 'error', category: 'OTHER', message: '项目根节点缺失' });
    return { ok: false, issues, passRate: 0 };
  }
  // 1. 根节点必须是 PRG 且锁定
  if (root.type !== 'PRG') {
    issues.push({ level: 'error', category: 'OTHER', message: '根节点必须为 PRG 主程序', nodeId: root.id });
  }
  // 2. 必须有 GVL
  if (!findNodesByTypeR(root, 'GVL').length) {
    issues.push({ level: 'error', category: 'OTHER', message: '缺少 GVL 全局变量区，根节点强制保留' });
  }
  // 3. 结构体重名
  const structNames = new Set<string>();
  findNodesByTypeR(root, 'STRUCT').forEach((s) => {
    if (structNames.has(s.name)) {
      issues.push({ level: 'error', category: 'STRUCT_NAME', message: `结构体重名: ${s.name}`, nodeId: s.id, suggestion: '重命名其中之一' });
    }
    structNames.add(s.name);
  });
  // 4. FB 实例命名冲突 (简化：FB 类型同名)
  const fbNames = new Set<string>();
  findNodesByTypeR(root, 'FB').forEach((fb) => {
    if (fbNames.has(fb.name)) {
      issues.push({ level: 'warning', category: 'FB_INSTANCE', message: `FB 同名: ${fb.name}`, nodeId: fb.id });
    }
    fbNames.add(fb.name);
  });
  // 5. 安全信号逻辑 (必须有急停变量)
  const gvl = findNodesByTypeR(root, 'GVL')[0];
  const fields = (gvl?.config?.fields as string[]) || [];
  if (!fields.some((f) => f.toLowerCase().includes('emergencystop') || f.toLowerCase().includes('estop'))) {
    issues.push({ level: 'warning', category: 'SAFETY_SIGNAL', message: 'GVL 缺少急停信号变量 (g_bEmergencyStop)', suggestion: '建议新增 g_bEmergencyStop : BOOL' });
  }
  // 6. IO 地址重复 (从 config.ioMap 检查，简化演示)
  const ioMap = (root.config?.ioMap as any[]) || [];
  const addrSet = new Set<string>();
  ioMap.forEach((io) => {
    if (addrSet.has(io.address)) {
      issues.push({ level: 'error', category: 'IO_ADDRESS', message: `IO 地址冲突: ${io.address}`, suggestion: '修改物理地址' });
    }
    addrSet.add(io.address);
  });

  const errors = issues.filter((i) => i.level === 'error').length;
  const ok = errors === 0;
  const passRate = Math.max(0, 100 - issues.length * 15);
  return { ok, issues, passRate };
}

function findNodesByTypeR(root: TreeNode, type: string): TreeNode[] {
  const out: TreeNode[] = [];
  if (root.type === type) out.push(root);
  for (const c of root.children || []) out.push(...findNodesByTypeR(c, type));
  return out;
}

// === BOM 与 EPLAN 输出 ===
export function generateBOM(tree: TreeNode[]): { bom: BOMItem[]; eplan: EplanData } {
  const bom: BOMItem[] = [];
  let no = 1;
  // 从 FB 推断设备清单
  const fbs = findNodesByTypeR(tree[0] || { type: 'PRG', name: '', id: '', parentId: null, children: [] }, 'FB');
  fbs.forEach((fb) => {
    let spec = '标准 I/O 模块';
    let qty = 1;
    let mf = '汇川';
    if (fb.name.includes('TripleLight')) { spec = '三色灯 24V'; qty = 1; mf = '施迈赛'; }
    else if (fb.name.includes('Cylinder')) { spec = '气缸 + 磁感应'; qty = 1; mf = 'SMC'; }
    else if (fb.name.includes('SafetyLightCurtain')) { spec = '安全光栅 4 级'; qty = 1; mf = 'Pilz'; }
    bom.push({ no: no++, device: fb.name, spec, quantity: qty, manufacturer: mf, remark: '基于 FB 实例推断' });
  });

  // EPLAN 端子排 / 电缆
  const terminals: EplanData['terminals'] = [];
  let tno = 1;
  fbs.forEach((fb) => {
    const pins = (fb.config?.pins as any[]) || [];
    pins.forEach((p) => {
      terminals.push({ no: tno++, signal: `${fb.name}.${p.name}`, address: `%I*${tno}`, cable: `W-${tno}` });
    });
  });
  const cables: EplanData['cables'] = fbs.map((fb, i) => ({
    no: `W-${i + 1}`,
    from: 'PLC-DI',
    to: fb.name,
    cores: ((fb.config?.pins as any[]) || []).length,
    spec: '0.75mm² 屏蔽',
  }));

  return { bom, eplan: { terminals, cables } };
}
