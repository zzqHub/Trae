import { DeviceInfo, Material } from '@/types';

export const generateDrawing = (deviceInfo: DeviceInfo | null, materials: Material[]): string => {
  const width = 800;
  const height = 600;
  
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  
  svg += `<rect width="${width}" height="${height}" fill="#f8fafc"/>`;
  
  svg += `<text x="400" y="30" text-anchor="middle" font-size="24" font-weight="bold" fill="#1e3a8a">设备装配图</text>`;
  
  svg += `<rect x="200" y="150" width="400" height="250" fill="none" stroke="#1e3a8a" stroke-width="3" rx="10"/>`;
  svg += `<text x="400" y="290" text-anchor="middle" font-size="18" fill="#334155">主机体</text>`;
  
  svg += `<circle cx="200" cy="275" r="30" fill="#0ea5e9" stroke="#1e3a8a" stroke-width="2"/>`;
  svg += `<text x="200" y="280" text-anchor="middle" font-size="12" fill="white">电机</text>`;
  
  svg += `<rect x="550" y="225" width="50" height="100" fill="#f97316" stroke="#1e3a8a" stroke-width="2" rx="5"/>`;
  svg += `<text x="575" y="280" text-anchor="middle" font-size="12" fill="white">气缸</text>`;
  
  svg += `<line x1="230" y1="275" x2="300" y2="275" stroke="#64748b" stroke-width="2"/>`;
  svg += `<line x1="500" y1="275" x2="550" y2="275" stroke="#64748b" stroke-width="2"/>`;
  
  if (deviceInfo) {
    svg += `<text x="400" y="450" text-anchor="middle" font-size="14" fill="#475569">设备: ${deviceInfo.name}</text>`;
    svg += `<text x="400" y="475" text-anchor="middle" font-size="12" fill="#64748b">类型: ${deviceInfo.type}</text>`;
  }
  
  if (materials.length > 0) {
    svg += `<text x="400" y="500" text-anchor="middle" font-size="12" fill="#64748b">物料数量: ${materials.length}种</text>`;
  }
  
  svg += `<text x="700" y="580" text-anchor="end" font-size="12" fill="#94a3b8">生成时间: ${new Date().toLocaleString()}</text>`;
  
  svg += `</svg>`;
  
  return svg;
};

export const exportDrawing = (svgData: string, filename: string) => {
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.svg`;
  link.click();
  URL.revokeObjectURL(url);
};
