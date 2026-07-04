import { Router, type Request, type Response } from 'express';
import {
  listProjects, getProject, createProject, getProjectTree, updateProjectTree,
  listProjectVersions
} from '../services.js';
import { authRequired, requirePermission } from '../middleware.js';
import { audit } from '../auth.js';

const router = Router();

// 列表
router.get('/', authRequired, requirePermission('project', 'read'), (req: Request, res: Response) => {
  const list = listProjects(req.user!.id);
  res.json({ success: true, data: list });
});

// 详情
router.get('/:id', authRequired, requirePermission('project', 'read'), (req: Request, res: Response) => {
  const p = getProject(req.params.id);
  if (!p) { res.status(404).json({ success: false, error: '项目不存在' }); return; }
  res.json({ success: true, data: p });
});

// 新建
router.post('/', authRequired, requirePermission('project', 'write'), (req: Request, res: Response) => {
  const { name, industry, templateId } = req.body || {};
  if (!name || !industry || !templateId) {
    res.status(400).json({ success: false, error: '参数缺失' });
    return;
  }
  const p = createProject(name, industry, templateId, req.user!.id);
  if (!p) { res.status(400).json({ success: false, error: '模板不存在' }); return; }
  audit(req.user!.id, p.id, 'project.create', `创建项目 ${name}`);
  res.json({ success: true, data: p });
});

// 更新
router.patch('/:id', authRequired, requirePermission('project', 'write'), (req: Request, res: Response) => {
  const p = getProject(req.params.id);
  if (!p) { res.status(404).json({ success: false, error: '项目不存在' }); return; }
  const { name, status } = req.body || {};
  if (name) p.name = name;
  if (status) p.status = status;
  // 简化更新
  res.json({ success: true, data: p });
});

// 获取树
router.get('/:id/tree', authRequired, requirePermission('project', 'read'), (req: Request, res: Response) => {
  const tree = getProjectTree(req.params.id);
  if (!tree) { res.status(404).json({ success: false, error: '项目不存在' }); return; }
  res.json({ success: true, data: tree });
});

// 更新树 (带乐观锁 baseVersion)
router.patch('/:id/tree', authRequired, requirePermission('project', 'write'), (req: Request, res: Response) => {
  const { tree, baseVersion, changeNote } = req.body || {};
  if (!tree || !baseVersion) {
    res.status(400).json({ success: false, error: '参数缺失' });
    return;
  }
  const p = getProject(req.params.id);
  if (!p) { res.status(404).json({ success: false, error: '项目不存在' }); return; }
  if (p.currentVersion !== baseVersion) {
    res.status(409).json({
      success: false, error: '版本冲突，请合并',
      data: { currentVersion: p.currentVersion, serverTree: getProjectTree(p.id) }
    });
    return;
  }
  const r = updateProjectTree(p.id, tree, req.user!.id, changeNote || '更新节点');
  audit(req.user!.id, p.id, 'project.tree.update', changeNote || '更新节点');
  res.json({ success: true, data: r });
});

// 版本历史
router.get('/:id/versions', authRequired, requirePermission('project', 'read'), (req: Request, res: Response) => {
  const list = listProjectVersions(req.params.id);
  res.json({ success: true, data: list });
});

export default router;
