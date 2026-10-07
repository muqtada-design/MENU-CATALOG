import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext'; // Used only for currentUser reference

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [subInventories, setSubInventories] = useState({});
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [orders, setOrders] = useState([]);

  // --- Real-time Listeners ---
  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), snapshot => {
      setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => console.error("Error fetching users:", err));

    const unsubProducts = onSnapshot(collection(db, 'products'), snapshot => {
      setProducts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => console.error("Error fetching products:", err));

    const unsubCustomers = onSnapshot(collection(db, 'customers'), snapshot => {
      setCustomers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => console.error("Error fetching customers:", err));

    const unsubLogs = onSnapshot(collection(db, 'inventoryLogs'), snapshot => {
      setInventoryLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.timestamp - a.timestamp));
    }, err => console.error("Error fetching logs:", err));

    const unsubOrders = onSnapshot(collection(db, 'orders'), snapshot => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt - a.createdAt));
    }, err => console.error("Error fetching orders:", err));

    const unsubSub = onSnapshot(collection(db, 'subInventories'), snapshot => {
      const subs = {};
      snapshot.docs.forEach(d => {
        subs[d.id] = d.data().items || [];
      });
      setSubInventories(subs);
    }, err => console.error("Error fetching subInventories:", err));

    return () => {
      unsubUsers(); unsubProducts(); unsubCustomers(); unsubLogs(); unsubOrders(); unsubSub();
    };
  }, []);

  // --- Helper Methods ---
  const generateId = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

  // Product Management
  const addProduct = async (productData, imageFile) => {
    try {
      const newId = generateId('p');
      const fakeImageUrl = imageFile ? URL.createObjectURL(imageFile) : 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400&h=300';
      
      const newProduct = {
        ...productData,
        buyPrice: parseFloat(productData.buyPrice),
        sellPrice: parseFloat(productData.sellPrice),
        mainStock: parseInt(productData.mainStock),
        imageUrl: fakeImageUrl
      };
      await setDoc(doc(db, 'products', newId), newProduct);
      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: error.message };
    }
  };

  const updateProduct = async (id, updates) => {
    await updateDoc(doc(db, 'products', id), updates);
  };

  const deleteProduct = async (id) => {
    await deleteDoc(doc(db, 'products', id));
  };

  // User Management
  const addUser = async (userData) => {
    if (userData.id) {
      await setDoc(doc(db, 'users', userData.id), { ...userData, isActive: true });
    } else {
      await setDoc(doc(db, 'users', generateId('u')), { ...userData, isActive: true });
    }
  };

  const toggleUserActive = async (id) => {
    const user = users.find(u => u.id === id);
    if (user) {
      await updateDoc(doc(db, 'users', id), { isActive: !user.isActive });
    }
  };

  const updateUser = async (id, updates) => {
    await updateDoc(doc(db, 'users', id), updates);
  };

  const removeUser = async (id) => {
    await deleteDoc(doc(db, 'users', id));
  };

  // Customer Management
  const addCustomer = async (custData) => {
    await setDoc(doc(db, 'customers', generateId('c')), custData);
  };

  // Inventory Management
  const submitInventoryLoad = async ({ repId, items }) => {
    try {
      let hasError = false;
      let errorMsg = '';

      const batchUpdates = [];

      items.forEach(loadItem => {
        const p = products.find(prod => prod.id === loadItem.productId);
        if (p) {
          if (p.mainStock < loadItem.qty) {
            hasError = true;
            errorMsg = `الكمية للمنتج ${p.name} تتجاوز الرصيد.`;
          } else {
            batchUpdates.push({ ref: doc(db, 'products', p.id), data: { mainStock: p.mainStock - loadItem.qty } });
          }
        }
      });

      if (hasError) return { success: false, error: errorMsg };

      // Commit Product Stock Deduction
      for (const update of batchUpdates) {
        await updateDoc(update.ref, update.data);
      }

      // Update Rep Sub-inventory
      const repStock = subInventories[repId] ? [...subInventories[repId]] : [];
      items.forEach(item => {
        const existing = repStock.find(r => r.productId === item.productId);
        if (existing) {
          existing.qty += item.qty;
        } else {
          repStock.push({ productId: item.productId, qty: item.qty });
        }
      });
      await setDoc(doc(db, 'subInventories', repId), { items: repStock });

      // Log Transaction
      const targetRep = users.find(u => u.id === repId);
      const logEntry = {
        type: 'load',
        timestamp: Date.now(),
        handledBy: currentUser?.id || 'unknown',
        handledByName: currentUser?.name || 'مجهول',
        targetRepId: repId,
        targetRepName: targetRep?.name || 'مجهول',
        items: items.map(i => ({ ...i, name: products.find(p => p.id === i.productId)?.name || 'غير معروف' }))
      };
      await setDoc(doc(db, 'inventoryLogs', generateId('log')), logEntry);

      return { success: true };
    } catch (error) {
      console.error(error);
      return { success: false, error: error.message };
    }
  };

  // POS Order
  const createPOSOrder = async ({ sellerUser, customer, cartItems, paidAmount }) => {
    try {
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const previousDebt = customer.balance || 0;
      const grandTotal = totalAmount + previousDebt;
      
      const numPaid = parseFloat(paidAmount) || 0;
      const remainingDebt = Math.max(0, grandTotal - numPaid);

      // 1. Deduct Stock
      if (sellerUser.role === 'sales_rep') {
        const repStock = subInventories[sellerUser.id] ? [...subInventories[sellerUser.id]] : [];
        cartItems.forEach(cartItem => {
          const invItem = repStock.find(r => r.productId === cartItem.product.id);
          if (invItem) invItem.qty -= cartItem.qty;
        });
        await setDoc(doc(db, 'subInventories', sellerUser.id), { items: repStock });
      } else {
        for (const cartItem of cartItems) {
          const p = products.find(prod => prod.id === cartItem.product.id);
          if (p) {
            await updateDoc(doc(db, 'products', p.id), { mainStock: p.mainStock - cartItem.qty });
          }
        }
        const logEntry = {
          type: 'direct_sale',
          timestamp: Date.now(),
          handledBy: sellerUser.id,
          handledByName: sellerUser.name,
          items: cartItems.map(c => ({ productId: c.product.id, name: c.product.name, qty: c.qty }))
        };
        await setDoc(doc(db, 'inventoryLogs', generateId('log_sale')), logEntry);
      }

      // 2. Update Customer Debt
      await updateDoc(doc(db, 'customers', customer.id), { balance: remainingDebt });

      // 3. Create Order
      const newOrder = {
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
          buyPrice: c.product.buyPrice,
          qty: c.qty
        })),
        totalAmount,
        previousDebt,
        grandTotal,
        paidAmount: numPaid,
        remainingDebt
      };
      
      const newOrderRef = doc(db, 'orders', generateId('ord'));
      await setDoc(newOrderRef, newOrder);

      return { success: true, order: { id: newOrderRef.id, ...newOrder } };
    } catch (error) {
      console.error(error);
      return { success: false, error: error.message };
    }
  };

  const submitCustomerOrder = async ({ customerInfo, selectedRepId, cartItems }) => {
    let targetCustomer = customers.find(c => c.phone === customerInfo.phone);
    if (!targetCustomer) {
      targetCustomer = { ...customerInfo, balance: 0 };
      const newCustId = generateId('c');
      await setDoc(doc(db, 'customers', newCustId), targetCustomer);
      targetCustomer.id = newCustId;
    } else {
      await updateDoc(doc(db, 'customers', targetCustomer.id), customerInfo);
      targetCustomer = { ...targetCustomer, ...customerInfo };
    }

    const sellerInfo = {
      id: selectedRepId,
      name: users.find(u => u.id === selectedRepId)?.name || 'مندوب تلقائي',
      role: 'sales_rep'
    };

    return createPOSOrder({
      sellerUser: sellerInfo,
      customer: targetCustomer,
      cartItems: cartItems.map(item => ({ ...item, price: item.product.sellPrice })),
      paidAmount: 0
    });
  };

  const getFinancialStats = () => {
    const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const totalProfit = orders.reduce((sum, o) => sum + o.items.reduce((itemSum, item) => itemSum + ((item.price - item.buyPrice) * item.qty), 0), 0);
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
