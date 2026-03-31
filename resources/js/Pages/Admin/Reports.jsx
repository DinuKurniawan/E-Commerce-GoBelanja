import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Reports({ report }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [dateRange, setDateRange] = useState('last_30_days');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'clv', label: 'Customer Value', icon: '💎' },
        { id: 'product-performance', label: 'Products', icon: '📦' },
        { id: 'conversion', label: 'Conversion', icon: '🎯' },
        { id: 'abandoned-carts', label: 'Abandoned Carts', icon: '🛒' },
        { id: 'revenue', label: 'Revenue', icon: '💰' },
        { id: 'segmentation', label: 'Customers', icon: '👥' },
        { id: 'marketing', label: 'Marketing', icon: '📈' },
    ];

    const dateRangeOptions = [
        { value: 'today', label: 'Today' },
        { value: 'yesterday', label: 'Yesterday' },
        { value: 'last_7_days', label: 'Last 7 Days' },
        { value: 'last_30_days', label: 'Last 30 Days' },
        { value: 'last_90_days', label: 'Last 90 Days' },
        { value: 'this_month', label: 'This Month' },
        { value: 'last_month', label: 'Last Month' },
        { value: 'this_year', label: 'This Year' },
        { value: 'custom', label: 'Custom Range' },
    ];

    const getDateRange = () => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch(dateRange) {
            case 'today':
                return { start: today, end: now };
            case 'yesterday':
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                return { start: yesterday, end: yesterday };
            case 'last_7_days':
                const week = new Date(today);
                week.setDate(week.getDate() - 7);
                return { start: week, end: now };
            case 'last_30_days':
                const month = new Date(today);
                month.setDate(month.getDate() - 30);
                return { start: month, end: now };
            case 'last_90_days':
                const quarter = new Date(today);
                quarter.setDate(quarter.getDate() - 90);
                return { start: quarter, end: now };
            case 'this_month':
                return { start: new Date(now.getFullYear(), now.getMonth(), 1), end: now };
            case 'last_month':
                const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                return { start: lastMonth, end: lastMonthEnd };
            case 'this_year':
                return { start: new Date(now.getFullYear(), 0, 1), end: now };
            case 'custom':
                return { start: new Date(customStartDate), end: new Date(customEndDate) };
            default:
                return { start: month, end: now };
        }
    };

    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };

    const loadReportData = async () => {
        if (activeTab === 'overview') return;
        
        setLoading(true);
        try {
            const range = getDateRange();
            const params = {
                start_date: formatDate(range.start),
                end_date: formatDate(range.end),
            };

            const response = await axios.get(route(`admin.reports.${activeTab}`), { params });
            setReportData(response.data);
        } catch (error) {
            console.error('Error loading report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReportData();
    }, [activeTab, dateRange, customStartDate, customEndDate]);

    const exportReport = (format) => {
        const range = getDateRange();
        const url = route('admin.reports.export', { 
            type: activeTab,
            format: format,
            start_date: formatDate(range.start),
            end_date: formatDate(range.end),
        });
        window.open(url, '_blank');
    };

    const renderOverview = () => (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Total Revenue</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        Rp{Number(report.totalRevenue).toLocaleString('id-ID')}
                    </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Total Orders</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {report.totalOrders}
                    </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Avg Order Value</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        Rp{Math.round(report.totalRevenue / (report.totalOrders || 1)).toLocaleString('id-ID')}
                    </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-slate-500">Best Sellers</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                        {report.bestProducts?.length || 0} Products
                    </p>
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Selling Products</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Rating</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Sold</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {(report.bestProducts || []).map((product) => (
                                <tr key={product.id}>
                                    <td className="px-4 py-3 text-sm text-slate-900">{product.name}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">⭐ {product.rating}</td>
                                    <td className="px-4 py-3 text-sm text-slate-600">{product.sold_count}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderCLVReport = () => {
        if (!reportData) return <div className="text-center py-10">Loading...</div>;

        const segmentData = {
            labels: ['High Value', 'Medium Value', 'Low Value'],
            datasets: [{
                data: [
                    reportData.customer_segments?.high_value || 0,
                    reportData.customer_segments?.medium_value || 0,
                    reportData.customer_segments?.low_value || 0,
                ],
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'],
            }],
        };

        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Average CLV</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            Rp{Math.round(reportData.average_clv || 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total Customers</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {reportData.total_customers || 0}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">High Value Customers</p>
                        <p className="mt-2 text-2xl font-bold text-green-600">
                            {reportData.customer_segments?.high_value || 0}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Customer Segments</h3>
                        <div className="h-64 flex items-center justify-center">
                            <Pie data={segmentData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Top 10 Customers</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {(reportData.top_customers || []).slice(0, 10).map((customer, idx) => (
                                <div key={customer.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="text-sm font-medium text-slate-900">{idx + 1}. {customer.name}</p>
                                        <p className="text-xs text-slate-500">{customer.email}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold text-slate-900">
                                            Rp{Math.round(customer.total_spent || 0).toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-xs text-slate-500">{customer.total_orders} orders</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">All Customers</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Customer</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Orders</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Total Spent</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Avg Order</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">CLV</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Tier</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {(reportData.top_customers || []).map((customer) => (
                                    <tr key={customer.id}>
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-medium text-slate-900">{customer.name}</div>
                                            <div className="text-xs text-slate-500">{customer.email}</div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{customer.total_orders}</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            Rp{Math.round(customer.total_spent || 0).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            Rp{Math.round(customer.average_order_value || 0).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                            Rp{Math.round(customer.clv || 0).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">
                                                {customer.loyalty_tier}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderProductPerformance = () => {
        if (!reportData) return <div className="text-center py-10">Loading...</div>;

        const bestSellersData = {
            labels: (reportData.best_sellers || []).slice(0, 10).map(p => p.name?.substring(0, 20) || 'Unknown'),
            datasets: [{
                label: 'Revenue',
                data: (reportData.best_sellers || []).slice(0, 10).map(p => p.total_revenue || 0),
                backgroundColor: '#3b82f6',
            }],
        };

        return (
            <div className="space-y-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Best Sellers by Revenue</h3>
                    <div className="h-80">
                        <Bar 
                            data={bestSellersData} 
                            options={{ 
                                maintainAspectRatio: false,
                                indexAxis: 'y',
                                scales: {
                                    x: {
                                        beginAtZero: true,
                                    }
                                }
                            }} 
                        />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Performers</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead>
                                    <tr>
                                        <th className="px-2 py-2 text-left text-xs font-medium text-slate-500">Product</th>
                                        <th className="px-2 py-2 text-left text-xs font-medium text-slate-500">Sold</th>
                                        <th className="px-2 py-2 text-left text-xs font-medium text-slate-500">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {(reportData.best_sellers || []).slice(0, 10).map((product) => (
                                        <tr key={product.id}>
                                            <td className="px-2 py-2 text-xs text-slate-900">{product.name?.substring(0, 30)}</td>
                                            <td className="px-2 py-2 text-xs text-slate-600">{product.total_sold}</td>
                                            <td className="px-2 py-2 text-xs text-green-600 font-semibold">
                                                Rp{Math.round(product.total_revenue || 0).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Low Performers</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead>
                                    <tr>
                                        <th className="px-2 py-2 text-left text-xs font-medium text-slate-500">Product</th>
                                        <th className="px-2 py-2 text-left text-xs font-medium text-slate-500">Sold</th>
                                        <th className="px-2 py-2 text-left text-xs font-medium text-slate-500">Stock</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {(reportData.worst_sellers || []).slice(0, 10).map((product) => (
                                        <tr key={product.id}>
                                            <td className="px-2 py-2 text-xs text-slate-900">{product.name?.substring(0, 30)}</td>
                                            <td className="px-2 py-2 text-xs text-red-600">{product.total_sold}</td>
                                            <td className="px-2 py-2 text-xs text-slate-600">{product.stock}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {reportData.product_conversions && reportData.product_conversions.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Product Conversion Rates</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Product</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Views</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Purchases</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Conversion %</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {reportData.product_conversions.slice(0, 20).map((product) => (
                                        <tr key={product.id}>
                                            <td className="px-4 py-3 text-sm text-slate-900">{product.name}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{product.view_count}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{product.purchase_count}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-sm font-semibold ${
                                                    product.conversion_rate > 5 ? 'text-green-600' : 
                                                    product.conversion_rate > 2 ? 'text-yellow-600' : 
                                                    'text-red-600'
                                                }`}>
                                                    {product.conversion_rate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderConversionFunnel = () => {
        if (!reportData) return <div className="text-center py-10">Loading...</div>;

        const funnelData = {
            labels: ['Visitors', 'Added to Cart', 'Started Checkout', 'Completed Purchase'],
            datasets: [{
                label: 'Users',
                data: [
                    reportData.visitors || 0,
                    reportData.added_to_cart || 0,
                    reportData.started_checkout || 0,
                    reportData.completed_purchase || 0,
                ],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
            }],
        };

        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Visitors</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">{reportData.visitors || 0}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Cart Rate</p>
                        <p className="mt-2 text-2xl font-bold text-blue-600">{reportData.visitor_to_cart_rate || 0}%</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Checkout Rate</p>
                        <p className="mt-2 text-2xl font-bold text-green-600">{reportData.cart_to_checkout_rate || 0}%</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Purchase Rate</p>
                        <p className="mt-2 text-2xl font-bold text-orange-600">{reportData.checkout_to_purchase_rate || 0}%</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Conversion Funnel</h3>
                    <div className="h-80">
                        <Bar 
                            data={funnelData} 
                            options={{ 
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                    }
                                }
                            }} 
                        />
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-500 mb-2">Drop-off: Visitors to Cart</h3>
                        <p className="text-3xl font-bold text-red-600">{reportData.drop_off_cart || 0}%</p>
                        <p className="text-xs text-slate-500 mt-1">Users who didn't add to cart</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-500 mb-2">Drop-off: Cart to Checkout</h3>
                        <p className="text-3xl font-bold text-red-600">{reportData.drop_off_checkout || 0}%</p>
                        <p className="text-xs text-slate-500 mt-1">Carts that didn't checkout</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-sm font-medium text-slate-500 mb-2">Drop-off: Checkout to Purchase</h3>
                        <p className="text-3xl font-bold text-red-600">{reportData.drop_off_purchase || 0}%</p>
                        <p className="text-xs text-slate-500 mt-1">Checkouts not completed</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Overall Conversion Rate</h3>
                    <div className="text-center py-8">
                        <p className="text-6xl font-bold text-green-600">{reportData.overall_conversion_rate || 0}%</p>
                        <p className="text-sm text-slate-500 mt-2">of visitors complete a purchase</p>
                    </div>
                </div>
            </div>
        );
    };

    const renderAbandonedCarts = () => {
        if (!reportData) return <div className="text-center py-10">Loading...</div>;

        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total Abandoned</p>
                        <p className="mt-2 text-2xl font-bold text-red-600">{reportData.total_abandoned || 0}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Recovered</p>
                        <p className="mt-2 text-2xl font-bold text-green-600">{reportData.total_recovered || 0}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Lost Value</p>
                        <p className="mt-2 text-2xl font-bold text-red-600">
                            Rp{Math.round(reportData.lost_value || 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Recovery Rate</p>
                        <p className="mt-2 text-2xl font-bold text-blue-600">{reportData.recovery_rate || 0}%</p>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Abandoned Carts</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead>
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Session</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Items</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Value</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Stage</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {(reportData.abandoned_carts || []).slice(0, 20).map((cart) => (
                                    <tr key={cart.id}>
                                        <td className="px-4 py-3 text-sm text-slate-900">{cart.session_id?.substring(0, 8)}...</td>
                                        <td className="px-4 py-3 text-sm text-slate-600">{cart.items_count}</td>
                                        <td className="px-4 py-3 text-sm text-slate-900 font-semibold">
                                            Rp{Math.round(cart.cart_value || 0).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                                {cart.abandonment_stage}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {new Date(cart.abandoned_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderRevenueAnalysis = () => {
        if (!reportData) return <div className="text-center py-10">Loading...</div>;

        const categoryData = {
            labels: (reportData.revenue_by_category || []).map(c => c.name),
            datasets: [{
                data: (reportData.revenue_by_category || []).map(c => c.total_revenue || 0),
                backgroundColor: [
                    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', 
                    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
                ],
            }],
        };

        const periodData = {
            labels: (reportData.revenue_by_period || []).map(p => p.period),
            datasets: [{
                label: 'Revenue',
                data: (reportData.revenue_by_period || []).map(p => p.revenue || 0),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                tension: 0.4,
            }],
        };

        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total Revenue</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            Rp{Math.round(reportData.total_revenue || 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Growth Rate</p>
                        <p className={`mt-2 text-2xl font-bold ${
                            (reportData.growth_rate || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            {(reportData.growth_rate || 0) >= 0 ? '+' : ''}{reportData.growth_rate || 0}%
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Previous Period</p>
                        <p className="mt-2 text-2xl font-bold text-slate-600">
                            Rp{Math.round(reportData.previous_period_revenue || 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue by Category</h3>
                        <div className="h-64 flex items-center justify-center">
                            <Doughnut data={categoryData} options={{ maintainAspectRatio: false }} />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Category Breakdown</h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {(reportData.revenue_by_category || []).map((category, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                                    <span className="text-sm text-slate-900">{category.name}</span>
                                    <span className="text-sm font-semibold text-green-600">
                                        Rp{Math.round(category.total_revenue || 0).toLocaleString('id-ID')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue Trend</h3>
                    <div className="h-80">
                        <Line 
                            data={periodData} 
                            options={{ 
                                maintainAspectRatio: false,
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                    }
                                }
                            }} 
                        />
                    </div>
                </div>
            </div>
        );
    };

    const renderCustomerSegmentation = () => {
        if (!reportData) return <div className="text-center py-10">Loading...</div>;

        const newVsReturningData = {
            labels: ['New Customers', 'Returning Customers'],
            datasets: [{
                data: [
                    reportData.new_vs_returning?.new_customers || 0,
                    reportData.new_vs_returning?.returning_customers || 0,
                ],
                backgroundColor: ['#3b82f6', '#10b981'],
            }],
        };

        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total Customers</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {reportData.segments?.total || 0}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">High Value</p>
                        <p className="mt-2 text-2xl font-bold text-green-600">
                            {reportData.segments?.high_value || 0}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Medium Value</p>
                        <p className="mt-2 text-2xl font-bold text-blue-600">
                            {reportData.segments?.medium_value || 0}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Retention Rate</p>
                        <p className="mt-2 text-2xl font-bold text-purple-600">
                            {reportData.retention?.retention_rate || 0}%
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">New vs Returning</h3>
                        <div className="h-64 flex items-center justify-center">
                            <Pie data={newVsReturningData} options={{ maintainAspectRatio: false }} />
                        </div>
                        <div className="mt-4 text-center">
                            <p className="text-sm text-slate-600">
                                New: {reportData.new_vs_returning?.new_percentage || 0}% | 
                                Returning: {reportData.new_vs_returning?.returning_percentage || 0}%
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Customer Retention</h3>
                        <div className="space-y-4 py-8">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">First Time Customers</span>
                                <span className="text-lg font-bold text-slate-900">
                                    {reportData.retention?.first_time_customers || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-600">Repeat Customers</span>
                                <span className="text-lg font-bold text-green-600">
                                    {reportData.retention?.repeat_customers || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t">
                                <span className="text-sm font-medium text-slate-700">Retention Rate</span>
                                <span className="text-2xl font-bold text-purple-600">
                                    {reportData.retention?.retention_rate || 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderMarketingPerformance = () => {
        if (!reportData) return <div className="text-center py-10">Loading...</div>;

        return (
            <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Total Referrals</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                            {reportData.referral_stats?.total_referrals || 0}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Referral Revenue</p>
                        <p className="mt-2 text-2xl font-bold text-green-600">
                            Rp{Math.round(reportData.referral_stats?.referral_revenue || 0).toLocaleString('id-ID')}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Email Campaigns</p>
                        <p className="mt-2 text-2xl font-bold text-blue-600">
                            {reportData.email_campaigns?.length || 0}
                        </p>
                    </div>
                </div>

                {reportData.promotion_usage && reportData.promotion_usage.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Promotion Performance</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Code</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Uses</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Revenue</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Discount Given</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">ROI %</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {reportData.promotion_usage.map((promo, idx) => (
                                        <tr key={idx}>
                                            <td className="px-4 py-3 text-sm font-medium text-slate-900">{promo.code}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{promo.usage_count}</td>
                                            <td className="px-4 py-3 text-sm text-green-600 font-semibold">
                                                Rp{Math.round(promo.total_revenue || 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-red-600">
                                                Rp{Math.round(promo.discount_given || 0).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                                                {promo.roi || 0}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {reportData.email_campaigns && reportData.email_campaigns.length > 0 && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Email Campaign Performance</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Campaign</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Sent</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Opened</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Open Rate</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase">Click Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {reportData.email_campaigns.map((campaign) => (
                                        <tr key={campaign.id}>
                                            <td className="px-4 py-3 text-sm text-slate-900">{campaign.subject}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{campaign.sent_count}</td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{campaign.opened_count}</td>
                                            <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                                {campaign.open_rate}%
                                            </td>
                                            <td className="px-4 py-3 text-sm font-semibold text-blue-600">
                                                {campaign.click_rate}%
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                        <p className="mt-4 text-slate-600">Loading report data...</p>
                    </div>
                </div>
            );
        }

        switch(activeTab) {
            case 'overview':
                return renderOverview();
            case 'clv':
                return renderCLVReport();
            case 'product-performance':
                return renderProductPerformance();
            case 'conversion':
                return renderConversionFunnel();
            case 'abandoned-carts':
                return renderAbandonedCarts();
            case 'revenue':
                return renderRevenueAnalysis();
            case 'segmentation':
                return renderCustomerSegmentation();
            case 'marketing':
                return renderMarketingPerformance();
            default:
                return renderOverview();
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800">Reports & Analytics</h2>
                    {activeTab !== 'overview' && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => exportReport('csv')}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                Export CSV
                            </button>
                            <button
                                onClick={() => exportReport('excel')}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Export Excel
                            </button>
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Reports & Analytics" />

            <div className="py-6">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* Tabs Navigation */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Date Range Filter */}
                    {activeTab !== 'overview' && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-wrap items-center gap-4">
                                <label className="text-sm font-medium text-slate-700">Date Range:</label>
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    className="rounded-lg border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {dateRangeOptions.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>

                                {dateRange === 'custom' && (
                                    <>
                                        <input
                                            type="date"
                                            value={customStartDate}
                                            onChange={(e) => setCustomStartDate(e.target.value)}
                                            className="rounded-lg border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="Start Date"
                                        />
                                        <span className="text-slate-500">to</span>
                                        <input
                                            type="date"
                                            value={customEndDate}
                                            onChange={(e) => setCustomEndDate(e.target.value)}
                                            className="rounded-lg border-slate-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            placeholder="End Date"
                                        />
                                    </>
                                )}

                                <button
                                    onClick={loadReportData}
                                    className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                                >
                                    Refresh Data
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    {renderContent()}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

