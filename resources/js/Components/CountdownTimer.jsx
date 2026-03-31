import { useEffect, useState } from 'react';

export default function CountdownTimer({ endsAt, className = '' }) {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [isUrgent, setIsUrgent] = useState(false);

    function calculateTimeLeft() {
        const difference = new Date(endsAt) - new Date();
        
        if (difference <= 0) {
            return null;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        return { days, hours, minutes, seconds, total: difference };
    }

    useEffect(() => {
        const timer = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);

            // Set urgent if less than 1 hour remaining
            if (newTimeLeft && newTimeLeft.total < 3600000) {
                setIsUrgent(true);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [endsAt]);

    if (!timeLeft) {
        return <span className={`font-bold text-gray-500 ${className}`}>BERAKHIR</span>;
    }

    return (
        <div className={`font-mono font-bold ${isUrgent ? 'text-red-600' : 'text-blue-600'} ${className}`}>
            {timeLeft.days > 0 && <span>{String(timeLeft.days).padStart(2, '0')}h </span>}
            <span>{String(timeLeft.hours).padStart(2, '0')}j </span>
            <span>{String(timeLeft.minutes).padStart(2, '0')}m </span>
            <span>{String(timeLeft.seconds).padStart(2, '0')}d</span>
        </div>
    );
}
