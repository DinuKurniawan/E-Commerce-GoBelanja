import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function UserDashboard({ overview, recentOrders }) {
    const safeOverview = overview ?? {};
    const orders = recentOrders ?? [];
    const quickLinks = [
        { href: route('user.cart.index'), label: 'Keranjang' },
        { href: route('user.checkout.index'), label: 'Checkout' },
        { href: route('user.orders.index'), label: 'Pesanan Saya' },
        { href: route('user.wishlist.index'), label: 'Wishlist' },
        { href: route('user.loyalty.index'), label: 'Loyalty Program' },
        { href: route('user.addresses.index'), label: 'Alamat' },
        { href: route('user.payments.index'), label: 'Pembayaran' },
        { href: route('user.reviews.index'), label: 'Review Produk' },
        { href: route('user.notifications.index'), label: 'Notifikasi' },
        { href: route('profile.edit'), label: 'Profil Saya' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-slate-800">
                    Dashboard User
                </h2>
            }
        >
            <Head title="User Dashboard" />

            <div className="py-10">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <StatCard title="Jumlah Order" value={safeOverview.totalOrders ?? 0} />
                        <StatCard
                            title="Status Pesanan Terakhir"
                            value={safeOverview.latestOrderStatus ?? '-'}
                        />
                        <StatCard title="Wishlist" value={safeOverview.wishlistCount ?? 0} />
                        <StatCard title="Keranjang" value={safeOverview.cartCount ?? 0} />
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        <StatCard
                            title="Pembayaran Pending"
                            value={safeOverview.pendingPayments ?? 0}
                        />
                        <StatCard
                            title="Notifikasi Belum Dibaca"
                            value={safeOverview.unreadNotifications ?? 0}
                        />
                        <StatCard
                            title="Alamat Default"
                            value={safeOverview.hasDefaultAddress ? 'Sudah ada' : 'Belum ada'}
                        />
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-slate-500">Order Terakhir</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">
                            {safeOverview.latestOrderNumber ?? 'Belum ada order'}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-slate-900">Riwayat Order Terbaru</h3>
                        <div className="mt-4 overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Order</th>
                                        <th className="px-3 py-2 text-left">Status</th>
                                        <th className="px-3 py-2 text-left">Pembayaran</th>
                                        <th className="px-3 py-2 text-left">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.id} className="border-t border-slate-100">
                                            <td className="px-3 py-2">{order.order_number}</td>
                                            <td className="px-3 py-2 uppercase">{order.status}</td>
                                            <td className="px-3 py-2 uppercase">{order.payment_status}</td>
                                            <td className="px-3 py-2">
                                                Rp{Number(order.total_amount ?? 0).toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    ))}
                                    {orders.length === 0 && (
                                        <tr>
                                            <td className="px-3 py-4 text-slate-500" colSpan={4}>
                                                Belum ada riwayat order.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {quickLinks.map((item) => (
                            <QuickLink key={item.href} href={item.href} label={item.label} />
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function StatCard({ title, value }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
    );
}

function QuickLink({ href, label }) {
    return (
        <Link
            href={href}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center font-semibold text-slate-800 hover:bg-slate-50"
        >
            {label}
        </Link>
    );
}
