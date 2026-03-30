import React, { useState, useEffect } from 'react';
import type { Product, Topping, Size, Category } from '@/models/types';
import {
  ArrowLeftIcon,
  PackageIcon,
  ToppingIcon,
  SizeIcon,
  TagIcon,
  WarningIcon
} from '@/views/assets/icons';
import { useAuth } from '@/controllers/AuthContext';
import { useAudit } from '@/controllers/AuditContext';
import * as adminService from '@/models/adminService';

import AdminProductsTab from './admin/AdminProductsTab';
import AdminToppingsTab from './admin/AdminToppingsTab';
import AdminSizesTab from './admin/AdminSizesTab';
import AdminCategoriesTab from './admin/AdminCategoriesTab';
import AdminAuditTab from './admin/AdminAuditTab';

interface AdminPanelProps {
  onBack: () => void;
  products: Product[];
  toppings: Topping[];
  sizes: Size[];
  categories: Category[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateToppings: (toppings: Topping[]) => void;
  onUpdateSizes: (sizes: Size[]) => void;
  onUpdateCategories: (categories: Category[]) => void;
}

type TabType = 'products' | 'toppings' | 'sizes' | 'categories' | 'audit';

interface ProductFormData {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface ToppingFormData {
  id: number;
  name: string;
  price: number;
}

interface SizeFormData {
  id: number;
  name: string;
  priceModifier: number;
}

interface CategoryFormData {
  id: string;
  name: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  onBack,
  products,
  toppings,
  sizes,
  categories,
  onUpdateProducts,
  onUpdateToppings,
  onUpdateSizes,
  onUpdateCategories,
}) => {
  const { isAdmin } = useAuth();
  const { audits, addAudit, clearAudits } = useAudit();

  // Local state backed by server (fallback to props)
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [localToppings, setLocalToppings] = useState<Topping[]>(toppings);
  const [localSizes, setLocalSizes] = useState<Size[]>(sizes);
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);

  // fetch all server-backed resources
  const fetchAll = async () => {
    try {
      const [prods, tops, sizs, cats] = await Promise.all([
        adminService.fetchProducts(),
        adminService.fetchToppings(),
        adminService.fetchSizes(),
        adminService.fetchCategories(),
      ]);

      setLocalProducts(prods);
      setLocalToppings(tops);
      setLocalSizes(sizs);
      setLocalCategories(cats);

      onUpdateProducts(prods);
      onUpdateToppings(tops);
      onUpdateSizes(sizs);
      onUpdateCategories(cats);
    } catch (e) {
      console.warn('Could not load admin data, using local props', e);
    }
  };

