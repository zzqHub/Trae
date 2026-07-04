import { create } from 'zustand';
import { api, setToken, collab } from '@/lib/api';
import type { User, PermissionMatrix } from '../../shared/types';

interface AuthState {
  user: User | null;
  permissions: PermissionMatrix | null;
  loading: boolean;
  error: string | null;
  login: (u: string, p: string) => Promise<void>;
  register: (u: string, p: string, code: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  permissions: null,
  loading: false,
  error: null,
  async login(username, password) {
    set({ loading: true, error: null });
    try {
      const r = await api.login(username, password);
      setToken(r.token);
      set({ user: r.user, permissions: r.permissions, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },
  async register(username, password, inviteCode) {
    set({ loading: true, error: null });
    try {
      const r = await api.register(username, password, inviteCode);
      setToken(r.token);
      set({ user: r.user, permissions: r.permissions, loading: false });
    } catch (e: any) {
      set({ loading: false, error: e.message });
      throw e;
    }
  },
  logout() {
    setToken(null);
    collab.disconnect();
    set({ user: null, permissions: null });
  },
  async fetchMe() {
    try {
      const r = await api.me();
      set({ user: r.user, permissions: r.permissions });
    } catch {
      setToken(null);
      set({ user: null });
    }
  },
}));

// UI 全局状态
interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  toast: { type: 'success' | 'error' | 'info' | 'warning'; msg: string } | null;
  showToast: (type: 'success' | 'error' | 'info' | 'warning', msg: string) => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toast: null,
  showToast(type, msg) {
    set({ toast: { type, msg } });
    setTimeout(() => set({ toast: null }), 3500);
  },
  clearToast: () => set({ toast: null }),
}));

// 协作状态
interface CollabState {
  presence: { userId: string; username: string; color: string }[];
  lockedNodes: Record<string, string>; // nodeId -> 锁定者用户名
  setPresence: (p: any[]) => void;
  setLocked: (nodeId: string, by: string) => void;
  setUnlocked: (nodeId: string) => void;
  reset: () => void;
}

export const useCollabStore = create<CollabState>((set) => ({
  presence: [],
  lockedNodes: {},
  setPresence(p) { set({ presence: p }); },
  setLocked(nodeId, by) { set((s) => ({ lockedNodes: { ...s.lockedNodes, [nodeId]: by } })); },
  setUnlocked(nodeId) { set((s) => {
    const next = { ...s.lockedNodes };
    delete next[nodeId];
    return { lockedNodes: next };
  }); },
  reset: () => set({ presence: [], lockedNodes: {} }),
}));
