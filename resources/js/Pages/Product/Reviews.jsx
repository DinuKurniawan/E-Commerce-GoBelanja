import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';

function StarRating({ value, size = 'text-lg' }) {
    return (
        <div className="flex gap-0.5 items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <span
                    key={star}
                    className={`${size} leading-none ${value >= star ? 'text-amber-400' : 'text-slate-300'}`}
                >
                    ★
                </span>
            ))}
        </div>
    );
}

function MediaGallery({ media }) {
    const [lightboxIndex, setLightboxIndex] = useState(null);
    if (!media || media.length === 0) return null;

    const images = media.filter(m => m.media_type === 'image');

    return (
        <>
            <div className="grid grid-cols-4 gap-2 mt-3">
                {media.map((item, index) => (
                    <div
                        key={item.id}
                        className="aspect-square rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:opacity-90 transition"
                        onClick={() => item.media_type === 'image' && setLightboxIndex(images.findIndex(img => img.id === item.id))}
                    >
                        {item.media_type === 'image' ? (
                            <img src={`/storage/${item.media_url}`} alt="" className="w-full h-full object-cover" />
                        ) : (
                            <video src={`/storage/${item.media_url}`} className="w-full h-full object-cover" controls />
                        )}
                    </div>
                ))}
            </div>

            {lightboxIndex !== null && images.length > 0 && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setLightboxIndex(null)}>
                    <button className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300" onClick={() => setLightboxIndex(null)}>×</button>
                    <img src={`/storage/${images[lightboxIndex]?.media_url}`} alt="" className="max-w-full max-h-full object-contain" />
                    {lightboxIndex > 0 && (
                        <button className="absolute left-4 text-white text-3xl hover:text-gray-300" onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}>‹</button>
                    )}
                    {lightboxIndex < images.length - 1 && (
                        <button className="absolute right-4 text-white text-3xl hover:text-gray-300" onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}>›</button>
                    )}
                </div>
            )}
        </>
    );
}

function ReviewItem({ review, onVote }) {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Hari ini';
        if (diffDays === 1) return 'Kemarin';
        if (diffDays < 7) return `${diffDays} hari yang lalu`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu yang lalu`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan yang lalu`;
        return `${Math.floor(diffDays / 365)} tahun yang lalu`;
    };

    return (
        <div className="border-b border-slate-200 py-6 last:border-b-0">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
                        {review.user.name.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900">{review.user.name}</p>
                        {review.verified_purchase && (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                Verified Purchase
                            </span>
                        )}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                        <StarRating value={review.rating} />
                        <span className="text-xs text-slate-500">{formatDate(review.created_at)}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{review.comment}</p>
                    <MediaGallery media={review.media} />
                    <div className="mt-4 flex items-center gap-3">
                        <button onClick={() => onVote(review.id, true)} className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${review.user_vote === true ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                            👍 Helpful ({review.helpful_count})
                        </button>
                        <button onClick={() => onVote(review.id, false)} className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition ${review.user_vote === false ? 'bg-rose-50 border-rose-300 text-rose-700' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>
                            👎 Not Helpful ({review.not_helpful_count})
                        </button>
                    </div>
                    {review.admin_reply && (
                        <div className="mt-4 bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                            <p className="text-xs font-semibold text-indigo-600 mb-1">💬 Balasan dari Toko</p>
                            <p className="text-sm text-indigo-900">{review.admin_reply}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ProductReviews({ product, reviews, ratingStats, filters }) {
    const [currentFilters, setCurrentFilters] = useState(filters);

    const updateFilter = (key, value) => {
        const newFilters = { ...currentFilters, [key]: value };
        setCurrentFilters(newFilters);
        const params = new URLSearchParams();
        Object.entries(newFilters).forEach(([k, v]) => { if (v) params.append(k, v); });
        router.get(route('products.reviews', product.slug), Object.fromEntries(params), { preserveState: true, preserveScroll: true });
    };

    const handleVote = (reviewId, isHelpful) => {
        router.post(route('user.reviews.vote', reviewId), { is_helpful: isHelpful }, { preserveState: true, preserveScroll: true });
    };

    return (
        <GuestLayout>
            <Head title={`Reviews - ${product.name}`} />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <Link href="/" className="text-sm text-indigo-600 hover:text-indigo-800 mb-2 inline-block">← Kembali ke Produk</Link>
                    <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
                </div>
                <div className="grid lg:grid-cols-[300px_1fr] gap-6">
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-slate-200 p-6">
                            <div className="text-center mb-4">
                                <div className="text-5xl font-bold text-slate-900">{ratingStats.average.toFixed(1)}</div>
                                <StarRating value={Math.round(ratingStats.average)} size="text-2xl" />
                                <p className="text-sm text-slate-600 mt-2">{ratingStats.total} {ratingStats.total === 1 ? 'review' : 'reviews'}</p>
                            </div>
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <button key={rating} onClick={() => updateFilter('rating', currentFilters.rating === rating.toString() ? '' : rating.toString())} className={`w-full flex items-center gap-2 text-xs hover:bg-slate-50 p-2 rounded transition ${currentFilters.rating === rating.toString() ? 'bg-indigo-50' : ''}`}>
                                        <span className="font-medium">{rating}★</span>
                                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-400" style={{ width: `${ratingStats.breakdown[rating].percentage}%` }} />
                                        </div>
                                        <span className="text-slate-600">{ratingStats.breakdown[rating].count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-lg border border-slate-200 p-6">
                            <h3 className="font-semibold text-slate-900 mb-4">Filter Reviews</h3>
                            <div className="space-y-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={currentFilters.verified_only} onChange={(e) => updateFilter('verified_only', e.target.checked)} className="rounded border-slate-300 text-indigo-600" />
                                    <span className="text-sm text-slate-700">Verified Purchase Only</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={currentFilters.with_media} onChange={(e) => updateFilter('with_media', e.target.checked)} className="rounded border-slate-300 text-indigo-600" />
                                    <span className="text-sm text-slate-700">With Photos/Videos</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                            <h2 className="text-lg font-semibold text-slate-900">Customer Reviews ({ratingStats.total})</h2>
                            <select value={currentFilters.sort} onChange={(e) => updateFilter('sort', e.target.value)} className="text-sm border-slate-300 rounded-lg">
                                <option value="recent">Most Recent</option>
                                <option value="helpful">Most Helpful</option>
                                <option value="rating_high">Highest Rating</option>
                                <option value="rating_low">Lowest Rating</option>
                            </select>
                        </div>
                        <div>
                            {reviews.data.map((review) => (<ReviewItem key={review.id} review={review} onVote={handleVote} />))}
                            {reviews.data.length === 0 && (
                                <div className="text-center py-12">
                                    <p className="text-3xl mb-2">⭐</p>
                                    <p className="text-slate-500">No reviews found with current filters.</p>
                                </div>
                            )}
                        </div>
                        {reviews.links && reviews.links.length > 3 && (
                            <div className="flex justify-center gap-2 mt-8 pt-6 border-t border-slate-200">
                                {reviews.links.map((link, index) => (
                                    <Link key={index} href={link.url || '#'} className={`px-4 py-2 text-sm rounded-lg ${link.active ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'}`} dangerouslySetInnerHTML={{ __html: link.label }} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
