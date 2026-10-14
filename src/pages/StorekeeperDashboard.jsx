import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { Link } from 'react-router-dom';
import { 
  Package, ArrowRightLeft, Search, Plus, Minus, UserCheck, 
  CheckCircle2, AlertCircle, Layers, ShoppingCart, RotateCcw
} from 'lucide-react';
import { FALLBACK_PRODUCT_IMAGE } from '../firebase/defaultData';
import { formatIQD } from '../utils/currency';

const StorekeeperDashboard = () => {
  const { products, users, subInventories, submitInventoryLoad, submitInventoryReturn } = useData();

  // ── LOAD (تحميل بضاعة للمندوب) ──────────────────────────────────────────
  const [activeMode, setActiveMode] = useState('load'); // 'load' | 'return'
  const [selectedRepId, setSelectedRepId] = useState('');
  const [loadItems, setLoadItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── RETURN (إرجاع بضاعة من المندوب) ─────────────────────────────────────
  const [returnItems, setReturnItems] = useState({});
  const [returnSearch, setReturnSearch] = useState('');

  // Filter active sales reps
  const salesReps = users.filter(u => u.role === 'sales_rep' && u.isActive);

  // Auto-select first rep
  useEffect(() => {
    if (salesReps.length > 0 && (!selectedRepId || !salesReps.some(r => r.id === selectedRepId))) {
      setSelectedRepId(salesReps[0].id);
    }
  }, [salesReps, selectedRepId]);

  // Reset return items when rep or mode changes
  useEffect(() => {
    setReturnItems({});
    setLoadItems({});
    setErrorMsg('');
    setSuccessMsg('');
  }, [selectedRepId, activeMode]);

  // Products in main warehouse
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Rep's current stock for the selected rep
  const repStock = useMemo(() => {
    if (!selectedRepId) return [];
    return subInventories[selectedRepId] || [];
  }, [subInventories, selectedRepId]);

  // Rep's stock filtered by return search
  const filteredRepStock = useMemo(() => {
    return repStock.filter(item => {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) return false;
      const term = returnSearch.toLowerCase();
      return prod.name.toLowerCase().includes(term) || prod.category.toLowerCase().includes(term);
    });
  }, [repStock, products, returnSearch]);

  // ── LOAD Handlers ────────────────────────────────────────────────────────
  const handleQtyChange = (productId, delta, maxStock) => {
    setLoadItems(prev => {
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next < 0) return prev;
      if (next > maxStock) return prev;
      const newItems = { ...prev, [productId]: next };
      if (next === 0) delete newItems[productId];
      return newItems;
    });
  };

  const handleSubmitLoad = async () => {
    setErrorMsg('');
    if (!selectedRepId) { setErrorMsg('الرجاء اختيار المندوب المستلم.'); return; }
    const itemsArray = Object.keys(loadItems).map(id => ({
      productId: id,
      qty: Number(loadItems[id]) || 0
    })).filter(i => i.qty > 0);
    if (itemsArray.length === 0) { setErrorMsg('الرجاء تحديد كميات للتحميل.'); return; }

    setIsSubmitting(true);
    const res = await submitInventoryLoad({ repId: selectedRepId, items: itemsArray });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('تم تحميل البضاعة للمندوب بنجاح ✓');
      setLoadItems({});
      setTimeout(() => setSuccessMsg(''), 6000);
    } else {
      setErrorMsg('حدث خطأ أثناء التحميل: ' + res.error);
    }
  };

  // ── RETURN Handlers ──────────────────────────────────────────────────────
  const handleReturnQtyChange = (productId, delta, maxQty) => {
    setReturnItems(prev => {
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next < 0) return prev;
      if (next > maxQty) return prev;
      const newItems = { ...prev, [productId]: next };
      if (next === 0) delete newItems[productId];
      return newItems;
    });
  };

  const handleSubmitReturn = async () => {
    setErrorMsg('');
    if (!selectedRepId) { setErrorMsg('الرجاء اختيار المندوب.'); return; }
    const itemsArray = Object.keys(returnItems).map(id => ({
      productId: id,
      qty: Number(returnItems[id]) || 0
    })).filter(i => i.qty > 0);
    if (itemsArray.length === 0) { setErrorMsg('الرجاء تحديد كميات للإرجاع.'); return; }

    setIsSubmitting(true);
    const res = await submitInventoryReturn({ repId: selectedRepId, items: itemsArray });
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg('تم إرجاع البضاعة للمخزن الرئيسي بنجاح ✓');
      setReturnItems({});
      setTimeout(() => setSuccessMsg(''), 6000);
    } else {
      setErrorMsg('حدث خطأ أثناء الإرجاع: ' + res.error);
    }
  };

  const totalLoadUnits = Object.values(loadItems).reduce((s, q) => s + q, 0);
  const totalReturnUnits = Object.values(returnItems).reduce((s, q) => s + q, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>لوحة تحكم أمين المخزن</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            إدارة المخزون الرئيسي، تحميل البضائع للمناديب، وإرجاع البضاعة.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Layers className="w-4 h-4" />
            <span>إدارة وتعديل الأصناف</span>
          </Link>
          <Link
            to="/pos"
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>شاشة البيع</span>
          </Link>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl w-fit shadow-md">
        <button
          onClick={() => setActiveMode('load')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeMode === 'load'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          تحميل بضاعة للمندوب
        </button>
        <button
          onClick={() => setActiveMode('return')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            activeMode === 'return'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          إرجاع بضاعة من المندوب
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-700 dark:text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="font-semibold text-sm">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-400 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-semibold text-sm">{errorMsg}</span>
        </div>
      )}

      {/* Shared Rep Selector */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-md flex items-center gap-4">
        <UserCheck className="w-5 h-5 text-indigo-500 shrink-0" />
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 shrink-0">اختر المندوب:</label>
        <select
          value={selectedRepId}
          onChange={(e) => setSelectedRepId(e.target.value)}
          className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 cursor-pointer text-slate-900 dark:text-white"
        >
          {salesReps.length === 0 ? (
            <option value="">لا يوجد مناديب متاحين حالياً</option>
          ) : (
            salesReps.map(rep => (
              <option key={rep.id} value={rep.id}>{rep.name}</option>
            ))
          )}
        </select>
      </div>

      {/* ── LOAD MODE ────────────────────────────────────────────────────── */}
      {activeMode === 'load' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: Product List */}
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
                return (
                  <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                    <img 
                      src={p.image || p.imageUrl || FALLBACK_PRODUCT_IMAGE} 
                      alt={p.name} 
                      onError={(e) => { e.currentTarget.src = FALLBACK_PRODUCT_IMAGE; }}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shrink-0" 
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm line-clamp-1 text-slate-900 dark:text-white">{p.name}</h3>
                      <div className="flex justify-between items-center mt-1 text-xs">
                        <span className="text-slate-500 dark:text-slate-400">{p.category}</span>
                        <span className={`font-mono font-bold ${p.mainStock === 0 ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          متبقي: {p.mainStock - loadedQty}
                        </span>
                      </div>
                      <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono mt-0.5">{formatIQD(p.sellPrice)}</div>
                      
                      {/* Qty Selector */}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">تحميل:</span>
                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1" dir="ltr">
                          <button 
                            onClick={() => handleQtyChange(p.id, -1, p.mainStock)}
                            disabled={loadedQty === 0}
                            className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-mono text-sm font-bold text-indigo-600 dark:text-indigo-400">{loadedQty}</span>
                          <button 
                            onClick={() => handleQtyChange(p.id, 1, p.mainStock)}
                            disabled={loadedQty >= p.mainStock}
                            className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
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

          {/* Right Col: Load Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl sticky top-24">
              <h2 className="font-bold text-base flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3 text-slate-900 dark:text-white">
                <ArrowRightLeft className="w-5 h-5 text-indigo-500" />
                ملخص التحميل
              </h2>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">المواد المحددة</div>
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
                    <span className="font-mono">{totalLoadUnits}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmitLoad}
                disabled={!selectedRepId || totalLoadUnits === 0 || isSubmitting}
                className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-indigo-600/20 disabled:shadow-none cursor-pointer flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'جاري تأكيد التحميل...' : 'تأكيد التحميل للمندوب'}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* ── RETURN MODE ──────────────────────────────────────────────────── */}
      {activeMode === 'return' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col: Rep's Current Stock */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-rose-500" />
                عهدة المندوب الحالية
                {selectedRepId && (
                  <span className="text-rose-500 dark:text-rose-400 mr-1">
                    ({salesReps.find(r => r.id === selectedRepId)?.name})
                  </span>
                )}
              </h2>
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="بحث في عهدة المندوب..."
                  value={returnSearch}
                  onChange={(e) => setReturnSearch(e.target.value)}
                  className="w-full pr-9 pl-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {filteredRepStock.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400">
                <RotateCcw className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">لا توجد بضاعة في عهدة هذا المندوب.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredRepStock.map(repItem => {
                  const prod = products.find(p => p.id === repItem.productId);
                  if (!prod) return null;
                  const returnedQty = returnItems[repItem.productId] || 0;
                  const remainQty = (Number(repItem.qty) || 0) - returnedQty;

                  return (
                    <div key={repItem.productId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                      <img 
                        src={prod.image || prod.imageUrl || FALLBACK_PRODUCT_IMAGE} 
                        alt={prod.name} 
                        onError={(e) => { e.currentTarget.src = FALLBACK_PRODUCT_IMAGE; }}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-sm line-clamp-1 text-slate-900 dark:text-white">{prod.name}</h3>
                        <div className="flex justify-between items-center mt-1 text-xs">
                          <span className="text-slate-500 dark:text-slate-400">{prod.category}</span>
                          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                            متبقي: {remainQty}
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                          الكمية في العهدة: {repItem.qty}
                        </div>
                        
                        {/* Return Qty Selector */}
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[10px] text-rose-500 font-medium uppercase tracking-wider">إرجاع:</span>
                          <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg p-1" dir="ltr">
                            <button 
                              onClick={() => handleReturnQtyChange(repItem.productId, -1, Number(repItem.qty))}
                              disabled={returnedQty === 0}
                              className="p-1 text-rose-500 hover:text-rose-700 disabled:opacity-30 rounded hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-8 text-center font-mono text-sm font-bold text-rose-600 dark:text-rose-400">{returnedQty}</span>
                            <button 
                              onClick={() => handleReturnQtyChange(repItem.productId, 1, Number(repItem.qty))}
                              disabled={returnedQty >= Number(repItem.qty)}
                              className="p-1 text-rose-500 hover:text-rose-700 disabled:opacity-30 rounded hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
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
            )}
          </div>

          {/* Right Col: Return Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xl sticky top-24">
              <h2 className="font-bold text-base flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3 text-slate-900 dark:text-white">
                <RotateCcw className="w-5 h-5 text-rose-500" />
                ملخص الإرجاع
              </h2>

              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 text-xs text-rose-700 dark:text-rose-400 mb-4">
                <p className="font-semibold">⚠️ تنبيه:</p>
                <p className="mt-1">سيتم خصم الكميات المحددة من عهدة المندوب وإضافتها فوراً إلى المخزن الرئيسي.</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">المواد المُرجعة</div>
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {Object.keys(returnItems).length === 0 ? (
                    <div className="text-xs text-slate-400 text-center py-4">لم يتم تحديد أي بضاعة للإرجاع.</div>
                  ) : (
                    Object.entries(returnItems).map(([id, qty]) => {
                      const prod = products.find(p => p.id === id);
                      if (!prod) return null;
                      return (
                        <div key={id} className="flex justify-between items-center text-xs">
                          <span className="font-medium text-slate-700 dark:text-slate-300 line-clamp-1 flex-1">{prod.name}</span>
                          <span className="font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-md ml-2">{qty}</span>
                        </div>
                      );
                    })
                  )}
                </div>
                
                {Object.keys(returnItems).length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center font-bold text-sm text-slate-900 dark:text-white">
                    <span>إجمالي الوحدات:</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400">{totalReturnUnits}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleSubmitReturn}
                disabled={!selectedRepId || totalReturnUnits === 0 || isSubmitting}
                className="mt-4 w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold rounded-xl text-sm transition-colors shadow-lg shadow-rose-600/20 disabled:shadow-none cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                {isSubmitting ? 'جاري تأكيد الإرجاع...' : 'تأكيد الإرجاع للمخزن'}
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

export default StorekeeperDashboard;
