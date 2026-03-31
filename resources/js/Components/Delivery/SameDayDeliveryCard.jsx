import { useState, useEffect } from 'react';
import axios from 'axios';

export default function SameDayDeliveryCard({ addressId, onSelect, selectedIsSameDay }) {
    const [availability, setAvailability] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        checkAvailability();
        
        // Update current time every minute
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, [addressId]);

    const checkAvailability = async () => {
        setLoading(true);
        try {
            const response = await axios.post(route('user.delivery.check-same-day'), {
                address_id: addressId
            });
            setAvailability(response.data);
        } catch (error) {
            console.error('Failed to check same-day availability:', error);
            setAvailability({ available: false, reason: 'Failed to check availability' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-3"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
        );
    }

    if (!availability) return null;

    const formatPrice = (price) => `Rp${Number(price).toLocaleString('id-ID')}`;
    
    const isAvailable = availability.available;
    const cutoffInfo = availability.cutoff;
    const showCountdown = !cutoffInfo?.passed && cutoffInfo?.total_minutes <= 120;

    return (
        <div 
            className={`rounded-xl border-2 p-5 transition-all cursor-pointer ${
                isAvailable
                    ? selectedIsSameDay
                        ? 'border-amber-500 bg-amber-50 shadow-md'
                        : 'border-amber-300 bg-amber-50/50 hover:border-amber-400'
                    : 'border-slate-200 bg-slate-100 cursor-not-allowed opacity-60'
            }`}
            onClick={() => isAvailable && onSelect()}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">⚡</span>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Same-Day Delivery</h3>
                        <p className="text-xs text-slate-600">
                            {isAvailable ? 'Available now!' : 'Not available'}
                        </p>
                    </div>
                </div>
                {isAvailable && (
                    <input
                        type="radio"
                        checked={selectedIsSameDay}
                        onChange={onSelect}
                        className="w-5 h-5 accent-amber-600"
                    />
                )}
            </div>

            {isAvailable ? (
                <div className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-white border border-amber-200 px-3 py-2">
                        <span className="text-sm text-slate-700">Extra Fee:</span>
                        <span className="font-bold text-amber-600">{formatPrice(availability.fee)}</span>
                    </div>

                    <div className="text-xs text-slate-600">
                        <p className="flex items-center gap-1">
                            <span>⏰</span>
                            <span>Order before 10:00 AM</span>
                        </p>
                        <p className="flex items-center gap-1 mt-1">
                            <span>📍</span>
                            <span>Available in: {availability.cities?.join(', ')}</span>
                        </p>
                    </div>

                    {showCountdown && (
                        <div className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 mt-2">
                            <p className="text-xs font-semibold text-rose-700">
                                ⚠️ Hurry! {cutoffInfo.hours}h {cutoffInfo.minutes}m until cutoff
                            </p>
                        </div>
                    )}

                    <p className="text-xs text-emerald-600 font-medium mt-2">
                        ✓ All items in stock and ready to ship
                    </p>
                </div>
            ) : (
                <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                    <p className="text-sm text-slate-600">
                        ❌ {availability.reason}
                    </p>
                </div>
            )}
        </div>
    );
}
