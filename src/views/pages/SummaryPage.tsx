import React from 'react';
import OrderSummaryReport from '@/views/components/OrderSummaryReport';
import { useNavigate } from 'react-router-dom';

/**
 * SummaryPage - Trang báo cáo tổng quan đơn hàng
 * Protected route - staff/admin only
 */
const SummaryPage: React.FC = () => {
    const navigate = useNavigate();

    return <OrderSummaryReport onBack={() => navigate('/')} />;
};

export default SummaryPage;
