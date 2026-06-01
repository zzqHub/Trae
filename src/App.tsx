import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Dashboard } from "@/pages/Dashboard";
import { DeviceInfo } from "@/pages/DeviceInfo";
import { MaterialSelection } from "@/pages/MaterialSelection";
import { DrawingOutput } from "@/pages/DrawingOutput";
import { ProgramGeneration } from "@/pages/ProgramGeneration";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/device-info" element={<DeviceInfo />} />
          <Route path="/material-selection" element={<MaterialSelection />} />
          <Route path="/drawing-output" element={<DrawingOutput />} />
          <Route path="/program-generation" element={<ProgramGeneration />} />
        </Route>
      </Routes>
    </Router>
  );
}
