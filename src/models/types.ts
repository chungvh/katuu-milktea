export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

export interface Topping {
  id: number;
  name: string;
  price: number;
}

export interface Size {
  id: number;
  name: string;
  priceModifier: number;
}

export interface Order {
  product: Product | null;
  toppings: Topping[];
  size: Size;
  sugar: string;
  ice: string;
  customerName: string;
}

export interface HistoricOrder extends Order {
  id: number;
  date: string;
  totalPrice: number;
  pendingOrderId?: string; // Reference to Supabase pending_orders.id
}

// === NEW: Session-based Multi-User Ordering ===

// Single order item (1 product + customization)
export interface OrderItem {
  product: Product;
  toppings: Topping[];
  size: Size;
  sugar: string;
  ice: string;
  price: number; // calculated price for this item
  customerName?: string; // name of customer who ordered this item
}

// Pending order from a single user (can have multiple items)
export interface PendingOrder {
  id: string; // unique ID
  customerName: string;
  items: OrderItem[];
  totalPrice: number;
  createdAt: string; // ISO timestamp
  status: 'pending' | 'merged';
}

// Merged order created by staff/admin
export interface MergedOrder {
  id: string;
  pendingOrderIds: string[]; // IDs of pending orders merged
  customerNames: string[]; // for display
  totalItems: number;
  totalPrice: number;
  mergedBy: string; // staff/admin username
  mergedAt: string; // ISO timestamp
  items: OrderItem[]; // all items from pending orders
}

// Audit log entry for admin actions
export interface AuditEntry {
  id: string;
  timestamp: string; // ISO
  user?: string;
  role?: string;
  action: 'create' | 'update' | 'delete' | 'other';
  target: 'product' | 'topping' | 'size' | 'category' | 'order' | 'other';
  targetId: string | number | null;
  before?: any;
  after?: any;
  note?: string;
}
