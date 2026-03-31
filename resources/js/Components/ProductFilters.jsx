import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';

export default function ProductFilters({ 
    categories = [], 
    priceRange = { min: 0, max: 1000000 }, 
    filters = {},
    onFilterChange 
}) {
    const [localFilters, setLocalFilters] = useState({
        min_price: filters.min_price || priceRange.min,
        max_price: filters.max_price || priceRange.max,
        categories: filters.categories || [],
        min_rating: filters.min_rating || '',
        availability: filters.availability || '',
        flash_sale: filters.flash_sale || false,
        sort: filters.sort || 'newest',
    });

    const [showMobileFilters, setShowMobileFilters] = useState(false);

    useEffect(() => {
        setLocalFilters({
            min_price: filters.min_price || priceRange.min,
            max_price: filters.max_price || priceRange.max,
            categories: filters.categories || [],
            min_rating: filters.min_rating || '',
            availability: filters.availability || '',
            flash_sale: filters.flash_sale || false,
            sort: filters.sort || 'newest',
        });
    }, [filters, priceRange]);

    const handlePriceChange = (type, value) => {
        const newFilters = { ...localFilters, [type]: value };
        setLocalFilters(newFilters);
    };

    const handleCategoryToggle = (categoryId) => {
        const currentCategories = Array.isArray(localFilters.categories) 
            ? localFilters.categories 
            : [];
        
        const newCategories = currentCategories.includes(categoryId)
            ? currentCategories.filter(id => id !== categoryId)
            : [...currentCategories, categoryId];
        
        const newFilters = { ...localFilters, categories: newCategories };
        setLocalFilters(newFilters);
        applyFilters(newFilters);
    };

    const handleRatingChange = (rating) => {
        const newFilters = { 
            ...localFilters, 
            min_rating: localFilters.min_rating === rating ? '' : rating 
        };
        setLocalFilters(newFilters);
        applyFilters(newFilters);
    };

    const handleAvailabilityChange = (availability) => {
        const newFilters = { 
            ...localFilters, 
            availability: localFilters.availability === availability ? '' : availability 
        };
        setLocalFilters(newFilters);
        applyFilters(newFilters);
    };

    const handleFlashSaleToggle = () => {
        const newFilters = { ...localFilters, flash_sale: !localFilters.flash_sale };
        setLocalFilters(newFilters);
        applyFilters(newFilters);
    };

    const handleSortChange = (sort) => {
        const newFilters = { ...localFilters, sort };
        setLocalFilters(newFilters);
        applyFilters(newFilters);
    };

    const applyPriceFilter = () => {
        applyFilters(localFilters);
    };

    const applyFilters = (filters) => {
        if (onFilterChange) {
            onFilterChange(filters);
        }
    };

    const clearAllFilters = () => {
        const newFilters = {
            min_price: priceRange.min,
            max_price: priceRange.max,
            categories: [],
            min_rating: '',
            availability: '',
            flash_sale: false,
            sort: 'newest',
        };
        setLocalFilters(newFilters);
        applyFilters(newFilters);
    };

    const hasActiveFilters = () => {
        return (
            localFilters.categories.length > 0 ||
            localFilters.min_rating ||
            localFilters.availability ||
            localFilters.flash_sale ||
            localFilters.min_price !== priceRange.min ||
            localFilters.max_price !== priceRange.max
        );
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID').format(price);
    };

    const FilterContent = () => (
        <div className="space-y-6">
            {/* Sort */}
            <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Urutkan</h3>
                <select
                    value={localFilters.sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="newest">Terbaru</option>
                    <option value="price_asc">Harga Terendah</option>
                    <option value="price_desc">Harga Tertinggi</option>
                    <option value="rating">Rating Tertinggi</option>
                    <option value="popular">Terpopuler</option>
                </select>
            </div>

            {/* Price Range */}
            <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Rentang Harga</h3>
                <div className="space-y-3">
                    <div>
                        <label className="mb-1 block text-xs text-gray-600">Minimum</label>
                        <input
                            type="number"
                            value={localFilters.min_price}
                            onChange={(e) => handlePriceChange('min_price', e.target.value)}
                            onBlur={applyPriceFilter}
                            min={priceRange.min}
                            max={priceRange.max}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Rp ${formatPrice(priceRange.min)}`}
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs text-gray-600">Maximum</label>
                        <input
                            type="number"
                            value={localFilters.max_price}
                            onChange={(e) => handlePriceChange('max_price', e.target.value)}
                            onBlur={applyPriceFilter}
                            min={priceRange.min}
                            max={priceRange.max}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Rp ${formatPrice(priceRange.max)}`}
                        />
                    </div>
                    <button
                        onClick={applyPriceFilter}
                        className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        Terapkan
                    </button>
                </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
                <div>
                    <h3 className="mb-3 text-sm font-semibold text-gray-900">Kategori</h3>
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <label
                                key={category.id}
                                className="flex cursor-pointer items-center gap-2 rounded-lg p-2 transition-colors hover:bg-gray-50"
                            >
                                <input
                                    type="checkbox"
                                    checked={localFilters.categories.includes(category.id)}
                                    onChange={() => handleCategoryToggle(category.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex flex-1 items-center gap-2">
                                    {category.icon && <span className="text-lg">{category.icon}</span>}
                                    <span className="text-sm text-gray-700">{category.name}</span>
                                    {category.products_count > 0 && (
                                        <span className="ml-auto text-xs text-gray-500">
                                            ({category.products_count})
                                        </span>
                                    )}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Rating */}
            <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Rating Minimum</h3>
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <button
                            key={rating}
                            onClick={() => handleRatingChange(rating)}
                            className={`flex w-full items-center gap-2 rounded-lg p-2 transition-colors ${
                                localFilters.min_rating === rating
                                    ? 'bg-blue-50 ring-2 ring-blue-500'
                                    : 'hover:bg-gray-50'
                            }`}
                        >
                            <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                    <StarIcon
                                        key={i}
                                        className={`h-4 w-4 ${
                                            i < rating ? 'text-yellow-400' : 'text-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-gray-700">& Lebih</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Availability */}
            <div>
                <h3 className="mb-3 text-sm font-semibold text-gray-900">Ketersediaan</h3>
                <div className="space-y-2">
                    <button
                        onClick={() => handleAvailabilityChange('in_stock')}
                        className={`flex w-full items-center gap-2 rounded-lg p-2 text-sm transition-colors ${
                            localFilters.availability === 'in_stock'
                                ? 'bg-blue-50 ring-2 ring-blue-500'
                                : 'hover:bg-gray-50'
                        }`}
                    >
                        <span className="text-gray-700">Stok Tersedia</span>
                    </button>
                    <button
                        onClick={() => handleAvailabilityChange('pre_order')}
                        className={`flex w-full items-center gap-2 rounded-lg p-2 text-sm transition-colors ${
                            localFilters.availability === 'pre_order'
                                ? 'bg-blue-50 ring-2 ring-blue-500'
                                : 'hover:bg-gray-50'
                        }`}
                    >
                        <span className="text-gray-700">Pre-Order</span>
                    </button>
                </div>
            </div>

            {/* Flash Sale */}
            <div>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50">
                    <input
                        type="checkbox"
                        checked={localFilters.flash_sale}
                        onChange={handleFlashSaleToggle}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">Flash Sale</div>
                        <div className="text-xs text-gray-500">Produk sedang diskon</div>
                    </div>
                </label>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters() && (
                <button
                    onClick={clearAllFilters}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                    <XMarkIcon className="h-4 w-4" />
                    Hapus Semua Filter
                </button>
            )}
        </div>
    );

    return (
        <>
            {/* Mobile Filter Button */}
            <button
                onClick={() => setShowMobileFilters(true)}
                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 transition-colors hover:bg-gray-50 lg:hidden"
            >
                <FunnelIcon className="h-5 w-5" />
                Filter
                {hasActiveFilters() && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                        {localFilters.categories.length + 
                         (localFilters.min_rating ? 1 : 0) + 
                         (localFilters.availability ? 1 : 0) + 
                         (localFilters.flash_sale ? 1 : 0)}
                    </span>
                )}
            </button>

            {/* Desktop Filters */}
            <div className="hidden lg:block">
                <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-gray-200">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Filter</h2>
                        {hasActiveFilters() && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                                {localFilters.categories.length + 
                                 (localFilters.min_rating ? 1 : 0) + 
                                 (localFilters.availability ? 1 : 0) + 
                                 (localFilters.flash_sale ? 1 : 0)}
                            </span>
                        )}
                    </div>
                    <FilterContent />
                </div>
            </div>

            {/* Mobile Filters Modal */}
            {showMobileFilters && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black bg-opacity-50"
                        onClick={() => setShowMobileFilters(false)}
                    />
                    <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4">
                            <h2 className="text-lg font-semibold text-gray-900">Filter</h2>
                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                            >
                                <XMarkIcon className="h-6 w-6 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4">
                            <FilterContent />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
