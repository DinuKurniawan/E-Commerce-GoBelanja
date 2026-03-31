import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import AddToCompareButton from '@/Components/AddToCompareButton';
import ComparisonBar from '@/Components/ComparisonBar';

const features = [
    'Gratis ongkir minimum pembelian tertentu',
    'Pengiriman cepat seluruh Indonesia',
    'Garansi produk resmi',
    'Customer support 24/7',
];

const highlights = [
    { label: 'Produk Aktif', icon: '📦' },
    { label: 'Kategori Pilihan', icon: '🧭' },
    { label: 'Belanja Aman', icon: '🔒' },
    { label: 'Pengiriman Cepat', icon: '🚚' },
];

const formatPrice = (value) => `Rp${Number(value).toLocaleString('id-ID')}`;

export default function Welcome({
    auth,
    appName = 'GoBelanja',
    categories = [],
    products = [],
    testimonials = [],
    banners = [],
}) {
    const { cartPreview, flash } = usePage().props;
    const isUser = auth?.user?.role === 'user';
    const isAdmin = auth?.user?.role === 'admin';

    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [localWishlist, setLocalWishlist] = useState([]);
    const [loadingCart, setLoadingCart] = useState(null);
    const [loadingWishlist, setLoadingWishlist] = useState(null);
    const [cartToast, setCartToast] = useState(null);
    const [showCartDropdown, setShowCartDropdown] = useState(false);
    const cartRef = useRef(null);
    const [currentBanner, setCurrentBanner] = useState(0);
    const bannerTimerRef = useRef(null);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterLoading, setNewsletterLoading] = useState(false);
    const [newsletterFeedback, setNewsletterFeedback] = useState(null);

    // Close cart dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (cartRef.current && !cartRef.current.contains(e.target)) {
                setShowCartDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Banner carousel auto-slide
    useEffect(() => {
        if (banners.length <= 1) return;
        bannerTimerRef.current = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length);
        }, 5000);
        return () => clearInterval(bannerTimerRef.current);
    }, [banners.length]);

    const goToBanner = (index) => {
        setCurrentBanner(index);
        clearInterval(bannerTimerRef.current);
        if (banners.length > 1) {
            bannerTimerRef.current = setInterval(() => {
                setCurrentBanner((prev) => (prev + 1) % banners.length);
            }, 5000);
        }
    };

    const filteredProducts = useMemo(() => {
        const normalized = query.toLowerCase().trim();
        return products.filter((product) => {
            const matchName = !normalized || product.name.toLowerCase().includes(normalized);
            const matchCategory = !activeCategory || product.category?.name === activeCategory;
            return matchName && matchCategory;
        });
    }, [products, query, activeCategory]);

    const bestSellers = filteredProducts.filter((product) => product.is_popular);
    const newestProducts = filteredProducts.filter((product) => product.is_new);

    async function handleNewsletterSubscribe(e) {
        e.preventDefault();

        if (!newsletterEmail.trim()) {
            setNewsletterFeedback({
                type: 'error',
                message: 'Masukkan email terlebih dahulu.',
            });
            return;
        }

        setNewsletterLoading(true);
        setNewsletterFeedback(null);

        try {
            const response = await window.axios.post(route('newsletter.subscribe'), {
                email: newsletterEmail.trim(),
            });

            setNewsletterFeedback({
                type: 'success',
                message: response.data?.message ?? 'Berhasil subscribe newsletter.',
            });
            setNewsletterEmail('');
        } catch (error) {
            const message = error?.response?.data?.message
                || error?.response?.data?.errors?.email?.[0]
                || 'Terjadi kesalahan saat subscribe newsletter.';

            setNewsletterFeedback({
                type: 'error',
                message,
            });
        } finally {
            setNewsletterLoading(false);
        }
    }

    function addToCart(product, size = '') {
        if (!auth?.user) {
            router.visit(route('login'));
            return;
        }
        if (!isUser) return; // admin tidak punya cart

        setLoadingCart(product.id);
        router.post(
            route('user.cart.store'),
            { product_id: product.id, quantity: 1, size: size ?? '' },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setLoadingCart(null);
                    setCartToast(product.name);
                    setTimeout(() => setCartToast(null), 2500);
                },
                onError: () => setLoadingCart(null),
            },
        );
    }

    function toggleWishlist(product) {
        if (!auth?.user) {
            router.visit(route('login'));
            return;
        }
        if (!isUser) return;

        const isWished = localWishlist.includes(product.id);
        setLocalWishlist((prev) =>
            isWished ? prev.filter((id) => id !== product.id) : [...prev, product.id],
        );
        setLoadingWishlist(product.id);

        router.post(
            route('user.wishlist.toggle'),
            { product_id: product.id },
            {
                preserveScroll: true,
                preserveState: true,
                onFinish: () => setLoadingWishlist(null),
            },
        );
    }

    const cartCount = isUser ? (cartPreview?.count ?? 0) : 0;
    const cartItems = isUser ? (cartPreview?.items ?? []) : [];

    const pageClass = darkMode
        ? 'bg-slate-950 text-slate-100'
        : 'bg-slate-50 text-slate-900';

    const cardClass = darkMode
        ? 'bg-slate-900 border-slate-700 text-slate-100'
        : 'bg-white border-slate-200 text-slate-900';

    return (
        <>
            <Head title={appName} />

            {/* Cart toast notification */}
            {cartToast && (
                <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg">
                    ✅ {cartToast} ditambahkan ke keranjang
                </div>
            )}

            <div className={`min-h-screen ${pageClass}`}>
                <header
                    className={`sticky top-0 z-20 border-b backdrop-blur ${
                        darkMode
                            ? 'border-slate-700 bg-slate-950/90'
                            : 'border-slate-200 bg-white/90'
                    }`}
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg text-white">
                                🛍️
                            </div>
                            <div>
                                <p className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {appName}
                                </p>
                                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    Smart Shopping Experience
                                </p>
                            </div>
                        </div>

                        <div className="hidden flex-1 px-6 md:block">
                            <div className="relative">
                                <input
                                    value={query}
                                    onChange={(e) => { setQuery(e.target.value); setActiveCategory(''); }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && query.trim()) {
                                            router.visit(route('products.search', { q: query }));
                                        }
                                    }}
                                    placeholder="Cari produk favoritmu... (Enter untuk pencarian lanjutan)"
                                    className={`w-full rounded-xl border px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                                        darkMode
                                            ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-400'
                                            : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-500'
                                    }`}
                                />
                                {query.trim() && (
                                    <button
                                        onClick={() => router.visit(route('products.search', { q: query }))}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
                                    >
                                        🔍 Cari
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setDarkMode((prev) => !prev)}
                                className={`rounded-xl border px-3 py-2 text-sm ${
                                    darkMode
                                        ? 'border-slate-700 text-slate-100 hover:bg-slate-800'
                                        : 'border-slate-200 text-slate-900 hover:bg-slate-100'
                                }`}
                            >
                                {darkMode ? '☀️ Light' : '🌙 Dark'}
                            </button>

                            {/* Flash Sale Link */}
                            <Link
                                href={route('flash-sales.index')}
                                className="rounded-xl bg-gradient-to-r from-red-600 to-orange-600 px-4 py-2 text-sm font-semibold text-white hover:from-red-700 hover:to-orange-700 shadow-lg"
                            >
                                ⚡ Flash Sale
                            </Link>

                            {/* Wishlist counter */}
                            {isUser && (
                                <Link
                                    href={route('user.wishlist.index')}
                                    className={`rounded-xl border px-3 py-2 text-sm ${
                                        darkMode
                                            ? 'border-slate-700 text-slate-100 hover:bg-slate-800'
                                            : 'border-slate-200 text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    ❤️ Wishlist
                                </Link>
                            )}

                            {/* Cart dropdown */}
                            {isUser ? (
                                <div ref={cartRef} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowCartDropdown((prev) => !prev)}
                                        className={`relative rounded-xl border px-3 py-2 text-sm ${
                                            darkMode
                                                ? 'border-slate-700 text-slate-100 hover:bg-slate-800'
                                                : 'border-slate-200 text-slate-900 hover:bg-slate-100'
                                        }`}
                                    >
                                        🛒
                                        {cartCount > 0 && (
                                            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                                                {cartCount}
                                            </span>
                                        )}
                                    </button>

                                    {showCartDropdown && (
                                        <div className={`absolute right-0 top-12 z-50 w-80 rounded-2xl border shadow-xl ${
                                            darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'
                                        }`}>
                                            <div className={`border-b px-4 py-3 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                                                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                                    Keranjang ({cartCount})
                                                </p>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto">
                                                {cartItems.length === 0 ? (
                                                    <div className="py-8 text-center text-slate-400 text-sm">
                                                        <p className="text-2xl mb-1">🛒</p>
                                                        Keranjang masih kosong
                                                    </div>
                                                ) : (
                                                    cartItems.map((item) => (
                                                        <div key={item.id} className={`flex items-center gap-3 px-4 py-3 border-b last:border-b-0 ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
                                                            <span className="text-2xl">{item.emoji ?? '📦'}</span>
                                                            <div className="min-w-0 flex-1">
                                                                <p className={`truncate text-sm font-medium ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>{item.name}</p>
                                                                <p className="text-xs text-indigo-500">{formatPrice(item.price)} × {item.quantity}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                            {cartItems.length > 0 && (
                                                <div className={`border-t px-4 py-3 ${darkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                                                    <div className="mb-2 flex justify-between text-sm">
                                                        <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>Total</span>
                                                        <span className="font-semibold text-indigo-600">{formatPrice(cartPreview?.total ?? 0)}</span>
                                                    </div>
                                                    <Link
                                                        href={route('user.cart.index')}
                                                        onClick={() => setShowCartDropdown(false)}
                                                        className="block w-full rounded-xl bg-indigo-600 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-500"
                                                    >
                                                        Lihat Keranjang
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : !auth?.user ? (
                                <Link
                                    href={route('login')}
                                    className={`rounded-xl border px-3 py-2 text-sm ${
                                        darkMode
                                            ? 'border-slate-700 text-slate-100 hover:bg-slate-800'
                                            : 'border-slate-200 text-slate-900 hover:bg-slate-100'
                                    }`}
                                >
                                    🛒 Keranjang
                                </Link>
                            ) : null}

                            {auth?.user ? (
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
                                        className={`rounded-xl border px-4 py-2 text-sm font-semibold ${
                                            darkMode
                                                ? 'border-slate-700 text-slate-100'
                                                : 'border-slate-200 text-slate-900'
                                        }`}
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
                </header>

                <main className="space-y-10 px-4 py-10 sm:px-6 lg:px-8">
                    {/* Banner Carousel / Hero */}
                    {banners.length > 0 ? (
                        <section className="relative overflow-hidden rounded-3xl">
                            <div
                                className="flex transition-transform duration-700 ease-in-out"
                                style={{ transform: `translateX(-${currentBanner * 100}%)` }}
                            >
                                {banners.map((banner) => (
                                    <div key={banner.id} className="w-full flex-shrink-0 relative">
                                        {banner.link ? (
                                            <a
                                                href={banner.link}
                                                target={banner.target_blank ? '_blank' : '_self'}
                                                rel={banner.target_blank ? 'noopener noreferrer' : undefined}
                                            >
                                                <img
                                                    src={banner.image.startsWith('http') || banner.image.startsWith('/')
                                                        ? banner.image
                                                        : `/${banner.image.startsWith('images/') ? banner.image : `storage/${banner.image}`}`}
                                                    alt={banner.title}
                                                    className="w-full h-[220px] bg-slate-100 object-contain object-center sm:h-[320px] md:h-[400px]"
                                                />
                                            </a>
                                        ) : (
                                            <img
                                                src={banner.image.startsWith('http') || banner.image.startsWith('/')
                                                    ? banner.image
                                                    : `/${banner.image.startsWith('images/') ? banner.image : `storage/${banner.image}`}`}
                                                alt={banner.title}
                                                className="w-full h-[220px] bg-slate-100 object-contain object-center sm:h-[320px] md:h-[400px]"
                                            />
                                        )}
                                        {/* Overlay text */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end">
                                            <div className="p-6 sm:p-8">
                                                <h2 className="text-xl sm:text-3xl font-bold text-white drop-shadow-lg">
                                                    {banner.title}
                                                </h2>
                                                {banner.subtitle && (
                                                    <p className="mt-1 text-sm sm:text-lg text-white/90 drop-shadow">
                                                        {banner.subtitle}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Prev / Next */}
                            {banners.length > 1 && (
                                <>
                                    <button
                                        onClick={() => goToBanner((currentBanner - 1 + banners.length) % banners.length)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-700 shadow hover:bg-white transition"
                                        aria-label="Previous banner"
                                    >
                                        ‹
                                    </button>
                                    <button
                                        onClick={() => goToBanner((currentBanner + 1) % banners.length)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 text-gray-700 shadow hover:bg-white transition"
                                        aria-label="Next banner"
                                    >
                                        ›
                                    </button>
                                </>
                            )}

                            {/* Dots */}
                            {banners.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {banners.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => goToBanner(i)}
                                            className={`h-2.5 rounded-full transition-all duration-300 ${
                                                i === currentBanner ? 'w-8 bg-white' : 'w-2.5 bg-white/50'
                                            }`}
                                            aria-label={`Go to banner ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    ) : (
                        <section className={`grid items-center gap-6 rounded-3xl border p-8 md:grid-cols-2 ${cardClass}`}>
                            <div>
                                <h1 className={`text-4xl font-extrabold leading-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                    Diskon Besar Hingga 70% di {appName}
                                </h1>
                                <p className={`mt-4 ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
                                    Temukan produk terbaik dengan harga hemat,
                                    pengalaman modern, dan checkout cepat.
                                </p>
                                <a
                                    href="#produk-populer"
                                    className="mt-6 inline-block rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500"
                                >
                                    Belanja Sekarang
                                </a>
                            </div>
                            <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 p-8 text-7xl text-white text-center">
                                📦 ⚡
                            </div>
                        </section>
                    )}

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {highlights.map((item, index) => (
                            <div
                                key={item.label}
                                className={`rounded-3xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${cardClass}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-3xl">{item.icon}</span>
                                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-500">
                                        0{index + 1}
                                    </span>
                                </div>
                                <p className={`mt-4 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                                    {item.label}
                                </p>
                                <p className="mt-1 text-2xl font-bold">
                                    {index === 0
                                        ? products.length
                                        : index === 1
                                            ? categories.length
                                            : index === 2
                                                ? '100%'
                                                : '24/7'}
                                </p>
                            </div>
                        ))}
                    </section>

                    {/* Kategori */}
                    <section>
                        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            Kategori Produk
                        </h2>
                        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                            {categories.length === 0 ? (
                                <p className="col-span-4 text-sm text-slate-400">Belum ada kategori.</p>
                            ) : (
                                categories.map((category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        onClick={() => setActiveCategory((prev) => prev === category.name ? '' : category.name)}
                                        className={`rounded-2xl border p-4 text-center font-semibold transition hover:border-indigo-400 hover:shadow-sm ${
                                            activeCategory === category.name
                                                ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                                                : cardClass
                                        }`}
                                    >
                                        <span className="mr-2 text-2xl">{category.icon ?? '🛒'}</span>
                                        <span className="block mt-1 text-sm">{category.name}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </section>

                    {/* Filter aktif: tampilkan semua produk yang match */}
                    {(query.trim() || activeCategory) && (
                        <section>
                            <div className="flex items-center justify-between">
                                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {activeCategory ? `Kategori: ${activeCategory}` : `Hasil: "${query}"`}
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => { setQuery(''); setActiveCategory(''); }}
                                    className="text-sm text-indigo-500 hover:underline"
                                >
                                    Hapus Filter ×
                                </button>
                            </div>
                            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                {filteredProducts.length === 0 ? (
                                    <p className="col-span-4 text-sm text-slate-400">Tidak ada produk yang cocok.</p>
                                ) : (
                                    filteredProducts.map((product) => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            darkMode={darkMode}
                                            cardClass={cardClass}
                                            isWished={localWishlist.includes(product.id)}
                                            loadingCart={loadingCart === product.id}
                                            loadingWishlist={loadingWishlist === product.id}
                                            onAddToCart={(size) => addToCart(product, size)}
                                            onToggleWishlist={() => toggleWishlist(product)}
                                            showActions={!!auth?.user && isUser}
                                        />
                                    ))
                                )}
                            </div>
                        </section>
                    )}

                    {/* Produk Populer */}
                    {!query.trim() && !activeCategory && (
                    <section id="produk-populer">
                        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            Produk Populer
                        </h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {bestSellers.length === 0 ? (
                                <p className="col-span-4 text-sm text-slate-400">Belum ada produk populer.</p>
                            ) : (
                                bestSellers.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        darkMode={darkMode}
                                        cardClass={cardClass}
                                        isWished={localWishlist.includes(product.id)}
                                        loadingCart={loadingCart === product.id}
                                        loadingWishlist={loadingWishlist === product.id}
                                        onAddToCart={(size) => addToCart(product, size)}
                                        onToggleWishlist={() => toggleWishlist(product)}
                                        showActions={!!auth?.user && isUser}
                                    />
                                ))
                            )}
                        </div>
                    </section>
                    )}

                    {/* Flash Sale Banner */}
                    <section className="rounded-3xl bg-gradient-to-r from-rose-500 to-orange-500 p-8 text-white">
                        <h2 className="text-2xl font-bold">🔥 Promo Spesial Minggu Ini</h2>
                        <p className="mt-2 opacity-90">Flash Sale &mdash; Harga terbaik setiap hari di GoBelanja!</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <Link
                                href={route('products.search', { flash_sale: true })}
                                className="inline-block rounded-xl bg-white px-5 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
                            >
                                🔍 Lihat Semua Flash Sale
                            </Link>
                            {!auth?.user && (
                                <Link
                                    href={route('register')}
                                    className="inline-block rounded-xl border-2 border-white px-5 py-2 text-sm font-semibold text-white hover:bg-white hover:text-rose-600"
                                >
                                    Daftar Gratis & Belanja
                                </Link>
                            )}
                        </div>
                    </section>

                    {/* Produk Terbaru */}
                    {!query.trim() && !activeCategory && (
                    <section>
                        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            Produk Terbaru
                        </h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                            {newestProducts.length === 0 ? (
                                <p className="col-span-3 text-sm text-slate-400">Belum ada produk baru.</p>
                            ) : (
                                newestProducts.map((product) => (
                                    <ProductCard
                                        key={`new-${product.id}`}
                                        product={product}
                                        darkMode={darkMode}
                                        cardClass={cardClass}
                                        isWished={localWishlist.includes(product.id)}
                                        loadingCart={loadingCart === product.id}
                                        loadingWishlist={loadingWishlist === product.id}
                                        onAddToCart={(size) => addToCart(product, size)}
                                        onToggleWishlist={() => toggleWishlist(product)}
                                        showActions={!!auth?.user && isUser}
                                        badge="NEW"
                                    />
                                ))
                            )}
                        </div>
                    </section>
                    )}

                    {/* Testimonials */}
                    {testimonials.length > 0 && (
                        <section>
                            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                Apa Kata Pelanggan
                            </h2>
                            <div className="mt-4 grid gap-4 md:grid-cols-3">
                                {testimonials.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`rounded-2xl border p-5 ${cardClass}`}
                                    >
                                        <p className={darkMode ? 'text-slate-200' : 'text-slate-700'}>
                                            {'⭐'.repeat(item.rating)}
                                        </p>
                                        <p className={`mt-2 text-sm ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                                            {item.comment}
                                        </p>
                                        <p className="mt-3 font-semibold">{item.name}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Why Choose Us */}
                    <section className={`rounded-3xl border p-8 ${cardClass}`}>
                        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            Kenapa GoBelanja?
                        </h2>
                        <ul className="mt-4 grid gap-2 md:grid-cols-2">
                            {features.map((feature) => (
                                <li
                                    key={feature}
                                    className={`flex items-center gap-2 rounded-xl p-3 ${
                                        darkMode
                                            ? 'bg-slate-800 text-slate-100'
                                            : 'bg-slate-100 text-slate-800'
                                    }`}
                                >
                                    <span className="text-indigo-500">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Newsletter */}
                    <section className={`overflow-hidden rounded-3xl border ${cardClass}`}>
                        <div className={`grid gap-0 lg:grid-cols-[1.2fr_0.8fr]`}>
                            <div className="bg-gradient-to-br from-indigo-600 via-violet-600 to-cyan-500 p-8 text-white sm:p-10">
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/75">
                                    Newsletter GoBelanja
                                </p>
                                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                                    Promo terbaru, produk baru, dan penawaran spesial langsung ke inbox.
                                </h2>
                                <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
                                    Subscribe sekarang untuk dapat info flash sale, rekomendasi produk, dan kabar promo terbaik tanpa perlu ketinggalan.
                                </p>

                                <div className="mt-6 flex flex-wrap gap-3 text-sm text-white/90">
                                    <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">🎁 Promo eksklusif</span>
                                    <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">⚡ Update flash sale</span>
                                    <span className="rounded-full border border-white/20 bg-white/10 px-4 py-2">🛍️ Rekomendasi produk</span>
                                </div>
                            </div>

                            <div className={`p-8 sm:p-10 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
                                <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                    Subscribe sekarang
                                </h3>
                                <p className={`mt-2 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                    Cukup masukkan email aktif Anda, kami akan kirim update terbaik dari toko.
                                </p>

                                <form onSubmit={handleNewsletterSubscribe} className="mt-6 space-y-4">
                                    <input
                                        type="email"
                                        value={newsletterEmail}
                                        onChange={(e) => setNewsletterEmail(e.target.value)}
                                        placeholder="Masukkan email Anda"
                                        className={`w-full rounded-2xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                            darkMode
                                                ? 'border-slate-700 bg-slate-950 text-slate-100 placeholder:text-slate-400'
                                                : 'border-slate-300 bg-white text-slate-900 placeholder:text-slate-500'
                                        }`}
                                    />

                                    <button
                                        type="submit"
                                        disabled={newsletterLoading}
                                        className="w-full rounded-2xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {newsletterLoading ? 'Menyimpan...' : 'Subscribe Sekarang'}
                                    </button>
                                </form>

                                {newsletterFeedback && (
                                    <div
                                        className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
                                            newsletterFeedback.type === 'success'
                                                ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                                : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
                                        }`}
                                    >
                                        {newsletterFeedback.type === 'success' ? '✅ ' : '⚠️ '}
                                        {newsletterFeedback.message}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </main>

                <footer
                    className={`border-t py-8 text-center text-sm ${
                        darkMode
                            ? 'border-slate-700 text-slate-300'
                            : 'border-slate-200 text-slate-600'
                    }`}
                >
                    <p>© {new Date().getFullYear()} {appName}. All rights reserved.</p>
                    <p className="mt-1">Tentang Kami • Kontak • Privacy Policy • Terms</p>
                </footer>
            </div>

            {/* Comparison Floating Bar */}
            {isUser && <ComparisonBar />}
        </>
    );
}

function ProductCard({ product, darkMode, cardClass, isWished, loadingCart, loadingWishlist, onAddToCart, onToggleWishlist, showActions, badge }) {
    const images = (product.images && product.images.length > 0)
        ? product.images.map((img) => img.image_url)
        : product.image_url ? [product.image_url] : [];

    const [current, setCurrent] = useState(0);
    const [lightbox, setLightbox] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [imageFailed, setImageFailed] = useState(false);

    const openLightbox = () => { if (images.length > 0) { setZoom(1); setLightbox(true); } };
    const closeLightbox = () => setLightbox(false);
    const zoomIn  = (e) => { e.stopPropagation(); setZoom((z) => Math.min(z + 0.5, 4)); };
    const zoomOut = (e) => { e.stopPropagation(); setZoom((z) => Math.max(z - 0.5, 0.5)); };
    const prev = (e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + images.length) % images.length); };
    const next = (e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % images.length); };
    const prevLb = (e) => { e.stopPropagation(); setZoom(1); setCurrent((c) => (c - 1 + images.length) % images.length); };
    const nextLb = (e) => { e.stopPropagation(); setZoom(1); setCurrent((c) => (c + 1) % images.length); };

    useEffect(() => {
        if (!lightbox) return;
        const handler = (e) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') { setZoom(1); setCurrent((c) => (c - 1 + images.length) % images.length); }
            if (e.key === 'ArrowRight') { setZoom(1); setCurrent((c) => (c + 1) % images.length); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightbox, images.length]);

    return (
        <>
            {/* Lightbox */}
            {lightbox && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm" onClick={closeLightbox}>
                    {/* Controls */}
                    <div className="absolute top-4 right-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={zoomOut} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white text-lg font-bold hover:bg-white/40">−</button>
                        <button onClick={zoomIn}  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white text-lg font-bold hover:bg-white/40">+</button>
                        <button onClick={closeLightbox} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white text-lg font-bold hover:bg-white/40">✕</button>
                    </div>

                    {/* Prev / Next arrows in lightbox */}
                    {images.length > 1 && (
                        <>
                            <button onClick={prevLb} className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white text-xl hover:bg-white/40">‹</button>
                            <button onClick={nextLb} className="absolute right-16 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white text-xl hover:bg-white/40">›</button>
                        </>
                    )}

                    {/* Image */}
                    <div className="overflow-auto max-h-screen p-6" onClick={(e) => e.stopPropagation()}>
                        <img
                            src={images[current]}
                            alt={product.name}
                            style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.2s ease' }}
                            className="max-h-[80vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
                        />
                    </div>

                    {/* Dots */}
                    {images.length > 1 && (
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {images.map((_, i) => (
                                <button key={i} onClick={() => { setZoom(1); setCurrent(i); }}
                                    className={`h-2 w-2 rounded-full transition ${i === current ? 'bg-white' : 'bg-white/40'}`}
                                />
                            ))}
                        </div>
                    )}
                    <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/50">
                        {images.length > 1 ? `${current + 1} / ${images.length} · ` : ''}{product.name} · Esc untuk tutup
                    </p>
                </div>
            )}

            <article className={`rounded-2xl border overflow-hidden transition hover:shadow-md flex flex-col ${cardClass}`}>
                {/* Image carousel */}
                <div className="relative h-52 w-full bg-slate-100 group flex-shrink-0 sm:h-56 lg:h-52 xl:h-56">
                    {badge && (
                        <span className="absolute top-2 left-2 z-10 rounded-full bg-emerald-500 px-2 py-1 text-xs font-semibold text-white shadow">
                            {badge}
                        </span>
                    )}

                    {images.length > 0 && !imageFailed ? (
                        <img
                            src={images[current]}
                            alt={product.name}
                            className="h-full w-full bg-slate-50 object-contain object-center cursor-zoom-in"
                            onClick={openLightbox}
                            onError={() => setImageFailed(true)}
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-50 text-4xl sm:text-5xl">
                            {product.emoji ?? '📦'}
                        </div>
                    )}

                    {/* Prev/Next arrows (visible on hover) */}
                    {images.length > 1 && (
                        <>
                            <button onClick={prev}
                                className="absolute left-1 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white text-sm opacity-0 group-hover:opacity-100 transition hover:bg-black/60">
                                ‹
                            </button>
                            <button onClick={next}
                                className="absolute right-1 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white text-sm opacity-0 group-hover:opacity-100 transition hover:bg-black/60">
                                ›
                            </button>

                            {/* Dots indicator */}
                            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
                                {images.map((_, i) => (
                                    <span key={i} className={`block h-1.5 w-1.5 rounded-full transition ${i === current ? 'bg-white' : 'bg-white/50'}`} />
                                ))}
                            </div>
                        </>
                    )}
                </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4 lg:p-5">
                <p className="font-semibold leading-snug">{product.name}</p>
                <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    {product.category?.name}
                </p>
                <p className="mt-2 font-bold text-indigo-500">{formatPrice(product.price)}</p>
                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    ⭐ {Number(product.rating).toFixed(1)} &nbsp;·&nbsp; Stok: {product.stock}
                </p>

                {/* Size selector */}
                {product.sizes?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {product.sizes.map((s) => {
                            const name = typeof s === 'string' ? s : s.name;
                            return (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => setSelectedSize((prev) => prev === name ? '' : name)}
                                    className={`rounded-md border px-2 py-0.5 text-xs font-semibold transition ${
                                        selectedSize === name
                                            ? 'border-indigo-500 bg-indigo-500 text-white'
                                            : darkMode
                                                ? 'border-slate-600 text-slate-300 hover:border-indigo-400'
                                                : 'border-slate-300 text-slate-700 hover:border-indigo-400'
                                    }`}
                                >
                                    {name}
                                </button>
                            );
                        })}
                    </div>
                )}

                {showActions ? (
                    <div className="mt-auto pt-3 space-y-2">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => onAddToCart(selectedSize)}
                                disabled={loadingCart || product.stock === 0 || (product.sizes?.length > 0 && !selectedSize)}
                                className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                                title={product.sizes?.length > 0 && !selectedSize ? 'Pilih ukuran dahulu' : ''}
                            >
                                {loadingCart ? '...' : product.stock === 0 ? 'Habis' : product.sizes?.length > 0 && !selectedSize ? 'Pilih Ukuran' : '+ Keranjang'}
                            </button>
                            <button
                                type="button"
                                onClick={onToggleWishlist}
                                disabled={loadingWishlist}
                                className={`rounded-lg border px-3 py-2 text-sm transition ${
                                    isWished
                                        ? 'border-rose-400 bg-rose-50 text-rose-600'
                                        : darkMode
                                            ? 'border-slate-600 text-slate-100 hover:border-rose-400'
                                            : 'border-slate-300 text-slate-700 hover:border-rose-400'
                                }`}
                            >
                                {isWished ? '❤️' : '🤍'}
                            </button>
                        </div>
                        <AddToCompareButton product={product} className="w-full px-3 py-2" />
                    </div>
                ) : (
                    <div className="mt-auto pt-3 space-y-2">
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => onAddToCart(selectedSize)}
                                disabled={product.sizes?.length > 0 && !selectedSize}
                                className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                            >
                                {product.sizes?.length > 0 && !selectedSize ? 'Pilih Ukuran' : '+ Keranjang'}
                            </button>
                            <button
                                type="button"
                                onClick={onToggleWishlist}
                                className={`rounded-lg border px-3 py-2 text-sm ${
                                    darkMode
                                        ? 'border-slate-600 text-slate-100'
                                        : 'border-slate-300 text-slate-700'
                                }`}
                            >
                                🤍
                            </button>
                        </div>
                        <AddToCompareButton product={product} className="w-full px-3 py-2" />
                    </div>
                )}
            </div>
        </article>
        </>
    );
}
