import React, { useState, useEffect } from 'react';
import Dashboard from '@/views/components/Dashboard';
import type { HistoricOrder, Product, Category } from '@/models/types';
import { PRODUCTS, CATEGORIES } from '@/models/constants';
import * as menuService from '@/models/menuService';
import * as orderService from '@/models/orderService';
import { useNavigate } from 'react-router-dom';

/**
 * DashboardPage - Trang dashboard cho staff/admin
 */
const DashboardPage: React.FC = () => {
    const [orderHistory, setOrderHistory] = useState<HistoricOrder[]>([]);
    const [products, setProducts] = useState<Product[]>(PRODUCTS);
    const [categories, setCategories] = useState<Category[]>(CATEGORIES);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Load order history from Supabase
                const [history, prods, cats] = await Promise.all([
                    orderService.fetchOrderHistory(),
                    menuService.fetchProducts(),
                    menuService.fetchCategories(),
                ]);

                setOrderHistory(history);
                setProducts(prods);
                setCategories(cats);

                console.log('📊 Dashboard loaded:', {
                    orders: history.length,
                    products: prods.length,
                    categories: cats.length
                });
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <p className="text-stone-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <Dashboard
            orderHistory={orderHistory}
            products={products}
            categories={categories}
            onBack={() => navigate('/')}
        />
    );
};

export default DashboardPage;
