import React, { useRef } from 'react';
import type { HistoricOrder } from '@/models/types';
import PrintableInvoice from './PrintableInvoice';

interface InvoiceProps {
  order: HistoricOrder;
  onClose: () => void;
}

const Invoice: React.FC<InvoiceProps> = ({ order, onClose }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);


  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white dark:bg-stone-800 rounded-xl shadow-2xl max-w-2xl w-full my-8">
          {/* Action Buttons */}
          <div className="sticky top-0 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 p-4 flex justify-between items-center print:hidden z-10 rounded-t-xl">
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">Hóa Đơn</h2>
            <div className="flex flex-wrap gap-2">
              {/* Printing temporarily disabled: show informational badge instead of print controls */}
              <div className="px-4 py-2 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded-lg flex items-center space-x-2">
                <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 19a7 7 0 100-14 7 7 0 000 14z" />
                </svg>
                <span className="text-sm">Chức năng in tạm dừng</span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200 rounded-lg hover:bg-stone-300 dark:hover:bg-stone-600 transition-colors"
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
