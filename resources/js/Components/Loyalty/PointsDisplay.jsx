export default function PointsDisplay({ points, label = 'Available Points', size = 'md' }) {
    const sizes = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-2xl',
        xl: 'text-4xl',
    };

    const labelSizes = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base',
        xl: 'text-lg',
    };

    return (
        <div className="flex flex-col">
            <span className={`font-semibold text-slate-600 ${labelSizes[size]}`}>{label}</span>
            <span className={`font-bold text-indigo-600 ${sizes[size]}`}>
                {points?.toLocaleString() ?? 0}
            </span>
        </div>
    );
}
