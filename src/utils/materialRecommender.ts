import { Material, DeviceInfo } from '@/types';

export const recommendMaterials = (
  deviceInfo: DeviceInfo | null,
  allMaterials: Material[],
  selectedMaterials: Material[]
): Material[] => {
  if (!deviceInfo) {
    return allMaterials.slice(0, 3);
  }

  const selectedIds = new Set(selectedMaterials.map(m => m.id));
  
  let recommended = allMaterials.filter(m => !selectedIds.has(m.id));
  
  const categoryPriority: Record<string, number> = {
    '控制器': 1,
    '电机': 2,
    '传感器': 3,
    '气动元件': 4,
    '传动件': 5,
    '减速器': 6
  };
  
  recommended.sort((a, b) => {
    const priorityA = categoryPriority[a.category] || 999;
    const priorityB = categoryPriority[b.category] || 999;
    return priorityA - priorityB;
  });
  
  return recommended.slice(0, 4);
};

export const compareMaterials = (materials: Material[]): Array<{
  name: string;
  category: string;
  price: number;
  specifications: Record<string, any>;
  supplier: string;
}> => {
  return materials.map(m => ({
    name: m.name,
    category: m.category,
    price: m.price,
    specifications: m.specifications,
    supplier: m.supplier
  }));
};

export const getTotalPrice = (materials: Material[]): number => {
  return materials.reduce((sum, m) => sum + m.price, 0);
};
