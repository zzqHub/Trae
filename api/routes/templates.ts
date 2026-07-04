import { Router, type Request, type Response } from 'express';
import {
  listTemplates, getTemplate, listTemplateVersions, createTemplate,
  addTemplateVersion, rollbackTemplate, getTemplateVersion
} from '../services.js';
import { authRequired, requirePermission } from '../middleware.js';
import { audit } from '../auth.js';

const router = Router();

router.get('/', authRequired, requirePermission('template', 'read'), (_req: Request, res: Response) => {
  res.json({ success: true, data: listTemplates() });
});

router.get('/:id', authRequired, requirePermission('template', 'read'), (req: Request, res: Response) => {
  const t = getTemplate(req.params.id);
  if (!t) { res.status(404).json({ success: false, error: '模板不存在' }); return; }
  res.json({ success: true, data: t });
});

router.get('/:id/versions', authRequired, requirePermission('template', 'read'), (req: Request, res: Response) => {
  res.json({ success: true, data: listTemplateVersions(req.params.id) });
});

router.get('/:id/versions/:vid', authRequired, requirePermission('template', 'read'), (req: Request, res: Response) => {
  const v = getTemplateVersion(req.params.vid);
  if (!v) { res.status(404).json({ success: false, error: '版本不存在' }); return; }
  res.json({ success: true, data: v });
});

router.post('/', authRequired, requirePermission('template', 'write'), (req: Request, res: Response) => {
  const { name, industry, content } = req.body || {};
  if (!name || !industry || !content) {
    res.status(400).json({ success: false, error: '参数缺失' });
    return;
  }
  const t = createTemplate(name, industry, content, req.user!.id);
  audit(req.user!.id, null, 'template.create', `创建模板 ${name}`);
  res.json({ success: true, data: t });
});

router.post('/:id/versions', authRequired, requirePermission('template', 'write'), (req: Request, res: Response) => {
  const { content, note } = req.body || {};
  if (!content) { res.status(400).json({ success: false, error: '参数缺失' }); return; }
  const v = addTemplateVersion(req.params.id, content, note || '新版本', req.user!.id);
  audit(req.user!.id, null, 'template.version.add', `模板 ${req.params.id} 新增版本`);
  res.json({ success: true, data: v });
});

router.post('/:id/rollback', authRequired, requirePermission('template', 'approve'), (req: Request, res: Response) => {
  const { versionId } = req.body || {};
  if (!versionId) { res.status(400).json({ success: false, error: '缺少 versionId' }); return; }
  const t = rollbackTemplate(req.params.id, versionId);
  if (!t) { res.status(404).json({ success: false, error: '模板或版本不存在' }); return; }
  audit(req.user!.id, null, 'template.rollback', `模板 ${req.params.id} 回滚到 ${versionId}`);
  res.json({ success: true, data: t });
});

export default router;
