import React from 'react';
import PendingOrdersPanel from '@/views/components/PendingOrdersPanel';

/**
 * PendingOrdersPage - Trang quản lý đơn hàng chờ
 * Protected route - staff/admin only
 */
const PendingOrdersPage: React.FC = () => {
    return <PendingOrdersPanel />;
};

export default PendingOrdersPage;
