import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

const STATUS_COLOR = {
    pending:              'bg-yellow-100 text-yellow-700',
    diproses:             'bg-blue-100 text-blue-700',
    dikirim:              'bg-indigo-100 text-indigo-700',
    selesai:              'bg-emerald-100 text-emerald-700',
};
const PAYMENT_COLOR = {
    pending:              'bg-orange-100 text-orange-700',
    menunggu_verifikasi:  'bg-blue-100 text-blue-700',
    paid:                 'bg-emerald-100 text-emerald-700',
    failed:               'bg-rose-100 text-rose-700',
};
const PAYMENT_LABEL = {
    pending:              'Belum Bayar',
    menunggu_verifikasi:  'Menunggu Verifikasi',
    paid:                 'Lunas',
    failed:               'Bukti Ditolak',
};

/* ── Review Form ─────────────────────────────────────── */
function ReviewForm({ item, existingReview }) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        product_id: item.product_id,
        rating:  existingReview?.rating  ?? 5,
        comment: existingReview?.comment ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('user.reviews.store'), { onSuccess: () => setOpen(false) });
    };

    const stars = (count) => Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < count ? 'text-amber-400' : 'text-slate-300'}>★</span>
    ));

    return (
        <div className="mt-2">
            {!open && existingReview && (
                <div className="mt-1 rounded-lg bg-white border border-slate-100 px-3 py-2 space-y-1">
                    <div className="flex items-center gap-1 text-base leading-none">
                        {stars(existingReview.rating)}
                        <span className="ml-1 text-xs text-slate-500">{existingReview.rating}/5</span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{existingReview.comment}</p>
                    <button type="button" onClick={() => setOpen(true)}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                        ✏️ Edit Review
                    </button>
                </div>
            )}

            {!open && !existingReview && (
                <button type="button" onClick={() => setOpen(true)}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500">
                    ⭐ Beri Review
                </button>
            )}

            {open && (
                <form onSubmit={submit} className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                    <p className="text-xs font-semibold text-slate-700">Review: {item.product?.name}</p>
                    <div className="flex gap-1 items-center">
                        {[1,2,3,4,5].map((star) => (
                            <button key={star} type="button"
                                onClick={() => form.setData('rating', star)}
                                className={`text-2xl leading-none transition ${form.data.rating >= star ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'}`}>
                                ★
                            </button>
                        ))}
                        <span className="ml-1 text-xs text-slate-500">{form.data.rating}/5</span>
                    </div>
                    <textarea value={form.data.comment} onChange={(e) => form.setData('comment', e.target.value)}
                        placeholder="Tulis ulasan produk..." rows={3}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none" required />
                    {form.errors.comment && <p className="text-xs text-rose-600">{form.errors.comment}</p>}
                    <div className="flex gap-2">
                        <button type="submit" disabled={form.processing}
                            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">
                            {form.processing ? 'Menyimpan...' : 'Kirim Review'}
                        </button>
                        <button type="button" onClick={() => setOpen(false)} className="text-xs text-slate-500 hover:text-slate-700">Batal</button>
                    </div>
                </form>
            )}
        </div>
    );
}

