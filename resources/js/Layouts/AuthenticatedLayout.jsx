import ApplicationLogo from '@/Components/ApplicationLogo';
import ComparisonBar from '@/Components/ComparisonBar';
import ChatWidget from '@/Components/ChatWidget';
import LanguageSwitcherDropdown from '@/Components/LanguageSwitcherDropdown';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const cartPreview = usePage().props.cartPreview;
    const [showingSidebar, setShowingSidebar] = useState(false);
    const [showCartDropdown, setShowCartDropdown] = useState(false);
    const appName = usePage().props.appName ?? 'GoBelanja';

    const links =
        user.role === 'admin'
            ? [
                  { label: 'Overview', routeName: 'admin.dashboard' },
                  { label: 'Banner', routeName: 'admin.banners.index' },
                  { label: 'Produk', routeName: 'admin.products.index' },
                  { label: 'Kategori', routeName: 'admin.categories.index' },
                  { label: 'Inventory', routeName: 'admin.inventory.index' },
                  { label: 'Order', routeName: 'admin.orders.index' },
                  { label: 'User', routeName: 'admin.users.index' },
                  { label: 'Promo', routeName: 'admin.promotions.index' },
                  { label: 'Flash Sale', routeName: 'admin.flash-sales.index' },
                  { label: 'Shipping', routeName: 'admin.shipping.index' },
                  { label: 'Review', routeName: 'admin.reviews.index' },
                  { label: 'Chat', routeName: 'admin.chat.index' },
                  { label: 'Reports', routeName: 'admin.reports.index' },
                  { label: 'Settings', routeName: 'admin.settings.index' },
              ]
            : [
                  { label: 'Dashboard', routeName: 'user.dashboard' },
                  { label: 'Cari Produk', routeName: 'products.search' },
                  { label: '⚡ Flash Sale', routeName: 'flash-sales.index' },
                  { label: 'Pesanan Saya', routeName: 'user.orders.index' },
                  { label: 'Keranjang', routeName: 'user.cart.index' },
                  { label: 'Checkout', routeName: 'user.checkout.index' },
                  { label: 'Wishlist', routeName: 'user.wishlist.index' },
                  { label: 'Perbandingan', routeName: 'user.comparison.index' },
                  { label: 'Alamat', routeName: 'user.addresses.index' },
                  { label: 'Pembayaran', routeName: 'user.payments.index' },
                  { label: 'Review Produk', routeName: 'user.reviews.index' },
                  { label: 'Notifikasi', routeName: 'user.notifications.index' },
              ];

    return (
        <div className="min-h-screen bg-slate-100 lg:flex">
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-gradient-to-b from-white to-slate-50 transition-transform duration-200 lg:static lg:translate-x-0 ${
                    showingSidebar ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex h-full flex-col">
                    <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5">
                        <Link href="/">
                            <ApplicationLogo className="h-9 w-9 text-indigo-600" />
                        </Link>
                        <div>
                            <p className="text-sm font-semibold text-slate-900">
                                {appName}
                            </p>
                            <p className="text-xs uppercase text-slate-500">
                                {user.role}
                            </p>
                        </div>
                    </div>

                    <nav className="flex-1 space-y-1.5 px-3 py-4">
                        {links.map((item) => (
                            <Link
                                key={item.routeName}
                                href={route(item.routeName)}
                                onClick={() => setShowingSidebar(false)}
                                className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                                    route().current(`${item.routeName.split('.').slice(0, 2).join('.')}*`) ||
                                    route().current(item.routeName)
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-700 hover:bg-slate-100'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="border-t border-slate-200 p-4">
                        <div className="mb-3 rounded-lg bg-slate-50 p-3">
                            <p className="text-sm font-semibold text-slate-900">
                                {user.name}
                            </p>
                            <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                        <div className="space-y-2">
                            <Link
                                href={route('profile.edit')}
                                className="block rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-medium text-slate-700 hover:bg-slate-50"
                            >
                                Profile
                            </Link>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="w-full rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                            >
                                Log Out
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>

            {showingSidebar && (
                <button
                    type="button"
                    aria-label="Close sidebar"
                    className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
                    onClick={() => setShowingSidebar(false)}
                />
            )}

                <div className="flex min-h-screen flex-1 flex-col">
                <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setShowingSidebar(true)}
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 lg:hidden"
                        >
                            Menu
                        </button>
                        <p className="text-sm font-semibold text-slate-900 lg:hidden">{appName}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <LanguageSwitcherDropdown />
                        
                        {user.role === 'user' && (
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setShowCartDropdown((value) => !value)}
                                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                            >
                                Cart ({cartPreview?.count ?? 0})
                            </button>

                            {showCartDropdown && (
                                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
                                    <p className="text-xs uppercase text-slate-500">Keranjang</p>
                                    <div className="mt-2 space-y-2">
                                        {(cartPreview?.items ?? []).map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between rounded-lg bg-slate-50 px-2 py-2"
                                            >
                                                <p className="text-xs text-slate-700">
                                                    {item.product?.emoji} {item.product?.name} x {item.quantity}
                                                </p>
                                                <p className="text-xs font-semibold text-slate-900">
                                                    Rp
                                                    {(
                                                        Number(item.product?.price ?? 0) * Number(item.quantity)
                                                    ).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                        ))}
                                        {(cartPreview?.items ?? []).length === 0 && (
                                            <p className="text-xs text-slate-500">Keranjang kosong.</p>
                                        )}
                                    </div>
                                    <div className="mt-3 border-t border-slate-200 pt-3">
                                        <p className="text-xs text-slate-600">
                                            Total: Rp{Number(cartPreview?.total ?? 0).toLocaleString('id-ID')}
                                        </p>
                                        <Link
                                            href={route('user.cart.index')}
                                            onClick={() => setShowCartDropdown(false)}
                                            className="mt-2 block rounded-lg bg-indigo-600 px-3 py-2 text-center text-xs font-semibold text-white"
                                        >
                                            Lihat Keranjang
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                        )}
                    </div>
                </div>

                {header && (
                    <header className="border-b border-slate-200 bg-white">
                        <div className="px-4 py-5 sm:px-6 lg:px-8">
                            {header}
                        </div>
                    </header>
                )}

                <main className="flex-1">{children}</main>
            </div>

            {/* Comparison Floating Bar - Only for users */}
            {user.role === 'user' && <ComparisonBar />}
            
            {/* Chat Widget - Only for users */}
            {user.role === 'user' && <ChatWidget />}
        </div>
    );
}
