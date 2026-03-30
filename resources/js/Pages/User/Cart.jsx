import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const STATUS_MAP = {
    pending:  { label: 'Pending',  color: 'bg-yellow-100 text-yellow-700' },
    diproses: { label: 'Diproses', color: 'bg-blue-100 text-blue-700' },
    dikirim:  { label: 'Dikirim',  color: 'bg-indigo-100 text-indigo-700' },
    selesai:  { label: 'Selesai',  color: 'bg-emerald-100 text-emerald-700' },
};

export default function UserCart({ cartItems, products, cartTotal }) {
    const productOptions = products ?? [];
    const items = cartItems ?? [];
    const { flash } = usePage().props;

    const [addProductId, setAddProductId] = useState(productOptions[0]?.id ?? '');
    const [addQty, setAddQty] = useState(1);
    const [quantities, setQuantities] = useState(
        Object.fromEntries(items.map((item) => [item.id, item.quantity]))
    );

    const addToCart = (e) => {
        e.preventDefault();
        if (!addProductId) return;
        router.post(route('user.cart.store'), { product_id: addProductId, quantity: addQty }, {
            preserveScroll: true,
            onSuccess: () => setAddQty(1),
        });
    };

    const updateQty = (id) => {
        const qty = quantities[id];
        if (!qty) return;
        router.put(route('user.cart.update', id), { quantity: qty }, { preserveScroll: true });
    };

    const remove = (id) => {
        router.delete(route('user.cart.destroy', id), { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-800">Keranjang Belanja</h2>}
        >
            <Head title="Keranjang" />

            <div className="py-10">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {flash.success}
                        </div>
                    )}
                    {flash?.error && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                            {flash.error}
                        </div>
                    )}

                    {/* Add product to cart */}
                    {productOptions.length > 0 && (
                        <form onSubmit={addToCart} className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex-1 min-w-[200px]">
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Produk</label>
                                <select
                                    value={addProductId}
                                    onChange={(e) => setAddProductId(e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                >
                                    {productOptions.map((product) => (
                                        <option key={product.id} value={product.id} disabled={product.stock < 1}>
                                            {product.emoji} {product.name} — Rp{Number(product.price).toLocaleString('id-ID')}
                                            {product.stock < 1 ? ' (Habis)' : ` (Stok: ${product.stock})`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-24">
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Qty</label>
                                <input
                                    type="number"
                                    min={1}
                                    max={99}
                                    value={addQty}
                                    onChange={(e) => setAddQty(Number(e.target.value))}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                            >
                                Tambah ke Keranjang
                            </button>
                        </form>
                    )}

                    {/* Cart items */}
                    {items.length === 0 ? (
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-16 text-center text-slate-500 shadow-sm">
                            Keranjang masih kosong.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((item) => {
                                const price = Number(item.product?.price ?? 0);
                                const qty = quantities[item.id] ?? item.quantity;
                                const subtotal = price * qty;
                                const maxStock = item.product?.stock ?? 99;

                                return (
                                    <div key={item.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                                        {/* Product image - full width */}
                                        <div className="relative w-full aspect-[4/3] bg-slate-100">
                                            {(() => {
                                                const src = item.product?.images?.[0]?.image_url
                                                    ?? item.product?.image_url
                                                    ?? null;
                                                return src ? (
                                                    <img
                                                        src={src}
                                                        alt={item.product?.name}
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center text-5xl text-slate-300">
                                                        🛍️
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Content */}
                                        <div className="flex flex-col flex-1 p-4">
                                        {/* Name & stock warning */}
                                        <p className="font-semibold text-slate-900 leading-snug">
                                            {item.product?.name}
                                            {item.size && (
                                                <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                                                    {item.size}
                                                </span>
                                            )}
                                        </p>
                                        {item.product?.stock < 5 && item.product?.stock > 0 && (
                                            <span className="mt-0.5 text-xs text-orange-500">Stok terbatas!</span>
                                        )}

                                        {/* Price */}
                                        <p className="mt-1 text-sm text-slate-500">
                                            Rp{price.toLocaleString('id-ID')} / pcs
                                        </p>

                                        {/* Qty + Update */}
                                        <div className="mt-3 flex items-center gap-2">
                                            <input
                                                type="number"
                                                min={1}
                                                max={maxStock}
                                                value={qty}
                                                onChange={(e) =>
                                                    setQuantities((prev) => ({
                                                        ...prev,
                                                        [item.id]: Number(e.target.value),
                                                    }))
                                                }
                                                className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => updateQty(item.id)}
                                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                            >
                                                Update
                                            </button>
                                        </div>

                                        {/* Subtotal + Hapus */}
                                        <div className="mt-auto pt-4 flex items-center justify-between">
                                            <p className="font-bold text-indigo-600">
                                                Rp{subtotal.toLocaleString('id-ID')}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => remove(item.id)}
                                                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                        </div>{/* end content */}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Total & Checkout */}
                    {items.length > 0 && (
                        <div className="flex flex-col items-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-baseline gap-3">
                                <p className="text-sm text-slate-500">Total Keranjang</p>
                                <p className="text-2xl font-bold text-slate-900">
                                    Rp{Number(cartTotal).toLocaleString('id-ID')}
                                </p>
                            </div>
                            <Link
                                href={route('user.checkout.index')}
                                className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
                            >
                                Lanjut Checkout →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
