import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Reports({ report }) {
    const bestProducts = report?.bestProducts ?? [];

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-800">Laporan</h2>}
        >
            <Head title="Laporan" />

            <div className="py-10">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">Total Pendapatan</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                Rp{Number(report.totalRevenue).toLocaleString('id-ID')}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">Jumlah Order</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                {report.totalOrders}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-slate-900">Produk Terlaris</h3>
                        <ul className="mt-3 space-y-2 text-sm text-slate-700">
                            {bestProducts.map((product) => (
                                <li key={product.id} className="rounded-lg bg-slate-50 px-3 py-2">
                                    {product.name} • Terjual {product.sold_count} • Rating {product.rating}
                                </li>
                            ))}
                            {bestProducts.length === 0 && (
                                <li className="rounded-lg bg-slate-50 px-3 py-2 text-slate-500">
                                    Belum ada data produk terlaris.
                                </li>
                            )}
                        </ul>
                    </div>

                    <div className="flex gap-3">
                        <Link href={route('admin.reports.export-csv')} className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white">
                            Export CSV
                        </Link>
                        <Link href={route('admin.reports.export-excel')} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700">
                            Export Excel
                        </Link>
                        <Link href={route('admin.reports.export-pdf')} className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700">
                            Export PDF View
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
