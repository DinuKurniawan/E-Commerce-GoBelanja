import { router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PublicLayout from '@/Layouts/PublicLayout';
import CountdownTimer from '@/Components/CountdownTimer';

export default function FlashSales({ auth, flashSales }) {
    const handleAddToCart = (productId) => {
        router.post(route('user.cart.store'), { product_id: productId, quantity: 1 });
    };

    const content = (
        <div className="py-8 sm:py-10 lg:py-12">
            <div className="px-4 sm:px-6 lg:px-8">
                {!auth?.user && (
                    <div className="mb-6 rounded-3xl bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 px-6 py-8 text-white shadow-lg sm:px-8">
                        <h1 className="text-3xl font-bold md:text-4xl">⚡ Flash Sale - Penawaran Terbatas!</h1>
                        <p className="mt-2 max-w-2xl text-sm text-white/90 sm:text-base">
                            Pantau promo aktif, stok terbatas, dan diskon spesial yang sedang berlangsung sekarang.
                        </p>
                    </div>
                )}

                    {flashSales.length === 0 ? (
                        <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                            <div className="text-6xl mb-4">⚡</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">
                                Tidak Ada Flash Sale Aktif
                            </h3>
                            <p className="text-gray-600">
                                Pantau terus untuk penawaran terbatas berikutnya!
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            {flashSales.map((flashSale) => {
                                const product = flashSale.product;
                                const isSoldOut = flashSale.max_quantity && 
                                                  flashSale.sold_quantity >= flashSale.max_quantity;

                                return (
                                    <div
                                        key={flashSale.id}
                                        className="bg-white rounded-lg shadow-lg overflow-hidden relative group hover:shadow-xl transition-shadow"
                                    >
                                        {/* Flash Sale Badge */}
                                        <div className="absolute top-3 left-3 z-10">
                                            <span className="px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                                                ⚡ FLASH SALE
                                            </span>
                                        </div>

                                        {/* Discount Badge */}
                                        <div className="absolute top-3 right-3 z-10">
                                            <span className="px-3 py-1 bg-yellow-400 text-red-700 text-sm font-bold rounded-full shadow-lg">
                                                -{flashSale.discount_percent}%
                                            </span>
                                        </div>

                                        {/* Product Image */}
                                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-12 flex items-center justify-center">
                                            <span className="text-8xl group-hover:scale-110 transition-transform">
                                                {product.emoji}
                                            </span>
                                        </div>

                                        <div className="p-5">
                                            {/* Product Name */}
                                            <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2">
                                                {product.name}
                                            </h3>

                                            {/* Flash Sale Name */}
                                            <p className="text-sm text-gray-600 mb-3">{flashSale.name}</p>

                                            {/* Price */}
                                            <div className="mb-3">
                                                <div className="text-sm text-gray-500 line-through">
                                                    Rp {Number(product.price).toLocaleString('id-ID')}
                                                </div>
                                                <div className="text-2xl font-bold text-green-600">
                                                    Rp {Number(flashSale.flash_price).toLocaleString('id-ID')}
                                                </div>
                                                <div className="text-xs text-green-600">
                                                    Hemat Rp {Number(product.price - flashSale.flash_price).toLocaleString('id-ID')}
                                                </div>
                                            </div>

                                            {/* Quantity Sold */}
                                            {flashSale.max_quantity && (
                                                <div className="mb-3">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-gray-600">Terjual</span>
                                                        <span className="font-semibold">
                                                            {flashSale.sold_quantity} / {flashSale.max_quantity}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                                        <div
                                                            className="bg-gradient-to-r from-orange-500 to-red-600 h-3 rounded-full transition-all"
                                                            style={{ width: `${flashSale.progress_percent}%` }}
                                                        ></div>
                                                    </div>
                                                    {flashSale.remaining_quantity && (
                                                        <p className="text-xs text-orange-600 mt-1">
                                                            ⚠️ Hanya tersisa {flashSale.remaining_quantity} item!
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {/* Countdown Timer */}
                                            <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                                                <p className="text-xs text-gray-600 mb-1">Berakhir dalam:</p>
                                                <CountdownTimer 
                                                    endsAt={flashSale.ends_at} 
                                                    className="text-base"
                                                />
                                            </div>

                                            {/* Add to Cart Button */}
                                            {auth?.user ? (
                                                <button
                                                    onClick={() => handleAddToCart(product.id)}
                                                    disabled={isSoldOut}
                                                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                                                        isSoldOut
                                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                                                    }`}
                                                >
                                                    {isSoldOut ? '❌ Stok Habis' : '🛒 Tambah ke Keranjang'}
                                                </button>
                                            ) : (
                                                <a
                                                    href={route('login')}
                                                    className="block w-full py-3 rounded-lg font-semibold text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-colors"
                                                >
                                                    Login untuk Beli
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
        </div>
    );

    return auth?.user ? (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    ⚡ Flash Sale - Penawaran Terbatas!
                </h2>
            }
        >
            {content}
        </AuthenticatedLayout>
    ) : (
        <PublicLayout title="Flash Sale">
            {content}
        </PublicLayout>
    );
}
