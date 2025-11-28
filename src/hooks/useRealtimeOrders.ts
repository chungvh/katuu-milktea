import { useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/config/supabase';
import type { PendingOrder, MergedOrder } from '@/models/types';

interface RealtimeOrdersState {
    pendingOrders: PendingOrder[];
    mergedOrders: MergedOrder[];
    isLoading: boolean;
    error: string | null;
}

interface RealtimeOrdersHook extends RealtimeOrdersState {
    refresh: () => Promise<void>;
}

/**
 * Custom hook để subscribe Supabase Realtime channels
 * Auto-update orders khi có thay đổi trong database
 */
export function useRealtimeOrders(): RealtimeOrdersHook {
    const [state, setState] = useState<RealtimeOrdersState>({
        pendingOrders: [],
        mergedOrders: [],
        isLoading: true,
        error: null,
    });

    // Convert Supabase row to PendingOrder
    const convertToPendingOrder = useCallback((row: any): PendingOrder => ({
        id: row.id,
        customerName: row.customer_name,
        items: row.items,
        totalPrice: row.total_price,
        createdAt: row.created_at,
        status: row.status,
    }), []);

    // Convert Supabase row to MergedOrder
    const convertToMergedOrder = useCallback((row: any): MergedOrder => ({
        id: row.id,
        pendingOrderIds: row.pending_order_ids,
        customerNames: row.customer_names,
        totalItems: row.total_items,
        totalPrice: row.total_price,
        mergedBy: row.merged_by,
        mergedAt: row.merged_at,
        items: row.items,
    }), []);

    // Initial fetch
    const fetchOrders = useCallback(async () => {
        if (!isSupabaseConfigured()) {
            // Fallback to localStorage
            const pendingStored = localStorage.getItem('pendingOrders');
            const mergedStored = localStorage.getItem('mergedOrders');

            setState({
                pendingOrders: pendingStored ? JSON.parse(pendingStored) : [],
                mergedOrders: mergedStored ? JSON.parse(mergedStored) : [],
                isLoading: false,
                error: null,
            });
            return;
        }

        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const [pendingResult, mergedResult] = await Promise.all([
                supabase
                    .from('pending_orders')
                    .select('*')
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false }),
                supabase
                    .from('merged_orders')
                    .select('*')
                    .order('merged_at', { ascending: false }),
            ]);

            if (pendingResult.error) throw pendingResult.error;
            if (mergedResult.error) throw mergedResult.error;

            const pending = (pendingResult.data || []).map(convertToPendingOrder);
            const merged = (mergedResult.data || []).map(convertToMergedOrder);

            setState({
                pendingOrders: pending,
                mergedOrders: merged,
                isLoading: false,
                error: null,
            });

            // Sync to localStorage
            localStorage.setItem('pendingOrders', JSON.stringify(pending));
            localStorage.setItem('mergedOrders', JSON.stringify(merged));
        } catch (error) {
            console.error('Failed to fetch orders:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch orders',
            }));
        }
    }, [convertToPendingOrder, convertToMergedOrder]);

    useEffect(() => {
        fetchOrders();

        if (!isSupabaseConfigured()) {
            return;
        }

        console.log('🔴 Setting up Realtime subscriptions...');

        // Subscribe to pending_orders changes
        const pendingChannel = supabase
            .channel('pending_orders_changes')
            .on(
                'postgres_changes',
                {
                    event: '*', // INSERT, UPDATE, DELETE
                    schema: 'public',
                    table: 'pending_orders',
                },
                (payload) => {
                    console.log('📦 Pending order change:', payload);

                    setState((prev) => {
                        let updated = [...prev.pendingOrders];

                        if (payload.eventType === 'INSERT') {
                            const newOrder = convertToPendingOrder(payload.new);
                            updated = [newOrder, ...updated];

                            // Show notification
                            if ('Notification' in window && Notification.permission === 'granted') {
                                new Notification('Đơn hàng mới!', {
                                    body: `${newOrder.customerName} - ${newOrder.totalPrice.toLocaleString()}đ`,
                                    icon: '/favicon.ico',
                                });
                            }
                        } else if (payload.eventType === 'UPDATE') {
                            const updatedOrder = convertToPendingOrder(payload.new);
                            updated = updated.map((o) =>
                                o.id === updatedOrder.id ? updatedOrder : o
                            );
                        } else if (payload.eventType === 'DELETE') {
                            updated = updated.filter((o) => o.id !== payload.old.id);
                        }

                        localStorage.setItem('pendingOrders', JSON.stringify(updated));
                        return { ...prev, pendingOrders: updated };
                    });
                }
            )
            .subscribe();

        // Subscribe to merged_orders changes
        const mergedChannel = supabase
            .channel('merged_orders_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'merged_orders',
                },
                (payload) => {
                    console.log('📦 Merged order change:', payload);

                    setState((prev) => {
                        let updated = [...prev.mergedOrders];

                        if (payload.eventType === 'INSERT') {
                            const newOrder = convertToMergedOrder(payload.new);
                            updated = [newOrder, ...updated];
                        } else if (payload.eventType === 'UPDATE') {
                            const updatedOrder = convertToMergedOrder(payload.new);
                            updated = updated.map((o) =>
                                o.id === updatedOrder.id ? updatedOrder : o
                            );
                        } else if (payload.eventType === 'DELETE') {
                            updated = updated.filter((o) => o.id !== payload.old.id);
                        }

                        localStorage.setItem('mergedOrders', JSON.stringify(updated));
                        return { ...prev, mergedOrders: updated };
                    });
                }
            )
            .subscribe();

        // Cleanup
        return () => {
            console.log('🔴 Unsubscribing from Realtime channels...');
            pendingChannel.unsubscribe();
            mergedChannel.unsubscribe();
        };
    }, [fetchOrders, convertToPendingOrder, convertToMergedOrder]);

    return {
        ...state,
        refresh: fetchOrders,
    };
}
