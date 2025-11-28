import React, { useState, useEffect } from 'react';
import type { Product, Topping, Size, Category } from '@/models/types';
import {
  ArrowLeftIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  SaveIcon,
  PackageIcon,
  ToppingIcon,
  SizeIcon,
  TagIcon,
  WarningIcon
} from '@/views/assets/icons';
import { formatVND } from '@/utils/formatting';
import { useAuth } from '@/controllers/AuthContext';
import { useAudit } from '@/controllers/AuditContext';
import * as adminService from '@/models/adminService';

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

  // fetch all server-backed resources (exposed so we can re-run after login)
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

      // Also update parent callbacks
      onUpdateProducts(prods);
      onUpdateToppings(tops);
      onUpdateSizes(sizs);
      onUpdateCategories(cats);
    } catch (e) {
      console.warn('Could not load admin data, using local props', e);
    }
  };

  useEffect(() => {
    // initial load
    fetchAll();

    // re-load when auth changes (login/logout) or explicit post-login redirect
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

  // Form states
  const [productForm, setProductForm] = useState<ProductFormData>({
    id: 0,
    name: '',
    price: 0,
    image: '',
    category: categories[0]?.id || 'milk-tea',
  });

  const [toppingForm, setToppingForm] = useState<ToppingFormData>({
    id: 0,
    name: '',
    price: 0,
  });

  const [sizeForm, setSizeForm] = useState<SizeFormData>({
    id: 0,
    name: '',
    priceModifier: 0,
  });

  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({
    id: '',
    name: '',
  });

  // Validation & permission helpers
  const [productErrors, setProductErrors] = useState<Record<string,string>>({});
  const [toppingErrors, setToppingErrors] = useState<Record<string,string>>({});
  const [sizeErrors, setSizeErrors] = useState<Record<string,string>>({});
  const [categoryErrors, setCategoryErrors] = useState<Record<string,string>>({});
  const [errorMessage, setErrorMessage] = useState('');

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setTimeout(() => setErrorMessage(''), 3500);
  };

  const validateProductForm = () => {
    const errs: Record<string,string> = {};
    if (!productForm.name || !productForm.name.trim()) errs.name = 'Tên sản phẩm không được để trống.';
    if (productForm.price == null || Number(productForm.price) <= 0) errs.price = 'Giá phải lớn hơn 0.';
    if (!localCategories.find(c => c.id === productForm.category)) errs.category = 'Chọn danh mục hợp lệ.';
    if (productForm.image) {
      try { new URL(productForm.image); } catch { errs.image = 'URL hình ảnh không hợp lệ.'; }
    }
    const duplicate = localProducts.some(p => p.name.trim().toLowerCase() === productForm.name.trim().toLowerCase() && p.id !== (isEditing ? editingId : 0));
    if (duplicate) errs.name = 'Tên sản phẩm đã tồn tại.';
    setProductErrors(errs);
    return errs;
  };

  const validateToppingForm = () => {
    const errs: Record<string,string> = {};
    if (!toppingForm.name || !toppingForm.name.trim()) errs.name = 'Tên topping không được để trống.';
    if (toppingForm.price == null || Number(toppingForm.price) < 0) errs.price = 'Giá phải là số không âm.';
    const duplicate = localToppings.some(t => t.name.trim().toLowerCase() === toppingForm.name.trim().toLowerCase() && t.id !== (isEditing ? editingId : 0));
    if (duplicate) errs.name = 'Topping đã tồn tại.';
    setToppingErrors(errs);
    return errs;
  };

  const validateSizeForm = () => {
    const errs: Record<string,string> = {};
    if (!sizeForm.name || !sizeForm.name.trim()) errs.name = 'Tên size không được để trống.';
    if (sizeForm.priceModifier == null || Number(sizeForm.priceModifier) < 0) errs.priceModifier = 'Giá thêm phải là số không âm.';
    const duplicate = localSizes.some(s => s.name.trim().toLowerCase() === sizeForm.name.trim().toLowerCase() && s.id !== (isEditing ? editingId : 0));
    if (duplicate) errs.name = 'Size đã tồn tại.';
    setSizeErrors(errs);
    return errs;
  };

  const validateCategoryForm = () => {
    const errs: Record<string,string> = {};
    if (!categoryForm.id || !categoryForm.id.trim()) errs.id = 'ID danh mục không được để trống.';
    if (!/^[a-z0-9\-]+$/.test(categoryForm.id)) errs.id = 'ID chỉ được chứa chữ thường, số và dấu gạch ngang.';
    if (!categoryForm.name || !categoryForm.name.trim()) errs.name = 'Tên danh mục không được để trống.';
    const duplicate = localCategories.some(c => c.id === categoryForm.id && c.id !== (isEditing ? String(editingId) : ''));
    if (duplicate) errs.id = 'ID danh mục đã tồn tại.';
    setCategoryErrors(errs);
    return errs;
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const resetForms = () => {
    setProductForm({
      id: 0,
      name: '',
      price: 0,
      image: '',
      category: categories[0]?.id || 'milk-tea',
    });
    setToppingForm({ id: 0, name: '', price: 0 });
    setSizeForm({ id: 0, name: '', priceModifier: 0 });
    setCategoryForm({ id: '', name: '' });
    setIsEditing(false);
    setEditingId(null);
  };

  // Product handlers
  const handleAddProduct = async () => {
    if (!isAdmin()) { showError('Bạn không có quyền thực hiện hành động này.'); return; }
    const errs = validateProductForm();
    if (Object.keys(errs).length > 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    try {
      const newProduct = await adminService.createProduct({
        name: productForm.name,
        price: productForm.price,
        image: productForm.image,
        category: productForm.category
      });

      const updated = [...localProducts, newProduct];
      setLocalProducts(updated);

      try { addAudit({ action: 'create', target: 'product', targetId: newProduct.id, before: null, after: newProduct, note: 'Thêm sản phẩm' }); } catch (e) {}
      try { onUpdateProducts(updated); } catch (e) {}

      resetForms();
      showSuccess('Đã thêm sản phẩm thành công!');
    } catch (e) {
      console.error(e);
      showError('Thêm sản phẩm thất bại');
    }
  };

  const handleEditProduct = (product: Product) => {
    setProductForm(product);
    setIsEditing(true);
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateProduct = async () => {
    if (!isAdmin()) { showError('Bạn không có quyền thực hiện hành động này.'); return; }
    const errs = validateProductForm();
    if (Object.keys(errs).length > 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    const id = editingId as number;

    try {
      const updatedProduct = await adminService.updateProduct(id, {
        name: productForm.name,
        price: productForm.price,
        image: productForm.image,
        category: productForm.category
      });

      const updated = localProducts.map(p => p.id === id ? updatedProduct : p);
      setLocalProducts(updated);

      try { addAudit({ action: 'update', target: 'product', targetId: updatedProduct.id, before: null, after: updatedProduct, note: 'Cập nhật sản phẩm' }); } catch (e) {}
      try { onUpdateProducts(updated); } catch (e) {}

      resetForms();
      showSuccess('Đã cập nhật sản phẩm thành công!');
    } catch (e) {
      console.error(e);
      showError('Cập nhật sản phẩm thất bại');
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await adminService.deleteProduct(id);

      const updated = localProducts.filter(p => p.id !== id);
      setLocalProducts(updated);

      try { addAudit({ action: 'delete', target: 'product', targetId: id, before: null, after: null, note: 'Xóa sản phẩm' }); } catch (e) {}
      try { onUpdateProducts(updated); } catch (e) {}

      setShowDeleteConfirm(false);
      setDeleteId(null);
      showSuccess('Đã xóa sản phẩm thành công!');
    } catch (e) {
      console.error(e);
      showError('Xóa sản phẩm thất bại');
    }
  };

  // Topping handlers
  const handleAddTopping = async () => {
    if (!isAdmin()) { showError('Bạn không có quyền thực hiện hành động này.'); return; }
    const errs = validateToppingForm();
    if (Object.keys(errs).length > 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    try {
      const newTopping = await adminService.createTopping({
        name: toppingForm.name,
        price: toppingForm.price
      });

      const updated = [...localToppings, newTopping];
      setLocalToppings(updated);

      try { addAudit({ action: 'create', target: 'topping', targetId: newTopping.id, before: null, after: newTopping, note: 'Thêm topping' }); } catch (e) {}
      try { onUpdateToppings(updated); } catch (e) {}

      resetForms();
      showSuccess('Đã thêm topping thành công!');
    } catch (e) {
      console.error(e);
      showError('Thêm topping thất bại');
    }
  };

  const handleEditTopping = (topping: Topping) => {
    setToppingForm(topping);
    setIsEditing(true);
    setEditingId(topping.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateTopping = async () => {
    if (!isAdmin()) { showError('Bạn không có quyền thực hiện hành động này.'); return; }
    const errs = validateToppingForm();
    if (Object.keys(errs).length > 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    const id = editingId as number;

    try {
      const updatedTopping = await adminService.updateTopping(id, {
        name: toppingForm.name,
        price: toppingForm.price
      });

      const updated = localToppings.map(t => t.id === id ? updatedTopping : t);
      setLocalToppings(updated);

      try { addAudit({ action: 'update', target: 'topping', targetId: updatedTopping.id, before: null, after: updatedTopping, note: 'Cập nhật topping' }); } catch (e) {}
      try { onUpdateToppings(updated); } catch (e) {}

      resetForms();
      showSuccess('Đã cập nhật topping thành công!');
    } catch (e) {
      console.error(e);
      showError('Cập nhật topping thất bại');
    }
  };

  const handleDeleteTopping = async (id: number) => {
    try {
      await adminService.deleteTopping(id);

      const updated = localToppings.filter(t => t.id !== id);
      setLocalToppings(updated);

      try { addAudit({ action: 'delete', target: 'topping', targetId: id, before: null, after: null, note: 'Xóa topping' }); } catch (e) {}
      try { onUpdateToppings(updated); } catch (e) {}

      setShowDeleteConfirm(false);
      setDeleteId(null);
      showSuccess('Đã xóa topping thành công!');
    } catch (e) {
      console.error(e);
      showError('Xóa topping thất bại');
    }
  };

  // Size handlers
  const handleAddSize = () => {
    if (!isAdmin()) { showError('Bạn không có quyền thực hiện hành động này.'); return; }
    const errs = validateSizeForm();
    if (Object.keys(errs).length > 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    (async () => {
      try {
        const newSize = await adminService.createSize({
          name: sizeForm.name,
          priceModifier: sizeForm.priceModifier
        });

        const updated = [...localSizes, newSize];
        setLocalSizes(updated);

        try { addAudit({ action: 'create', target: 'size', targetId: newSize.id, before: null, after: newSize, note: 'Thêm size' }); } catch (e) {}
        try { onUpdateSizes(updated); } catch (e) {}

        resetForms();
        showSuccess('Đã thêm size thành công!');
      } catch (e) {
        console.error(e);
        showError('Thêm size thất bại');
      }
    })();
  };

  const handleEditSize = (size: Size) => {
    setSizeForm(size);
    setIsEditing(true);
    setEditingId(size.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateSize = () => {
    if (!isAdmin()) { showError('Bạn không có quyền thực hiện hành động này.'); return; }
    const errs = validateSizeForm();
    if (Object.keys(errs).length > 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    (async () => {
      try {
        const id = editingId as number;
        const updatedSize = await adminService.updateSize(id, {
          name: sizeForm.name,
          priceModifier: sizeForm.priceModifier
        });

        const updated = localSizes.map(s => s.id === id ? updatedSize : s);
        setLocalSizes(updated);

        try { addAudit({ action: 'update', target: 'size', targetId: updatedSize.id, before: null, after: updatedSize, note: 'Cập nhật size' }); } catch (e) {}
        try { onUpdateSizes(updated); } catch (e) {}

        resetForms();
        showSuccess('Đã cập nhật size thành công!');
      } catch (e) {
        console.error(e);
        showError('Cập nhật size thất bại');
      }
    })();
  };

  const handleDeleteSize = (id: number) => {
    (async () => {
      if (!isAdmin()) { showError('Bạn không có quyền thực hiện hành động này.'); setShowDeleteConfirm(false); setDeleteId(null); return; }

      try {
        await adminService.deleteSize(id);

        const updated = localSizes.filter(s => s.id !== id);
        setLocalSizes(updated);

        try { addAudit({ action: 'delete', target: 'size', targetId: id, before: null, after: null, note: 'Xóa size' }); } catch (e) {}
        try { onUpdateSizes(updated); } catch (e) {}

        setShowDeleteConfirm(false);
        setDeleteId(null);
        showSuccess('Đã xóa size thành công!');
      } catch (e) {
        console.error(e);
        showError('Xóa size thất bại');
      }
    })();
  };

  // Category handlers
  const handleAddCategory = async () => {
    if (!isAdmin()) { showError('Bạn không có quyền thực hiện hành động này.'); return; }
    const errs = validateCategoryForm();
    if (Object.keys(errs).length > 0) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    try {
      const newCategory = await adminService.createCategory({ id: categoryForm.id || `cat-${Date.now()}`, name: categoryForm.name });
      const updated = [...localCategories, newCategory];
      setLocalCategories(updated);
      try { addAudit({ action: 'create', target: 'category', targetId: newCategory.id, before: null, after: newCategory, note: 'Thêm danh mục' }); } catch (e) {}
      try { onUpdateCategories(updated); } catch (e) {}
      resetForms();
      showSuccess('Đã thêm danh mục thành công!');
    } catch (e) { console.error(e); showError('Thêm danh mục thất bại'); }
  };

  const handleEditCategory = (category: Category) => {
    setCategoryForm(category);
    setIsEditing(true);
    setEditingId(category.id);
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
      try { addAudit({ action: 'update', target: 'category', targetId: updatedCategory.id, before: null, after: updatedCategory, note: 'Cập nhật danh mục' }); } catch (e) {}
      try { onUpdateCategories(updated); } catch (e) {}
      resetForms();
      showSuccess('Đã cập nhật danh mục thành công!');
    } catch (e) { console.error(e); showError('Cập nhật danh mục thất bại'); }
  };

  const handleDeleteCategory = async (id: string) => {
    // Prevent deleting a category that is used by products
    const inUse = localProducts.some(p => p.category === id);
    if (inUse) {
      showError('Không thể xóa danh mục đang được sử dụng bởi sản phẩm.');
      setShowDeleteConfirm(false);
      setDeleteId(null);
      return;
    }

    try {
      await adminService.deleteCategory(id);
      const updated = localCategories.filter(c => c.id !== id);
      setLocalCategories(updated);
      try { addAudit({ action: 'delete', target: 'category', targetId: id, before: null, after: null, note: 'Xóa danh mục' }); } catch (e) {}
      try { onUpdateCategories(updated); } catch (e) {}
      setShowDeleteConfirm(false);
      setDeleteId(null);
      showSuccess('Đã xóa danh mục thành công!');
    } catch (e) { console.error(e); showError('Xóa danh mục thất bại'); }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    resetForms();
  };

  const confirmDelete = (id: number | string) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = () => {
    if (!isAdmin()) { showError('Bạn không có quyền xóa mục.'); setShowDeleteConfirm(false); setDeleteId(null); return; }
    if (deleteId === null) return;

    switch (activeTab) {
      case 'products':
        handleDeleteProduct(deleteId as number);
        break;
      case 'toppings':
        handleDeleteTopping(deleteId as number);
        break;
      case 'sizes':
        handleDeleteSize(deleteId as number);
        break;
      case 'categories':
        handleDeleteCategory(deleteId as string);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
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
      <div className="bg-white shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-full hover:bg-stone-100 transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6 text-stone-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-stone-800">Quản Lý Admin</h1>
                <p className="text-sm text-stone-500">Quản lý sản phẩm, topping và cài đặt</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-4 flex space-x-2 overflow-x-auto">
            <button
              onClick={() => handleTabChange('products')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'products'
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <PackageIcon className="w-5 h-5" />
              <span>Sản Phẩm ({localProducts.length})</span>
            </button>
            <button
              onClick={() => handleTabChange('toppings')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'toppings'
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <ToppingIcon className="w-5 h-5" />
              <span>Topping ({localToppings.length})</span>
            </button>
            <button
              onClick={() => handleTabChange('sizes')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'sizes'
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <SizeIcon className="w-5 h-5" />
              <span>Size ({localSizes.length})</span>
            </button>
            <button
              onClick={() => handleTabChange('categories')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'categories'
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <TagIcon className="w-5 h-5" />
              <span>Danh Mục ({localCategories.length})</span>
            </button>
            <button
              onClick={() => handleTabChange('audit')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <WarningIcon className="w-5 h-5" />
              <span>Nhật Ký ({audits.length})</span>
            </button>
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
          <div className="bg-white rounded-xl p-6 max-w-md w-full animate-fade-in-pop">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <WarningIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-stone-800">Xác Nhận Xóa</h3>
            </div>
            <p className="text-stone-600 mb-6">
              Bạn có chắc chắn muốn xóa mục này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteId(null);
                }}
                className="flex-1 px-4 py-2 bg-stone-200 text-stone-700 rounded-lg font-medium hover:bg-stone-300 transition-colors"
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
        {/* Audit Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Nhật Ký Thao Tác (Audit Log)</h2>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => { clearAudits(); showSuccess('Đã xóa nhật ký'); }}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              {audits.length === 0 ? (
                <p className="text-center text-stone-500 py-8">Chưa có bản ghi</p>
              ) : (
                <div className="space-y-3">
                  {audits.slice(0, 200).map((entry) => (
                    <div key={entry.id} className="p-3 border border-stone-100 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{entry.action.toUpperCase()} • {entry.target} #{entry.targetId}</p>
                          <p className="text-xs text-stone-500">{new Date(entry.timestamp).toLocaleString('vi-VN')} — {entry.user || '—'} ({entry.role || '—'})</p>
                          {entry.note && <p className="text-sm text-stone-600 mt-1">{entry.note}</p>}
                        </div>
                        <details className="text-xs text-stone-500 max-w-lg">
                          <summary className="cursor-pointer">Chi tiết</summary>
                          <pre className="text-xs mt-2 overflow-auto max-h-40 bg-stone-50 p-2 rounded">{JSON.stringify({ before: entry.before, after: entry.after }, null, 2)}</pre>
                        </details>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Product Form */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center space-x-2">
                <PlusIcon className="w-6 h-6" />
                <span>{isEditing ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Tên Sản Phẩm
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="VD: Trà Sữa Truyền Thống"
                  />
                  {productErrors.name && <p className="text-red-500 text-sm mt-1">{productErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Giá (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="20000"
                  />
                  {productErrors.price && <p className="text-red-500 text-sm mt-1">{productErrors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    URL Hình Ảnh
                  </label>
                  <input
                    type="text"
                    value={productForm.image}
                    onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="https://example.com/image.jpg"
                  />
                  {productErrors.image && <p className="text-red-500 text-sm mt-1">{productErrors.image}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Danh Mục
                  </label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {localCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {productErrors.category && <p className="text-red-500 text-sm mt-1">{productErrors.category}</p>}
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleUpdateProduct}
                      disabled={!productForm.name || !productForm.price || !isAdmin()}
                      title={!isAdmin() ? 'Chỉ admin mới có quyền' : undefined}
                      className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <SaveIcon className="w-5 h-5" />
                      <span>Cập Nhật</span>
                    </button>
                    <button
                      onClick={resetForms}
                      className="px-6 py-3 bg-stone-200 text-stone-700 rounded-lg font-medium hover:bg-stone-300 transition-colors"
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddProduct}
                    disabled={!productForm.name || !productForm.price || !isAdmin()}
                    title={!isAdmin() ? 'Chỉ admin mới có quyền' : undefined}
                    className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Thêm Sản Phẩm</span>
                  </button>
                )}
              </div>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-stone-800 mb-4">Danh Sách Sản Phẩm</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {localProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border border-stone-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-40 object-cover bg-stone-100"
                    />
                    <div className="p-4">
                      <h4 className="font-bold text-stone-800">{product.name}</h4>
                      <p className="text-amber-600 font-semibold mt-1">{formatVND(product.price)}</p>
                      <p className="text-sm text-stone-500 mt-1">
                        {localCategories.find(c => c.id === product.category)?.name || product.category}
                      </p>
                      <div className="flex space-x-2 mt-3">
                        <button
                          onClick={() => handleEditProduct(product)}
                          disabled={!isAdmin()}
                          title={!isAdmin() ? 'Chỉ admin mới có quyền' : undefined}
                          className={`flex-1 px-3 py-2 ${isAdmin() ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-stone-200 text-stone-500 cursor-not-allowed'} rounded-lg transition-colors flex items-center justify-center space-x-1`}
                        >
                          <EditIcon className="w-4 h-4" />
                          <span>Sửa</span>
                        </button>
                        <button
                          onClick={() => confirmDelete(product.id)}
                          disabled={!isAdmin()}
                          title={!isAdmin() ? 'Chỉ admin mới có quyền' : undefined}
                          className={`flex-1 px-3 py-2 ${isAdmin() ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-stone-200 text-stone-500 cursor-not-allowed'} rounded-lg transition-colors flex items-center justify-center space-x-1`}
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Toppings Tab */}
        {activeTab === 'toppings' && (
          <div className="space-y-6">
            {/* Topping Form */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center space-x-2">
                <PlusIcon className="w-6 h-6" />
                <span>{isEditing ? 'Chỉnh Sửa Topping' : 'Thêm Topping Mới'}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Tên Topping
                  </label>
                  <input
                    type="text"
                    value={toppingForm.name}
                    onChange={(e) => setToppingForm({ ...toppingForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="VD: Trân Châu Đen"
                  />
                  {toppingErrors.name && <p className="text-red-500 text-sm mt-1">{toppingErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Giá (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={toppingForm.price}
                    onChange={(e) => setToppingForm({ ...toppingForm, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="5000"
                  />
                  {toppingErrors.price && <p className="text-red-500 text-sm mt-1">{toppingErrors.price}</p>}
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleUpdateTopping}
                      disabled={!toppingForm.name || !toppingForm.price || !isAdmin()}
                      title={!isAdmin() ? 'Chỉ admin mới có quyền' : undefined}
                      className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <SaveIcon className="w-5 h-5" />
                      <span>Cập Nhật</span>
                    </button>
                    <button
                      onClick={resetForms}
                      className="px-6 py-3 bg-stone-200 text-stone-700 rounded-lg font-medium hover:bg-stone-300 transition-colors"
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddTopping}
                    disabled={!toppingForm.name || !toppingForm.price || !isAdmin()}
                    title={!isAdmin() ? 'Chỉ admin mới có quyền' : undefined}
                    className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Thêm Topping</span>
                  </button>
                )}
              </div>
            </div>

            {/* Toppings List */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-stone-800 mb-4">Danh Sách Topping</h3>
              <div className="space-y-2">
                {localToppings.map((topping) => (
                  <div
                    key={topping.id}
                    className="flex items-center justify-between p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-stone-800">{topping.name}</h4>
                      <p className="text-amber-600 font-semibold">{formatVND(topping.price)}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTopping(topping)}
                        disabled={!isAdmin()}
                        title={!isAdmin() ? 'Chỉ admin mới có quyền' : undefined}
                        className={`px-3 py-2 ${isAdmin() ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-stone-200 text-stone-500 cursor-not-allowed'} rounded-lg transition-colors flex items-center space-x-1`}
                      >
                        <EditIcon className="w-4 h-4" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => confirmDelete(topping.id)}
                        disabled={!isAdmin()}
                        title={!isAdmin() ? 'Chỉ admin mới có quyền' : undefined}
                        className={`px-3 py-2 ${isAdmin() ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-stone-200 text-stone-500 cursor-not-allowed'} rounded-lg transition-colors flex items-center space-x-1`}
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Sizes Tab */}
        {activeTab === 'sizes' && (
          <div className="space-y-6">
            {/* Size Form */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center space-x-2">
                <PlusIcon className="w-6 h-6" />
                <span>{isEditing ? 'Chỉnh Sửa Size' : 'Thêm Size Mới'}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Tên Size
                  </label>
                  <input
                    type="text"
                    value={sizeForm.name}
                    onChange={(e) => setSizeForm({ ...sizeForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="VD: Size L"
                  />
                  {sizeErrors.name && <p className="text-red-500 text-sm mt-1">{sizeErrors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Giá Thêm (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={sizeForm.priceModifier}
                    onChange={(e) => setSizeForm({ ...sizeForm, priceModifier: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="5000"
                  />
                  {sizeErrors.priceModifier && <p className="text-red-500 text-sm mt-1">{sizeErrors.priceModifier}</p>}
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleUpdateSize}
                      disabled={!sizeForm.name}
                      className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <SaveIcon className="w-5 h-5" />
                      <span>Cập Nhật</span>
                    </button>
                    <button
                      onClick={resetForms}
                      className="px-6 py-3 bg-stone-200 text-stone-700 rounded-lg font-medium hover:bg-stone-300 transition-colors"
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddSize}
                    disabled={!sizeForm.name}
                    className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Thêm Size</span>
                  </button>
                )}
              </div>
            </div>

            {/* Sizes List */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-stone-800 mb-4">Danh Sách Size</h3>
              <div className="space-y-2">
                {localSizes.map((size) => (
                  <div
                    key={size.id}
                    className="flex items-center justify-between p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-stone-800">{size.name}</h4>
                      <p className="text-amber-600 font-semibold">
                        {size.priceModifier > 0 ? `+${formatVND(size.priceModifier)}` : 'Giá gốc'}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditSize(size)}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
                      >
                        <EditIcon className="w-4 h-4" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => confirmDelete(size.id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            {/* Category Form */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center space-x-2">
                <PlusIcon className="w-6 h-6" />
                <span>{isEditing ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    ID Danh Mục (không dấu, viết thường)
                  </label>
                  <input
                    type="text"
                    value={categoryForm.id}
                    onChange={(e) => setCategoryForm({ ...categoryForm, id: e.target.value })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="VD: milk-tea"
                    disabled={isEditing}
                  />
                  {categoryErrors.id && <p className="text-red-500 text-sm mt-1">{categoryErrors.id}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Tên Danh Mục
                  </label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="VD: Trà Sữa"
                  />
                  {categoryErrors.name && <p className="text-red-500 text-sm mt-1">{categoryErrors.name}</p>}
                </div>
              </div>
              <div className="mt-4 flex space-x-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleUpdateCategory}
                      disabled={!categoryForm.id || !categoryForm.name}
                      className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      <SaveIcon className="w-5 h-5" />
                      <span>Cập Nhật</span>
                    </button>
                    <button
                      onClick={resetForms}
                      className="px-6 py-3 bg-stone-200 text-stone-700 rounded-lg font-medium hover:bg-stone-300 transition-colors"
                    >
                      Hủy
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleAddCategory}
                    disabled={!categoryForm.id || !categoryForm.name}
                    className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    <PlusIcon className="w-5 h-5" />
                    <span>Thêm Danh Mục</span>
                  </button>
                )}
              </div>
            </div>

            {/* Categories List */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-stone-800 mb-4">Danh Sách Danh Mục</h3>
              <div className="space-y-2">
                {localCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
                  >
                    <div>
                      <h4 className="font-bold text-stone-800">{category.name}</h4>
                      <p className="text-sm text-stone-500">ID: {category.id}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
                      >
                        <EditIcon className="w-4 h-4" />
                        <span>Sửa</span>
                      </button>
                      <button
                        onClick={() => confirmDelete(category.id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1"
                      >
                        <TrashIcon className="w-4 h-4" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

