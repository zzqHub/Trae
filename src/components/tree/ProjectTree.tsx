import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Cpu,
  Settings,
  Bot,
  Code2,
  Blocks,
  Layers,
  Zap,
  FileCode,
  LayoutGrid,
  ScrollText,
  Sparkles,
  Gauge,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProjectStore } from '@/store';
import type { ProjectTreeSelectedNode } from '@/store';

type TreeNodeType =
  | 'project'
  | 'mainProgram'
  | 'station'
  | 'devices'
  | 'io'
  | 'modules'
  | 'events'
  | 'templates'
  | 'rules'
  | 'ai'
  | 'codeGen';

interface TreeNode {
  id: string;
  type: TreeNodeType;
  label: string;
  icon: React.ReactNode;
  children?: TreeNode[];
  stationId?: string;
}

interface TreeNodeItemProps {
  node: TreeNode;
  level: number;
  expandedNodes: Set<string>;
  selectedNode: ProjectTreeSelectedNode | null;
  onToggle: (id: string) => void;
  onSelect: (node: ProjectTreeSelectedNode) => void;
}

function TreeItem({ node, level, expandedNodes, selectedNode, onToggle, onSelect }: TreeNodeItemProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isSelected =
    selectedNode?.type === node.type && selectedNode?.id === node.id;

  const handleClick = useCallback(() => {
    if (hasChildren) {
      onToggle(node.id);
    }
    const selectNode: ProjectTreeSelectedNode = {
      type: node.type as ProjectTreeSelectedNode['type'],
      id: node.id,
    };
    if (node.stationId) {
      selectNode.stationId = node.stationId;
    }
    onSelect(selectNode);
  }, [node, hasChildren, onToggle, onSelect]);

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-1.5 py-1.5 px-2 cursor-pointer rounded transition-all duration-200 group',
          isSelected
            ? 'bg-industrial-600/20 text-industrial-300 border-l-2 border-industrial-500'
            : 'text-dark-300 hover:bg-dark-800/50 hover:text-dark-100 border-l-2 border-transparent'
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {hasChildren ? (
          <span className="w-4 h-4 flex items-center justify-center text-dark-500 group-hover:text-dark-300 transition-colors">
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </span>
        ) : (
          <span className="w-4 h-4" />
        )}
        <span className={cn('w-4 h-4 flex-shrink-0', isSelected ? 'text-industrial-400' : 'text-dark-400')}>
          {hasChildren ? (isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />) : node.icon}
        </span>
        <span className="text-sm truncate flex-1">{node.label}</span>
      </div>
      {hasChildren && (
        <div
          className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              selectedNode={selectedNode}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectTree() {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  const { currentProject, selectedNode, setSelectedNode } = useProjectStore();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(
    new Set(['project', 'stations'])
  );

  const toggleNode = useCallback((id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (node: ProjectTreeSelectedNode) => {
      setSelectedNode(node);
      
      if (!projectId) return;
      
      const routeMap: Record<string, string> = {
        mainProgram: `/project/${projectId}/main`,
        devices: `/project/${projectId}/device`,
        io: `/project/${projectId}/io`,
        modules: `/project/${projectId}/module`,
        events: `/project/${projectId}/event`,
        templates: `/project/${projectId}/template`,
        rules: `/project/${projectId}/rules`,
        ai: `/project/${projectId}/ai`,
        codeGen: `/project/${projectId}/generate`,
        station: `/project/${projectId}/station`,
      };
      
      const route = routeMap[node.type];
      if (route) {
        navigate(route);
      }
    },
    [setSelectedNode, navigate, projectId]
  );

  useEffect(() => {
    const path = window.location.pathname;
    let nodeType: string | null = null;
    
    if (path.includes('/device')) nodeType = 'devices';
    else if (path.includes('/station')) nodeType = 'station';
    else if (path.includes('/module')) nodeType = 'modules';
    else if (path.includes('/io')) nodeType = 'io';
    else if (path.includes('/event')) nodeType = 'events';
    else if (path.includes('/main')) nodeType = 'mainProgram';
    else if (path.includes('/template')) nodeType = 'templates';
    else if (path.includes('/rules')) nodeType = 'rules';
    else if (path.includes('/ai')) nodeType = 'ai';
    else if (path.includes('/generate')) nodeType = 'codeGen';
    
    if (nodeType && currentProject) {
      setSelectedNode({
        type: nodeType as ProjectTreeSelectedNode['type'],
        id: nodeType,
      });
    }
  }, [currentProject, setSelectedNode]);

  if (!currentProject) {
    return (
      <div className="p-4 text-center text-dark-500 text-sm">
        暂无项目数据
      </div>
    );
  }

  const stationNodes: TreeNode[] = currentProject.stations.map((station) => ({
    id: station.id,
    type: 'station',
    label: station.name,
    icon: <LayoutGrid className="w-4 h-4" />,
    stationId: station.id,
    children: [
      {
        id: `${station.id}-devices`,
        type: 'devices',
        label: '设备配置',
        icon: <Cpu className="w-4 h-4" />,
        stationId: station.id,
      },
      {
        id: `${station.id}-io`,
        type: 'io',
        label: 'IO配置',
        icon: <Zap className="w-4 h-4" />,
        stationId: station.id,
      },
      {
        id: `${station.id}-modules`,
        type: 'modules',
        label: '模块库',
        icon: <Blocks className="w-4 h-4" />,
        stationId: station.id,
      },
    ],
  }));

  const treeData: TreeNode[] = [
    {
      id: 'project',
      type: 'project',
      label: currentProject.name,
      icon: <Folder className="w-4 h-4" />,
      children: [
        {
          id: 'mainProgram',
          type: 'mainProgram',
          label: '主程序',
          icon: <FileCode className="w-4 h-4" />,
        },
        {
          id: 'stations',
          type: 'station',
          label: '工位程序',
          icon: <Layers className="w-4 h-4" />,
          children: stationNodes,
        },
        {
          id: 'events',
          type: 'events',
          label: '事件配置',
          icon: <ScrollText className="w-4 h-4" />,
        },
        {
          id: 'templates',
          type: 'templates',
          label: '模板管理',
          icon: <LayoutGrid className="w-4 h-4" />,
        },
        {
          id: 'rules',
          type: 'rules',
          label: '规则引擎',
          icon: <Gauge className="w-4 h-4" />,
        },
        {
          id: 'ai',
          type: 'ai',
          label: 'AI助手',
          icon: <Bot className="w-4 h-4" />,
        },
        {
          id: 'codeGen',
          type: 'codeGen',
          label: '代码生成',
          icon: <Code2 className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <div className="h-full overflow-y-auto py-2">
      <div className="px-3 py-2 text-xs font-medium text-dark-500 uppercase tracking-wider">
        项目结构
      </div>
      <div className="space-y-0.5">
        {treeData.map((node) => (
          <TreeItem
            key={node.id}
            node={node}
            level={0}
            expandedNodes={expandedNodes}
            selectedNode={selectedNode}
            onToggle={toggleNode}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}
