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

export default function UserReturnsIndex({ returnRequests }) {
    const items = returnRequests ?? [];

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-800">Retur & Refund</h2>}>
            <Head title="Retur & Refund" />

            <div className="py-10">
                <div className="space-y-4 px-4 sm:px-6 lg:px-8">
                    {items.map((request) => {
                        const status = STATUS_MAP[request.status] ?? { label: request.status, color: 'bg-slate-100 text-slate-700' };

                        return (
                            <div key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="space-y-1">
                                        <p className="text-xs uppercase tracking-wide text-slate-500">{request.request_number}</p>
                                        <p className="font-semibold text-slate-900">Order {request.order?.order_number}</p>
                                        <p className="text-sm text-slate-600">{request.reason}</p>
                                        <p className="text-sm text-slate-500">
                                            Refund: Rp{Number(request.refund_amount ?? 0).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status.color}`}>
                                            {status.label}
                                        </span>
                                        <Link
                                            href={route('user.returns.show', request.id)}
                                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                                        >
                                            Lihat Tracking
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {items.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                            Belum ada permintaan retur atau refund.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
