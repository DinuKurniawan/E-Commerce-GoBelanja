import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function TrendingProducts({ days = 7, limit = 12 }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTrendingProducts();
    }, [days, limit]);

    const fetchTrendingProducts = async () => {
        try {
            const response = await axios.get('/api/recommendations/trending', {
                params: { days, limit }
            });
            setProducts(response.data.products);
        } catch (error) {
            console.error('Error fetching trending products:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <section className="mb-12">
                <div className="h-10 bg-gray-200 rounded w-1/4 mb-6 animate-pulse"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-80 bg-gray-200 rounded animate-pulse"></div>
                    ))}
                </div>
            </section>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-3xl font-bold">Trending Now</h2>
                <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-semibold flex items-center gap-1">
                    🔥 Hot
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {products.map((product, index) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden relative"
                    >
                        {/* Trending Badge */}
                        {index < 3 && (
                            <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                <span className="text-sm">🔥</span>
                                #{index + 1}
                            </div>
                        )}
                        
                        <div className="relative">
                            <img 
                                src={product.image_url || '/placeholder.png'} 
                                alt={product.name}
                                className="w-full h-48 object-cover"
                            />
                            {product.is_new && (
                                <span className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                    NEW
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
                            
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-lg font-bold text-blue-600">
                                    Rp {parseFloat(product.price).toLocaleString()}
                                </p>
                                {product.rating > 0 && (
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </svg>
                                        <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>

                            {product.views_count > 0 && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span>{product.views_count.toLocaleString()} views</span>
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
