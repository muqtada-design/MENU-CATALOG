import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { 
  ShoppingCart, Search, UserCheck, Store, Phone, MapPin, 
  CheckCircle2, Plus, Minus, Trash2, ArrowRight, Package, AlertCircle 
} from 'lucide-react';

const PublicCatalogPage = () => {
  const { products, users, submitCustomerOrder } = useData();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  // Customer Cart State: [{ product, qty, price }]
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Customer Order Checkout Form State
  const [selectedRepId, setSelectedRepId] = useState('');
  const [storeName, setStoreName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Status message
  const [orderSuccessMsg, setOrderSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Filter Sales Reps from Users list
  const salesReps = useMemo(() => {
    return users.filter(u => u.role === 'sales_rep' && u.isActive);
  }, [users]);

  // Categories
  const categories = useMemo(() => {
    const list = ['الكل', ...new Set(products.map(p => p.category))];
    return list;
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'الكل' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchQuery, selectedCategory]);

  // Cart Totals
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.qty, 0);
  }, [cart]);

  // Cart Handlers
  const addToCart = (product) => {
    setErrorMsg('');
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1, price: product.sellPrice }];
    });
    setToastMsg(`تم إضافة ${product.name} إلى السلة بنجاح!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const updateCartQty = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.qty + delta;
          if (newQty <= 0) return null;
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(i => i.product.id !== productId));
  };

  // Order Submission
  const handleSubmitOrder = (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (cart.length === 0) {
      setErrorMsg('قائمة المشتريات فارغة.');
      return;
    }
    if (!selectedRepId) {
      setErrorMsg('الرجاء اختيار المندوب الخاص بك من القائمة.');
      return;
    }
    if (!storeName || !ownerName || !phone || !address) {
      setErrorMsg('الرجاء تعبئة كافة تفاصيل المتجر والتواصل.');
      return;
    }

    const res = submitCustomerOrder({
      customerInfo: { storeName, ownerName, phone, address },
      selectedRepId,
      cartItems: cart
    });

    if (res.success) {
      setOrderSuccessMsg(`تم إرسال الطلب بنجاح! رقم الطلب: ${res.order.id}. سيقوم المندوب بالتواصل معك قريباً.`);
      setCart([]);
      setIsCartOpen(false);
      setStoreName('');
      setOwnerName('');
      setPhone('');
      setAddress('');
      setSelectedRepId('');
    } else {
      setErrorMsg('حدث خطأ أثناء إرسال الطلب.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 transition-colors">
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-b from-indigo-100 dark:from-indigo-950/60 via-slate-50 dark:via-slate-900 to-slate-100 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 py-12 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider">
            <Store className="w-3.5 h-3.5" />
            <span>البوابة الرسمية لتجارة الجملة</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            كتالوج الجملة والتجهيز المباشر
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            تصفح مخزوننا الكامل من بضائع الجملة، أضف المنتجات إلى سلتك، اختر المندوب الخاص بك، وقم برفع طلبك مباشرة.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Success Alert Banner */}
        {orderSuccessMsg && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-700 dark:text-emerald-200 text-sm flex items-center justify-between shadow-xl animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <span>{orderSuccessMsg}</span>
            </div>
            <button onClick={() => setOrderSuccessMsg('')} className="font-bold text-xs">إخفاء</button>
          </div>
        )}

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl mb-8 shadow-xl">
          {/* Search Box */}
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث عن المنتجات بالاسم أو الصنف..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-11 pl-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Floating Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all shrink-0 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>عربة الجملة ({cartCount})</span>
            <span className="mr-1 bg-white/20 font-mono px-2 py-0.5 rounded-md text-xs" dir="ltr">${cartTotal.toFixed(2)}</span>
          </button>
        </div>

        {/* Product Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const inCart = cart.find(i => i.product.id === product.id);
            const inStock = product.mainStock > 0;

            return (
              <div 
                key={product.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between shadow-xl group"
              >
                <div>
                  <div className="relative aspect-video bg-slate-100 dark:bg-slate-950 overflow-hidden">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      {product.category}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-bold text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      مواد عالية الجودة متوفرة للتجهيز المباشر.
                    </p>
                    <div className="pt-2 flex items-baseline justify-between">
                      <div>
                        <span className="text-xs text-slate-500 block">سعر الجملة</span>
                        <span className="text-xl font-mono font-extrabold text-indigo-600 dark:text-indigo-400">
                          ${product.sellPrice.toFixed(2)}
                        </span>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        inStock ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}>
                        {inStock ? 'متوفر' : 'نفذت الكمية'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => addToCart(product)}
                    disabled={!inStock}
                    className={`w-full py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      !inStock 
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed'
                        : inCart
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                    }`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{inCart ? `مضاف (${inCart.qty}) - أضف المزيد` : 'أضف للطلب'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart & Sales Rep Assignment Drawer Overlay */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-start bg-slate-900/50 dark:bg-slate-950/80 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 max-w-lg w-full h-full p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-300 shadow-2xl">
            
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-800">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold">عربة مشتريات الجملة</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{cartCount} مادة في الطلب</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  إغلاق
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Items List */}
              <div className="space-y-3 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">مواد الطلب</h3>
                {cart.map(item => (
                  <div key={item.product.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex-1 pl-3">
                      <div className="font-semibold line-clamp-1">{item.product.name}</div>
                      <div className="text-slate-500 dark:text-slate-400 font-mono">${item.price.toFixed(2)}</div>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800" dir="ltr">
                      <button onClick={() => updateCartQty(item.product.id, -1)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><Minus className="w-3 h-3" /></button>
                      <span className="font-mono font-bold px-1">{item.qty}</span>
                      <button onClick={() => updateCartQty(item.product.id, 1)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><Plus className="w-3 h-3" /></button>
                    </div>
                    <div className="w-16 text-left font-mono font-bold text-indigo-600 dark:text-indigo-400 pr-2">
                      ${(item.price * item.qty).toFixed(2)}
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="mr-2 text-slate-400 hover:text-rose-500"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
                {cart.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-500">العربة فارغة.</div>
                )}
              </div>

              {/* Customer Details & Sales Rep Selector Form */}
              <form onSubmit={handleSubmitOrder} className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                
                {/* REQUIREMENT #1: Choose Assigned Sales Rep */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span>اختر المندوب المخصص لك *</span>
                  </label>
                  <select
                    value={selectedRepId}
                    onChange={(e) => setSelectedRepId(e.target.value)}
                    required
                    className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="">-- اختر المندوب --</option>
                    {salesReps.map(rep => (
                      <option key={rep.id} value={rep.id}>
                        {rep.name} ({rep.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Store Info */}
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">اسم المحل / النشاط التجاري *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: أسواق النور"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">اسم صاحب المحل *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: أحمد علي"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">رقم الهاتف *</label>
                    <input
                      type="text"
                      required
                      placeholder="+964 770..."
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">عنوان التوصيل *</label>
                  <textarea
                    required
                    rows="2"
                    placeholder="المحافظة، المنطقة، أقرب نقطة دالة..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Total & Submit */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span>مجموع الطلب:</span>
                    <span className="font-mono text-xl text-emerald-600 dark:text-emerald-400">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    type="submit"
                    disabled={cart.length === 0}
                    className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
                  >
                    إرسال الطلب إلى المندوب
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold text-sm">{toastMsg}</span>
        </div>
      )}

    </div>
  );
};

export default PublicCatalogPage;
