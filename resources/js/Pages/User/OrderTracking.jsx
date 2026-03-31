import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { TruckIcon, CheckCircleIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

const formatPrice = (v) => `Rp${Number(v).toLocaleString('id-ID')}`;

const STATUS_ICONS = {
    processing: <ClockIcon className="w-6 h-6" />,
    picked_up: <TruckIcon className="w-6 h-6" />,
    in_transit: <TruckIcon className="w-6 h-6" />,
    out_for_delivery: <TruckIcon className="w-6 h-6" />,
    delivered: <CheckCircleIcon className="w-6 h-6" />,
};

const STATUS_COLORS = {
    processing: 'bg-yellow-100 text-yellow-600',
    picked_up: 'bg-blue-100 text-blue-600',
    in_transit: 'bg-indigo-100 text-indigo-600',
    out_for_delivery: 'bg-purple-100 text-purple-600',
    delivered: 'bg-green-100 text-green-600',
};

export default function OrderTracking() {
    const [orderNumber, setOrderNumber] = useState('');
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setTracking(null);

        try {
            const res = await fetch(`/shipping/track/${orderNumber}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Gagal melacak pesanan');
                return;
            }

            setTracking(data.data);
        } catch (err) {
            setError('Terjadi kesalahan saat melacak pesanan');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Lacak Pesanan" />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">
                        Lacak Pesanan
                    </h1>

                    {/* Search Form */}
                    <form onSubmit={handleTrack} className="mb-8">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                value={orderNumber}
                                onChange={(e) => setOrderNumber(e.target.value)}
                                placeholder="Masukkan nomor pesanan (contoh: INV-GB-20260331...)"
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Melacak...' : 'Lacak Pesanan'}
                            </button>
                        </div>
                    </form>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                            {error}
                        </div>
                    )}

                    {/* Tracking Results */}
                    {tracking && (
                        <div className="space-y-6">
                            {/* Order Info */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Nomor Pesanan</p>
                                        <p className="font-semibold text-gray-900">
                                            {tracking.order.order_number}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Status</p>
                                        <p className="font-semibold text-gray-900 capitalize">
                                            {tracking.order.status}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Kurir</p>
                                        <p className="font-semibold text-gray-900">
                                            {tracking.order.courier}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Nomor Resi</p>
                                        <div className="flex items-center space-x-2">
                                            <p className="font-semibold text-gray-900">
                                                {tracking.order.tracking_number}
                                            </p>
                                            {tracking.tracking.tracking_url && (
                                                <a
                                                    href={tracking.tracking.tracking_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-700 text-sm"
                                                >
                                                    Lihat di Website Kurir →
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    {tracking.order.estimated_delivery && (
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-gray-600">Estimasi Pengiriman</p>
                                            <p className="font-semibold text-gray-900">
                                                {tracking.order.estimated_delivery}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tracking Timeline */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    Riwayat Pengiriman
                                </h2>

                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-gray-200" />

                                    <div className="space-y-6">
                                        {tracking.tracking.history?.map((event, index) => {
                                            const isLatest = index === 0;
                                            const statusColor = STATUS_COLORS[event.status] || 'bg-gray-100 text-gray-600';

                                            return (
                                                <div key={index} className="relative flex gap-4">
                                                    {/* Status Icon */}
                                                    <div
                                                        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${statusColor} ${
                                                            isLatest ? 'ring-4 ring-blue-100' : ''
                                                        }`}
                                                    >
                                                        {STATUS_ICONS[event.status] || <MapPinIcon className="w-6 h-6" />}
                                                    </div>

                                                    {/* Event Details */}
                                                    <div className="flex-1 bg-white border border-gray-200 rounded-lg p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h3 className="font-semibold text-gray-900">
                                                                {event.status_label}
                                                            </h3>
                                                            <span className="text-sm text-gray-500">
                                                                {new Date(event.timestamp).toLocaleString('id-ID')}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-600 mb-1">
                                                            {event.description}
                                                        </p>
                                                        {event.location && (
                                                            <div className="flex items-center text-sm text-gray-500 mt-2">
                                                                <MapPinIcon className="w-4 h-4 mr-1" />
                                                                {event.location}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Database Events (if available) */}
                            {tracking.events && tracking.events.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        Update dari Admin
                                    </h2>
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                        {tracking.events.map((event, index) => (
                                            <div key={index} className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {event.status_label}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {event.description}
                                                    </p>
                                                    {event.location && (
                                                        <p className="text-sm text-gray-500">
                                                            📍 {event.location}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(event.event_time).toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
