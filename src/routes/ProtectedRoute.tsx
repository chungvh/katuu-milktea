import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/controllers/AuthContext';
import LoadingScreen from '@/views/components/LoadingScreen';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
    requireStaff?: boolean;
}

/**
 * ProtectedRoute component để protect routes yêu cầu authentication
 * - Nếu đang loading (restore session): show LoadingScreen
 * - Nếu chưa login: redirect đến /login
 * - Nếu đã login nhưng không đủ quyền: redirect về / với message
 * - requireAdmin: Chỉ admin mới truy cập được
 * - requireStaff: Staff hoặc admin mới truy cập được
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requireAdmin = false,
    requireStaff = false
}) => {
    const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
    const location = useLocation();

    // Show loading screen while checking auth
    if (isLoading) {
        return <LoadingScreen />;
    }

    // Nếu chưa authenticated, redirect đến login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Đã login, kiểm tra quyền
    // Nếu yêu cầu admin nhưng không phải admin
    if (requireAdmin && !isAdmin()) {
        return <Navigate to="/" state={{ error: 'Bạn không có quyền truy cập trang này. Chỉ Admin mới được phép.' }} replace />;
    }

    // Nếu yêu cầu staff nhưng không phải staff/admin
    if (requireStaff && user?.role !== 'staff' && user?.role !== 'admin') {
        return <Navigate to="/" state={{ error: 'Bạn không có quyền truy cập trang này. Chỉ Staff/Admin mới được phép.' }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
