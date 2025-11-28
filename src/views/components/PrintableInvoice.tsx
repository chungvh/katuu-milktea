import React, { forwardRef } from 'react';
import type { HistoricOrder } from '@/models/types';
import { formatVND } from '@/utils/formatting';
import { QRCodeSVG } from 'qrcode.react';

interface PrintableInvoiceProps {
  order: HistoricOrder;
}

const PrintableInvoice = forwardRef<HTMLDivElement, PrintableInvoiceProps>(({ order }, ref) => {
  const orderDate = new Date(order.date);
  const formattedDate = orderDate.toLocaleDateString('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });

  return (
    <div ref={ref} className="p-8 bg-white" id="invoice-content">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-amber-500 pb-6">
        <h1 className="text-4xl font-bold text-amber-600 mb-2">KATUU</h1>
        <p className="text-lg text-stone-600">Milk Tea & Coffee</p>
        <p className="text-sm text-stone-500 mt-2">
          📍 123 Đường ABC, Quận XYZ, TP.HCM<br />
          📞 0123 456 789 | 📧 contact@katuu.vn
        </p>
      </div>

      {/* Invoice Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-bold text-stone-800 mb-3 text-lg">Thông Tin Đơn Hàng</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Mã đơn:</strong> #{order.id}</p>
            <p><strong>Ngày:</strong> {formattedDate}</p>
            <p><strong>Khách hàng:</strong> {order.customerName || 'Khách vãng lai'}</p>
          </div>
        </div>
        <div className="flex justify-end">
          <div className="text-center">
            <QRCodeSVG
              value={`KATUU-ORDER-${order.id}`}
              size={120}
              level="H"
            />
            <p className="text-xs text-stone-500 mt-2">Mã QR đơn hàng</p>
          </div>
        </div>
      </div>

      {/* Order Details */}
      <div className="mb-8">
        <h3 className="font-bold text-stone-800 mb-4 text-lg border-b pb-2">Chi Tiết Đơn Hàng</h3>

        {/* Product */}
        <div className="mb-4 bg-stone-50 p-4 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="font-bold text-stone-800">{order.product?.name}</p>
              <p className="text-sm text-stone-600">Sản phẩm chính</p>
            </div>
            <p className="font-semibold text-amber-600">{formatVND(order.product?.price || 0)}</p>
          </div>
        </div>

        {/* Size */}
        {order.size && (
          <div className="flex justify-between items-center py-2 border-b border-stone-200">
            <div className="flex items-center space-x-2">
              <span className="text-stone-600">🥤</span>
              <span className="text-stone-700">{order.size.name}</span>
            </div>
            <span className="text-stone-600">{order.size.priceModifier > 0 ? `+${formatVND(order.size.priceModifier)}` : 'Miễn phí'}</span>
          </div>
        )}

        {/* Sugar & Ice */}
        <div className="grid grid-cols-2 gap-4 py-2 border-b border-stone-200">
          <div className="flex items-center space-x-2">
            <span className="text-stone-600">🍬</span>
            <span className="text-stone-700">{order.sugar}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-stone-600">🧊</span>
            <span className="text-stone-700">{order.ice}</span>
          </div>
        </div>

        {/* Toppings */}
        {order.toppings && order.toppings.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold text-stone-700 mb-2">Topping:</p>
            {order.toppings.map((topping, index) => (
              <div key={index} className="flex justify-between items-center py-2 pl-4 border-b border-stone-100">
                <div className="flex items-center space-x-2">
                  <span className="text-stone-600">•</span>
                  <span className="text-stone-700">{topping.name}</span>
                </div>
                <span className="text-stone-600">+{formatVND(topping.price)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total */}
      <div className="border-t-2 border-stone-300 pt-4">
        <div className="flex justify-between items-center text-xl font-bold">
          <span className="text-stone-800">TỔNG CỘNG:</span>
          <span className="text-amber-600 text-2xl">{formatVND(order.totalPrice)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-stone-500 border-t pt-6">
        <p className="mb-2">Cảm ơn quý khách đã sử dụng dịch vụ!</p>
        <p>Hẹn gặp lại quý khách lần sau 💖</p>
        <p className="mt-4 text-xs">Hotline: 0123 456 789 | Facebook: @KatuuMilkTea</p>
      </div>
    </div>
  );
});

PrintableInvoice.displayName = 'PrintableInvoice';

export default PrintableInvoice;
