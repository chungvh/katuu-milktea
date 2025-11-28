import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HistoryIcon, SettingsIcon, ShoppingCartIcon, CheckCircleIcon, ReceiptIcon } from '../assets/icons';
import { useAuth } from '@/controllers/AuthContext';
import { useOrderSession } from '@/controllers/OrderSessionContext';
import { useTheme } from '@/controllers/ThemeContext';

interface HeaderProps {
  isScrolled: boolean;
}

const Header: React.FC<HeaderProps> = ({ isScrolled }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getPendingOrdersCount } = useOrderSession();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const pendingCount = getPendingOrdersCount();
  const [historyCount, setHistoryCount] = React.useState(0);

  // Load history count from localStorage
  React.useEffect(() => {
    const updateHistoryCount = () => {
      try {
        const stored = localStorage.getItem('katuu_order_history');
        if (stored) {
          const history = JSON.parse(stored);
          setHistoryCount(history.length);
        } else {
          setHistoryCount(0);
        }
      } catch (error) {
        console.error('Failed to load history count:', error);
        setHistoryCount(0);
      }
    };

    // Initial load
    updateHistoryCount();

    // Listen for storage changes (when history is updated)
    window.addEventListener('storage', updateHistoryCount);

    // Custom event for same-tab updates
    window.addEventListener('historyUpdated', updateHistoryCount);

    return () => {
      window.removeEventListener('storage', updateHistoryCount);
      window.removeEventListener('historyUpdated', updateHistoryCount);
    };
  }, []);

  const isStaffOrAdmin = user && (user.role === 'staff' || user.role === 'admin');

  // Determine if a route is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`bg-white/80 dark:bg-stone-900/80 backdrop-blur-md sticky top-0 z-10 transition-shadow duration-300 ${isScrolled ? 'shadow-lg' : 'shadow-sm'}`}>
      <div className="container mx-auto px-4 py-4 max-w-6xl flex justify-between items-center">
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <h1 className="text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">
            Katuu
          </h1>
          <p className="text-stone-500 dark:text-stone-400">Katuu Xin Chào!</p>
        </Link>
        <div className="flex items-center space-x-2">
          {/* Pending Orders - Staff/Admin only */}
          {isStaffOrAdmin && (
            <Link
              to="/pending"
              className={`relative p-2 rounded-full hover:bg-amber-100 transition-colors group ${isActive('/pending') ? 'bg-amber-50' : ''}`}
              aria-label="Đơn chờ xử lý"
              title="Đơn chờ xử lý"
            >
              <ShoppingCartIcon className="w-7 h-7 text-amber-600" />
              {pendingCount > 0 && (
                <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center transform translate-x-1/3 -translate-y-1/3 animate-pulse">
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </Link>
          )}

          {/* Merged Orders - Staff/Admin only */}
          {isStaffOrAdmin && (
            <Link
              to="/merged"
              className={`relative p-2 rounded-full hover:bg-green-100 transition-colors ${isActive('/merged') ? 'bg-green-50' : ''}`}
              aria-label="Đơn đã chốt"
              title="Đơn đã chốt"
            >
              <CheckCircleIcon className="w-7 h-7 text-green-600" />
            </Link>
          )}

          {/* Summary Report - Staff/Admin only */}
          {isStaffOrAdmin && (
            <Link
              to="/summary"
              className={`relative p-2 rounded-full hover:bg-purple-100 transition-colors ${isActive('/summary') ? 'bg-purple-50' : ''}`}
              aria-label="Tổng hợp báo cáo"
              title="Tổng hợp báo cáo"
            >
              <ReceiptIcon className="w-7 h-7 text-purple-600" />
            </Link>
          )}

          {/* Dashboard - show only to staff/admin */}
          {isStaffOrAdmin && (
            <Link
              to="/dashboard"
              className={`relative p-2 rounded-full hover:bg-stone-100 transition-colors group ${isActive('/dashboard') ? 'bg-stone-100' : ''}`}
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
            </Link>
          )}
          {/* Admin button - show only to admin */}
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`relative p-2 rounded-full hover:bg-stone-100 transition-colors ${isActive('/admin') ? 'bg-stone-100' : ''}`}
              aria-label="Quản lý Admin"
              title="Quản lý Admin"
            >
              <SettingsIcon className="w-7 h-7 text-stone-600" />
            </Link>
          )}

          <Link
            to="/history"
            className={`relative p-2 rounded-full hover:bg-stone-100 transition-colors ${isActive('/history') ? 'bg-stone-100' : ''}`}
            aria-label="Xem lịch sử đơn hàng"
            title="Lịch sử đơn hàng"
          >
            <HistoryIcon className="w-7 h-7 text-stone-600" />
            {historyCount > 0 && (
              <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center transform translate-x-1/3 -translate-y-1/3">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="relative p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          >
            {theme === 'dark' ? (
              // Sun icon for dark mode (click to go light)
              <svg className="w-7 h-7 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              // Moon icon for light mode (click to go dark)
              <svg className="w-7 h-7 text-stone-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* User Info & Logout */}
          {isAuthenticated && user && (
            <div className="flex items-center space-x-3 ml-2 pl-2 border-l border-stone-300 dark:border-stone-700">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-stone-800 dark:text-stone-100">{user.displayName}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400 capitalize">{user.role}</p>
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
