import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

const ACTIONS = [
    { value: 'approve', label: 'Setujui', color: 'bg-blue-600 hover:bg-blue-500' },
    { value: 'reject', label: 'Tolak', color: 'bg-rose-600 hover:bg-rose-500' },
    { value: 'receive', label: 'Barang Diterima', color: 'bg-violet-600 hover:bg-violet-500' },
    { value: 'refund', label: 'Proses Refund', color: 'bg-emerald-600 hover:bg-emerald-500' },
    { value: 'complete', label: 'Selesaikan', color: 'bg-slate-900 hover:bg-slate-800' },
];

export default function AdminReturnShow({ returnRequest }) {
    const { flash } = usePage().props;
    const form = useForm({
        action: 'approve',
        admin_notes: returnRequest.admin_notes ?? '',
        refund_reference: returnRequest.refund_reference ?? '',
        refund_amount: returnRequest.refund_amount ?? 0,
    });

    const submit = (event) => {
        event.preventDefault();
        form.patch(route('admin.returns.update-status', returnRequest.id));
    };

    const items = returnRequest.items ?? [];
    const events = returnRequest.tracking_events ?? [];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-800">Detail Retur Admin</h2>}>
            <Head title={`Kelola ${returnRequest.request_number}`} />

            <div className="py-10">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                    {flash?.success && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-xs uppercase tracking-wide text-slate-500">{returnRequest.request_number}</p>
                        <p className="mt-1 text-lg font-bold text-slate-900">{returnRequest.user?.name} • {returnRequest.order?.order_number}</p>
                        <p className="mt-2 text-sm text-slate-600">{returnRequest.reason}</p>
                        {returnRequest.evidence_image && (
                            <img src={returnRequest.evidence_image} alt="Bukti retur" className="mt-4 h-64 w-full rounded-2xl border border-slate-200 bg-slate-50 object-contain" />
                        )}
                        <div className="mt-4">
                            <Link href={route('admin.returns.index')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                                ← Kembali ke daftar retur
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-slate-900">Item Retur</h3>
                        <div className="mt-3 space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                    <div>
                                        <p className="font-medium text-slate-900">{item.product?.name ?? 'Produk'}</p>
                                        <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-slate-900">Rp{Number(item.refund_amount ?? 0).toLocaleString('id-ID')}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                        <h3 className="font-semibold text-slate-900">Aksi Admin</h3>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Aksi</label>
                                <select value={form.data.action} onChange={(e) => form.setData('action', e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
                                    {ACTIONS.map((action) => (
                                        <option key={action.value} value={action.value}>{action.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Nominal Refund</label>
                                <input type="number" min="0" value={form.data.refund_amount} onChange={(e) => form.setData('refund_amount', e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Referensi Refund</label>
                            <input type="text" value={form.data.refund_reference} onChange={(e) => form.setData('refund_reference', e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700">Catatan Admin</label>
                            <textarea rows={4} value={form.data.admin_notes} onChange={(e) => form.setData('admin_notes', e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm" />
                        </div>
                        <button type="submit" disabled={form.processing} className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${ACTIONS.find((action) => action.value === form.data.action)?.color ?? 'bg-indigo-600 hover:bg-indigo-500'} disabled:opacity-60`}>
                            {form.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </form>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-slate-900">Timeline Retur</h3>
                        <div className="mt-4 space-y-4">
                            {events.map((event) => (
                                <div key={event.id} className="relative pl-6">
                                    <span className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-indigo-500" />
                                    <p className="text-sm font-semibold text-slate-900">{event.status_label}</p>
                                    <p className="text-sm text-slate-600">{event.description}</p>
                                    <p className="text-xs text-slate-400">
                                        {new Date(event.event_time).toLocaleString('id-ID')} {event.actor_type ? `• ${event.actor_type}` : ''}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
