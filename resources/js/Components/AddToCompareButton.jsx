import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function AddToCompareButton({ product, className = '' }) {
    const [isInComparison, setIsInComparison] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const maxItems = 4;

    useEffect(() => {
        checkIfInComparison();

        const handleUpdate = () => {
            checkIfInComparison();
        };

        window.addEventListener('comparison-updated', handleUpdate);
        window.addEventListener('storage', handleUpdate);

        return () => {
            window.removeEventListener('comparison-updated', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, [product.id]);

    const checkIfInComparison = () => {
        const stored = localStorage.getItem('product_comparisons');
        if (stored) {
            try {
                const comparisons = JSON.parse(stored);
                setIsInComparison(comparisons.some(c => c.id === product.id));
            } catch (error) {
                console.error('Error checking comparison:', error);
            }
        }
    };

    const getComparisonCount = () => {
        const stored = localStorage.getItem('product_comparisons');
        if (stored) {
            try {
                return JSON.parse(stored).length;
            } catch (error) {
                return 0;
            }
        }
        return 0;
    };

    const handleToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLoading(true);

        try {
            const stored = localStorage.getItem('product_comparisons');
            let comparisons = stored ? JSON.parse(stored) : [];

            if (isInComparison) {
                // Remove from comparison
                comparisons = comparisons.filter(c => c.id !== product.id);
                localStorage.setItem('product_comparisons', JSON.stringify(comparisons));
                setIsInComparison(false);

                // Update database if logged in
                if (window.auth?.user) {
                    router.delete(route('user.comparison.destroy', product.id), {
                        preserveScroll: true,
                        preserveState: true,
                        onError: () => {
                            // Revert on error
                            comparisons.push({
                                id: product.id,
                                name: product.name,
                                emoji: product.emoji,
                                image_url: product.image_url,
                            });
                            localStorage.setItem('product_comparisons', JSON.stringify(comparisons));
                            setIsInComparison(true);
                        }
                    });
                }
            } else {
                // Check max limit
                if (comparisons.length >= maxItems) {
                    alert(`Maximum ${maxItems} products allowed in comparison. Please remove one to add another.`);
                    setIsLoading(false);
                    return;
                }

                // Add to comparison
                const comparisonItem = {
                    id: product.id,
                    name: product.name,
                    emoji: product.emoji,
                    image_url: product.image_url,
                };

                comparisons.push(comparisonItem);
                localStorage.setItem('product_comparisons', JSON.stringify(comparisons));
                setIsInComparison(true);

                // Update database if logged in
                if (window.auth?.user) {
                    router.post(route('user.comparison.store'), {
                        product_id: product.id,
                    }, {
                        preserveScroll: true,
                        preserveState: true,
                        onError: () => {
                            // Revert on error
                            comparisons = comparisons.filter(c => c.id !== product.id);
                            localStorage.setItem('product_comparisons', JSON.stringify(comparisons));
                            setIsInComparison(false);
                        }
                    });
                }
            }

            window.dispatchEvent(new Event('comparison-updated'));
        } catch (error) {
            console.error('Error toggling comparison:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 rounded-md border transition-colors ${
                isInComparison
                    ? 'border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
            title={isInComparison ? 'Remove from comparison' : 'Add to comparison'}
        >
            {isInComparison ? (
                <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">In Comparison</span>
                </>
            ) : (
                <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="text-sm font-medium">Compare</span>
                </>
            )}
        </button>
    );
}
