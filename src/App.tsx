import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/lib/stores';
import AppShell from '@/components/AppShell';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import NewProject from '@/pages/NewProject';
import ProjectWorkspace from '@/pages/ProjectWorkspace';
import Export from '@/pages/Export';
import Validate from '@/pages/Validate';
import BOM from '@/pages/BOM';
import Templates from '@/pages/Templates';
import Users from '@/pages/Users';
import Permissions from '@/pages/Permissions';

function Protected({ children }: { children: React.ReactNode }) {
  const { user, fetchMe } = useAuthStore();
  const location = useLocation();
  useEffect(() => {
    if (!user) fetchMe();
  }, [user]);
  // 显示加载中（fetchMe 完成前 user 为 null）
  if (!user) {
    const token = localStorage.getItem('xgc_token');
    if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
    return <div className="min-h-screen grid place-items-center text-cyan-brand text-sm">初始化...</div>;
  }
  return <AppShell>{children}</AppShell>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
        <Route path="/projects/new" element={<Protected><NewProject /></Protected>} />
        <Route path="/projects/:id" element={<Protected><ProjectWorkspace /></Protected>} />
        <Route path="/projects/:id/export" element={<Protected><Export /></Protected>} />
        <Route path="/projects/:id/validate" element={<Protected><Validate /></Protected>} />
        <Route path="/projects/:id/bom" element={<Protected><BOM /></Protected>} />
        <Route path="/templates" element={<Protected><Templates /></Protected>} />
        <Route path="/templates/:id" element={<Protected><Templates /></Protected>} />
        <Route path="/admin/users" element={<Protected><Users /></Protected>} />
        <Route path="/admin/permissions" element={<Protected><Permissions /></Protected>} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
