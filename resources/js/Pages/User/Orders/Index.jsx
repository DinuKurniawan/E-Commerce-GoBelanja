import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

const STATUS_COLOR = {
    pending:   'bg-yellow-100 text-yellow-700',
    diproses:  'bg-blue-100 text-blue-700',
    dikirim:   'bg-indigo-100 text-indigo-700',
    selesai:   'bg-emerald-100 text-emerald-700',
};
const PAYMENT_COLOR = {
    pending:              'bg-orange-100 text-orange-700',
    menunggu_verifikasi:  'bg-blue-100 text-blue-700',
    paid:                 'bg-emerald-100 text-emerald-700',
    failed:               'bg-rose-100 text-rose-700',
};
const PAYMENT_LABEL = {
    pending:              'Belum Bayar',
    menunggu_verifikasi:  'Menunggu Verifikasi',
    paid:                 'Lunas',
    failed:               'Bukti Ditolak',
};

export default function UserOrdersIndex({ orders, orderSummary }) {
    const orderItems = orders ?? [];
    const summary = orderSummary ?? {};

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-800">Pesanan Saya</h2>}
        >
            <Head title="Pesanan Saya" />

            <div className="py-10">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-4 md:grid-cols-4">
                        <SummaryCard title="Pending" value={summary.pending ?? 0} />
                        <SummaryCard title="Diproses" value={summary.processing ?? 0} />
                        <SummaryCard title="Dikirim" value={summary.shipping ?? 0} />
                        <SummaryCard title="Selesai" value={summary.completed ?? 0} />
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Order</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Pembayaran</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Total</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderItems.map((order) => {
                                    const isCOD = order.payment?.method?.toLowerCase().includes('cod');
                                    const needsUpload =
                                        !isCOD &&
                                        (order.payment_status === 'pending' || order.payment_status === 'failed') &&
                                        !order.payment?.proof_image;

                                    return (
                                        <tr key={order.id} className={`border-t border-slate-100 ${needsUpload ? 'bg-amber-50' : ''}`}>
                                            <td className="px-4 py-3 font-medium text-slate-900">{order.order_number}</td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[order.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PAYMENT_COLOR[order.payment_status] ?? 'bg-slate-100 text-slate-700'}`}>
                                                    {PAYMENT_LABEL[order.payment_status] ?? order.payment_status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-900">
                                                Rp{Number(order.total_amount).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-2">
                                                    <Link
                                                        href={route('user.orders.show', order.id)}
                                                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                                                    >
                                                        Detail
                                                    </Link>
                                                    {needsUpload && (
                                                        <Link
                                                            href={route('user.orders.show', order.id)}
                                                            className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-400"
                                                        >
                                                            📎 Upload Bukti
                                                        </Link>
                                                    )}
                                                    {(order.return_requests?.length ?? 0) > 0 && (
                                                        <Link
                                                            href={route('user.returns.show', order.return_requests[0].id)}
                                                            className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                                                        >
                                                            ↩ Lihat Retur
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {orderItems.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                                            Belum ada pesanan.
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

function SummaryCard({ title, value }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs uppercase text-slate-500">{title}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}
