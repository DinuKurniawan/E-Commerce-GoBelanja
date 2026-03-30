import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';

function getImages(product) {
    if (product?.images?.length > 0) {
        return product.images.map((img) => img.image_url);
    }
    if (product?.image_url) return [product.image_url];
    return [];
}

export default function UserWishlist({ wishlists, products }) {
    const productOptions = products ?? [];
    const wishlistItems = wishlists ?? [];

    const form = useForm({
        product_id: productOptions[0]?.id ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('user.wishlist.store'));
    };

    const remove = (id) => {
        router.delete(route('user.wishlist.destroy', id));
    };

    const moveToCart = (id) => {
        router.patch(route('user.wishlist.move-to-cart', id));
    };

    const addToCart = (productId) => {
        if (!productId) return;
        router.post(route('user.cart.store'), { product_id: productId, quantity: 1 });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-800">Wishlist</h2>}
        >
            <Head title="Wishlist" />

            <div className="py-10">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">
                    <form
                        onSubmit={submit}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:flex-row"
                    >
                        {productOptions.length > 0 ? (
                            <select
                                value={form.data.product_id}
                                onChange={(e) => form.setData('product_id', e.target.value)}
                                className="rounded-lg border-slate-300"
                            >
                                {productOptions.map((product) => (
                                    <option key={product.id} value={product.id}>
                                        {product.name}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <p className="text-sm text-slate-500">Belum ada produk tersedia.</p>
                        )}
                        <button
                            type="submit"
                            disabled={productOptions.length === 0}
                            className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500"
                        >
                            Tambah Wishlist
                        </button>
                    </form>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {wishlistItems.length === 0 && (
                            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
                                Wishlist masih kosong.
                            </div>
                        )}
                        {wishlistItems.map((item) => {
                            const images = getImages(item.product);
                            const firstImage = images[0] ?? null;

                            return (
                                <div
                                    key={item.id}
                                    className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                                >
                                    {/* Gambar produk */}
                                    <div className="relative w-full aspect-[4/3] bg-slate-100">
                                        {firstImage ? (
                                            <img
                                                src={firstImage}
                                                alt={item.product?.name}
                                                className="h-full w-full object-cover"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-5xl text-slate-300">
                                                🛍️
                                            </div>
                                        )}
                                    </div>

                                    {/* Info & Tombol */}
                                    <div className="flex flex-1 flex-col p-4">
                                        <p className="font-semibold text-slate-900 leading-snug">
                                            {item.product?.name}
                                        </p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {item.product?.category?.name ?? ''}
                                        </p>
                                        <p className="mt-1 font-bold text-indigo-600">
                                            Rp{Number(item.product?.price ?? 0).toLocaleString('id-ID')}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            Stok: {item.product?.stock ?? 0}
                                        </p>

                                        <div className="mt-auto pt-4 flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => addToCart(item.product?.id)}
                                                className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                + Keranjang
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveToCart(item.id)}
                                                className="flex-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                                            >
                                                Pindah ke Cart
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => remove(item.id)}
                                                className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-400"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
