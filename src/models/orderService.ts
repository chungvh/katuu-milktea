import { supabase, isSupabaseConfigured } from '@/config/supabase';
import type { PendingOrder, MergedOrder, OrderItem, HistoricOrder } from '@/models/types';

/**
 * Supabase Service for Orders
 * Handles all database operations with fallback to localStorage
 */

// ============ PENDING ORDERS ============

export async function fetchPendingOrders(): Promise<PendingOrder[]> {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, using localStorage');
    const stored = localStorage.getItem('pendingOrders');
    return stored ? JSON.parse(stored) : [];
  }

  try {
    const { data, error } = await supabase
      .from('pending_orders')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Convert snake_case to camelCase
    const orders = (data || []).map((row: any) => ({
      id: row.id,
      customerName: row.customer_name,
      items: row.items,
      totalPrice: row.total_price,
      createdAt: row.created_at,
      status: row.status
    }));

    // Sync localStorage with API data
    if (orders.length === 0) {
      // API returns empty → clear localStorage
      console.log('✅ API returns empty pending orders, clearing localStorage and guest history');

      // remove pendingOrders key
      localStorage.removeItem('pendingOrders');

      // Also clear guest order history (bobaBlissOrderHistory) and mark cleared timestamp so clients can compare
      try {
        const ts = Date.now().toString();
        localStorage.setItem('orderHistoryClearedAt', ts);
        // set to empty array string so UI code parsing will handle it consistently
        localStorage.setItem('bobaBlissOrderHistory', '[]');

        // trigger cross-tab event and a transient flag used elsewhere
        localStorage.setItem('_triggerClear', ts);
        setTimeout(() => localStorage.removeItem('_triggerClear'), 100);
        window.dispatchEvent(new CustomEvent('orderHistoryCleared'));
      } catch (e) {
        console.error('Failed to clear guest history after pending_orders empty', e);
      }
    } else {
      // API has data → update localStorage
      localStorage.setItem('pendingOrders', JSON.stringify(orders));
    }

    return orders;
  } catch (error) {
    console.error('Failed to fetch pending orders:', error);
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

  if (!isSupabaseConfigured()) {
    // Fallback: localStorage
    const stored = localStorage.getItem('pendingOrders');
    const orders = stored ? JSON.parse(stored) : [];
    orders.unshift(newOrder);
    localStorage.setItem('pendingOrders', JSON.stringify(orders));
    return newOrder;
  }

  try {
    const { data, error } = await supabase
      .from('pending_orders')
      .insert([{
        id: newOrder.id,
        customer_name: newOrder.customerName,
        items: newOrder.items as any,
        total_price: newOrder.totalPrice,
        created_at: newOrder.createdAt,
        status: newOrder.status
      }])
      .select()
      .single();

    if (error) throw error;

    // Convert response from snake_case to camelCase
    const createdOrder: PendingOrder = data ? {
      id: data.id,
      customerName: data.customer_name,
      items: data.items,
      totalPrice: data.total_price,
      createdAt: data.created_at,
      status: data.status
    } : newOrder;

    // Also save to localStorage as backup
    const stored = localStorage.getItem('pendingOrders');
    const orders = stored ? JSON.parse(stored) : [];
    orders.unshift(createdOrder);
    localStorage.setItem('pendingOrders', JSON.stringify(orders));

    return createdOrder;
  } catch (error) {
    console.error('Failed to create pending order:', error);
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
  const updatedOrder: PendingOrder = {
    id: orderId, // Keep same ID
    customerName: data.customerName,
    items: data.items,
    totalPrice: data.totalPrice,
    createdAt: new Date().toISOString(), // Update timestamp
    status: 'pending',
  };

  if (isSupabaseConfigured()) {
    try {
      const { data: result, error } = await supabase
        .from('pending_orders')
        .update({
          customer_name: data.customerName,
          items: data.items,
          total_price: data.totalPrice,
          created_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Updated pending order in Supabase:', orderId);

      // Also update localStorage
      const stored = localStorage.getItem('pendingOrders');
      const orders: PendingOrder[] = stored ? JSON.parse(stored) : [];
      const index = orders.findIndex(o => o.id === orderId);
      if (index !== -1) {
        orders[index] = updatedOrder;
        localStorage.setItem('pendingOrders', JSON.stringify(orders));
      }

      return updatedOrder;
    } catch (error) {
      console.error('Failed to update pending order in Supabase:', error);
      // Fallback: update localStorage only
      const stored = localStorage.getItem('pendingOrders');
      const orders: PendingOrder[] = stored ? JSON.parse(stored) : [];
      const index = orders.findIndex(o => o.id === orderId);
      if (index !== -1) {
        orders[index] = updatedOrder;
        localStorage.setItem('pendingOrders', JSON.stringify(orders));
      }
      return updatedOrder;
    }
  } else {
    // Supabase not configured, update localStorage
    const stored = localStorage.getItem('pendingOrders');
    const orders: PendingOrder[] = stored ? JSON.parse(stored) : [];
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index] = updatedOrder;
      localStorage.setItem('pendingOrders', JSON.stringify(orders));
    }
    return updatedOrder;
  }
}

export async function deletePendingOrder(orderId: string): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('pending_orders')
        .delete()
        .eq('id', orderId);
    } catch (error) {
      console.error('Failed to delete pending order:', error);
    }
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
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('mergedOrders');
    return stored ? JSON.parse(stored) : [];
  }

  try {
    const { data, error } = await supabase
      .from('merged_orders')
      .select('*')
      .order('merged_at', { ascending: false });

    if (error) throw error;

    // Convert snake_case to camelCase
    const converted = (data || []).map((row: any) => ({
      id: row.id,
      pendingOrderIds: row.pending_order_ids,
      customerNames: row.customer_names,
      totalItems: row.total_items,
      totalPrice: row.total_price,
      mergedBy: row.merged_by,
      mergedAt: row.merged_at,
      items: row.items
    }));

    // Sync localStorage with API data
    if (converted.length === 0) {
      // API returns empty → clear localStorage
      console.log('✅ API returns empty merged orders, clearing localStorage');
      localStorage.removeItem('mergedOrders');
    } else {
      // API has data → update localStorage
      localStorage.setItem('mergedOrders', JSON.stringify(converted));
    }

    return converted;
  } catch (error) {
    console.error('Failed to fetch merged orders:', error);
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
    totalPrice: totalPrice || 0, // Ensure not null
    mergedBy,
    mergedAt: new Date().toISOString(),
    items: allItems,
  };

  if (!isSupabaseConfigured()) {
    // Fallback: localStorage
    const stored = localStorage.getItem('mergedOrders');
    const orders = stored ? JSON.parse(stored) : [];
    orders.unshift(mergedOrder);
    localStorage.setItem('mergedOrders', JSON.stringify(orders));
    return mergedOrder;
  }

  try {
    const { data, error } = await supabase
      .from('merged_orders')
      .insert([{
        id: mergedOrder.id,
        pending_order_ids: mergedOrder.pendingOrderIds,
        customer_names: mergedOrder.customerNames,
        total_items: mergedOrder.totalItems,
        total_price: mergedOrder.totalPrice,
        merged_by: mergedOrder.mergedBy,
        merged_at: mergedOrder.mergedAt,
        items: mergedOrder.items as any
      }])
      .select()
      .single();

    if (error) throw error;

    // Convert response from snake_case to camelCase
    const createdOrder: MergedOrder = data ? {
      id: data.id,
      pendingOrderIds: data.pending_order_ids,
      customerNames: data.customer_names,
      totalItems: data.total_items,
      totalPrice: data.total_price,
      mergedBy: data.merged_by,
      mergedAt: data.merged_at,
      items: data.items
    } : mergedOrder;

    // Also save to localStorage as backup
    const stored = localStorage.getItem('mergedOrders');
    const orders = stored ? JSON.parse(stored) : [];
    orders.unshift(createdOrder);
    localStorage.setItem('mergedOrders', JSON.stringify(orders));

    return createdOrder;
  } catch (error) {
    console.error('Failed to create merged order:', error);
    // Fallback: save to localStorage only
    const stored = localStorage.getItem('mergedOrders');
    const orders = stored ? JSON.parse(stored) : [];
    orders.unshift(mergedOrder);
    localStorage.setItem('mergedOrders', JSON.stringify(orders));
    return mergedOrder;
  }
}

