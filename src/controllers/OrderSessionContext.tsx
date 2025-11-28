import React, { createContext, useContext, ReactNode, useCallback, useEffect } from 'react';
import type { PendingOrder, OrderItem, MergedOrder } from '@/models/types';
import * as orderService from '@/models/orderService';
import { useRealtimeOrders } from '@/hooks/useRealtimeOrders';

interface OrderSessionContextType {
  pendingOrders: PendingOrder[];
  mergedOrders: MergedOrder[];
  addPendingOrder: (customerName: string, items: OrderItem[]) => Promise<string>; // Returns pending order ID
  updatePendingOrder: (orderId: string, customerName: string, items: OrderItem[]) => Promise<void>;
  mergePendingOrders: (orderIds: string[], mergedBy: string) => Promise<void>;
  deletePendingOrder: (orderId: string) => Promise<void>;
  getPendingOrdersCount: () => number;
  reloadOrders: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const OrderSessionContext = createContext<OrderSessionContextType | undefined>(undefined);

export const OrderSessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use realtime hook instead of manual state management
  const {
    pendingOrders,
    mergedOrders,
    isLoading,
    error,
    refresh
  } = useRealtimeOrders();

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);

  const addPendingOrder = useCallback(async (customerName: string, items: OrderItem[]): Promise<string> => {
    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

    try {
      // Create via service (will trigger realtime update)
      const pendingOrder = await orderService.createPendingOrder({
        customerName,
        items,
        totalPrice
      });

      // Realtime hook will auto-update state

      // Return pending order ID for caller to link with history
      return pendingOrder.id;
    } catch (error) {
      console.error('Failed to add pending order:', error);
      throw error;
    }
  }, []);

  const updatePendingOrder = useCallback(async (orderId: string, customerName: string, items: OrderItem[]) => {
    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

    try {
      // Update via service (will trigger realtime update)
      await orderService.updatePendingOrder(orderId, {
        customerName,
        items,
        totalPrice
      });

      // Realtime hook will auto-update state
      console.log('✅ Updated pending order:', orderId);
    } catch (error) {
      console.error('Failed to update pending order:', error);
      throw error;
    }
  }, []);

  const mergePendingOrders = useCallback(async (orderIds: string[], mergedBy: string) => {
    try {
      console.log('🔄 Merging orders:', orderIds);

      // Create merged order via service
      const mergedOrder = await orderService.createMergedOrder(orderIds, mergedBy, pendingOrders);
      console.log('✅ Merged order created:', mergedOrder.id);

      // Delete pending orders that were merged
      await Promise.all(orderIds.map(id => orderService.deletePendingOrder(id)));
      console.log('✅ Deleted pending orders');

      // Realtime hook will auto-update state

      // Clear order history
      await orderService.clearOrderHistory();

      console.log('🎉 Orders merged and history cleared successfully!');
    } catch (error) {
      console.error('❌ Failed to merge orders:', error);
      throw error;
    }
  }, [pendingOrders]);

  const deletePendingOrder = useCallback(async (orderId: string) => {
    try {
      // Delete via service (will trigger realtime update)
      await orderService.deletePendingOrder(orderId);

      // Realtime hook will auto-update state
    } catch (error) {
      console.error('Failed to delete pending order:', error);
      throw error;
    }
  }, []);

  const getPendingOrdersCount = useCallback(() => {
    return pendingOrders.filter(o => o.status === 'pending').length;
  }, [pendingOrders]);

  return (
    <OrderSessionContext.Provider
      value={{
        pendingOrders,
        mergedOrders,
        addPendingOrder,
        updatePendingOrder,
        mergePendingOrders,
        deletePendingOrder,
        getPendingOrdersCount,
        reloadOrders: refresh,
        isLoading,
        error,
      }}
    >
      {children}
    </OrderSessionContext.Provider>
  );
};

export const useOrderSession = () => {
  const context = useContext(OrderSessionContext);
  if (context === undefined) {
    throw new Error('useOrderSession must be used within an OrderSessionProvider');
  }
  return context;
};
