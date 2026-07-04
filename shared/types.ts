// 共享类型定义 - 前后端共用

export type Role = 'ADMIN' | 'ENGINEER' | 'GUEST' | 'TEMPLATE_MAINTAINER';
export type UserStatus = 'ACTIVE' | 'DISABLED';
export type ProjectStatus = 'DRAFT' | 'CONFIGURING' | 'VALIDATED' | 'EXPORTED' | 'ARCHIVED';
export type Vendor = 'CODESYS' | 'SIEMENS' | 'OMRON';
export type NodeType = 'PRG' | 'GVL' | 'FB' | 'FC' | 'STRUCT' | 'VAR';
export type PermissionAction = 'read' | 'write' | 'delete' | 'approve';
export type Resource = 'project' | 'template' | 'user' | 'permission' | 'export' | 'bom';

export interface User {
  id: string;
  username: string;
  role: Role;
  status: UserStatus;
  createdAt: number;
}

export interface UserWithToken extends User {
  token: string;
  permissions: PermissionMatrix;
}

export interface PermissionMatrix {
  // role -> resource -> actions
  [role: string]: {
    [resource in Resource]?: PermissionAction[];
  };
}

export interface Template {
  id: string;
  name: string;
  industry: string;
  currentVersionId: string | null;
  currentVersionNo: number;
  createdAt: number;
}

export interface TemplateVersion {
  id: string;
  templateId: string;
  versionNo: number;
  content: string; // JSON string
  note: string;
  createdBy: string;
  createdAt: number;
}

export interface Project {
  id: string;
  name: string;
  industry: string;
  templateId: string;
  templateVersionId: string;
  ownerId: string;
  ownerName?: string;
  status: ProjectStatus;
  currentVersion: number;
  collaborators?: string[];
  createdAt: number;
  updatedAt: number;
}

export type TreeNodeEditPerm = 'locked' | 'read' | 'write';

export interface TreeNode {
  id: string;
  parentId: string | null;
  type: NodeType;
  name: string;
  comment?: string;
  locked?: boolean;       // 根节点强制保留
  lockBy?: string | null; // 当前持锁用户名
  children: TreeNode[];
  // 业务绑定
  config?: Record<string, unknown>;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  versionNo: number;
  snapshot: string;
  changeNote: string;
  createdBy: string;
  createdAt: number;
}

export interface Conflict {
  level: 'error' | 'warning' | 'info';
  category: 'IO_ADDRESS' | 'STRUCT_NAME' | 'FB_INSTANCE' | 'SAFETY_SIGNAL' | 'OTHER';
  message: string;
  nodeId?: string;
  suggestion?: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: Conflict[];
  passRate: number;
}

export interface ASTNode {
  type: string;
  name: string;
  dataType?: string;
  value?: string;
  children?: ASTNode[];
  meta?: Record<string, unknown>;
}

export interface ExportFile {
  filename: string;
  content: string;
  language: string;
  size: number;
}

export interface BOMItem {
  no: number;
  device: string;
  spec: string;
  quantity: number;
  manufacturer: string;
  remark: string;
}

export interface EplanData {
  terminals: { no: number; signal: string; address: string; cable: string }[];
  cables: { no: string; from: string; to: string; cores: number; spec: string }[];
}

export interface PresenceUser {
  userId: string;
  username: string;
  color: string;
  cursor?: { nodeId: string };
}

// WebSocket 消息
export type WSMessage =
  | { type: 'join'; projectId: string }
  | { type: 'leave'; projectId: string }
  | { type: 'lock'; projectId: string; nodeId: string }
  | { type: 'unlock'; projectId: string; nodeId: string }
  | { type: 'edit'; projectId: string; nodeId: string; patch: unknown; baseVersion: number }
  | { type: 'presence'; users: PresenceUser[] }
  | { type: 'locked'; nodeId: string; by: string }
  | { type: 'unlocked'; nodeId: string }
  | { type: 'updated'; nodeId: string; patch: unknown; version: number }
  | { type: 'conflict'; nodeId: string; reason: string };

// 业务模块
export type ConfigModule =
  | 'structure'
  | 'safety'
  | 'workstation'
  | 'variable'
  | 'mainProgram'
  | 'module'
  | 'io'
  | 'alarm';

export interface ModuleConfig {
  module: ConfigModule;
  data: Record<string, unknown>;
  version: number;
}
