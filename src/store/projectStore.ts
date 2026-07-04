import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  Project,
  Station,
  Device,
  IoPoint,
  Module,
  MainProgram,
  ProgramBlock,
  Network,
  ProjectEvent,
  DeviceEvent,
  PlcBrand,
  DeviceType,
  ModuleType,
  IoType,
  Parameter,
  Variable,
  EventConfig,
  EventCondition,
  EventAction,
  AlarmConfig,
  StateTransition,
  StartLogicStep,
  StopLogicConfig,
  MainProgramConfig,
} from '../types';
import { mockProjects } from '../data';

export interface ProjectTreeSelectedNode {
  type: 'project' | 'station' | 'device' | 'module' | 'io' | 'mainProgram' | 'network' | 'devices' | 'modules' | 'events' | 'templates' | 'rules' | 'ai' | 'codeGen';
  id: string;
  stationId?: string;
  deviceId?: string;
  moduleId?: string;
  networkId?: string;
}

interface ProjectStore {
  projects: Project[];
  currentProjectId: string | null;
  selectedNode: ProjectTreeSelectedNode | null;
  events: ProjectEvent[];
  deviceEvents: DeviceEvent[];

  get currentProject(): Project | undefined;

  setCurrentProject: (projectId: string | null) => void;
  setSelectedNode: (node: ProjectTreeSelectedNode | null) => void;

  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'stations' | 'mainProgram' | 'eventConfigs' | 'mainProgramConfig'> & { stations?: Station[]; mainProgram?: MainProgram; eventConfigs?: EventConfig[]; mainProgramConfig?: MainProgramConfig }) => Project;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  duplicateProject: (projectId: string) => Project;

  addStation: (projectId: string, station: Omit<Station, 'id' | 'devices' | 'modules'> & { devices?: Device[]; modules?: Module[] }) => Station;
  updateStation: (projectId: string, stationId: string, updates: Partial<Station>) => void;
  deleteStation: (projectId: string, stationId: string) => void;
  reorderStations: (projectId: string, stationIds: string[]) => void;

  addDevice: (projectId: string, stationId: string, device: Omit<Device, 'id' | 'ioPoints'> & { ioPoints?: IoPoint[] }) => Device;
  updateDevice: (projectId: string, stationId: string, deviceId: string, updates: Partial<Device>) => void;
  deleteDevice: (projectId: string, stationId: string, deviceId: string) => void;

  addIoPoint: (projectId: string, stationId: string, deviceId: string, ioPoint: Omit<IoPoint, 'id'>) => IoPoint;
  updateIoPoint: (projectId: string, stationId: string, deviceId: string, ioId: string, updates: Partial<IoPoint>) => void;
  deleteIoPoint: (projectId: string, stationId: string, deviceId: string, ioId: string) => void;

  addModule: (projectId: string, stationId: string, module: Omit<Module, 'id' | 'inputParameters' | 'outputParameters' | 'inOutParameters' | 'staticVariables' | 'tempVariables'> & {
    inputParameters?: Parameter[];
    outputParameters?: Parameter[];
    inOutParameters?: Parameter[];
    staticVariables?: Variable[];
    tempVariables?: Variable[];
  }) => Module;
  updateModule: (projectId: string, stationId: string, moduleId: string, updates: Partial<Module>) => void;
  deleteModule: (projectId: string, stationId: string, moduleId: string) => void;

  updateMainProgram: (projectId: string, updates: Partial<MainProgram>) => void;
  addProgramBlock: (projectId: string, block: Omit<ProgramBlock, 'id'>) => ProgramBlock;
  updateProgramBlock: (projectId: string, blockId: string, updates: Partial<ProgramBlock>) => void;
  deleteProgramBlock: (projectId: string, blockId: string) => void;
  reorderProgramBlocks: (projectId: string, blockIds: string[]) => void;

  addNetwork: (projectId: string, network: Omit<Network, 'id'>) => Network;
  updateNetwork: (projectId: string, networkId: string, updates: Partial<Network>) => void;
  deleteNetwork: (projectId: string, networkId: string) => void;
  reorderNetworks: (projectId: string, networkIds: string[]) => void;

  addEvent: (event: Omit<ProjectEvent, 'id' | 'timestamp'>) => void;
  clearEvents: () => void;

  addDeviceEvent: (event: Omit<DeviceEvent, 'id' | 'timestamp'>) => void;
  clearDeviceEvents: () => void;

  addEventConfig: (projectId: string, event: Omit<EventConfig, 'id' | 'createdAt' | 'updatedAt'>) => EventConfig;
  updateEventConfig: (projectId: string, eventId: string, updates: Partial<EventConfig>) => void;
  deleteEventConfig: (projectId: string, eventId: string) => void;
  toggleEventConfigStatus: (projectId: string, eventId: string) => void;
  reorderEventConfigs: (projectId: string, eventIds: string[]) => void;

  addEventAction: (projectId: string, eventId: string, action: Omit<EventAction, 'id'>) => EventAction;
  updateEventAction: (projectId: string, eventId: string, actionId: string, updates: Partial<EventAction>) => void;
  deleteEventAction: (projectId: string, eventId: string, actionId: string) => void;

  updateMainProgramConfig: (projectId: string, updates: Partial<MainProgramConfig>) => void;

  addAlarm: (projectId: string, alarm: Omit<AlarmConfig, 'id'>) => AlarmConfig;
  updateAlarm: (projectId: string, alarmId: string, updates: Partial<AlarmConfig>) => void;
  deleteAlarm: (projectId: string, alarmId: string) => void;

  addStateTransition: (projectId: string, transition: Omit<StateTransition, 'id'>) => StateTransition;
  updateStateTransition: (projectId: string, transitionId: string, updates: Partial<StateTransition>) => void;
  deleteStateTransition: (projectId: string, transitionId: string) => void;

  addStartLogicStep: (projectId: string, step: Omit<StartLogicStep, 'id'>) => StartLogicStep;
  updateStartLogicStep: (projectId: string, stepId: string, updates: Partial<StartLogicStep>) => void;
  deleteStartLogicStep: (projectId: string, stepId: string) => void;
  reorderStartLogicSteps: (projectId: string, stepIds: string[]) => void;

  addStopLogicStep: (projectId: string, stopType: 'normal' | 'emergency' | 'safety', step: Omit<StartLogicStep, 'id'>) => StartLogicStep;
  updateStopLogicStep: (projectId: string, stopType: 'normal' | 'emergency' | 'safety', stepId: string, updates: Partial<StartLogicStep>) => void;
  deleteStopLogicStep: (projectId: string, stopType: 'normal' | 'emergency' | 'safety', stepId: string) => void;

  exportProject: (projectId: string) => string;
  importProject: (jsonString: string) => Project | null;
  exportAllProjects: () => string;
  importProjects: (jsonString: string) => Project[];
}

