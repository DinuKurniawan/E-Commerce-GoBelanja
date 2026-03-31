import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function StockHistory({ auth, product, history, filters, types }) {
    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [fromDate, setFromDate] = useState(filters.from_date || '');
    const [toDate, setToDate] = useState(filters.to_date || '');
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [showDamagedModal, setShowDamagedModal] = useState(false);

    const handleFilter = () => {
        router.get(
            route('admin.inventory.history', product.id),
            { type: typeFilter, from_date: fromDate, to_date: toDate },
            { preserveState: true }
        );
    };

    const clearFilters = () => {
        setTypeFilter('');
        setFromDate('');
        setToDate('');
        router.get(route('admin.inventory.history', product.id));
    };

    const getTypeBadge = (type) => {
        const badges = {
            sale: 'bg-blue-100 text-blue-800',
            restock: 'bg-green-100 text-green-800',
            adjustment: 'bg-purple-100 text-purple-800',
            return: 'bg-yellow-100 text-yellow-800',
            damaged: 'bg-red-100 text-red-800',
        };

        const icons = {
            sale: '🛒',
            restock: '📦',
            adjustment: '⚙️',
            return: '↩️',
            damaged: '❌',
        };

        return (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${badges[type] || 'bg-gray-100 text-gray-800'}`}>
                {icons[type]} {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
        );
    };

    const formatQuantityChange = (change) => {
        if (change > 0) {
            return <span className="font-bold text-green-600">+{change}</span>;
        }
        return <span className="font-bold text-red-600">{change}</span>;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={`Stock History - ${product.name}`} />

            <div className="py-12">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Stock History</h1>
                            <p className="mt-2 text-gray-600">
                                {product.emoji} <span className="font-medium">{product.name}</span>
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <a
                                href={route('admin.inventory.export-history', product.id)}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                📥 Export CSV
                            </a>
                            <a
                                href={route('admin.inventory.index')}
                                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                ← Back to Inventory
                            </a>
                        </div>
                    </div>

                    {/* Product Info Card */}
                    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
                        <div className="p-6 bg-white rounded-lg shadow">
                            <p className="text-sm text-gray-600">Current Stock</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{product.stock}</p>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow">
                            <p className="text-sm text-gray-600">Low Stock Threshold</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900">{product.low_stock_threshold}</p>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow">
                            <p className="text-sm text-gray-600">Category</p>
                            <p className="mt-2 text-xl font-bold text-gray-900">{product.category?.name || 'N/A'}</p>
                        </div>
                        <div className="p-6 bg-white rounded-lg shadow">
                            <p className="text-sm text-gray-600">Last Restocked</p>
                            <p className="mt-2 text-sm font-bold text-gray-900">
                                {product.last_restocked_at
                                    ? new Date(product.last_restocked_at).toLocaleDateString()
                                    : 'Never'}
                            </p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-3 mb-6">
                        <button
                            onClick={() => setShowAdjustModal(true)}
                            className="px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                        >
                            ⚙️ Adjust Stock
                        </button>
                        <button
                            onClick={() => setShowDamagedModal(true)}
                            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                        >
                            ❌ Mark Damaged
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="p-6 mb-6 bg-white rounded-lg shadow">
                        <h3 className="mb-4 text-lg font-semibold">Filters</h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">Type</label>
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">All Types</option>
                                    {types.map((type) => (
                                        <option key={type} value={type}>
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">From Date</label>
                                <input
                                    type="date"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-700">To Date</label>
                                <input
                                    type="date"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-end gap-2">
                                <button
                                    onClick={handleFilter}
                                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Apply
                                </button>
                                <button
                                    onClick={clearFilters}
                                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="overflow-hidden bg-white rounded-lg shadow">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                                            Change
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                                            Before
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase">
                                            After
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                            Reason / Details
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                            User
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {history.data.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                {new Date(record.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getTypeBadge(record.type)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center whitespace-nowrap">
                                                {formatQuantityChange(record.quantity_change)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-center text-gray-900 whitespace-nowrap">
                                                {record.quantity_before}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-center text-gray-900 whitespace-nowrap">
                                                {record.quantity_after}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {record.reason || '-'}
                                                {record.order_id && (
                                                    <div className="mt-1 text-xs text-blue-600">
                                                        Order #{record.order_id.toString().padStart(6, '0')}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900 whitespace-nowrap">
                                                {record.user?.name || 'System'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {history.data.length === 0 && (
                            <div className="py-12 text-center">
                                <p className="mb-2 text-gray-500">No stock history found</p>
                                <p className="text-sm text-gray-400">Try adjusting your filters</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {history.links && history.links.length > 3 && (
                            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
                                <div className="flex justify-between flex-1 sm:hidden">
                                    {history.prev_page_url && (
                                        <a
                                            href={history.prev_page_url}
                                            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Previous
                                        </a>
                                    )}
                                    {history.next_page_url && (
                                        <a
                                            href={history.next_page_url}
                                            className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Next
                                        </a>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{history.from}</span> to{' '}
                                            <span className="font-medium">{history.to}</span> of{' '}
                                            <span className="font-medium">{history.total}</span> results
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Adjust Stock Modal */}
            {showAdjustModal && (
                <AdjustStockModal
                    product={product}
                    onClose={() => setShowAdjustModal(false)}
                />
            )}

            {/* Damaged Stock Modal */}
            {showDamagedModal && (
                <DamagedStockModal
                    product={product}
                    onClose={() => setShowDamagedModal(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}

function AdjustStockModal({ product, onClose }) {
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.post(
            route('admin.inventory.adjust', product.id),
            { quantity: parseInt(quantity), reason },
            {
                onSuccess: () => {
                    onClose();
                },
                onError: () => {
                    setProcessing(false);
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
                <h2 className="mb-4 text-2xl font-bold">Adjust Stock</h2>
                <p className="mb-4 text-gray-600">
                    {product.emoji} <span className="font-medium">{product.name}</span>
                </p>
                <p className="mb-4 text-sm text-gray-500">
                    Current Stock: <span className="font-bold">{product.stock}</span> units
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Adjustment Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter positive or negative number"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            Use positive numbers to add stock, negative to reduce stock
                        </p>
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Inventory audit correction"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                            {processing ? 'Processing...' : 'Adjust Stock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DamagedStockModal({ product, onClose }) {
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.post(
            route('admin.inventory.damaged', product.id),
            { quantity: parseInt(quantity), reason },
            {
                onSuccess: () => {
                    onClose();
                },
                onError: () => {
                    setProcessing(false);
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
                <h2 className="mb-4 text-2xl font-bold">Mark Damaged Items</h2>
                <p className="mb-4 text-gray-600">
                    {product.emoji} <span className="font-medium">{product.name}</span>
                </p>
                <p className="mb-4 text-sm text-gray-500">
                    Current Stock: <span className="font-bold">{product.stock}</span> units
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Damaged Quantity <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            max={product.stock}
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter quantity"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Reason <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., Water damage during storage"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={processing}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                            {processing ? 'Processing...' : 'Mark Damaged'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
