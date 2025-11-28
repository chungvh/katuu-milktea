import { supabase } from '@/config/supabase';
import type { Product, Topping, Size, Category } from '@/models/types';

// Check if Supabase is configured
function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  return url && url.includes('supabase.co');
}

// ============ PRODUCTS ============

export async function fetchProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('adminProducts');
    return stored ? JSON.parse(stored) : [];
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    const products = data || [];

    // Sync localStorage
    if (products.length > 0) {
      localStorage.setItem('adminProducts', JSON.stringify(products));
    }

    return products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    const stored = localStorage.getItem('adminProducts');
    return stored ? JSON.parse(stored) : [];
  }
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  if (!isSupabaseConfigured()) {
    const newProduct: Product = {
      id: Date.now(),
      ...product
    };
    const stored = localStorage.getItem('adminProducts');
    const products = stored ? JSON.parse(stored) : [];
    products.push(newProduct);
    localStorage.setItem('adminProducts', JSON.stringify(products));
    return newProduct;
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .insert([product])
      .select()
      .single();

    if (error) throw error;

    // Update localStorage
    const stored = localStorage.getItem('adminProducts');
    const products = stored ? JSON.parse(stored) : [];
    products.push(data);
    localStorage.setItem('adminProducts', JSON.stringify(products));

    return data;
  } catch (error) {
    console.error('Failed to create product:', error);
    throw error;
  }
}

export async function updateProduct(id: number, product: Partial<Product>): Promise<Product> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('adminProducts');
    const products = stored ? JSON.parse(stored) : [];
    const index = products.findIndex((p: Product) => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...product };
      localStorage.setItem('adminProducts', JSON.stringify(products));
      return products[index];
    }
    throw new Error('Product not found');
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update localStorage
    const stored = localStorage.getItem('adminProducts');
    const products = stored ? JSON.parse(stored) : [];
    const index = products.findIndex((p: Product) => p.id === id);
    if (index !== -1) {
      products[index] = data;
      localStorage.setItem('adminProducts', JSON.stringify(products));
    }

    return data;
  } catch (error) {
    console.error('Failed to update product:', error);
    throw error;
  }
}

export async function deleteProduct(id: number): Promise<void> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('adminProducts');
    const products = stored ? JSON.parse(stored) : [];
    const filtered = products.filter((p: Product) => p.id !== id);
    localStorage.setItem('adminProducts', JSON.stringify(filtered));
    return;
  }

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Update localStorage
    const stored = localStorage.getItem('adminProducts');
    const products = stored ? JSON.parse(stored) : [];
    const filtered = products.filter((p: Product) => p.id !== id);
    localStorage.setItem('adminProducts', JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete product:', error);
    throw error;
  }
}

// ============ TOPPINGS ============

export async function fetchToppings(): Promise<Topping[]> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('adminToppings');
    return stored ? JSON.parse(stored) : [];
  }

  try {
    const { data, error } = await supabase
      .from('toppings')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    const toppings = data || [];

    if (toppings.length > 0) {
      localStorage.setItem('adminToppings', JSON.stringify(toppings));
    }

    return toppings;
  } catch (error) {
    console.error('Failed to fetch toppings:', error);
    const stored = localStorage.getItem('adminToppings');
    return stored ? JSON.parse(stored) : [];
  }
}

export async function createTopping(topping: Omit<Topping, 'id'>): Promise<Topping> {
  if (!isSupabaseConfigured()) {
    const newTopping: Topping = {
      id: Date.now(),
      ...topping
    };
    const stored = localStorage.getItem('adminToppings');
    const toppings = stored ? JSON.parse(stored) : [];
    toppings.push(newTopping);
    localStorage.setItem('adminToppings', JSON.stringify(toppings));
    return newTopping;
  }

  try {
    const { data, error } = await supabase
      .from('toppings')
      .insert([topping])
      .select()
      .single();

    if (error) throw error;

    const stored = localStorage.getItem('adminToppings');
    const toppings = stored ? JSON.parse(stored) : [];
    toppings.push(data);
    localStorage.setItem('adminToppings', JSON.stringify(toppings));

    return data;
  } catch (error) {
    console.error('Failed to create topping:', error);
    throw error;
  }
}

