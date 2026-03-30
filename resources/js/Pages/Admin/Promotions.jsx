import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import useConfirm from '@/Hooks/useConfirm';

export default function Promotions({ promotions }) {
    const { flash } = usePage().props;
    const promoList = promotions ?? [];
    const { confirm, ConfirmDialog } = useConfirm();

    const form = useForm({
        name: '',
        code: '',
        type: 'voucher',
        discount_percent: '10',
        minimum_purchase: '0',
        expires_at: '',
        is_active: true,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.promotions.store'), {
            onSuccess: () => form.reset(),
        });
    };

    const destroy = async (id) => {
        const ok = await confirm('Promo ini akan dihapus permanen.', { danger: true, title: 'Hapus Promo' });
        if (!ok) return;
        router.delete(route('admin.promotions.destroy', id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-800">Promo & Diskon</h2>}
        >
            <Head title="Promo & Diskon" />
            {ConfirmDialog}

            <div className="py-10">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-600">Buat Promo Baru</h3>
                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Nama Promo *</label>
                                <input
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="Nama promo"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    required
                                />
                                {form.errors.name && <p className="mt-1 text-xs text-rose-600">{form.errors.name}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Kode Voucher *</label>
                                <input
                                    value={form.data.code}
                                    onChange={(e) => form.setData('code', e.target.value.toUpperCase())}
                                    placeholder="KODE10"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                                    required
                                />
                                {form.errors.code && <p className="mt-1 text-xs text-rose-600">{form.errors.code}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Tipe</label>
                                <select
                                    value={form.data.type}
                                    onChange={(e) => form.setData('type', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                >
                                    <option value="voucher">Voucher</option>
                                    <option value="discount_product">Diskon Produk</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Diskon (%) *</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={form.data.discount_percent}
                                    onChange={(e) => form.setData('discount_percent', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    required
                                />
                                {form.errors.discount_percent && <p className="mt-1 text-xs text-rose-600">{form.errors.discount_percent}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Min. Pembelian (Rp)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.data.minimum_purchase}
                                    onChange={(e) => form.setData('minimum_purchase', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                />
                                {form.errors.minimum_purchase && <p className="mt-1 text-xs text-rose-600">{form.errors.minimum_purchase}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Berlaku Sampai *</label>
                                <input
                                    type="datetime-local"
                                    value={form.data.expires_at}
                                    onChange={(e) => form.setData('expires_at', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    required
                                />
                                {form.errors.expires_at && <p className="mt-1 text-xs text-rose-600">{form.errors.expires_at}</p>}
                            </div>
                            <div className="lg:col-span-3">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                                >
                                    {form.processing ? 'Menyimpan...' : 'Buat Promo'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Nama</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Kode</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Tipe</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Diskon</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Min. Beli</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Berlaku Sampai</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promoList.map((promotion) => (
                                    <tr key={promotion.id} className="border-t border-slate-100 hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{promotion.name}</td>
                                        <td className="px-4 py-3">
                                            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                                                {promotion.code}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 capitalize text-slate-600">{promotion.type?.replace('_', ' ')}</td>
                                        <td className="px-4 py-3 font-semibold text-indigo-600">{promotion.discount_percent}%</td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {promotion.minimum_purchase > 0
                                                ? `Rp${Number(promotion.minimum_purchase).toLocaleString('id-ID')}`
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            {promotion.expires_at
                                                ? new Date(promotion.expires_at).toLocaleDateString('id-ID')
                                                : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => destroy(promotion.id)}
                                                className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {promoList.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-10 text-center text-slate-500" colSpan={7}>
                                            Belum ada promo. Buat promo pertama di atas.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
