import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function ProductRecommendations({ 
    title = "You Might Also Like", 
    type = 'similar', 
    productIds = [],
    limit = 6 
}) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (productIds.length > 0) {
            fetchRecommendations();
        } else {
            setLoading(false);
        }
    }, [productIds]);

    const fetchRecommendations = async () => {
        try {
            const recommendations = [];
            
            for (const productId of productIds.slice(0, 3)) {
                const response = await axios.get(`/api/recommendations/${type}/${productId}`);
                recommendations.push(...response.data.products);
            }

            // Remove duplicates and limit
            const uniqueProducts = recommendations.filter((product, index, self) =>
                index === self.findIndex((p) => p.id === product.id)
            );
            
            setProducts(uniqueProducts.slice(0, limit));
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="mb-8">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
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
            <h2 className="text-2xl font-bold mb-6">{title}</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {products.map((product) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
                    >
                        <div className="relative overflow-hidden">
                            <img 
                                src={product.image_url || '/placeholder.png'} 
                                alt={product.name}
                                className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                            {product.is_new && (
                                <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
                                    NEW
                                </span>
                            )}
                        </div>
                        <div className="p-3">
                            <h3 className="font-semibold text-sm line-clamp-2 mb-2 h-10">
                                {product.name}
                            </h3>
                            
                            <div className="flex items-center justify-between">
                                <p className="text-base font-bold text-blue-600">
                                    Rp {parseFloat(product.price).toLocaleString()}
                                </p>
                                {product.rating > 0 && (
                                    <div className="flex items-center gap-1">
                                        <svg className="w-3 h-3 text-yellow-400 fill-current" viewBox="0 0 20 20">
                                            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                        </svg>
                                        <span className="text-xs font-medium">{product.rating.toFixed(1)}</span>
                                    </div>
                                )}
                            </div>

                            <button className="mt-3 w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold hover:bg-blue-700 transition">
                                Quick Add
                            </button>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