/* ── Delivery Proof Upload ───────────────────────────── */
function DeliveryProofUpload({ orderId, existingProof }) {
    const [preview, setPreview] = useState(null);
    const form = useForm({ delivery_proof: null });

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        form.setData('delivery_proof', file);
        setPreview(URL.createObjectURL(file));
    };

    const submit = (e) => {
        e.preventDefault();
        form.post(route('user.orders.delivery-proof', orderId), {
            forceFormData: true,
            onSuccess: () => setPreview(null),
        });
    };

    return (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
            <h3 className="font-semibold text-emerald-800">
                📦 Bukti Paket Diterima{' '}
                <span className="font-normal text-emerald-600 text-sm">(opsional)</span>
            </h3>

            {existingProof && !preview && (
                <div className="mt-3 space-y-2">
                    <img src={existingProof} alt="Bukti Terima"
                        className="max-h-48 rounded-xl object-contain border border-emerald-100" />
                    <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200">
                        🔄 Ganti Foto
                        <input type="file" accept="image/*" className="sr-only" onChange={handleChange} />
                    </label>
                </div>
            )}

            {!existingProof && !preview && (
                <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-300 bg-white py-10 text-center hover:border-emerald-500 hover:bg-emerald-50 transition">
                    <span className="text-4xl mb-2">📷</span>
                    <span className="text-sm font-semibold text-emerald-700">Klik untuk pilih foto paket</span>
                    <span className="text-xs text-slate-400 mt-1">JPG, PNG, maks 3 MB (opsional)</span>
                    <input type="file" accept="image/*" className="sr-only" onChange={handleChange} />
                </label>
            )}

            {preview && (
                <form onSubmit={submit} className="mt-3 space-y-3">
                    <img src={preview} alt="Preview"
                        className="max-h-48 w-full rounded-xl object-contain border border-emerald-100 bg-white" />
                    <div className="flex gap-2">
                        <button type="submit" disabled={form.processing}
                            className="flex-1 rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60">
                            {form.processing ? 'Mengupload...' : '✓ Upload Bukti Terima'}
                        </button>
                        <button type="button" onClick={() => { setPreview(null); form.setData('delivery_proof', null); }}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                            Batal
                        </button>
                    </div>
                    {form.errors.delivery_proof && (
                        <p className="text-xs text-rose-600">{form.errors.delivery_proof}</p>
                    )}
                </form>
            )}
        </div>
    );
}

/* ── Payment Proof Upload ────────────────────────────── */
function PaymentProofUpload({ paymentId, canReupload }) {
    const [preview, setPreview] = useState(null);
    const form = useForm({ proof_image: null });

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        form.setData('proof_image', file);
        setPreview(URL.createObjectURL(file));
    };

    const submit = (e) => {
        e.preventDefault();
        form.patch(route('user.payments.upload-proof', paymentId), { forceFormData: true });
    };

    return (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <h3 className="font-semibold text-amber-800">
                {canReupload ? '⚠️ Bukti Transfer Ditolak — Upload Ulang' : '📎 Upload Bukti Transfer'}
            </h3>
            <p className="mt-1 text-sm text-amber-700">
                {canReupload
                    ? 'Bukti transfer Anda ditolak. Pastikan gambar jelas dan sesuai.'
                    : 'Upload bukti transfer agar pesanan segera diproses.'}
            </p>

            {!preview && (
                <label className="mt-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-300 bg-white py-10 text-center hover:border-amber-500 hover:bg-amber-50 transition">
                    <span className="text-4xl mb-2">🧾</span>
                    <span className="text-sm font-semibold text-amber-700">Klik untuk pilih bukti transfer</span>
                    <span className="text-xs text-slate-400 mt-1">JPG, PNG, maks 2 MB</span>
                    <input type="file" accept="image/*" className="sr-only" onChange={handleChange} />
                </label>
            )}

            {preview && (
                <form onSubmit={submit} className="mt-3 space-y-3">
                    <img src={preview} alt="Preview"
                        className="max-h-48 w-full rounded-xl object-contain border border-amber-100 bg-white" />
                    <div className="flex gap-2">
                        <button type="submit" disabled={form.processing}
                            className="flex-1 rounded-lg bg-amber-600 py-2 text-sm font-semibold text-white hover:bg-amber-500 disabled:opacity-60">
                            {form.processing ? 'Mengupload...' : '✓ Kirim Bukti Transfer'}
                        </button>
                        <button type="button" onClick={() => { setPreview(null); form.setData('proof_image', null); }}
                            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
                            Batal
                        </button>
                    </div>
                    {form.errors.proof_image && (
                        <p className="text-xs text-rose-600">{form.errors.proof_image}</p>
                    )}
                </form>
            )}
        </div>
    );
}

