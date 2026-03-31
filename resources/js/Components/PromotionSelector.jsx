import { useState } from 'react';
import axios from 'axios';

export default function PromotionSelector({ availablePromotions = [], onApply, subtotal }) {
    const [promoCode, setPromoCode] = useState('');
    const [validating, setValidating] = useState(false);
    const [error, setError] = useState('');
    const [appliedPromotion, setAppliedPromotion] = useState(null);
    const [showAvailable, setShowAvailable] = useState(false);

    const validatePromo = async () => {
        if (!promoCode.trim()) {
            setError('Masukkan kode promosi');
            return;
        }

        setValidating(true);
        setError('');

        try {
            const response = await axios.post(route('user.promotions.validate'), {
                code: promoCode.toUpperCase(),
                cart_items: [], // Will be fetched from backend
            });

            if (response.data.valid) {
                const promotion = response.data.promotion;
                const discount = response.data.discount;
                
                setAppliedPromotion({
                    ...promotion,
                    discount_amount: discount.discount_amount,
                    free_shipping: discount.free_shipping || false,
                });
                
                if (onApply) {
                    onApply(promotion, discount);
                }
                
                setError('');
                setPromoCode('');
            } else {
                setError(response.data.message || 'Kode promosi tidak valid');
                setAppliedPromotion(null);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal memvalidasi kode promosi');
            setAppliedPromotion(null);
        } finally {
            setValidating(false);
        }
    };

    const removePromotion = () => {
        setAppliedPromotion(null);
        if (onApply) {
            onApply(null, null);
        }
    };

    const applyAvailablePromotion = (promo) => {
        setAppliedPromotion({
            ...promo,
            discount_amount: promo.discount_amount,
            free_shipping: promo.free_shipping || false,
        });
        
        if (onApply) {
            onApply(promo, { 
                discount_amount: promo.discount_amount, 
                free_shipping: promo.free_shipping 
            });
        }
        
        setShowAvailable(false);
    };

    return (
        <div className="space-y-4">
            {/* Applied Promotion Display */}
            {appliedPromotion && (
                <div className="rounded-lg border-2 border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">🎉</span>
                                <span className="font-semibold text-emerald-800">
                                    {appliedPromotion.name}
                                </span>
                            </div>
                            <p className="text-sm text-emerald-700 font-mono mb-2">
                                Kode: {appliedPromotion.code}
                            </p>
                            {appliedPromotion.description && (
                                <p className="text-sm text-emerald-600 mb-2">
                                    {appliedPromotion.description}
                                </p>
                            )}
                            <div className="flex items-center gap-3">
                                {appliedPromotion.discount_amount > 0 && (
                                    <span className="text-base font-bold text-emerald-900">
                                        Hemat: Rp {appliedPromotion.discount_amount.toLocaleString('id-ID')}
                                    </span>
                                )}
                                {appliedPromotion.free_shipping && (
                                    <span className="inline-flex items-center rounded-full bg-emerald-600 px-2 py-1 text-xs font-medium text-white">
                                        🚚 Gratis Ongkir
                                    </span>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={removePromotion}
                            className="ml-4 text-emerald-600 hover:text-emerald-800 text-sm font-medium"
                        >
                            ✕ Hapus
                        </button>
                    </div>
                </div>
            )}

            {/* Promo Code Input */}
            {!appliedPromotion && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Punya Kode Promosi?
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={promoCode}
                            onChange={(e) => {
                                setPromoCode(e.target.value.toUpperCase());
                                setError('');
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && validatePromo()}
                            placeholder="Masukkan kode promosi"
                            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm uppercase"
                            disabled={validating}
                        />
                        <button
                            onClick={validatePromo}
                            disabled={validating || !promoCode.trim()}
                            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {validating ? 'Memeriksa...' : 'Terapkan'}
                        </button>
                    </div>
                    {error && (
                        <p className="mt-2 text-sm text-red-600">
                            {error}
                        </p>
                    )}
                </div>
            )}

            {/* Available Promotions */}
            {!appliedPromotion && availablePromotions.length > 0 && (
                <div>
                    <button
                        onClick={() => setShowAvailable(!showAvailable)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                        <span>✨</span>
                        <span>
                            {showAvailable ? 'Sembunyikan' : 'Lihat'} Promosi Tersedia ({availablePromotions.length})
                        </span>
                    </button>

                    {showAvailable && (
                        <div className="mt-3 space-y-2">
                            {availablePromotions.map((promo) => (
                                <div
                                    key={promo.id}
                                    className="rounded-lg border border-slate-200 bg-white p-3 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                                    onClick={() => applyAvailablePromotion(promo)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="font-medium text-slate-800 mb-1">
                                                {promo.name}
                                            </div>
                                            <div className="text-xs font-mono text-slate-600 mb-2">
                                                {promo.code}
                                            </div>
                                            {promo.description && (
                                                <p className="text-sm text-slate-600 mb-2">
                                                    {promo.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {promo.discount_amount > 0 && (
                                                    <span className="text-sm font-semibold text-emerald-600">
                                                        Hemat: Rp {promo.discount_amount.toLocaleString('id-ID')}
                                                    </span>
                                                )}
                                                {promo.free_shipping && (
                                                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                        Gratis Ongkir
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button className="ml-3 text-blue-600 hover:text-blue-700 text-sm font-medium">
                                            Gunakan →
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
