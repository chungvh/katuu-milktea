import React, { useMemo, useState, useEffect } from 'react';
import type { HistoricOrder } from '@/models/types';
import { CATEGORIES } from '@/models/constants';
import { XIcon, HistoryIcon, EditIcon, TrashIcon, WarningIcon, ArrowLeftIcon, PackageIcon, DollarSignIcon, TrophyIcon, SearchIcon } from '@/views/assets/icons';
import { formatVND } from '@/utils/formatting';
import Invoice from './Invoice';
import { useAuth } from '@/controllers/AuthContext';

interface OrderHistoryProps {
  onBack: () => void;
  history: HistoricOrder[];
  onReorder: (order: HistoricOrder) => void;
  onDeleteOrder: (orderId: number) => void;
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  isLoading: boolean;
}


const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: React.ReactNode; }> = ({ icon, title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200 flex flex-col items-start space-y-3 h-full">
    <div className="flex items-center space-x-4">
      <div className="bg-amber-100 p-3 rounded-full">
        {icon}
      </div>
      <p className="text-sm font-medium text-stone-500 dark:text-stone-400">{title}</p>
    </div>
    <div className="text-lg font-bold text-stone-800 dark:text-stone-100 pl-1">{value}</div>
  </div>
);

const SkeletonOrderCard: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <li className="p-4 animate-pulse animate-fade-in-up" style={{ ...style, animationFillMode: 'backwards' }}>
    <div className="flex justify-between items-start">
      <div>
        <div className="h-5 bg-stone-200 rounded w-40 mb-2"></div> {/* Customer Name */}
        <div className="flex items-center mt-1">
          <div className="h-2 w-2 bg-stone-200 rounded-full mr-2"></div> {/* Status dot */}
          <div className="h-3 bg-stone-200 rounded w-48"></div> {/* Date */}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className="h-6 bg-stone-200 rounded w-20"></div> {/* Price */}
        <div className="h-7 w-7 bg-stone-200 rounded-full"></div> {/* Edit Icon */}
        <div className="h-7 w-7 bg-stone-200 rounded-full"></div> {/* Delete Icon */}
      </div>
    </div>
    <div className="border-t border-stone-200 pt-3 mt-3">
      <div className="h-4 bg-stone-200 rounded w-48 mb-2"></div> {/* Product Name */}
      <div className="h-3 bg-stone-200 rounded w-full mb-2"></div> {/* Size, Sugar, Ice */}
      <div className="h-3 bg-stone-200 rounded w-3/4"></div> {/* Toppings */}
    </div>
  </li>
);

