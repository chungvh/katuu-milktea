import { apiFetch } from '@/config/api';
import type { Product, Topping, Size, Category } from './types';
import { PRODUCTS, TOPPINGS, SIZES, CATEGORIES } from './constants';

/**
 * Service for fetching menu items from Laravel Backend
 * With fallback to constants.ts in case of network issues
 */

export async function fetchCategories(): Promise<Category[]> {
  try {
    const data = await apiFetch<Category[]>('/api/categories');
    return data || CATEGORIES;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return CATEGORIES;
  }
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const data = await apiFetch<Product[]>('/api/products');
    return data || PRODUCTS;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return PRODUCTS;
  }
}

export async function fetchToppings(): Promise<Topping[]> {
  try {
    const data = await apiFetch<Topping[]>('/api/toppings');
    return data || TOPPINGS;
  } catch (error) {
    console.error('Failed to fetch toppings:', error);
    return TOPPINGS;
  }
}

export async function fetchSizes(): Promise<Size[]> {
  try {
    const data = await apiFetch<any[]>('/api/sizes');
    return (data || SIZES).map((size: any) => ({
      id: size.id,
      name: size.name,
      priceModifier: size.priceModifier !== undefined ? size.priceModifier : size.price_modifier
    }));
  } catch (error) {
    console.error('Failed to fetch sizes:', error);
    return SIZES;
  }
}
