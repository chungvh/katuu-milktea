import React from 'react';
import type { Topping } from '@/models/types';
import { PlusIcon, EditIcon, TrashIcon, SaveIcon } from '@/views/assets/icons';
import { formatVND } from '@/utils/formatting';

interface ToppingFormData {
  id: number;
  name: string;
  price: number;
}

interface AdminToppingsTabProps {
  toppings: Topping[];
  isAdmin: boolean;
  isEditing: boolean;
  toppingForm: ToppingFormData;
  toppingErrors: Record<string, string>;
  onFormChange: (form: ToppingFormData) => void;
  onAdd: () => void;
  onEdit: (topping: Topping) => void;
  onUpdate: () => void;
  onDelete: (id: number) => void;
  onReset: () => void;
}

const AdminToppingsTab: React.FC<AdminToppingsTabProps> = ({
  toppings,
  isAdmin,
  isEditing,
  toppingForm,
  toppingErrors,
  onFormChange,
  onAdd,
  onEdit,
  onUpdate,
  onDelete,
  onReset,
}) => {
  return (
    <div className="space-y-6">
      {/* Topping Form */}
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 flex items-center space-x-2">
          <PlusIcon className="w-6 h-6" />
          <span>{isEditing ? 'Chỉnh Sửa Topping' : 'Thêm Topping Mới'}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              Tên Topping
            </label>
            <input
              type="text"
              value={toppingForm.name}
              onChange={(e) => onFormChange({ ...toppingForm, name: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="VD: Trân Châu Đen"
            />
            {toppingErrors.name && <p className="text-red-500 text-sm mt-1">{toppingErrors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
              Giá (VNĐ)
            </label>
            <input
              type="number"
              value={toppingForm.price}
              onChange={(e) => onFormChange({ ...toppingForm, price: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="5000"
            />
            {toppingErrors.price && <p className="text-red-500 text-sm mt-1">{toppingErrors.price}</p>}
          </div>
        </div>
        <div className="mt-4 flex space-x-3">
          {isEditing ? (
            <>
              <button
                onClick={onUpdate}
                disabled={!toppingForm.name || !toppingForm.price || !isAdmin}
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
              disabled={!toppingForm.name || !toppingForm.price || !isAdmin}
              title={!isAdmin ? 'Chỉ admin mới có quyền' : undefined}
              className="flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <PlusIcon className="w-5 h-5" />
              <span>Thêm Topping</span>
            </button>
          )}
        </div>
      </div>

      {/* Toppings List */}
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-4">Danh Sách Topping</h3>
        <div className="space-y-2">
          {toppings.map((topping) => (
            <div
              key={topping.id}
              className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-50 dark:bg-stone-900 transition-colors"
            >
              <div>
                <h4 className="font-bold text-stone-800 dark:text-stone-100">{topping.name}</h4>
                <p className="text-amber-600 font-semibold">{formatVND(topping.price)}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(topping)}
                  disabled={!isAdmin}
                  title={!isAdmin ? 'Chỉ admin mới có quyền' : undefined}
                  className={`px-3 py-2 ${isAdmin ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-stone-200 text-stone-500 dark:text-stone-400 cursor-not-allowed'} rounded-lg transition-colors flex items-center space-x-1`}
                >
                  <EditIcon className="w-4 h-4" />
                  <span>Sửa</span>
                </button>
                <button
                  onClick={() => onDelete(topping.id)}
                  disabled={!isAdmin}
                  title={!isAdmin ? 'Chỉ admin mới có quyền' : undefined}
                  className={`px-3 py-2 ${isAdmin ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-stone-200 text-stone-500 dark:text-stone-400 cursor-not-allowed'} rounded-lg transition-colors flex items-center space-x-1`}
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

export default AdminToppingsTab;
