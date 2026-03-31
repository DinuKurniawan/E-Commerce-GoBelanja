import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import Modal from '@/Components/Modal';

export default function Comparisons({ comparisons, maxItems }) {
    const [showClearModal, setShowClearModal] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState('all');

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    const handleRemove = (productId) => {
        router.delete(route('user.comparison.destroy', productId), {
            preserveScroll: true,
        });
    };

    const handleClearAll = () => {
        router.delete(route('user.comparison.clear'), {
            onSuccess: () => setShowClearModal(false),
        });
    };

    const handleAddToCart = (productId) => {
        router.post(route('user.cart.store'), {
            product_id: productId,
            quantity: 1,
        }, {
            preserveScroll: true,
        });
    };

    const handlePrint = () => {
        window.print();
    };

    const getStockStatus = (stock, allowPreOrder) => {
        if (stock > 10) return { text: 'In Stock', color: 'text-green-600' };
        if (stock > 0) return { text: `Only ${stock} left`, color: 'text-yellow-600' };
        if (allowPreOrder) return { text: 'Pre-order', color: 'text-blue-600' };
        return { text: 'Out of Stock', color: 'text-red-600' };
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="flex items-center gap-1">
                {[...Array(fullStars)].map((_, i) => (
                    <span key={`full-${i}`} className="text-yellow-400">★</span>
                ))}
                {hasHalfStar && <span className="text-yellow-400">⯨</span>}
                {[...Array(emptyStars)].map((_, i) => (
                    <span key={`empty-${i}`} className="text-gray-300">★</span>
                ))}
                <span className="ml-1 text-sm text-gray-600">({rating.toFixed(1)})</span>
            </div>
        );
    };

    if (comparisons.length === 0) {
        return (
            <AuthenticatedLayout
                header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Product Comparison</h2>}
            >
                <Head title="Product Comparison" />

                <div className="py-12">
                    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                            <div className="p-12 text-center">
                                <div className="text-6xl mb-4">🔍</div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    No Products to Compare
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Start adding products to compare features side by side
                                </p>
                                <PrimaryButton
                                    onClick={() => router.visit('/')}
                                >
                                    Browse Products
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    const features = [
        { key: 'image', label: 'Product Image' },
        { key: 'name', label: 'Product Name' },
        { key: 'price', label: 'Price' },
        { key: 'rating', label: 'Rating' },
        { key: 'stock', label: 'Stock Status' },
        { key: 'category', label: 'Category' },
        { key: 'weight', label: 'Weight' },
        { key: 'sizes', label: 'Available Sizes' },
        { key: 'reviews', label: 'Reviews' },
        { key: 'description', label: 'Description' },
    ];

    const highlightDifferences = (key) => {
        if (comparisons.length <= 1) return {};
        
        const values = comparisons.map(c => {
            switch(key) {
                case 'price':
                    return c.flash_sale ? c.flash_sale.discounted_price : c.price;
                case 'rating':
                    return c.rating;
                case 'stock':
                    return c.stock;
                case 'category':
                    return c.category?.name;
                case 'weight':
                    return c.weight;
                case 'reviews':
                    return c.reviews_count;
                default:
                    return null;
            }
        });

        const allSame = values.every(v => v === values[0]);
        return allSame ? {} : { backgroundColor: '#fef3c7' };
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Product Comparison ({comparisons.length}/{maxItems})
                    </h2>
                    <div className="flex gap-2">
                        <SecondaryButton onClick={handlePrint}>
                            🖨️ Print
                        </SecondaryButton>
                        {comparisons.length > 0 && (
                            <DangerButton onClick={() => setShowClearModal(true)}>
                                🗑️ Clear All
                            </DangerButton>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Product Comparison" />

            <div className="py-6">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Desktop View - Table */}
                    <div className="hidden lg:block overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="w-48 px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                            Features
                                        </th>
                                        {comparisons.map((comparison) => (
                                            <th key={comparison.id} className="px-6 py-4">
                                                <button
                                                    onClick={() => handleRemove(comparison.product_id)}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    ✕ Remove
                                                </button>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {/* Product Image */}
                                    <tr>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            Product Image
                                        </td>
                                        {comparisons.map((comparison) => (
                                            <td key={comparison.id} className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    <div className="relative h-48 w-48">
                                                        {comparison.emoji && (
                                                            <div className="absolute inset-0 flex items-center justify-center text-6xl">
                                                                {comparison.emoji}
                                                            </div>
                                                        )}
                                                        {comparison.image_url && (
                                                            <img
                                                                src={comparison.image_url}
                                                                alt={comparison.name}
                                                                className="h-full w-full object-contain"
                                                            />
                                                        )}
                                                        {comparison.images.length > 0 && (
                                                            <img
                                                                src={comparison.images[0].image_url}
                                                                alt={comparison.name}
                                                                className="h-full w-full object-cover rounded-lg"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Product Name */}
                                    <tr>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            Product Name
                                        </td>
                                        {comparisons.map((comparison) => (
                                            <td key={comparison.id} className="px-6 py-4">
                                                <div className="text-center">
                                                    <div className="font-semibold text-gray-900">{comparison.name}</div>
                                                    {comparison.is_new && (
                                                        <span className="inline-flex mt-1 rounded-full bg-green-100 px-2 text-xs font-semibold text-green-800">
                                                            NEW
                                                        </span>
                                                    )}
                                                    {comparison.is_featured && (
                                                        <span className="inline-flex mt-1 ml-1 rounded-full bg-blue-100 px-2 text-xs font-semibold text-blue-800">
                                                            FEATURED
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Price */}
                                    <tr style={highlightDifferences('price')}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            Price
                                        </td>
                                        {comparisons.map((comparison) => (
                                            <td key={comparison.id} className="px-6 py-4 text-center">
                                                {comparison.flash_sale ? (
                                                    <div>
                                                        <div className="text-lg font-bold text-red-600">
                                                            {formatPrice(comparison.flash_sale.discounted_price)}
                                                        </div>
                                                        <div className="text-sm text-gray-500 line-through">
                                                            {formatPrice(comparison.price)}
                                                        </div>
                                                        <div className="text-xs text-red-600 font-semibold">
                                                            🔥 {comparison.flash_sale.discount_percent}% OFF
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-lg font-bold text-gray-900">
                                                        {formatPrice(comparison.price)}
                                                    </div>
                                                )}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Rating */}
                                    <tr style={highlightDifferences('rating')}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            Rating
                                        </td>
                                        {comparisons.map((comparison) => (
                                            <td key={comparison.id} className="px-6 py-4">
                                                <div className="flex justify-center">
                                                    {renderStars(comparison.rating)}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Stock Status */}
                                    <tr style={highlightDifferences('stock')}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            Stock Status
                                        </td>
                                        {comparisons.map((comparison) => {
                                            const status = getStockStatus(comparison.stock, comparison.allow_pre_order);
                                            return (
                                                <td key={comparison.id} className="px-6 py-4 text-center">
                                                    <span className={`font-semibold ${status.color}`}>
                                                        {status.text}
                                                    </span>
                                                </td>
                                            );
                                        })}
                                    </tr>

                                    {/* Category */}
                                    <tr style={highlightDifferences('category')}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            Category
                                        </td>
                                        {comparisons.map((comparison) => (
                                            <td key={comparison.id} className="px-6 py-4 text-center text-gray-700">
                                                {comparison.category?.name || 'N/A'}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Weight */}
                                    <tr style={highlightDifferences('weight')}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            Weight
                                        </td>
                                        {comparisons.map((comparison) => (
                                            <td key={comparison.id} className="px-6 py-4 text-center text-gray-700">
                                                {comparison.weight} grams
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Available Sizes */}
                                    <tr>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            Available Sizes
                                        </td>
                                        {comparisons.map((comparison) => (
                                            <td key={comparison.id} className="px-6 py-4 text-center">
                                                {comparison.sizes.length > 0 ? (
                                                    <div className="flex flex-wrap justify-center gap-2">
                                                        {comparison.sizes.map((size, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-flex rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                                                            >
                                                                {size.name} ({size.stock})
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">N/A</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Reviews Count */}
                                    <tr style={highlightDifferences('reviews')}>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            Total Reviews
                                        </td>
                                        {comparisons.map((comparison) => (
                                            <td key={comparison.id} className="px-6 py-4 text-center text-gray-700">
                                                {comparison.reviews_count} reviews
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Description */}
                                    <tr>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            Description
                                        </td>
                                        {comparisons.map((comparison) => (
                                            <td key={comparison.id} className="px-6 py-4">
                                                <div className="text-sm text-gray-700 max-w-xs">
                                                    {comparison.description}
                                                </div>
                                            </td>
                                        ))}
                                    </tr>

                                    {/* Action Buttons */}
                                    <tr>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                            Actions
                                        </td>
                                        {comparisons.map((comparison) => (
                                            <td key={comparison.id} className="px-6 py-4">
                                                <div className="flex flex-col gap-2">
                                                    <PrimaryButton
                                                        onClick={() => handleAddToCart(comparison.product_id)}
                                                        disabled={comparison.stock === 0 && !comparison.allow_pre_order}
                                                    >
                                                        🛒 Add to Cart
                                                    </PrimaryButton>
                                                    <SecondaryButton
                                                        onClick={() => handleRemove(comparison.product_id)}
                                                    >
                                                        Remove
                                                    </SecondaryButton>
                                                </div>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mobile View - Cards */}
                    <div className="lg:hidden space-y-4">
                        {comparisons.map((comparison) => (
                            <div key={comparison.id} className="bg-white shadow-sm rounded-lg p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">{comparison.name}</h3>
                                    <button
                                        onClick={() => handleRemove(comparison.product_id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Image */}
                                <div className="mb-4">
                                    <div className="relative h-48 w-full">
                                        {comparison.emoji && (
                                            <div className="absolute inset-0 flex items-center justify-center text-6xl">
                                                {comparison.emoji}
                                            </div>
                                        )}
                                        {comparison.images.length > 0 && (
                                            <img
                                                src={comparison.images[0].image_url}
                                                alt={comparison.name}
                                                className="h-full w-full object-cover rounded-lg"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Price: </span>
                                        {comparison.flash_sale ? (
                                            <span>
                                                <span className="text-red-600 font-bold">
                                                    {formatPrice(comparison.flash_sale.discounted_price)}
                                                </span>
                                                <span className="text-gray-500 line-through ml-2">
                                                    {formatPrice(comparison.price)}
                                                </span>
                                            </span>
                                        ) : (
                                            <span className="font-bold">{formatPrice(comparison.price)}</span>
                                        )}
                                    </div>

                                    <div>
                                        <span className="font-medium text-gray-700">Rating: </span>
                                        {renderStars(comparison.rating)}
                                    </div>

                                    <div>
                                        <span className="font-medium text-gray-700">Stock: </span>
                                        <span className={getStockStatus(comparison.stock, comparison.allow_pre_order).color}>
                                            {getStockStatus(comparison.stock, comparison.allow_pre_order).text}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="font-medium text-gray-700">Category: </span>
                                        <span>{comparison.category?.name || 'N/A'}</span>
                                    </div>

                                    <div>
                                        <span className="font-medium text-gray-700">Weight: </span>
                                        <span>{comparison.weight} grams</span>
                                    </div>

                                    <div>
                                        <span className="font-medium text-gray-700">Reviews: </span>
                                        <span>{comparison.reviews_count} reviews</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex gap-2">
                                    <PrimaryButton
                                        onClick={() => handleAddToCart(comparison.product_id)}
                                        disabled={comparison.stock === 0 && !comparison.allow_pre_order}
                                        className="flex-1"
                                    >
                                        🛒 Add to Cart
                                    </PrimaryButton>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Clear All Modal */}
            <Modal show={showClearModal} onClose={() => setShowClearModal(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-gray-900">Clear All Comparisons</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Are you sure you want to remove all products from comparison? This action cannot be undone.
                    </p>
                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={() => setShowClearModal(false)}>
                            Cancel
                        </SecondaryButton>
                        <DangerButton onClick={handleClearAll}>
                            Clear All
                        </DangerButton>
                    </div>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
