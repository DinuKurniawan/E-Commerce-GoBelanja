import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import SearchBar from '@/Components/SearchBar';
import ProductFilters from '@/Components/ProductFilters';
import { StarIcon, ShoppingCartIcon, HeartIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutlineIcon } from '@heroicons/react/24/outline';

export default function ProductSearch({ 
    auth,
    products, 
    categories, 
    priceRange, 
    filters: initialFilters = {} 
}) {
    const authData = auth ?? { user: null };
    const [wishlist, setWishlist] = useState([]);

    const handleSearch = (query) => {
        router.get(route('products.search'), { ...initialFilters, q: query }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleFilterChange = (newFilters) => {
        const params = {
            q: initialFilters.q,
            ...newFilters,
        };

        // Remove empty values
        Object.keys(params).forEach(key => {
            if (params[key] === '' || params[key] === null || 
                (Array.isArray(params[key]) && params[key].length === 0)) {
                delete params[key];
            }
        });

        router.get(route('products.search'), params, {
            preserveState: true,
            preserveScroll: false,
        });
    };

    const removeFilter = (filterType, value = null) => {
        const newFilters = { ...initialFilters };
        
        if (filterType === 'category' && value) {
            const categories = Array.isArray(newFilters.categories) 
                ? newFilters.categories.filter(id => id !== value)
                : [];
            newFilters.categories = categories;
        } else if (filterType === 'price') {
            delete newFilters.min_price;
            delete newFilters.max_price;
        } else {
            delete newFilters[filterType];
        }

        handleFilterChange(newFilters);
    };

    const getActiveFilters = () => {
        const active = [];

        if (initialFilters.q) {
            active.push({ type: 'q', label: `Pencarian: "${initialFilters.q}"`, value: initialFilters.q });
        }

        if (initialFilters.min_price || initialFilters.max_price) {
            const min = initialFilters.min_price || priceRange.min;
            const max = initialFilters.max_price || priceRange.max;
            active.push({ 
                type: 'price', 
                label: `Harga: ${formatPrice(min)} - ${formatPrice(max)}` 
            });
        }

        if (initialFilters.categories && initialFilters.categories.length > 0) {
            const categoryIds = Array.isArray(initialFilters.categories) 
                ? initialFilters.categories 
                : [initialFilters.categories];
            
            categoryIds.forEach(id => {
                const category = categories.find(c => c.id === parseInt(id));
                if (category) {
                    active.push({ 
                        type: 'category', 
                        label: category.name, 
                        value: category.id 
                    });
                }
            });
        }

        if (initialFilters.min_rating) {
            active.push({ 
                type: 'min_rating', 
                label: `Rating ≥ ${initialFilters.min_rating}★` 
            });
        }

        if (initialFilters.availability) {
            const label = initialFilters.availability === 'in_stock' 
                ? 'Stok Tersedia' 
                : 'Pre-Order';
            active.push({ type: 'availability', label });
        }

        if (initialFilters.flash_sale) {
            active.push({ type: 'flash_sale', label: 'Flash Sale' });
        }

        return active;
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const activeFilters = getActiveFilters();

    const pageContent = (
        <>
            <Head title="Cari Produk" />

            <div className="min-h-screen bg-slate-50 py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    {!authData.user && (
                        <div className="mb-6 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-lg">
                            <div className="flex flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between md:px-8">
                                <div className="max-w-2xl">
                                    <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white/90 hover:text-white">
                                        ← Kembali ke Beranda
                                    </Link>
                                    <h1 className="mt-3 text-3xl font-bold md:text-4xl">
                                        Cari Produk & Flash Sale
                                    </h1>
                                    <p className="mt-2 text-sm text-white/85 md:text-base">
                                        Jelajahi produk terbaik, filter lebih cepat, dan temukan promo yang sedang aktif.
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <Link
                                        href={route('login')}
                                        className="rounded-xl border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-white/20"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-indigo-700 hover:bg-slate-100"
                                    >
                                        Daftar
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Search Bar */}
                    <div className="mb-6">
                        <SearchBar 
                            initialQuery={initialFilters.q || ''} 
                            onSearch={handleSearch}
                        />
                    </div>

                    {/* Active Filters */}
                    {activeFilters.length > 0 && (
                        <div className="mb-6">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-gray-700">Filter Aktif:</span>
                                {activeFilters.map((filter, index) => (
                                    <button
                                        key={`${filter.type}-${filter.value || index}`}
                                        onClick={() => removeFilter(filter.type, filter.value)}
                                        className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-200"
                                    >
                                        {filter.label}
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                ))}
                                {activeFilters.length > 1 && (
                                    <button
                                        onClick={() => router.get(route('products.search'))}
                                        className="text-sm font-medium text-red-600 hover:text-red-700"
                                    >
                                        Hapus Semua
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
                        {/* Filters Sidebar */}
                        <div className="lg:col-span-1">
                            <ProductFilters
                                categories={categories}
                                priceRange={priceRange}
                                filters={initialFilters}
                                onFilterChange={handleFilterChange}
                            />
                        </div>

                        {/* Products Grid */}
                        <div className="mt-6 lg:col-span-3 lg:mt-0">
                            {/* Results Header */}
                            <div className="mb-4 flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-200 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-sm text-gray-600">
                                    Menampilkan <span className="font-semibold">{products.data.length}</span> dari{' '}
                                    <span className="font-semibold">{products.total}</span> produk
                                </p>
                                <p className="text-xs text-gray-500">
                                    Urutkan dan filter produk untuk hasil yang lebih relevan.
                                </p>
                            </div>

                            {/* Products */}
                            {products.data.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        {products.data.map((product) => (
                                            <ProductCard
                                                key={product.id}
                                                product={product}
                                                auth={authData}
                                                wishlist={wishlist}
                                                setWishlist={setWishlist}
                                            />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {products.last_page > 1 && (
                                        <div className="mt-8 flex items-center justify-center gap-2">
                                            {products.links.map((link, index) => (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    preserveState
                                                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                                                        link.active
                                                            ? 'bg-blue-600 text-white'
                                                            : link.url
                                                            ? 'bg-white text-gray-700 hover:bg-gray-50 ring-1 ring-gray-300'
                                                            : 'cursor-not-allowed bg-gray-100 text-gray-400'
                                                    }`}
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <NoResults />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    return authData.user ? (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Cari Produk
                </h2>
            }
        >
            {pageContent}
        </AuthenticatedLayout>
    ) : (
        pageContent
    );
}

function ProductCard({ product, auth, wishlist, setWishlist }) {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const isInWishlist = wishlist.includes(product.id);
    const hasRating = typeof product.rating === 'number' && Number.isFinite(product.rating) && product.rating > 0;
    const ratingValue = hasRating ? product.rating : 0;

    const handleAddToCart = () => {
        if (!auth?.user) {
            router.visit(route('login'));
            return;
        }

        setIsAddingToCart(true);
        router.post(
            route('user.cart.store'),
            {
                product_id: product.id,
                quantity: 1,
            },
            {
                onFinish: () => setIsAddingToCart(false),
                preserveScroll: true,
            }
        );
    };

    const handleToggleWishlist = () => {
        if (!auth?.user) {
            router.visit(route('login'));
            return;
        }

        if (isInWishlist) {
            setWishlist(wishlist.filter(id => id !== product.id));
        } else {
            setWishlist([...wishlist, product.id]);
        }

        router.post(
            route('user.wishlist.toggle'),
            { product_id: product.id },
            { preserveScroll: true }
        );
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="group relative overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-lg">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-6xl">
                        {product.emoji || '📦'}
                    </div>
                )}

                {/* Badges */}
                <div className="absolute left-2 top-2 flex flex-col gap-1">
                    {product.is_new && (
                        <span className="rounded-full bg-green-500 px-2 py-0.5 text-xs font-semibold text-white">
                            BARU
                        </span>
                    )}
                    {product.is_featured && (
                        <span className="rounded-full bg-purple-500 px-2 py-0.5 text-xs font-semibold text-white">
                            FEATURED
                        </span>
                    )}
                    {product.stock === 0 && (
                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-semibold text-white">
                            HABIS
                        </span>
                    )}
                    {product.allow_pre_order && (
                        <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
                            PRE-ORDER
                        </span>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={handleToggleWishlist}
                    className="absolute right-2 top-2 rounded-full bg-white p-2 shadow-md transition-all hover:scale-110"
                >
                    {isInWishlist ? (
                        <HeartIcon className="h-5 w-5 text-red-500" />
                    ) : (
                        <HeartOutlineIcon className="h-5 w-5 text-gray-400" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Category */}
                {product.category && (
                    <div className="mb-2 flex items-center gap-1 text-xs text-gray-500">
                        {product.category.icon && <span>{product.category.icon}</span>}
                        <span>{product.category.name}</span>
                    </div>
                )}

                {/* Name */}
                <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900">
                    {product.name}
                </h3>

                {/* Rating */}
                <div className="mb-3 flex items-center gap-1">
                    <div className="flex">
                        {[...Array(5)].map((_, i) => (
                            <StarIcon
                                key={i}
                                className={`h-4 w-4 ${
                                    i < Math.floor(ratingValue)
                                        ? 'text-yellow-400'
                                        : 'text-gray-300'
                                }`}
                            />
                        ))}
                    </div>
                    <span className="text-xs text-gray-600">
                        {hasRating ? `(${ratingValue.toFixed(1)})` : '(Belum ada rating)'}
                    </span>
                </div>

                {/* Price */}
                <div className="mb-4">
                    <p className="text-lg font-bold text-blue-600">
                        {formatPrice(product.price)}
                    </p>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart || (product.stock === 0 && !product.allow_pre_order)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                    {isAddingToCart ? (
                        <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Menambahkan...
                        </>
                    ) : (
                        <>
                            <ShoppingCartIcon className="h-5 w-5" />
                            {product.stock === 0 && product.allow_pre_order
                                ? 'Pre-Order'
                                : product.stock === 0
                                ? 'Stok Habis'
                                : 'Tambah ke Keranjang'}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

function NoResults() {
    return (
        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <div className="mb-4 text-6xl">🔍</div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Tidak Ada Produk Ditemukan
            </h3>
            <p className="mb-6 text-gray-600">
                Coba ubah filter atau kata kunci pencarian Anda
            </p>
            <Link
                href={route('products.search')}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
                Reset Pencarian
            </Link>
        </div>
    );
}
