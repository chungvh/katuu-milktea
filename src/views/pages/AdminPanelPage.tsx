import React, { useState, useEffect } from 'react';
import AdminPanel from '@/views/components/AdminPanel';
import type { Product, Topping, Size, Category } from '@/models/types';
import { PRODUCTS, TOPPINGS, SIZES, CATEGORIES } from '@/models/constants';
import * as menuService from '@/models/menuService';
import { useNavigate } from 'react-router-dom';

/**
 * AdminPanelPage - Trang quản lý admin
 * Protected route - admin only
 */
const AdminPanelPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>(PRODUCTS);
    const [toppings, setToppings] = useState<Topping[]>(TOPPINGS);
    const [sizes, setSizes] = useState<Size[]>(SIZES);
    const [categories, setCategories] = useState<Category[]>(CATEGORIES);

    const navigate = useNavigate();

    useEffect(() => {
        const loadData = async () => {
            try {
                const [prods, tops, sizs, cats] = await Promise.all([
                    menuService.fetchProducts(),
                    menuService.fetchToppings(),
                    menuService.fetchSizes(),
                    menuService.fetchCategories(),
                ]);
                setProducts(prods);
                setToppings(tops);
                setSizes(sizs);
                setCategories(cats);
            } catch (error) {
                console.error('Failed to load admin data:', error);
            }
        };
        loadData();
    }, []);

    const handleUpdateProducts = (updatedProducts: Product[]) => {
        setProducts(updatedProducts);
    };

    const handleUpdateToppings = (updatedToppings: Topping[]) => {
        setToppings(updatedToppings);
    };

    const handleUpdateSizes = (updatedSizes: Size[]) => {
        setSizes(updatedSizes);
    };

    const handleUpdateCategories = (updatedCategories: Category[]) => {
        setCategories(updatedCategories);
    };

    return (
        <AdminPanel
            products={products}
            toppings={toppings}
            sizes={sizes}
            categories={categories}
            onUpdateProducts={handleUpdateProducts}
            onUpdateToppings={handleUpdateToppings}
            onUpdateSizes={handleUpdateSizes}
            onUpdateCategories={handleUpdateCategories}
            onBack={() => navigate('/')}
        />
    );
};

export default AdminPanelPage;
