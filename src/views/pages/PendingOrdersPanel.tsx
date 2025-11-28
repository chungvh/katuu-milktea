import React, { useState } from 'react';
import { formatVND } from '../../utils/formatting';
import { useOrderSession } from '../../controllers/OrderSessionContext';
import { useAuth } from '../../controllers/AuthContext';
import { XIcon, ShoppingCartIcon, UsersIcon, ClockIcon } from '../assets/icons';

const PendingOrdersPanel: React.FC = () => {
  const { pendingOrders, mergePendingOrders, deletePendingOrder } = useOrderSession();
  const { user } = useAuth();
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showMergeConfirm, setShowMergeConfirm] = useState(false);

  const activePendingOrders = pendingOrders.filter(o => o.status === 'pending');

  console.log(activePendingOrders, 'activePendingOrders')

  const toggleSelect = (orderId: string) => {
    setSelectedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedOrders.size === activePendingOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(activePendingOrders.map(o => o.id)));
    }
  };

  const handleMerge = () => {
    if (selectedOrders.size === 0 || !user) return;

    mergePendingOrders(Array.from(selectedOrders), user.username);
    setSelectedOrders(new Set());
    setShowMergeConfirm(false);
  };

  const selectedOrdersData = activePendingOrders.filter(o => selectedOrders.has(o.id));
  const totalSelectedPrice = selectedOrdersData.reduce((sum, o) => sum + o.totalPrice, 0);
  const totalSelectedItems = selectedOrdersData.reduce((sum, o) => sum + o.items.length, 0);

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">❌ Chỉ Staff/Admin mới có quyền truy cập</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 mb-6 border border-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-stone-800 mb-2 flex items-center gap-2">
              <ShoppingCartIcon className="w-8 h-8 text-amber-600" />
              Danh Sách Đơn Chờ
            </h1>
            <p className="text-stone-600">
              <UsersIcon className="w-4 h-4 inline mr-1" />
              {activePendingOrders.length} đơn đang chờ xử lý
            </p>
          </div>
          {selectedOrders.size > 0 && (
            <button
              onClick={() => setShowMergeConfirm(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Chốt {selectedOrders.size} đơn
            </button>
          )}
        </div>
      </div>

      {/* Selection Summary */}
      {selectedOrders.size > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="text-green-800">
              <p className="font-semibold">
                Đã chọn: {selectedOrders.size} đơn • {totalSelectedItems} món
              </p>
              <p className="text-sm mt-1">
                Tổng tiền: <span className="font-bold text-lg">{formatVND(totalSelectedPrice)}</span>
              </p>
            </div>
            <button
              onClick={() => setSelectedOrders(new Set())}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        </div>
      )}

      {/* Orders List */}
      {activePendingOrders.length === 0 ? (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-12 text-center">
          <ShoppingCartIcon className="w-16 h-16 mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500 text-lg">Chưa có đơn hàng nào</p>
          <p className="text-stone-400 text-sm mt-2">Đơn hàng sẽ xuất hiện khi khách đặt hàng</p>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={selectAll}
              className="text-amber-600 hover:text-amber-700 font-medium"
            >
              {selectedOrders.size === activePendingOrders.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>
          </div>

          <div className="space-y-4">
            {activePendingOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-white rounded-xl shadow-md p-6 border-2 transition-all duration-200 ${
                  selectedOrders.has(order.id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-stone-200 hover:border-amber-300'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedOrders.has(order.id)}
                    onChange={() => toggleSelect(order.id)}
                    className="mt-1 w-5 h-5 rounded border-stone-300 text-green-600 focus:ring-green-500"
                  />

                  {/* Order Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-stone-800">{order.customerName}</h3>
                        <p className="text-sm text-stone-500 flex items-center gap-1 mt-1">
                          <ClockIcon className="w-4 h-4" />
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-amber-600">{formatVND(order.totalPrice)}</p>
                        <p className="text-sm text-stone-500">{order.items.length} món</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2 bg-stone-50 rounded-lg p-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-sm">
                          <div className="flex-1">
                            <p className="font-semibold text-stone-700">{item.product.name}</p>
                            <div className="text-stone-500 text-xs mt-1 space-y-0.5">
                              <p>Size: {item.size.name} • Đường: {item.sugar} • Đá: {item.ice}</p>
                              {item.toppings.length > 0 && (
                                <p>Topping: {item.toppings.map(t => t.name).join(', ')}</p>
                              )}
                            </div>
                          </div>
                          <span className="font-semibold text-amber-600 ml-4">{formatVND(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => deletePendingOrder(order.id)}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa đơn"
                  >
                    <XIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Merge Confirmation Modal */}
      {showMergeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-stone-800 mb-4">Xác nhận chốt đơn</h2>
            <div className="bg-stone-50 rounded-lg p-4 mb-6 space-y-2">
              <p className="text-stone-700">
                <span className="font-semibold">Số đơn:</span> {selectedOrders.size}
              </p>
              <p className="text-stone-700">
                <span className="font-semibold">Tổng món:</span> {totalSelectedItems}
              </p>
              <p className="text-stone-700">
                <span className="font-semibold">Tổng tiền:</span>{' '}
                <span className="text-xl font-bold text-amber-600">{formatVND(totalSelectedPrice)}</span>
              </p>
              <p className="text-stone-700">
                <span className="font-semibold">Khách hàng:</span>{' '}
                {selectedOrdersData.map(o => o.customerName).join(', ')}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowMergeConfirm(false)}
                className="flex-1 bg-stone-200 text-stone-700 px-4 py-3 rounded-xl font-semibold hover:bg-stone-300 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleMerge}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingOrdersPanel;
