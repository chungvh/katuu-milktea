import React, { useState, useEffect } from 'react';
import OrderHistory from '@/views/components/OrderHistory';
import type { HistoricOrder } from '@/models/types';
import { useNavigate } from 'react-router-dom';
import { useOrderSession } from '@/controllers/OrderSessionContext';

/**
 * HistoryPage - Trang lịch sử đơn hàng
 */
const HistoryPage: React.FC = () => {
    const [orderHistory, setOrderHistory] = useState<HistoricOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [historySearchTerm, setHistorySearchTerm] = useState('');
    const [historyCategory, setHistoryCategory] = useState('all');

    const navigate = useNavigate();
    const { deletePendingOrder, pendingOrders, isLoading: isLoadingOrders } = useOrderSession();

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const stored = localStorage.getItem('katuu_order_history');
                if (stored) {
                    const history: HistoricOrder[] = JSON.parse(stored);

                    // Auto-cleanup: Remove orders đã bị admin chốt/xóa
                    // ⚠️ CRITICAL: Only cleanup when pendingOrders is fully loaded
                    // If isLoadingOrders=true, pendingOrders=[] → would delete everything on F5!
                    let validHistory = history;

                    if (!isLoadingOrders) {
                        // Only run cleanup when OrderSession has finished loading
                        validHistory = history.filter(item => {
                            // Nếu không có pendingOrderId → keep (old orders)
                            if (!item.pendingOrderId) return true;

                            // Check xem pending order còn tồn tại không
                            const stillPending = pendingOrders.some(
                                po => po.id === item.pendingOrderId
                            );

                            if (!stillPending) {
                                console.log('🧹 Auto-cleanup: Removing merged/deleted order:', item.pendingOrderId);
                            }

                            return stillPending;
                        });

                        // Save cleaned history
                        if (validHistory.length !== history.length) {
                            localStorage.setItem('katuu_order_history', JSON.stringify(validHistory));
                            window.dispatchEvent(new Event('historyUpdated')); // Notify Header
                            console.log(`✅ Cleaned ${history.length - validHistory.length} merged orders from history`);
                        }
                    } else {
                        console.log('⏳ Skipping cleanup - pending orders still loading');
                    }

                    setOrderHistory(validHistory);
                }
            } catch (error) {
                console.error('Failed to load order history:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadHistory();
    }, [pendingOrders, isLoadingOrders]); // Re-run when pendingOrders changes OR loading completes

    const handleReorder = (order: HistoricOrder) => {
        // Store reorder data in sessionStorage and navigate to ordering page
        sessionStorage.setItem('katuu_reorder', JSON.stringify(order));
        navigate('/');
    };

    const handleDeleteOrder = async (orderId: number) => {
        // Find the order to get pendingOrderId
        const orderToDelete = orderHistory.find(o => o.id === orderId);

        // Delete from localStorage
        const updatedHistory = orderHistory.filter(o => o.id !== orderId);
        setOrderHistory(updatedHistory);
        localStorage.setItem('katuu_order_history', JSON.stringify(updatedHistory));
        window.dispatchEvent(new Event('historyUpdated')); // Notify Header

        // Also delete from Supabase pending_orders if linked
        if (orderToDelete?.pendingOrderId) {
            try {
                await deletePendingOrder(orderToDelete.pendingOrderId);
                console.log('✅ Deleted pending order:', orderToDelete.pendingOrderId);
            } catch (error) {
                console.error('❌ Failed to delete pending order:', error);
                // Don't revert localStorage deletion even if Supabase delete fails
            }
        }
    };

    return (
        <OrderHistory
            onBack={() => navigate('/')}
            history={orderHistory}
            onReorder={handleReorder}
            onDeleteOrder={handleDeleteOrder}
            searchTerm={historySearchTerm}
            onSearchTermChange={setHistorySearchTerm}
            selectedCategory={historyCategory}
            onCategoryChange={setHistoryCategory}
            isLoading={isLoading}
        />
    );
};

export default HistoryPage;
