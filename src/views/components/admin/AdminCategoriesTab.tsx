import React from 'react';
import type { Category } from '@/models/types';
import { PlusIcon, EditIcon, TrashIcon, SaveIcon } from '@/views/assets/icons';

interface CategoryFormData {
  id: string;
  name: string;
}

interface AdminCategoriesTabProps {
  categories: Category[];
  isAdmin: boolean;
  isEditing: boolean;
  categoryForm: CategoryFormData;
  categoryErrors: Record<string, string>;
  onFormChange: (form: CategoryFormData) => void;
  onAdd: () => void;
  onEdit: (category: Category) => void;
  onUpdate: () => void;
  onDelete: (id: string) => void;
  onReset: () => void;
}

const AdminCategoriesTab: React.FC<AdminCategoriesTabProps> = ({
  categories,
  isAdmin,
  isEditing,
  categoryForm,
  categoryErrors,
  onFormChange,
  onAdd,
  onEdit,
  onUpdate,
  onDelete,
  onReset,
}) => {
  return (
    <div className="space-y-6">
      {/* Category Form */}
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 flex items-center space-x-2">
          <PlusIcon className="w-6 h-6" />
          <span>{isEditing ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              ID Danh Mục (không dấu, viết thường)
            </label>
            <input
              type="text"
              value={categoryForm.id}
              onChange={(e) => onFormChange({ ...categoryForm, id: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="VD: milk-tea"
              disabled={isEditing}
            />
            {categoryErrors.id && <p className="text-red-500 text-sm mt-1">{categoryErrors.id}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              Tên Danh Mục
            </label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) => onFormChange({ ...categoryForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="VD: Trà Sữa"
            />
            {categoryErrors.name && <p className="text-red-500 text-sm mt-1">{categoryErrors.name}</p>}
          </div>
        </div>
        <div className="mt-4 flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={onUpdate}
                disabled={!categoryForm.id || !categoryForm.name}
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
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">Danh Sách Danh Mục</h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-50 dark:bg-stone-900 transition-colors"
            >
              <div>
                <h4 className="font-bold text-stone-800 dark:text-stone-100">{category.name}</h4>
                <p className="text-sm text-stone-500 dark:text-stone-400">ID: {category.id}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(category)}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
                >
                  <EditIcon className="w-4 h-4" />
                  <span>Sửa</span>
                </button>
                <button
                  onClick={() => onDelete(category.id)}
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
  );
};

export default AdminCategoriesTab;
