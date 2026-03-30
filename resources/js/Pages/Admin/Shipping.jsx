import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import useConfirm from '@/Hooks/useConfirm';

export default function Shipping({ shippingMethods }) {
    const { flash } = usePage().props;
    const methods = shippingMethods ?? [];
    const { confirm, ConfirmDialog } = useConfirm();

    const form = useForm({
        name: '',
        cost: '',
        tracking_url: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.shipping.store'), {
            onSuccess: () => form.reset(),
        });
    };

    const destroy = async (id) => {
        const ok = await confirm('Metode pengiriman ini akan dihapus permanen.', { danger: true, title: 'Hapus Metode Pengiriman' });
        if (!ok) return;
        router.delete(route('admin.shipping.destroy', id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-800">Pengiriman</h2>}
        >
            <Head title="Pengiriman" />
            {ConfirmDialog}

            <div className="py-10">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-600">Tambah Kurir</h3>
                        <form onSubmit={submit} className="grid gap-4 md:grid-cols-3">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Nama Kurir *</label>
                                <input
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    placeholder="JNE Regular"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    required
                                />
                                {form.errors.name && <p className="mt-1 text-xs text-rose-600">{form.errors.name}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Ongkir (Rp) *</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.data.cost}
                                    onChange={(e) => form.setData('cost', e.target.value)}
                                    placeholder="15000"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    required
                                />
                                {form.errors.cost && <p className="mt-1 text-xs text-rose-600">{form.errors.cost}</p>}
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Tracking URL</label>
                                <input
                                    type="url"
                                    value={form.data.tracking_url}
                                    onChange={(e) => form.setData('tracking_url', e.target.value)}
                                    placeholder="https://..."
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                />
                                {form.errors.tracking_url && <p className="mt-1 text-xs text-rose-600">{form.errors.tracking_url}</p>}
                            </div>
                            <div className="md:col-span-3">
                                <button
                                    type="submit"
                                    disabled={form.processing}
                                    className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                                >
                                    {form.processing ? 'Menyimpan...' : 'Tambah Kurir'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Kurir</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Ongkir</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Tracking</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {methods.map((method) => (
                                    <tr key={method.id} className="border-t border-slate-100 hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{method.name}</td>
                                        <td className="px-4 py-3 text-slate-700">
                                            Rp{Number(method.cost).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3">
                                            {method.tracking_url ? (
                                                <a
                                                    href={method.tracking_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-sm font-medium text-indigo-600 hover:underline"
                                                >
                                                    Buka Tracking ↗
                                                </a>
                                            ) : (
                                                <span className="text-slate-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => destroy(method.id)}
                                                className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {methods.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-10 text-center text-slate-500" colSpan={4}>
                                            Belum ada metode pengiriman.
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
