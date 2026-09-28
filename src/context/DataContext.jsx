import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { allUsers, currentUser } = useAuth();

  // --- Initial Mock Data (Translated to Arabic) ---
  const [users, setUsers] = useState([
    ...allUsers.filter(u => u.role !== 'customer').map(u => ({ ...u, isActive: true }))
  ]);

  const [products, setProducts] = useState([
    { id: 'p1', name: 'شاشة سامسونج 55 بوصة', category: 'إلكترونيات', buyPrice: 300, sellPrice: 450, mainStock: 50, imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 'p2', name: 'لابتوب ديل انسبايرون', category: 'إلكترونيات', buyPrice: 500, sellPrice: 700, mainStock: 30, imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 'p3', name: 'كرسي مكتب مريح', category: 'أثاث مكتبي', buyPrice: 80, sellPrice: 150, mainStock: 100, imageUrl: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 'p4', name: 'طابعة ليزر HP', category: 'معدات', buyPrice: 150, sellPrice: 250, mainStock: 40, imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=400&h=300' },
    { id: 'p5', name: 'هاتف آيفون 13 برو', category: 'إلكترونيات', buyPrice: 800, sellPrice: 1100, mainStock: 25, imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=400&h=300' }
  ]);

  const [customers, setCustomers] = useState([
    { id: 'c1', storeName: 'أسواق النور', ownerName: 'محمد عبدالله', phone: '+964 770 123 4567', address: 'بغداد, المنصور', balance: 150.50 },
    { id: 'c2', storeName: 'مكتبة الفجر', ownerName: 'علي كمال', phone: '+964 780 987 6543', address: 'البصرة, العشار', balance: 0 },
    { id: 'c3', storeName: 'شركة التقنية', ownerName: 'يوسف العلي', phone: '+964 750 555 1122', address: 'أربيل, عنكاوا', balance: 1200.00 }
  ]);

  // subInventories: { [repUserId]: [ { productId, qty } ] }
  const [subInventories, setSubInventories] = useState({
    'u2': [ { productId: 'p1', qty: 5 }, { productId: 'p3', qty: 20 } ], // سارة
    'u3': [ { productId: 'p2', qty: 2 }, { productId: 'p4', qty: 10 } ]  // سامي
  });

  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [orders, setOrders] = useState([]);


  // --- Helper Methods ---

  const generateId = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

  // Product Management (Admin)
  const addProduct = async (productData, imageFile) => {
    // In a real app, upload imageFile to Firebase Storage and get URL here.
    // For now, we simulate a delay and use a placeholder or local URL if needed.
    const fakeImageUrl = imageFile ? URL.createObjectURL(imageFile) : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400&h=300';
    
    const newProduct = {
      id: generateId('p'),
      ...productData,
      buyPrice: parseFloat(productData.buyPrice),
      sellPrice: parseFloat(productData.sellPrice),
      mainStock: parseInt(productData.mainStock),
      imageUrl: fakeImageUrl
    };
    setProducts(prev => [...prev, newProduct]);
    return { success: true, product: newProduct };
  };

  const updateProduct = (id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // User Management (Admin)
  const addUser = (userData) => {
    const newUser = { id: generateId('u'), ...userData, isActive: true };
    setUsers(prev => [...prev, newUser]);
  };

  const toggleUserActive = (id) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  const updateUser = (id, updates) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };

  const removeUser = (id) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // Customer Management
  const addCustomer = (custData) => {
    setCustomers(prev => [...prev, { id: generateId('c'), ...custData }]);
  };

  // Inventory Management (Storekeeper to Sales Rep)
  const submitInventoryLoad = ({ repId, items }) => {
    let hasError = false;
    let errorMsg = '';

    // Validate stock
    const updatedProducts = products.map(p => {
      const loadItem = items.find(i => i.productId === p.id);
      if (loadItem) {
        if (p.mainStock < loadItem.qty) {
          hasError = true;
          errorMsg = `الكمية المطلوبة للمنتج ${p.name} تتجاوز رصيد المخزن الرئيسي.`;
        }
        return { ...p, mainStock: p.mainStock - loadItem.qty };
      }
      return p;
    });

    if (hasError) return { success: false, error: errorMsg };

    // Update Main Stock
    setProducts(updatedProducts);

    // Update Rep's Sub-inventory
    setSubInventories(prev => {
      const repStock = [...(prev[repId] || [])];
      
      items.forEach(item => {
        const existing = repStock.find(r => r.productId === item.productId);
        if (existing) {
          existing.qty += item.qty;
        } else {
          repStock.push({ productId: item.productId, qty: item.qty });
        }
      });

      return { ...prev, [repId]: repStock };
    });

    // Log the transaction
    const targetRep = users.find(u => u.id === repId);
    const logEntry = {
      id: generateId('log'),
      type: 'load',
      timestamp: Date.now(),
      handledBy: currentUser?.id || 'unknown',
      handledByName: currentUser?.name || 'مخول مجهول',
      targetRepId: repId,
      targetRepName: targetRep?.name || 'مندوب مجهول',
      items: items.map(i => ({
        ...i,
        name: products.find(p => p.id === i.productId)?.name || 'غير معروف'
      }))
    };
    setInventoryLogs(prev => [logEntry, ...prev]);

    return { success: true };
  };

  // POS Order Processing (Sales Rep & Storekeeper)
  const createPOSOrder = ({ sellerUser, customer, cartItems, paidAmount }) => {
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const previousDebt = customer.balance || 0;
    const grandTotal = totalAmount + previousDebt;
    
    const numPaid = parseFloat(paidAmount) || 0;
    const remainingDebt = Math.max(0, grandTotal - numPaid);

    // 1. Deduct Stock
    if (sellerUser.role === 'sales_rep') {
      // Deduct from sub-inventory
      setSubInventories(prev => {
        const repStock = prev[sellerUser.id] ? [...prev[sellerUser.id]] : [];
        cartItems.forEach(cartItem => {
          const invItem = repStock.find(r => r.productId === cartItem.product.id);
          if (invItem) {
            invItem.qty -= cartItem.qty;
          }
        });
        return { ...prev, [sellerUser.id]: repStock };
      });
    } else {
      // Storekeeper selling directly -> Deduct from mainStock
      setProducts(prev => prev.map(p => {
        const cartItem = cartItems.find(c => c.product.id === p.id);
        if (cartItem) {
          return { ...p, mainStock: p.mainStock - cartItem.qty };
        }
        return p;
      }));
      // Also log as direct sale in inventory logs
      const logEntry = {
        id: generateId('log_sale'),
        type: 'direct_sale',
        timestamp: Date.now(),
        handledBy: sellerUser.id,
        handledByName: sellerUser.name,
        items: cartItems.map(c => ({ productId: c.product.id, name: c.product.name, qty: c.qty }))
      };
      setInventoryLogs(prev => [logEntry, ...prev]);
    }

    // 2. Update Customer Debt
    setCustomers(prev => prev.map(c => 
      c.id === customer.id ? { ...c, balance: remainingDebt } : c
    ));

    // 3. Create Order Record
    const newOrder = {
      id: generateId('ord'),
      createdAt: Date.now(),
      createdBy: sellerUser.id,
      createdByName: sellerUser.name,
      sellerRole: sellerUser.role,
      customerId: customer.id,
      customerName: customer.storeName,
      customerOwner: customer.ownerName,
      customerPhone: customer.phone,
      items: cartItems.map(c => ({
        productId: c.product.id,
        name: c.product.name,
        price: c.price,
        buyPrice: c.product.buyPrice, // used for profit calculation
        qty: c.qty
      })),
      totalAmount,
      previousDebt,
      grandTotal,
      paidAmount: numPaid,
      remainingDebt
    };
    
    setOrders(prev => [newOrder, ...prev]);

    return { success: true, order: newOrder };
  };

  // Customer Self-Service Ordering
  const submitCustomerOrder = ({ customerInfo, selectedRepId, cartItems }) => {
    // Check if customer exists by phone, if not, create one
    let targetCustomer = customers.find(c => c.phone === customerInfo.phone);
    if (!targetCustomer) {
      targetCustomer = {
        id: generateId('c'),
        ...customerInfo,
        balance: 0
      };
      setCustomers(prev => [...prev, targetCustomer]);
    } else {
      // Update existing customer info just in case
      targetCustomer = { ...targetCustomer, ...customerInfo };
      setCustomers(prev => prev.map(c => c.id === targetCustomer.id ? targetCustomer : c));
    }

    const sellerInfo = {
      id: selectedRepId,
      name: users.find(u => u.id === selectedRepId)?.name || 'مندوب تلقائي',
      role: 'sales_rep'
    };

    // Note: In a real system, this might be saved as a "Pending Order" for the rep to approve.
    // For this prototype, we process it as a direct POS sale automatically.
    return createPOSOrder({
      sellerUser: sellerInfo,
      customer: targetCustomer,
      cartItems: cartItems.map(item => ({ ...item, price: item.product.sellPrice })),
      paidAmount: 0 // They just ordered, haven't paid yet
    });
  };

  // Financial Stats for Admin
  const getFinancialStats = () => {
    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    const totalProfit = orders.reduce((sum, o) => {
      const orderProfit = o.items.reduce((itemSum, item) => {
        return itemSum + ((item.price - item.buyPrice) * item.qty);
      }, 0);
      return sum + orderProfit;
    }, 0);

    const totalCustomerDebts = customers.reduce((sum, c) => sum + (c.balance || 0), 0);

    return { totalSales, totalProfit, totalCustomerDebts };
  };


  const value = {
    users, addUser, updateUser, removeUser, toggleUserActive,
    products, addProduct, updateProduct, deleteProduct,
    customers, addCustomer,
    subInventories,
    inventoryLogs, submitInventoryLoad,
    orders, createPOSOrder, submitCustomerOrder,
    getFinancialStats
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
