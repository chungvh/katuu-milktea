import React, { useState, useEffect } from 'react';
import { useOrderSession } from '../../controllers/OrderSessionContext';
import { useAuth } from '@/controllers/AuthContext';
import { formatVND } from '@/utils/formatting';
import { XIcon, ShoppingCartIcon, UsersIcon, ClockIcon } from '@/views/assets/icons';
import type { Product, Topping, Size, OrderItem, PendingOrder, ToppingSelection } from '@/models/types';
import * as menuService from '@/models/menuService';

const SUGAR_LEVELS = ['100%', '70%', '50%', '30%', '0%'];
const ICE_LEVELS = ['100%', '70%', '50%', '30%', '0%'];

// Helper SVGs for Edit & Trash icons
const EditIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.83a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.34 9m-4.78 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const PendingOrdersPanel: React.FC = () => {
  const { pendingOrders, mergePendingOrders, deletePendingOrder, updatePendingOrder } = useOrderSession();
  const { user } = useAuth();
  
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [showMergeConfirm, setShowMergeConfirm] = useState(false);

  // Edit states
  const [editingOrder, setEditingOrder] = useState<PendingOrder | null>(null);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editItems, setEditItems] = useState<OrderItem[]>([]);
  const [addProductId, setAddProductId] = useState<string>('');

  // Menu lists
  const [products, setProducts] = useState<Product[]>([]);
  const [toppings, setToppings] = useState<Topping[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  // Load menu items for editor
  useEffect(() => {
    const loadMenu = async () => {
      try {
        const [prods, tops, sizs] = await Promise.all([
          menuService.fetchProducts(),
          menuService.fetchToppings(),
          menuService.fetchSizes(),
        ]);
        setProducts(prods);
        setToppings(tops);
        setSizes(sizs);
      } catch (error) {
        console.error('Failed to load menu items:', error);
      }
    };
    loadMenu();
  }, []);

  const activePendingOrders = pendingOrders.filter(o => o.status === 'pending');

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

  // ============ EDIT MODAL FUNCTIONS ============

  const startEditing = (order: PendingOrder) => {
    setEditingOrder(order);
    setEditCustomerName(order.customerName);
    setEditItems(JSON.parse(JSON.stringify(order.items)));
    setAddProductId('');
  };

  const calculateItemPrice = (product: Product, size: Size, toppingSelections: ToppingSelection[]) => {
    const toppingsPrice = toppingSelections.reduce((sum, ts) => {
      const t = ts.topping;
      const qty = ts.quantity;
      return sum + t.price * qty;
    }, 0);
    return product.price + size.priceModifier + toppingsPrice;
  };

  const updateItemSize = (idx: number, sizeId: number) => {
    const selectedSize = sizes.find(s => s.id === sizeId);
    if (!selectedSize) return;

    setEditItems(prev => {
      return prev.map((item, i) => {
        if (i !== idx) return item;
        const price = calculateItemPrice(item.product, selectedSize, item.toppings);
        return { ...item, size: selectedSize, price };
      });
    });
  };

  const updateItemSugar = (idx: number, sugar: string) => {
    setEditItems(prev => {
      return prev.map((item, i) => {
        if (i !== idx) return item;
        return { ...item, sugar };
      });
    });
  };

  const updateItemIce = (idx: number, ice: string) => {
    setEditItems(prev => {
      return prev.map((item, i) => {
        if (i !== idx) return item;
        return { ...item, ice };
      });
    });
  };

  const toggleItemTopping = (itemIdx: number, topping: Topping) => {
    setEditItems(prev => {
      return prev.map((item, idx) => {
        if (idx !== itemIdx) return item;
        
        const exists = item.toppings.some((ts: any) => (ts.topping?.id || ts.id) === topping.id);
        let newToppings: ToppingSelection[];
        if (exists) {
          newToppings = item.toppings.filter((ts: any) => (ts.topping?.id || ts.id) !== topping.id);
        } else {
          newToppings = [...item.toppings, { topping, quantity: 1 }];
        }

        const price = calculateItemPrice(item.product, item.size, newToppings);
        return { ...item, toppings: newToppings, price };
      });
    });
  };

  const adjustItemToppingQty = (itemIdx: number, toppingId: number, delta: number) => {
    setEditItems(prev => {
      return prev.map((item, idx) => {
        if (idx !== itemIdx) return item;
        
        const newToppings = item.toppings.map((ts: any) => {
          const tid = ts.topping?.id || ts.id;
          if (tid === toppingId) {
            const newQty = Math.max(1, (ts.quantity || 1) + delta);
            return { ...ts, quantity: newQty };
          }
          return ts;
        });

        const price = calculateItemPrice(item.product, item.size, newToppings);
        return { ...item, toppings: newToppings, price };
      });
    });
  };

  const removeItem = (idx: number) => {
    setEditItems(prev => prev.filter((_, i) => i !== idx));
  };

  const addProductToOrder = () => {
    if (!addProductId) return;
    const prod = products.find(p => p.id === parseInt(addProductId));
    if (!prod) return;

    const defaultSize = sizes[0] || { id: 1, name: 'M', priceModifier: 0 };

    const newItem: OrderItem = {
      product: prod,
      toppings: [],
      size: defaultSize,
      sugar: '100%',
      ice: '100%',
      price: prod.price + defaultSize.priceModifier
    };

    setEditItems(prev => [...prev, newItem]);
    setAddProductId('');
  };

  const saveEdit = async () => {
    if (!editingOrder) return;
    if (!editCustomerName.trim()) {
      alert('Vui lòng nhập tên khách hàng');
      return;
    }
    if (editItems.length === 0) {
      alert('Đơn hàng phải có ít nhất 1 món');
      return;
    }

    try {
      // Call updatePendingOrder with correct positional arguments: (orderId, customerName, items)
      await updatePendingOrder(editingOrder.id, editCustomerName, editItems);
      setEditingOrder(null);
    } catch (err) {
      console.error(err);
      alert('Lỗi cập nhật đơn hàng');
    }
  };

  const totalEditPrice = editItems.reduce((sum, item) => sum + item.price, 0);

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
            <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 mb-2 flex items-center gap-2">
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
        <div className="bg-stone-50 border border-stone-200 dark:border-stone-600 rounded-xl p-12 text-center">
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
                className={`bg-white dark:bg-stone-800 rounded-xl shadow-md p-6 border-2 transition-all duration-200 ${
                  selectedOrders.has(order.id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-stone-200 dark:border-stone-600 hover:border-amber-300'
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
                        <h3 className="text-xl font-bold text-stone-800 dark:text-stone-100">{order.customerName}</h3>
                        <p className="text-sm text-stone-500 dark:text-stone-400 flex items-center gap-1 mt-1">
                          <ClockIcon className="w-4 h-4" />
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-amber-600">{formatVND(order.totalPrice)}</p>
                        <p className="text-sm text-stone-500 dark:text-stone-400">{order.items.length} món</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-2 bg-stone-50 rounded-lg p-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-sm">
                          <div className="flex-1">
                            <p className="font-semibold text-stone-700 dark:text-stone-200">{item.product.name}</p>
                            <div className="text-stone-500 text-xs mt-1 space-y-0.5">
                              <p>Size: {item.size.name} • Đường: {item.sugar} • Đá: {item.ice}</p>
                              {item.toppings.length > 0 && (
                                <p>Topping: {item.toppings.map((ts: any) => {
                                  const t = ts.topping || ts;
                                  const qty = ts.quantity || 1;
                                  return qty > 1 ? `${t.name} x${qty}` : t.name;
                                }).join(', ')}</p>
                              )}
                            </div>
                          </div>
                          <span className="font-semibold text-amber-600 ml-4">{formatVND(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Edit and Delete Buttons */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => startEditing(order)}
                      className="text-amber-500 hover:text-amber-700 p-2 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Chỉnh sửa đơn"
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => deletePendingOrder(order.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa đơn"
                    >
                      <XIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Merge Confirmation Modal */}
      {showMergeConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-4">Xác nhận chốt đơn</h2>
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
                className="flex-1 bg-stone-200 text-stone-700 dark:text-stone-200 px-4 py-3 rounded-xl font-semibold hover:bg-stone-300 transition-colors"
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

      {/* Edit Order Modal (Admin/Staff) */}
      {editingOrder && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                Chỉnh Sửa Đơn Hàng
              </h2>
              <button
                onClick={() => setEditingOrder(null)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <XIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Customer Name Input */}
              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
                  Tên Khách Hàng
                </label>
                <input
                  type="text"
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-100 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">
                  Danh Sách Món Ăn ({editItems.length})
                </label>

                {editItems.map((item, idx) => (
                  <div key={idx} className="bg-stone-50 dark:bg-stone-800/50 rounded-xl p-4 border border-stone-200 dark:border-stone-800 space-y-4 relative">
                    {/* Item Header */}
                    <div className="flex justify-between items-center pr-8">
                      <span className="font-bold text-stone-800 dark:text-stone-200 text-sm">
                        Món {idx + 1}: {item.product.name}
                      </span>
                      <span className="font-bold text-amber-600">{formatVND(item.price)}</span>
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Size Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-500 mb-1">Kích thước</label>
                        <select
                          value={item.size.id}
                          onChange={(e) => updateItemSize(idx, parseInt(e.target.value))}
                          className="w-full text-sm rounded-lg border-stone-300 dark:border-stone-700 p-2 bg-white dark:bg-stone-800 dark:text-stone-100"
                        >
                          {sizes.map(s => (
                            <option key={s.id} value={s.id}>
                              {s.name} (+{formatVND(s.priceModifier)})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Sugar Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-500 mb-1">Mức đường</label>
                        <select
                          value={item.sugar}
                          onChange={(e) => updateItemSugar(idx, e.target.value)}
                          className="w-full text-sm rounded-lg border-stone-300 dark:border-stone-700 p-2 bg-white dark:bg-stone-800 dark:text-stone-100"
                        >
                          {SUGAR_LEVELS.map(lvl => (
                            <option key={lvl} value={lvl}>{lvl}</option>
                          ))}
                        </select>
                      </div>

                      {/* Ice Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-stone-500 mb-1">Mức đá</label>
                        <select
                          value={item.ice}
                          onChange={(e) => updateItemIce(idx, e.target.value)}
                          className="w-full text-sm rounded-lg border-stone-300 dark:border-stone-700 p-2 bg-white dark:bg-stone-800 dark:text-stone-100"
                        >
                          {ICE_LEVELS.map(lvl => (
                            <option key={lvl} value={lvl}>{lvl}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Toppings Options */}
                    <div>
                      <span className="block text-xs font-semibold text-stone-500 mb-2">Thêm Topping</span>
                      <div className="flex flex-wrap gap-2">
                        {toppings.map(t => {
                          const existing: any = item.toppings.find((ts: any) => (ts.topping?.id || ts.id) === t.id);
                          const isChecked = !!existing;
                          const qty = existing ? (existing.quantity || 1) : 0;

                          return (
                            <div
                              key={t.id}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-colors cursor-pointer select-none ${
                                isChecked
                                  ? 'border-amber-500 bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200'
                                  : 'border-stone-200 hover:bg-stone-100 dark:border-stone-700 text-stone-600 dark:text-stone-300'
                              }`}
                            >
                              <span onClick={() => toggleItemTopping(idx, t)}>
                                {t.name} (+{formatVND(t.price)})
                              </span>
                              {isChecked && (
                                <div className="flex items-center gap-1 ml-1.5 border-l border-amber-300 dark:border-amber-700 pl-1.5">
                                  <button
                                    onClick={() => adjustItemToppingQty(idx, t.id, -1)}
                                    className="w-4 h-4 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 rounded flex items-center justify-center font-bold"
                                  >
                                    -
                                  </button>
                                  <span className="w-3 text-center font-semibold">{qty}</span>
                                  <button
                                    onClick={() => adjustItemToppingQty(idx, t.id, 1)}
                                    className="w-4 h-4 bg-amber-200 dark:bg-amber-800 hover:bg-amber-300 dark:hover:bg-amber-700 rounded flex items-center justify-center font-bold"
                                  >
                                    +
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Delete Item Button */}
                    <button
                      onClick={() => removeItem(idx)}
                      className="absolute top-2 right-2 text-stone-400 hover:text-red-500 rounded p-1 hover:bg-red-50 dark:hover:bg-red-950/30"
                      title="Xóa món này"
                    >
                      <TrashIcon className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Item to Order */}
              <div className="bg-amber-50/50 dark:bg-stone-800/30 rounded-xl p-4 border border-amber-200/50 dark:border-stone-800 space-y-3">
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">
                  Thêm Món Mới Vào Đơn
                </label>
                <div className="flex gap-3">
                  <select
                    value={addProductId}
                    onChange={(e) => setAddProductId(e.target.value)}
                    className="flex-1 text-sm rounded-lg border-stone-300 dark:border-stone-700 p-2 bg-white dark:bg-stone-850 dark:text-stone-100"
                  >
                    <option value="">-- Chọn sản phẩm để thêm --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {formatVND(p.price)}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={addProductToOrder}
                    disabled={!addProductId}
                    className="bg-amber-500 hover:bg-amber-600 disabled:bg-stone-300 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
                  >
                    Thêm món
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/50 flex justify-between items-center rounded-b-2xl">
              <div>
                <p className="text-xs font-semibold text-stone-500">TỔNG TIỀN MỚI</p>
                <p className="text-2xl font-bold text-amber-600">{formatVND(totalEditPrice)}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingOrder(null)}
                  className="bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-200 px-5 py-3 rounded-xl font-semibold hover:bg-stone-300 dark:hover:bg-stone-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={saveEdit}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-md"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default PendingOrdersPanel;
