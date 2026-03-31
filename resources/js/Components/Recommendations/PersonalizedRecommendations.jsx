import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function PersonalizedRecommendations({ auth }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (auth?.user) {
            fetchRecommendations();
        } else {
            setLoading(false);
        }
    }, [auth]);

    const fetchRecommendations = async () => {
        try {
            const response = await axios.get('/api/recommendations/for-you');
            setProducts(response.data.products);
        } catch (error) {
            console.error('Error fetching personalized recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!auth?.user || loading) {
        return null;
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold">Recommended For You</h2>
                    <p className="text-gray-600 mt-1">Based on your browsing and purchase history</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {products.map((product) => (
                    <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
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
                                    ⭐
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
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
