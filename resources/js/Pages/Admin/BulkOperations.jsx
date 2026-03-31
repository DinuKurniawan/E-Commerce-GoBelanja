import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';
import useConfirm from '@/Hooks/useConfirm';

export default function BulkOperations({ categories, orderStatuses, paymentStatuses }) {
    const { flash, importResults } = usePage().props;
    const [activeTab, setActiveTab] = useState('products');
    const [importing, setImporting] = useState(false);
    const [exporting, setExporting] = useState(false);
    const fileInputRef = useRef(null);

    const exportProductsForm = useForm({
        category_id: '',
        is_available: '',
        date_from: '',
        date_to: '',
    });

    const exportOrdersForm = useForm({
        status: '',
        payment_status: '',
        date_from: '',
        date_to: '',
    });

    const handleExportProducts = () => {
        setExporting(true);
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('admin.products.export');
        
        const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        Object.keys(exportProductsForm.data).forEach(key => {
            if (exportProductsForm.data[key]) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = exportProductsForm.data[key];
                form.appendChild(input);
            }
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        setTimeout(() => setExporting(false), 2000);
    };

    const handleExportOrders = () => {
        setExporting(true);
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('admin.orders.export');
        
        const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        Object.keys(exportOrdersForm.data).forEach(key => {
            if (exportOrdersForm.data[key]) {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = exportOrdersForm.data[key];
                form.appendChild(input);
            }
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        setTimeout(() => setExporting(false), 2000);
    };

    const handleExportCustomers = () => {
        setExporting(true);
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = route('admin.customers.export');
        
        const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = csrfToken;
        form.appendChild(csrfInput);

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
        
        setTimeout(() => setExporting(false), 2000);
    };

    const handleImportFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.csv')) {
            alert('Please select a CSV file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert('File size must be less than 10MB');
            return;
        }

        setImporting(true);
        
        router.post(route('admin.products.import'), {
            file: file
        }, {
            onFinish: () => {
                setImporting(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        });
    };

    const downloadTemplate = () => {
        window.location.href = route('admin.products.import-template');
    };

    return (
        <AuthenticatedLayout>
            <Head title="Bulk Operations" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800">Bulk Operations</h2>
                        <p className="text-sm text-gray-600 mt-1">Import, export, and manage bulk operations</p>
                    </div>

                    {flash?.success && (
                        <div className="mx-6 mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                            {flash.success}
                        </div>
                    )}

                    {flash?.error && (
                        <div className="mx-6 mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                            {flash.error}
                        </div>
                    )}

                    {importResults && importResults.errors && importResults.errors.length > 0 && (
                        <div className="mx-6 mt-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded">
                            <h3 className="font-semibold mb-2">Import Errors ({importResults.errors.length}):</h3>
                            <div className="max-h-60 overflow-y-auto">
                                <ul className="list-disc list-inside text-sm space-y-1">
                                    {importResults.errors.map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`${
                                    activeTab === 'products'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Products
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`${
                                    activeTab === 'orders'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Orders
                            </button>
                            <button
                                onClick={() => setActiveTab('customers')}
                                className={`${
                                    activeTab === 'customers'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Customers
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'products' && (
                            <div className="space-y-8">
                                {/* Export Section */}
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Products</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Category
                                            </label>
                                            <select
                                                value={exportProductsForm.data.category_id}
                                                onChange={e => exportProductsForm.setData('category_id', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                <option value="">All Categories</option>
                                                {categories.map(category => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Availability
                                            </label>
                                            <select
                                                value={exportProductsForm.data.is_available}
                                                onChange={e => exportProductsForm.setData('is_available', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                <option value="">All Products</option>
                                                <option value="1">Available Only</option>
                                                <option value="0">Unavailable Only</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date From
                                            </label>
                                            <input
                                                type="date"
                                                value={exportProductsForm.data.date_from}
                                                onChange={e => exportProductsForm.setData('date_from', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date To
                                            </label>
                                            <input
                                                type="date"
                                                value={exportProductsForm.data.date_to}
                                                onChange={e => exportProductsForm.setData('date_to', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleExportProducts}
                                        disabled={exporting}
                                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-md font-medium"
                                    >
                                        {exporting ? 'Exporting...' : '📥 Export Products to CSV'}
                                    </button>
                                </div>

                                {/* Import Section */}
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Import Products</h3>
                                    
                                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                                        <h4 className="font-medium text-blue-900 mb-2">📋 Instructions:</h4>
                                        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                            <li>Download the template CSV file to see the required format</li>
                                            <li>Fill in product details (name, price, and stock are required)</li>
                                            <li>Products with existing slugs will be updated, new ones will be created</li>
                                            <li>Maximum file size: 10MB</li>
                                            <li>Supported format: CSV only</li>
                                        </ul>
                                    </div>

                                    <div className="mb-4">
                                        <button
                                            onClick={downloadTemplate}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium mr-2"
                                        >
                                            📄 Download Template
                                        </button>
                                    </div>

                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".csv"
                                            onChange={handleImportFile}
                                            className="hidden"
                                            id="import-file"
                                        />
                                        <label
                                            htmlFor="import-file"
                                            className="cursor-pointer inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium"
                                        >
                                            {importing ? (
                                                <>⏳ Importing...</>
                                            ) : (
                                                <>📤 Choose CSV File to Import</>
                                            )}
                                        </label>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Click to select a CSV file or drag and drop
                                        </p>
                                    </div>

                                    {importing && (
                                        <div className="mt-4">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '100%' }}></div>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-2 text-center">Processing import...</p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                                    <h3 className="text-lg font-semibold text-yellow-900 mb-2">ℹ️ Bulk Product Operations</h3>
                                    <p className="text-sm text-yellow-800">
                                        For bulk price updates, stock updates, and other bulk operations on existing products,
                                        please go to the <a href={route('admin.products.index')} className="font-semibold underline">Products Management</a> page
                                        and use the checkboxes to select products.
                                    </p>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Orders</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Order Status
                                            </label>
                                            <select
                                                value={exportOrdersForm.data.status}
                                                onChange={e => exportOrdersForm.setData('status', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                <option value="">All Statuses</option>
                                                {orderStatuses.map(status => (
                                                    <option key={status} value={status}>
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Payment Status
                                            </label>
                                            <select
                                                value={exportOrdersForm.data.payment_status}
                                                onChange={e => exportOrdersForm.setData('payment_status', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                <option value="">All Payment Statuses</option>
                                                {paymentStatuses.map(status => (
                                                    <option key={status} value={status}>
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date From
                                            </label>
                                            <input
                                                type="date"
                                                value={exportOrdersForm.data.date_from}
                                                onChange={e => exportOrdersForm.setData('date_from', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Date To
                                            </label>
                                            <input
                                                type="date"
                                                value={exportOrdersForm.data.date_to}
                                                onChange={e => exportOrdersForm.setData('date_to', e.target.value)}
                                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleExportOrders}
                                        disabled={exporting}
                                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-md font-medium"
                                    >
                                        {exporting ? 'Exporting...' : '📥 Export Orders to CSV'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'customers' && (
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-6 rounded-lg">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Export Customers</h3>
                                    
                                    <p className="text-sm text-gray-600 mb-4">
                                        Export all customer data including name, email, loyalty tier, total orders, and total spent.
                                    </p>

                                    <button
                                        onClick={handleExportCustomers}
                                        disabled={exporting}
                                        className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-md font-medium"
                                    >
                                        {exporting ? 'Exporting...' : '📥 Export Customers to CSV'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
