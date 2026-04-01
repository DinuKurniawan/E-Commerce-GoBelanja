import { Head, Link, usePage } from '@inertiajs/react';

export default function PublicLayout({ title, children }) {
    const { appName, auth } = usePage().props;
    const user = auth?.user;

    return (
        <>
            {title && <Head title={title} />}

            <div className="min-h-screen bg-slate-50">
                <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
                    <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex min-w-0 items-center gap-3">
                            <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white">
                                🛍️
                            </Link>

                            <div className="min-w-0">
                                <Link href="/" className="block truncate text-lg font-bold text-slate-900">
                                    {appName ?? 'GoBelanja'}
                                </Link>
                                <p className="truncate text-xs text-slate-500">
                                    Belanja modern untuk semua kebutuhan
                                </p>
                            </div>
                        </div>

                        <nav className="hidden items-center gap-2 lg:flex">
                            <Link href="/" className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                                Beranda
                            </Link>
                            <Link href={route('products.search')} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                                Cari Produk
                            </Link>
                            <Link href={route('flash-sales.index')} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                                Flash Sale
                            </Link>
                        </nav>

                        <div className="flex items-center gap-2 sm:gap-3">
                            {user ? (
                                <Link
                                    href={route('dashboard')}
                                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="hidden rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 sm:inline-flex"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="border-t border-slate-100 px-4 py-2 sm:px-6 lg:hidden">
                        <div className="flex flex-wrap gap-2">
                            <Link href="/" className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200">
                                Beranda
                            </Link>
                            <Link href={route('products.search')} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200">
                                Cari Produk
                            </Link>
                            <Link href={route('flash-sales.index')} className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200">
                                Flash Sale
                            </Link>
                        </div>
                    </div>
                </header>

                <main>{children}</main>
            </div>
        </>
    );
}
