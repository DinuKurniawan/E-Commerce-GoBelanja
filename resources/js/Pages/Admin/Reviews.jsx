import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import useConfirm from '@/Hooks/useConfirm';

const STARS = ['⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐'];

export default function Reviews({ reviews }) {
    const { flash } = usePage().props;
    const reviewList = reviews ?? [];
    const [replyingId, setReplyingId] = useState(null);
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
                                            {review.is_spam && (
                                                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-600">Spam</span>
                                            )}
                                        </div>
                                        <p className="mt-2 text-sm text-slate-700">{review.comment}</p>
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

                                    <div className="flex shrink-0 gap-2">
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
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
