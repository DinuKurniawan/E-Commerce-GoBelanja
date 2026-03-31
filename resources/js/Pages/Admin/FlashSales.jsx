import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';
import CountdownTimer from '@/Components/CountdownTimer';

export default function FlashSales({ flashSales, products }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFlashSale, setEditingFlashSale] = useState(null);
    const [formData, setFormData] = useState({
        product_id: '',
        name: '',
        discount_percent: '',
        max_quantity: '',
        starts_at: '',
        ends_at: '',
        is_active: true,
    });
    const [errors, setErrors] = useState({});

    const openModal = (flashSale = null) => {
        if (flashSale) {
            setEditingFlashSale(flashSale);
            setFormData({
                product_id: flashSale.product.id,
                name: flashSale.name,
                discount_percent: flashSale.discount_percent,
                max_quantity: flashSale.max_quantity || '',
                starts_at: new Date(flashSale.starts_at).toISOString().slice(0, 16),
                ends_at: new Date(flashSale.ends_at).toISOString().slice(0, 16),
                is_active: flashSale.is_active,
            });
        } else {
            setEditingFlashSale(null);
            setFormData({
                product_id: '',
                name: '',
                discount_percent: '',
                max_quantity: '',
                starts_at: '',
                ends_at: '',
                is_active: true,
            });
        }
        setErrors({});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingFlashSale(null);
        setErrors({});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrors({});

        const payload = {
            ...formData,
            max_quantity: formData.max_quantity || null,
        };

        if (editingFlashSale) {
            router.put(route('admin.flash-sales.update', editingFlashSale.id), payload, {
                onSuccess: () => closeModal(),
                onError: (err) => setErrors(err),
            });
        } else {
            router.post(route('admin.flash-sales.store'), payload, {
                onSuccess: () => closeModal(),
                onError: (err) => setErrors(err),
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm('Yakin ingin menghapus flash sale ini?')) {
            router.delete(route('admin.flash-sales.destroy', id));
        }
    };

    const handleToggle = (id) => {
        router.post(route('admin.flash-sales.toggle', id));
    };

    const getStatusBadge = (flashSale) => {
        if (!flashSale.is_active) {
            return <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">Tidak Aktif</span>;
        }
        if (flashSale.status === 'upcoming') {
            return <span className="px-2 py-1 text-xs rounded-full bg-yellow-200 text-yellow-800">Akan Datang</span>;
        }
        if (flashSale.status === 'active') {
            return <span className="px-2 py-1 text-xs rounded-full bg-green-200 text-green-800">Aktif</span>;
        }
        if (flashSale.status === 'sold_out') {
            return <span className="px-2 py-1 text-xs rounded-full bg-red-200 text-red-800">Habis</span>;
        }
        if (flashSale.status === 'ended') {
            return <span className="px-2 py-1 text-xs rounded-full bg-gray-200 text-gray-700">Berakhir</span>;
        }
        return null;
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">Kelola Flash Sale</h2>
                    <button
                        onClick={() => openModal()}
                        className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        + Tambah Flash Sale
                    </button>
                </div>
            }
        >
            <Head title="Kelola Flash Sale" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3">Produk</th>
                                            <th className="px-4 py-3">Nama</th>
                                            <th className="px-4 py-3">Diskon</th>
                                            <th className="px-4 py-3">Harga Flash</th>
                                            <th className="px-4 py-3">Terjual</th>
                                            <th className="px-4 py-3">Waktu</th>
                                            <th className="px-4 py-3">Status</th>
                                            <th className="px-4 py-3">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {flashSales.map((flashSale) => (
                                            <tr key={flashSale.id} className="border-b hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl">{flashSale.product.emoji}</span>
                                                        <span>{flashSale.product.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">{flashSale.name}</td>
                                                <td className="px-4 py-3">
                                                    <span className="font-semibold text-red-600">
                                                        {flashSale.discount_percent}%
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs line-through text-gray-500">
                                                            Rp {Number(flashSale.product.price).toLocaleString('id-ID')}
                                                        </span>
                                                        <span className="font-semibold text-green-600">
                                                            Rp {Number(flashSale.flash_price).toLocaleString('id-ID')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm">
                                                            {flashSale.sold_quantity} / {flashSale.max_quantity || '∞'}
                                                        </span>
                                                        {flashSale.max_quantity && (
                                                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                                                <div
                                                                    className="bg-blue-600 h-2 rounded-full"
                                                                    style={{ width: `${flashSale.progress_percent}%` }}
                                                                ></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {flashSale.status === 'active' && (
                                                        <CountdownTimer endsAt={flashSale.ends_at} />
                                                    )}
                                                    {flashSale.status === 'upcoming' && (
                                                        <span className="text-xs text-gray-600">
                                                            Mulai: {new Date(flashSale.starts_at).toLocaleString('id-ID')}
                                                        </span>
                                                    )}
                                                    {flashSale.status === 'ended' && (
                                                        <span className="text-xs text-gray-600">Berakhir</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">{getStatusBadge(flashSale)}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleToggle(flashSale.id)}
                                                            className={`px-3 py-1 text-xs rounded ${
                                                                flashSale.is_active
                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                    : 'bg-green-100 text-green-700'
                                                            }`}
                                                        >
                                                            {flashSale.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                        </button>
                                                        <button
                                                            onClick={() => openModal(flashSale)}
                                                            className="px-3 py-1 text-xs text-blue-700 bg-blue-100 rounded"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(flashSale.id)}
                                                            className="px-3 py-1 text-xs text-red-700 bg-red-100 rounded"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                    <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-semibold">
                                {editingFlashSale ? 'Edit Flash Sale' : 'Tambah Flash Sale'}
                            </h3>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block mb-1 text-sm font-medium">Produk</label>
                                <select
                                    value={formData.product_id}
                                    onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                                    className="w-full rounded-lg border-gray-300"
                                    required
                                >
                                    <option value="">Pilih Produk</option>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.emoji} {product.name} - Rp {Number(product.price).toLocaleString('id-ID')}
                                        </option>
                                    ))}
                                </select>
                                {errors.product_id && <p className="text-xs text-red-600 mt-1">{errors.product_id}</p>}
                            </div>

                            <div>
                                <label className="block mb-1 text-sm font-medium">Nama Flash Sale</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full rounded-lg border-gray-300"
                                    placeholder="Contoh: Flash Sale Akhir Tahun"
                                    required
                                />
                                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium">Diskon (%)</label>
                                    <input
                                        type="number"
                                        value={formData.discount_percent}
                                        onChange={(e) => setFormData({ ...formData, discount_percent: e.target.value })}
                                        className="w-full rounded-lg border-gray-300"
                                        min="1"
                                        max="99"
                                        step="0.01"
                                        required
                                    />
                                    {errors.discount_percent && (
                                        <p className="text-xs text-red-600 mt-1">{errors.discount_percent}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium">Kuantitas Maksimal (Opsional)</label>
                                    <input
                                        type="number"
                                        value={formData.max_quantity}
                                        onChange={(e) => setFormData({ ...formData, max_quantity: e.target.value })}
                                        className="w-full rounded-lg border-gray-300"
                                        min="1"
                                        placeholder="Kosongkan untuk unlimited"
                                    />
                                    {errors.max_quantity && (
                                        <p className="text-xs text-red-600 mt-1">{errors.max_quantity}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1 text-sm font-medium">Waktu Mulai</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.starts_at}
                                        onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                                        className="w-full rounded-lg border-gray-300"
                                        required
                                    />
                                    {errors.starts_at && <p className="text-xs text-red-600 mt-1">{errors.starts_at}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1 text-sm font-medium">Waktu Berakhir</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.ends_at}
                                        onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                                        className="w-full rounded-lg border-gray-300"
                                        required
                                    />
                                    {errors.ends_at && <p className="text-xs text-red-600 mt-1">{errors.ends_at}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="rounded border-gray-300"
                                />
                                <label className="text-sm font-medium">Aktifkan Flash Sale</label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    {editingFlashSale ? 'Perbarui' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
