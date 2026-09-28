import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { Layers, Package, ShoppingCart, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SalesRepDashboard = () => {
  const { currentUser } = useAuth();
  const { products, subInventories, inventoryLogs, orders } = useData();

  // Get current rep's inventory
  const myInventory = subInventories[currentUser?.id] || [];

  // Enriched inventory data
  const myStockItems = myInventory.map(item => {
    const prod = products.find(p => p.id === item.productId);
    return {
      ...item,
      productName: prod?.name || 'منتج غير معروف',
      category: prod?.category || '',
      imageUrl: prod?.imageUrl || '',
      sellPrice: prod?.sellPrice || 0
    };
  });

  // Calculate some stats
  const totalItemsCount = myStockItems.reduce((sum, item) => sum + item.qty, 0);
  const totalStockValue = myStockItems.reduce((sum, item) => sum + (item.qty * item.sellPrice), 0);

  // My recent loads
  const myRecentLoads = inventoryLogs
    .filter(log => log.type === 'load' && log.targetRepId === currentUser?.id)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  // My recent sales
  const myRecentSales = orders
    .filter(o => o.createdBy === currentUser?.id)
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            <span>لوحة تحكم المندوب</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            مرحباً بك <span className="font-bold text-slate-700 dark:text-slate-300">{currentUser?.name}</span>. هنا يمكنك متابعة رصيدك من البضائع ومبيعاتك.
          </p>
        </div>
        <Link
          to="/pos"
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>فتح شاشة البيع (POS)</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="p-4 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200 dark:border-indigo-800">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-1">إجمالي القطع في العهدة</div>
            <div className="text-3xl font-mono font-bold text-slate-900 dark:text-white">{totalItemsCount}</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="p-4 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-1">قيمة البضاعة التقديرية</div>
            <div className="text-3xl font-mono font-bold text-slate-900 dark:text-white" dir="ltr">${totalStockValue.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Col: My Inventory */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            البضاعة الحالية في العهدة (مخزني الخاص)
          </h2>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full text-right text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                <tr>
                  <th className="p-4">المنتج</th>
                  <th className="p-4 text-center">الكمية المتبقية</th>
                  <th className="p-4 text-left">السعر (مفرد)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {myStockItems.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-slate-500 dark:text-slate-400">
                      ليس لديك بضاعة في العهدة حالياً. يرجى مراجعة أمين المخزن للتحميل.
                    </td>
                  </tr>
                ) : (
                  myStockItems.map(item => (
                    <tr key={item.productId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={item.imageUrl} alt={item.productName} className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">{item.productName}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{item.category}</div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full font-mono font-bold text-sm ${
                          item.qty <= 5 ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {item.qty}
                        </span>
                      </td>
                      <td className="p-4 text-left font-mono font-bold text-indigo-600 dark:text-indigo-400" dir="ltr">
                        ${item.sellPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Col: Recent Activity */}
        <div className="space-y-6">
          
          {/* Recent Sales */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">آخر المبيعات الخاصة بي</h3>
            <div className="space-y-3">
              {myRecentSales.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-4">لا توجد مبيعات بعد.</div>
              ) : (
                myRecentSales.map(order => (
                  <div key={order.id} className="text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300">{order.customerName}</span>
                      <span className="font-mono text-[10px] text-slate-400" dir="ltr">{new Date(order.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">{order.items.length} مواد</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Loads */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">آخر الاستلامات من المخزن</h3>
            <div className="space-y-3">
              {myRecentLoads.length === 0 ? (
                <div className="text-xs text-slate-500 text-center py-4">لم يتم استلام أي بضاعة بعد.</div>
              ) : (
                myRecentLoads.map(log => (
                  <div key={log.id} className="text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                        <ArrowRight className="w-3 h-3 text-indigo-500" />
                        من: {log.handledByName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400" dir="ltr">{new Date(log.timestamp).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 space-y-0.5">
                      {log.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="line-clamp-1">{it.name}</span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400">+{it.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default SalesRepDashboard;
