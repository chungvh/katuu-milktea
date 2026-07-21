import { apiFetch } from '@/config/api';
import type { PendingOrder, MergedOrder, OrderItem, HistoricOrder } from '@/models/types';

/**
 * Laravel API Service for Orders
 * Handles all database operations via HTTP client with fallback to localStorage
 */

// ============ PENDING ORDERS ============

export async function fetchPendingOrders(): Promise<PendingOrder[]> {
  try {
    const orders = await apiFetch<PendingOrder[]>('/api/pending-orders');

    // Sync localStorage with API data
    if (orders.length === 0) {
      const previouslyHadOrders = localStorage.getItem('pendingOrders') !== null;
      if (previouslyHadOrders) {
        console.log('✅ API returns empty pending orders, clearing localStorage and guest history');
      }
      localStorage.removeItem('pendingOrders');
      
      try {
        const ts = Date.now().toString();
        localStorage.setItem('orderHistoryClearedAt', ts);
        localStorage.setItem('bobaBlissOrderHistory', '[]');
        localStorage.setItem('_triggerClear', ts);
        setTimeout(() => localStorage.removeItem('_triggerClear'), 100);
        window.dispatchEvent(new CustomEvent('orderHistoryCleared'));
      } catch (e) {
        console.error('Failed to clear guest history after pending_orders empty', e);
      }
    } else {
      localStorage.setItem('pendingOrders', JSON.stringify(orders));
    }

    return orders;
  } catch (error) {
    console.error('Failed to fetch pending orders from API:', error);
    // Fallback to localStorage
    const stored = localStorage.getItem('pendingOrders');
    return stored ? JSON.parse(stored) : [];
  }
}

export async function createPendingOrder(order: Omit<PendingOrder, 'id' | 'createdAt' | 'status'>): Promise<PendingOrder> {
  const newOrder: PendingOrder = {
    id: `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    ...order,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  try {
    const createdOrder = await apiFetch<PendingOrder>('/api/pending-orders', {
      method: 'POST',
      data: {
        id: newOrder.id,
        customerName: newOrder.customerName,
        items: newOrder.items,
        totalPrice: newOrder.totalPrice,
        status: newOrder.status
      }
    });

    // Save to localStorage as backup
    const stored = localStorage.getItem('pendingOrders');
    const orders = stored ? JSON.parse(stored) : [];
    orders.unshift(createdOrder);
    localStorage.setItem('pendingOrders', JSON.stringify(orders));

    return createdOrder;
  } catch (error) {
    console.error('Failed to create pending order in API:', error);
    // Fallback: save to localStorage only
    const stored = localStorage.getItem('pendingOrders');
    const orders = stored ? JSON.parse(stored) : [];
    orders.unshift(newOrder);
    localStorage.setItem('pendingOrders', JSON.stringify(orders));
    return newOrder;
  }
}

/**
 * Update an existing pending order
 */
export async function updatePendingOrder(
  orderId: string,
  data: { customerName: string; items: OrderItem[]; totalPrice: number }
): Promise<PendingOrder> {
  try {
    const updatedOrder = await apiFetch<PendingOrder>(`/api/pending-orders/${orderId}`, {
      method: 'PUT',
      data: {
        customerName: data.customerName,
        items: data.items,
        totalPrice: data.totalPrice
      }
    });

    console.log('✅ Updated pending order in API:', orderId);

    // Update localStorage
    const stored = localStorage.getItem('pendingOrders');
    const orders: PendingOrder[] = stored ? JSON.parse(stored) : [];
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index] = updatedOrder;
      localStorage.setItem('pendingOrders', JSON.stringify(orders));
    }

    return updatedOrder;
  } catch (error) {
    console.error('Failed to update pending order in API:', error);
    // Fallback: update localStorage only
    const fallbackOrder: PendingOrder = {
      id: orderId,
      customerName: data.customerName,
      items: data.items,
      totalPrice: data.totalPrice,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };
    
    const stored = localStorage.getItem('pendingOrders');
    const orders: PendingOrder[] = stored ? JSON.parse(stored) : [];
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index] = fallbackOrder;
      localStorage.setItem('pendingOrders', JSON.stringify(orders));
    }
    return fallbackOrder;
  }
}

export async function deletePendingOrder(orderId: string): Promise<void> {
  try {
    await apiFetch(`/api/pending-orders/${orderId}`, {
      method: 'DELETE'
    });
    console.log('✅ Deleted pending order in API:', orderId);
  } catch (error) {
    console.error('Failed to delete pending order in API:', error);
  }

  // Always update localStorage
  const stored = localStorage.getItem('pendingOrders');
  if (stored) {
    const orders = JSON.parse(stored);
    const updated = orders.filter((o: PendingOrder) => o.id !== orderId);
    localStorage.setItem('pendingOrders', JSON.stringify(updated));
  }
}

// ============ MERGED ORDERS ============

export async function fetchMergedOrders(): Promise<MergedOrder[]> {
  try {
    const mergedOrders = await apiFetch<MergedOrder[]>('/api/merged-orders');

    // Sync localStorage
    if (mergedOrders.length === 0) {
      localStorage.removeItem('mergedOrders');
    } else {
      localStorage.setItem('mergedOrders', JSON.stringify(mergedOrders));
    }

    return mergedOrders;
  } catch (error) {
    console.error('Failed to fetch merged orders from API:', error);
    const stored = localStorage.getItem('mergedOrders');
    return stored ? JSON.parse(stored) : [];
  }
}

export async function createMergedOrder(
  orderIds: string[],
  mergedBy: string,
  pendingOrders: PendingOrder[]
): Promise<MergedOrder> {
  // Find orders to merge
  const ordersToMerge = pendingOrders.filter(o => orderIds.includes(o.id));
  if (ordersToMerge.length === 0) {
    throw new Error('No orders to merge');
  }

  // Calculate merged data
  const allItems = ordersToMerge.flatMap(o => o.items);
  const totalPrice = ordersToMerge.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const uniqueNames = new Set<string>();
  ordersToMerge.forEach(o => uniqueNames.add(o.customerName));
  const customerNames = Array.from(uniqueNames);

  console.log('📊 Merge calculation:', {
    ordersCount: ordersToMerge.length,
    itemsCount: allItems.length,
    totalPrice,
    customers: customerNames
  });

  const mergedOrder: MergedOrder = {
    id: `MO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    pendingOrderIds: orderIds,
    customerNames,
    totalItems: allItems.length,
    totalPrice: totalPrice || 0,
    mergedBy,
    mergedAt: new Date().toISOString(),
    items: allItems,
  };

  try {
    const createdOrder = await apiFetch<MergedOrder>('/api/merged-orders', {
      method: 'POST',
      data: {
        id: mergedOrder.id,
        pendingOrderIds: mergedOrder.pendingOrderIds,
        customerNames: mergedOrder.customerNames,
        totalItems: mergedOrder.totalItems,
        totalPrice: mergedOrder.totalPrice,
        mergedBy: mergedOrder.mergedBy,
        items: mergedOrder.items
      }
    });

    // Save to localStorage as backup
    const stored = localStorage.getItem('mergedOrders');
    const orders = stored ? JSON.parse(stored) : [];
    orders.unshift(createdOrder);
    localStorage.setItem('mergedOrders', JSON.stringify(orders));

    return createdOrder;
  } catch (error) {
    console.error('Failed to create merged order in API:', error);
    // Fallback: save to localStorage only
    const stored = localStorage.getItem('mergedOrders');
    const orders = stored ? JSON.parse(stored) : [];
    orders.unshift(mergedOrder);
    localStorage.setItem('mergedOrders', JSON.stringify(orders));
    return mergedOrder;
  }
}

