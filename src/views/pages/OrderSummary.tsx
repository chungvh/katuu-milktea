import React, { useState, useRef } from 'react';
import type { Order, OrderItem } from '../../models/types';
import type { HistoricOrder } from '../../models/types';
import { useOrderSession } from '../../controllers/OrderSessionContext';
import Invoice from '../components/Invoice';
import { BobaIcon, IceIcon, SizeIcon, SugarIcon, ToppingIcon, XIcon, CheckIcon, RefreshIcon } from '../../views/assets/icons';
import { formatVND } from '../../utils/formatting';

interface OrderSummaryProps {
  order: Order;
  totalPrice: number;
  onNameChange: (name: string) => void;
  onResetOrder: () => void;
  isResetting: boolean;
  isReordering: boolean;
  onAddToHistory: (order: Order, totalPrice: number) => void;
  onClearHistory?: () => void; // Keep for backward compatibility but not used
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  order,
  totalPrice,
  onNameChange,
  onResetOrder,
  isResetting,
  isReordering,
  onAddToHistory,
  // onClearHistory not used anymore
}) => {
  const { addPendingOrder } = useOrderSession();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [previewOrder, setPreviewOrder] = useState<HistoricOrder | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const { product, toppings, size, sugar, ice, customerName } = order;

  const handlePlaceOrder = async () => {
    // Convert current order to OrderItem format
    if (!product) return;

    const orderItem: OrderItem = {
      product,
      toppings,
      size,
      sugar,
      ice,
      price: totalPrice,
      customerName: customerName || 'Khách', // Add customer name to item
    };

    try {
      // Add to pending orders (new multi-user system)
      await addPendingOrder(customerName || 'Khách', [orderItem]);

      // Also add to personal history (guest can view their own orders)
      onAddToHistory(order, totalPrice);

      setShowSuccess(true);
      setTimeout(() => {
        onResetOrder();
        setShowSuccess(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to place order', error);
      // Still show success even if API fails (localStorage fallback)
      setShowSuccess(true);
      setTimeout(() => {
        onResetOrder();
        setShowSuccess(false);
      }, 1500);
    }
  };

  const buildHistoricOrder = (): HistoricOrder => {
    return {
      ...order,
      id: Date.now(),
      date: new Date().toISOString(),
      totalPrice,
    } as HistoricOrder;
  };

  const handlePreviewInvoice = () => {
    if (!product) return;
    const ho = buildHistoricOrder();
    setPreviewOrder(ho);
    setShowInvoice(true);
  };

  const handleClearName = () => {
    onNameChange('');
    nameInputRef.current?.focus();
  };

  const isOrderEmpty = !product;

  const SINGLE_SIZE_CATEGORIES = ['fruit-tea', 'cafe', 'latte'];
  const productHasMultipleSizes = product && !SINGLE_SIZE_CATEGORIES.includes(product.category);

  const customizationElements = !isOrderEmpty ? [
    productHasMultipleSizes && size && {
      key: 'size',
      content: (
        <>
          <SizeIcon className="w-4 h-4 mr-1.5 text-stone-500" />
          <span>{size.name}{size.priceModifier > 0 ? ` (+${formatVND(size.priceModifier)})` : ''}</span>
        </>
      )
    },
    sugar && {
      key: 'sugar',
      content: (
        <>
          <SugarIcon className="w-4 h-4 mr-1.5 text-stone-500" />
          <span>{sugar}</span>
        </>
      )
    },
    ice && {
      key: 'ice',
      content: (
        <>
          <IceIcon className="w-4 h-4 mr-1.5 text-stone-500" />
          <span>{ice}</span>
        </>
      )
    },
    ...toppings.map(topping => ({
      key: `topping-${topping.id}`,
      content: (
        <>
          <ToppingIcon className="w-4 h-4 mr-1.5 text-amber-600" />
          <span>{topping.name} (+{formatVND(topping.price)})</span>
        </>
      )
    }))
  ].filter(Boolean) : [];

  return (
    <aside className={`relative sticky top-24 bg-white rounded-xl shadow-lg transition-all duration-300 ease-in-out transform ${isResetting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
      {showSuccess && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col justify-center items-center rounded-xl z-20 animate-fade-in-out">
          <CheckIcon className="w-16 h-16 text-green-500 mb-2 animate-draw-check" />
          <p className="text-xl font-bold text-green-600">Đặt Hàng Thành Công!</p>
        </div>
      )}
      
      <div className="p-6 lg:p-8">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-stone-700">
              Đơn Hàng Của Bạn
            </h2>
            <div className="w-[88px] h-[20px] relative">
                <button
                    onClick={onResetOrder}
                    className={`absolute inset-0 flex items-center text-sm font-semibold text-stone-500 hover:text-red-500 transition-all duration-300 ease-out ${
                    !isOrderEmpty
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 -translate-y-2 pointer-events-none'
                    }`}
                    aria-label="Xóa hết và làm lại từ đầu"
                    aria-hidden={isOrderEmpty}
                    tabIndex={isOrderEmpty ? -1 : 0}
                >
                    <RefreshIcon className="w-4 h-4 mr-1" />
                    Xóa Tất Cả
                </button>
            </div>
        </div>
        
        {isOrderEmpty ? (
          <div className="text-center py-10 flex flex-col items-center">
            <BobaIcon className="w-20 h-20 text-stone-200 mb-4 animate-bobbing" />
            <p className="text-stone-500 font-semibold">Đơn hàng của bạn trống</p>
            <p className="text-stone-400 text-sm mt-1">Chọn một thức uống để bắt đầu!</p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            {/* Order Details */}
            <div>
              <div className="flex justify-between items-start pb-4 border-b border-dashed border-stone-200">
                <h3 className="font-bold text-lg text-stone-800">{product.name}</h3>
                <span className="font-semibold text-stone-600">{formatVND(product.price)}</span>
              </div>

              {/* Customizations */}
              <div className="mt-4 space-y-2">
                {customizationElements.map((item, index) => (
                  <div
                    key={item.key}
                    className="animate-fade-in-pop flex items-center text-sm font-medium text-stone-700"
                    style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'backwards' }}
                  >
                    {item.content}
                  </div>
                ))}
              </div>
            </div>

            {/* Total Section */}
            <div className="bg-amber-50 rounded-lg p-4 flex justify-between items-center border border-amber-200">
              <span className="font-bold text-lg text-amber-900">Tổng Cộng</span>
              <span className="font-bold text-2xl text-amber-900">{formatVND(totalPrice)}</span>
            </div>

            {/* Actions Section */}
            <div className="space-y-4 pt-2">
              <div>
                <label htmlFor="customerName" className="block text-base font-semibold text-stone-700 mb-3">
                  Tên Cho Đơn Hàng <span className="text-red-500" aria-hidden="true">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={nameInputRef}
                    type="text"
                    id="customerName"
                    value={customerName}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="Nhập tên của bạn"
                    aria-required="true"
                    className={`w-full pl-3 pr-10 py-2.5 border rounded-lg shadow-sm sm:text-sm transition-all duration-300 ease-in-out ${
                      customerName
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-stone-300 bg-stone-50'
                    }`}
                  />
                  {customerName && (
                    <button
                      onClick={handleClearName}
                      className="absolute inset-y-0 right-1.5 my-auto flex h-7 w-7 items-center justify-center rounded-full text-stone-500 transition-all duration-200 hover:bg-amber-200 hover:text-amber-800 hover:scale-110 active:scale-95"
                      aria-label="Xóa tên"
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
               <button
                 onClick={handlePlaceOrder}
                 disabled={!customerName}
                 className="w-full bg-amber-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:bg-amber-700 transition-all duration-300 disabled:bg-stone-300 disabled:cursor-not-allowed disabled:transform-none transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0.5 active:shadow-md"
               >
                 {isReordering ? 'Cập Nhật Đơn Hàng' : 'Đặt Hàng'}
               </button>
             </div>
           </div>
         </div>
       )}
     </div>
     {showInvoice && previewOrder && (
      <Invoice order={previewOrder} onClose={() => setShowInvoice(false)} />
    )}
   </aside>
 );
};

export default OrderSummary;
