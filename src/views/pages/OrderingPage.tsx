import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import type { Order, Product, Topping, Size, HistoricOrder, Category } from '@/models/types';
import { PRODUCTS, TOPPINGS, SIZES, SUGAR_LEVELS, ICE_LEVELS, CATEGORIES } from '@/models/constants';
import * as menuService from '@/models/menuService';
import ProductSelection from '@/views/components/ProductSelection';
import CustomizationOptions from '@/views/components/CustomizationOptions';
import OrderSummary from '@/views/components/OrderSummary';

const initialOrderState: Order = {
    product: null,
    toppings: [],
    size: SIZES[0],
    sugar: SUGAR_LEVELS[0],
    ice: ICE_LEVELS[0],
    customerName: '',
};

/**
 * OrderingPage - Trang đặt hàng chính
 * Chứa ProductSelection, CustomizationOptions, và OrderSummary
 */
const OrderingPage: React.FC = () => {
    const [order, setOrder] = useState<Order>(initialOrderState);
    const [isResetting, setIsResetting] = useState(false);
    const [orderHistory, setOrderHistory] = useState<HistoricOrder[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [isReordering, setIsReordering] = useState(false);
    const [reorderPendingOrderId, setReorderPendingOrderId] = useState<string | undefined>();
    const [reorderHistoryId, setReorderHistoryId] = useState<number | undefined>();

    // Admin data states
    const [products, setProducts] = useState<Product[]>(PRODUCTS);
    const [toppings, setToppings] = useState<Topping[]>(TOPPINGS);
    const [sizes, setSizes] = useState<Size[]>(SIZES);

    // State for filters
    const [productCategory, setProductCategory] = useState('all');

    const customizationRef = useRef<HTMLDivElement>(null);

    // Load products from server
    useEffect(() => {
        const loadProducts = async () => {
            try {
                const [prods, tops, sizs] = await Promise.all([
                    menuService.fetchProducts(),
                    menuService.fetchToppings(),
                    menuService.fetchSizes(),
                ]);
                setProducts(prods);
                setToppings(tops);
                setSizes(sizs);
            } catch (error) {
                console.error('Failed to load products:', error);
            } finally {
                setIsLoadingProducts(false);
            }
        };
        loadProducts();
    }, []);

    // Load order history from localStorage
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const stored = localStorage.getItem('katuu_order_history');
                if (stored) {
                    setOrderHistory(JSON.parse(stored));
                }
            } catch (error) {
                console.error('Failed to load order history:', error);
            }
        };
        loadHistory();
    }, []);

    // Handle reorder from History page
    useEffect(() => {
        const reorderData = sessionStorage.getItem('katuu_reorder');
        if (reorderData) {
            try {
                const historicOrder = JSON.parse(reorderData) as HistoricOrder;

                // Restore order from historic order
                setOrder({
                    product: historicOrder.product,
                    toppings: historicOrder.toppings,
                    size: historicOrder.size,
                    sugar: historicOrder.sugar,
                    ice: historicOrder.ice,
                    customerName: historicOrder.customerName,
                });

                setIsReordering(true);

                // Save IDs để update existing records thay vì tạo mới
                setReorderPendingOrderId(historicOrder.pendingOrderId);
                setReorderHistoryId(historicOrder.id); // Track history item ID

                // Clear sessionStorage
                sessionStorage.removeItem('katuu_reorder');

                // Scroll to customization section after a brief delay
                setTimeout(() => {
                    customizationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 500);
            } catch (error) {
                console.error('Failed to restore reorder:', error);
                sessionStorage.removeItem('katuu_reorder');
            }
        }
    }, []);

    const totalPrice = useMemo(() => {
        if (!order.product) return 0;
        const basePrice = order.product.price;
        const sizePrice = order.size?.priceModifier || 0;
        const toppingsPrice = order.toppings.reduce((sum, t) => sum + t.price, 0);
        return basePrice + sizePrice + toppingsPrice;
    }, [order]);

    const handleProductSelect = useCallback((product: Product) => {
        setOrder(prev => ({ ...prev, product }));
        setTimeout(() => {
            customizationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }, []);

    const handleToppingChange = useCallback((topping: Topping) => {
        setOrder(prev => {
            const exists = prev.toppings.some(t => t.id === topping.id);
            return {
                ...prev,
                toppings: exists
                    ? prev.toppings.filter(t => t.id !== topping.id)
                    : [...prev.toppings, topping],
            };
        });
    }, []);

    const handleSizeChange = useCallback((size: Size) => {
        setOrder(prev => ({ ...prev, size }));
    }, []);

    const handleSugarChange = useCallback((sugar: string) => {
        setOrder(prev => ({ ...prev, sugar }));
    }, []);

    const handleIceChange = useCallback((ice: string) => {
        setOrder(prev => ({ ...prev, ice }));
    }, []);

    const handleNameChange = useCallback((name: string) => {
        setOrder(prev => ({ ...prev, customerName: name }));
    }, []);

    const handleResetOrder = useCallback(() => {
        setIsResetting(true);
        setTimeout(() => {
            setOrder(initialOrderState);
            setIsResetting(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300);
    }, []);

    const handleAddToHistory = useCallback((pendingOrderId?: string) => {
        if (!order.product || !order.customerName.trim()) return;

        let updatedHistory: HistoricOrder[];

        if (isReordering && reorderHistoryId) {
            // UPDATE existing history item
            const updatedItem: HistoricOrder = {
                id: reorderHistoryId, // Keep same history ID
                date: new Date().toISOString(), // Update timestamp
                product: order.product,
                toppings: order.toppings,
                size: order.size,
                sugar: order.sugar,
                ice: order.ice,
                customerName: order.customerName,
                totalPrice: totalPrice,
                pendingOrderId, // Link to Supabase pending order
            };

            // Replace existing item in history
            updatedHistory = orderHistory.map(item =>
                item.id === reorderHistoryId ? updatedItem : item
            );
            console.log('✅ Updated history item:', reorderHistoryId);
        } else {
            // CREATE new history item
            const newHistoryItem: HistoricOrder = {
                id: Date.now(),
                date: new Date().toISOString(),
                product: order.product,
                toppings: order.toppings,
                size: order.size,
                sugar: order.sugar,
                ice: order.ice,
                customerName: order.customerName,
                totalPrice: totalPrice,
                pendingOrderId, // Link to Supabase pending order
            };

            updatedHistory = [newHistoryItem, ...orderHistory];
            console.log('✅ Created new history item:', newHistoryItem.id);
        }

        setOrderHistory(updatedHistory);
        localStorage.setItem('katuu_order_history', JSON.stringify(updatedHistory));
        window.dispatchEvent(new Event('historyUpdated')); // Notify Header

        // Clear reorder state
        setIsReordering(false);
        setReorderPendingOrderId(undefined);
        setReorderHistoryId(undefined);

        // Reset order
        handleResetOrder();
    }, [order, totalPrice, orderHistory, handleResetOrder, isReordering, reorderHistoryId]);

    const handleClearHistory = useCallback(() => {
        setOrderHistory([]);
        localStorage.removeItem('katuu_order_history');
    }, []);

    return (
        <main className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-8">
                <div className="lg:col-span-2">
                    <ProductSelection
                        products={products}
                        onProductSelect={handleProductSelect}
                        selectedProductId={order.product?.id}
                        selectedCategory={productCategory}
                        onCategoryChange={setProductCategory}
                        isLoading={isLoadingProducts}
                    />
                    {order.product && (
                        <div ref={customizationRef} className="mt-12">
                            <CustomizationOptions
                                order={order}
                                toppings={toppings}
                                sizes={sizes}
                                onToppingChange={handleToppingChange}
                                onSizeChange={handleSizeChange}
                                onSugarChange={handleSugarChange}
                                onIceChange={handleIceChange}
                            />
                        </div>
                    )}
                </div>
                <div className="lg:col-span-1 mt-12 lg:mt-0">
                    <OrderSummary
                        order={order}
                        totalPrice={totalPrice}
                        onNameChange={handleNameChange}
                        onResetOrder={handleResetOrder}
                        isResetting={isResetting}
                        isReordering={isReordering}
                        reorderPendingOrderId={reorderPendingOrderId}
                        onAddToHistory={handleAddToHistory}
                        onClearHistory={handleClearHistory}
                    />
                </div>
            </div>
        </main>
    );
};

export default OrderingPage;

