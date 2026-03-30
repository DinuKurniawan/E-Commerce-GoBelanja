import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const EMOJI_OPTIONS = ['🛒', '👗', '👟', '💻', '📱', '🎮', '🍔', '🏠', '💄', '📚', '⌚', '🎒', '🧴', '🌿', '🎵', '🏋️', '🧸', '🛋️', '✈️', '🐾'];

export default function Categories({ categories }) {
    const { errors, flash } = usePage().props;

    const [showForm, setShowForm] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [form, setForm] = useState({ name: '', icon: '' });
    const [loading, setLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(null);

    function openCreate() {
        setEditTarget(null);
        setForm({ name: '', icon: '🛒' });
        setShowForm(true);
    }

    function openEdit(cat) {
        setEditTarget(cat);
        setForm({ name: cat.name, icon: cat.icon ?? '' });
        setShowForm(true);
    }

    function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        if (editTarget) {
            router.put(route('admin.categories.update', editTarget.id), form, {
                onFinish: () => { setLoading(false); setShowForm(false); },
                onError: () => setLoading(false),
            });
        } else {
            router.post(route('admin.categories.store'), form, {
                onFinish: () => { setLoading(false); setShowForm(false); },
                onError: () => setLoading(false),
            });
        }
    }

    function handleDelete(cat) {
        setConfirmDelete(null);
        router.delete(route('admin.categories.destroy', cat.id));
    }

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-slate-800">
                    Manajemen Kategori
                </h2>
            }
        >
            <Head title="Kategori" />

            <div className="py-8">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* Flash */}
                    {flash?.success && (
                        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 border border-emerald-200">
                            ✅ {flash.success}
                        </div>
                    )}
                    {errors?.delete && (
                        <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700 border border-rose-200">
                            ⚠️ {errors.delete}
                        </div>
                    )}

                    {/* Header actions */}
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-600">{categories.length} kategori terdaftar</p>
                        <button
                            onClick={openCreate}
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                        >
                            + Tambah Kategori
                        </button>
                    </div>

                    {/* Form */}
                    {showForm && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-base font-semibold text-slate-800">
                                {editTarget ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Nama Kategori
                                    </label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="Contoh: Elektronik"
                                    />
                                    {errors?.name && (
                                        <p className="mt-1 text-xs text-rose-600">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700">
                                        Icon (Emoji)
                                    </label>
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {EMOJI_OPTIONS.map((emoji) => (
                                            <button
                                                key={emoji}
                                                type="button"
                                                onClick={() => setForm({ ...form, icon: emoji })}
                                                className={`rounded-lg border p-2 text-xl transition ${
                                                    form.icon === emoji
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-slate-200 hover:border-slate-400'
                                                }`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                    <input
                                        value={form.icon}
                                        onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                        className="w-24 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                        placeholder="✏️"
                                        maxLength={10}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                                    >
                                        {loading ? 'Menyimpan…' : editTarget ? 'Perbarui' : 'Simpan'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="rounded-xl border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    >
                                        Batal
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        {categories.length === 0 ? (
                            <div className="py-16 text-center text-slate-400">
                                <p className="text-4xl">🗂️</p>
                                <p className="mt-2 text-sm">Belum ada kategori. Tambahkan yang pertama!</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                                    <tr>
                                        <th className="px-5 py-3 text-left">Icon</th>
                                        <th className="px-5 py-3 text-left">Nama</th>
                                        <th className="px-5 py-3 text-left">Slug</th>
                                        <th className="px-5 py-3 text-right">Produk</th>
                                        <th className="px-5 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {categories.map((cat) => (
                                        <tr key={cat.id} className="hover:bg-slate-50">
                                            <td className="px-5 py-3 text-2xl">{cat.icon ?? '🛒'}</td>
                                            <td className="px-5 py-3 font-semibold text-slate-800">{cat.name}</td>
                                            <td className="px-5 py-3 text-slate-500">{cat.slug}</td>
                                            <td className="px-5 py-3 text-right">
                                                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                                                    {cat.products_count}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openEdit(cat)}
                                                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                                                    >
                                                        Edit
                                                    </button>
                                                    {confirmDelete === cat.id ? (
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-xs text-rose-600">Hapus?</span>
                                                            <button
                                                                onClick={() => handleDelete(cat)}
                                                                className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-medium text-white hover:bg-rose-500"
                                                            >
                                                                Ya
                                                            </button>
                                                            <button
                                                                onClick={() => setConfirmDelete(null)}
                                                                className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                                                            >
                                                                Tidak
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmDelete(cat.id)}
                                                            disabled={cat.products_count > 0}
                                                            className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                            title={cat.products_count > 0 ? 'Tidak bisa hapus: masih ada produk' : ''}
                                                        >
                                                            Hapus
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
