import { router } from '@inertiajs/react';
import { useState } from 'react';

export default function BulkActionsToolbar({ selectedIds, categories, onClearSelection }) {
    const [showBulkMenu, setShowBulkMenu] = useState(false);
    const [bulkAction, setBulkAction] = useState('');
    const [showActionModal, setShowActionModal] = useState(false);
    
    // Forms for bulk operations
    const [priceUpdate, setPriceUpdate] = useState({ type: 'percentage', value: 0 });
    const [stockUpdate, setStockUpdate] = useState({ type: 'add', value: 0 });
    const [categoryId, setCategoryId] = useState('');
    const [statusValue, setStatusValue] = useState(true);

    const selectedCount = selectedIds.length;

    const handleBulkAction = (action) => {
        setBulkAction(action);
        setShowBulkMenu(false);
        setShowActionModal(true);
    };

    const executeBulkAction = () => {
        if (!selectedCount) return;

        const data = { product_ids: selectedIds };

        switch (bulkAction) {
            case 'update-prices':
                data.update_type = priceUpdate.type;
                data.value = priceUpdate.value;
                router.post(route('admin.products.bulk-update-prices'), data, {
                    onSuccess: () => {
                        setShowActionModal(false);
                        onClearSelection();
                    }
                });
                break;

            case 'update-stock':
                data.update_type = stockUpdate.type;
                data.value = stockUpdate.value;
                router.post(route('admin.products.bulk-update-stock'), data, {
                    onSuccess: () => {
                        setShowActionModal(false);
                        onClearSelection();
                    }
                });
                break;

            case 'assign-category':
                data.category_id = categoryId;
                router.post(route('admin.products.bulk-assign-category'), data, {
                    onSuccess: () => {
                        setShowActionModal(false);
                        onClearSelection();
                    }
                });
                break;

            case 'toggle-status':
                data.status = statusValue;
                router.post(route('admin.products.bulk-toggle-status'), data, {
                    onSuccess: () => {
                        setShowActionModal(false);
                        onClearSelection();
                    }
                });
                break;

            case 'delete':
                if (confirm(`Are you sure you want to delete ${selectedCount} products? This action cannot be undone.`)) {
                    router.post(route('admin.products.bulk-delete'), data, {
                        onSuccess: () => {
                            setShowActionModal(false);
                            onClearSelection();
                        }
                    });
                }
                break;

            default:
                break;
        }
    };

    if (selectedCount === 0) return null;

    return (
        <>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <span className="text-blue-700 font-semibold">
                            {selectedCount} product{selectedCount > 1 ? 's' : ''} selected
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <button
                                onClick={() => setShowBulkMenu(!showBulkMenu)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
                            >
                                Bulk Actions ▼
                            </button>
                            
                            {showBulkMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                    <button
                                        onClick={() => handleBulkAction('update-prices')}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                                    >
                                        💰 Update Prices
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('update-stock')}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                                    >
                                        📦 Update Stock
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('assign-category')}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                                    >
                                        🏷️ Assign Category
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('toggle-status')}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                                    >
                                        🔄 Toggle Status
                                    </button>
                                    <button
                                        onClick={() => handleBulkAction('delete')}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <button
                            onClick={onClearSelection}
                            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium"
                        >
                            Clear Selection
                        </button>
                    </div>
                </div>
            </div>

            {/* Action Modal */}
            {showActionModal && bulkAction && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <h3 className="text-xl font-bold mb-4">
                            {bulkAction === 'update-prices' && '💰 Update Prices'}
                            {bulkAction === 'update-stock' && '📦 Update Stock'}
                            {bulkAction === 'assign-category' && '🏷️ Assign Category'}
                            {bulkAction === 'toggle-status' && '🔄 Toggle Status'}
                        </h3>

                        <div className="mb-4 text-sm text-gray-600">
                            This action will affect {selectedCount} product{selectedCount > 1 ? 's' : ''}.
                        </div>

                        {bulkAction === 'update-prices' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Update Type
                                    </label>
                                    <select
                                        value={priceUpdate.type}
                                        onChange={e => setPriceUpdate({ ...priceUpdate, type: e.target.value })}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="percentage">Percentage Change</option>
                                        <option value="fixed">Fixed Amount Change</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Value {priceUpdate.type === 'percentage' ? '(%)' : '(Rp)'}
                                    </label>
                                    <input
                                        type="number"
                                        value={priceUpdate.value}
                                        onChange={e => setPriceUpdate({ ...priceUpdate, value: parseFloat(e.target.value) })}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        placeholder={priceUpdate.type === 'percentage' ? 'e.g., 10 for +10%, -20 for -20%' : 'e.g., 10000 for +Rp10,000'}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {priceUpdate.type === 'percentage' 
                                            ? 'Use positive numbers to increase, negative to decrease' 
                                            : 'Use positive numbers to add, negative to subtract'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {bulkAction === 'update-stock' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Update Type
                                    </label>
                                    <select
                                        value={stockUpdate.type}
                                        onChange={e => setStockUpdate({ ...stockUpdate, type: e.target.value })}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="add">Add to Stock</option>
                                        <option value="subtract">Subtract from Stock</option>
                                        <option value="set">Set Absolute Value</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={stockUpdate.value}
                                        onChange={e => setStockUpdate({ ...stockUpdate, value: parseInt(e.target.value) })}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        {bulkAction === 'assign-category' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Category
                                </label>
                                <select
                                    value={categoryId}
                                    onChange={e => setCategoryId(e.target.value)}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="">Select a category...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {bulkAction === 'toggle-status' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Set Status
                                </label>
                                <select
                                    value={statusValue ? '1' : '0'}
                                    onChange={e => setStatusValue(e.target.value === '1')}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="1">Available (Enable)</option>
                                    <option value="0">Unavailable (Disable)</option>
                                </select>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                onClick={() => setShowActionModal(false)}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeBulkAction}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                            >
                                Apply
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
