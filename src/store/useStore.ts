import { create } from 'zustand';
import { Project, Material, DeviceInfo, Drawing, Program } from '@/types';

interface AppStore {
  currentProject: Project | null;
  projects: Project[];
  materials: Material[];
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  setMaterials: (materials: Material[]) => void;
  addMaterial: (material: Material) => void;
  setDeviceInfo: (deviceInfo: DeviceInfo) => void;
  selectMaterial: (material: Material) => void;
  removeMaterial: (materialId: string) => void;
  addDrawing: (drawing: Drawing) => void;
  addProgram: (program: Program) => void;
}

const initialMaterials: Material[] = [
  {
    id: '1',
    name: '伺服电机 SM-100',
    category: '电机',
    specifications: {
      power: '100W',
      voltage: '24V',
      torque: '0.32N·m',
      speed: '3000rpm'
    },
    price: 1200,
    supplier: '科技电子'
  },
  {
    id: '2',
    name: 'PLC控制器 CP-200',
    category: '控制器',
    specifications: {
      inputs: '16DI',
      outputs: '16DO',
      communication: 'EtherNet/IP',
      memory: '64KB'
    },
    price: 2500,
    supplier: '自动化科技'
  },
  {
    id: '3',
    name: '滚珠丝杆 LS-16',
    category: '传动件',
    specifications: {
      diameter: '16mm',
      lead: '5mm',
      length: '500mm',
      accuracy: 'C3'
    },
    price: 800,
    supplier: '精密机械'
  },
  {
    id: '4',
    name: '气缸 CY-40',
    category: '气动元件',
    specifications: {
      bore: '40mm',
      stroke: '100mm',
      pressure: '0.1-1.0MPa',
      type: '双作用'
    },
    price: 350,
    supplier: '气动元件'
  },
  {
    id: '5',
    name: '传感器 SEN-01',
    category: '传感器',
    specifications: {
      type: '光电',
      detection: '100mm',
      output: 'NPN',
      voltage: '12-24V'
    },
    price: 150,
    supplier: '传感技术'
  },
  {
    id: '6',
    name: '减速器 RD-50',
    category: '减速器',
    specifications: {
      ratio: '50:1',
      torque: '50N·m',
      input: '14mm',
      output: '20mm'
    },
    price: 1800,
    supplier: '传动科技'
  }
];

export const useStore = create<AppStore>((set, get) => ({
  currentProject: null,
  projects: [],
  materials: initialMaterials,
  
  setCurrentProject: (project) => set({ currentProject: project }),
  
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project],
    currentProject: project
  })),
  
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => p.id === id ? { ...p, ...updates } : p),
    currentProject: state.currentProject?.id === id 
      ? { ...state.currentProject, ...updates } 
      : state.currentProject
  })),
  
  setMaterials: (materials) => set({ materials }),
  
  addMaterial: (material) => set((state) => ({ 
    materials: [...state.materials, material] 
  })),
  
  setDeviceInfo: (deviceInfo) => {
    const { currentProject, updateProject } = get();
    if (currentProject) {
      updateProject(currentProject.id, { 
        deviceInfo, 
        progress: Math.max(currentProject.progress, 25) 
      });
    }
  },
  
  selectMaterial: (material) => {
    const { currentProject, updateProject } = get();
    if (currentProject) {
      const newMaterials = [...currentProject.selectedMaterials, material];
      updateProject(currentProject.id, { 
        selectedMaterials: newMaterials,
        progress: Math.max(currentProject.progress, 50)
      });
    }
  },
  
  removeMaterial: (materialId) => {
    const { currentProject, updateProject } = get();
    if (currentProject) {
      const newMaterials = currentProject.selectedMaterials.filter(m => m.id !== materialId);
      updateProject(currentProject.id, { selectedMaterials: newMaterials });
    }
  },
  
  addDrawing: (drawing) => {
    const { currentProject, updateProject } = get();
    if (currentProject) {
      const newDrawings = [...currentProject.drawings, drawing];
      updateProject(currentProject.id, { 
        drawings: newDrawings,
        progress: Math.max(currentProject.progress, 75)
      });
    }
  },
  
  addProgram: (program) => {
    const { currentProject, updateProject } = get();
    if (currentProject) {
      const newPrograms = [...currentProject.programs, program];
      updateProject(currentProject.id, { 
        programs: newPrograms,
        progress: 100,
        status: 'completed'
      });
    }
  }
}));
