import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState, useRef } from 'react';

export default function Banners({ banners }) {
    const { flash } = usePage().props;
    const bannerList = banners ?? [];

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        title: '',
        subtitle: '',
        link: '',
        target_blank: false,
        is_active: true,
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [processing, setProcessing] = useState(false);
    const fileRef = useRef(null);

    const resetForm = () => {
        setForm({ title: '', subtitle: '', link: '', target_blank: false, is_active: true });
        setImageFile(null);
        setImagePreview(null);
        setEditingId(null);
        setShowForm(false);
        if (fileRef.current) fileRef.current.value = '';
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const startEdit = (banner) => {
        setEditingId(banner.id);
        setForm({
            title: banner.title,
            subtitle: banner.subtitle || '',
            link: banner.link || '',
            target_blank: !!banner.target_blank,
            is_active: !!banner.is_active,
        });
        setImagePreview(`/storage/${banner.image}`);
        setImageFile(null);
        setShowForm(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setProcessing(true);

        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('subtitle', form.subtitle);
        formData.append('link', form.link);
        formData.append('target_blank', form.target_blank ? 1 : 0);
        formData.append('is_active', form.is_active ? 1 : 0);

        if (imageFile) {
            formData.append('image', imageFile);
        }

        if (editingId) {
            formData.append('_method', 'POST');
            router.post(route('admin.banners.update', editingId), formData, {
                onSuccess: () => { resetForm(); setProcessing(false); },
                onError: () => setProcessing(false),
            });
        } else {
            router.post(route('admin.banners.store'), formData, {
                onSuccess: () => { resetForm(); setProcessing(false); },
                onError: () => setProcessing(false),
            });
        }
    };

    const handleDelete = (id) => {
        if (!confirm('Hapus banner ini?')) return;
        router.delete(route('admin.banners.destroy', id), { preserveScroll: true });
    };

    const handleToggle = (id) => {
        router.patch(route('admin.banners.toggle', id), {}, { preserveScroll: true });
    };

    const moveUp = (index) => {
        if (index === 0) return;
        const ids = bannerList.map((b) => b.id);
        [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
        router.post(route('admin.banners.reorder'), { ids }, { preserveScroll: true });
    };

    const moveDown = (index) => {
        if (index === bannerList.length - 1) return;
        const ids = bannerList.map((b) => b.id);
        [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
        router.post(route('admin.banners.reorder'), { ids }, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Kelola Banner" />

            <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
                {flash?.success && (
                    <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
                        ✅ {flash.success}
                    </div>
                )}

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">🖼️ Kelola Banner Carousel</h1>
                    <button
                        onClick={() => { resetForm(); setShowForm(!showForm); }}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition"
                    >
                        {showForm ? '✕ Tutup' : '+ Tambah Banner'}
                    </button>
                </div>

                {/* Form */}
                {showForm && (
                    <form onSubmit={handleSubmit} className="mb-8 rounded-xl border bg-white p-6 shadow-sm space-y-4">
                        <h3 className="text-lg font-semibold text-gray-700">
                            {editingId ? 'Edit Banner' : 'Tambah Banner Baru'}
                        </h3>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Judul *</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Subtitle</label>
                                <input
                                    type="text"
                                    value={form.subtitle}
                                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Gambar {editingId ? '(kosongkan jika tidak ganti)' : '*'}
                                </label>
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                                    required={!editingId}
                                />
                                {imagePreview && (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="mt-2 h-32 w-full rounded-lg object-cover border"
                                    />
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">Link (URL tujuan)</label>
                                <input
                                    type="text"
                                    value={form.link}
                                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                                    placeholder="https://... atau /produk/..."
                                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <div className="mt-2 flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="target_blank"
                                        checked={form.target_blank}
                                        onChange={(e) => setForm({ ...form, target_blank: e.target.checked })}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="target_blank" className="text-sm text-gray-600">Buka di tab baru</label>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={form.is_active}
                                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="is_active" className="text-sm text-gray-600">Aktif (tampil di homepage)</label>
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition"
                            >
                                {processing ? 'Menyimpan...' : editingId ? 'Update Banner' : 'Simpan Banner'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-lg border px-5 py-2 text-sm text-gray-600 hover:bg-gray-50 transition"
                            >
                                Batal
                            </button>
                        </div>
                    </form>
                )}

                {/* Banner List */}
                {bannerList.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                        <p className="text-gray-400 text-lg">Belum ada banner.</p>
                        <p className="text-gray-400 text-sm mt-1">Klik "Tambah Banner" untuk menambahkan.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {bannerList.map((banner, index) => (
                            <div
                                key={banner.id}
                                className={`flex items-center gap-4 rounded-xl border p-4 bg-white shadow-sm transition ${
                                    !banner.is_active ? 'opacity-50' : ''
                                }`}
                            >
                                {/* Sort controls */}
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => moveUp(index)}
                                        disabled={index === 0}
                                        className="rounded p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 transition"
                                        title="Pindah ke atas"
                                    >
                                        ▲
                                    </button>
                                    <span className="text-center text-xs text-gray-400 font-mono">{index + 1}</span>
                                    <button
                                        onClick={() => moveDown(index)}
                                        disabled={index === bannerList.length - 1}
                                        className="rounded p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 transition"
                                        title="Pindah ke bawah"
                                    >
                                        ▼
                                    </button>
                                </div>

                                {/* Image */}
                                <img
                                    src={`/storage/${banner.image}`}
                                    alt={banner.title}
                                    className="h-20 w-36 rounded-lg object-cover border flex-shrink-0"
                                />

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-gray-800 truncate">{banner.title}</h3>
                                    {banner.subtitle && (
                                        <p className="text-sm text-gray-500 truncate">{banner.subtitle}</p>
                                    )}
                                    {banner.link && (
                                        <p className="text-xs text-indigo-500 truncate mt-1">🔗 {banner.link}</p>
                                    )}
                                </div>

                                {/* Status Badge */}
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    banner.is_active
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-500'
                                }`}>
                                    {banner.is_active ? 'Aktif' : 'Nonaktif'}
                                </span>

                                {/* Actions */}
                                <div className="flex gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleToggle(banner.id)}
                                        className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition"
                                        title={banner.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                    >
                                        {banner.is_active ? '🔴 Off' : '🟢 On'}
                                    </button>
                                    <button
                                        onClick={() => startEdit(banner)}
                                        className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition"
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(banner.id)}
                                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition"
                                    >
                                        🗑️ Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
