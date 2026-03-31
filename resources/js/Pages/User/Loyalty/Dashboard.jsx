import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Gift, TrendingUp, Users, Calendar, ArrowRight, Copy, CheckCircle2 } from 'lucide-react';
import TierBadge from '@/Components/Loyalty/TierBadge';
import PointsDisplay from '@/Components/Loyalty/PointsDisplay';
import TierProgress from '@/Components/Loyalty/TierProgress';
import { useState } from 'react';

export default function Dashboard({ loyaltyTier, availablePoints, recentHistory, referralCode }) {
    const [copied, setCopied] = useState(false);

    const copyReferralCode = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getPointsColor = (type) => {
        if (type === 'earned' || type === 'bonus') return 'text-green-600';
        if (type === 'redeemed' || type === 'expired') return 'text-red-600';
        return 'text-slate-600';
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'earned':
                return <TrendingUp className="h-4 w-4" />;
            case 'bonus':
                return <Gift className="h-4 w-4" />;
            case 'redeemed':
                return <ArrowRight className="h-4 w-4" />;
            default:
                return null;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-slate-800">
                    Loyalty Program
                </h2>
            }
        >
            <Head title="Loyalty Program" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* Tier Status Card */}
                    <div className="overflow-hidden rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="mb-2 text-lg font-medium">Your Tier Status</h3>
                                <TierBadge
                                    tier={loyaltyTier.tier}
                                    size="lg"
                                    className="bg-white !text-slate-800"
                                />
                                <p className="mt-4 text-sm opacity-90">
                                    Discount: {loyaltyTier.tier_discount}% on all orders
                                </p>
                            </div>
                            <PointsDisplay
                                points={availablePoints}
                                label="Available Points"
                                size="xl"
                                className="text-white"
                            />
                        </div>
                    </div>

                    {/* Points Overview */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">
                                        Available Points
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-indigo-600">
                                        {availablePoints.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded-full bg-indigo-100 p-3">
                                    <Gift className="h-6 w-6 text-indigo-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">
                                        Lifetime Points
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-slate-800">
                                        {loyaltyTier.lifetime_points.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded-full bg-slate-100 p-3">
                                    <TrendingUp className="h-6 w-6 text-slate-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Referrals</p>
                                    <p className="mt-2 text-3xl font-bold text-green-600">
                                        {loyaltyTier.referrals_count}
                                    </p>
                                </div>
                                <div className="rounded-full bg-green-100 p-3">
                                    <Users className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tier Progress */}
                    {loyaltyTier.next_tier && (
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h3 className="mb-4 text-lg font-semibold text-slate-800">
                                Tier Progress
                            </h3>
                            <TierProgress
                                currentTier={loyaltyTier.tier}
                                nextTier={loyaltyTier.next_tier}
                                currentPoints={loyaltyTier.lifetime_points}
                                requiredPoints={
                                    loyaltyTier.lifetime_points + loyaltyTier.points_to_next_tier
                                }
                            />
                        </div>
                    )}

                    {/* Referral Card */}
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="mb-2 text-lg font-semibold text-slate-800">
                                    Invite Friends & Earn Points
                                </h3>
                                <p className="mb-4 text-sm text-slate-600">
                                    Share your referral code and earn 500 points for each friend who
                                    signs up!
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 rounded-lg border-2 border-dashed border-indigo-300 bg-indigo-50 p-4">
                                        <p className="text-center text-2xl font-bold tracking-wider text-indigo-600">
                                            {referralCode}
                                        </p>
                                    </div>
                                    <button
                                        onClick={copyReferralCode}
                                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-white transition hover:bg-indigo-700"
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCircle2 className="h-5 w-5" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-5 w-5" />
                                                Copy
                                            </>
                                        )}
                                    </button>
                                </div>
                                <Link
                                    href={route('user.loyalty.referral')}
                                    className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                >
                                    View referral details
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="rounded-lg bg-white p-6 shadow">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Recent Activity
                            </h3>
                            <Link
                                href={route('user.loyalty.history')}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                            >
                                View All
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentHistory.length === 0 ? (
                                <p className="py-8 text-center text-slate-500">
                                    No activity yet. Start earning points by making purchases!
                                </p>
                            ) : (
                                recentHistory.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`rounded-full p-2 ${
                                                    item.type === 'earned' || item.type === 'bonus'
                                                        ? 'bg-green-100'
                                                        : 'bg-red-100'
                                                }`}
                                            >
                                                {getTypeIcon(item.type)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">
                                                    {item.description}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {formatDate(item.created_at)}
                                                    {item.expires_at && (
                                                        <span className="ml-2">
                                                            • Expires: {formatDate(item.expires_at)}
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            className={`font-bold ${getPointsColor(item.type)}`}
                                        >
                                            {item.points > 0 ? '+' : ''}
                                            {item.points.toLocaleString()}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <Link
                            href={route('user.loyalty.history')}
                            className="flex items-center justify-between rounded-lg border-2 border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow"
                        >
                            <div>
                                <h4 className="font-semibold text-slate-800">Points History</h4>
                                <p className="text-sm text-slate-600">
                                    View all your points transactions
                                </p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-slate-400" />
                        </Link>

                        <Link
                            href={route('user.loyalty.referral')}
                            className="flex items-center justify-between rounded-lg border-2 border-slate-200 bg-white p-4 transition hover:border-indigo-300 hover:shadow"
                        >
                            <div>
                                <h4 className="font-semibold text-slate-800">Referral Program</h4>
                                <p className="text-sm text-slate-600">
                                    Invite friends and earn rewards
                                </p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-slate-400" />
                        </Link>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
