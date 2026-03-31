import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function SearchBar({ initialQuery = '', onSearch }) {
    const [query, setQuery] = useState(initialQuery);
    const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);
    const debounceTimeout = useRef(null);
    const wrapperRef = useRef(null);

    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (searchQuery) => {
        if (searchQuery.trim().length < 2) {
            setSuggestions({ products: [], categories: [] });
            setShowSuggestions(false);
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/products/autocomplete?q=${encodeURIComponent(searchQuery)}`);
            const data = await response.json();
            setSuggestions(data);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);

        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        debounceTimeout.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 300);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        setShowSuggestions(false);
        if (onSearch) {
            onSearch(query);
        }
    };

    const handleClear = () => {
        setQuery('');
        setSuggestions({ products: [], categories: [] });
        setShowSuggestions(false);
        if (onSearch) {
            onSearch('');
        }
    };

    const handleSuggestionClick = (item, type) => {
        setShowSuggestions(false);
        if (type === 'product') {
            setQuery(item.name);
            if (onSearch) {
                onSearch(item.name);
            }
        } else if (type === 'category') {
            router.get(route('products.search'), { categories: [item.id] });
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div ref={wrapperRef} className="relative w-full">
            <form onSubmit={handleSearch} className="relative">
                <div className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        placeholder="Cari produk..."
                        className="w-full rounded-lg border border-gray-300 py-3 pl-12 pr-12 text-gray-900 placeholder-gray-400 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    {query && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                        >
                            <XMarkIcon className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </form>

            {showSuggestions && (suggestions.products.length > 0 || suggestions.categories.length > 0) && (
                <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    {suggestions.categories.length > 0 && (
                        <div className="border-b border-gray-100 p-2">
                            <div className="mb-2 px-3 text-xs font-semibold uppercase text-gray-500">
                                Kategori
                            </div>
                            {suggestions.categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleSuggestionClick(category, 'category')}
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-gray-50"
                                >
                                    {category.icon && <span className="text-xl">{category.icon}</span>}
                                    <span className="font-medium text-gray-700">{category.name}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {suggestions.products.length > 0 && (
                        <div className="p-2">
                            <div className="mb-2 px-3 text-xs font-semibold uppercase text-gray-500">
                                Produk
                            </div>
                            {suggestions.products.map((product) => (
                                <button
                                    key={product.id}
                                    onClick={() => handleSuggestionClick(product, 'product')}
                                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors hover:bg-gray-50"
                                >
                                    {product.image_url && (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="h-10 w-10 rounded object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{product.name}</div>
                                        <div className="text-sm text-blue-600">
                                            {formatPrice(product.price)}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {loading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                </div>
            )}
        </div>
    );
}
