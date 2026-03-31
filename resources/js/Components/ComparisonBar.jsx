import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';

export default function ComparisonBar() {
    const [comparisons, setComparisons] = useState([]);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [hasSynced, setHasSynced] = useState(false);
    const maxItems = 4;

    // Sync localStorage with database on mount (if logged in)
    useEffect(() => {
        if (window.auth?.user && !hasSynced) {
            syncWithDatabase();
            setHasSynced(true);
        }
    }, [hasSynced]);

    const syncWithDatabase = async () => {
        const stored = localStorage.getItem('product_comparisons');
        if (stored) {
            try {
                const localComparisons = JSON.parse(stored);
                
                // Send each product to the database
                for (const product of localComparisons) {
                    try {
                        await axios.post(route('user.comparison.store'), {
                            product_id: product.id,
                        });
                    } catch (error) {
                        // Ignore errors (product might already be in database)
                        console.log('Sync error for product', product.id, ':', error.response?.data?.message);
                    }
                }
            } catch (error) {
                console.error('Error syncing comparisons:', error);
            }
        }
    };

    // Load comparisons from localStorage
    useEffect(() => {
        const loadComparisons = () => {
            const stored = localStorage.getItem('product_comparisons');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setComparisons(parsed);
                    setIsVisible(parsed.length > 0);
                } catch (error) {
                    console.error('Error parsing comparisons:', error);
                }
            }
        };

        loadComparisons();

        // Listen for storage changes
        window.addEventListener('storage', loadComparisons);
        window.addEventListener('comparison-updated', loadComparisons);

        return () => {
            window.removeEventListener('storage', loadComparisons);
            window.removeEventListener('comparison-updated', loadComparisons);
        };
    }, []);

    const handleRemove = (productId) => {
        const updated = comparisons.filter(c => c.id !== productId);
        localStorage.setItem('product_comparisons', JSON.stringify(updated));
        setComparisons(updated);
        setIsVisible(updated.length > 0);
        window.dispatchEvent(new Event('comparison-updated'));

        // Also update database if logged in
        if (window.auth?.user) {
            router.delete(route('user.comparison.destroy', productId), {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const handleClearAll = () => {
        localStorage.removeItem('product_comparisons');
        setComparisons([]);
        setIsVisible(false);
        window.dispatchEvent(new Event('comparison-updated'));

        // Also clear database if logged in
        if (window.auth?.user) {
            router.delete(route('user.comparison.clear'), {
                preserveScroll: true,
                preserveState: true,
            });
        }
    };

    const handleCompareNow = () => {
        if (window.auth?.user) {
            router.visit(route('user.comparison.index'));
        } else {
            router.visit(route('login'));
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 print:hidden">
            <div className="bg-white border-t-2 border-gray-300 shadow-2xl">
                {/* Collapse/Expand Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -top-10 right-4 bg-blue-600 text-white px-4 py-2 rounded-t-lg hover:bg-blue-700 transition-colors"
                >
                    {isCollapsed ? '▲' : '▼'} Compare ({comparisons.length}/{maxItems})
                </button>

                {!isCollapsed && (
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between gap-4">
                            {/* Product Thumbnails */}
                            <div className="flex gap-3 overflow-x-auto flex-1">
                                {comparisons.map((product) => (
                                    <div
                                        key={product.id}
                                        className="relative flex-shrink-0 group"
                                    >
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                                            {product.emoji ? (
                                                <div className="w-full h-full flex items-center justify-center text-3xl">
                                                    {product.emoji}
                                                </div>
                                            ) : product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    📦
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleRemove(product.id)}
                                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg"
                                            title="Remove"
                                        >
                                            ✕
                                        </button>
                                        <div className="mt-1 text-xs text-center text-gray-700 truncate w-20">
                                            {product.name}
                                        </div>
                                    </div>
                                ))}

                                {/* Empty Slots */}
                                {[...Array(maxItems - comparisons.length)].map((_, i) => (
                                    <div key={`empty-${i}`} className="flex-shrink-0">
                                        <div className="w-20 h-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                            <span className="text-gray-400 text-2xl">+</span>
                                        </div>
                                        <div className="mt-1 text-xs text-center text-gray-400">
                                            Empty
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2 flex-shrink-0">
                                <SecondaryButton
                                    onClick={handleClearAll}
                                    className="whitespace-nowrap"
                                >
                                    🗑️ Clear All
                                </SecondaryButton>
                                <PrimaryButton
                                    onClick={handleCompareNow}
                                    disabled={comparisons.length < 2}
                                    className="whitespace-nowrap"
                                >
                                    🔍 Compare Now
                                </PrimaryButton>
                            </div>
                        </div>

                        {comparisons.length < 2 && (
                            <div className="mt-2 text-sm text-center text-amber-600">
                                ⚠️ Add at least 2 products to compare
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