// ============ ORDER HISTORY (Guest) ============

export async function clearOrderHistory(): Promise<void> {
  console.log('🗑️ Clearing order history...');

  const timestamp = Date.now().toString();

  // Set flag
  localStorage.setItem('orderHistoryClearedAt', timestamp);
  console.log('✅ Set orderHistoryClearedAt:', timestamp);

  // Clear localStorage
  localStorage.setItem('bobaBlissOrderHistory', '[]');
  console.log('✅ Cleared bobaBlissOrderHistory');

  // If Supabase configured, also clear there
  if (isSupabaseConfigured()) {
    try {
      // Delete old history (keep last 24h only)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      await supabase
        .from('order_history')
        .delete()
        .lt('created_at', oneDayAgo.toISOString());

      console.log('✅ Cleared Supabase order history (older than 24h)');
    } catch (error) {
      console.error('Failed to clear Supabase history:', error);
    }
  }

  // Broadcast
  localStorage.setItem('_triggerClear', timestamp);
  setTimeout(() => localStorage.removeItem('_triggerClear'), 100);
  window.dispatchEvent(new CustomEvent('orderHistoryCleared'));
}

/**
 * Fetch order history from Supabase
 * Used for Dashboard statistics
 */
export async function fetchOrderHistory(): Promise<HistoricOrder[]> {
  if (!isSupabaseConfigured()) {
    // Fallback to localStorage
    const stored = localStorage.getItem('bobaBlissOrderHistory');
    return stored ? JSON.parse(stored) : [];
  }

  try {
    // Fetch from merged_orders table (staff orders)
    const { data, error } = await supabase
      .from('merged_orders')
      .select('*')
      .order('merged_at', { ascending: false });

    if (error) throw error;

    // Convert merged orders to HistoricOrder format
    const orders: HistoricOrder[] = (data || []).flatMap((row: any) => {
      // Each merged order contains multiple items, convert them to individual historic orders
      return (row.items || []).map((item: any, index: number) => ({
        id: `${row.id}-item-${index}`,
        date: row.merged_at,
        product: item.product,
        toppings: item.toppings || [],
        size: item.size,
        sugar: item.sugar,
        ice: item.ice,
        customerName: row.customer_names?.[0] || 'Unknown',
        totalPrice: item.totalPrice || 0
      }));
    });

    return orders;
  } catch (error) {
    console.error('Failed to fetch order history from Supabase:', error);
    // Fallback to localStorage
    const stored = localStorage.getItem('bobaBlissOrderHistory');
    return stored ? JSON.parse(stored) : [];
  }
}
