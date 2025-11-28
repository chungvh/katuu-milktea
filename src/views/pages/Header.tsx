import React from 'react';
import { HistoryIcon, SettingsIcon, ShoppingCartIcon, CheckCircleIcon, ReceiptIcon } from '../assets/icons';
import { useAuth } from '../../controllers/AuthContext';
import { useOrderSession } from '../../controllers/OrderSessionContext';

interface HeaderProps {
  onViewHistory: () => void;
  onViewAdmin?: () => void;
  onViewDashboard?: () => void;
  onViewPending?: () => void;
  onViewMerged?: () => void;
  onViewSummary?: () => void;
  historyCount: number;
  isScrolled: boolean;
}

const Header: React.FC<HeaderProps> = ({
  onViewHistory,
  onViewAdmin,
  onViewDashboard,
  onViewPending,
  onViewMerged,
  onViewSummary,
  historyCount,
  isScrolled
}) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getPendingOrdersCount } = useOrderSession();
  const pendingCount = getPendingOrdersCount();

  const isStaffOrAdmin = user && (user.role === 'staff' || user.role === 'admin');

  return (
    <header className={`bg-white/80 backdrop-blur-md sticky top-0 z-10 transition-shadow duration-300 ${isScrolled ? 'shadow-lg' : 'shadow-sm'}`}>
      <div className="container mx-auto px-4 py-4 max-w-6xl flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 tracking-tight">
            Katuu
          </h1>
          <p className="text-stone-500">Katuu Xin Chào!</p>
        </div>
        <div className="flex items-center space-x-2">
          {/* Pending Orders - Staff/Admin only */}
          {onViewPending && isStaffOrAdmin && (
            <button
              onClick={onViewPending}
              className="relative p-2 rounded-full hover:bg-amber-100 transition-colors group"
              aria-label="Đơn chờ xử lý"
              title="Đơn chờ xử lý"
            >
              <ShoppingCartIcon className="w-7 h-7 text-amber-600" />
              {pendingCount > 0 && (
                <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center transform translate-x-1/3 -translate-y-1/3 animate-pulse">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </button>
          )}

          {/* Merged Orders - Staff/Admin only */}
          {onViewMerged && isStaffOrAdmin && (
            <button
              onClick={onViewMerged}
              className="relative p-2 rounded-full hover:bg-green-100 transition-colors"
              aria-label="Đơn đã chốt"
              title="Đơn đã chốt"
            >
              <CheckCircleIcon className="w-7 h-7 text-green-600" />
            </button>
          )}

          {/* Summary Report - Staff/Admin only */}
          {onViewSummary && isStaffOrAdmin && (
            <button
              onClick={onViewSummary}
              className="relative p-2 rounded-full hover:bg-purple-100 transition-colors"
              aria-label="Tổng hợp báo cáo"
              title="Tổng hợp báo cáo"
            >
              <ReceiptIcon className="w-7 h-7 text-purple-600" />
            </button>
          )}

          {/* Dashboard - show only to staff/admin */}
          {onViewDashboard && isStaffOrAdmin && (
            <button
              onClick={onViewDashboard}
              className="relative p-2 rounded-full hover:bg-stone-100 transition-colors group"
              aria-label="Dashboard Thống Kê"
              title="Dashboard Thống Kê"
            >
              <svg
                className="w-7 h-7 text-stone-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            </button>
          )}
          {/* Admin button - show only to staff/admin */}
          {onViewAdmin && isStaffOrAdmin && (
            <button
              onClick={onViewAdmin}
              className="relative p-2 rounded-full hover:bg-stone-100 transition-colors"
              aria-label="Quản lý Admin"
              title="Quản lý Admin"
            >
              <SettingsIcon className="w-7 h-7 text-stone-600" />
            </button>
          )}
          <button
            onClick={onViewHistory}
            className="relative p-2 rounded-full hover:bg-stone-100 transition-colors"
            aria-label="Xem lịch sử đơn hàng"
            title="Lịch sử đơn hàng"
          >
            <HistoryIcon className="w-7 h-7 text-stone-600" />
            {historyCount > 0 && (
              <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center transform translate-x-1/3 -translate-y-1/3">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          {/* User Info & Logout */}
          {isAuthenticated && user && (
            <div className="flex items-center space-x-3 ml-2 pl-2 border-l border-stone-300">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-stone-800">{user.displayName}</p>
                <p className="text-xs text-stone-500 capitalize">{user.role}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                title="Đăng xuất"
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
