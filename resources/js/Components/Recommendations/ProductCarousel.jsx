import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function ProductCarousel({ title, endpoint, productId, limit = 8 }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scrollPosition, setScrollPosition] = useState(0);
    const carouselRef = useRef(null);

    useEffect(() => {
        fetchProducts();
    }, [endpoint, productId]);

    const fetchProducts = async () => {
        try {
            const url = productId 
                ? `/api/recommendations/${endpoint}/${productId}`
                : `/api/recommendations/${endpoint}`;
            const response = await axios.get(url);
            setProducts(response.data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const scroll = (direction) => {
        if (!carouselRef.current) return;
        
        const scrollAmount = 300;
        const newPosition = direction === 'left' 
            ? scrollPosition - scrollAmount 
            : scrollPosition + scrollAmount;
        
        carouselRef.current.scrollTo({
            left: newPosition,
            behavior: 'smooth'
        });
        setScrollPosition(newPosition);
    };

    if (loading) {
        return (
            <div className="mb-8">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
                <div className="flex gap-4 overflow-hidden">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="min-w-[250px] h-80 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{title}</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                        disabled={scrollPosition <= 0}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div 
                ref={carouselRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {products.map((product) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="min-w-[250px] bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden flex-shrink-0"
                    >
                        <div className="relative">
                            <img 
                                src={product.image_url || '/placeholder.png'} 
                                alt={product.name}
                                className="w-full h-48 object-cover"
                            />
                            {product.is_new && (
                                <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                    NEW
                                </span>
                            )}
                            {product.is_featured && (
                                <span className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                    ⭐ Featured
                                </span>
                            )}
                        </div>
                        <div className="p-4">
                            <h3 className="font-semibold text-sm line-clamp-2 mb-2 h-10">
                                {product.name}
                            </h3>
                            
                            {product.category && (
                                <p className="text-xs text-gray-500 mb-2">
                                    {product.category.name}
                                </p>
                            )}
                            
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-bold text-blue-600">
                                        Rp {parseFloat(product.price).toLocaleString()}
                                    </p>
                                </div>
                                {product.rating > 0 && (
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </svg>
                                        <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>

                            {product.stock <= 0 && (
                                <div className="mt-2">
                                    <span className="text-red-500 text-xs font-semibold">Out of Stock</span>
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
