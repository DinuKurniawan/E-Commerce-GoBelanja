import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function FrequentlyBoughtTogether({ productId, currentProduct }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState([productId]);
    const [totalPrice, setTotalPrice] = useState(currentProduct?.price || 0);

    useEffect(() => {
        fetchRecommendations();
    }, [productId]);

    useEffect(() => {
        calculateTotal();
    }, [selectedProducts]);

    const fetchRecommendations = async () => {
        try {
            const response = await axios.get(`/api/recommendations/frequently-bought/${productId}`);
            setProducts(response.data.products.slice(0, 3));
        } catch (error) {
            console.error('Error fetching frequently bought together:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        let total = 0;
        if (selectedProducts.includes(productId)) {
            total += parseFloat(currentProduct?.price || 0);
        }
        products.forEach(product => {
            if (selectedProducts.includes(product.id)) {
                total += parseFloat(product.price);
            }
        });
        setTotalPrice(total);
    };

    const toggleProduct = (id) => {
        setSelectedProducts(prev => {
            if (prev.includes(id)) {
                return prev.filter(pid => pid !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const addSelectedToCart = async () => {
        try {
            for (const productId of selectedProducts) {
                await axios.post('/cart/add', {
                    product_id: productId,
                    quantity: 1
                });
            }
            window.location.href = '/cart';
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Failed to add products to cart');
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="flex gap-4">
                    <div className="h-32 bg-gray-200 rounded flex-1"></div>
                    <div className="h-32 bg-gray-200 rounded flex-1"></div>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold mb-6">Frequently Bought Together</h2>
            
            <div className="space-y-6">
                {/* Products Display */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Current Product */}
                    <div className="border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <input
                                type="checkbox"
                                checked={selectedProducts.includes(productId)}
                                onChange={() => toggleProduct(productId)}
                                className="mt-1"
                            />
                            <div className="flex-1">
                                <img 
                                    src={currentProduct?.image_url || '/placeholder.png'} 
                                    alt={currentProduct?.name}
                                    className="w-full h-32 object-cover rounded mb-2"
                                />
                                <h3 className="font-semibold text-sm line-clamp-2">{currentProduct?.name}</h3>
                                <p className="text-lg font-bold text-blue-600 mt-2">
                                    Rp {parseFloat(currentProduct?.price || 0).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Plus signs */}
                    {products.slice(0, 3).map((product, index) => (
                        <React.Fragment key={product.id}>
                            {index < 3 && (
                                <div className="hidden md:flex items-center justify-center text-2xl font-bold text-gray-400">
                                    +
                                </div>
                            )}
                            <div className="border rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(product.id)}
                                        onChange={() => toggleProduct(product.id)}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <img 
                                            src={product.image_url || '/placeholder.png'} 
                                            alt={product.name}
                                            className="w-full h-32 object-cover rounded mb-2"
                                        />
                                        <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                                        <p className="text-lg font-bold text-blue-600 mt-2">
                                            Rp {parseFloat(product.price).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </React.Fragment>
                    ))}
                </div>

                {/* Total and Add Button */}
                <div className="flex items-center justify-between border-t pt-4">
                    <div>
                        <p className="text-sm text-gray-600">Total for {selectedProducts.length} item(s):</p>
                        <p className="text-2xl font-bold text-blue-600">
                            Rp {totalPrice.toLocaleString()}
                        </p>
                    </div>
                    <button
                        onClick={addSelectedToCart}
                        disabled={selectedProducts.length === 0}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                    >
                        Add Selected to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}
