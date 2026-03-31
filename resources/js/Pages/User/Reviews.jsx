import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import useConfirm from '@/Hooks/useConfirm';

function StarRating({ value, onChange, size = 'text-2xl', hoverable = false }) {
    const [hoveredStar, setHoveredStar] = useState(0);

    return (
        <div className="flex gap-1 items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => hoverable && setHoveredStar(star)}
                    onMouseLeave={() => hoverable && setHoveredStar(0)}
                    className={`${size} leading-none transition ${
                        (hoverable ? (hoveredStar >= star || (!hoveredStar && value >= star)) : value >= star)
                            ? 'text-amber-400'
                            : 'text-slate-300 hover:text-amber-300'
                    }`}
                >
                    ★
                </button>
            ))}
            <span className="ml-1 text-xs text-slate-500">{value}/5</span>
        </div>
    );
}

function MediaPreview({ files, onRemove }) {
    return (
        <div className="grid grid-cols-3 gap-2">
            {files.map((file, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                    {file.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center">
                                <span className="text-3xl">🎥</span>
                                <p className="text-xs text-slate-600 mt-1">{file.name}</p>
                            </div>
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-rose-700"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}

function EditReviewForm({ review, products, onClose }) {
    const [mediaFiles, setMediaFiles] = useState([]);

    const form = useForm({
        product_id: review.product_id?.toString() ?? '',
        rating: review.rating ?? 5,
        comment: review.comment ?? '',
        media: [],
    });

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type === 'video/mp4';
            const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB
            return (isImage || isVideo) && isValidSize;
        });

        if (mediaFiles.length + validFiles.length > 5) {
            alert('Maksimal 5 file media');
            return;
        }

        const newFiles = [...mediaFiles, ...validFiles];
        setMediaFiles(newFiles);
        form.setData('media', newFiles);
    };

    const removeFile = (index) => {
        const newFiles = mediaFiles.filter((_, i) => i !== index);
        setMediaFiles(newFiles);
        form.setData('media', newFiles);
    };

    const submit = (e) => {
        e.preventDefault();
        form.post(route('user.reviews.store'), { onSuccess: onClose });
    };

    return (
        <form onSubmit={submit} className="mt-3 space-y-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Edit Review</p>

            <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Produk</label>
                <select
                    value={form.data.product_id}
                    onChange={(e) => form.setData('product_id', e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    required
                >
                    {products.map((p) => (
                        <option key={p.id} value={p.id.toString()}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Rating</label>
                <StarRating value={form.data.rating} onChange={(v) => form.setData('rating', v)} hoverable />
            </div>

            <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Ulasan (min 10 karakter)</label>
                <textarea
                    value={form.data.comment}
                    onChange={(e) => form.setData('comment', e.target.value)}
                    rows={3}
                    maxLength={1000}
                    required
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none"
                />
                <p className="mt-1 text-right text-xs text-slate-400">{form.data.comment.length}/1000</p>
                {form.errors.comment && <p className="text-xs text-rose-600">{form.errors.comment}</p>}
            </div>

            <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                    Foto/Video (Maks 5, 50MB per file)
                </label>
                <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,video/mp4"
                    onChange={handleFileChange}
                    className="w-full text-sm"
                    disabled={mediaFiles.length >= 5}
                />
                {mediaFiles.length > 0 && <MediaPreview files={mediaFiles} onRemove={removeFile} />}
            </div>

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={form.processing}
                    className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
                >
                    {form.processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg border border-slate-300 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                    Batal
                </button>
            </div>
        </form>
    );
}

export default function UserReviews({ reviews, products }) {
    const productOptions = products ?? [];
    const userReviews = reviews ?? [];
    const { flash } = usePage().props;

    const [editingId, setEditingId] = useState(null);
    const [mediaFiles, setMediaFiles] = useState([]);
    const { confirm, ConfirmDialog } = useConfirm();

    const form = useForm({
        product_id: productOptions[0]?.id?.toString() ?? '',
        rating: 5,
        comment: '',
        media: [],
    });

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter((file) => {
            const isImage = file.type.startsWith('image/');
            const isVideo = file.type === 'video/mp4';
            const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB
            return (isImage || isVideo) && isValidSize;
        });

        if (mediaFiles.length + validFiles.length > 5) {
            alert('Maksimal 5 file media');
            return;
        }

        const newFiles = [...mediaFiles, ...validFiles];
        setMediaFiles(newFiles);
        form.setData('media', newFiles);
    };

    const removeFile = (index) => {
        const newFiles = mediaFiles.filter((_, i) => i !== index);
        setMediaFiles(newFiles);
        form.setData('media', newFiles);
    };

    const submit = (e) => {
        e.preventDefault();
        form.post(route('user.reviews.store'), {
            onSuccess: () => {
                form.setData('comment', '');
                form.setData('rating', 5);
                form.setData('media', []);
                setMediaFiles([]);
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
                        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-600">
                            ✍️ Tulis Review
                        </h3>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Produk *</label>
                                {productOptions.length > 0 ? (
                                    <select
                                        value={form.data.product_id}
                                        onChange={(e) => form.setData('product_id', e.target.value)}
                                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                        required
                                    >
                                        {productOptions.map((p) => (
                                            <option key={p.id} value={p.id.toString()}>
                                                {p.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p className="text-sm text-slate-500">Belum ada produk tersedia.</p>
                                )}
                                {form.errors.product_id && (
                                    <p className="mt-1 text-xs text-rose-600">{form.errors.product_id}</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">Rating *</label>
                                <StarRating
                                    value={form.data.rating}
                                    onChange={(v) => form.setData('rating', v)}
                                    size="text-3xl"
                                    hoverable
                                />
                                {form.errors.rating && <p className="mt-1 text-xs text-rose-600">{form.errors.rating}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">
                                    Ulasan * (min 10 karakter)
                                </label>
                                <textarea
                                    value={form.data.comment}
                                    onChange={(e) => form.setData('comment', e.target.value)}
                                    rows={5}
                                    maxLength={1000}
                                    required
                                    placeholder="Bagaimana pengalaman kamu dengan produk ini?"
                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm resize-none"
                                />
                                <p className="mt-1 text-right text-xs text-slate-400">{form.data.comment.length}/1000</p>
                                {form.errors.comment && <p className="mt-1 text-xs text-rose-600">{form.errors.comment}</p>}
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-semibold text-slate-600">
                                    📸 Foto/Video (Opsional, Maks 5 file)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/jpeg,image/jpg,image/png,video/mp4"
                                    onChange={handleFileChange}
                                    className="w-full text-sm"
                                    disabled={mediaFiles.length >= 5}
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Format: JPG, PNG, MP4 | Maks 50MB per file
                                </p>
                                {mediaFiles.length > 0 && (
                                    <div className="mt-3">
                                        <MediaPreview files={mediaFiles} onRemove={removeFile} />
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing || productOptions.length === 0}
                                className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                            >
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
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-slate-900 truncate">{review.product?.name}</p>
                                            {review.verified_purchase && (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                    ✓ Verified Purchase
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-0.5 flex items-center gap-1">
                                            {Array.from({ length: 5 }, (_, i) => (
                                                <span
                                                    key={i}
                                                    className={`text-lg ${i < review.rating ? 'text-amber-400' : 'text-slate-200'}`}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                            <span className="text-xs text-slate-500 ml-1">{review.rating}/5</span>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-700 leading-relaxed">{review.comment}</p>

                                        {/* Media Gallery */}
                                        {review.media && review.media.length > 0 && (
                                            <div className="mt-3 grid grid-cols-4 gap-2">
                                                {review.media.map((media) => (
                                                    <div
                                                        key={media.id}
                                                        className="aspect-square rounded-lg overflow-hidden border border-slate-200"
                                                    >
                                                        {media.media_type === 'image' ? (
                                                            <img
                                                                src={`/storage/${media.media_url}`}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <video
                                                                src={`/storage/${media.media_url}`}
                                                                className="w-full h-full object-cover"
                                                                controls
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

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
                                        <button
                                            type="button"
                                            onClick={() => setEditingId(editingId === review.id ? null : review.id)}
                                            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => remove(review.id)}
                                            className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500"
                                        >
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
