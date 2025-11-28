import type { Product, Topping, Size, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'milk-tea', name: 'Trà Sữa' },
  { id: 'fruit-tea', name: 'Trà Trái Cây' },
  { id: 'fresh-milk', name: 'Sữa Tươi' },
  { id: 'cafe', name: 'Cafe' },
  { id: 'latte', name: 'Latte' },
];

export const PRODUCTS: Product[] = [
  // Trà Sữa
  { id: 1, name: 'Trà Sữa Katuu', price: 30000, image: 'https://picsum.photos/id/101/400/400', category: 'milk-tea' },
  { id: 2, name: 'Trà Sữa Truyền Thống', price: 20000, image: 'https://picsum.photos/id/102/400/400', category: 'milk-tea' },
  { id: 3, name: 'Trà Sữa Okinawa', price: 20000, image: 'https://picsum.photos/id/103/400/400', category: 'milk-tea' },
  { id: 4, name: 'Trà Sữa Lai', price: 20000, image: 'https://picsum.photos/id/104/400/400', category: 'milk-tea' },
  { id: 5, name: 'Trà Sữa Olong', price: 23000, image: 'https://picsum.photos/id/106/400/400', category: 'milk-tea' },
  { id: 6, name: 'Trà Sữa Olong Lài', price: 23000, image: 'https://picsum.photos/id/111/400/400', category: 'milk-tea' },
  { id: 7, name: 'Trà Sữa Matcha', price: 23000, image: 'https://picsum.photos/id/112/400/400', category: 'milk-tea' },
  { id: 8, name: 'Trà Sữa Chocolate', price: 23000, image: 'https://picsum.photos/id/113/400/400', category: 'milk-tea' },
  { id: 9, name: 'Trà Sữa Chocomint', price: 23000, image: 'https://picsum.photos/id/114/400/400', category: 'milk-tea' },
  { id: 10, name: 'Trà Sữa Hạt Dẻ Phô Mai', price: 27000, image: 'https://picsum.photos/id/115/400/400', category: 'milk-tea' },
  { id: 11, name: 'Trà Sữa Kem Macchiato', price: 27000, image: 'https://picsum.photos/id/116/400/400', category: 'milk-tea' },
  { id: 12, name: 'Trà Sữa Kem Trứng Cháy', price: 27000, image: 'https://picsum.photos/id/117/400/400', category: 'milk-tea' },

  // Trà Trái Cây
  { id: 13, name: 'Trà Trái Cây Nhiệt Đới', price: 33000, image: 'https://picsum.photos/id/201/400/400', category: 'fruit-tea' },
  { id: 14, name: 'Trà Vải Lài', price: 30000, image: 'https://picsum.photos/id/202/400/400', category: 'fruit-tea' },
  { id: 15, name: 'Trà Đào', price: 30000, image: 'https://picsum.photos/id/203/400/400', category: 'fruit-tea' },
  { id: 16, name: 'Trà Ổi Hồng Ruby', price: 30000, image: 'https://picsum.photos/id/204/400/400', category: 'fruit-tea' },
  { id: 17, name: 'Trà Cam Bưởi Xí Muội', price: 30000, image: 'https://picsum.photos/id/205/400/400', category: 'fruit-tea' },
  { id: 18, name: 'Lục Trà Chanh Dây Macchiato', price: 30000, image: 'https://picsum.photos/id/206/400/400', category: 'fruit-tea' },
  { id: 19, name: 'Lục Trà Chanh Mật Ong', price: 25000, image: 'https://picsum.photos/id/207/400/400', category: 'fruit-tea' },

  // Sữa Tươi
  { id: 20, name: 'Sữa Tươi Trân Châu Đường Đen', price: 28000, image: 'https://picsum.photos/id/301/400/400', category: 'fresh-milk' },
  { id: 21, name: 'Sữa Tươi Trà Xanh Trân Châu Đường Đen', price: 30000, image: 'https://picsum.photos/id/302/400/400', category: 'fresh-milk' },
  { id: 22, name: 'Sữa Tươi Choco Trân Châu Đường Đen', price: 30000, image: 'https://picsum.photos/id/303/400/400', category: 'fresh-milk' },

  // Cafe
  { id: 23, name: 'Cafe Đen', price: 15000, image: 'https://picsum.photos/id/401/400/400', category: 'cafe' },
  { id: 24, name: 'Cafe Sữa', price: 18000, image: 'https://picsum.photos/id/402/400/400', category: 'cafe' },
  { id: 25, name: 'Bạc Xỉu', price: 20000, image: 'https://picsum.photos/id/403/400/400', category: 'cafe' },
  { id: 26, name: 'Cafe Kem Sữa', price: 25000, image: 'https://picsum.photos/id/404/400/400', category: 'cafe' },
  { id: 27, name: 'Cafe Sữa Tươi Sương Sáo', price: 25000, image: 'https://picsum.photos/id/405/400/400', category: 'cafe' },

  // Latte
  { id: 28, name: 'Matcha Latte', price: 30000, image: 'https://picsum.photos/id/501/400/400', category: 'latte' },
  { id: 29, name: 'Choco Latte', price: 30000, image: 'https://picsum.photos/id/502/400/400', category: 'latte' },
  { id: 30, name: 'Matcha Oreo Phô Mai', price: 35000, image: 'https://picsum.photos/id/503/400/400', category: 'latte' },
];

export const TOPPINGS: Topping[] = [
  { id: 1, name: 'Trân Châu Đen', price: 5000 },
  { id: 2, name: 'Trân Châu Trắng', price: 5000 },
  { id: 3, name: 'Rau Câu Phô Mai', price: 5000 },
  { id: 4, name: 'Pudding', price: 5000 },
  { id: 5, name: 'Sương Sáo', price: 5000 },
  { id: 6, name: 'Phô Mai Tươi', price: 5000 },
  { id: 7, name: 'Hạt Thủy Tinh', price: 5000 },
  { id: 8, name: 'Đào Miếng', price: 7000 },
  { id: 9, name: 'Trái Vải', price: 7000 },
  { id: 10, name: 'Kem Macchiato', price: 7000 },
  { id: 11, name: 'Kem Trứng Cháy', price: 7000 },
  { id: 12, name: 'Full Topping', price: 10000 },
];

export const SIZES: Size[] = [
  { id: 1, name: 'Size M', priceModifier: 0 },
  { id: 2, name: 'Size L', priceModifier: 5000 },
];

export const SUGAR_LEVELS: string[] = ['100% Đường', '75% Đường', '50% Đường', '25% Đường', 'Không Đường'];
export const ICE_LEVELS: string[] = ['Đá Bình Thường', 'Ít Đá', 'Không Đá'];

