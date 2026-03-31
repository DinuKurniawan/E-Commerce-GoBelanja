import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function PreOrders({ preOrders }) {
    const [selectedPreOrder, setSelectedPreOrder] = useState(null);
    const [loading, setLoading] = useState(false);

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        ready: 'bg-green-100 text-green-800',
        completed: 'bg-gray-100 text-gray-800',
        cancelled: 'bg-red-100 text-red-800',
    };

    const handleCancel = async (preOrderId) => {
        if (!confirm('Are you sure you want to cancel this pre-order?')) return;

        setLoading(true);
        try {
            await axios.post(route('user.pre-orders.cancel', preOrderId));
            window.location.reload();
        } catch (error) {
            alert('Failed to cancel pre-order');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = async (preOrderId) => {
        if (!confirm('Complete this pre-order and pay the remaining amount?')) return;

        setLoading(true);
        try {
            const response = await axios.post(route('user.pre-orders.complete', preOrderId));
            alert('Pre-order completed! Order ID: ' + response.data.order_id);
            window.location.reload();
        } catch (error) {
            alert('Failed to complete pre-order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-slate-800">
                    My Pre-Orders
                </h2>
            }
        >
            <Head title="My Pre-Orders" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        {preOrders.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-gray-500">You have no pre-orders.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Product
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Variant
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Quantity
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Deposit Paid
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                                Remaining
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
                                        {preOrders.map((preOrder) => (
                                            <tr key={preOrder.id}>
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
                                                    {preOrder.color && (
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="h-4 w-4 rounded-full border"
                                                                style={{ backgroundColor: preOrder.color.hex }}
                                                            />
                                                            <span>{preOrder.color.name}</span>
                                                        </div>
                                                    )}
                                                    {preOrder.size && <div>Size: {preOrder.size}</div>}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {preOrder.quantity}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    Rp {preOrder.deposit_amount.toLocaleString()}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    Rp {preOrder.remaining_amount.toLocaleString()}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[preOrder.status]}`}>
                                                        {preOrder.status}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                                    {preOrder.estimated_arrival_date || 'TBA'}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
                                                    {preOrder.status === 'pending' || preOrder.status === 'confirmed' ? (
                                                        <button
                                                            onClick={() => handleCancel(preOrder.id)}
                                                            disabled={loading}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Cancel
                                                        </button>
                                                    ) : preOrder.status === 'ready' ? (
                                                        <button
                                                            onClick={() => handleComplete(preOrder.id)}
                                                            disabled={loading}
                                                            className="text-green-600 hover:text-green-900"
                                                        >
                                                            Complete Order
                                                        </button>
                                                    ) : null}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
