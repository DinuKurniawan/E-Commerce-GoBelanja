import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';

export default function Dashboard() {
    const { auth } = usePage().props;

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-slate-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-10">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Selamat datang, {auth.user.name} 👋
                        </h3>
                        <p className="mt-2 text-slate-600">
                            Role akun Anda:{' '}
                            <span className="font-semibold uppercase">
                                {auth.user.role}
                            </span>
                        </p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Pesanan Diproses
                            </p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                12
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">
                                Wishlist Anda
                            </p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                8
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <p className="text-sm text-slate-500">Voucher Aktif</p>
                            <p className="mt-2 text-2xl font-bold text-slate-900">
                                3
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
