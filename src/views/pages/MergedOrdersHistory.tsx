import React from 'react';
import { useOrderSession } from '../../controllers/OrderSessionContext';
import { formatVND } from '../../utils/formatting';
import { CheckCircleIcon, UsersIcon, ClockIcon, ReceiptIcon } from '../../views/assets/icons';

const MergedOrdersHistory: React.FC = () => {
  const { mergedOrders } = useOrderSession();

  console.log('mergedOrders', mergedOrders)

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-200">
        <h1 className="text-3xl font-bold text-stone-800 mb-2 flex items-center gap-2">
          <CheckCircleIcon className="w-8 h-8 text-green-600" />
          Lịch Sử Đơn Đã Chốt
        </h1>
        <p className="text-stone-600">
          <ReceiptIcon className="w-4 h-4 inline mr-1" />
          {(mergedOrders || []).length} đơn đã hoàn thành
        </p>
      </div>

      {/* Orders List */}
      {(!mergedOrders || mergedOrders.length === 0) ? (
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-12 text-center">
          <CheckCircleIcon className="w-16 h-16 mx-auto text-stone-300 mb-4" />
          <p className="text-stone-500 text-lg">Chưa có đơn hàng nào được chốt</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mergedOrders.map((order) => {
            const shortId = (order?.id || '').split('-').slice(-1)[0] || String(order?.id || '').slice(0,8);
            const mergedAt = order?.mergedAt || order?.merged_at || order?.mergedAt === 0 ? order.mergedAt : order?.merged_at;

            return (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-md p-6 border-2 border-green-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-bold text-stone-800">Đơn #{shortId}</h3>
                  </div>
                  <div className="space-y-1 text-sm text-stone-600">
                    <p className="flex items-center gap-1">
                      <UsersIcon className="w-4 h-4" />
                      Khách: {(order.customerNames || order.customer_names || []).join(', ')}
                    </p>
                    <p className="flex items-center gap-1">
                      <ClockIcon className="w-4 h-4" />
                      {mergedAt ? formatDate(mergedAt) : '—'}
                    </p>
                    <p>Chốt bởi: <span className="font-semibold">{order.mergedBy || order.merged_by || '—'}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-green-600">{formatVND(order.totalPrice ?? order.total_price ?? 0)}</p>
                  <p className="text-sm text-stone-500 mt-1">{order.totalItems ?? order.total_items ?? 0} món</p>
                </div>
              </div>

              {/* Items */}
              <div className="bg-stone-50 rounded-lg p-4">
                <h4 className="font-semibold text-stone-700 mb-3">Chi tiết đơn hàng:</h4>
                <div className="space-y-2">
                  {(order.items || []).map((item, idx) => {
                    const itemKey = `${order.id}-${idx}-${item?.product?.id ?? item?.product?.name ?? idx}`;
                    const customerNamePrefix = item?.customerName || item?.customer_name || '';
                    const productName = item?.product?.name || item?.product?.title || item?.name || 'Sản phẩm';
                    const itemPrice = item?.price ?? item?.totalPrice ?? item?.total_price ?? item?.product?.price ?? 0;

                    return (
                      <div key={itemKey} className="flex justify-between items-start text-sm py-2 border-b border-stone-200 last:border-0">
                        <div className="flex-1">
                          <p className="font-semibold text-stone-700">
                            {customerNamePrefix ? (
                              <span className="text-amber-600 mr-2">{idx + 1}. {customerNamePrefix} -</span>
                            ) : (`${idx + 1}. `)}
                            {productName}
                          </p>
                          <div className="text-stone-500 text-xs mt-1 space-y-0.5">
                            <p>Size: {item?.size?.name ?? item?.size ?? '—'} • Đường: {item?.sugar ?? item?.sweetness ?? '—'} • Đá: {item?.ice ?? '—'}</p>
                            {Array.isArray(item?.toppings) && item.toppings.length > 0 && (
                              <p>Topping: {item.toppings.map(t => t.name || t).join(', ')}</p>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold text-green-600 ml-4">{formatVND(itemPrice)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MergedOrdersHistory;
