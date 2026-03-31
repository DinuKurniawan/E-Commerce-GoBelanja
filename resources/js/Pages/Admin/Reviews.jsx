import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import useConfirm from '@/Hooks/useConfirm';

const STARS = ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];

export default function Reviews({ reviews, filters }) {
    const { flash } = usePage().props;
    const reviewList = reviews?.data ?? reviews ?? [];
    const [replyingId, setReplyingId] = useState(null);
    const [currentFilter, setCurrentFilter] = useState(filters?.status ?? 'all');
    const replyForm = useForm({ admin_reply: '' });
    const { confirm, ConfirmDialog } = useConfirm();

    const openReply = (review) => {
        setReplyingId(review.id);
        replyForm.setData('admin_reply', review.admin_reply ?? '');
    };

    const submitReply = (e) => {
        e.preventDefault();
        replyForm.patch(route('admin.reviews.reply', replyingId), {
            onSuccess: () => {
                setReplyingId(null);
                replyForm.reset();
            },
        });
    };

    const destroy = async (id) => {
        const ok = await confirm('Review ini akan dihapus permanen.', { danger: true, title: 'Hapus Review' });
        if (!ok) return;
        router.delete(route('admin.reviews.destroy', id));
    };

    const toggleSpam = (id, currentSpamStatus) => {
        router.patch(route('admin.reviews.flag-spam', id), {}, {
            preserveScroll: true,
            onSuccess: () => {
                // Optionally show a message
            }
        });
    };

    const filterReviews = (status) => {
        setCurrentFilter(status);
        const url = status === 'all' 
            ? route('admin.reviews.index') 
            : route('admin.reviews.index', { status });
        router.get(url, {}, { preserveScroll: true });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-800">Review & Rating</h2>}
        >
            <Head title="Review & Rating" />
            {ConfirmDialog}

            <div className="py-10">
                <div className="px-4 sm:px-6 lg:px-8 space-y-4">

                    {flash?.success && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => filterReviews('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                currentFilter === 'all'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            All Reviews
                        </button>
                        <button
                            onClick={() => filterReviews('pending')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                currentFilter === 'pending'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            Pending Reply
                        </button>
                        <button
                            onClick={() => filterReviews('spam')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                                currentFilter === 'spam'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                            }`}
                        >
                            Spam
                        </button>
                    </div>

                    <div className="space-y-4">
                        {reviewList.map((review) => (
                            <div key={review.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="font-semibold text-slate-900">{review.user?.name ?? '-'}</span>
                                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                                                {review.product?.name ?? '-'}
                                            </span>
                                            <span className="text-sm">{STARS[(review.rating ?? 1) - 1]}</span>
                                            {review.verified_purchase && (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                    ✓ Verified
                                                </span>
                                            )}
                                            {review.is_spam && (
                                                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-600">Spam</span>
                                            )}
                                            <span className="text-xs text-slate-500">
                                                👍 {review.helpful_count} | 👎 {review.not_helpful_count}
                                            </span>
                                        </div>
                                        <p className="mt-2 text-sm text-slate-700">{review.comment}</p>

                                        {/* Media Gallery */}
                                        {review.media && review.media.length > 0 && (
                                            <div className="mt-3 grid grid-cols-5 gap-2">
                                                {review.media.map((media) => (
                                                    <div key={media.id} className="aspect-square rounded-lg overflow-hidden border border-slate-200">
                                                        {media.media_type === 'image' ? (
                                                            <img
                                                                src={`/storage/${media.media_url}`}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                                <span className="text-2xl">🎥</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {review.admin_reply && (
                                            <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2">
                                                <p className="text-xs font-semibold text-indigo-600">Balasan Admin</p>
                                                <p className="mt-0.5 text-sm text-indigo-800">{review.admin_reply}</p>
                                            </div>
                                        )}

                                        {replyingId === review.id && (
                                            <form onSubmit={submitReply} className="mt-3 space-y-2">
                                                <textarea
                                                    value={replyForm.data.admin_reply}
                                                    onChange={(e) => replyForm.setData('admin_reply', e.target.value)}
                                                    rows={3}
                                                    maxLength={1000}
                                                    placeholder="Tulis balasan..."
                                                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                                    required
                                                    autoFocus
                                                />
                                                {replyForm.errors.admin_reply && (
                                                    <p className="text-xs text-rose-600">{replyForm.errors.admin_reply}</p>
                                                )}
                                                <div className="flex gap-2">
                                                    <button
                                                        type="submit"
                                                        disabled={replyForm.processing}
                                                        className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                                                    >
                                                        {replyForm.processing ? 'Menyimpan...' : 'Kirim Balasan'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setReplyingId(null)}
                                                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700"
                                                    >
                                                        Batal
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>

                                    <div className="flex flex-col shrink-0 gap-2">
                                        {replyingId !== review.id && (
                                            <button
                                                type="button"
                                                onClick={() => openReply(review)}
                                                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                                            >
                                                {review.admin_reply ? 'Edit Balasan' : 'Balas'}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => toggleSpam(review.id, review.is_spam)}
                                            className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                                                review.is_spam
                                                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                                                    : 'bg-orange-600 text-white hover:bg-orange-700'
                                            }`}
                                        >
                                            {review.is_spam ? 'Unmark Spam' : '🚩 Flag Spam'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => destroy(review.id)}
                                            className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {reviewList.length === 0 && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500 shadow-sm">
                                Belum ada review produk.
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {reviews?.links && reviews.links.length > 3 && (
                        <div className="flex justify-center gap-2 mt-6">
                            {reviews.links.map((link, index) => (
                                <button
                                    key={index}
                                    onClick={() => link.url && router.get(link.url)}
                                    disabled={!link.url}
                                    className={`px-4 py-2 text-sm rounded-lg ${
                                        link.active
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
