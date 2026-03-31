import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function LowStock({ auth, lowStockProducts, outOfStockProducts }) {
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);

    const openRestockModal = (product) => {
        setCurrentProduct(product);
        setShowRestockModal(true);
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Low Stock Alert" />

            <div className="py-12">
                <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Low Stock Alert</h1>
                            <p className="mt-2 text-gray-600">Products that need immediate attention</p>
                        </div>
                        <a
                            href={route('admin.inventory.index')}
                            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                        >
                            ← Back to Inventory
                        </a>
                    </div>

                    {/* Out of Stock Section */}
                    {outOfStockProducts.length > 0 && (
                        <div className="p-6 mb-8 bg-white rounded-lg shadow">
                            <div className="flex items-center mb-4">
                                <span className="mr-3 text-3xl">🚫</span>
                                <h2 className="text-2xl font-bold text-red-600">
                                    Out of Stock ({outOfStockProducts.length})
                                </h2>
                            </div>
                            <p className="mb-6 text-gray-600">
                                These products are completely out of stock and unavailable for purchase.
                            </p>

                            <div className="overflow-hidden border border-red-200 rounded-lg">
                                <table className="min-w-full divide-y divide-red-200">
                                    <thead className="bg-red-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-red-800 uppercase">
                                                Product
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-red-800 uppercase">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-red-800 uppercase">
                                                Stock
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-red-800 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-red-100">
                                        {outOfStockProducts.map((product) => (
                                            <tr key={product.id} className="bg-red-50">
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
                                                    <span className="px-2 py-1 text-xs font-bold text-white bg-red-600 rounded-full">
                                                        0 units
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                                                    <button
                                                        onClick={() => openRestockModal(product)}
                                                        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                                    >
                                                        Restock Now
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Low Stock Section */}
                    {lowStockProducts.length > 0 && (
                        <div className="p-6 bg-white rounded-lg shadow">
                            <div className="flex items-center mb-4">
                                <span className="mr-3 text-3xl">⚠️</span>
                                <h2 className="text-2xl font-bold text-yellow-600">
                                    Low Stock ({lowStockProducts.length})
                                </h2>
                            </div>
                            <p className="mb-6 text-gray-600">
                                These products are running low and should be restocked soon.
                            </p>

                            <div className="overflow-hidden border border-yellow-200 rounded-lg">
                                <table className="min-w-full divide-y divide-yellow-200">
                                    <thead className="bg-yellow-50">
                                        <tr>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-yellow-800 uppercase">
                                                Product
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-yellow-800 uppercase">
                                                Category
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-yellow-800 uppercase">
                                                Current Stock
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-yellow-800 uppercase">
                                                Threshold
                                            </th>
                                            <th className="px-6 py-3 text-xs font-medium tracking-wider text-right text-yellow-800 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-yellow-100">
                                        {lowStockProducts.map((product) => (
                                            <tr key={product.id} className="bg-yellow-50">
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
                                                    <span className="px-2 py-1 text-xs font-bold text-yellow-900 bg-yellow-200 rounded-full">
                                                        {product.stock} units
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{product.low_stock_threshold} units</div>
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
                        </div>
                    )}

                    {/* No Issues */}
                    {lowStockProducts.length === 0 && outOfStockProducts.length === 0 && (
                        <div className="p-12 text-center bg-white rounded-lg shadow">
                            <div className="mb-4 text-6xl">✅</div>
                            <h2 className="mb-2 text-2xl font-bold text-gray-900">All Stock Levels Look Good!</h2>
                            <p className="text-gray-600">No products are currently low or out of stock.</p>
                            <a
                                href={route('admin.inventory.index')}
                                className="inline-block px-6 py-3 mt-6 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                                View Full Inventory
                            </a>
                        </div>
                    )}
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
