import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Import layouts
import RootLayout from '@/layouts/RootLayout';

// Import page components
import OrderingPage from '@/views/pages/OrderingPage';
import HistoryPage from '@/views/pages/HistoryPage';
import LoginPage from '@/views/pages/LoginPage';
import DashboardPage from '@/views/pages/DashboardPage';
import PendingOrdersPage from '@/views/pages/PendingOrdersPage';
import MergedOrdersPage from '@/views/pages/MergedOrdersPage';
import SummaryPage from '@/views/pages/SummaryPage';
import AdminPanelPage from '@/views/pages/AdminPanelPage';

/**
 * Router configuration cho ứng dụng
 */
export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootLayout />,
        children: [
            {
                index: true,
                element: <OrderingPage />,
            },
            {
                path: 'login',
                element: <LoginPage isModal={false} />,
            },
            {
                path: 'history',
                element: <HistoryPage />,
            },
            {
                path: 'dashboard',
                element: (
                    <ProtectedRoute requireStaff>
                        <DashboardPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'pending',
                element: (
                    <ProtectedRoute requireStaff>
                        <PendingOrdersPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'merged',
                element: (
                    <ProtectedRoute requireStaff>
                        <MergedOrdersPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'summary',
                element: (
                    <ProtectedRoute requireStaff>
                        <SummaryPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: 'admin',
                element: (
                    <ProtectedRoute requireAdmin>
                        <AdminPanelPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: '*',
                element: <Navigate to="/" replace />,
            },
        ],
    },
]);

export default router;
