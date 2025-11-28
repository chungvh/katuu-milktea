import React, { useMemo, useState } from 'react';
import { useOrderSession } from '@/controllers/OrderSessionContext';
import { formatVND } from '@/utils/formatting';
import {
  ReceiptIcon,
  DollarSignIcon,
  TrophyIcon,
  ClockIcon,
  UsersIcon,
  PackageIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from '@/views/assets/icons';

interface OrderSummaryReportProps {
  onBack: () => void;
}

const OrderSummaryReport: React.FC<OrderSummaryReportProps> = ({ onBack }) => {
  const { mergedOrders } = useOrderSession();
  const [selectedDate, setSelectedDate] = useState<string>('all');

  // Group orders by date
  const ordersByDate = useMemo(() => {
    const groups: { [key: string]: typeof mergedOrders } = {};

    mergedOrders.forEach(order => {
      const date = new Date(order.mergedAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });

      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(order);
    });

    return groups;
  }, [mergedOrders]);

  // Calculate statistics
  const stats = useMemo(() => {
    const filteredOrders = selectedDate === 'all'
      ? mergedOrders
      : (ordersByDate[selectedDate] || []);

    const totalRevenue = filteredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
    const totalOrders = filteredOrders.length;
    const totalItems = filteredOrders.reduce((sum, o) => sum + o.totalItems, 0);
    const uniqueCustomers = new Set(filteredOrders.flatMap(o => o.customerNames)).size;

    // Top products
    const productCount: { [key: string]: { count: number; revenue: number } } = {};
    filteredOrders.forEach(order => {
      order.items.forEach(item => {
        const name = item.product.name;
        if (!productCount[name]) {
          productCount[name] = { count: 0, revenue: 0 };
        }
        productCount[name].count++;
        productCount[name].revenue += item.price;
      });
    });

    const topProducts = Object.entries(productCount)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Revenue by staff
    const staffRevenue: { [key: string]: number } = {};
    filteredOrders.forEach(order => {
      staffRevenue[order.mergedBy] = (staffRevenue[order.mergedBy] || 0) + order.totalPrice;
    });

    return {
      totalRevenue,
      totalOrders,
      totalItems,
      uniqueCustomers,
      topProducts,
      staffRevenue: Object.entries(staffRevenue).map(([name, revenue]) => ({ name, revenue })),
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    };
  }, [mergedOrders, ordersByDate, selectedDate]);


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
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 dark:from-stone-900 dark:to-stone-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center text-stone-600 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Quay lại
            </button>
            <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-3">
              <ReceiptIcon className="w-8 h-8 text-amber-600" />
              Tổng Hợp Đơn Hàng
            </h1>
            <div className="w-20" /> {/* Spacer for centering */}
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-3">
            <label className="text-stone-700 dark:text-stone-300 font-medium">Lọc theo ngày:</label>
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-stone-300 dark:border-stone-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-stone-700 text-stone-800 dark:text-stone-100"
            >
              <option value="all">Tất cả</option>
              {Object.keys(ordersByDate).sort().reverse().map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSignIcon className="w-8 h-8" />
              <span className="text-green-100 text-sm font-medium">Tổng Doanh Thu</span>
            </div>
            <p className="text-3xl font-bold">{formatVND(stats.totalRevenue)}</p>
            <p className="text-green-100 text-sm mt-1">
              TB: {formatVND(stats.averageOrderValue)}/đơn
            </p>
          </div>

          {/* Total Orders */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <CheckCircleIcon className="w-8 h-8" />
              <span className="text-blue-100 text-sm font-medium">Đơn Đã Chốt</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalOrders}</p>
            <p className="text-blue-100 text-sm mt-1">{stats.totalItems} món</p>
          </div>

          {/* Unique Customers */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <UsersIcon className="w-8 h-8" />
              <span className="text-purple-100 text-sm font-medium">Khách Hàng</span>
            </div>
            <p className="text-3xl font-bold">{stats.uniqueCustomers}</p>
            <p className="text-purple-100 text-sm mt-1">Khách đã phục vụ</p>
          </div>

          {/* Total Items */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <PackageIcon className="w-8 h-8" />
              <span className="text-amber-100 text-sm font-medium">Sản Phẩm</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalItems}</p>
            <p className="text-amber-100 text-sm mt-1">Món đã bán</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Products */}
          <div className="lg:col-span-2 bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
              <TrophyIcon className="w-6 h-6 text-amber-600" />
              Top Sản Phẩm Bán Chạy
            </h2>
            {stats.topProducts.length === 0 ? (
              <p className="text-stone-500 dark:text-stone-400 text-center py-8">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3">
                {stats.topProducts.map((product, index) => (
                  <div
                    key={product.name}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl border border-amber-200 dark:border-amber-700/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                            index === 2 ? 'bg-amber-600' :
                              'bg-stone-400'
                        }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-800 dark:text-stone-100">{product.name}</p>
                        <p className="text-sm text-stone-500 dark:text-stone-400">{product.count} món đã bán</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400">{formatVND(product.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Staff Performance */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
              <UsersIcon className="w-6 h-6 text-blue-600" />
              Hiệu Suất Staff
            </h2>
            {stats.staffRevenue.length === 0 ? (
              <p className="text-stone-500 dark:text-stone-400 text-center py-8">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-3">
                {stats.staffRevenue.sort((a, b) => b.revenue - a.revenue).map((staff) => (
                  <div
                    key={staff.name}
                    className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-stone-800 dark:text-stone-200">{staff.name}</p>
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{formatVND(staff.revenue)}</p>
                    </div>
                    <div className="w-full bg-blue-200 dark:bg-blue-900/40 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(staff.revenue / stats.totalRevenue) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      {((staff.revenue / stats.totalRevenue) * 100).toFixed(1)}% tổng doanh thu
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Order List */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl shadow-lg p-6 mt-6">
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 flex items-center gap-2">
            <ClockIcon className="w-6 h-6 text-stone-600 dark:text-stone-400" />
            Chi Tiết Đơn Hàng
          </h2>
          {(selectedDate === 'all' ? mergedOrders : (ordersByDate[selectedDate] || [])).length === 0 ? (
            <p className="text-stone-500 dark:text-stone-400 text-center py-8">Chưa có đơn hàng nào</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {(selectedDate === 'all' ? mergedOrders : (ordersByDate[selectedDate] || [])).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-700/30 rounded-xl hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-mono text-sm text-stone-500 dark:text-stone-400">#{order.id.split('-')[1].substring(0, 8)}</span>
                      <span className="text-xs text-stone-400 dark:text-stone-500">{formatDate(order.mergedAt)}</span>
                    </div>
                    <p className="font-semibold text-stone-800 dark:text-stone-200">
                      {order.customerNames.join(', ')}
                    </p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {order.totalItems} món • Chốt bởi {order.mergedBy}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{formatVND(order.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderSummaryReport;

