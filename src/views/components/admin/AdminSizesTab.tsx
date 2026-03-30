import React from 'react';
import type { Size } from '@/models/types';
import { PlusIcon, EditIcon, TrashIcon, SaveIcon } from '@/views/assets/icons';
import { formatVND } from '@/utils/formatting';

interface SizeFormData {
  id: number;
  name: string;
  priceModifier: number;
}

interface AdminSizesTabProps {
  sizes: Size[];
  isAdmin: boolean;
  isEditing: boolean;
  sizeForm: SizeFormData;
  sizeErrors: Record<string, string>;
  onFormChange: (form: SizeFormData) => void;
  onAdd: () => void;
  onEdit: (size: Size) => void;
  onUpdate: () => void;
  onDelete: (id: number) => void;
  onReset: () => void;
}

const AdminSizesTab: React.FC<AdminSizesTabProps> = ({
  sizes,
  isAdmin,
  isEditing,
  sizeForm,
  sizeErrors,
  onFormChange,
  onAdd,
  onEdit,
  onUpdate,
  onDelete,
  onReset,
}) => {
  return (
    <div className="space-y-6">
      {/* Size Form */}
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 flex items-center space-x-2">
          <PlusIcon className="w-6 h-6" />
          <span>{isEditing ? 'Chỉnh Sửa Size' : 'Thêm Size Mới'}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              Tên Size
            </label>
            <input
              type="text"
              value={sizeForm.name}
              onChange={(e) => onFormChange({ ...sizeForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="VD: Size L"
            />
            {sizeErrors.name && <p className="text-red-500 text-sm mt-1">{sizeErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              Giá Thêm (VNĐ)
            </label>
            <input
              type="number"
              value={sizeForm.priceModifier}
              onChange={(e) => onFormChange({ ...sizeForm, priceModifier: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="5000"
            />
            {sizeErrors.priceModifier && <p className="text-red-500 text-sm mt-1">{sizeErrors.priceModifier}</p>}
          </div>
        </div>
        <div className="mt-4 flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={onUpdate}
                disabled={!sizeForm.name}
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
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">Danh Sách Size</h3>
        <div className="space-y-2">
          {sizes.map((size) => (
            <div
              key={size.id}
              className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-50 dark:bg-stone-900 transition-colors"
            >
              <div>
                <h4 className="font-bold text-stone-800 dark:text-stone-100">{size.name}</h4>
                <p className="text-amber-600 font-semibold">
                  {size.priceModifier > 0 ? `+${formatVND(size.priceModifier)}` : 'Giá gốc'}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(size)}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-1"
                >
                  <EditIcon className="w-4 h-4" />
                  <span>Sửa</span>
                </button>
                <button
                  onClick={() => onDelete(size.id)}
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

export default AdminSizesTab;
