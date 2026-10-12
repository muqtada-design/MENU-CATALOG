export const DEFAULT_USERS = [
  {
    id: 'admin',
    name: 'التاجر (المدير)',
    email: 'admin@apex.com',
    role: 'admin',
    pin: '0000',
    isActive: true
  },
  {
    id: 'storekeeper',
    name: 'طارق - أمين المخزن',
    email: 'storekeeper@apex.com',
    role: 'storekeeper',
    pin: '2222',
    isActive: true
  },
  {
    id: 'rep_ali',
    name: 'علي - المندوب',
    email: 'ali@apex.com',
    role: 'sales_rep',
    pin: '1111',
    isActive: true,
    inventory: []
  },
  // Backward compatibility aliases
  {
    id: 'u1',
    name: 'التاجر (المدير)',
    email: 'admin@apex.com',
    role: 'admin',
    pin: '0000',
    isActive: true
  },
  {
    id: 'u4',
    name: 'طارق - أمين المخزن',
    email: 'storekeeper@apex.com',
    role: 'storekeeper',
    pin: '2222',
    isActive: true
  },
  {
    id: 'u2',
    name: 'سارة - مندوب مبيعات',
    email: 'sara@apex.com',
    role: 'sales_rep',
    pin: '1111',
    isActive: true,
    inventory: []
  },
  {
    id: 'u3',
    name: 'سامي - مندوب مبيعات',
    email: 'sami@apex.com',
    role: 'sales_rep',
    pin: '1111',
    isActive: true,
    inventory: []
  }
];

export const DEFAULT_PRODUCTS = [
  {
    id: 'p_water',
    name: 'كرتونة مياه معدنية 330 مل',
    category: 'مشروبات',
    price: 15,
    sellPrice: 15,
    costPrice: 10,
    buyPrice: 10,
    stock: 120,
    mainStock: 120,
    unit: 'كرتونة',
    image: 'https://images.unsplash.com/photo-1559839914-ba2ae647c003?auto=format&fit=crop&q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1559839914-ba2ae647c003?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'p_rice',
    name: 'أرز بسمتي 10 كيلو',
    category: 'مواد غذائية',
    price: 55,
    sellPrice: 55,
    costPrice: 40,
    buyPrice: 40,
    stock: 85,
    mainStock: 85,
    unit: 'كيس',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'p_oil',
    name: 'زيت زيتون بكر ممتاز 5 لتر',
    category: 'مواد غذائية',
    price: 150,
    sellPrice: 150,
    costPrice: 120,
    buyPrice: 120,
    stock: 45,
    mainStock: 45,
    unit: 'تنكة',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'p_tissues',
    name: 'مناديل ورقية 100 عبوة',
    category: 'منظفات ورقيات',
    price: 110,
    sellPrice: 110,
    costPrice: 80,
    buyPrice: 80,
    stock: 200,
    mainStock: 200,
    unit: 'كرتونة',
    image: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1584556812952-905ffd0c611a?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'p_monitor',
    name: 'شاشة تجارية فائقة الدقة 32 بوصة',
    category: 'إلكترونيات',
    price: 260,
    sellPrice: 260,
    costPrice: 180,
    buyPrice: 180,
    stock: 60,
    mainStock: 60,
    unit: 'شاشة',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'p_scanner',
    name: 'قارئ باركود لاسلكي 2D',
    category: 'معدات',
    price: 58,
    sellPrice: 58,
    costPrice: 30,
    buyPrice: 30,
    stock: 95,
    mainStock: 95,
    unit: 'جهاز',
    image: 'https://images.unsplash.com/photo-1556742049-0a67412e022f?auto=format&fit=crop&q=80&w=600',
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67412e022f?auto=format&fit=crop&q=80&w=600'
  }
];

export const FALLBACK_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600';
