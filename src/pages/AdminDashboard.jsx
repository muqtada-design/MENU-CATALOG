import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  TrendingUp, DollarSign, Package, Users, Shield, Layers, Plus, 
  Upload, Trash2, Edit3, CheckCircle2, AlertCircle, FileText, Search, UserCheck
} from 'lucide-react';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const { 
    products, users, customers, inventoryLogs, orders, 
    addProduct, updateProduct, deleteProduct, 
    addUser, updateUser, removeUser, toggleUserActive, addCustomer, getFinancialStats 
  } = useData();

  const [activeTab, setActiveTab] = useState('overview'); // overview, products, users, logs, customers

  // --- Product Creation Form State ---
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('إلكترونيات');
  const [prodBuyPrice, setProdBuyPrice] = useState('');
  const [prodSellPrice, setProdSellPrice] = useState('');
  const [prodMainStock, setProdMainStock] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // --- User Creation Form State ---
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('sales_rep');

  // --- Edit User Form State ---
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserId, setEditUserId] = useState(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserRole, setEditUserRole] = useState('');

  // --- Customer Creation Form State ---
  const [showAddCustModal, setShowAddCustModal] = useState(false);
  const [custStoreName, setCustStoreName] = useState('');
  const [custOwnerName, setCustOwnerName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custAddress, setCustAddress] = useState('');
  const [custBalance, setCustBalance] = useState('0');

  // Metrics calculation
  const stats = useMemo(() => getFinancialStats(), [orders, customers]);

  // Handle Image File Selection for Requirement #1
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!prodName || !prodBuyPrice || !prodSellPrice || !prodMainStock) return;

    setIsUploading(true);
    await addProduct({
      name: prodName,
      category: prodCategory,
      buyPrice: prodBuyPrice,
      sellPrice: prodSellPrice,
      mainStock: prodMainStock
    }, selectedImageFile);

    setIsUploading(false);
    setShowAddProductModal(false);
    setProdName('');
    setProdBuyPrice('');
    setProdSellPrice('');
    setProdMainStock('');
    setSelectedImageFile(null);
    setImagePreview('');
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!userName || !userEmail) return;
    addUser({ name: userName, email: userEmail, role: userRole });
    setShowAddUserModal(false);
    setUserName('');
    setUserEmail('');
  };

  const handleEditUserClick = (u) => {
    setEditUserId(u.id);
    setEditUserName(u.name);
    setEditUserRole(u.role);
    setShowEditUserModal(true);
  };

  const handleUpdateUserSubmit = async (e) => {
    e.preventDefault();
    if (!editUserName || !editUserRole || !editUserId) return;
    try {
      const userRef = doc(db, 'users', editUserId);
      await updateDoc(userRef, { name: editUserName, role: editUserRole });
    } catch (error) {
      console.warn("Firestore update skipped or failed:", error);
    }
    updateUser(editUserId, { name: editUserName, role: editUserRole });
    setShowEditUserModal(false);
  };

  const handleDeleteUserClick = async (userId) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الموظف؟ لا يمكن التراجع عن هذا الإجراء.")) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (error) {
        console.warn("Firestore delete skipped or failed:", error);
      }
      removeUser(userId);
    }
  };

  const handleCreateCustomer = (e) => {
    e.preventDefault();
    if (!custStoreName || !custOwnerName || !custPhone) return;
    addCustomer({
      storeName: custStoreName,
      ownerName: custOwnerName,
      phone: custPhone,
      address: custAddress,
      balance: parseFloat(custBalance) || 0
    });
    setShowAddCustModal(false);
    setCustStoreName('');
    setCustOwnerName('');
    setCustPhone('');
    setCustAddress('');
    setCustBalance('0');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 lg:p-8 transition-colors">
      
      {/* Admin Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-100 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight">لوحة تحكم التاجر (الإدارة)</h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            إدارة كاملة للمنتجات، حساب الأرباح، المستخدمين، وسجلات حركة المخزن.
          </p>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            نظرة عامة
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'products' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            المنتجات ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            فريق العمل ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'customers' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            الزبائن والديون
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'logs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            حركة المخزن ({inventoryLogs.length})
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          
          {/* Executive Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Total Profit */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">صافي الأرباح (الإجمالي)</span>
                <div className="text-2xl font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                  ${stats.totalProfit.toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500" dir="ltr">Margin: (Sell - Buy Price) * Qty</span>
              </div>
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            {/* Total Sales */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">إجمالي المبيعات</span>
                <div className="text-2xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                  ${stats.totalSales.toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{orders.length} طلب مكتمل</span>
              </div>
              <div className="p-3 bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            {/* Outstanding Debts */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">إجمالي ديون الزبائن</span>
                <div className="text-2xl font-mono font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                  ${stats.totalCustomerDebts.toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">أرصدة مستحقة الدفع</span>
              </div>
              <div className="p-3 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-200 dark:border-amber-800">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>

            {/* Products & Users */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">رصيد المخزن الرئيسي</span>
                <div className="text-2xl font-mono font-extrabold mt-1">
                  {products.reduce((acc, p) => acc + p.mainStock, 0)} <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">وحدة</span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500">{products.length} منتج مسجل</span>
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl border border-slate-200 dark:border-slate-700">
                <Package className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* Quick Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Recent Orders */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>أحدث الطلبيات</span>
              </h3>
              <div className="space-y-3">
                {orders.slice(0, 4).map(o => (
                  <div key={o.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold">{o.customerName}</div>
                      <div className="text-slate-500 dark:text-slate-400">بواسطة {o.createdByName} | <span dir="ltr">{new Date(o.createdAt).toLocaleDateString('en-GB')}</span></div>
                    </div>
                    <div className="text-left" dir="ltr">
                      <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${o.totalAmount.toFixed(2)}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Paid: ${o.paidAmount.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Inventory Logs */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl">
              <h3 className="font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>أحدث حركات المخزن</span>
              </h3>
              <div className="space-y-3">
                {inventoryLogs.slice(0, 4).map(log => (
                  <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        log.type === 'load' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                      }`}>
                        {log.type === 'load' ? 'تحميل للمندوب' : 'بيع مباشر'}
                      </span>
                      <div className="text-slate-700 dark:text-slate-300 mt-1 font-medium">بواسطة {log.handledByName}</div>
                      {log.targetRepName && <div className="text-slate-500 dark:text-slate-400 text-[11px]">إلى: {log.targetRepName}</div>}
                    </div>
                    <div className="text-left text-slate-500 dark:text-slate-400 text-[11px]" dir="ltr">
                      {new Date(log.timestamp).toLocaleString('en-GB')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">كتالوج المنتجات (المخزن الرئيسي)</h2>
            <button
              onClick={() => setShowAddProductModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة منتج جديد</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">المنتج</th>
                  <th className="p-4">الصنف</th>
                  <th className="p-4 text-left">سعر الشراء</th>
                  <th className="p-4 text-left">سعر البيع</th>
                  <th className="p-4 text-left">الربح / للوحدة</th>
                  <th className="p-4 text-center">الكمية المتوفرة</th>
                  <th className="p-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {products.map(p => {
                  const profitUnit = p.sellPrice - p.buyPrice;
                  const marginPct = p.buyPrice > 0 ? ((profitUnit / p.buyPrice) * 100).toFixed(0) : 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800" />
                        <div>
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono" dir="ltr">ID: {p.id}</div>
                        </div>
                      </td>
                      <td className="p-4"><span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg">{p.category}</span></td>
                      <td className="p-4 text-left font-mono text-slate-500 dark:text-slate-400" dir="ltr">${p.buyPrice.toFixed(2)}</td>
                      <td className="p-4 text-left font-mono text-indigo-600 dark:text-indigo-400 font-semibold" dir="ltr">${p.sellPrice.toFixed(2)}</td>
                      <td className="p-4 text-left font-mono text-emerald-600 dark:text-emerald-400 font-bold" dir="ltr">
                        +${profitUnit.toFixed(2)} <span className="text-[10px] text-emerald-500">({marginPct}%)</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full font-bold ${
                          p.mainStock <= 10 ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300'
                        }`}>
                          {p.mainStock} وحدة
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => deleteProduct(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="حذف المنتج"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEAM USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">إدارة فريق العمل والصلاحيات</h2>
            <button
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة موظف جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map(u => (
              <div key={u.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      u.role === 'admin' 
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800' 
                        : u.role === 'storekeeper' 
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' 
                          : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                    }`}>
                      {u.role === 'admin' ? 'التاجر' : u.role === 'sales_rep' ? 'المندوب' : 'أمين المخزن'}
                    </span>
                    <button
                      onClick={() => toggleUserActive(u.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold cursor-pointer ${
                        u.isActive ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {u.isActive ? 'نشط' : 'غير نشط'}
                    </button>
                  </div>
                  <h3 className="font-bold text-base">{u.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5" dir="ltr">{u.email}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] flex justify-between items-center">
                  <span className="text-slate-400 dark:text-slate-500 font-mono" dir="ltr">ID: {u.id}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleEditUserClick(u)}
                      className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                      title="تعديل الموظف"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    {currentUser?.id !== u.id && (
                      <button 
                        onClick={() => handleDeleteUserClick(u.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                        title="حذف الموظف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CUSTOMERS TAB */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">سجل الزبائن والديون المستحقة</h2>
            <button
              onClick={() => setShowAddCustModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة زبون جديد</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customers.map(c => (
              <div key={c.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xl space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base">{c.storeName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">المالك: {c.ownerName}</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800" dir="ltr">
                    ${c.balance.toFixed(2)} دين
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                  <div>هاتف: <span className="text-slate-700 dark:text-slate-200" dir="ltr">{c.phone}</span></div>
                  <div>العنوان: <span className="text-slate-700 dark:text-slate-200">{c.address}</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* INVENTORY LOGS TAB */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          <h2 className="text-lg font-bold">سجل الحركات وإدارة المخزن</h2>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="p-4">رقم الحركة</th>
                  <th className="p-4">نوع الحركة</th>
                  <th className="p-4">أمين المخزن</th>
                  <th className="p-4">المندوب المستلم</th>
                  <th className="p-4">المواد المحولة</th>
                  <th className="p-4 text-left">الوقت والتاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                {inventoryLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono text-slate-500 dark:text-slate-400" dir="ltr">{log.id}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        log.type === 'load' ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800' : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {log.type === 'load' ? 'تحميل' : 'بيع مباشر'}
                      </span>
                    </td>
                    <td className="p-4 font-medium">{log.handledByName}</td>
                    <td className="p-4 text-indigo-600 dark:text-indigo-400 font-medium">{log.targetRepName || 'N/A (بيع مباشر)'}</td>
                    <td className="p-4">
                      <ul className="space-y-0.5">
                        {log.items && log.items.map((item, idx) => (
                          <li key={idx}>
                            • {item.name}: <strong className="text-indigo-600 dark:text-indigo-400">{item.qty} وحدة</strong>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="p-4 text-left font-mono text-slate-500 dark:text-slate-400" dir="ltr">
                      {new Date(log.timestamp).toLocaleString('en-GB')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REQUIREMENT #1: ADD PRODUCT MODAL WITH IMAGE FILE UPLOAD TO FIREBASE STORAGE */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4">إضافة منتج جديد للمخزن</h3>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">اسم المنتج *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: شاشة تجارية 32 بوصة"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">الصنف</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="إلكترونيات">إلكترونيات</option>
                    <option value="أثاث مكتبي">أثاث مكتبي</option>
                    <option value="معدات">معدات</option>
                    <option value="تخزين">تخزين</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">الكمية (الرصيد الافتتاحي) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="100"
                    value={prodMainStock}
                    onChange={(e) => setProdMainStock(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">سعر الشراء ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150.00"
                    value={prodBuyPrice}
                    onChange={(e) => setProdBuyPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">سعر البيع ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="220.00"
                    value={prodSellPrice}
                    onChange={(e) => setProdSellPrice(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* REQUIREMENT #1: Input type="file" for direct Firebase Storage Upload */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <span>رفع صورة المنتج (تخزن في Firebase)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full text-xs text-slate-500 dark:text-slate-400 file:ml-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 cursor-pointer"
                />
                {imagePreview && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={imagePreview} alt="Preview" className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-800" />
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400">تم إرفاق الصورة بنجاح</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20"
                >
                  {isUploading ? 'جاري الرفع...' : 'حفظ المنتج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD USER MODAL */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4">إضافة موظف للنظام</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">الاسم الكامل *</label>
                <input type="text" required placeholder="مثال: سامي علي" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">البريد الإلكتروني *</label>
                <input type="email" required placeholder="sami@apex.com" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" dir="ltr" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">الصلاحية (الدور) *</label>
                <select value={userRole} onChange={(e) => setUserRole(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500">
                  <option value="sales_rep">مندوب مبيعات</option>
                  <option value="storekeeper">أمين مخزن</option>
                  <option value="admin">مدير (تاجر)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddUserModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold">إضافة الموظف</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {showEditUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4">تعديل بيانات الموظف</h3>
            <form onSubmit={handleUpdateUserSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">الاسم الكامل *</label>
                <input type="text" required placeholder="مثال: سامي علي" value={editUserName} onChange={(e) => setEditUserName(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">الصلاحية (الدور) *</label>
                <select value={editUserRole} onChange={(e) => setEditUserRole(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500">
                  <option value="sales_rep">مندوب مبيعات</option>
                  <option value="storekeeper">أمين مخزن</option>
                  <option value="admin">مدير (تاجر)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowEditUserModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer">حفظ التعديلات</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {showAddCustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4">إضافة زبون جملة</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">اسم المحل *</label>
                <input type="text" required placeholder="أسواق الريان" value={custStoreName} onChange={(e) => setCustStoreName(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">اسم صاحب المحل *</label>
                <input type="text" required placeholder="أحمد الريان" value={custOwnerName} onChange={(e) => setCustOwnerName(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">رقم الهاتف *</label>
                <input type="text" required placeholder="+964 770..." value={custPhone} onChange={(e) => setCustPhone(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" dir="ltr" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">العنوان</label>
                <input type="text" placeholder="بغداد، الكرادة" value={custAddress} onChange={(e) => setCustAddress(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">الديون السابقة (إن وجدت) $</label>
                <input type="number" step="0.01" value={custBalance} onChange={(e) => setCustBalance(e.target.value)} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 font-mono" dir="ltr" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button type="button" onClick={() => setShowAddCustModal(false)} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold">حفظ الزبون</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
