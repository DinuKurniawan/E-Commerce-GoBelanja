const TIME_SLOTS = {
    '09:00-12:00': { label: 'Morning', time: '09:00 - 12:00', icon: '🌅' },
    '12:00-15:00': { label: 'Afternoon', time: '12:00 - 15:00', icon: '☀️' },
    '15:00-18:00': { label: 'Evening', time: '15:00 - 18:00', icon: '🌤️' },
    '18:00-21:00': { label: 'Night', time: '18:00 - 21:00', icon: '🌙' },
};

export default function DeliveryScheduleSummary({ 
    deliveryDate, 
    timeSlot, 
    isSameDay, 
    sameDayFee, 
    specialInstructions,
    onEdit 
}) {
    if (!deliveryDate || !timeSlot) {
        return null;
    }

    const formatPrice = (price) => `Rp${Number(price).toLocaleString('id-ID')}`;
    
    const formatDate = (dateStr) => {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };

    const slotInfo = TIME_SLOTS[timeSlot] || {};

    return (
        <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4 space-y-3">
            <div className="flex items-start justify-between">
                <h3 className="font-bold text-indigo-900 flex items-center gap-2">
                    <span>🚚</span>
                    <span>Delivery Schedule</span>
                </h3>
                {onEdit && (
                    <button
                        type="button"
                        onClick={onEdit}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline"
                    >
                        Edit
                    </button>
                )}
            </div>

            <div className="space-y-2">
                {isSameDay && (
                    <div className="rounded-lg bg-amber-100 border border-amber-300 px-3 py-2 flex items-center gap-2">
                        <span className="text-lg">⚡</span>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-amber-900">Same-Day Delivery</p>
                            <p className="text-xs text-amber-700">Extra fee: {formatPrice(sameDayFee)}</p>
                        </div>
                    </div>
                )}

                <div className="rounded-lg bg-white border border-indigo-200 px-4 py-3">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">{slotInfo.icon}</span>
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wide">Delivery Date & Time</p>
                            <p className="font-bold text-slate-800 mt-1">
                                {formatDate(deliveryDate)}
                            </p>
                            <p className="text-sm text-indigo-600 font-medium mt-1">
                                {slotInfo.label} ({slotInfo.time})
                            </p>
                        </div>
                    </div>
                </div>

                {specialInstructions && (
                    <div className="rounded-lg bg-white border border-indigo-200 px-4 py-3">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Special Instructions
                        </p>
                        <p className="text-sm text-slate-700">
                            {specialInstructions}
                        </p>
                    </div>
                )}
            </div>

            <div className="rounded-lg bg-white border border-indigo-200 px-3 py-2 text-xs text-slate-600">
                <p className="flex items-center gap-1">
                    <span>✓</span>
                    <span>Your order will be delivered on the selected date and time</span>
                </p>
            </div>
        </div>
    );
}
