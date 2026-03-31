import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import SameDayDeliveryCard from '@/Components/Delivery/SameDayDeliveryCard';
import DeliveryDatePicker from '@/Components/Delivery/DeliveryDatePicker';
import TimeSlotSelector from '@/Components/Delivery/TimeSlotSelector';
import SpecialInstructions from '@/Components/Delivery/SpecialInstructions';
import DeliveryScheduleSummary from '@/Components/Delivery/DeliveryScheduleSummary';
import PromotionSelector from '@/Components/PromotionSelector';

const COURIERS = [
    { value: 'jne', label: 'JNE' },
    { value: 'pos', label: 'POS Indonesia' },
    { value: 'tiki', label: 'TIKI' },
];

const formatPrice = (v) => `Rp${Number(v).toLocaleString('id-ID')}`;

export default function UserCheckout({ cartItems, addresses, subtotal, totalWeight, paymentMethods, bankAccounts, availablePromotions }) {
    const items          = cartItems ?? [];
    const addressOptions = addresses ?? [];
    const methods        = paymentMethods?.length ? paymentMethods : ['Transfer Bank'];
    const banks          = bankAccounts ?? [];
    const { flash }      = usePage().props;
    const promos         = availablePromotions ?? [];

    const form = useForm({
        address_id:    String(addressOptions.find((a) => a.is_default)?.id ?? addressOptions[0]?.id ?? ''),
        courier:       'jne',
        service:       '',
        service_label: '',
        shipping_cost: 0,
        promotion_code: '',
        payment_method: paymentMethods?.[0] ?? 'Transfer Bank',
        notes:         '',
        delivery_date: '',
        time_slot: '',
        is_same_day: false,
        special_instructions: '',
    });

    const [services, setServices]         = useState([]);
    const [loadingCost, setLoadingCost]   = useState(false);
    const [costError, setCostError]       = useState('');
    const [costChecked, setCostChecked]   = useState(false);
    const [promotionDiscount, setPromotionDiscount] = useState(0);
    const [freeShipping, setFreeShipping] = useState(false);

    const [shippingSetupError, setShippingSetupError] = useState('');
    const selectedAddress  = addressOptions.find((a) => String(a.id) === String(form.data.address_id));
    const effectiveCityId  = selectedAddress?.rajaongkir_city_id || '';
    
    // Calculate grand total including promotion discount, shipping, and same-day fee
    const sameDayFee = form.data.is_same_day ? 25000 : 0;
    const effectiveShippingCost = freeShipping ? 0 : Number(form.data.shipping_cost);
    const grandTotal = Number(subtotal ?? 0) - promotionDiscount + effectiveShippingCost + sameDayFee;
    
    const canCheckout = items.length > 0 && 
                        addressOptions.length > 0 && 
                        form.data.service !== '' &&
                        form.data.delivery_date !== '' &&
                        form.data.time_slot !== '';
    
    useEffect(() => {
        setServices([]);
        setCostChecked(false);
        setCostError('');
        setShippingSetupError('');
    }, [form.data.address_id]);

    const checkOngkir = async () => {
        setLoadingCost(true);
        setCostError('');
        setServices([]);
        form.setData((prev) => ({ ...prev, service: '', service_label: '', shipping_cost: 0 }));

        try {
            if (!effectiveCityId) {
                setCostError('Alamat belum siap untuk ongkir. Silakan edit alamat dan simpan sampai data kota ongkir terisi.');
                return;
            }

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
            const res = await fetch(route('rajaongkir.cost'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    destination: effectiveCityId,
                    weight:      totalWeight ?? 1000,
                    courier:     form.data.courier,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setCostError(data.message ?? 'Gagal mengambil data ongkir.');
            } else if (!Array.isArray(data) || data.length === 0) {
                setCostError('Tidak ada layanan tersedia untuk rute ini.');
            } else {
                setServices(data);
                setCostChecked(true);
            }
        } catch {
            setCostError('Gagal terhubung ke server. Coba lagi.');
        } finally {
            setLoadingCost(false);
        }
    };

    const selectService = (svc) => {
        form.setData((prev) => ({
            ...prev,
            service:       svc.service,
            service_label: `${svc.description} (${svc.etd} hari)`,
            shipping_cost: svc.cost,
        }));
    };

    const handlePromotionApply = (promotion, discount) => {
        if (promotion && discount) {
            form.setData('promotion_code', promotion.code);
            setPromotionDiscount(discount.discount_amount || 0);
            setFreeShipping(discount.free_shipping || false);
        } else {
            form.setData('promotion_code', '');
            setPromotionDiscount(0);
            setFreeShipping(false);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (!canCheckout) return;
        form.post(route('user.checkout.store'));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-800">Checkout</h2>}>
            <Head title="Checkout" />

            <div className="py-10">
                <div className="px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                            ✅ {flash.success}
                        </div>
                    )}

                    {items.length === 0 && (
                        <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                            ⚠️ Keranjang kamu kosong.{' '}
                            <a href={route('user.cart.index')} className="font-semibold underline">
                                Tambah produk dulu
                            </a>
                        </div>
                    )}
                    {addressOptions.length === 0 && (
                        <div className="mb-4 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
                            ⚠️ Belum ada alamat.{' '}
                            <a href={route('user.addresses.index')} className="font-semibold underline">
                                Tambah alamat dulu
                            </a>
                        </div>
                    )}

                    <div className="grid gap-6 lg:grid-cols-3">
                        <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">

                            {/* Alamat */}
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Alamat Pengiriman *</label>
                                {addressOptions.length > 0 ? (
                                    <select
                                        value={form.data.address_id}
                                        onChange={(e) => {
                                            form.setData((prev) => ({
                                                ...prev,
                                                address_id: e.target.value,
                                                service: '',
                                                service_label: '',
                                                shipping_cost: 0,
                                            }));
                                            setServices([]);
                                            setCostChecked(false);
                                        }}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        required
                                    >
                                        {addressOptions.map((a) => (
                                            <option key={a.id} value={String(a.id)}>
                                                {a.label} — {a.recipient_name}
                                                {a.city_name ? ` | ${a.city_name}` : ''}
                                                {a.is_default ? ' ✓ Default' : ''}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-sm text-rose-600">Belum ada alamat.</p>
                                )}
                                {selectedAddress && !selectedAddress.rajaongkir_city_id && (
                                    <p className="mt-1 text-xs text-orange-600">
                                        ⚠️ Alamat ini belum memiliki data kota ongkir. Silakan{' '}
                                        <a href={route('user.addresses.index')} className="underline font-semibold">edit alamat</a>.
                                    </p>
                                )}
                            </div>

                            {/* Raja Ongkir Section */}
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                                <p className="text-sm font-semibold text-slate-700">🚚 Pilih Kurir & Cek Ongkir</p>

                                {selectedAddress?.rajaongkir_city_id && (
                                    <p className="text-xs text-emerald-600">
                                        ✅ Kota tujuan: <strong>{selectedAddress.city_name}</strong>
                                    </p>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {COURIERS.map((c) => (
                                        <button
                                            key={c.value}
                                            type="button"
                                            onClick={() => {
                                                form.setData((prev) => ({
                                                    ...prev,
                                                    courier: c.value,
                                                    service: '',
                                                    service_label: '',
                                                    shipping_cost: 0,
                                                }));
                                                setServices([]);
                                                setCostChecked(false);
                                            }}
                                            className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                                                form.data.courier === c.value
                                                    ? 'border-indigo-500 bg-indigo-600 text-white'
                                                    : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400'
                                            }`}
                                        >
                                            {c.label}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    type="button"
                                    onClick={checkOngkir}
                                    disabled={loadingCost || !effectiveCityId}
                                    className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                                >
                                    {loadingCost ? '⏳ Mengecek...' : '🔍 Cek Ongkir'}
                                </button>

                                {costError && (
                                    <p className="text-xs text-rose-600">{costError}</p>
                                )}
                                {shippingSetupError && (
                                    <p className="text-xs text-rose-600">{shippingSetupError}</p>
                                )}

                                {services.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-slate-600">Pilih Layanan:</p>
                                        {services.map((svc, i) => (
                                            <label
                                                key={i}
                                                className={`flex cursor-pointer items-center justify-between rounded-lg border p-3 transition ${
                                                    form.data.service === svc.service
                                                        ? 'border-indigo-500 bg-indigo-50'
                                                        : 'border-slate-200 bg-white hover:border-indigo-300'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="service"
                                                        checked={form.data.service === svc.service}
                                                        onChange={() => selectService(svc)}
                                                        className="accent-indigo-600"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-800">
                                                            {svc.courier.toUpperCase()} {svc.service}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {svc.description} • Estimasi {svc.etd} hari
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-bold text-indigo-600">
                                                    {formatPrice(svc.cost)}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                {form.data.service && (
                                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
                                        ✅ Dipilih: {form.data.courier.toUpperCase()} {form.data.service} — {formatPrice(form.data.shipping_cost)}
                                    </div>
                                )}

                                {!form.data.service && costChecked && (
                                    <p className="text-xs text-orange-600">Pilih salah satu layanan di atas.</p>
                                )}
                            </div>

                            {/* Delivery Schedule Section */}
                            <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50/30 p-5 space-y-5">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <span>📅</span>
                                    <span>Delivery Schedule</span>
                                </h3>

                                {/* Same-Day Delivery Option */}
                                <SameDayDeliveryCard
                                    addressId={form.data.address_id}
                                    selectedIsSameDay={form.data.is_same_day}
                                    onSelect={() => {
                                        const today = new Date();
                                        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                                        form.setData({
                                            ...form.data,
                                            is_same_day: true,
                                            delivery_date: todayStr,
                                            time_slot: '', // Will be selected from time slots
                                        });
                                    }}
                                />

                                {/* Regular Delivery Date Picker */}
                                {!form.data.is_same_day && (
                                    <DeliveryDatePicker
                                        addressId={form.data.address_id}
                                        selectedDate={form.data.delivery_date}
                                        onChange={(date) => form.setData({ ...form.data, delivery_date: date, time_slot: '' })}
                                    />
                                )}

                                {/* Time Slot Selector */}
                                {form.data.delivery_date && (
                                    <TimeSlotSelector
                                        selectedDate={form.data.delivery_date}
                                        selectedSlot={form.data.time_slot}
                                        onChange={(slot) => form.setData('time_slot', slot)}
                                        isSameDay={form.data.is_same_day}
                                    />
                                )}

                                {/* Special Instructions */}
                                {form.data.delivery_date && form.data.time_slot && (
                                    <SpecialInstructions
                                        value={form.data.special_instructions}
                                        onChange={(value) => form.setData('special_instructions', value)}
                                    />
                                )}
                            </div>

                            {/* Pembayaran */}
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">Metode Pembayaran *</label>
                                <select
                                    value={form.data.payment_method}
                                    onChange={(e) => form.setData('payment_method', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    required
                                >
                                    {methods.map((m) => (
                                        <option key={m} value={m}>{m}</option>
                                    ))}
                                </select>

                                {/* Info Rekening Bank */}
                                {banks.length > 0 && (
                                    <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 space-y-2">
                                        <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Info Rekening Transfer</p>
                                        {banks.map((acc, i) => (
                                            <div key={i} className="flex items-center justify-between rounded-lg bg-white border border-indigo-100 px-3 py-2">
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{acc.bank}</p>
                                                    <p className="font-mono text-sm text-slate-700">{acc.number}</p>
                                                    <p className="text-xs text-slate-500">A.N. {acc.holder}</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => navigator.clipboard.writeText(acc.number)}
                                                    className="rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100"
                                                >
                                                    Salin
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Catatan */}
                            <div>
                                <label className="mb-1 block text-sm font-semibold text-slate-700">
                                    Catatan <span className="font-normal text-slate-400">(Opsional)</span>
                                </label>
                                <textarea
                                    rows={2}
                                    value={form.data.notes}
                                    onChange={(e) => form.setData('notes', e.target.value)}
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                    placeholder="Catatan khusus untuk pesanan ini..."
                                />
                            </div>

                            {/* Promotion Section */}
                            <div className="rounded-xl border-2 border-amber-200 bg-amber-50/30 p-5">
                                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <span>🎟️</span>
                                    <span>Kode Promosi</span>
                                </h3>
                                <PromotionSelector
                                    availablePromotions={promos}
                                    onApply={handlePromotionApply}
                                    subtotal={subtotal}
                                />
                            </div>

                            {/* Error */}
                            {form.errors.cart && (
                                <p className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-600">
                                    {form.errors.cart}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={!canCheckout || form.processing}
                                className="w-full rounded-lg bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {form.processing
                                    ? 'Memproses...'
                                    : !form.data.service
                                        ? 'Pilih kurir & cek ongkir terlebih dahulu'
                                        : !form.data.delivery_date || !form.data.time_slot
                                            ? 'Pilih jadwal pengiriman'
                                            : 'Buat Pesanan'}
                            </button>
                        </form>

                        {/* Order Summary */}
                        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="font-semibold text-slate-900">Ringkasan Pesanan</h3>
                            <div className="space-y-2">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between text-sm">
                                        <span className="text-slate-700">
                                            {item.product?.emoji} {item.product?.name} × {item.quantity}
                                        </span>
                                        <span className="font-semibold text-slate-900">
                                            {formatPrice(Number(item.product?.price ?? 0) * Number(item.quantity))}
                                        </span>
                                    </div>
                                ))}
                                {items.length === 0 && (
                                    <p className="text-sm text-slate-400">Tidak ada item.</p>
                                )}
                            </div>
                            <hr className="border-slate-200" />
                            <div className="space-y-1.5 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span className="font-semibold">{formatPrice(subtotal ?? 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">
                                        Ongkir{form.data.service ? ` (${form.data.courier.toUpperCase()} ${form.data.service})` : ''}
                                    </span>
                                    <span className={`font-semibold ${form.data.shipping_cost > 0 ? 'text-slate-900' : 'text-slate-400'}`}>
                                        {form.data.shipping_cost > 0 ? formatPrice(form.data.shipping_cost) : 'Belum dipilih'}
                                    </span>
                                </div>
                                {form.data.is_same_day && (
                                    <div className="flex justify-between">
                                        <span className="text-amber-600 flex items-center gap-1">
                                            <span>⚡</span>
                                            <span>Same-Day Fee</span>
                                        </span>
                                        <span className="font-semibold text-amber-600">{formatPrice(sameDayFee)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-xs text-slate-400">
                                    <span>Total Berat</span>
                                    <span>{((totalWeight ?? 1000) / 1000).toFixed(1)} kg</span>
                                </div>
                            </div>
                            <hr className="border-slate-200" />
                            
                            {/* Delivery Schedule Summary */}
                            {form.data.delivery_date && form.data.time_slot && (
                                <>
                                    <DeliveryScheduleSummary
                                        deliveryDate={form.data.delivery_date}
                                        timeSlot={form.data.time_slot}
                                        isSameDay={form.data.is_same_day}
                                        sameDayFee={sameDayFee}
                                        specialInstructions={form.data.special_instructions}
                                    />
                                    <hr className="border-slate-200" />
                                </>
                            )}
                            
                            {/* Discount */}
                            {promotionDiscount > 0 && (
                                <div className="flex justify-between text-emerald-600">
                                    <span className="font-medium">Diskon Promosi</span>
                                    <span className="font-semibold">-{formatPrice(promotionDiscount)}</span>
                                </div>
                            )}
                            
                            {/* Free Shipping Badge */}
                            {freeShipping && (
                                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-center">
                                    <span className="text-sm font-semibold text-emerald-700">
                                        🚚 Gratis Ongkir Diterapkan!
                                    </span>
                                </div>
                            )}
                            
                            <div className="flex justify-between">
                                <span className="font-semibold text-slate-900">Total</span>
                                <span className="text-lg font-bold text-indigo-600">
                                    {formatPrice(grandTotal)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
