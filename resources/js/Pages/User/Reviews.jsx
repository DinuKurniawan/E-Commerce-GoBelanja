import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import useConfirm from '@/Hooks/useConfirm';

function StarRating({ value, onChange, size = 'text-2xl' }) {
    return (
        <div className="flex gap-1 items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => onChange(star)}
                    className={`${size} leading-none transition ${value >= star ? 'text-amber-400' : 'text-slate-300 hover:text-amber-300'}`}>
                    ★
                </button>
            ))}
            <span className="ml-1 text-xs text-slate-500">{value}/5</span>
        </div>
    );
}

function EditReviewForm({ review, products, onClose }) {
    const form = useForm({
        product_id: review.product_id?.toString() ?? '',
        rating:     review.rating  ?? 5,
        comment:    review.comment ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('user.reviews.store'), { onSuccess: onClose });
    };

    return (
        <form onSubmit={submit} className="mt-3 space-y-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Edit Review</p>

            <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Produk</label>
                <select value={form.data.product_id}
                    onChange={(e) => form.setData('product_id', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required>
                    {products.map((p) => (
                        <option key={p.id} value={p.id.toString()}>{p.name}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Rating</label>
                <StarRating value={form.data.rating} onChange={(v) => form.setData('rating', v)} />
            </div>

            <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Ulasan</label>
                <textarea value={form.data.comment}
                    onChange={(e) => form.setData('comment', e.target.value)}
                    rows={3} maxLength={1000} required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none" />
                <p className="mt-1 text-right text-xs text-slate-400">{form.data.comment.length}/1000</p>
                {form.errors.comment && <p className="text-xs text-rose-600">{form.errors.comment}</p>}
            </div>

            <div className="flex gap-2">
                <button type="submit" disabled={form.processing}
                    className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60">
                    {form.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button type="button" onClick={onClose}
                    className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                    Batal
                </button>
            </div>
        </form>
    );
}

export default function UserReviews({ reviews, products }) {
    const productOptions = products ?? [];
    const userReviews    = reviews  ?? [];
    const { flash }      = usePage().props;

    const [editingId, setEditingId] = useState(null);
    const { confirm, ConfirmDialog } = useConfirm();

    const form = useForm({
        product_id: productOptions[0]?.id?.toString() ?? '',
        rating:     5,
        comment:    '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('user.reviews.store'), {
            onSuccess: () => {
                form.setData('comment', '');
                form.setData('rating', 5);
            },
        });
    };

    const remove = async (id) => {
        const ok = await confirm('Review kamu akan dihapus permanen.', { danger: true, title: 'Hapus Review' });
        if (!ok) return;
        router.delete(route('user.reviews.destroy', id));
    };

    return (
        <AuthenticatedLayout header={<h2 className="text-xl font-semibold text-slate-800">Review Produk</h2>}>
            <Head title="Review Produk" />
            {ConfirmDialog}

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                {flash?.success && (
                    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                        {flash.success}
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
                    {/* ── Tulis / Tambah Review ── */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-fit">
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-600">✍️ Tulis Review</h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Produk *</label>
                                {productOptions.length > 0 ? (
                                    <select value={form.data.product_id}
                                        onChange={(e) => form.setData('product_id', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" required>
                                        {productOptions.map((p) => (
                                            <option key={p.id} value={p.id.toString()}>{p.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-sm text-slate-500">Belum ada produk tersedia.</p>
                                )}
                                {form.errors.product_id && <p className="mt-1 text-xs text-rose-600">{form.errors.product_id}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Rating *</label>
                                <StarRating value={form.data.rating} onChange={(v) => form.setData('rating', v)} size="text-3xl" />
                                {form.errors.rating && <p className="mt-1 text-xs text-rose-600">{form.errors.rating}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Ulasan *</label>
                                <textarea value={form.data.comment}
                                    onChange={(e) => form.setData('comment', e.target.value)}
                                    rows={5} maxLength={1000} required
                                    placeholder="Bagaimana pengalaman kamu dengan produk ini?"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none" />
                                <p className="mt-1 text-right text-xs text-slate-400">{form.data.comment.length}/1000</p>
                                {form.errors.comment && <p className="mt-1 text-xs text-rose-600">{form.errors.comment}</p>}
                            </div>

                            <button type="submit"
                                disabled={form.processing || productOptions.length === 0}
                                className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60">
                                {form.processing ? 'Menyimpan...' : '⭐ Kirim Review'}
                            </button>
                        </form>
                    </div>

                    {/* ── Daftar Review ── */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
                            Review Saya ({userReviews.length})
                        </h3>

                        {userReviews.map((review) => (
                            <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-slate-900 truncate">{review.product?.name}</p>
                                        <div className="mt-0.5 flex items-center gap-1">
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <span key={i} className={`text-lg ${i < review.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                                            ))}
                                            <span className="text-xs text-slate-500 ml-1">{review.rating}/5</span>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-700 leading-relaxed">{review.comment}</p>

                                        {review.admin_reply && (
                                            <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                                                <p className="text-xs font-semibold text-indigo-600">💬 Balasan Admin</p>
                                                <p className="mt-1 text-sm text-indigo-800">{review.admin_reply}</p>
                                            </div>
                                        )}

                                        {editingId === review.id && (
                                            <EditReviewForm
                                                review={review}
                                                products={productOptions}
                                                onClose={() => setEditingId(null)}
                                            />
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1.5 shrink-0">
                                        <button type="button"
                                            onClick={() => setEditingId(editingId === review.id ? null : review.id)}
                                            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500">
                                            ✏️ Edit
                                        </button>
                                        <button type="button" onClick={() => remove(review.id)}
                                            className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500">
                                            🗑️ Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {userReviews.length === 0 && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                                <p className="text-3xl mb-2">⭐</p>
                                <p className="text-sm text-slate-500">Belum ada review. Tulis review pertama kamu!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

