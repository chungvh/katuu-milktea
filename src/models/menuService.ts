import { supabase, isSupabaseConfigured } from '@/config/supabase';
import type { Product, Topping, Size, Category } from './types';
import { PRODUCTS, TOPPINGS, SIZES, CATEGORIES } from './constants';

/**
 * Service for fetching menu items from Supabase
 * With fallback to constants.ts
 */

export async function fetchCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    return CATEGORIES;
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id');

    if (error) throw error;
    return data || CATEGORIES;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return CATEGORIES;
  }
}

export async function fetchProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return PRODUCTS;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id');

    if (error) throw error;
    return data || PRODUCTS;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return PRODUCTS;
  }
}

export async function fetchToppings(): Promise<Topping[]> {
  if (!isSupabaseConfigured()) {
    return TOPPINGS;
  }

  try {
    const { data, error } = await supabase
      .from('toppings')
      .select('*')
      .order('id');

    if (error) throw error;
    return data || TOPPINGS;
  } catch (error) {
    console.error('Failed to fetch toppings:', error);
    return TOPPINGS;
  }
}

export async function fetchSizes(): Promise<Size[]> {
  if (!isSupabaseConfigured()) {
    return SIZES;
  }

  try {
    const { data, error } = await supabase
      .from('sizes')
      .select('*')
      .order('id');

    if (error) throw error;

    // Convert snake_case to camelCase
    return (data || SIZES).map((size: any) => ({
      id: size.id,
      name: size.name,
      priceModifier: size.price_modifier
    }));
  } catch (error) {
    console.error('Failed to fetch sizes:', error);
    return SIZES;
  }
}
