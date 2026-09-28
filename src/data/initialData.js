export const INITIAL_USERS = [
  {
    id: 'admin_1',
    email: 'admin@apex.com',
    name: 'Al-Naseem Admin',
    role: 'admin',
    isActive: true
  },
  {
    id: 'rep_1',
    email: 'sami@apex.com',
    name: 'Sami Al-Ali',
    role: 'sales_rep',
    isActive: true
  },
  {
    id: 'rep_2',
    email: 'noor@apex.com',
    name: 'Noor Hameed',
    role: 'sales_rep',
    isActive: true
  },
  {
    id: 'storekeeper_1',
    email: 'tariq@apex.com',
    name: 'Tariq Mahmood',
    role: 'storekeeper',
    isActive: true
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Ultra HD 4K Commercial Monitor 32"',
    category: 'Electronics',
    buyPrice: 180,
    sellPrice: 260,
    mainStock: 150,
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_2',
    name: 'Ergonomic Mesh Task Chair',
    category: 'Furniture',
    buyPrice: 85,
    sellPrice: 140,
    mainStock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1580481072645-022f9a6d1270?w=500&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_3',
    name: 'Wireless Mechanical Keyboard Pro',
    category: 'Electronics',
    buyPrice: 40,
    sellPrice: 75,
    mainStock: 350,
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_4',
    name: 'High-Speed POS Thermal Printer 80mm',
    category: 'Hardware',
    buyPrice: 60,
    sellPrice: 110,
    mainStock: 90,
    imageUrl: 'https://images.unsplash.com/photo-1616410011236-7a42121dd981?w=500&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_5',
    name: 'Barcode Scanner Handheld 2D',
    category: 'Hardware',
    buyPrice: 30,
    sellPrice: 58,
    mainStock: 180,
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67412e022f?w=500&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod_6',
    name: 'Industrial Heavy Duty Shelving Rack',
    category: 'Storage',
    buyPrice: 110,
    sellPrice: 195,
    mainStock: 40,
    imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'cust_1',
    storeName: 'Al-Rayyan Supermarket',
    ownerName: 'Ahmed Al-Rayyan',
    phone: '+964 770 123 4567',
    address: 'Baghdad - Karrada Commercial District',
    balance: 1450.00,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cust_2',
    storeName: 'TechZone Electronics',
    ownerName: 'Omar Hassan',
    phone: '+964 750 987 6543',
    address: 'Erbil - 60m Main Road',
    balance: 3200.00,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cust_3',
    storeName: 'Al-Mustaqbal Office Supplies',
    ownerName: 'Zainab Kareem',
    phone: '+964 780 555 1212',
    address: 'Basra - Al-Jaza\'ir St.',
    balance: 0.00,
    createdAt: new Date().toISOString()
  },
  {
    id: 'cust_4',
    storeName: 'Al-Baraka Retail Express',
    ownerName: 'Bilal Farooq',
    phone: '+964 771 333 8899',
    address: 'Najaf - Al-Adalat Sector',
    balance: 875.50,
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_SUB_INVENTORIES = {
  'rep_1': [
    { productId: 'prod_1', qty: 15 },
    { productId: 'prod_3', qty: 40 },
    { productId: 'prod_4', qty: 10 }
  ],
  'rep_2': [
    { productId: 'prod_2', qty: 25 },
    { productId: 'prod_5', qty: 30 }
  ]
};

export const INITIAL_ORDERS = [
  {
    id: 'ORD-1001',
    createdBy: 'rep_1',
    createdByName: 'Sami Al-Ali',
    salesRepId: 'rep_1',
    customerId: 'cust_1',
    customerName: 'Al-Rayyan Supermarket',
    items: [
      { productId: 'prod_1', name: 'Ultra HD 4K Commercial Monitor 32"', qty: 2, price: 260, buyPrice: 180 },
      { productId: 'prod_3', name: 'Wireless Mechanical Keyboard Pro', qty: 5, price: 75, buyPrice: 40 }
    ],
    totalAmount: 895,
    previousDebt: 1000,
    paidAmount: 445,
    remainingDebt: 1450,
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'ORD-1002',
    createdBy: 'public_customer',
    createdByName: 'Online Customer',
    salesRepId: 'rep_1',
    customerId: 'cust_3',
    customerName: 'Al-Mustaqbal Office Supplies',
    items: [
      { productId: 'prod_4', name: 'High-Speed POS Thermal Printer 80mm', qty: 3, price: 110, buyPrice: 60 }
    ],
    totalAmount: 330,
    previousDebt: 0,
    paidAmount: 330,
    remainingDebt: 0,
    status: 'pending_approval',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_LOGS = [
  {
    id: 'LOG-5001',
    type: 'load',
    handledBy: 'storekeeper_1',
    handledByName: 'Tariq Mahmood',
    targetRepId: 'rep_1',
    targetRepName: 'Sami Al-Ali',
    items: [
      { productId: 'prod_1', name: 'Ultra HD 4K Commercial Monitor 32"', qty: 15 },
      { productId: 'prod_3', name: 'Wireless Mechanical Keyboard Pro', qty: 40 },
      { productId: 'prod_4', name: 'High-Speed POS Thermal Printer 80mm', qty: 10 }
    ],
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'LOG-5002',
    type: 'direct_sale',
    handledBy: 'storekeeper_1',
    handledByName: 'Tariq Mahmood',
    targetRepId: null,
    targetRepName: null,
    items: [
      { productId: 'prod_2', name: 'Ergonomic Mesh Task Chair', qty: 5 }
    ],
    timestamp: new Date(Date.now() - 86400000).toISOString()
  }
];
