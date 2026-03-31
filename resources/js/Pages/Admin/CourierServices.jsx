import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function CourierServices({ couriers }) {
    const { flash } = usePage().props;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCourier, setEditingCourier] = useState(null);

    const form = useForm({
        code: '',
        name: '',
        service_type: '',
        service_name: '',
        description: '',
        etd: '',
        supports_tracking: true,
        tracking_url_template: '',
        is_active: true,
        sort_order: 0,
    });

    const openCreateModal = () => {
        setEditingCourier(null);
        form.reset();
        setIsModalOpen(true);
    };

    const openEditModal = (courier) => {
        setEditingCourier(courier);
        form.setData({
            code: courier.code,
            name: courier.name,
            service_type: courier.service_type,
            service_name: courier.service_name,
            description: courier.description || '',
            etd: courier.etd || '',
            supports_tracking: courier.supports_tracking,
            tracking_url_template: courier.tracking_url_template || '',
            is_active: courier.is_active,
            sort_order: courier.sort_order || 0,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCourier(null);
        form.reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (editingCourier) {
            form.put(route('admin.courier-services.update', editingCourier.id), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        } else {
            form.post(route('admin.courier-services.store'), {
                preserveScroll: true,
                onSuccess: () => closeModal(),
            });
        }
    };

    const handleDelete = (courier) => {
        if (confirm(`Hapus layanan kurir ${courier.name} ${courier.service_type}?`)) {
            router.delete(route('admin.courier-services.destroy', courier.id), {
                preserveScroll: true,
            });
        }
    };

    const handleToggle = (courier) => {
        router.post(
            route('admin.courier-services.toggle', courier.id),
            {},
            { preserveScroll: true }
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title="Kelola Layanan Kurir" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Layanan Kurir
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Kelola layanan pengiriman yang tersedia
                        </p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Tambah Layanan
                    </button>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {flash.error}
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Kurir
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tipe Layanan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nama Layanan
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ETD
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tracking
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {couriers.map((courier) => (
                                <tr key={courier.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {courier.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {courier.code.toUpperCase()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {courier.service_type}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">
                                            {courier.service_name}
                                        </div>
                                        {courier.description && (
                                            <div className="text-sm text-gray-500">
                                                {courier.description}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {courier.etd ? `${courier.etd} hari` : '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {courier.supports_tracking ? (
                                            <CheckIcon className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <XMarkIcon className="w-5 h-5 text-gray-400" />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggle(courier)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                courier.is_active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}
                                        >
                                            {courier.is_active ? 'Aktif' : 'Nonaktif'}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => openEditModal(courier)}
                                            className="text-blue-600 hover:text-blue-900 mr-3"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(courier)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">
                                    {editingCourier ? 'Edit Layanan Kurir' : 'Tambah Layanan Kurir'}
                                </h2>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Kode Kurir
                                            </label>
                                            <input
                                                type="text"
                                                value={form.data.code}
                                                onChange={(e) => form.setData('code', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="jne, tiki, pos, sicepat, jnt"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Nama Kurir
                                            </label>
                                            <input
                                                type="text"
                                                value={form.data.name}
                                                onChange={(e) => form.setData('name', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="JNE, TIKI, POS Indonesia"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Tipe Layanan
                                            </label>
                                            <input
                                                type="text"
                                                value={form.data.service_type}
                                                onChange={(e) => form.setData('service_type', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="REG, YES, OKE, ONS"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                ETD (Hari)
                                            </label>
                                            <input
                                                type="text"
                                                value={form.data.etd}
                                                onChange={(e) => form.setData('etd', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="2-3, 1, 3-5"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Lengkap Layanan
                                        </label>
                                        <input
                                            type="text"
                                            value={form.data.service_name}
                                            onChange={(e) => form.setData('service_name', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="Layanan Reguler, Yakin Esok Sampai"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Deskripsi
                                        </label>
                                        <textarea
                                            value={form.data.description}
                                            onChange={(e) => form.setData('description', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            rows={2}
                                            placeholder="Deskripsi layanan"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tracking URL Template
                                        </label>
                                        <input
                                            type="text"
                                            value={form.data.tracking_url_template}
                                            onChange={(e) => form.setData('tracking_url_template', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="https://example.com/track?awb={tracking_number}"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Gunakan {'{tracking_number}'} sebagai placeholder untuk nomor resi
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="supports_tracking"
                                                checked={form.data.supports_tracking}
                                                onChange={(e) => form.setData('supports_tracking', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="supports_tracking" className="ml-2 text-sm text-gray-700">
                                                Mendukung Tracking
                                            </label>
                                        </div>

                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id="is_active"
                                                checked={form.data.is_active}
                                                onChange={(e) => form.setData('is_active', e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                                                Aktif
                                            </label>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Urutan Tampilan
                                        </label>
                                        <input
                                            type="number"
                                            value={form.data.sort_order}
                                            onChange={(e) => form.setData('sort_order', parseInt(e.target.value))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Buttons */}
                                    <div className="flex justify-end space-x-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={form.processing}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {form.processing
                                                ? 'Menyimpan...'
                                                : editingCourier
                                                ? 'Update'
                                                : 'Simpan'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
