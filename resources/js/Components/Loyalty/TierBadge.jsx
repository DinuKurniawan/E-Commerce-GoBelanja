import { Award, Crown, Medal, Star } from 'lucide-react';

const tierIcons = {
    Bronze: Medal,
    Silver: Award,
    Gold: Crown,
    Platinum: Star,
};

const tierColors = {
    Bronze: {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        border: 'border-amber-300',
        ring: 'ring-amber-200',
    },
    Silver: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-300',
        ring: 'ring-gray-200',
    },
    Gold: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        border: 'border-yellow-300',
        ring: 'ring-yellow-200',
    },
    Platinum: {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        border: 'border-purple-300',
        ring: 'ring-purple-200',
    },
};

export default function TierBadge({ tier, size = 'md', showIcon = true, className = '' }) {
    const Icon = tierIcons[tier] || Medal;
    const colors = tierColors[tier] || tierColors.Bronze;

    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${colors.bg} ${colors.text} ${colors.border} ${sizes[size]} ${className}`}
        >
            {showIcon && <Icon className={iconSizes[size]} />}
            {tier}
        </span>
    );
}
