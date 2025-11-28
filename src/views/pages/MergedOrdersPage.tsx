import React from 'react';
import MergedOrdersHistory from '@/views/components/MergedOrdersHistory';

/**
 * MergedOrdersPage - Trang lịch sử đơn hàng đã gộp
 * Protected route - staff/admin only
 */
const MergedOrdersPage: React.FC = () => {
    return <MergedOrdersHistory />;
};

export default MergedOrdersPage;
