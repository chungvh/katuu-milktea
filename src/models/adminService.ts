import { apiFetch } from '@/config/api';
import type { Product, Topping, Size, Category } from '@/models/types';

// ============ PRODUCTS ============

export async function fetchProducts(): Promise<Product[]> {
  try {
    const products = await apiFetch<Product[]>('/api/admin/products');
    localStorage.setItem('adminProducts', JSON.stringify(products));
    return products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    const stored = localStorage.getItem('adminProducts');
    return stored ? JSON.parse(stored) : [];
  }
}

export async function createProduct(product: Omit<Product, 'id'>): Promise<Product> {
  try {
    const data = await apiFetch<Product>('/api/admin/products', {
      method: 'POST',
      data: product
    });

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
  try {
    const data = await apiFetch<Product>(`/api/admin/products/${id}`, {
      method: 'PUT',
      data: product
    });

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
  try {
    await apiFetch(`/api/admin/products/${id}`, {
      method: 'DELETE'
    });

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
  try {
    const toppings = await apiFetch<Topping[]>('/api/admin/toppings');
    localStorage.setItem('adminToppings', JSON.stringify(toppings));
    return toppings;
  } catch (error) {
    console.error('Failed to fetch toppings:', error);
    const stored = localStorage.getItem('adminToppings');
    return stored ? JSON.parse(stored) : [];
  }
}

export async function createTopping(topping: Omit<Topping, 'id'>): Promise<Topping> {
  try {
    const data = await apiFetch<Topping>('/api/admin/toppings', {
      method: 'POST',
      data: topping
    });

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
  try {
    const data = await apiFetch<Topping>(`/api/admin/toppings/${id}`, {
      method: 'PUT',
      data: topping
    });

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
  try {
    await apiFetch(`/api/admin/toppings/${id}`, {
      method: 'DELETE'
    });

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
  try {
    const sizes = await apiFetch<Size[]>('/api/admin/sizes');
    localStorage.setItem('adminSizes', JSON.stringify(sizes));
    return sizes;
  } catch (error) {
    console.error('Failed to fetch sizes:', error);
    const stored = localStorage.getItem('adminSizes');
    return stored ? JSON.parse(stored) : [];
  }
}

export async function createSize(size: Omit<Size, 'id'>): Promise<Size> {
  try {
    const data = await apiFetch<Size>('/api/admin/sizes', {
      method: 'POST',
      data: size
    });

    const stored = localStorage.getItem('adminSizes');
    const sizes = stored ? JSON.parse(stored) : [];
    sizes.push(data);
    localStorage.setItem('adminSizes', JSON.stringify(sizes));

    return data;
  } catch (error) {
    console.error('Failed to create size:', error);
    throw error;
  }
}

export async function updateSize(id: number, size: Partial<Size>): Promise<Size> {
  try {
    const data = await apiFetch<Size>(`/api/admin/sizes/${id}`, {
      method: 'PUT',
      data: size
    });

    const stored = localStorage.getItem('adminSizes');
    const sizes = stored ? JSON.parse(stored) : [];
    const index = sizes.findIndex((s: Size) => s.id === id);
    if (index !== -1) {
      sizes[index] = data;
      localStorage.setItem('adminSizes', JSON.stringify(sizes));
    }

    return data;
  } catch (error) {
    console.error('Failed to update size:', error);
    throw error;
  }
}

export async function deleteSize(id: number): Promise<void> {
  try {
    await apiFetch(`/api/admin/sizes/${id}`, {
      method: 'DELETE'
    });

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
  try {
    const categories = await apiFetch<Category[]>('/api/admin/categories');
    localStorage.setItem('adminCategories', JSON.stringify(categories));
    return categories;
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    const stored = localStorage.getItem('adminCategories');
    return stored ? JSON.parse(stored) : [];
  }
}

export async function createCategory(category: Category): Promise<Category> {
  try {
    const data = await apiFetch<Category>('/api/admin/categories', {
      method: 'POST',
      data: category
    });

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
  try {
    const data = await apiFetch<Category>(`/api/admin/categories/${id}`, {
      method: 'PUT',
      data: category
    });

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
  try {
    await apiFetch(`/api/admin/categories/${id}`, {
      method: 'DELETE'
    });

    const stored = localStorage.getItem('adminCategories');
    const categories = stored ? JSON.parse(stored) : [];
    const filtered = categories.filter((c: Category) => c.id !== id);
    localStorage.setItem('adminCategories', JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete category:', error);
    throw error;
  }
}
