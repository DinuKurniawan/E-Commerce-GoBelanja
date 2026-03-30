import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function UserPayments({ payments, paymentSummary, pendingOrderCount }) {
    const paymentItems = payments ?? [];
    const summary = paymentSummary ?? {};
    const [selectedPaymentId, setSelectedPaymentId] = useState(null);
    const form = useForm({
        proof_image: null,
    });

    const upload = (e) => {
        e.preventDefault();
        if (!selectedPaymentId) {
            return;
        }

        form.transform((data) => ({
            ...data,
            _method: 'patch',
        })).post(route('user.payments.upload-proof', selectedPaymentId), {
            forceFormData: true,
            onSuccess: () => {
                setSelectedPaymentId(null);
                form.reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-800">Pembayaran</h2>}
        >
            <Head title="Pembayaran" />

            <div className="py-10">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-4 md:grid-cols-4">
                        <SummaryCard title="Pending" value={summary.pending ?? 0} />
                        <SummaryCard title="Paid" value={summary.paid ?? 0} />
                        <SummaryCard title="Failed" value={summary.failed ?? 0} />
                        <SummaryCard title="Order Pending" value={pendingOrderCount ?? 0} />
                    </div>

                    {selectedPaymentId && (
                        <form
                            onSubmit={upload}
                            className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center"
                        >
                            <input
                                type="file"
                                onChange={(e) => form.setData('proof_image', e.target.files?.[0] ?? null)}
                                className="rounded-lg border-slate-300"
                            />
                            <button
                                type="submit"
                                className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white"
                            >
                                Upload Bukti Bayar
                            </button>
                        </form>
                    )}

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left">Order</th>
                                    <th className="px-4 py-3 text-left">Metode</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                    <th className="px-4 py-3 text-left">Jumlah</th>
                                    <th className="px-4 py-3 text-left">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paymentItems.map((payment) => (
                                    <tr key={payment.id} className="border-t border-slate-100">
                                        <td className="px-4 py-3">{payment.order?.order_number}</td>
                                        <td className="px-4 py-3">{payment.method}</td>
                                        <td className="px-4 py-3 uppercase">{payment.status}</td>
                                        <td className="px-4 py-3">
                                            Rp{Number(payment.amount).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3">
                                            {payment.status === 'pending' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedPaymentId(payment.id)}
                                                    className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
                                                >
                                                    Upload Bukti
                                                </button>
                                            ) : (
                                                <span className="text-xs font-semibold text-emerald-600">
                                                    Sudah dibayar
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {paymentItems.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-6 text-center text-slate-500" colSpan={5}>
                                            Belum ada data pembayaran.
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
