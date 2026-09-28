import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Package, ArrowRightLeft, Search, Plus, Minus, UserCheck, CheckCircle2 } from 'lucide-react';

const StorekeeperDashboard = () => {
  const { products, users, submitInventoryLoad } = useData();

  // Load to Rep form state
  const [selectedRepId, setSelectedRepId] = useState('');
  const [loadItems, setLoadItems] = useState({}); // { productId: qty }
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Filter active sales reps
  const salesReps = users.filter(u => u.role === 'sales_rep' && u.isActive);

  // Filter products
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQtyChange = (productId, delta, maxStock) => {
    setLoadItems(prev => {
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next < 0) return prev;
      if (next > maxStock) return prev; // Cannot load more than main stock
      
      const newItems = { ...prev, [productId]: next };
      if (next === 0) delete newItems[productId];
      return newItems;
    });
  };

  const handleSubmitLoad = () => {
    if (!selectedRepId) {
      alert('الرجاء اختيار المندوب.');
      return;
    }
    const itemsArray = Object.keys(loadItems).map(id => ({
      productId: id,
      qty: loadItems[id]
    }));
    
    if (itemsArray.length === 0) {
      alert('الرجاء تحديد كميات للتحميل.');
      return;
    }

    const res = submitInventoryLoad({
      repId: selectedRepId,
      items: itemsArray
    });

    if (res.success) {
      setSuccessMsg('تم تحميل البضاعة للمندوب بنجاح وتم تحديث الأرصدة.');
      setLoadItems({});
      setSelectedRepId('');
      setTimeout(() => setSuccessMsg(''), 5000);
    } else {
      alert(res.error || 'حدث خطأ أثناء التحميل.');
    }
  };

  const totalItemsToLoad = Object.values(loadItems).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          <span>لوحة تحكم أمين المخزن</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          إدارة المخزون الرئيسي، وتحميل البضائع للمناديب.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-700 dark:text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold text-sm">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col (RTL Right): Product List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-500" />
              المخزن الرئيسي
            </h2>
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="بحث في المخزن..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map(p => {
              const loadedQty = loadItems[p.id] || 0;
              const isOutOfStock = p.mainStock === 0;

              return (
                <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                  <img src={p.imageUrl} alt={p.name} className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950" />
                  <div className="flex-1">
                    <h3 className="font-bold text-sm line-clamp-1 text-slate-900 dark:text-white">{p.name}</h3>
                    <div className="flex justify-between items-center mt-1 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">{p.category}</span>
                      <span className={`font-mono font-bold ${isOutOfStock ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        متبقي: {p.mainStock - loadedQty}
                      </span>
                    </div>
                    
                    {/* Qty Selector */}
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">تحميل:</span>
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1" dir="ltr">
                        <button 
                          onClick={() => handleQtyChange(p.id, -1, p.mainStock)}
                          disabled={loadedQty === 0}
                          className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">{loadedQty}</span>
                        <button 
                          onClick={() => handleQtyChange(p.id, 1, p.mainStock)}
                          disabled={loadedQty === p.mainStock}
                          className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col (RTL Left): Load to Rep Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl sticky top-24">
            <h2 className="font-bold text-base flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3 text-slate-900 dark:text-white">
              <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
              تحميل بضاعة للمندوب
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-indigo-500" />
                  <span>اختر المندوب المستلم</span>
                </label>
                <select
                  value={selectedRepId}
                  onChange={(e) => setSelectedRepId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 cursor-pointer text-slate-900 dark:text-white"
                >
                  <option value="">-- اختر من القائمة --</option>
                  {salesReps.map(rep => (
                    <option key={rep.id} value={rep.id}>{rep.name}</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">ملخص التحميل</div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {Object.keys(loadItems).length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-4">لم يتم تحديد أي بضاعة للتحميل.</div>
                  ) : (
                    Object.entries(loadItems).map(([id, qty]) => {
                      const prod = products.find(p => p.id === id);
                      if (!prod) return null;
                      return (
                        <div key={id} className="flex justify-between items-center text-xs">
                          <span className="font-medium text-slate-700 dark:text-slate-300 line-clamp-1 flex-1">{prod.name}</span>
                          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-md ml-2">{qty}</span>
                        </div>
                      );
                    })
                  )}
                </div>
                
                {Object.keys(loadItems).length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center font-bold text-sm text-slate-900 dark:text-white">
                    <span>إجمالي الوحدات:</span>
                    <span className="font-mono">{totalItemsToLoad}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmitLoad}
                disabled={!selectedRepId || totalItemsToLoad === 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/20 disabled:shadow-none"
              >
                تأكيد التحميل
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StorekeeperDashboard;
