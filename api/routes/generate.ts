import { Router, type Request, type Response } from 'express';
import { getProjectTree } from '../services.js';
import { buildAST, generateCode, validateProject, generateBOM } from '../codegen.js';
import { authRequired, requirePermission } from '../middleware.js';
import { audit } from '../auth.js';
import type { Vendor } from '../../shared/types.js';

const router = Router();

// 冲突校验
router.post('/:id/validate', authRequired, requirePermission('project', 'read'), (req: Request, res: Response) => {
  const tree = getProjectTree(req.params.id);
  if (!tree) { res.status(404).json({ success: false, error: '项目不存在' }); return; }
  const result = validateProject(tree);
  res.json({ success: true, data: result });
});

// 生成 AST
router.post('/:id/ast', authRequired, requirePermission('project', 'read'), (req: Request, res: Response) => {
  const tree = getProjectTree(req.params.id);
  if (!tree) { res.status(404).json({ success: false, error: '项目不存在' }); return; }
  const ast = buildAST(tree);
  res.json({ success: true, data: ast });
});

// 导出
router.post('/:id/export', authRequired, requirePermission('export', 'write'), (req: Request, res: Response) => {
  const { vendor } = req.body || {};
  if (!['CODESYS', 'SIEMENS', 'OMRON'].includes(vendor)) {
    res.status(400).json({ success: false, error: 'vendor 必须为 CODESYS / SIEMENS / OMRON' });
    return;
  }
  const tree = getProjectTree(req.params.id);
  if (!tree) { res.status(404).json({ success: false, error: '项目不存在' }); return; }
  const ast = buildAST(tree);
  const files = generateCode(ast, vendor as Vendor);
  audit(req.user!.id, req.params.id, 'project.export', `导出 ${vendor}`);
  res.json({ success: true, data: files });
});

// BOM 输出
router.post('/:id/bom', authRequired, requirePermission('bom', 'read'), (req: Request, res: Response) => {
  const tree = getProjectTree(req.params.id);
  if (!tree) { res.status(404).json({ success: false, error: '项目不存在' }); return; }
  const r = generateBOM(tree);
  res.json({ success: true, data: r });
});

export default router;
