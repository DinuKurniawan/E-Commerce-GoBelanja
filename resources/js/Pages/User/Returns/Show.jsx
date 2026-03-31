import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const STATUS_MAP = {
    requested: { label: 'Diminta', color: 'bg-orange-100 text-orange-700' },
    approved: { label: 'Disetujui', color: 'bg-blue-100 text-blue-700' },
    rejected: { label: 'Ditolak', color: 'bg-rose-100 text-rose-700' },
    received: { label: 'Diterima Admin', color: 'bg-violet-100 text-violet-700' },
    refunded: { label: 'Refund Diproses', color: 'bg-emerald-100 text-emerald-700' },
    completed: { label: 'Selesai', color: 'bg-slate-900 text-white' },
};

export default function UserReturnShow({ returnRequest }) {
    const status = STATUS_MAP[returnRequest.status] ?? { label: returnRequest.status, color: 'bg-slate-100 text-slate-700' };
    const items = returnRequest.items ?? [];
    const events = returnRequest.tracking_events ?? [];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-800">Detail Retur</h2>}>
            <Head title={`Retur ${returnRequest.request_number}`} />

            <div className="py-10">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-xs uppercase tracking-wide text-slate-500">{returnRequest.request_number}</p>
                                <p className="mt-1 text-lg font-bold text-slate-900">Order {returnRequest.order?.order_number}</p>
                                <p className="mt-2 text-sm text-slate-600">{returnRequest.reason}</p>
                            </div>
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.color}`}>{status.label}</span>
                        </div>
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <Info label="Estimasi Refund" value={`Rp${Number(returnRequest.refund_amount ?? 0).toLocaleString('id-ID')}`} />
                            <Info label="Status Refund" value={returnRequest.refund_status} />
                            <Info label="Referensi Refund" value={returnRequest.refund_reference ?? '-'} />
                        </div>
                        {returnRequest.evidence_image && (
                            <img src={returnRequest.evidence_image} alt="Bukti retur" className="mt-4 h-56 w-full rounded-2xl border border-slate-200 bg-slate-50 object-contain" />
                        )}
                        <div className="mt-4">
                            <Link href={route('user.returns.index')} className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                                ← Kembali ke daftar retur
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-slate-900">Item Diretur</h3>
                        <div className="mt-3 space-y-3">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                                    <div>
                                        <p className="font-medium text-slate-900">{item.product?.name ?? 'Produk'}</p>
                                        <p className="text-sm text-slate-500">Qty retur: {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-slate-900">Rp{Number(item.refund_amount ?? 0).toLocaleString('id-ID')}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-slate-900">Tracking Timeline</h3>
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
                            {events.length === 0 && <p className="text-sm text-slate-500">Belum ada update tracking.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Info({ label, value }) {
    return (
        <div className="rounded-xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
        </div>
    );
}
