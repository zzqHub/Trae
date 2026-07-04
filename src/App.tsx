import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "@/pages/dashboard/Dashboard";
import AppLayout from "@/components/layout/AppLayout";
import DeviceConfig from "@/pages/device-config/DeviceConfig";
import StationConfig from "@/pages/station-config/StationConfig";
import ModuleConfig from "@/pages/module-config/ModuleConfig";
import IOConfig from "@/pages/io-config/IOConfig";
import EventConfig from "@/pages/event-config/EventConfig";
import MainProgramConfig from "@/pages/main-program/MainProgramConfig";
import TemplateManager from "@/pages/template/TemplateManager";
import RuleEngine from "@/pages/rules/RuleEngine";
import AIAssistant from "@/pages/ai-assistant/AIAssistant";
import CodeGenerator from "@/pages/code-gen/CodeGenerator";
import { useProjectStore } from "@/store";

function ProjectLayout({ children }: { children: React.ReactNode }) {
  const { currentProject } = useProjectStore();
  
  if (!currentProject) {
    return <Navigate to="/" replace />;
  }
  
  return <AppLayout>{children}</AppLayout>;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-950 text-dark-100">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          
          <Route 
            path="/project/:id/device" 
            element={
              <ProjectLayout>
                <DeviceConfig />
              </ProjectLayout>
            } 
          />
          <Route 
            path="/project/:id/station" 
            element={
              <ProjectLayout>
                <StationConfig />
              </ProjectLayout>
            } 
          />
          <Route 
            path="/project/:id/module" 
            element={
              <ProjectLayout>
                <ModuleConfig />
              </ProjectLayout>
            } 
          />
          <Route 
            path="/project/:id/io" 
            element={
              <ProjectLayout>
                <IOConfig />
              </ProjectLayout>
            } 
          />
          <Route 
            path="/project/:id/event" 
            element={
              <ProjectLayout>
                <EventConfig />
              </ProjectLayout>
            } 
          />
          <Route 
            path="/project/:id/main" 
            element={
              <ProjectLayout>
                <MainProgramConfig />
              </ProjectLayout>
            } 
          />
          <Route 
            path="/project/:id/template" 
            element={
              <ProjectLayout>
                <TemplateManager />
              </ProjectLayout>
            } 
          />
          <Route 
            path="/project/:id/rules" 
            element={
              <ProjectLayout>
                <RuleEngine />
              </ProjectLayout>
            } 
          />
          <Route 
            path="/project/:id/ai" 
            element={
              <ProjectLayout>
                <AIAssistant />
              </ProjectLayout>
            } 
          />
          <Route 
            path="/project/:id/generate" 
            element={
              <ProjectLayout>
                <CodeGenerator />
              </ProjectLayout>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}
