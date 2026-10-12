import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from './AuthContext';
import { DEFAULT_USERS, DEFAULT_PRODUCTS, FALLBACK_PRODUCT_IMAGE } from '../firebase/defaultData';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [subInventories, setSubInventories] = useState({});
  const [transfers, setTransfers] = useState([]);
  const [inventoryLogs, setInventoryLogs] = useState([]);
  const [orders, setOrders] = useState([]);

  // --- Real-time Listeners ---
  useEffect(() => {
    // 1. Users Listener (Auto-seeds if completely empty)
    let usersSeedTriggered = false;
    const unsubUsers = onSnapshot(collection(db, 'users'), async snapshot => {
      if (snapshot.empty && !usersSeedTriggered) {
        usersSeedTriggered = true;
        console.log("Users collection empty. Auto-seeding default users...");
        for (const u of DEFAULT_USERS) {
          await setDoc(doc(db, 'users', u.id), u, { merge: true });
        }
        return;
      }
      const loadedUsers = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          ...data,
          name: data.name || 'موظف',
          role: data.role || 'sales_rep',
          pin: String(data.pin || '').trim(),
          isActive: data.isActive !== false,
          inventory: data.inventory || []
        };
      });
      setUsers(loadedUsers);
    }, err => console.error("Error fetching users:", err));

    // 2. Products Listener (Auto-seeds if completely empty and standardizes numerical values)
    let productsSeedTriggered = false;
    const unsubProducts = onSnapshot(collection(db, 'products'), async snapshot => {
      if (snapshot.empty && !productsSeedTriggered) {
        productsSeedTriggered = true;
        console.log("Products collection empty. Auto-seeding default products...");
        for (const p of DEFAULT_PRODUCTS) {
          await setDoc(doc(db, 'products', p.id), p, { merge: true });
        }
        return;
      }
      const prods = snapshot.docs.map(d => {
        const data = d.data();
        const stockVal = Number(data.stock !== undefined ? data.stock : (data.mainStock !== undefined ? data.mainStock : 0)) || 0;
        const priceVal = Number(data.price !== undefined ? data.price : (data.sellPrice !== undefined ? data.sellPrice : 0)) || 0;
        const costPriceVal = Number(data.costPrice !== undefined ? data.costPrice : (data.buyPrice !== undefined ? data.buyPrice : 0)) || 0;
        const imageVal = data.image || data.imageUrl || FALLBACK_PRODUCT_IMAGE;

        return {
          id: d.id,
          ...data,
          name: data.name || 'منتج',
          category: data.category || 'عام',
          unit: data.unit || 'قطعة',
          stock: stockVal,
          mainStock: stockVal, // alias
          price: priceVal,
          sellPrice: priceVal, // alias
          costPrice: costPriceVal,
          buyPrice: costPriceVal, // alias
          image: imageVal,
          imageUrl: imageVal // alias
        };
      });
      setProducts(prods);
    }, err => console.error("Error fetching products:", err));

    // 3. Customers Listener
    const unsubCustomers = onSnapshot(collection(db, 'customers'), snapshot => {
      setCustomers(snapshot.docs.map(d => ({
        id: d.id,
        ...d.data(),
        balance: Number(d.data().balance) || 0
      })));
    }, err => console.error("Error fetching customers:", err));

    // 4. Transfers Listener
    const unsubTransfers = onSnapshot(collection(db, 'transfers'), snapshot => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      setTransfers(list);
    }, err => console.error("Error fetching transfers:", err));

    // 5. Inventory Logs Listener
    const unsubLogs = onSnapshot(collection(db, 'inventoryLogs'), snapshot => {
      setInventoryLogs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
    }, err => console.error("Error fetching logs:", err));

    // 6. Orders Listener
    const unsubOrders = onSnapshot(collection(db, 'orders'), snapshot => {
      setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
    }, err => console.error("Error fetching orders:", err));

    // 7. Sub-inventories & Rep Inventories Listeners
    const unsubSub = onSnapshot(collection(db, 'subInventories'), snapshot => {
      setSubInventories(prev => {
        const next = { ...prev };
        snapshot.docs.forEach(d => {
          const items = (d.data().items || []).map(it => ({
            ...it,
            qty: Number(it.qty) || 0,
            price: Number(it.price || 0)
          }));
          next[d.id] = items;
        });
        return next;
      });
    }, err => console.error("Error fetching subInventories:", err));

    const unsubRepInv = onSnapshot(collection(db, 'rep_inventory'), snapshot => {
      setSubInventories(prev => {
        const next = { ...prev };
        snapshot.docs.forEach(d => {
          const items = (d.data().items || []).map(it => ({
            ...it,
            qty: Number(it.qty) || 0,
            price: Number(it.price || 0)
          }));
          if (items.length > 0 || !next[d.id]) {
            next[d.id] = items;
          }
        });
        return next;
      });
    }, err => console.error("Error fetching rep_inventory:", err));

    return () => {
      unsubUsers(); unsubProducts(); unsubCustomers(); unsubTransfers(); unsubLogs(); unsubOrders(); unsubSub(); unsubRepInv();
    };
  }, []);

  // --- Helper Methods ---
  const generateId = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;

  // Product Management (Both Admin and Storekeeper have full access)
  const addProduct = async (productData, imageFile) => {
    try {
      const newId = generateId('p');
      let imageVal = productData.image || productData.imageUrl || FALLBACK_PRODUCT_IMAGE;
      if (imageFile) {
        try {
          imageVal = URL.createObjectURL(imageFile);
        } catch {
          imageVal = FALLBACK_PRODUCT_IMAGE;
        }
      }

      const stockNum = Number(productData.stock !== undefined ? productData.stock : productData.mainStock) || 0;
      const priceNum = Number(productData.price !== undefined ? productData.price : productData.sellPrice) || 0;
      const costPriceNum = Number(productData.costPrice !== undefined ? productData.costPrice : productData.buyPrice) || 0;

      const newProduct = {
        id: newId,
        name: String(productData.name || '').trim(),
        category: String(productData.category || 'عام').trim(),
        price: priceNum,
        sellPrice: priceNum,
        costPrice: costPriceNum,
        buyPrice: costPriceNum,
        stock: stockNum,
        mainStock: stockNum,
        unit: String(productData.unit || 'قطعة').trim(),
        image: imageVal,
        imageUrl: imageVal,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'products', newId), newProduct);
      return { success: true, id: newId };
    } catch (error) {
      console.error("Error adding product:", error);
      return { success: false, error: error.message };
    }
  };

  const updateProduct = async (id, updates) => {
    try {
      const cleaned = { ...updates };
      if ('stock' in cleaned || 'mainStock' in cleaned) {
        const s = Number(cleaned.stock !== undefined ? cleaned.stock : cleaned.mainStock) || 0;
        cleaned.stock = s;
        cleaned.mainStock = s;
      }
      if ('price' in cleaned || 'sellPrice' in cleaned) {
        const p = Number(cleaned.price !== undefined ? cleaned.price : cleaned.sellPrice) || 0;
        cleaned.price = p;
        cleaned.sellPrice = p;
      }
      if ('costPrice' in cleaned || 'buyPrice' in cleaned) {
        const c = Number(cleaned.costPrice !== undefined ? cleaned.costPrice : cleaned.buyPrice) || 0;
        cleaned.costPrice = c;
        cleaned.buyPrice = c;
      }
      if ('image' in cleaned || 'imageUrl' in cleaned) {
        const img = cleaned.image || cleaned.imageUrl || FALLBACK_PRODUCT_IMAGE;
        cleaned.image = img;
        cleaned.imageUrl = img;
      }

      await updateDoc(doc(db, 'products', id), cleaned);
      return { success: true };
    } catch (error) {
      console.error("Error updating product:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteProduct = async (id) => {
    try {
      await deleteDoc(doc(db, 'products', id));
      return { success: true };
    } catch (error) {
      console.error("Error deleting product:", error);
      return { success: false, error: error.message };
    }
  };

  // User Management (Allowed ONLY for "التاجر" Admin)
  const addUser = async (userData) => {
    if (currentUser && currentUser.role !== 'admin') {
      return { success: false, error: 'غير مصرح لك بإضافة موظف. هذه الصلاحية خاصة بالتاجر (المدير) فقط.' };
    }
    const id = userData.id || generateId('u');
    const newUser = {
      ...userData,
      id,
      name: String(userData.name || '').trim(),
      email: String(userData.email || '').trim(),
      role: userData.role || 'sales_rep',
      pin: String(userData.pin || '1111').trim(),
      isActive: true,
      inventory: []
    };
    await setDoc(doc(db, 'users', id), newUser, { merge: true });
    return { success: true, id };
  };

  const toggleUserActive = async (id) => {
    if (currentUser && currentUser.role !== 'admin') {
      alert('غير مصرح لك بتعديل حالة الموظف.');
      return;
    }
    const user = users.find(u => u.id === id);
    if (user) {
      await updateDoc(doc(db, 'users', id), { isActive: !user.isActive });
    }
  };

  const updateUser = async (id, updates) => {
    if (currentUser && currentUser.role !== 'admin') {
      return { success: false, error: 'غير مصرح لك بتعديل بيانات الموظف.' };
    }
    const cleaned = { ...updates };
    if ('pin' in cleaned) cleaned.pin = String(cleaned.pin).trim();
    await updateDoc(doc(db, 'users', id), cleaned);
    return { success: true };
  };

  const removeUser = async (id) => {
    if (currentUser && currentUser.role !== 'admin') {
      return { success: false, error: 'غير مصرح لك بحذف موظف.' };
    }
    await deleteDoc(doc(db, 'users', id));
    return { success: true };
  };

  // Customer Management
  const addCustomer = async (custData) => {
    const id = generateId('c');
    await setDoc(doc(db, 'customers', id), {
      ...custData,
      id,
      balance: Number(custData.balance) || 0
    });
  };

  // Inventory Management - Stock Transfer to Sales Rep ("تحميل بضاعة للمندوب")
  const submitInventoryLoad = async ({ repId, items }) => {
    try {
      if (!repId) {
        return { success: false, error: 'الرجاء اختيار المندوب المستلم.' };
      }
      if (!items || !items.length) {
        return { success: false, error: 'الرجاء تحديد كميات للتحميل.' };
      }

      // Check stock availability strictly against product.stock
      for (const loadItem of items) {
        const qty = Number(loadItem.qty) || 0;
        const p = products.find(prod => prod.id === loadItem.productId);
        if (!p) {
          return { success: false, error: `المنتج غير موجود في المخزن.` };
        }
        const currentStock = Number(p.stock !== undefined ? p.stock : p.mainStock) || 0;
        if (currentStock < qty) {
          return { success: false, error: `الكمية المطلوبة للمنتج (${p.name}) تتجاوز الرصيد المتوفر (${currentStock}).` };
        }
      }

      // Build updated rep stock
      const targetRep = users.find(u => u.id === repId);
      const repName = targetRep?.name || 'المندوب';

      // Current stock for this rep
      const existingRepItems = subInventories[repId] 
        ? [...subInventories[repId]] 
        : (targetRep?.inventory ? [...targetRep.inventory] : []);

      items.forEach(item => {
        const qty = Number(item.qty) || 0;
        const existing = existingRepItems.find(r => r.productId === item.productId);
        const prod = products.find(p => p.id === item.productId);
        const prodName = prod?.name || 'غير معروف';
        const prodPrice = Number(prod?.price || prod?.sellPrice || 0);
        const prodImg = prod?.image || prod?.imageUrl || FALLBACK_PRODUCT_IMAGE;

        if (existing) {
          existing.qty = (Number(existing.qty) || 0) + qty;
          existing.name = prodName;
          existing.price = prodPrice;
          existing.image = prodImg;
          existing.imageUrl = prodImg;
        } else {
          existingRepItems.push({
            productId: item.productId,
            name: prodName,
            qty: qty,
            price: prodPrice,
            image: prodImg,
            imageUrl: prodImg
          });
        }
      });

      // Transfer & Log IDs
      const transferId = generateId('trans');
      const logId = generateId('log_load');
      const timestamp = Date.now();
      const storekeeperName = currentUser?.name || 'أمين المخزن';
      const storekeeperId = currentUser?.id || 'storekeeper';

      const transferRecord = {
        id: transferId,
        timestamp,
        storekeeperId,
        storekeeperName,
        repId,
        repName,
        items: items.map(i => {
          const prod = products.find(p => p.id === i.productId);
          return {
            productId: i.productId,
            name: prod?.name || 'غير معروف',
            qty: Number(i.qty) || 0,
            price: Number(prod?.price || prod?.sellPrice || 0)
          };
        }),
        totalUnits: items.reduce((sum, i) => sum + (Number(i.qty) || 0), 0)
      };

      const logEntry = {
        id: logId,
        type: 'load',
        timestamp,
        handledBy: storekeeperId,
        handledByName: storekeeperName,
        targetRepId: repId,
        targetRepName: repName,
        items: transferRecord.items
      };

      // Atomic writeBatch
      try {
        const batch = writeBatch(db);

        // 1. Deduct loaded quantity from products/{productId}.stock & .mainStock
        items.forEach(loadItem => {
          const qty = Number(loadItem.qty) || 0;
          const p = products.find(prod => prod.id === loadItem.productId);
          const currentStock = Number(p.stock !== undefined ? p.stock : p.mainStock) || 0;
          const newStock = Math.max(0, currentStock - qty);
          const prodRef = doc(db, 'products', p.id);
          batch.update(prodRef, { stock: newStock, mainStock: newStock });
        });

        // 2. Increment Sales Rep's stock inside users/{repId}.inventory AND rep_inventory/{repId}
        batch.set(doc(db, 'users', repId), { inventory: existingRepItems }, { merge: true });
        batch.set(doc(db, 'rep_inventory', repId), { repId, items: existingRepItems, updatedAt: timestamp }, { merge: true });
        batch.set(doc(db, 'subInventories', repId), { items: existingRepItems }, { merge: true });

        // 3. Log transfer record in transfers collection
        batch.set(doc(db, 'transfers', transferId), transferRecord);
        batch.set(doc(db, 'inventoryLogs', logId), logEntry);

        await batch.commit();
      } catch (batchErr) {
        console.warn("writeBatch transfer failed, falling back to sequential writes:", batchErr);

        // Sequential fallback
        for (const loadItem of items) {
          const qty = Number(loadItem.qty) || 0;
          const p = products.find(prod => prod.id === loadItem.productId);
          const currentStock = Number(p.stock !== undefined ? p.stock : p.mainStock) || 0;
          const newStock = Math.max(0, currentStock - qty);
          await updateDoc(doc(db, 'products', p.id), { stock: newStock, mainStock: newStock });
        }

        await setDoc(doc(db, 'users', repId), { inventory: existingRepItems }, { merge: true });
        await setDoc(doc(db, 'rep_inventory', repId), { repId, items: existingRepItems, updatedAt: timestamp }, { merge: true });
        await setDoc(doc(db, 'subInventories', repId), { items: existingRepItems }, { merge: true });

        await setDoc(doc(db, 'transfers', transferId), transferRecord);
        await setDoc(doc(db, 'inventoryLogs', logId), logEntry);
      }

      // Optimistic update
      setSubInventories(prev => ({
        ...prev,
        [repId]: existingRepItems
      }));

      return { success: true };
    } catch (error) {
      console.error("submitInventoryLoad critical error:", error);
      return { success: false, error: error.message || 'حدث خطأ أثناء تحميل البضاعة.' };
    }
  };

  // Orders, POS & Printing
  const createPOSOrder = async ({ sellerUser, customer, cartItems, paidAmount }) => {
    try {
      const totalAmount = cartItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.qty)), 0);
      const previousDebt = Number(customer.balance) || 0;
      const grandTotal = totalAmount + previousDebt;
      
      const numPaid = parseFloat(paidAmount) || 0;
      const remainingDebt = Math.max(0, grandTotal - numPaid);

      // Deduct stock from rep inventory or main stock
      if (sellerUser.role === 'sales_rep') {
        const repStock = subInventories[sellerUser.id] ? [...subInventories[sellerUser.id]] : [];
        cartItems.forEach(cartItem => {
          const invItem = repStock.find(r => r.productId === cartItem.product.id);
          if (invItem) {
            invItem.qty = Math.max(0, (Number(invItem.qty) || 0) - Number(cartItem.qty));
          }
        });
        await setDoc(doc(db, 'subInventories', sellerUser.id), { items: repStock }, { merge: true });
        await setDoc(doc(db, 'rep_inventory', sellerUser.id), { repId: sellerUser.id, items: repStock }, { merge: true });
        await setDoc(doc(db, 'users', sellerUser.id), { inventory: repStock }, { merge: true });
      } else {
        for (const cartItem of cartItems) {
          const p = products.find(prod => prod.id === cartItem.product.id);
          if (p) {
            const currentStock = Number(p.stock !== undefined ? p.stock : p.mainStock) || 0;
            const newStock = Math.max(0, currentStock - Number(cartItem.qty));
            await updateDoc(doc(db, 'products', p.id), { stock: newStock, mainStock: newStock });
          }
        }
        const logEntry = {
          type: 'direct_sale',
          timestamp: Date.now(),
          handledBy: sellerUser.id,
          handledByName: sellerUser.name,
          items: cartItems.map(c => ({ productId: c.product.id, name: c.product.name, qty: Number(c.qty) }))
        };
        await setDoc(doc(db, 'inventoryLogs', generateId('log_sale')), logEntry);
      }

      // Update customer debt if registered customer
      if (customer.id && customer.id !== 'cash_customer') {
        await updateDoc(doc(db, 'customers', customer.id), { balance: remainingDebt });
      }

      // Create Order in Firestore
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
          price: Number(c.price),
          costPrice: Number(c.product.costPrice || c.product.buyPrice || 0),
          buyPrice: Number(c.product.costPrice || c.product.buyPrice || 0),
          qty: Number(c.qty)
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
      console.error("createPOSOrder error:", error);
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
      cartItems: cartItems.map(item => ({ ...item, price: Number(item.product.price || item.product.sellPrice) })),
      paidAmount: 0
    });
  };

  const getFinancialStats = () => {
    const totalSales = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const totalProfit = orders.reduce((sum, o) => {
      const orderProfit = (o.items || []).reduce((itemSum, item) => {
        const sellP = Number(item.price) || 0;
        const buyP = Number(item.costPrice !== undefined ? item.costPrice : item.buyPrice) || 0;
        const q = Number(item.qty) || 0;
        return itemSum + ((sellP - buyP) * q);
      }, 0);
      return sum + orderProfit;
    }, 0);
    const totalCustomerDebts = customers.reduce((sum, c) => sum + (Number(c.balance) || 0), 0);
    return { totalSales, totalProfit, totalCustomerDebts };
  };

  const value = {
    users, addUser, updateUser, removeUser, toggleUserActive,
    products, addProduct, updateProduct, deleteProduct,
    customers, addCustomer,
    subInventories,
    transfers, inventoryLogs, submitInventoryLoad,
    orders, createPOSOrder, submitCustomerOrder,
    getFinancialStats
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
