import React, { useState } from 'react';

// Star Rating Component - Display or Interactive
export function StarRating({ 
    rating, 
    onRatingChange = null, 
    size = 'md', 
    showValue = false,
    readonly = false 
}) {
    const [hoverRating, setHoverRating] = useState(0);
    
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
        xl: 'w-8 h-8'
    };
    
    const handleClick = (value) => {
        if (!readonly && onRatingChange) {
            onRatingChange(value);
        }
    };
    
    const displayRating = hoverRating || rating;
    
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => handleClick(star)}
                    onMouseEnter={() => !readonly && setHoverRating(star)}
                    onMouseLeave={() => !readonly && setHoverRating(0)}
                    disabled={readonly}
                    className={`${sizeClasses[size]} ${
                        readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
                    } transition-transform`}
                >
                    <svg
                        className={`w-full h-full ${
                            star <= displayRating 
                                ? 'text-yellow-400 fill-current' 
                                : 'text-gray-300 fill-current'
                        }`}
                        viewBox="0 0 20 20"
                    >
                        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                    </svg>
                </button>
            ))}
            {showValue && (
                <span className="ml-2 text-sm font-medium text-gray-700">
                    {rating.toFixed(1)}
                </span>
            )}
        </div>
    );
}

// Rating Breakdown Component
export function RatingBreakdown({ ratings }) {
    const totalReviews = Object.values(ratings).reduce((sum, count) => sum + count, 0);
    const averageRating = totalReviews > 0
        ? Object.entries(ratings).reduce((sum, [star, count]) => sum + (star * count), 0) / totalReviews
        : 0;
    
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-3">
                <div className="text-4xl font-bold text-gray-900">
                    {averageRating.toFixed(1)}
                </div>
                <div>
                    <StarRating rating={averageRating} size="md" readonly />
                    <p className="text-sm text-gray-600 mt-1">
                        {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                    </p>
                </div>
            </div>
            
            <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratings[star] || 0;
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    
                    return (
                        <div key={star} className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700 w-8">
                                {star} ★
                            </span>
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-yellow-400 transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="text-sm text-gray-600 w-12 text-right">
                                {count}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Verified Purchase Badge
export function VerifiedPurchaseBadge({ verified = false, className = '' }) {
    if (!verified) return null;
    
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded ${className}`}>
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified Purchase
        </span>
    );
}

// Media Gallery Component
export function MediaGallery({ media = [], altText = 'Review media' }) {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    if (!media || media.length === 0) return null;
    
    const openModal = (index) => {
        setSelectedIndex(index);
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedIndex(null);
    };
    
    const goToPrevious = () => {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : media.length - 1));
    };
    
    const goToNext = () => {
        setSelectedIndex((prev) => (prev < media.length - 1 ? prev + 1 : 0));
    };
    
    return (
        <>
            <div className="grid grid-cols-4 gap-2 mt-3">
                {media.slice(0, 4).map((item, index) => (
                    <button
                        key={index}
                        onClick={() => openModal(index)}
                        className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 hover:opacity-80 transition-opacity"
                    >
                        {item.type === 'video' ? (
                            <div className="relative w-full h-full">
                                <video
                                    src={item.url}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                    </svg>
                                </div>
                            </div>
                        ) : (
                            <img
                                src={item.url}
                                alt={`${altText} ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        )}
                        {index === 3 && media.length > 4 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white text-lg font-semibold">
                                    +{media.length - 4}
                                </span>
                            </div>
                        )}
                    </button>
                ))}
            </div>
            
            {isModalOpen && selectedIndex !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
                    <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    
                    {media.length > 1 && (
                        <>
                            <button
                                onClick={goToPrevious}
                                className="absolute left-4 text-white hover:text-gray-300 z-10"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            
                            <button
                                onClick={goToNext}
                                className="absolute right-4 text-white hover:text-gray-300 z-10"
                            >
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}
                    
                    <div className="max-w-4xl max-h-[90vh] w-full mx-4">
                        {media[selectedIndex].type === 'video' ? (
                            <video
                                src={media[selectedIndex].url}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <img
                                src={media[selectedIndex].url}
                                alt={`${altText} ${selectedIndex + 1}`}
                                className="w-full h-full object-contain"
                            />
                        )}
                        <div className="text-center text-white mt-4">
                            {selectedIndex + 1} / {media.length}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

// Media Upload Component
export function MediaUpload({ onFilesSelected, maxFiles = 5, acceptedTypes = 'image/*,video/*' }) {
    const [previews, setPreviews] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    
    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        processFiles(files);
    };
    
    const processFiles = (files) => {
        const validFiles = files.slice(0, maxFiles - previews.length);
        
        const newPreviews = validFiles.map(file => ({
            file,
            url: URL.createObjectURL(file),
            type: file.type.startsWith('video/') ? 'video' : 'image'
        }));
        
        setPreviews(prev => [...prev, ...newPreviews]);
        
        if (onFilesSelected) {
            onFilesSelected([...previews.map(p => p.file), ...validFiles]);
        }
    };
    
    const removePreview = (index) => {
        setPreviews(prev => {
            const updated = prev.filter((_, i) => i !== index);
            URL.revokeObjectURL(prev[index].url);
            
            if (onFilesSelected) {
                onFilesSelected(updated.map(p => p.file));
            }
            
            return updated;
        });
    };
    
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };
    
    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };
    
    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        processFiles(files);
    };
    
    return (
        <div className="space-y-3">
            {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                            {preview.type === 'video' ? (
                                <video
                                    src={preview.url}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <img
                                    src={preview.url}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            )}
                            <button
                                type="button"
                                onClick={() => removePreview(index)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
            
            {previews.length < maxFiles && (
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        isDragging 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                    }`}
                >
                    <input
                        type="file"
                        id="media-upload"
                        accept={acceptedTypes}
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label htmlFor="media-upload" className="cursor-pointer">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-600">
                            <span className="font-semibold text-blue-600 hover:text-blue-500">
                                Click to upload
                            </span>
                            {' '}or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Images or videos (max {maxFiles} files)
                        </p>
                    </label>
                </div>
            )}
        </div>
    );
}

// Utility Function - Format Relative Date
export function formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
        return 'just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
    }
    
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
}