export async function updateTopping(id: number, topping: Partial<Topping>): Promise<Topping> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('adminToppings');
    const toppings = stored ? JSON.parse(stored) : [];
    const index = toppings.findIndex((t: Topping) => t.id === id);
    if (index !== -1) {
      toppings[index] = { ...toppings[index], ...topping };
      localStorage.setItem('adminToppings', JSON.stringify(toppings));
      return toppings[index];
    }
    throw new Error('Topping not found');
  }

  try {
    const { data, error } = await supabase
      .from('toppings')
      .update(topping)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const stored = localStorage.getItem('adminToppings');
    const toppings = stored ? JSON.parse(stored) : [];
    const index = toppings.findIndex((t: Topping) => t.id === id);
    if (index !== -1) {
      toppings[index] = data;
      localStorage.setItem('adminToppings', JSON.stringify(toppings));
    }

    return data;
  } catch (error) {
    console.error('Failed to update topping:', error);
    throw error;
  }
}

export async function deleteTopping(id: number): Promise<void> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('adminToppings');
    const toppings = stored ? JSON.parse(stored) : [];
    const filtered = toppings.filter((t: Topping) => t.id !== id);
    localStorage.setItem('adminToppings', JSON.stringify(filtered));
    return;
  }

  try {
    const { error } = await supabase
      .from('toppings')
      .delete()
      .eq('id', id);

    if (error) throw error;

    const stored = localStorage.getItem('adminToppings');
    const toppings = stored ? JSON.parse(stored) : [];
    const filtered = toppings.filter((t: Topping) => t.id !== id);
    localStorage.setItem('adminToppings', JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete topping:', error);
    throw error;
  }
}

// ============ SIZES ============

export async function fetchSizes(): Promise<Size[]> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('adminSizes');
    return stored ? JSON.parse(stored) : [];
  }

  try {
    const { data, error } = await supabase
      .from('sizes')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    // Convert snake_case to camelCase
    const sizes = (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      priceModifier: row.price_modifier
    }));

    if (sizes.length > 0) {
      localStorage.setItem('adminSizes', JSON.stringify(sizes));
    }

    return sizes;
  } catch (error) {
    console.error('Failed to fetch sizes:', error);
    const stored = localStorage.getItem('adminSizes');
    return stored ? JSON.parse(stored) : [];
  }
}

export async function createSize(size: Omit<Size, 'id'>): Promise<Size> {
  if (!isSupabaseConfigured()) {
    const newSize: Size = {
      id: Date.now(),
      ...size
    };
    const stored = localStorage.getItem('adminSizes');
    const sizes = stored ? JSON.parse(stored) : [];
    sizes.push(newSize);
    localStorage.setItem('adminSizes', JSON.stringify(sizes));
    return newSize;
  }

  try {
    const { data, error } = await supabase
      .from('sizes')
      .insert([{
        name: size.name,
        price_modifier: size.priceModifier
      }])
      .select()
      .single();

    if (error) throw error;

    // Convert back
    const createdSize: Size = {
      id: data.id,
      name: data.name,
      priceModifier: data.price_modifier
    };

    const stored = localStorage.getItem('adminSizes');
    const sizes = stored ? JSON.parse(stored) : [];
    sizes.push(createdSize);
    localStorage.setItem('adminSizes', JSON.stringify(sizes));

    return createdSize;
  } catch (error) {
    console.error('Failed to create size:', error);
    throw error;
  }
}

