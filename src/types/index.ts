export interface DeviceInfo {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  specifications: Record<string, any>;
  price: number;
  supplier: string;
  image?: string;
}

export interface Drawing {
  id: string;
  name: string;
  type: '2d' | '3d';
  format: string;
  data: string;
  createdAt: Date;
}

export interface Program {
  id: string;
  name: string;
  language: string;
  code: string;
  version: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  status: 'draft' | 'in-progress' | 'completed';
  deviceInfo: DeviceInfo | null;
  selectedMaterials: Material[];
  drawings: Drawing[];
  programs: Program[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}