const OrderHistory: React.FC<OrderHistoryProps> = ({
  onBack,
  history,
  onReorder,
  onDeleteOrder,
  searchTerm,
  onSearchTermChange,
  selectedCategory,
  onCategoryChange,
  isLoading
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<HistoricOrder | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<HistoricOrder | null>(null);
  const [isDialogExiting, setIsDialogExiting] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 400); // Wait 400ms after user stops typing for a smoother experience

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const stats = useMemo(() => {
    const totalRevenue = history.reduce((sum, order) => sum + order.totalPrice, 0);

    const getTopN = (items: string[], n: number): string[] => {
      if (items.length === 0) return [];
      const counts = items.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return Object.entries(counts)
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, n)
        .map(([name]) => name);
    };

    const drinkNames = history.map(h => h.product?.name).filter(Boolean) as string[];
    const top3Drinks = getTopN(drinkNames, 3);

    const toppingNames = history.flatMap(h => h.toppings.map(t => t.name));
    const top3Toppings = getTopN(toppingNames, 3);

    return {
      totalOrders: history.length,
      totalRevenue: totalRevenue,
      top3Drinks,
      top3Toppings,
    }
  }, [history]);

  const filteredHistory = useMemo(() => {
    const trimmedSearch = debouncedSearchTerm.trim().toLowerCase();
    let result = history
      .filter(order => {
        const matchesSearch = order.customerName.toLowerCase().includes(trimmedSearch);
        const matchesCategory = selectedCategory === 'all' || order.product?.category === selectedCategory;
        return matchesSearch && matchesCategory;
      });

    // Always sort by newest first
    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return result;
  }, [history, debouncedSearchTerm, selectedCategory]);

  const handleDeleteClick = (orderId: number) => {
    setDeletingOrderId(orderId);
    setTimeout(() => {
      onDeleteOrder(orderId);
      setDeletingOrderId(null);
    }, 300);
  };

  const handleOpenConfirmDialog = (order: HistoricOrder) => {
    setShowConfirmDialog(order);
    setIsDialogExiting(false);
  };

  const handleCloseConfirmDialog = (isConfirmed: boolean) => {
    setIsDialogExiting(true);
    setTimeout(() => {
      if (isConfirmed && showConfirmDialog) {
        handleDeleteClick(showConfirmDialog.id);
      }
      setShowConfirmDialog(null);
      setIsDialogExiting(false);
    }, 200);
  };

  const { user, logout, isAuthenticated } = useAuth();


  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl animate-fade-in-up">
      <div className="mb-8">
        <button onClick={onBack} className="flex items-center text-sm font-semibold text-stone-600 dark:text-stone-300 hover:text-amber-600 transition-colors mb-4">
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Quay Lại Đặt Hàng
        </button>
        <h1 className="text-4xl font-bold text-stone-800 dark:text-stone-100">Lịch Sử Đơn Hàng</h1>
      </div>

      {isAuthenticated && user && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard icon={<PackageIcon className="w-6 h-6 text-amber-600" />} title="Tổng Đơn Hàng" value={<span className="text-2xl">{String(stats.totalOrders)}</span>} />
          {isAuthenticated && user && (
            <StatCard icon={<DollarSignIcon className="w-6 h-6 text-amber-600" />} title="Tổng Doanh Thu" value={<span className="text-2xl">{formatVND(stats.totalRevenue)}</span>} />
          )}
          <StatCard
            icon={<TrophyIcon className="w-6 h-6 text-amber-600" />}
            title="Top 3 Thức Uống"
            value={
              stats.top3Drinks.length > 0 ? (
                <ol className="space-y-1">
                  {stats.top3Drinks.map((drink, index) => (
                    <li key={index} className="flex items-baseline">
                      <span className="text-sm font-semibold text-stone-400 mr-2">{index + 1}.</span>
                      <span className="text-base font-bold">{drink}</span>
                    </li>
                  ))}
                </ol>
              ) : <span className="text-base font-bold">N/A</span>
            }
          />
          <StatCard
            icon={<TrophyIcon className="w-6 h-6 text-amber-600" />}
            title="Top 3 Topping"
            value={
              stats.top3Toppings.length > 0 ? (
                <ol className="space-y-1">
                  {stats.top3Toppings.map((topping, index) => (
                    <li key={index} className="flex items-baseline">
                      <span className="text-sm font-semibold text-stone-400 mr-2">{index + 1}.</span>
                      <span className="text-base font-bold">{topping}</span>
                    </li>
                  ))}
                </ol>
              ) : <span className="text-base font-bold">N/A</span>
            }
          />
        </div>
      )}

      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-lg border border-stone-200 overflow-hidden">
        <div className="p-6 border-b border-stone-200">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h2 className="text-2xl font-bold text-stone-700 dark:text-stone-200">
              Tất Cả Đơn Hàng
              <span className="ml-3 bg-amber-100 text-amber-800 text-sm font-bold px-2.5 py-1 rounded-full align-middle">
                {filteredHistory.length}
              </span>
            </h2>
          </div>
          <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Category Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-sm font-semibold text-stone-600 dark:text-stone-300 mr-1 shrink-0">Danh Mục:</p>
              <button
                onClick={() => onCategoryChange('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 border-2 ${selectedCategory === 'all'
                    ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                    : 'bg-white border-stone-200 text-stone-700 dark:text-stone-200 hover:border-amber-400 hover:text-amber-600'
                  }`}
              >
                Tất Cả
              </button>
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 border-2 ${isSelected
                        ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                        : 'bg-white border-stone-200 text-stone-700 dark:text-stone-200 hover:border-amber-400 hover:text-amber-600'
                      }`}
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:max-w-xs">
              <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm theo tên khách hàng..."
                value={searchTerm}
                onChange={e => onSearchTermChange(e.target.value)}
                title="Tìm kiếm đơn hàng theo tên khách hàng."
                className="w-full pl-11 pr-10 py-2.5 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition-all duration-300 ease-in-out bg-stone-100 hover:border-amber-300 placeholder-stone-400 focus:bg-white focus:scale-[1.01] focus:shadow-md"
              />
              {searchTerm && (
                <button
                  onClick={() => onSearchTermChange('')}
                  className="absolute inset-y-0 right-1.5 my-auto flex h-7 w-7 items-center justify-center rounded-full text-stone-500 dark:text-stone-400 transition-all duration-200 hover:bg-amber-200 hover:text-amber-800 hover:scale-110 active:scale-95"
                  aria-label="Xóa tìm kiếm"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <ul className="divide-y divide-stone-100">
            {[...Array(5)].map((_, index) => (
              <SkeletonOrderCard key={index} style={{ animationDelay: `${index * 75}ms` }} />
            ))}
          </ul>
        ) : filteredHistory.length === 0 ? (
          <div className="text-center py-20 flex flex-col items-center animate-fade-in-up">
            <HistoryIcon className="w-20 h-20 text-stone-300 mb-4" />
            <p className="text-stone-500 font-semibold">
              {history.length > 0 ? 'Không có đơn hàng nào khớp' : 'Chưa có đơn hàng nào'}
            </p>
            <p className="text-stone-400 text-sm mt-1">
              {history.length > 0 ? 'Thử điều chỉnh tìm kiếm hoặc bộ lọc.' : 'Các đơn hàng đã hoàn thành sẽ xuất hiện ở đây.'}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {filteredHistory.map((order, index) => (
              <li
                key={order.id}
                className={`relative p-4 hover:bg-stone-50 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:z-10 animate-fade-in-up ${deletingOrderId === order.id ? 'animate-fade-out-and-collapse' : ''}`}
                style={{ animationDelay: `${index * 75}ms`, animationFillMode: 'backwards' }}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-stone-800 dark:text-stone-100">Đơn hàng của {order.customerName}</p>
                    <div className="flex items-center mt-1">
                      <span className="flex h-2 w-2 mr-2 rounded-full bg-green-500" />
                      <p className="text-xs text-stone-400">
                        Hoàn thành - {new Date(order.date).toLocaleString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-lg text-amber-600 mr-2">{formatVND(order.totalPrice)}</span>
                    {isAuthenticated && user && (
                      <button
                        onClick={() => setSelectedInvoiceOrder(order)}
                        disabled={deletingOrderId !== null || showConfirmDialog !== null}
                        className="p-1.5 rounded-full text-stone-500 dark:text-stone-400 hover:bg-blue-100 hover:text-blue-600 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none transform hover:scale-110 active:scale-95"
                        aria-label="In hóa đơn"
                        title="In hóa đơn"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => onReorder(order)}
                      disabled={deletingOrderId !== null || showConfirmDialog !== null}
                      className="p-1.5 rounded-full text-stone-500 dark:text-stone-400 hover:bg-amber-100 hover:text-amber-600 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none transform hover:scale-110 hover:rotate-6 active:scale-95"
                      aria-label="Đặt lại đơn hàng này"
                      title="Đặt lại đơn hàng này"
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleOpenConfirmDialog(order)}
                      disabled={deletingOrderId !== null || showConfirmDialog !== null}
                      className="p-1.5 rounded-full text-stone-500 dark:text-stone-400 hover:bg-red-100 hover:text-red-600 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none transform hover:scale-110 hover:-rotate-6 active:scale-95"
                      aria-label="Xóa đơn hàng này"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                {order.product && (
                  <div className="border-t border-stone-100 pt-3 mt-3">
                    <p className="font-semibold text-stone-700 dark:text-stone-200">{order.product.name}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                      {order.size?.name}, {order.sugar}, {order.ice}
                    </p>
                    {order.toppings.length > 0 && (
                      <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                        <span className='font-medium'>Topping:</span> {order.toppings.map((t) => t.name).join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {showConfirmDialog && (
        <div
          className={`fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-40 ${isDialogExiting ? 'animate-fade-out' : 'animate-fade-in'}`}
          onClick={() => handleCloseConfirmDialog(false)}
        >
          <div
            className={`bg-white dark:bg-stone-800 rounded-xl shadow-2xl p-6 w-full max-w-sm text-center ${isDialogExiting ? 'animate-dialog-exit' : 'animate-dialog-enter'}`}
            onClick={(e) => e.stopPropagation()}
          >
            <WarningIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">Xóa Đơn Hàng?</h3>
            <p className="text-stone-500 text-sm mt-2 mb-6">
              Bạn có chắc muốn xóa đơn hàng của <span className="font-semibold">{showConfirmDialog.customerName}</span>? Hành động này không thể hoàn tác.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleCloseConfirmDialog(false)}
                className="px-4 py-2.5 bg-stone-100 text-stone-700 dark:text-stone-200 font-semibold rounded-lg hover:bg-stone-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() => handleCloseConfirmDialog(true)}
                className="px-4 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedInvoiceOrder && (
        <Invoice
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}
    </main>
  );
};

export default OrderHistory;

