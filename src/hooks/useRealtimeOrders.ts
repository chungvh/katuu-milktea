import { useEffect, useState, useCallback, useRef } from 'react';
import type { PendingOrder, MergedOrder } from '@/models/types';
import { fetchPendingOrders, fetchMergedOrders } from '@/models/orderService';

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
 * Custom hook to emulate real-time updates via Polling
 * Automatically syncs orders with the Laravel backend
 * Dynamic interval based on current route (Staff vs Guest)
 */
export function useRealtimeOrders(): RealtimeOrdersHook {
    const [state, setState] = useState<RealtimeOrdersState>({
        pendingOrders: [],
        mergedOrders: [],
        isLoading: true,
        error: null,
    });

    const previousPendingIds = useRef<string[]>([]);

    // Fetch pending and merged orders from API
    const fetchOrders = useCallback(async () => {
        try {
            const [pending, merged] = await Promise.all([
                fetchPendingOrders(),
                fetchMergedOrders(),
            ]);

            // Filter out only active pending orders (frontend expects pending status)
            const activePending = pending.filter(o => o.status === 'pending');

            // Trigger notification for new orders
            if (previousPendingIds.current.length > 0) {
                const currentIds = activePending.map(o => o.id);
                const newOrders = activePending.filter(o => !previousPendingIds.current.includes(o.id));
                
                if (newOrders.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
                    newOrders.forEach(order => {
                        new Notification('Đơn hàng mới!', {
                            body: `${order.customerName} - ${order.totalPrice.toLocaleString()}đ`,
                            icon: '/favicon.ico',
                        });
                    });
                }
            }

            // Update ref
            previousPendingIds.current = activePending.map(o => o.id);

            setState({
                pendingOrders: activePending,
                mergedOrders: merged,
                isLoading: false,
                error: null,
            });
        } catch (error) {
            console.error('Failed to fetch orders in hook:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch orders',
            }));
        }
    }, []);

    // Determine polling frequency based on path
    const getIntervalTime = () => {
        const path = window.location.pathname;
        const isStaffRoute = path.startsWith('/pending') || 
                             path.startsWith('/dashboard') || 
                             path.startsWith('/merged') || 
                             path.startsWith('/summary');
        
        return isStaffRoute ? 5000 : 25000; // 5s for staff dashboards, 25s for guest screens
    };

    useEffect(() => {
        fetchOrders();

        const intervalTime = getIntervalTime();
        console.log(`🔄 Setting up Polling (${intervalTime / 1000}s) based on route: ${window.location.pathname}`);
        
        const intervalId = setInterval(() => {
            fetchOrders();
        }, intervalTime);

        // Cleanup
        return () => {
            clearInterval(intervalId);
        };
    }, [fetchOrders, window.location.pathname]); // Recreate interval when route changes

    return {
        ...state,
        refresh: fetchOrders
    };
}
