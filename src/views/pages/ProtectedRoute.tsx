import React, { ReactNode } from 'react';
import { useAuth } from '../../controllers/AuthContext';
import LoginPage from '../pages/LoginPage';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  desiredView?: string; // hint for where to go after login (e.g. 'admin' or 'dashboard')
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false, desiredView }) => {
  const { isAuthenticated, user } = useAuth();

  // Not authenticated - show login (and remember desired view)
  if (!isAuthenticated) {
    try {
      if (desiredView) {
        localStorage.setItem('postLoginView', desiredView);
      } else {
        localStorage.removeItem('postLoginView');
      }
    } catch (e) {
      // ignore storage errors
    }
    // Render a placeholder page (so header etc. remains) and show login modal overlay
    return (
      <>
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-stone-800 mb-2">Yêu cầu đăng nhập</h2>
            <p className="text-stone-600">Bạn cần đăng nhập để truy cập khu vực này.</p>
          </div>
        </div>
        <LoginPage isModal onClose={() => {
          try { localStorage.removeItem('postLoginView'); } catch(_){}
          window.dispatchEvent(new CustomEvent('katuu:cancelProtected'));
        }} />
      </>
    );
  }

  // Authenticated but need admin role
  if (requireAdmin && user?.role !== 'admin') {
    // Show access denied modal overlay
    return (
      <>
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-stone-800 mb-2">Truy Cập Bị Từ Chối</h2>
            <p className="text-stone-600 mb-6">Bạn không có quyền truy cập trang này. Chỉ Admin mới có thể truy cập.</p>
            <p className="text-sm text-stone-500">Tài khoản hiện tại: <strong>{user?.displayName}</strong> ({user?.role})</p>
          </div>
        </div>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 shadow-lg max-w-md w-full text-center">
            <h3 className="text-lg font-bold mb-2">Quyền hạn không đủ</h3>
            <p className="text-sm text-stone-600 mb-4">Bạn cần tài khoản Admin để thực hiện hành động này.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => window.dispatchEvent(new CustomEvent('katuu:cancelProtected'))} className="px-4 py-2 bg-stone-200 rounded">Quay lại</button>
              <button onClick={() => { try { localStorage.removeItem('postLoginView'); } catch {} window.location.reload(); }} className="px-4 py-2 bg-red-500 text-white rounded">Đăng xuất</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Authorized - render children
  return <>{children}</>;
};

export default ProtectedRoute;
