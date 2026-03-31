import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import useConfirm from '@/Hooks/useConfirm';
import { useState } from 'react';

export default function Promotions({ promotions, categories, products }) {
    const { flash } = usePage().props;
    const promoList = promotions ?? [];
    const { confirm, ConfirmDialog } = useConfirm();
    const [showForm, setShowForm] = useState(false);

    const form = useForm({
        name: '',
        code: '',
        promotion_type: 'voucher',
        discount_percent: '10',
        minimum_purchase: '0',
        expires_at: '',
        is_active: true,
        description: '',
        
        // BOGO fields
        buy_quantity: '2',
        get_quantity: '1',
        get_discount_percent: '100',
        
        // Bundle fields
        bundle_products: [],
        bundle_price: '0',
        
        // Category fields
        category_id: '',
        
        // Tiered fields
        tier_levels: [
            { amount: 100000, discount_percent: 5 },
            { amount: 500000, discount_percent: 10 },
        ],
        
        // Free shipping fields
        shipping_free_above: '100000',
        shipping_courier: '',
        shipping_regions: [],
        
        // Applies to
        applies_to: 'all',
        applicable_product_ids: [],
        
        // Usage limits
        usage_limit: '',
        per_user_limit: '',
        max_discount_amount: '',
        can_stack: false,
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('admin.promotions.store'), {
            onSuccess: () => {
                form.reset();
                setShowForm(false);
            },
        });
    };

    const destroy = async (id) => {
        const ok = await confirm('Promosi ini akan dihapus permanen.', { danger: true, title: 'Hapus Promosi' });
        if (!ok) return;
        router.delete(route('admin.promotions.destroy', id));
    };

    const toggleActive = (promotion) => {
        router.patch(route('admin.promotions.toggle', promotion.id));
    };

    const addTierLevel = () => {
        form.setData('tier_levels', [...form.data.tier_levels, { amount: 0, discount_percent: 0 }]);
    };

    const removeTierLevel = (index) => {
        const newTiers = form.data.tier_levels.filter((_, i) => i !== index);
        form.setData('tier_levels', newTiers);
    };

    const updateTierLevel = (index, field, value) => {
        const newTiers = [...form.data.tier_levels];
        newTiers[index][field] = value;
        form.setData('tier_levels', newTiers);
    };

    const getPromotionTypeLabel = (type) => {
        const labels = {
            voucher: 'Voucher Diskon',
            discount_product: 'Diskon Produk',
            bogo: 'BOGO (Buy One Get One)',
            bundle: 'Bundle Deal',
            free_shipping: 'Gratis Ongkir',
            category: 'Diskon Kategori',
            tiered: 'Diskon Berjenjang',
            first_purchase: 'Diskon Pembelian Pertama',
            bulk: 'Diskon Pembelian Banyak',
        };
        return labels[type] || type;
    };

    const renderDynamicFields = () => {
        const type = form.data.promotion_type;

        switch (type) {
            case 'bogo':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Beli Berapa</label>
                            <input
                                type="number"
                                value={form.data.buy_quantity}
                                onChange={(e) => form.setData('buy_quantity', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                min="1"
                            />
                            {form.errors.buy_quantity && <p className="mt-1 text-xs text-red-600">{form.errors.buy_quantity}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Dapat Berapa</label>
                            <input
                                type="number"
                                value={form.data.get_quantity}
                                onChange={(e) => form.setData('get_quantity', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                min="1"
                            />
                            {form.errors.get_quantity && <p className="mt-1 text-xs text-red-600">{form.errors.get_quantity}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Diskon Item Gratis (%)</label>
                            <input
                                type="number"
                                value={form.data.get_discount_percent}
                                onChange={(e) => form.setData('get_discount_percent', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                min="1"
                                max="100"
                            />
                            <p className="mt-1 text-xs text-slate-500">100% = Gratis penuh, 50% = Diskon 50%</p>
                        </div>
                    </div>
                );

            case 'bundle':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Pilih Produk Bundle (Min. 2)</label>
                            <select
                                multiple
                                value={form.data.bundle_products}
                                onChange={(e) => form.setData('bundle_products', Array.from(e.target.selectedOptions, option => parseInt(option.value)))}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                size="5"
                            >
                                {products?.map(product => (
                                    <option key={product.id} value={product.id}>
                                        {product.name} - Rp {product.price.toLocaleString('id-ID')}
                                    </option>
                                ))}
                            </select>
                            <p className="mt-1 text-xs text-slate-500">Tahan Ctrl/Cmd untuk pilih multiple</p>
                            {form.errors.bundle_products && <p className="mt-1 text-xs text-red-600">{form.errors.bundle_products}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Harga Bundle</label>
                            <input
                                type="number"
                                value={form.data.bundle_price}
                                onChange={(e) => form.setData('bundle_price', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                min="0"
                            />
                            {form.errors.bundle_price && <p className="mt-1 text-xs text-red-600">{form.errors.bundle_price}</p>}
                        </div>
                    </div>
                );

            case 'category':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Kategori</label>
                            <select
                                value={form.data.category_id}
                                onChange={(e) => form.setData('category_id', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            >
                                <option value="">Pilih Kategori</option>
                                {categories?.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {form.errors.category_id && <p className="mt-1 text-xs text-red-600">{form.errors.category_id}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Diskon (%)</label>
                            <input
                                type="number"
                                value={form.data.discount_percent}
                                onChange={(e) => form.setData('discount_percent', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                min="1"
                                max="100"
                            />
                        </div>
                    </div>
                );

            case 'tiered':
                return (
                    <div className="space-y-4">
                        <label className="block text-xs font-medium text-slate-600">Level Diskon Berjenjang</label>
                        {form.data.tier_levels.map((tier, index) => (
                            <div key={index} className="flex gap-2 items-start">
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        placeholder="Minimal Belanja"
                                        value={tier.amount}
                                        onChange={(e) => updateTierLevel(index, 'amount', parseInt(e.target.value))}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                    />
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        placeholder="Diskon %"
                                        value={tier.discount_percent}
                                        onChange={(e) => updateTierLevel(index, 'discount_percent', parseInt(e.target.value))}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                        min="1"
                                        max="100"
                                    />
                                </div>
                                {form.data.tier_levels.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeTierLevel(index)}
                                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addTierLevel}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            + Tambah Level
                        </button>
                    </div>
                );

            case 'free_shipping':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Minimal Belanja untuk Gratis Ongkir</label>
                            <input
                                type="number"
                                value={form.data.shipping_free_above}
                                onChange={(e) => form.setData('shipping_free_above', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                min="0"
                            />
                            {form.errors.shipping_free_above && <p className="mt-1 text-xs text-red-600">{form.errors.shipping_free_above}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Kurir Spesifik (Opsional)</label>
                            <select
                                value={form.data.shipping_courier}
                                onChange={(e) => form.setData('shipping_courier', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            >
                                <option value="">Semua Kurir</option>
                                <option value="jne">JNE</option>
                                <option value="pos">POS Indonesia</option>
                                <option value="tiki">TIKI</option>
                            </select>
                        </div>
                    </div>
                );

            case 'bulk':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Minimal Jumlah Item</label>
                            <input
                                type="number"
                                value={form.data.buy_quantity}
                                onChange={(e) => form.setData('buy_quantity', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                min="2"
                            />
                            {form.errors.buy_quantity && <p className="mt-1 text-xs text-red-600">{form.errors.buy_quantity}</p>}
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Diskon (%)</label>
                            <input
                                type="number"
                                value={form.data.discount_percent}
                                onChange={(e) => form.setData('discount_percent', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                min="1"
                                max="100"
                            />
                        </div>
                    </div>
                );

            case 'voucher':
            case 'discount_product':
            case 'first_purchase':
            default:
                return (
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Diskon (%)</label>
                        <input
                            type="number"
                            value={form.data.discount_percent}
                            onChange={(e) => form.setData('discount_percent', e.target.value)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                            min="1"
                            max="100"
                        />
                        {form.errors.discount_percent && <p className="mt-1 text-xs text-red-600">{form.errors.discount_percent}</p>}
                    </div>
                );
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-800">Manajemen Promosi</h2>}
        >
            <Head title="Manajemen Promosi" />
            {ConfirmDialog}

            <div className="py-10">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-slate-800">Daftar Promosi</h3>
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            {showForm ? 'Tutup Form' : '+ Buat Promosi Baru'}
                        </button>
                    </div>

                    {showForm && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-base font-semibold text-slate-700">Buat Promosi Baru</h3>
                            <form onSubmit={submit} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-600">Nama Promosi</label>
                                        <input
                                            type="text"
                                            value={form.data.name}
                                            onChange={(e) => form.setData('name', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                            required
                                        />
                                        {form.errors.name && <p className="mt-1 text-xs text-red-600">{form.errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-600">Kode Promosi</label>
                                        <input
                                            type="text"
                                            value={form.data.code}
                                            onChange={(e) => form.setData('code', e.target.value.toUpperCase())}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2 uppercase"
                                            required
                                        />
                                        {form.errors.code && <p className="mt-1 text-xs text-red-600">{form.errors.code}</p>}
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-1 block text-xs font-medium text-slate-600">Tipe Promosi</label>
                                        <select
                                            value={form.data.promotion_type}
                                            onChange={(e) => form.setData('promotion_type', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                        >
                                            <option value="voucher">Voucher Diskon</option>
                                            <option value="bogo">BOGO (Buy One Get One)</option>
                                            <option value="bundle">Bundle Deal</option>
                                            <option value="free_shipping">Gratis Ongkir</option>
                                            <option value="category">Diskon Kategori</option>
                                            <option value="tiered">Diskon Berjenjang</option>
                                            <option value="first_purchase">Diskon Pembelian Pertama</option>
                                            <option value="bulk">Diskon Pembelian Banyak</option>
                                        </select>
                                    </div>

                                    <div className="md:col-span-2">
                                        {renderDynamicFields()}
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-600">Minimal Pembelian (Rp)</label>
                                        <input
                                            type="number"
                                            value={form.data.minimum_purchase}
                                            onChange={(e) => form.setData('minimum_purchase', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                            min="0"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-600">Tanggal Kadaluarsa</label>
                                        <input
                                            type="datetime-local"
                                            value={form.data.expires_at}
                                            onChange={(e) => form.setData('expires_at', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-600">Batas Penggunaan Total</label>
                                        <input
                                            type="number"
                                            value={form.data.usage_limit}
                                            onChange={(e) => form.setData('usage_limit', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                            min="1"
                                            placeholder="Kosongkan untuk unlimited"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-600">Batas per User</label>
                                        <input
                                            type="number"
                                            value={form.data.per_user_limit}
                                            onChange={(e) => form.setData('per_user_limit', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                            min="1"
                                            placeholder="Kosongkan untuk unlimited"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-slate-600">Maksimal Diskon (Rp)</label>
                                        <input
                                            type="number"
                                            value={form.data.max_discount_amount}
                                            onChange={(e) => form.setData('max_discount_amount', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                            min="0"
                                            placeholder="Kosongkan untuk unlimited"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="mb-1 block text-xs font-medium text-slate-600">Deskripsi</label>
                                        <textarea
                                            value={form.data.description}
                                            onChange={(e) => form.setData('description', e.target.value)}
                                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                                            rows="2"
                                            placeholder="Deskripsi promosi untuk ditampilkan ke pelanggan"
                                        ></textarea>
                                    </div>

                                    <div className="md:col-span-2 flex items-center gap-4">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={form.data.is_active}
                                                onChange={(e) => form.setData('is_active', e.target.checked)}
                                                className="rounded border-slate-300"
                                            />
                                            <span className="text-xs font-medium text-slate-600">Aktifkan Promosi</span>
                                        </label>

                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={form.data.can_stack}
                                                onChange={(e) => form.setData('can_stack', e.target.checked)}
                                                className="rounded border-slate-300"
                                            />
                                            <span className="text-xs font-medium text-slate-600">Bisa Digabung dengan Promosi Lain</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={form.processing}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {form.processing ? 'Menyimpan...' : 'Simpan Promosi'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-600">
                                    <tr>
                                        <th className="px-4 py-3 text-left">Nama & Kode</th>
                                        <th className="px-4 py-3 text-left">Tipe</th>
                                        <th className="px-4 py-3 text-left">Diskon</th>
                                        <th className="px-4 py-3 text-left">Penggunaan</th>
                                        <th className="px-4 py-3 text-left">Kadaluarsa</th>
                                        <th className="px-4 py-3 text-left">Status</th>
                                        <th className="px-4 py-3 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {promoList.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                                                Belum ada promosi. Buat promosi pertama Anda!
                                            </td>
                                        </tr>
                                    ) : (
                                        promoList.map((promo) => (
                                            <tr key={promo.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-slate-800">{promo.name}</div>
                                                    <div className="text-xs text-slate-500 font-mono">{promo.code}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                                                        {getPromotionTypeLabel(promo.promotion_type)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    {promo.discount_percent ? `${promo.discount_percent}%` : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-slate-700">
                                                    <div className="text-sm">{promo.usage_count || 0}</div>
                                                    {promo.usage_limit && (
                                                        <div className="text-xs text-slate-500">/ {promo.usage_limit}</div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm text-slate-700">
                                                        {new Date(promo.expires_at).toLocaleDateString('id-ID')}
                                                    </div>
                                                    {promo.is_expired && (
                                                        <span className="text-xs text-red-600">Kadaluarsa</span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button
                                                        onClick={() => toggleActive(promo)}
                                                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                            promo.is_active && !promo.is_expired
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : 'bg-slate-100 text-slate-600'
                                                        }`}
                                                    >
                                                        {promo.is_active && !promo.is_expired ? 'Aktif' : 'Nonaktif'}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={() => destroy(promo.id)}
                                                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                    >
                                                        Hapus
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
