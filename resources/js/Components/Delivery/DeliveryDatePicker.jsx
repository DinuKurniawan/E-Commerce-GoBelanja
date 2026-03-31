import { useState, useEffect } from 'react';
import axios from 'axios';

export default function DeliveryDatePicker({ addressId, selectedDate, onChange, isSameDay = false }) {
    const [availableDates, setAvailableDates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentMonth, setCurrentMonth] = useState(new Date());

    useEffect(() => {
        fetchAvailableDates();
    }, [addressId]);

    const fetchAvailableDates = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('user.delivery.available-dates'), {
                params: { address_id: addressId }
            });
            setAvailableDates(response.data.dates);
        } catch (error) {
            console.error('Failed to fetch available dates:', error);
            setAvailableDates([]);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        return { daysInMonth, startingDayOfWeek, year, month };
    };

    const formatDate = (year, month, day) => {
        const m = String(month + 1).padStart(2, '0');
        const d = String(day).padStart(2, '0');
        return `${year}-${m}-${d}`;
    };

    const isDateAvailable = (dateStr) => {
        return availableDates.some(d => d.date === dateStr);
    };

    const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const goToPreviousMonth = () => {
        setCurrentMonth(new Date(year, month - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentMonth(new Date(year, month + 1, 1));
    };

    const today = new Date();
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

    if (loading) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white p-4 animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
                <div className="grid grid-cols-7 gap-2">
                    {[...Array(35)].map((_, i) => (
                        <div key={i} className="h-10 bg-slate-200 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (isSameDay) {
        // For same-day delivery, show today's date
        const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());
        return (
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-slate-700 mb-2">Delivery Date</p>
                <div className="rounded-lg border-2 border-amber-500 bg-white px-4 py-3">
                    <p className="font-bold text-slate-800">Today</p>
                    <p className="text-sm text-slate-600">
                        {today.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        })}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
                Choose Delivery Date *
            </label>
            
            <div className="rounded-xl border border-slate-200 bg-white p-4">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        type="button"
                        onClick={goToPreviousMonth}
                        disabled={isCurrentMonth}
                        className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    
                    <h3 className="font-bold text-slate-800">
                        {monthNames[month]} {year}
                    </h3>
                    
                    <button
                        type="button"
                        onClick={goToNextMonth}
                        className="p-2 rounded-lg hover:bg-slate-100"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-slate-500 py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Empty cells for days before month starts */}
                    {[...Array(startingDayOfWeek)].map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square"></div>
                    ))}
                    
                    {/* Days of the month */}
                    {[...Array(daysInMonth)].map((_, i) => {
                        const day = i + 1;
                        const dateStr = formatDate(year, month, day);
                        const isAvailable = isDateAvailable(dateStr);
                        const isSelected = selectedDate === dateStr;
                        
                        return (
                            <button
                                key={day}
                                type="button"
                                onClick={() => isAvailable && onChange(dateStr)}
                                disabled={!isAvailable}
                                className={`aspect-square rounded-lg text-sm font-medium transition-all ${
                                    !isAvailable
                                        ? 'text-slate-300 cursor-not-allowed'
                                        : isSelected
                                        ? 'bg-indigo-600 text-white shadow-md'
                                        : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 cursor-pointer'
                                }`}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>

            {selectedDate && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
                    ✅ Selected: {availableDates.find(d => d.date === selectedDate)?.formatted}
                </div>
            )}
        </div>
    );
}
