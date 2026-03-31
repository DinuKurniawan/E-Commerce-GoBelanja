import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function PreOrders({ preOrders, filters }) {
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        ready: 'bg-green-100 text-green-800',
        completed: 'bg-gray-100 text-gray-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    const handleStatusFilter = (status) => {
        setSelectedStatus(status);
        router.get(route('admin.pre-orders.index'), { status }, { preserveState: true });
    };

    const handleUpdateStatus = async (preOrderId, newStatus) => {
        if (!confirm(`Update pre-order status to ${newStatus}?`)) return;

        try {
            await axios.put(route('admin.pre-orders.status', preOrderId), {
                status: newStatus,
            });
            window.location.reload();
        } catch (error) {
            alert('Failed to update status');
        }
    };

    const handleNotify = async (preOrderId) => {
        if (!confirm('Notify customer that product is available?')) return;

        try {
            await axios.post(route('admin.pre-orders.notify', preOrderId));
            alert('Customer notified successfully');
            window.location.reload();
        } catch (error) {
            alert('Failed to notify customer');
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-slate-800">
                    Pre-Order Management
                </h2>
            }
        >
            <Head title="Pre-Order Management" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {/* Status Filter */}
                    <div className="mb-6 flex gap-2">
                        {['all', 'pending', 'confirmed', 'ready', 'completed', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => handleStatusFilter(status)}
                                className={`rounded-lg px-4 py-2 text-sm font-medium ${
                                    selectedStatus === status
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        {preOrders.data.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-500">No pre-orders found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Customer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Product
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Variant
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Qty
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Deposit
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Est. Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {preOrders.data.map((preOrder) => (
                                            <tr key={preOrder.id}>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {preOrder.user.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {preOrder.user.email}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <div className="flex items-center">
                                                        <img
                                                            src={preOrder.product.image}
                                                            alt={preOrder.product.name}
                                                            className="h-10 w-10 rounded object-cover"
                                                        />
                                                        <span className="ml-3 text-sm font-medium text-gray-900">
                                                            {preOrder.product.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {preOrder.color && <div>Color: {preOrder.color}</div>}
                                                    {preOrder.size && <div>Size: {preOrder.size}</div>}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {preOrder.quantity}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    Rp {preOrder.deposit_amount.toLocaleString()}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <select
                                                        value={preOrder.status}
                                                        onChange={(e) => handleUpdateStatus(preOrder.id, e.target.value)}
                                                        className={`rounded-full px-2 py-1 text-xs font-semibold ${statusColors[preOrder.status]}`}
                                                    >
                                                        <option value="pending">Pending</option>
                                                        <option value="confirmed">Confirmed</option>
                                                        <option value="ready">Ready</option>
                                                        <option value="completed">Completed</option>
                                                        <option value="cancelled">Cancelled</option>
                                                    </select>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {preOrder.estimated_arrival_date || 'TBA'}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                    {(preOrder.status === 'pending' || preOrder.status === 'confirmed') && !preOrder.notified_at && (
                                                        <button
                                                            onClick={() => handleNotify(preOrder.id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            Notify
                                                        </button>
                                                    )}
                                                    {preOrder.notified_at && (
                                                        <span className="text-xs text-gray-500">
                                                            Notified: {preOrder.notified_at}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Pagination */}
                        {preOrders.links && (
                            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                                <div className="flex flex-1 justify-between sm:hidden">
                                    {preOrders.prev_page_url && (
                                        <a
                                            href={preOrders.prev_page_url}
                                            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Previous
                                        </a>
                                    )}
                                    {preOrders.next_page_url && (
                                        <a
                                            href={preOrders.next_page_url}
                                            className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                        >
                                            Next
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
