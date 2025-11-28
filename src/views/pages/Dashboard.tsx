import React, { useMemo } from 'react';
import type { HistoricOrder, Product, Category } from '@/models/types';
import {
  DollarSignIcon,
  PackageIcon,
  TrophyIcon,
  ArrowLeftIcon,
  ToppingIcon,
  TagIcon
} from '@/views/assets/icons';
import { formatVND } from '@/utils/formatting';
import { useAuth } from '@/controllers/AuthContext';

interface DashboardProps {
  onBack: () => void;
  orderHistory: HistoricOrder[];
  products: Product[];
  categories: Category[];
}

interface ProductStats {
  product: Product;
  totalOrders: number;
  totalRevenue: number;
}

const Dashboard: React.FC<DashboardProps> = ({ onBack, orderHistory, products, categories }) => {
  const { user } = useAuth();

  // Example promotions shown to non-admin users (could be moved to props or context later)
  const promotions = [
    { id: 'promo-1', title: 'Mua 1 Tặng 1 Trà Sữa Size M', desc: 'Áp dụng cho tất cả sản phẩm size M', validUntil: '2025-12-31' },
    { id: 'promo-2', title: 'Giảm 10% cho hoá đơn trên 100.000đ', desc: 'Áp dụng online', validUntil: '2025-11-30' }
  ];

  // Calculate total revenue
  const totalRevenue = useMemo(() => {
    return orderHistory.reduce((sum, order) => sum + order.totalPrice, 0);
  }, [orderHistory]);

  // Calculate total orders
  const totalOrders = orderHistory.length;

  // Calculate average order value
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate product statistics
  const productStats = useMemo(() => {
    const stats = new Map<number, ProductStats>();

    orderHistory.forEach(order => {
      if (order.product) {
        const existing = stats.get(order.product.id);
        if (existing) {
          existing.totalOrders += 1;
          existing.totalRevenue += order.totalPrice;
        } else {
          stats.set(order.product.id, {
            product: order.product,
            totalOrders: 1,
            totalRevenue: order.totalPrice,
          });
        }
      }
    });

    return Array.from(stats.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10);
  }, [orderHistory]);

  // Calculate category statistics
  const categoryStats = useMemo(() => {
    const stats = new Map<string, { orders: number; revenue: number }>();

    orderHistory.forEach(order => {
      if (order.product) {
        const categoryId = order.product.category;
        const existing = stats.get(categoryId);
        if (existing) {
          existing.orders += 1;
          existing.revenue += order.totalPrice;
        } else {
          stats.set(categoryId, {
            orders: 1,
            revenue: order.totalPrice,
          });
        }
      }
    });

    const totalRevenue = Array.from(stats.values()).reduce((sum, stat) => sum + stat.revenue, 0);

    return categories
      .map(category => {
        const stat = stats.get(category.id) || { orders: 0, revenue: 0 };
        return {
          category,
          totalOrders: stat.orders,
          totalRevenue: stat.revenue,
          percentage: totalRevenue > 0 ? (stat.revenue / totalRevenue) * 100 : 0,
        };
      })
      .filter(stat => stat.totalOrders > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [orderHistory, categories]);

  // Calculate topping statistics
  const toppingStats = useMemo(() => {
    const stats = new Map<string, { count: number; revenue: number }>();

    orderHistory.forEach(order => {
      order.toppings.forEach(topping => {
        const existing = stats.get(topping.name);
        if (existing) {
          existing.count += 1;
          existing.revenue += topping.price;
        } else {
          stats.set(topping.name, {
            count: 1,
            revenue: topping.price,
          });
        }
      });
    });

    return Array.from(stats.entries())
      .map(([name, stat]) => ({
        name,
        count: stat.count,
        revenue: stat.revenue,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [orderHistory]);

  // Calculate daily revenue (last 7 days)
  const dailyRevenue = useMemo(() => {
    const last7Days = new Map<string, { revenue: number; orders: number }>();
    const today = new Date();

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last7Days.set(dateStr, { revenue: 0, orders: 0 });
    }

    // Aggregate orders by day
    orderHistory.forEach(order => {
      const orderDate = new Date(order.date).toISOString().split('T')[0];
      const existing = last7Days.get(orderDate);
      if (existing) {
        existing.revenue += order.totalPrice;
        existing.orders += 1;
      }
    });

    return Array.from(last7Days.entries()).map(([date, stat]) => ({
      date: new Date(date).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' }),
      revenue: stat.revenue,
      orders: stat.orders,
    }));
  }, [orderHistory]);

  // Find max revenue for chart scaling
  const maxDailyRevenue = Math.max(...dailyRevenue.map(d => d.revenue), 1);

  // Calculate growth rate (compare last 7 days vs previous 7 days)
  const growthRate = useMemo(() => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const last7DaysRevenue = orderHistory
      .filter(order => new Date(order.date) >= sevenDaysAgo)
      .reduce((sum, order) => sum + order.totalPrice, 0);

    const previous7DaysRevenue = orderHistory
      .filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= fourteenDaysAgo && orderDate < sevenDaysAgo;
      })
      .reduce((sum, order) => sum + order.totalPrice, 0);

    if (previous7DaysRevenue === 0) return last7DaysRevenue > 0 ? 100 : 0;
    return ((last7DaysRevenue - previous7DaysRevenue) / previous7DaysRevenue) * 100;
  }, [orderHistory]);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              >
                <ArrowLeftIcon className="w-6 h-6 text-white" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-white">Dashboard Thống Kê</h1>
                <p className="text-amber-100">Tổng quan doanh thu và hiệu suất kinh doanh</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue (admin only) or Promotions (non-admin) */}
          {user && user.role === 'admin' ? (
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <DollarSignIcon className="w-8 h-8" />
                </div>
                {growthRate !== 0 && (
                  <span className={`text-sm font-medium px-2 py-1 rounded ${growthRate > 0 ? 'bg-white/20' : 'bg-red-500/30'}`}>
                    {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
                  </span>
                )}
              </div>
              <p className="text-white/80 text-sm mb-1">Tổng Doanh Thu</p>
              <p className="text-3xl font-bold">{formatVND(totalRevenue)}</p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-white/20 p-3 rounded-lg">
                  <TagIcon className="w-8 h-8" />
                </div>
              </div>
              <p className="text-white/80 text-sm mb-1">Khuyến mãi hiện tại</p>
              <p className="text-2xl font-bold">{promotions[0].title}</p>
              <p className="text-sm text-white/80 mt-2">{promotions[0].desc} • HSD: {promotions[0].validUntil}</p>
            </div>
          )}

          {/* Total Orders */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <PackageIcon className="w-8 h-8" />
              </div>
            </div>
            <p className="text-white/80 text-sm mb-1">Tổng Đơn Hàng</p>
            <p className="text-3xl font-bold">{totalOrders}</p>
          </div>

          {/* Average Order Value */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <TrophyIcon className="w-8 h-8" />
              </div>
            </div>
            <p className="text-white/80 text-sm mb-1">Giá Trị Trung Bình</p>
            <p className="text-3xl font-bold">{formatVND(avgOrderValue)}</p>
          </div>

          {/* Top Products */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <TagIcon className="w-8 h-8" />
              </div>
            </div>
            <p className="text-white/80 text-sm mb-1">Sản Phẩm Bán Chạy</p>
            <p className="text-2xl font-bold">{productStats.length} / {products.length} loại</p>
          </div>
        </div>

        {/* Daily Revenue Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-stone-800 mb-6">Doanh Thu 7 Ngày Gần Nhất</h2>
          <div className="space-y-4">
            {dailyRevenue.map((day, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-stone-700 w-24">{day.date}</span>
                  <span className="text-stone-500">{day.orders} đơn</span>
                  <span className="font-semibold text-amber-600 w-32 text-right">{formatVND(day.revenue)}</span>
                </div>
                <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(day.revenue / maxDailyRevenue) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Products */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center space-x-2">
              <PackageIcon className="w-6 h-6 text-amber-600" />
              <span>Top 10 Sản Phẩm Bán Chạy</span>
            </h2>
            <div className="space-y-3">
              {productStats.length > 0 ? (
                productStats.map((stat, index) => (
                  <div
                    key={stat.product.id}
                    className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-800">{stat.product.name}</p>
                        <p className="text-sm text-stone-500">{stat.totalOrders} đơn</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-amber-600">{formatVND(stat.totalRevenue)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-stone-500 py-8">Chưa có dữ liệu</p>
              )}
            </div>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center space-x-2">
              <TagIcon className="w-6 h-6 text-blue-600" />
              <span>Phân Bố Theo Danh Mục</span>
            </h2>
            <div className="space-y-4">
              {categoryStats.length > 0 ? (
                categoryStats.map((stat, index) => (
                  <div key={stat.category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-stone-700">{stat.category.name}</span>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-stone-500">{stat.totalOrders} đơn</span>
                        <span className="font-semibold text-blue-600">{formatVND(stat.totalRevenue)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            index === 0 ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                            index === 1 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                            index === 2 ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                            'bg-gradient-to-r from-amber-500 to-amber-600'
                          }`}
                          style={{ width: `${stat.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-stone-600 w-12 text-right">
                        {stat.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-stone-500 py-8">Chưa có dữ liệu</p>
              )}
            </div>
          </div>
        </div>

        {/* Top Toppings */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-stone-800 mb-4 flex items-center space-x-2">
            <ToppingIcon className="w-6 h-6 text-purple-600" />
            <span>Top 10 Topping Phổ Biến</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {toppingStats.length > 0 ? (
              toppingStats.map((stat, index) => (
                <div
                  key={stat.name}
                  className="flex items-center justify-between p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-100"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800">{stat.name}</p>
                      <p className="text-sm text-stone-500">{stat.count} lần</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">{formatVND(stat.revenue)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-center text-stone-500 py-8">Chưa có dữ liệu</p>
            )}
          </div>
        </div>

        {/* Empty State */}
        {totalOrders === 0 && (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="bg-stone-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                <PackageIcon className="w-12 h-12 text-stone-400" />
              </div>
              <h3 className="text-2xl font-bold text-stone-800 mb-2">Chưa Có Đơn Hàng</h3>
              <p className="text-stone-500">
                Dashboard sẽ hiển thị thống kê chi tiết khi có đơn hàng đầu tiên.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