export async function updateSize(id: number, size: Partial<Size>): Promise<Size> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('adminSizes');
    const sizes = stored ? JSON.parse(stored) : [];
    const index = sizes.findIndex((s: Size) => s.id === id);
    if (index !== -1) {
      sizes[index] = { ...sizes[index], ...size };
      localStorage.setItem('adminSizes', JSON.stringify(sizes));
      return sizes[index];
    }
    throw new Error('Size not found');
  }

  try {
    const updateData: any = {};
    if (size.name !== undefined) updateData.name = size.name;
    if (size.priceModifier !== undefined) updateData.price_modifier = size.priceModifier;

    const { data, error } = await supabase
      .from('sizes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const updatedSize: Size = {
      id: data.id,
      name: data.name,
      priceModifier: data.price_modifier
    };

    const stored = localStorage.getItem('adminSizes');
    const sizes = stored ? JSON.parse(stored) : [];
    const index = sizes.findIndex((s: Size) => s.id === id);
    if (index !== -1) {
      sizes[index] = updatedSize;
      localStorage.setItem('adminSizes', JSON.stringify(sizes));
    }

    return updatedSize;
  } catch (error) {
    console.error('Failed to update size:', error);
    throw error;
  }
}

export async function deleteSize(id: number): Promise<void> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('adminSizes');
    const sizes = stored ? JSON.parse(stored) : [];
    const filtered = sizes.filter((s: Size) => s.id !== id);
    localStorage.setItem('adminSizes', JSON.stringify(filtered));
    return;
  }

  try {
    const { error } = await supabase
      .from('sizes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    const stored = localStorage.getItem('adminSizes');
    const sizes = stored ? JSON.parse(stored) : [];
    const filtered = sizes.filter((s: Size) => s.id !== id);
    localStorage.setItem('adminSizes', JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete size:', error);
    throw error;
  }
}

// ============ CATEGORIES ============

export async function fetchCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('adminCategories');
    return stored ? JSON.parse(stored) : [];
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;

    const categories = data || [];

    if (categories.length > 0) {
      localStorage.setItem('adminCategories', JSON.stringify(categories));
    }

    return categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    const stored = localStorage.getItem('adminCategories');
    return stored ? JSON.parse(stored) : [];
  }
}

export async function createCategory(category: Category): Promise<Category> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('adminCategories');
    const categories = stored ? JSON.parse(stored) : [];
    categories.push(category);
    localStorage.setItem('adminCategories', JSON.stringify(categories));
    return category;
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .insert([category])
      .select()
      .single();

    if (error) throw error;

    const stored = localStorage.getItem('adminCategories');
    const categories = stored ? JSON.parse(stored) : [];
    categories.push(data);
    localStorage.setItem('adminCategories', JSON.stringify(categories));

    return data;
  } catch (error) {
    console.error('Failed to create category:', error);
    throw error;
  }
}

export async function updateCategory(id: string, category: Partial<Category>): Promise<Category> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('adminCategories');
    const categories = stored ? JSON.parse(stored) : [];
    const index = categories.findIndex((c: Category) => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...category };
      localStorage.setItem('adminCategories', JSON.stringify(categories));
      return categories[index];
    }
    throw new Error('Category not found');
  }

  try {
    const { data, error } = await supabase
      .from('categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const stored = localStorage.getItem('adminCategories');
    const categories = stored ? JSON.parse(stored) : [];
    const index = categories.findIndex((c: Category) => c.id === id);
    if (index !== -1) {
      categories[index] = data;
      localStorage.setItem('adminCategories', JSON.stringify(categories));
    }

    return data;
  } catch (error) {
    console.error('Failed to update category:', error);
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    const stored = localStorage.getItem('adminCategories');
    const categories = stored ? JSON.parse(stored) : [];
    const filtered = categories.filter((c: Category) => c.id !== id);
    localStorage.setItem('adminCategories', JSON.stringify(filtered));
    return;
  }

  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) throw error;

    const stored = localStorage.getItem('adminCategories');
    const categories = stored ? JSON.parse(stored) : [];
    const filtered = categories.filter((c: Category) => c.id !== id);
    localStorage.setItem('adminCategories', JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete category:', error);
    throw error;
  }
}

