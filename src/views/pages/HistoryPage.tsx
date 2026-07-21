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

                    // Auto-cleanup and sync: Remove orders đã bị admin chốt/xóa, và cập nhật giá/món
                    let validHistory = history;

                    if (!isLoadingOrders) {
                        const GRACE_PERIOD_MS = 30_000;
                        const now = Date.now();
                        let detailsUpdated = false;

                        // 1. Đồng bộ thông tin đơn chờ từ API (tránh lệch món/giá khi Admin sửa)
                        const syncedHistory = history.map(item => {
                            if (item.pendingOrderId) {
                                const matchingPending = pendingOrders.find(po => po.id === item.pendingOrderId);
                                if (matchingPending && matchingPending.items && matchingPending.items[0]) {
                                    const pendingItem = matchingPending.items[0];
                                    
                                    const priceChanged = item.totalPrice !== matchingPending.totalPrice;
                                    const prodChanged = item.product?.id !== pendingItem.product?.id;
                                    const sizeChanged = item.size?.id !== pendingItem.size?.id;
                                    const sugarChanged = item.sugar !== pendingItem.sugar;
                                    const iceChanged = item.ice !== pendingItem.ice;
                                    const toppingsChanged = JSON.stringify(item.toppings) !== JSON.stringify(pendingItem.toppings);

                                    if (priceChanged || prodChanged || sizeChanged || sugarChanged || iceChanged || toppingsChanged) {
                                        detailsUpdated = true;
                                        return {
                                            ...item,
                                            product: pendingItem.product,
                                            toppings: pendingItem.toppings,
                                            size: pendingItem.size,
                                            sugar: pendingItem.sugar,
                                            ice: pendingItem.ice,
                                            totalPrice: matchingPending.totalPrice
                                        };
                                    }
                                }
                            }
                            return item;
                        });

                        // 2. Dọn dẹp đơn hàng đã hoàn thành hoặc bị hủy
                        validHistory = syncedHistory.filter(item => {
                            if (!item.pendingOrderId) return true;

                            const orderAge = now - new Date(item.date).getTime();
                            if (orderAge < GRACE_PERIOD_MS) return true;

                            const stillPending = pendingOrders.some(
                                po => po.id === item.pendingOrderId
                            );

                            if (!stillPending) {
                                console.log('🧹 Auto-cleanup: Removing merged/deleted order:', item.pendingOrderId);
                            }

                            return stillPending;
                        });

                        // Lưu lại lịch sử mới nếu có sự thay đổi kích thước mảng hoặc nội dung đơn hàng
                        if (validHistory.length !== history.length || detailsUpdated) {
                            localStorage.setItem('katuu_order_history', JSON.stringify(validHistory));
                            window.dispatchEvent(new Event('historyUpdated')); // Notify Header
                            console.log(`✅ Synced and cleaned order history`);
                        }
                    } else {
                        console.log('⏳ Skipping cleanup & sync - pending orders still loading');
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
