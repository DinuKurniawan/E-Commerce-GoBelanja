import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import useConfirm from '@/Hooks/useConfirm';

const STATUS_MAP = {
    pending:    { label: 'Pending',   color: 'bg-yellow-100 text-yellow-700' },
    diproses:   { label: 'Diproses',  color: 'bg-blue-100 text-blue-700' },
    dikirim:    { label: 'Dikirim',   color: 'bg-indigo-100 text-indigo-700' },
    selesai:    { label: 'Selesai',   color: 'bg-emerald-100 text-emerald-700' },
    dibatalkan: { label: 'Batal',     color: 'bg-rose-100 text-rose-700' },
};

const PAYMENT_MAP = {
    pending:               { label: 'Belum Bayar',         color: 'bg-orange-100 text-orange-700' },
    menunggu_verifikasi:   { label: 'Menunggu Verifikasi', color: 'bg-blue-100 text-blue-700' },
    paid:                  { label: 'Lunas',               color: 'bg-emerald-100 text-emerald-700' },
    failed:                { label: 'Gagal',               color: 'bg-rose-100 text-rose-700' },
};

export default function Orders({ orders, statuses }) {
    const { flash } = usePage().props;
    const orderList  = orders ?? [];
    const statusList = statuses ?? [];
    const [proofModal, setProofModal] = useState(null);
    const { confirm, ConfirmDialog } = useConfirm();

    const updateStatus = async (orderId, status, currentStatus) => {
        if (status === currentStatus) return;
        const ok = await confirm(`Status akan diubah menjadi "${STATUS_MAP[status]?.label ?? status}".`, {
            title: 'Ubah Status Order',
            confirmLabel: 'Ya, Ubah',
        });
        if (!ok) return;
        router.patch(route('admin.orders.update-status', orderId), { status });
    };

    const verifyPayment = async (orderId, action) => {
        const isDanger = action !== 'approve';
        const ok = await confirm(
            action === 'approve'
                ? 'Pembayaran akan dikonfirmasi dan status order diperbarui.'
                : 'Bukti transfer akan ditolak dan user perlu upload ulang.',
            {
                title:        action === 'approve' ? 'Konfirmasi Pembayaran' : 'Tolak Bukti Transfer',
                confirmLabel: action === 'approve' ? 'Ya, Konfirmasi'       : 'Ya, Tolak',
                danger:       isDanger,
            }
        );
        if (!ok) return;
        router.patch(route('admin.orders.verify-payment', orderId), { action });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-800">Manajemen Order</h2>}
        >
            <Head title="Manajemen Order" />
            {ConfirmDialog}

            {/* Proof image modal */}
            {proofModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setProofModal(null)}
                >
                    <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
                        <img src={proofModal} alt="Bukti Transfer" className="w-full rounded-2xl shadow-2xl" />
                        <button
                            onClick={() => setProofModal(null)}
                            className="absolute -top-3 -right-3 rounded-full bg-white px-3 py-1 text-sm font-bold shadow"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

            <div className="py-10">
                <div className="px-4 sm:px-6 lg:px-8 space-y-4">

                    {flash?.success && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Order</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">User</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Total</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Pembayaran</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Metode Bayar</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Bukti Transfer</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Ubah Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderList.map((order) => {
                                    const statusInfo  = STATUS_MAP[order.status]         ?? { label: order.status,         color: 'bg-slate-100 text-slate-700' };
                                    const payInfo     = PAYMENT_MAP[order.payment_status] ?? { label: order.payment_status, color: 'bg-slate-100 text-slate-700' };
                                    const proof       = order.payment?.proof_image;
                                    const needsVerify = order.payment_status === 'menunggu_verifikasi' && proof;

                                    return (
                                        <tr key={order.id} className={`border-t border-slate-100 transition ${needsVerify ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
                                            <td className="px-4 py-3 font-medium text-slate-900">{order.order_number}</td>
                                            <td className="px-4 py-3 text-slate-600">
                                                <p>{order.user?.name ?? '-'}</p>
                                                <p className="text-xs text-slate-400">{order.user?.email}</p>
                                            </td>
                                            <td className="px-4 py-3 font-semibold text-slate-900">
                                                Rp{Number(order.total_amount).toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusInfo.color}`}>
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${payInfo.color}`}>
                                                    {payInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs font-medium text-slate-700">
                                                    {order.payment?.method ?? <span className="text-slate-400 italic">-</span>}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {proof ? (
                                                    <div className="space-y-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => setProofModal(proof)}
                                                            className="block"
                                                        >
                                                            <img
                                                                src={proof}
                                                                alt="Bukti"
                                                                className="h-14 w-20 rounded-lg object-cover border border-slate-200 hover:opacity-80 transition"
                                                            />
                                                        </button>
                                                        {needsVerify && (
                                                            <div className="flex gap-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => verifyPayment(order.id, 'approve')}
                                                                    className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-500"
                                                                >
                                                                    ✓ Konfirmasi
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => verifyPayment(order.id, 'reject')}
                                                                    className="rounded-md bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-500"
                                                                >
                                                                    ✕ Tolak
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">Belum ada</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {statusList.map((status) => (
                                                        <button
                                                            key={status}
                                                            type="button"
                                                            onClick={() => updateStatus(order.id, status, order.status)}
                                                            className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                                                                order.status === status
                                                                    ? 'bg-indigo-600 text-white'
                                                                    : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                                                            }`}
                                                        >
                                                            {STATUS_MAP[status]?.label ?? status}
                                                        </button>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {orderList.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-10 text-center text-slate-500" colSpan={7}>
                                            Belum ada data order.
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
