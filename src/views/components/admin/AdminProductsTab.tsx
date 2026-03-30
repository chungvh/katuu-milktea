import React from 'react';
import type { Product, Category } from '@/models/types';
import { PlusIcon, EditIcon, TrashIcon, SaveIcon } from '@/views/assets/icons';
import { formatVND } from '@/utils/formatting';

interface ProductFormData {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface AdminProductsTabProps {
  products: Product[];
  categories: Category[];
  isAdmin: boolean;
  isEditing: boolean;
  productForm: ProductFormData;
  productErrors: Record<string, string>;
  onFormChange: (form: ProductFormData) => void;
  onAdd: () => void;
  onEdit: (product: Product) => void;
  onUpdate: () => void;
  onDelete: (id: number) => void;
  onReset: () => void;
}

const AdminProductsTab: React.FC<AdminProductsTabProps> = ({
  products,
  categories,
  isAdmin,
  isEditing,
  productForm,
  productErrors,
  onFormChange,
  onAdd,
  onEdit,
  onUpdate,
  onDelete,
  onReset,
}) => {
  return (
    <div className="space-y-6">
      {/* Product Form */}
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 flex items-center space-x-2">
          <PlusIcon className="w-6 h-6" />
          <span>{isEditing ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              Tên Sản Phẩm
            </label>
            <input
              type="text"
              value={productForm.name}
              onChange={(e) => onFormChange({ ...productForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="VD: Trà Sữa Truyền Thống"
            />
            {productErrors.name && <p className="text-red-500 text-sm mt-1">{productErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              Giá (VNĐ)
            </label>
            <input
              type="number"
              value={productForm.price}
              onChange={(e) => onFormChange({ ...productForm, price: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="20000"
            />
            {productErrors.price && <p className="text-red-500 text-sm mt-1">{productErrors.price}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              URL Hình Ảnh
            </label>
            <input
              type="text"
              value={productForm.image}
              onChange={(e) => onFormChange({ ...productForm, image: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="https://example.com/image.jpg"
            />
            {productErrors.image && <p className="text-red-500 text-sm mt-1">{productErrors.image}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              Danh Mục
            </label>
            <select
              value={productForm.category}
              onChange={(e) => onFormChange({ ...productForm, category: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {categories.map((cat) => (
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
                onClick={onUpdate}
                disabled={!productForm.name || !productForm.price || !isAdmin}
                title={!isAdmin ? 'Chỉ admin mới có quyền' : undefined}
                className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <SaveIcon className="w-5 h-5" />
                <span>Cập Nhật</span>
              </button>
              <button
                onClick={onReset}
                className="px-6 py-3 bg-stone-200 text-stone-700 dark:text-stone-200 rounded-lg font-medium hover:bg-stone-300 transition-colors"
              >
                Hủy
              </button>
            </>
          ) : (
            <button
              onClick={onAdd}
              disabled={!productForm.name || !productForm.price || !isAdmin}
              title={!isAdmin ? 'Chỉ admin mới có quyền' : undefined}
              className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Thêm Sản Phẩm</span>
            </button>
          )}
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">Danh Sách Sản Phẩm</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-40 object-cover bg-stone-100 dark:bg-stone-800"
              />
              <div className="p-4">
                <h4 className="font-bold text-stone-800 dark:text-stone-100">{product.name}</h4>
                <p className="text-amber-600 font-semibold mt-1">{formatVND(product.price)}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  {categories.find(c => c.id === product.category)?.name || product.category}
                </p>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={() => onEdit(product)}
                    disabled={!isAdmin}
                    title={!isAdmin ? 'Chỉ admin mới có quyền' : undefined}
                    className={`flex-1 px-3 py-2 ${isAdmin ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-stone-200 text-stone-500 dark:text-stone-400 cursor-not-allowed'} rounded-lg transition-colors flex items-center justify-center space-x-1`}
                  >
                    <EditIcon className="w-4 h-4" />
                    <span>Sửa</span>
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    disabled={!isAdmin}
                    title={!isAdmin ? 'Chỉ admin mới có quyền' : undefined}
                    className={`flex-1 px-3 py-2 ${isAdmin ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-stone-200 text-stone-500 dark:text-stone-400 cursor-not-allowed'} rounded-lg transition-colors flex items-center justify-center space-x-1`}
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
  );
};

export default AdminProductsTab;
