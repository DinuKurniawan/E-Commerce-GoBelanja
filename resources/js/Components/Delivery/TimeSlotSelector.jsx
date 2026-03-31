import { useState, useEffect } from 'react';
import axios from 'axios';

const TIME_SLOTS = [
    { value: '09:00-12:00', label: 'Morning', time: '09:00 - 12:00', icon: '🌅' },
    { value: '12:00-15:00', label: 'Afternoon', time: '12:00 - 15:00', icon: '☀️' },
    { value: '15:00-18:00', label: 'Evening', time: '15:00 - 18:00', icon: '🌤️' },
    { value: '18:00-21:00', label: 'Night', time: '18:00 - 21:00', icon: '🌙' },
];

export default function TimeSlotSelector({ selectedDate, selectedSlot, onChange, isSameDay = false }) {
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (selectedDate) {
            fetchAvailableSlots();
        }
    }, [selectedDate]);

    const fetchAvailableSlots = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('user.delivery.available-slots'), {
                params: { date: selectedDate }
            });
            
            const slotValues = response.data.slots.map(s => s.value);
            setAvailableSlots(slotValues);
        } catch (error) {
            console.error('Failed to fetch time slots:', error);
            setAvailableSlots([]);
        } finally {
            setLoading(false);
        }
    };

    if (!selectedDate) {
        return (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
                Please select a delivery date first
            </div>
        );
    }

    if (loading) {
        return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4 animate-pulse">
                        <div className="h-6 bg-slate-200 rounded mb-2"></div>
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
                Choose Time Slot *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {TIME_SLOTS.map((slot) => {
                    const isAvailable = availableSlots.includes(slot.value);
                    const isSelected = selectedSlot === slot.value;
                    
                    return (
                        <button
                            key={slot.value}
                            type="button"
                            onClick={() => isAvailable && onChange(slot.value)}
                            disabled={!isAvailable}
                            className={`rounded-xl border-2 p-4 text-left transition-all ${
                                !isAvailable
                                    ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                                    : isSelected
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                    : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm cursor-pointer'
                            }`}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <span className="text-2xl">{slot.icon}</span>
                                {isAvailable && (
                                    <input
                                        type="radio"
                                        checked={isSelected}
                                        onChange={() => onChange(slot.value)}
                                        className="w-4 h-4 accent-indigo-600"
                                    />
                                )}
                            </div>
                            <p className={`font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                                {slot.label}
                            </p>
                            <p className={`text-xs ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`}>
                                {slot.time}
                            </p>
                            {!isAvailable && (
                                <p className="text-xs text-rose-600 mt-1">Not available</p>
                            )}
                        </button>
                    );
                })}
            </div>
            {selectedSlot && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
                    ✅ Selected: {TIME_SLOTS.find(s => s.value === selectedSlot)?.label} ({TIME_SLOTS.find(s => s.value === selectedSlot)?.time})
                </div>
            )}
        </div>
    );
}