export type { ProjectStore };

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: mockProjects,
  currentProjectId: mockProjects.length > 0 ? mockProjects[0].id : null,
  selectedNode: null,
  events: [],
  deviceEvents: [],

  get currentProject() {
    const { projects, currentProjectId } = get();
    return projects.find((p) => p.id === currentProjectId);
  },

  setCurrentProject: (projectId) => set({ currentProjectId: projectId, selectedNode: null }),

  setSelectedNode: (node) => set({ selectedNode: node }),

  addProject: (project) => {
    const now = new Date().toISOString();
    const newProject: Project = {
      id: `proj-${uuidv4().slice(0, 8)}`,
      createdAt: now,
      updatedAt: now,
      stations: project.stations || [],
      mainProgram: project.mainProgram || {
        id: `main-${uuidv4().slice(0, 8)}`,
        name: '主程序',
        description: '',
        blocks: [],
        networks: [],
      },
      eventConfigs: [],
      mainProgramConfig: project.mainProgramConfig || {
        startLogic: [],
        stopLogic: {
          normal: { type: 'normal', name: '正常停止', description: '', steps: [] },
          emergency: { type: 'emergency', name: '紧急停止', description: '', steps: [] },
          safety: { type: 'safety', name: '安全停止', description: '', steps: [] },
        },
        alarms: [],
        stateTransitions: [],
      },
      ...project,
    };
    set((state) => ({ projects: [...state.projects, newProject] }));
    return newProject;
  },

  updateProject: (projectId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    })),

  deleteProject: (projectId) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
      currentProjectId: state.currentProjectId === projectId ? null : state.currentProjectId,
      selectedNode: state.selectedNode?.id === projectId ? null : state.selectedNode,
    })),

  duplicateProject: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');
    const now = new Date().toISOString();
    const idMap = new Map<string, string>();

    const generateId = (prefix: string, oldId: string) => {
      if (idMap.has(oldId)) return idMap.get(oldId)!;
      const newId = `${prefix}-${uuidv4().slice(0, 8)}`;
      idMap.set(oldId, newId);
      return newId;
    };

    const newProject: Project = JSON.parse(JSON.stringify(project));
    newProject.id = generateId('proj', project.id);
    newProject.name = `${project.name} 副本`;
    newProject.createdAt = now;
    newProject.updatedAt = now;

    newProject.stations = newProject.stations.map((station) => ({
      ...station,
      id: generateId('stn', station.id),
      devices: station.devices.map((device) => ({
        ...device,
        id: generateId('dev', device.id),
        ioPoints: device.ioPoints.map((io) => ({
          ...io,
          id: generateId('io', io.id),
        })),
      })),
      modules: station.modules.map((module) => ({
        ...module,
        id: generateId('mod', module.id),
        inputParameters: module.inputParameters.map((p) => ({ ...p, id: generateId('param', p.id) })),
        outputParameters: module.outputParameters.map((p) => ({ ...p, id: generateId('param', p.id) })),
        inOutParameters: module.inOutParameters.map((p) => ({ ...p, id: generateId('param', p.id) })),
        staticVariables: module.staticVariables.map((v) => ({ ...v, id: generateId('var', v.id) })),
        tempVariables: module.tempVariables.map((v) => ({ ...v, id: generateId('var', v.id) })),
      })),
    }));

    newProject.mainProgram = {
      ...newProject.mainProgram,
      id: generateId('main', project.mainProgram.id),
      blocks: newProject.mainProgram.blocks.map((b) => ({ ...b, id: generateId('block', b.id) })),
      networks: newProject.mainProgram.networks.map((n) => ({ ...n, id: generateId('net', n.id) })),
    };

    set((state) => ({ projects: [...state.projects, newProject] }));
    return newProject;
  },

  addStation: (projectId, station) => {
    const now = new Date().toISOString();
    const newStation: Station = {
      id: `stn-${uuidv4().slice(0, 8)}`,
      devices: station.devices || [],
      modules: station.modules || [],
      ...station,
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              stations: [...p.stations, newStation],
              updatedAt: now,
            }
          : p
      ),
    }));
    return newStation;
  },

  updateStation: (projectId, stationId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              stations: p.stations.map((s) => (s.id === stationId ? { ...s, ...updates } : s)),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  deleteStation: (projectId, stationId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              stations: p.stations.filter((s) => s.id !== stationId),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
      selectedNode: state.selectedNode?.stationId === stationId ? null : state.selectedNode,
    })),

  reorderStations: (projectId, stationIds) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              stations: stationIds
                .map((id) => p.stations.find((s) => s.id === id))
                .filter((s): s is Station => s !== undefined)
                .map((s, i) => ({ ...s, position: i + 1 })),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  addDevice: (projectId, stationId, device) => {
    const newDevice: Device = {
      id: `dev-${uuidv4().slice(0, 8)}`,
      ioPoints: device.ioPoints || [],
      ...device,
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              stations: p.stations.map((s) =>
                s.id === stationId
                  ? { ...s, devices: [...s.devices, newDevice] }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    return newDevice;
  },

  updateDevice: (projectId, stationId, deviceId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              stations: p.stations.map((s) =>
                s.id === stationId
                  ? {
                      ...s,
                      devices: s.devices.map((d) =>
                        d.id === deviceId ? { ...d, ...updates } : d
                      ),
                    }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  deleteDevice: (projectId, stationId, deviceId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              stations: p.stations.map((s) =>
                s.id === stationId
                  ? { ...s, devices: s.devices.filter((d) => d.id !== deviceId) }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
      selectedNode: state.selectedNode?.deviceId === deviceId ? null : state.selectedNode,
    })),

  addIoPoint: (projectId, stationId, deviceId, ioPoint) => {
    const newIoPoint: IoPoint = {
      id: `io-${uuidv4().slice(0, 8)}`,
      ...ioPoint,
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              stations: p.stations.map((s) =>
                s.id === stationId
                  ? {
                      ...s,
                      devices: s.devices.map((d) =>
                        d.id === deviceId
                          ? { ...d, ioPoints: [...d.ioPoints, newIoPoint] }
                          : d
                      ),
                    }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    return newIoPoint;
  },

  updateIoPoint: (projectId, stationId, deviceId, ioId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              stations: p.stations.map((s) =>
                s.id === stationId
                  ? {
                      ...s,
                      devices: s.devices.map((d) =>
                        d.id === deviceId
                          ? {
                              ...d,
                              ioPoints: d.ioPoints.map((io) =>
                                io.id === ioId ? { ...io, ...updates } : io
                              ),
                            }
                          : d
                      ),
                    }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  deleteIoPoint: (projectId, stationId, deviceId, ioId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              stations: p.stations.map((s) =>
                s.id === stationId
                  ? {
                      ...s,
                      devices: s.devices.map((d) =>
                        d.id === deviceId
                          ? { ...d, ioPoints: d.ioPoints.filter((io) => io.id !== ioId) }
                          : d
                      ),
                    }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  addModule: (projectId, stationId, module) => {
    const newModule: Module = {
      id: `mod-${uuidv4().slice(0, 8)}`,
      inputParameters: module.inputParameters || [],
      outputParameters: module.outputParameters || [],
      inOutParameters: module.inOutParameters || [],
      staticVariables: module.staticVariables || [],
      tempVariables: module.tempVariables || [],
      ...module,
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              stations: p.stations.map((s) =>
                s.id === stationId
                  ? { ...s, modules: [...s.modules, newModule] }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    return newModule;
  },

  updateModule: (projectId, stationId, moduleId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              stations: p.stations.map((s) =>
                s.id === stationId
                  ? {
                      ...s,
                      modules: s.modules.map((m) =>
                        m.id === moduleId ? { ...m, ...updates } : m
                      ),
                    }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  deleteModule: (projectId, stationId, moduleId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              stations: p.stations.map((s) =>
                s.id === stationId
                  ? { ...s, modules: s.modules.filter((m) => m.id !== moduleId) }
                  : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
      selectedNode: state.selectedNode?.moduleId === moduleId ? null : state.selectedNode,
    })),

  updateMainProgram: (projectId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgram: { ...p.mainProgram, ...updates },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  addProgramBlock: (projectId, block) => {
    const newBlock: ProgramBlock = {
      id: `block-${uuidv4().slice(0, 8)}`,
      ...block,
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgram: {
                ...p.mainProgram,
                blocks: [...p.mainProgram.blocks, newBlock].sort((a, b) => a.order - b.order),
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    return newBlock;
  },

  updateProgramBlock: (projectId, blockId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgram: {
                ...p.mainProgram,
                blocks: p.mainProgram.blocks.map((b) =>
                  b.id === blockId ? { ...b, ...updates } : b
                ),
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  deleteProgramBlock: (projectId, blockId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgram: {
                ...p.mainProgram,
                blocks: p.mainProgram.blocks.filter((b) => b.id !== blockId),
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  reorderProgramBlocks: (projectId, blockIds) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgram: {
                ...p.mainProgram,
                blocks: blockIds
                  .map((id) => p.mainProgram.blocks.find((b) => b.id === id))
                  .filter((b): b is ProgramBlock => b !== undefined)
                  .map((b, i) => ({ ...b, order: i + 1 })),
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  addNetwork: (projectId, network) => {
    const newNetwork: Network = {
      id: `net-${uuidv4().slice(0, 8)}`,
      ...network,
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgram: {
                ...p.mainProgram,
                networks: [...p.mainProgram.networks, newNetwork].sort((a, b) => a.order - b.order),
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    return newNetwork;
  },

  updateNetwork: (projectId, networkId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgram: {
                ...p.mainProgram,
                networks: p.mainProgram.networks.map((n) =>
                  n.id === networkId ? { ...n, ...updates } : n
                ),
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  deleteNetwork: (projectId, networkId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgram: {
                ...p.mainProgram,
                networks: p.mainProgram.networks.filter((n) => n.id !== networkId),
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
      selectedNode: state.selectedNode?.networkId === networkId ? null : state.selectedNode,
    })),

  reorderNetworks: (projectId, networkIds) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgram: {
                ...p.mainProgram,
                networks: networkIds
                  .map((id) => p.mainProgram.networks.find((n) => n.id === id))
                  .filter((n): n is Network => n !== undefined)
                  .map((n, i) => ({ ...n, order: i + 1 })),
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  addEvent: (event) => {
    const newEvent: ProjectEvent = {
      id: `evt-${uuidv4().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    set((state) => ({ events: [newEvent, ...state.events].slice(0, 100) }));
  },

  clearEvents: () => set({ events: [] }),

  addDeviceEvent: (event) => {
    const newEvent: DeviceEvent = {
      id: `dev-evt-${uuidv4().slice(0, 8)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    set((state) => ({ deviceEvents: [newEvent, ...state.deviceEvents].slice(0, 200) }));
  },

  clearDeviceEvents: () => set({ deviceEvents: [] }),

  addEventConfig: (projectId, event) => {
    const now = new Date().toISOString();
    const newEvent: EventConfig = {
      id: `event-cfg-${uuidv4().slice(0, 8)}`,
      createdAt: now,
      updatedAt: now,
      ...event,
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, eventConfigs: [...p.eventConfigs, newEvent], updatedAt: now }
          : p
      ),
    }));
    return newEvent;
  },

  updateEventConfig: (projectId, eventId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              eventConfigs: p.eventConfigs.map((e) =>
                e.id === eventId ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  deleteEventConfig: (projectId, eventId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              eventConfigs: p.eventConfigs.filter((e) => e.id !== eventId),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  toggleEventConfigStatus: (projectId, eventId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              eventConfigs: p.eventConfigs.map((e) =>
                e.id === eventId
                  ? { ...e, status: e.status === 'enabled' ? 'disabled' : 'enabled', updatedAt: new Date().toISOString() }
                  : e
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  reorderEventConfigs: (projectId, eventIds) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              eventConfigs: eventIds
                .map((id) => p.eventConfigs.find((e) => e.id === id))
                .filter((e): e is EventConfig => e !== undefined),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  addEventAction: (projectId, eventId, action) => {
    const newAction: EventAction = {
      id: `action-${uuidv4().slice(0, 8)}`,
      ...action,
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              eventConfigs: p.eventConfigs.map((e) =>
                e.id === eventId
                  ? {
                      ...e,
                      actions: [...e.actions, newAction].sort((a, b) => a.order - b.order),
                      updatedAt: new Date().toISOString(),
                    }
                  : e
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    return newAction;
  },

  updateEventAction: (projectId, eventId, actionId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              eventConfigs: p.eventConfigs.map((e) =>
                e.id === eventId
                  ? {
                      ...e,
                      actions: e.actions.map((a) => (a.id === actionId ? { ...a, ...updates } : a)),
                      updatedAt: new Date().toISOString(),
                    }
                  : e
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  deleteEventAction: (projectId, eventId, actionId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              eventConfigs: p.eventConfigs.map((e) =>
                e.id === eventId
                  ? { ...e, actions: e.actions.filter((a) => a.id !== actionId), updatedAt: new Date().toISOString() }
                  : e
              ),
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  updateMainProgramConfig: (projectId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgramConfig: { ...p.mainProgramConfig, ...updates },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  addAlarm: (projectId, alarm) => {
    const newAlarm: AlarmConfig = {
      id: `alarm-${uuidv4().slice(0, 8)}`,
      ...alarm,
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgramConfig: {
                ...p.mainProgramConfig,
                alarms: [...p.mainProgramConfig.alarms, newAlarm],
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    return newAlarm;
  },

  updateAlarm: (projectId, alarmId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgramConfig: {
                ...p.mainProgramConfig,
                alarms: p.mainProgramConfig.alarms.map((a) =>
                  a.id === alarmId ? { ...a, ...updates } : a
                ),
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  deleteAlarm: (projectId, alarmId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgramConfig: {
                ...p.mainProgramConfig,
                alarms: p.mainProgramConfig.alarms.filter((a) => a.id !== alarmId),
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  addStateTransition: (projectId, transition) => {
    const newTransition: StateTransition = {
      id: `trans-${uuidv4().slice(0, 8)}`,
      ...transition,
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgramConfig: {
                ...p.mainProgramConfig,
                stateTransitions: [...p.mainProgramConfig.stateTransitions, newTransition],
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    return newTransition;
  },

  updateStateTransition: (projectId, transitionId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgramConfig: {
                ...p.mainProgramConfig,
                stateTransitions: p.mainProgramConfig.stateTransitions.map((t) =>
                  t.id === transitionId ? { ...t, ...updates } : t
                ),
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  deleteStateTransition: (projectId, transitionId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgramConfig: {
                ...p.mainProgramConfig,
                stateTransitions: p.mainProgramConfig.stateTransitions.filter(
                  (t) => t.id !== transitionId
                ),
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  addStartLogicStep: (projectId, step) => {
    const newStep: StartLogicStep = {
      id: `step-${uuidv4().slice(0, 8)}`,
      ...step,
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgramConfig: {
                ...p.mainProgramConfig,
                startLogic: [...p.mainProgramConfig.startLogic, newStep].sort(
                  (a, b) => a.order - b.order
                ),
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    return newStep;
  },

  updateStartLogicStep: (projectId, stepId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgramConfig: {
                ...p.mainProgramConfig,
                startLogic: p.mainProgramConfig.startLogic.map((s) =>
                  s.id === stepId ? { ...s, ...updates } : s
                ),
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  deleteStartLogicStep: (projectId, stepId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgramConfig: {
                ...p.mainProgramConfig,
                startLogic: p.mainProgramConfig.startLogic.filter((s) => s.id !== stepId),
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  reorderStartLogicSteps: (projectId, stepIds) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgramConfig: {
                ...p.mainProgramConfig,
                startLogic: stepIds
                  .map((id) => p.mainProgramConfig.startLogic.find((s) => s.id === id))
                  .filter((s): s is StartLogicStep => s !== undefined)
                  .map((s, i) => ({ ...s, order: i + 1 })),
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  addStopLogicStep: (projectId, stopType, step) => {
    const newStep: StartLogicStep = {
      id: `step-${uuidv4().slice(0, 8)}`,
      ...step,
    };
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgramConfig: {
                ...p.mainProgramConfig,
                stopLogic: {
                  ...p.mainProgramConfig.stopLogic,
                  [stopType]: {
                    ...p.mainProgramConfig.stopLogic[stopType],
                    steps: [...p.mainProgramConfig.stopLogic[stopType].steps, newStep].sort(
                      (a, b) => a.order - b.order
                    ),
                  },
                },
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    }));
    return newStep;
  },

  updateStopLogicStep: (projectId, stopType, stepId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgramConfig: {
                ...p.mainProgramConfig,
                stopLogic: {
                  ...p.mainProgramConfig.stopLogic,
                  [stopType]: {
                    ...p.mainProgramConfig.stopLogic[stopType],
                    steps: p.mainProgramConfig.stopLogic[stopType].steps.map((s) =>
                      s.id === stepId ? { ...s, ...updates } : s
                    ),
                  },
                },
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  deleteStopLogicStep: (projectId, stopType, stepId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              mainProgramConfig: {
                ...p.mainProgramConfig,
                stopLogic: {
                  ...p.mainProgramConfig.stopLogic,
                  [stopType]: {
                    ...p.mainProgramConfig.stopLogic[stopType],
                    steps: p.mainProgramConfig.stopLogic[stopType].steps.filter(
                      (s) => s.id !== stepId
                    ),
                  },
                },
              },
              updatedAt: new Date().toISOString(),
            }
          : p
      ),
    })),

  exportProject: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) throw new Error('Project not found');
    return JSON.stringify(project, null, 2);
  },

  importProject: (jsonString) => {
    try {
      const project = JSON.parse(jsonString) as Project;
      if (!project.id || !project.name) return null;
      set((state) => ({ projects: [...state.projects, project] }));
      return project;
    } catch {
      return null;
    }
  },

  exportAllProjects: () => JSON.stringify(get().projects, null, 2),

  importProjects: (jsonString) => {
    try {
      const projects = JSON.parse(jsonString) as Project[];
      if (!Array.isArray(projects)) return [];
      set((state) => ({ projects: [...state.projects, ...projects] }));
      return projects;
    } catch {
      return [];
    }
  },
}));
