import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, ArrowRight, Search, Filter, CheckCircle2, Trash2, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { MaterialCard } from '@/components/MaterialCard';
import { Material } from '@/types';
import { recommendMaterials, getTotalPrice } from '@/utils/materialRecommender';

export const MaterialSelection = () => {
  const navigate = useNavigate();
  const { currentProject, materials, selectMaterial, removeMaterial } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">请先创建或选择一个项目</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const recommendedMaterials = useMemo(() => {
    return recommendMaterials(currentProject.deviceInfo, materials, currentProject.selectedMaterials);
  }, [currentProject.deviceInfo, materials, currentProject.selectedMaterials]);

  const categories = useMemo(() => {
    const cats = new Set(materials.map(m => m.category));
    return ['all', ...cats];
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
      const notSelected = !currentProject.selectedMaterials.find(sm => sm.id === m.id);
      return matchesSearch && matchesCategory && notSelected;
    });
  }, [materials, searchTerm, selectedCategory, currentProject.selectedMaterials]);

  const selectedMaterialIds = new Set(currentProject.selectedMaterials.map(m => m.id));
  const totalPrice = getTotalPrice(currentProject.selectedMaterials);

  const handleContinue = () => {
    navigate('/drawing-output');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">物料选型</h1>
          <p className="text-slate-500">选择适合您设备的物料</p>
        </div>
        {currentProject.selectedMaterials.length > 0 && (
          <button
            onClick={handleContinue}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            继续下一步
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {recommendedMaterials.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                智能推荐
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedMaterials.map(material => (
                  <MaterialCard
                    key={material.id}
                    material={material}
                    isSelected={selectedMaterialIds.has(material.id)}
                    onSelect={selectMaterial}
                    onRemove={removeMaterial}
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4">全部物料</h2>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="搜索物料..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? '全部分类' : cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMaterials.map(material => (
                <MaterialCard
                  key={material.id}
                  material={material}
                  isSelected={selectedMaterialIds.has(material.id)}
                  onSelect={selectMaterial}
                  onRemove={removeMaterial}
                />
              ))}
              {filteredMaterials.length === 0 && (
                <div className="col-span-2 text-center py-12">
                  <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">没有找到匹配的物料</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 sticky top-8">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              已选物料
            </h3>
            
            {currentProject.selectedMaterials.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">还没有选择物料</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-6 max-h-80 overflow-y-auto">
                  {currentProject.selectedMaterials.map(material => (
                    <div key={material.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 truncate">{material.name}</p>
                        <p className="text-sm text-slate-500">{material.category}</p>
                      </div>
                      <div className="flex items-center gap-2 ml-3">
                        <span className="font-bold text-slate-800">¥{material.price}</span>
                        <button
                          onClick={() => removeMaterial(material.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-600">总计</span>
                    <span className="text-2xl font-bold text-slate-800">¥{totalPrice}</span>
                  </div>
                  <button
                    onClick={handleContinue}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                  >
                    继续下一步
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