// ============ ORDER HISTORY (Guest/Staff) ============

export async function clearOrderHistory(): Promise<void> {
  console.log('🗑️ Clearing order history...');

  const timestamp = Date.now().toString();

  // Set local flag
  localStorage.setItem('orderHistoryClearedAt', timestamp);
  localStorage.setItem('bobaBlissOrderHistory', '[]');

  try {
    await apiFetch('/api/order-history', {
      method: 'DELETE'
    });
    console.log('✅ Cleared API order history');
  } catch (error) {
    console.error('Failed to clear API history:', error);
  }

  // Broadcast
  localStorage.setItem('_triggerClear', timestamp);
  setTimeout(() => localStorage.removeItem('_triggerClear'), 100);
  window.dispatchEvent(new CustomEvent('orderHistoryCleared'));
}

/**
 * Fetch order history from API
 * Used for Dashboard statistics (flattens merged orders)
 */
export async function fetchOrderHistory(): Promise<HistoricOrder[]> {
  try {
    const mergedOrders = await fetchMergedOrders();

    // Convert merged orders to HistoricOrder format
    const orders: HistoricOrder[] = mergedOrders.flatMap((row: MergedOrder) => {
      return (row.items || []).map((item: any, index: number) => ({
        id: `${row.id}-item-${index}`,
        date: row.mergedAt,
        product: item.product,
        toppings: item.toppings || [],
        size: item.size,
        sugar: item.sugar,
        ice: item.ice,
        customerName: row.customerNames?.[0] || 'Unknown',
        totalPrice: item.price || item.totalPrice || 0
      }));
    });

    return orders;
  } catch (error) {
    console.error('Failed to fetch order history:', error);
    const stored = localStorage.getItem('bobaBlissOrderHistory');
    return stored ? JSON.parse(stored) : [];
  }
}