/* ── Main Page ───────────────────────────────────────── */
export default function UserOrderShow({ order, userReviews }) {
    const { flash } = usePage().props;
    const items    = order?.items ?? [];
    const payment  = order?.payment;
    const reviews  = userReviews ?? {};
    const deliverySchedule = order?.delivery_schedule;
    const isSelesai = order?.status === 'selesai';
    const isCOD    = payment?.method?.toLowerCase().includes('cod');

    const needsProof  = payment && !isCOD &&
        (order.payment_status === 'pending' || order.payment_status === 'failed') &&
        !payment.proof_image;
    const canReupload = payment && !isCOD && order.payment_status === 'failed';

    const subtotal = items.reduce((sum, i) => sum + Number(i.subtotal), 0);
    const shipping = Number(order.total_amount) - subtotal;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const TIME_SLOTS = {
        '09:00-12:00': { label: 'Morning', time: '09:00 - 12:00', icon: '🌅' },
        '12:00-15:00': { label: 'Afternoon', time: '12:00 - 15:00', icon: '☀️' },
        '15:00-18:00': { label: 'Evening', time: '15:00 - 18:00', icon: '🌤️' },
        '18:00-21:00': { label: 'Night', time: '18:00 - 21:00', icon: '🌙' },
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-800">Detail Pesanan</h2>}>
            <Head title={`Detail ${order.order_number}`} />

            <div className="py-10">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    {/* Info order */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                        <div>
                            <p className="text-xs text-slate-500">Nomor Pesanan</p>
                            <p className="mt-0.5 text-lg font-bold text-slate-900">{order.order_number}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <Info label="Status Pesanan">
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[order.status] ?? 'bg-slate-100 text-slate-700'}`}>
                                    {order.status}
                                </span>
                            </Info>
                            <Info label="Status Pembayaran">
                                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${PAYMENT_COLOR[order.payment_status] ?? 'bg-slate-100 text-slate-700'}`}>
                                    {PAYMENT_LABEL[order.payment_status] ?? order.payment_status}
                                </span>
                            </Info>
                        </div>
                    </div>

                    {/* Produk & Rincian Biaya */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                        <h3 className="font-semibold text-slate-900">Produk Dibeli</h3>
                        <div className="mt-3 space-y-2">
                            {items.map((item) => (
                                <div key={item.id} className="rounded-lg bg-slate-50 px-3 py-2">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-slate-700">
                                            {item.product?.name} × {item.quantity}
                                            {item.unit_price && (
                                                <span className="ml-1 text-slate-400">
                                                    (Rp{Number(item.unit_price).toLocaleString('id-ID')}/pcs)
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm font-semibold text-slate-900">
                                            Rp{Number(item.subtotal).toLocaleString('id-ID')}
                                        </div>
                                    </div>
                                    {isSelesai && item.product && (
                                        <ReviewForm item={item} existingReview={reviews[item.product_id] ?? null} />
                                    )}
                                </div>
                            ))}
                            {items.length === 0 && <p className="text-sm text-slate-500">Tidak ada item.</p>}
                        </div>

                        {/* Rincian Biaya */}
                        {items.length > 0 && (
                            <div className="mt-4 border-t border-slate-100 pt-4 space-y-1.5">
                                <div className="flex justify-between text-sm text-slate-600">
                                    <span>Subtotal produk</span>
                                    <span>Rp{subtotal.toLocaleString('id-ID')}</span>
                                </div>
                                {shipping > 0 && (
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Ongkos kirim</span>
                                        <span>Rp{shipping.toLocaleString('id-ID')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                                    <span>Total Bayar</span>
                                    <span className="text-indigo-600">Rp{Number(order.total_amount).toLocaleString('id-ID')}</span>
                                </div>
                                {payment?.method && (
                                    <p className="text-xs text-slate-500 pt-1">via {payment.method}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Delivery Schedule */}
                    {deliverySchedule && (
                        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5 shadow-sm space-y-3">
                            <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
                                <span>🚚</span>
                                <span>Scheduled Delivery</span>
                            </h3>
                            
                            {deliverySchedule.is_same_day && (
                                <div className="rounded-lg bg-amber-100 border border-amber-300 px-3 py-2 flex items-center gap-2">
                                    <span className="text-lg">⚡</span>
                                    <div>
                                        <p className="text-sm font-bold text-amber-900">Same-Day Delivery</p>
                                        <p className="text-xs text-amber-700">Express delivery service</p>
                                    </div>
                                </div>
                            )}

                            <div className="rounded-lg bg-white border border-indigo-200 p-4">
                                <div className="flex items-start gap-3">
                                    <span className="text-3xl">{TIME_SLOTS[deliverySchedule.time_slot]?.icon || '📅'}</span>
                                    <div className="flex-1">
                                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Delivery Date & Time</p>
                                        <p className="font-bold text-slate-800">
                                            {formatDate(deliverySchedule.delivery_date)}
                                        </p>
                                        <p className="text-sm text-indigo-600 font-medium mt-1">
                                            {TIME_SLOTS[deliverySchedule.time_slot]?.label} ({TIME_SLOTS[deliverySchedule.time_slot]?.time})
                                        </p>
                                        
                                        {deliverySchedule.status && (
                                            <div className="mt-2">
                                                <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                    deliverySchedule.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' :
                                                    deliverySchedule.status === 'in_transit' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-amber-100 text-amber-700'
                                                }`}>
                                                    {deliverySchedule.status === 'scheduled' ? '📅 Scheduled' :
                                                     deliverySchedule.status === 'in_transit' ? '🚚 In Transit' :
                                                     deliverySchedule.status === 'delivered' ? '✅ Delivered' :
                                                     deliverySchedule.status}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {deliverySchedule.special_instructions && (
                                    <div className="mt-3 pt-3 border-t border-indigo-100">
                                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                                            Special Instructions
                                        </p>
                                        <p className="text-sm text-slate-700">
                                            {deliverySchedule.special_instructions}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="rounded-lg bg-white border border-indigo-200 px-3 py-2 text-xs text-slate-600">
                                <p className="flex items-center gap-1">
                                    <span>ℹ️</span>
                                    <span>We'll deliver your order during the selected time slot</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Pengiriman */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-1">
                        <h3 className="font-semibold text-slate-900">Pengiriman</h3>
                        <p className="text-sm text-slate-700">Alamat: {order.shipping_address ?? '-'}</p>
                        {order.shipping_courier && (
                            <p className="text-sm text-slate-700">Kurir: {order.shipping_courier}</p>
                        )}
                        {order.tracking_number ? (
                            <p className="text-sm text-slate-700">
                                No. Resi: <span className="font-semibold text-indigo-700">{order.tracking_number}</span>
                            </p>
                        ) : (
                            <p className="text-xs text-slate-400 italic">Nomor resi belum tersedia.</p>
                        )}
                    </div>

                    {/* Info COD */}
                    {isCOD && order.payment_status !== 'paid' && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                            <h3 className="font-semibold text-emerald-800">🚪 Bayar di Tempat (COD)</h3>
                            <p className="mt-1 text-sm text-emerald-700">
                                Siapkan uang tunai saat kurir tiba. Tidak perlu upload bukti transfer.
                            </p>
                        </div>
                    )}

                    {/* Upload bukti transfer */}
                    {(needsProof || canReupload) && (
                        <PaymentProofUpload paymentId={payment.id} canReupload={canReupload} />
                    )}

                    {/* Bukti transfer sudah diupload */}
                    {payment?.proof_image && order.payment_status !== 'failed' && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                            <h3 className="font-semibold text-slate-900">Bukti Transfer</h3>
                            <img src={payment.proof_image} alt="Bukti Transfer"
                                className="mt-3 max-h-64 rounded-xl object-contain border border-slate-100" />
                            {order.payment_status === 'menunggu_verifikasi' && (
                                <p className="mt-2 text-sm text-blue-600">⏳ Menunggu verifikasi admin...</p>
                            )}
                            {order.payment_status === 'paid' && (
                                <p className="mt-2 text-sm text-emerald-600">✅ Pembayaran telah dikonfirmasi.</p>
                            )}
                        </div>
                    )}

                    {/* Bukti penerimaan paket */}
                    {isSelesai && (
                        <DeliveryProofUpload orderId={order.id} existingProof={order.delivery_proof} />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function Info({ label, children }) {
    return (
        <div className="rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">{label}</p>
            <div className="mt-1">{children}</div>
        </div>
    );
}
