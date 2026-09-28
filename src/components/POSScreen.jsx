import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import ReceiptModal from './ReceiptModal';
import { 
  Search, User, ShoppingCart, DollarSign, Plus, Minus, Trash2, 
  Receipt, Store, Phone, MapPin, AlertTriangle
} from 'lucide-react';

const POSScreen = () => {
  const { currentUser, userRole } = useAuth();
  const { products, customers, subInventories, createPOSOrder } = useData();

  // Selected customer state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  
  // Product search state
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('الكل');

  // Invoice Cart State: [{ product, qty, price }]
  const [cart, setCart] = useState([]);
  
  // Payment Input
  const [paidAmount, setPaidAmount] = useState('');
  
  // Completed Order for Receipt Modal
  const [completedOrder, setCompletedOrder] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Active customer object
  const selectedCustomer = useMemo(() => {
    if (selectedCustomerId === 'cash_customer') {
      return { id: 'cash_customer', storeName: 'زبون نقدي', ownerName: '-', phone: '-', address: '-', balance: 0 };
    }
    return customers.find(c => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Available stock items depending on user role
  const availableProducts = useMemo(() => {
    if (userRole === 'sales_rep') {
      const repStock = subInventories[currentUser?.id] || [];
      return products.map(prod => {
        const itemInSub = repStock.find(s => s.productId === prod.id);
        const subQty = itemInSub ? itemInSub.qty : 0;
        return {
          ...prod,
          availableStock: subQty
        };
      }).filter(p => p.availableStock > 0 || productSearch.length > 0);
    } else {
      // Storekeeper direct sale from mainStock
      return products.map(prod => ({
        ...prod,
        availableStock: prod.mainStock
      }));
    }
  }, [products, subInventories, currentUser, userRole, productSearch]);

  // Filtered product catalog for autocomplete/search
  const filteredProducts = useMemo(() => {
    return availableProducts.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                            p.category.toLowerCase().includes(productSearch.toLowerCase());
      const matchesCategory = categoryFilter === 'الكل' || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [availableProducts, productSearch, categoryFilter]);

  // Available Categories
  const categories = useMemo(() => {
    const set = new Set(products.map(p => p.category));
    return ['الكل', ...Array.from(set)];
  }, [products]);

  // Cart Calculations
  const invoiceSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }, [cart]);

  const previousDebt = selectedCustomer ? (selectedCustomer.balance || 0) : 0;
  const grandTotal = invoiceSubtotal + previousDebt;
  
  const numPaid = parseFloat(paidAmount) || 0;
  const remainingDebt = Math.max(0, grandTotal - numPaid);

  React.useEffect(() => {
    if (selectedCustomerId === 'cash_customer') {
      setPaidAmount(grandTotal > 0 ? grandTotal.toString() : '');
    }
  }, [selectedCustomerId, grandTotal]);

  // Cart Action Handlers
  const handleAddToCart = (product) => {
    setErrorMessage('');
    if (product.availableStock <= 0) {
      setErrorMessage(`المنتج ${product.name} غير متوفر في المخزن!`);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.qty + 1 > product.availableStock) {
          setErrorMessage(`لا يمكن تجاوز الكمية المتوفرة (${product.availableStock}) للمنتج ${product.name}`);
          return prev;
        }
        return prev.map(item => 
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        return [...prev, { product, qty: 1, price: product.sellPrice }];
      }
    });
  };

  const handleUpdateQty = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.qty + delta;
          if (newQty <= 0) return null;
          if (newQty > item.product.availableStock) {
            setErrorMessage(`لا يمكن تجاوز الكمية المتوفرة (${item.product.availableStock})`);
            return item;
          }
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  // Submit Order & Print Receipt
  const handleCheckout = () => {
    setErrorMessage('');
    if (!selectedCustomer) {
      setErrorMessage('الرجاء اختيار الزبون قبل إتمام الطلب.');
      return;
    }
    if (cart.length === 0) {
      setErrorMessage('قائمة المشتريات فارغة. الرجاء إضافة منتجات.');
      return;
    }

    const sellerInfo = {
      id: currentUser?.id || 'demo_seller',
      name: currentUser?.name || 'مندوب مبيعات',
      role: userRole || 'sales_rep'
    };

    const res = createPOSOrder({
      sellerUser: sellerInfo,
      customer: selectedCustomer,
      cartItems: cart,
      paidAmount: numPaid
    });

    if (res.success) {
      setCompletedOrder(res.order);
      setCart([]);
      setPaidAmount('');
      setSelectedCustomerId('');
    } else {
      setErrorMessage(res.error || 'حدث خطأ أثناء معالجة الطلب.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-950 p-4 lg:p-6 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Header Banner */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-600/30">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">شاشة البيع (POS)</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              البائع الحالي: <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{currentUser?.name || 'مخول'}</span> 
              ({userRole === 'sales_rep' ? 'مخزن المندوب الخاص' : 'المخزن الرئيسي'})
            </p>
          </div>
        </div>

        {/* Quick Customer Counter Badge */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-xs">
          <Store className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <div>
            <span className="text-slate-500 dark:text-slate-400">إجمالي الزبائن:</span>{' '}
            <span className="font-bold">{customers.length}</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 rounded-2xl text-rose-700 dark:text-rose-200 text-sm flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="font-bold text-xs">إخفاء</button>
        </div>
      )}

      {/* Main POS 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* RIGHT COLUMN in RTL: Product Catalog & Auto-complete Search (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
          
          {/* Search & Category Filter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث عن المنتج بالاسم أو الصنف..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pr-11 pl-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                {productSearch && (
                  <button 
                    onClick={() => setProductSearch('')}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    مسح
                  </button>
                )}
              </div>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid Catalog */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredProducts.map(product => {
              const itemInCart = cart.find(i => i.product.id === product.id);
              const isLowStock = product.availableStock <= 5;
              const isOutOfStock = product.availableStock <= 0;

              return (
                <div 
                  key={product.id}
                  onClick={() => !isOutOfStock && handleAddToCart(product)}
                  className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between relative group cursor-pointer ${
                    isOutOfStock 
                      ? 'opacity-50 border-slate-200 dark:border-slate-800 pointer-events-none' 
                      : itemInCart
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 shadow-lg shadow-indigo-500/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  {/* Stock Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {product.category}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      isOutOfStock 
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800' 
                        : isLowStock 
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800' 
                          : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {isOutOfStock ? 'نفذت الكمية' : `متوفر: ${product.availableStock}`}
                    </span>
                  </div>

                  {/* Product Image & Details */}
                  <div className="flex items-start gap-3 mb-4">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-800"
                    />
                    <div>
                      <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {product.name}
                      </h3>
                      <div className="mt-1 text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                        ${product.sellPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Add Action Bar */}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">سعر الشراء: ${product.buyPrice}</span>
                    <button className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-all ${
                      itemInCart
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white'
                    }`}>
                      <Plus className="w-3.5 h-3.5" />
                      <span>{itemInCart ? `في القائمة (${itemInCart.qty})` : 'إضافة'}</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 dark:text-slate-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">لا توجد منتجات مطابقة لعملية البحث.</p>
              </div>
            )}
          </div>
        </div>

        {/* LEFT COLUMN in RTL: Customer Selection & POS Invoice Drawer (4 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
          
          {/* Customer Selection Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                <span>اختر الزبون</span>
              </label>
              {selectedCustomer && (
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  نشط
                </span>
              )}
            </div>

            {/* Customer Dropdown */}
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">-- اختر الزبون من القائمة --</option>
              <option value="cash_customer" className="font-bold text-emerald-600 dark:text-emerald-400">زبون نقدي</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.storeName} ({c.ownerName}) - الديون: ${c.balance.toFixed(2)}
                </option>
              ))}
            </select>

            {/* Loaded Customer Info Card */}
            {selectedCustomer ? (
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold">
                  <span>{selectedCustomer.storeName}</span>
                  <span className="text-slate-500 dark:text-slate-400">{selectedCustomer.ownerName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                  <span dir="ltr">{selectedCustomer.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="truncate">{selectedCustomer.address}</span>
                </div>
                {selectedCustomer.id !== 'cash_customer' && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">الديون السابقة (الباقي):</span>
                    <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                      ${selectedCustomer.balance.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl text-center text-xs text-slate-500">
                الرجاء اختيار الزبون لتحميل التفاصيل والديون السابقة.
              </div>
            )}
          </div>

          {/* POS Invoice Summary & Checkout */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col flex-1 justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider">قائمة المشتريات</h2>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  {cart.length} مواد
                </span>
              </div>

              {/* Cart Table */}
              <div className="max-h-[220px] overflow-y-auto space-y-2 pl-1 mb-4">
                {cart.map(item => (
                  <div 
                    key={item.product.id}
                    className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 p-2.5 rounded-xl text-xs"
                  >
                    <div className="flex-1 pr-2">
                      <div className="font-semibold line-clamp-1">{item.product.name}</div>
                      <div className="text-slate-500 dark:text-slate-400 font-mono">${item.price.toFixed(2)} / وحدة</div>
                    </div>

                    <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1" dir="ltr">
                      <button 
                        onClick={() => handleUpdateQty(item.product.id, -1)}
                        className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-bold px-1.5">{item.qty}</span>
                      <button 
                        onClick={() => handleUpdateQty(item.product.id, 1)}
                        className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="w-16 text-left font-mono font-bold text-indigo-600 dark:text-indigo-400 pr-2">
                      ${(item.price * item.qty).toFixed(2)}
                    </div>

                    <button
                      onClick={() => handleRemoveFromCart(item.product.id)}
                      className="mr-2 text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-500">
                    القائمة فارغة حالياً.
                  </div>
                )}
              </div>
            </div>

            {/* Calculations Panel */}
            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl">
              <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>مجموع القائمة الحالية:</span>
                <span className="font-mono font-semibold">${invoiceSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs text-amber-600 dark:text-amber-400">
                <span>الديون السابقة (الباقي):</span>
                <span className="font-mono font-semibold">+ ${previousDebt.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>المجموع الكلي:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-base">${grandTotal.toFixed(2)}</span>
              </div>

              {/* Paid Amount Input */}
              <div className="pt-2">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">المبلغ الواصل (المدفوع):</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="أدخل المبلغ المدفوع..."
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full pr-9 pl-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-emerald-600 dark:text-emerald-400 font-mono font-bold focus:outline-none focus:border-indigo-500 text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="flex justify-between text-xs text-rose-600 dark:text-rose-400 pt-1 font-bold">
                <span>الباقي (الديون المحدثة):</span>
                <span className="font-mono text-sm">${remainingDebt.toFixed(2)}</span>
              </div>

              {/* Submit & Print Receipt Button */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || !selectedCustomer}
                className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer mt-2 ${
                  cart.length === 0 || !selectedCustomer
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>إتمام الطلب وطباعة الوصل</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Thermal Printable Receipt Modal */}
      {completedOrder && (
        <ReceiptModal 
          order={completedOrder} 
          onClose={() => setCompletedOrder(null)} 
        />
      )}

    </div>
  );
};

export default POSScreen;
