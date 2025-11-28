import React, { useRef } from 'react';
import type { HistoricOrder } from '@/models/types';
import PrintableInvoice from './PrintableInvoice';

interface InvoiceProps {
  order: HistoricOrder;
  onClose: () => void;
}

const Invoice: React.FC<InvoiceProps> = ({ order, onClose }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  // Experimental: attempt to connect to a Bluetooth device (BLE) and then fallback to print dialog.
  // Note: most thermal Bluetooth printers use Classic SPP (not BLE) and are not accessible via Web Bluetooth.
  // This helper will request a device and inform the user; it's a best-effort UX for BLE-capable printers.
  const attemptBluetoothPrint = async () => {
    try {
      if (!(navigator as any).bluetooth) {
        alert('Web Bluetooth không được hỗ trợ trên trình duyệt này. Vui lòng dùng tính năng In hệ thống.');
        return;
      }

      const device = await (navigator as any).bluetooth.requestDevice({ acceptAllDevices: true });
      if (!device) return;

      // We can't guarantee printing via BLE from the browser — inform user and open system print dialog.
      alert(`Đã kết nối với thiết bị: ${device.name || device.id}. Trình duyệt sẽ mở hộp thoại in hệ thống để bạn chọn máy in.`);
      window.print();
    } catch (err: any) {
      console.error('Bluetooth print error', err);
      alert('Không thể kết nối tới thiết bị Bluetooth hoặc thao tác bị huỷ. Vui lòng sử dụng in hệ thống.');
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8">
          {/* Action Buttons */}
          <div className="sticky top-0 bg-white border-b border-stone-200 p-4 flex justify-between items-center print:hidden z-10 rounded-t-xl">
            <h2 className="text-xl font-bold text-stone-800">Hóa Đơn</h2>
            <div className="flex flex-wrap gap-2">
              {/* Printing temporarily disabled: show informational badge instead of print controls */}
              <div className="px-4 py-2 bg-stone-100 text-stone-600 rounded-lg flex items-center space-x-2">
                <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 19a7 7 0 100-14 7 7 0 000 14z" />
                </svg>
                <span className="text-sm">Chức năng in tạm dừng</span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>

          {/* Invoice Content - Scrollable */}
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <div ref={invoiceRef} id="invoice-content">
              <PrintableInvoice order={order} ref={invoiceRef as React.RefObject<HTMLDivElement>} />
            </div>
          </div>
        </div>
      </div>

      {/* Print handled globally via styles.css */}
    </>
  );
};

export default Invoice;
