import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function InventoryIndex({ auth, products, statistics, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'name');
    const [sortOrder, setSortOrder] = useState(filters.sort_order || 'asc');
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.inventory.index'), {
            search,
            status,
            sort_by: sortBy,
            sort_order: sortOrder,
        }, { preserveState: true });
    };

    const handleFilter = (newStatus) => {
        setStatus(newStatus);
        router.get(route('admin.inventory.index'), {
            search,
            status: newStatus,
            sort_by: sortBy,
            sort_order: sortOrder,
        }, { preserveState: true });
    };

    const handleSort = (field) => {
        const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(field);
        setSortOrder(newOrder);
        router.get(route('admin.inventory.index'), {
            search,
            status,
            sort_by: field,
            sort_order: newOrder,
        }, { preserveState: true });
    };

    const getStockBadge = (product) => {
        if (product.stock_status === 'out') {
            return <span className="px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded-full">Out of Stock</span>;
        } else if (product.stock_status === 'low') {
            return <span className="px-2 py-1 text-xs font-semibold text-white bg-yellow-600 rounded-full">Low Stock</span>;
        } else {
            return <span className="px-2 py-1 text-xs font-semibold text-white bg-green-600 rounded-full">In Stock</span>;
        }
    };

    const getStockRowClass = (product) => {
        if (product.stock_status === 'out') return 'bg-red-50';
        if (product.stock_status === 'low') return 'bg-yellow-50';
        return '';
    };

    const openRestockModal = (product) => {
        setCurrentProduct(product);
        setShowRestockModal(true);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Inventory Management" />

            <div className="py-12">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                        <p className="mt-2 text-gray-600">Monitor and manage product stock levels</p>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
                        <StatCard
                            title="Total Products"
                            value={statistics.total_products}
                            icon="📦"
                            color="blue"
                        />
                        <StatCard
                            title="In Stock"
                            value={statistics.in_stock}
                            icon="✅"
                            color="green"
                        />
                        <StatCard
                            title="Low Stock"
                            value={statistics.low_stock}
                            icon="⚠️"
                            color="yellow"
                            link={route('admin.inventory.low-stock')}
                        />
                        <StatCard
                            title="Out of Stock"
                            value={statistics.out_of_stock}
                            icon="🚫"
                            color="red"
                        />
                    </div>

                    {/* Filters */}
                    <div className="p-6 mb-6 bg-white rounded-lg shadow">
                        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
                            <div className="flex-1 min-w-[200px]">
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                type="submit"
                                className="px-6 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                Search
                            </button>
                        </form>

                        {/* Status Filters */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            <button
                                onClick={() => handleFilter('')}
                                className={`px-4 py-2 rounded-lg transition ${
                                    status === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => handleFilter('in_stock')}
                                className={`px-4 py-2 rounded-lg transition ${
                                    status === 'in_stock' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                In Stock
                            </button>
                            <button
                                onClick={() => handleFilter('low_stock')}
                                className={`px-4 py-2 rounded-lg transition ${
                                    status === 'low_stock' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Low Stock
                            </button>
                            <button
                                onClick={() => handleFilter('out_of_stock')}
                                className={`px-4 py-2 rounded-lg transition ${
                                    status === 'out_of_stock' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Out of Stock
                            </button>
                        </div>
                    </div>

                    {/* Products Table */}
                    <div className="overflow-hidden bg-white rounded-lg shadow">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                            Product
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                            Category
                                        </th>
                                        <th
                                            className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleSort('stock')}
                                        >
                                            Current Stock {sortBy === 'stock' && (sortOrder === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                            Threshold
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-gray-500 uppercase">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {products.data.map((product) => (
                                        <tr key={product.id} className={getStockRowClass(product)}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 w-10 h-10 text-2xl">
                                                        {product.emoji || '📦'}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {product.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{product.category?.name || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-gray-900">{product.stock}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{product.low_stock_threshold}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStockBadge(product)}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                                <button
                                                    onClick={() => openRestockModal(product)}
                                                    className="mr-3 text-blue-600 hover:text-blue-900"
                                                >
                                                    Restock
                                                </button>
                                                <a
                                                    href={route('admin.inventory.history', product.id)}
                                                    className="text-green-600 hover:text-green-900"
                                                >
                                                    History
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {products.links && products.links.length > 3 && (
                            <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
                                <div className="flex justify-between flex-1 sm:hidden">
                                    {products.prev_page_url && (
                                        <a
                                            href={products.prev_page_url}
                                            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Previous
                                        </a>
                                    )}
                                    {products.next_page_url && (
                                        <a
                                            href={products.next_page_url}
                                            className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                        >
                                            Next
                                        </a>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{products.from}</span> to{' '}
                                            <span className="font-medium">{products.to}</span> of{' '}
                                            <span className="font-medium">{products.total}</span> results
                                        </p>
                                    </div>
                                    <div>
                                        <nav className="inline-flex -space-x-px rounded-md shadow-sm">
                                            {products.links.map((link, index) => (
                                                <a
                                                    key={index}
                                                    href={link.url}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                                                        link.active
                                                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    } border ${index === 0 ? 'rounded-l-md' : ''} ${
                                                        index === products.links.length - 1 ? 'rounded-r-md' : ''
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Restock Modal */}
            {showRestockModal && currentProduct && (
                <RestockModal
                    product={currentProduct}
                    onClose={() => {
                        setShowRestockModal(false);
                        setCurrentProduct(null);
                    }}
                />
            )}
        </AuthenticatedLayout>
    );
}

function StatCard({ title, value, icon, color, link }) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        red: 'bg-red-50 text-red-600',
    };

    const content = (
        <>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`p-3 rounded-full text-3xl ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
        </>
    );

    if (link) {
        return (
            <a href={link} className="block p-6 transition bg-white rounded-lg shadow hover:shadow-lg">
                {content}
            </a>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            {content}
        </div>
    );
}

function RestockModal({ product, onClose }) {
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [processing, setProcessing] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        router.post(
            route('admin.inventory.restock', product.id),
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
                <h2 className="mb-4 text-2xl font-bold">Restock Product</h2>
                <p className="mb-4 text-gray-600">
                    {product.emoji} <span className="font-medium">{product.name}</span>
                </p>
                <p className="mb-4 text-sm text-gray-500">
                    Current Stock: <span className="font-bold">{product.stock}</span> units
                </p>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Quantity to Add <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter quantity"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium text-gray-700">
                            Reason (Optional)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows="3"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g., New stock arrival from supplier"
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
                            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Processing...' : 'Restock'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
