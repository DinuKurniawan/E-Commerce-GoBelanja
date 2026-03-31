export default function TierProgress({ currentTier, nextTier, currentPoints, requiredPoints }) {
    const percentage = nextTier
        ? Math.min((currentPoints / requiredPoints) * 100, 100)
        : 100;

    const tierColors = {
        Bronze: 'bg-amber-500',
        Silver: 'bg-gray-500',
        Gold: 'bg-yellow-500',
        Platinum: 'bg-purple-500',
    };

    const progressColor = tierColors[nextTier] || tierColors.Silver;

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">
                    {nextTier ? `Progress to ${nextTier}` : 'Maximum Tier Reached!'}
                </span>
                {nextTier && (
                    <span className="text-slate-600">
                        {currentPoints.toLocaleString()} / {requiredPoints.toLocaleString()}
                    </span>
                )}
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                    className={`h-full transition-all duration-500 ${progressColor}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {nextTier && (
                <p className="text-xs text-slate-600">
                    {(requiredPoints - currentPoints).toLocaleString()} points to {nextTier}
                </p>
            )}
        </div>
    );
}