  useEffect(() => {
    fetchAll();

    const onAuthChanged = () => { fetchAll(); };
    window.addEventListener('katuu:authChanged', onAuthChanged);
    window.addEventListener('katuu:postLogin', onAuthChanged);

    return () => {
      window.removeEventListener('katuu:authChanged', onAuthChanged);
      window.removeEventListener('katuu:postLogin', onAuthChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form states
  const [productForm, setProductForm] = useState<ProductFormData>({
    id: 0, name: '', price: 0, image: '', category: categories[0]?.id || 'milk-tea',
  });
  const [toppingForm, setToppingForm] = useState<ToppingFormData>({ id: 0, name: '', price: 0 });
  const [sizeForm, setSizeForm] = useState<SizeFormData>({ id: 0, name: '', priceModifier: 0 });
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({ id: '', name: '' });

  // Validation errors
  const [productErrors, setProductErrors] = useState<Record<string, string>>({});
  const [toppingErrors, setToppingErrors] = useState<Record<string, string>>({});
  const [sizeErrors, setSizeErrors] = useState<Record<string, string>>({});
  const [categoryErrors, setCategoryErrors] = useState<Record<string, string>>({});

  const showError = (msg: string) => { setErrorMessage(msg); setTimeout(() => setErrorMessage(''), 3500); };
  const showSuccess = (message: string) => { setSuccessMessage(message); setTimeout(() => setSuccessMessage(''), 3000); };

  const resetForms = () => {
    setProductForm({ id: 0, name: '', price: 0, image: '', category: categories[0]?.id || 'milk-tea' });
    setToppingForm({ id: 0, name: '', price: 0 });
    setSizeForm({ id: 0, name: '', priceModifier: 0 });
    setCategoryForm({ id: '', name: '' });
    setIsEditing(false);
    setEditingId(null);
  };

  // ── Validation helpers ──
  const validateProductForm = () => {
    const errs: Record<string, string> = {};
    if (!productForm.name?.trim()) errs.name = 'Tên sản phẩm không được để trống.';
    if (productForm.price == null || Number(productForm.price) <= 0) errs.price = 'Giá phải lớn hơn 0.';
    if (!localCategories.find(c => c.id === productForm.category)) errs.category = 'Chọn danh mục hợp lệ.';
    if (productForm.image) { try { new URL(productForm.image); } catch { errs.image = 'URL hình ảnh không hợp lệ.'; } }
    const duplicate = localProducts.some(p => p.name.trim().toLowerCase() === productForm.name.trim().toLowerCase() && p.id !== (isEditing ? editingId : 0));
    if (duplicate) errs.name = 'Tên sản phẩm đã tồn tại.';
    setProductErrors(errs);
    return errs;
  };

  const validateToppingForm = () => {
    const errs: Record<string, string> = {};
    if (!toppingForm.name?.trim()) errs.name = 'Tên topping không được để trống.';
    if (toppingForm.price == null || Number(toppingForm.price) < 0) errs.price = 'Giá phải là số không âm.';
    const duplicate = localToppings.some(t => t.name.trim().toLowerCase() === toppingForm.name.trim().toLowerCase() && t.id !== (isEditing ? editingId : 0));
    if (duplicate) errs.name = 'Topping đã tồn tại.';
    setToppingErrors(errs);
    return errs;
  };

  const validateSizeForm = () => {
    const errs: Record<string, string> = {};
    if (!sizeForm.name?.trim()) errs.name = 'Tên size không được để trống.';
    if (sizeForm.priceModifier == null || Number(sizeForm.priceModifier) < 0) errs.priceModifier = 'Giá thêm phải là số không âm.';
    const duplicate = localSizes.some(s => s.name.trim().toLowerCase() === sizeForm.name.trim().toLowerCase() && s.id !== (isEditing ? editingId : 0));
    if (duplicate) errs.name = 'Size đã tồn tại.';
    setSizeErrors(errs);
    return errs;
  };

  const validateCategoryForm = () => {
    const errs: Record<string, string> = {};
    if (!categoryForm.id?.trim()) errs.id = 'ID danh mục không được để trống.';
    if (!/^[a-z0-9\-]+$/.test(categoryForm.id)) errs.id = 'ID chỉ được chứa chữ thường, số và dấu gạch ngang.';
    if (!categoryForm.name?.trim()) errs.name = 'Tên danh mục không được để trống.';
    const duplicate = localCategories.some(c => c.id === categoryForm.id && c.id !== (isEditing ? String(editingId) : ''));
    if (duplicate) errs.id = 'ID danh mục đã tồn tại.';
    setCategoryErrors(errs);
    return errs;
  };

  // ── Product handlers ──
  const handleAddProduct = async () => {
    if (!isAdmin()) { showError('Bạn không có quyền thực hiện hành động này.'); return; }
    const errs = validateProductForm();
    if (Object.keys(errs).length > 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    try {
      const newProduct = await adminService.createProduct({ name: productForm.name, price: productForm.price, image: productForm.image, category: productForm.category });
      const updated = [...localProducts, newProduct];
      setLocalProducts(updated);
      try { addAudit({ action: 'create', target: 'product', targetId: newProduct.id, before: null, after: newProduct, note: 'Thêm sản phẩm' }); } catch (e) { }
      try { onUpdateProducts(updated); } catch (e) { }
      resetForms(); showSuccess('Đã thêm sản phẩm thành công!');
    } catch (e) { console.error(e); showError('Thêm sản phẩm thất bại'); }
  };

  const handleEditProduct = (product: Product) => {
    setProductForm(product); setIsEditing(true); setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateProduct = async () => {
    if (!isAdmin()) { showError('Bạn không có quyền thực hiện hành động này.'); return; }
    const errs = validateProductForm();
    if (Object.keys(errs).length > 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const id = editingId as number;
    try {
      const updatedProduct = await adminService.updateProduct(id, { name: productForm.name, price: productForm.price, image: productForm.image, category: productForm.category });
      const updated = localProducts.map(p => p.id === id ? updatedProduct : p);
      setLocalProducts(updated);
      try { addAudit({ action: 'update', target: 'product', targetId: updatedProduct.id, before: null, after: updatedProduct, note: 'Cập nhật sản phẩm' }); } catch (e) { }
      try { onUpdateProducts(updated); } catch (e) { }
      resetForms(); showSuccess('Đã cập nhật sản phẩm thành công!');
    } catch (e) { console.error(e); showError('Cập nhật sản phẩm thất bại'); }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await adminService.deleteProduct(id);
      const updated = localProducts.filter(p => p.id !== id);
      setLocalProducts(updated);
      try { addAudit({ action: 'delete', target: 'product', targetId: id, before: null, after: null, note: 'Xóa sản phẩm' }); } catch (e) { }
      try { onUpdateProducts(updated); } catch (e) { }
      setShowDeleteConfirm(false); setDeleteId(null); showSuccess('Đã xóa sản phẩm thành công!');
    } catch (e) { console.error(e); showError('Xóa sản phẩm thất bại'); }
  };

  // ── Topping handlers ──
  const handleAddTopping = async () => {
    if (!isAdmin()) { showError('Bạn không có quyền thực hiện hành động này.'); return; }
    const errs = validateToppingForm();
    if (Object.keys(errs).length > 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    try {
      const newTopping = await adminService.createTopping({ name: toppingForm.name, price: toppingForm.price });
      const updated = [...localToppings, newTopping];
      setLocalToppings(updated);
      try { addAudit({ action: 'create', target: 'topping', targetId: newTopping.id, before: null, after: newTopping, note: 'Thêm topping' }); } catch (e) { }
      try { onUpdateToppings(updated); } catch (e) { }
      resetForms(); showSuccess('Đã thêm topping thành công!');
    } catch (e) { console.error(e); showError('Thêm topping thất bại'); }
  };

  const handleEditTopping = (topping: Topping) => {
    setToppingForm(topping); setIsEditing(true); setEditingId(topping.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateTopping = async () => {
    if (!isAdmin()) { showError('Bạn không có quyền thực hiện hành động này.'); return; }
    const errs = validateToppingForm();
    if (Object.keys(errs).length > 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const id = editingId as number;
    try {
      const updatedTopping = await adminService.updateTopping(id, { name: toppingForm.name, price: toppingForm.price });
      const updated = localToppings.map(t => t.id === id ? updatedTopping : t);
      setLocalToppings(updated);
      try { addAudit({ action: 'update', target: 'topping', targetId: updatedTopping.id, before: null, after: updatedTopping, note: 'Cập nhật topping' }); } catch (e) { }
      try { onUpdateToppings(updated); } catch (e) { }
      resetForms(); showSuccess('Đã cập nhật topping thành công!');
    } catch (e) { console.error(e); showError('Cập nhật topping thất bại'); }
  };

  const handleDeleteTopping = async (id: number) => {
    try {
      await adminService.deleteTopping(id);
      const updated = localToppings.filter(t => t.id !== id);
      setLocalToppings(updated);
      try { addAudit({ action: 'delete', target: 'topping', targetId: id, before: null, after: null, note: 'Xóa topping' }); } catch (e) { }
      try { onUpdateToppings(updated); } catch (e) { }
      setShowDeleteConfirm(false); setDeleteId(null); showSuccess('Đã xóa topping thành công!');
    } catch (e) { console.error(e); showError('Xóa topping thất bại'); }
  };

  // ── Size handlers ──
  const handleAddSize = async () => {
    if (!isAdmin()) { showError('Bạn không có quyền thực hiện hành động này.'); return; }
    const errs = validateSizeForm();
    if (Object.keys(errs).length > 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    try {
      const newSize = await adminService.createSize({ name: sizeForm.name, priceModifier: sizeForm.priceModifier });
      const updated = [...localSizes, newSize];
      setLocalSizes(updated);
      try { addAudit({ action: 'create', target: 'size', targetId: newSize.id, before: null, after: newSize, note: 'Thêm size' }); } catch (e) { }
      try { onUpdateSizes(updated); } catch (e) { }
      resetForms(); showSuccess('Đã thêm size thành công!');
    } catch (e) { console.error(e); showError('Thêm size thất bại'); }
  };

  const handleEditSize = (size: Size) => {
    setSizeForm(size); setIsEditing(true); setEditingId(size.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateSize = async () => {
    if (!isAdmin()) { showError('Bạn không có quyền thực hiện hành động này.'); return; }
    const errs = validateSizeForm();
    if (Object.keys(errs).length > 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const id = editingId as number;
    try {
      const updatedSize = await adminService.updateSize(id, { name: sizeForm.name, priceModifier: sizeForm.priceModifier });
      const updated = localSizes.map(s => s.id === id ? updatedSize : s);
      setLocalSizes(updated);
      try { addAudit({ action: 'update', target: 'size', targetId: updatedSize.id, before: null, after: updatedSize, note: 'Cập nhật size' }); } catch (e) { }
      try { onUpdateSizes(updated); } catch (e) { }
      resetForms(); showSuccess('Đã cập nhật size thành công!');
    } catch (e) { console.error(e); showError('Cập nhật size thất bại'); }
  };

  const handleDeleteSize = async (id: number) => {
    if (!isAdmin()) { showError('Bạn không có quyền thực hiện hành động này.'); setShowDeleteConfirm(false); setDeleteId(null); return; }
    try {
      await adminService.deleteSize(id);
      const updated = localSizes.filter(s => s.id !== id);
      setLocalSizes(updated);
      try { addAudit({ action: 'delete', target: 'size', targetId: id, before: null, after: null, note: 'Xóa size' }); } catch (e) { }
      try { onUpdateSizes(updated); } catch (e) { }
      setShowDeleteConfirm(false); setDeleteId(null); showSuccess('Đã xóa size thành công!');
    } catch (e) { console.error(e); showError('Xóa size thất bại'); }
  };

  // ── Category handlers ──
  const handleAddCategory = async () => {
    if (!isAdmin()) { showError('Bạn không có quyền thực hiện hành động này.'); return; }
    const errs = validateCategoryForm();
    if (Object.keys(errs).length > 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    try {
      const newCategory = await adminService.createCategory({ id: categoryForm.id || `cat-${Date.now()}`, name: categoryForm.name });
      const updated = [...localCategories, newCategory];
      setLocalCategories(updated);
      try { addAudit({ action: 'create', target: 'category', targetId: newCategory.id, before: null, after: newCategory, note: 'Thêm danh mục' }); } catch (e) { }
      try { onUpdateCategories(updated); } catch (e) { }
      resetForms(); showSuccess('Đã thêm danh mục thành công!');
    } catch (e) { console.error(e); showError('Thêm danh mục thất bại'); }
  };

  const handleEditCategory = (category: Category) => {
    setCategoryForm(category); setIsEditing(true); setEditingId(category.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateCategory = async () => {
    if (!isAdmin()) { showError('Bạn không có quyền thực hiện hành động này.'); return; }
    const errs = validateCategoryForm();
    if (Object.keys(errs).length > 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    const id = String(editingId);
    try {
      const updatedCategory = await adminService.updateCategory(id, { name: categoryForm.name });
      const updated = localCategories.map(c => c.id === id ? updatedCategory : c);
      setLocalCategories(updated);
      try { addAudit({ action: 'update', target: 'category', targetId: updatedCategory.id, before: null, after: updatedCategory, note: 'Cập nhật danh mục' }); } catch (e) { }
      try { onUpdateCategories(updated); } catch (e) { }
      resetForms(); showSuccess('Đã cập nhật danh mục thành công!');
    } catch (e) { console.error(e); showError('Cập nhật danh mục thất bại'); }
  };

  const handleDeleteCategory = async (id: string) => {
    const inUse = localProducts.some(p => p.category === id);
    if (inUse) { showError('Không thể xóa danh mục đang được sử dụng bởi sản phẩm.'); setShowDeleteConfirm(false); setDeleteId(null); return; }
    try {
      await adminService.deleteCategory(id);
      const updated = localCategories.filter(c => c.id !== id);
      setLocalCategories(updated);
      try { addAudit({ action: 'delete', target: 'category', targetId: id, before: null, after: null, note: 'Xóa danh mục' }); } catch (e) { }
      try { onUpdateCategories(updated); } catch (e) { }
      setShowDeleteConfirm(false); setDeleteId(null); showSuccess('Đã xóa danh mục thành công!');
    } catch (e) { console.error(e); showError('Xóa danh mục thất bại'); }
  };

  // ── Common handlers ──
  const handleTabChange = (tab: TabType) => { setActiveTab(tab); resetForms(); };

  const confirmDelete = (id: number | string) => { setDeleteId(id); setShowDeleteConfirm(true); };

  const handleDelete = () => {
    if (!isAdmin()) { showError('Bạn không có quyền xóa mục.'); setShowDeleteConfirm(false); setDeleteId(null); return; }
    if (deleteId === null) return;
    switch (activeTab) {
      case 'products': handleDeleteProduct(deleteId as number); break;
      case 'toppings': handleDeleteTopping(deleteId as number); break;
      case 'sizes': handleDeleteSize(deleteId as number); break;
      case 'categories': handleDeleteCategory(deleteId as string); break;
    }
  };

  const tabs = [
    { id: 'products' as TabType, icon: <PackageIcon className="w-5 h-5" />, label: `Sản Phẩm (${localProducts.length})` },
    { id: 'toppings' as TabType, icon: <ToppingIcon className="w-5 h-5" />, label: `Topping (${localToppings.length})` },
    { id: 'sizes' as TabType, icon: <SizeIcon className="w-5 h-5" />, label: `Size (${localSizes.length})` },
    { id: 'categories' as TabType, icon: <TagIcon className="w-5 h-5" />, label: `Danh Mục (${localCategories.length})` },
    { id: 'audit' as TabType, icon: <WarningIcon className="w-5 h-5" />, label: `Nhật Ký (${audits.length})` },
  ];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900">
      {/* Error message */}
      {errorMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg">{errorMessage}</div>
      )}

      {/* Non-admin notice */}
      {!isAdmin() && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 bg-yellow-100 text-yellow-800 px-4 py-2 rounded shadow-md">
          Một số chức năng quản lý chỉ dành cho admin. Bạn không có quyền chỉnh sửa.
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-stone-800 shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={onBack} className="p-2 rounded-full hover:bg-stone-100 dark:bg-stone-800 transition-colors">
                <ArrowLeftIcon className="w-6 h-6 text-stone-600 dark:text-stone-300" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">Quản Lý Admin</h1>
                <p className="text-sm text-stone-500 dark:text-stone-400">Quản lý sản phẩm, topping và cài đặt</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex space-x-2 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${activeTab === tab.id
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-20 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in-pop">
          {successMessage}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-800 rounded-xl p-6 max-w-md w-full animate-fade-in-pop">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <WarningIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">Xác Nhận Xóa</h3>
            </div>
            <p className="text-stone-600 mb-6">Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeleteId(null); }}
                className="flex-1 px-4 py-2 bg-stone-200 text-stone-700 dark:text-stone-200 rounded-lg font-medium hover:bg-stone-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {activeTab === 'audit' && (
          <AdminAuditTab
            audits={audits}
            onClear={() => { clearAudits(); showSuccess('Đã xóa nhật ký'); }}
          />
        )}

        {activeTab === 'products' && (
          <AdminProductsTab
            products={localProducts}
            categories={localCategories}
            isAdmin={isAdmin()}
            isEditing={isEditing}
            productForm={productForm}
            productErrors={productErrors}
            onFormChange={setProductForm}
            onAdd={handleAddProduct}
            onEdit={handleEditProduct}
            onUpdate={handleUpdateProduct}
            onDelete={(id) => confirmDelete(id)}
            onReset={resetForms}
          />
        )}

        {activeTab === 'toppings' && (
          <AdminToppingsTab
            toppings={localToppings}
            isAdmin={isAdmin()}
            isEditing={isEditing}
            toppingForm={toppingForm}
            toppingErrors={toppingErrors}
            onFormChange={setToppingForm}
            onAdd={handleAddTopping}
            onEdit={handleEditTopping}
            onUpdate={handleUpdateTopping}
            onDelete={(id) => confirmDelete(id)}
            onReset={resetForms}
          />
        )}

        {activeTab === 'sizes' && (
          <AdminSizesTab
            sizes={localSizes}
            isAdmin={isAdmin()}
            isEditing={isEditing}
            sizeForm={sizeForm}
            sizeErrors={sizeErrors}
            onFormChange={setSizeForm}
            onAdd={handleAddSize}
            onEdit={handleEditSize}
            onUpdate={handleUpdateSize}
            onDelete={(id) => confirmDelete(id)}
            onReset={resetForms}
          />
        )}

        {activeTab === 'categories' && (
          <AdminCategoriesTab
            categories={localCategories}
            isAdmin={isAdmin()}
            isEditing={isEditing}
            categoryForm={categoryForm}
            categoryErrors={categoryErrors}
            onFormChange={setCategoryForm}
            onAdd={handleAddCategory}
            onEdit={handleEditCategory}
            onUpdate={handleUpdateCategory}
            onDelete={(id) => confirmDelete(id)}
            onReset={resetForms}
          />
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
