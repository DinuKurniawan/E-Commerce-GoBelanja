import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Copy, CheckCircle2, Users, Gift, Share2, Mail } from 'lucide-react';
import { FaFacebook, FaTwitter } from 'react-icons/fa';
import { useState } from 'react';

export default function Referral({ referralCode, referralsCount, referrals, bonusAmount }) {
    const [copied, setCopied] = useState(false);
    const referralUrl = `${window.location.origin}/register?ref=${referralCode}`;

    const copyReferralCode = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const copyReferralUrl = () => {
        navigator.clipboard.writeText(referralUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOnFacebook = () => {
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`,
            '_blank'
        );
    };

    const shareOnTwitter = () => {
        const text = `Join me and earn rewards! Use my referral code: ${referralCode}`;
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralUrl)}`,
            '_blank'
        );
    };

    const shareViaEmail = () => {
        const subject = 'Join and Earn Rewards!';
        const body = `Hi! I'd like to invite you to join our loyalty program. Use my referral code ${referralCode} when you sign up and we both earn bonus points!\n\nSign up here: ${referralUrl}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-slate-800">
                        Referral Program
                    </h2>
                    <Link
                        href={route('user.loyalty.index')}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                        Back to Dashboard
                    </Link>
                </div>
            }
        >
            <Head title="Referral Program" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* Stats */}
                    <div className="grid gap-6 md:grid-cols-3">
                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">
                                        Total Referrals
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-indigo-600">
                                        {referralsCount}
                                    </p>
                                </div>
                                <div className="rounded-full bg-indigo-100 p-3">
                                    <Users className="h-6 w-6 text-indigo-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Bonus Per Referral</p>
                                    <p className="mt-2 text-3xl font-bold text-green-600">
                                        {bonusAmount}
                                    </p>
                                    <p className="text-xs text-slate-500">points</p>
                                </div>
                                <div className="rounded-full bg-green-100 p-3">
                                    <Gift className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">
                                        Total Earned
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-purple-600">
                                        {(referralsCount * bonusAmount).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-500">points</p>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3">
                                    <Share2 className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Referral Code Card */}
                    <div className="rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 p-8 text-white shadow-lg">
                        <h3 className="mb-4 text-2xl font-bold">Your Referral Code</h3>
                        <div className="mb-6 rounded-lg bg-white p-6">
                            <p className="mb-2 text-center text-sm font-medium text-slate-600">
                                Share this code
                            </p>
                            <div className="flex items-center justify-center gap-4">
                                <p className="text-center text-4xl font-bold tracking-wider text-indigo-600">
                                    {referralCode}
                                </p>
                                <button
                                    onClick={copyReferralCode}
                                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white transition hover:bg-indigo-700"
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
                        </div>

                        <div className="mb-6">
                            <p className="mb-2 text-sm font-medium">Or share this link:</p>
                            <div className="flex items-center gap-2 rounded-lg bg-white/10 p-3">
                                <input
                                    type="text"
                                    value={referralUrl}
                                    readOnly
                                    className="flex-1 bg-transparent text-sm text-white outline-none"
                                />
                                <button
                                    onClick={copyReferralUrl}
                                    className="rounded bg-white/20 px-3 py-1 text-sm transition hover:bg-white/30"
                                >
                                    Copy Link
                                </button>
                            </div>
                        </div>

                        <div>
                            <p className="mb-3 text-sm font-medium">Share on social media:</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={shareOnFacebook}
                                    className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 transition hover:bg-blue-700"
                                >
                                    <FaFacebook className="h-5 w-5" />
                                    Facebook
                                </button>
                                <button
                                    onClick={shareOnTwitter}
                                    className="flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 transition hover:bg-sky-600"
                                >
                                    <FaTwitter className="h-5 w-5" />
                                    Twitter
                                </button>
                                <button
                                    onClick={shareViaEmail}
                                    className="flex items-center gap-2 rounded-lg bg-slate-600 px-4 py-2 transition hover:bg-slate-700"
                                >
                                    <Mail className="h-5 w-5" />
                                    Email
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* How it Works */}
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h3 className="mb-4 text-lg font-semibold text-slate-800">How It Works</h3>
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
                                    1
                                </div>
                                <h4 className="mb-2 font-semibold text-slate-800">Share Your Code</h4>
                                <p className="text-sm text-slate-600">
                                    Send your referral code to friends via social media, email, or
                                    direct message.
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-600">
                                    2
                                </div>
                                <h4 className="mb-2 font-semibold text-slate-800">Friend Signs Up</h4>
                                <p className="text-sm text-slate-600">
                                    Your friend creates an account using your referral code and gets 100 bonus points.
                                </p>
                            </div>
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-lg font-bold text-purple-600">
                                    3
                                </div>
                                <h4 className="mb-2 font-semibold text-slate-800">Earn Rewards</h4>
                                <p className="text-sm text-slate-600">
                                    You receive {bonusAmount} points instantly! Unlimited referrals allowed.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Referral List */}
                    <div className="rounded-lg bg-white shadow">
                        <div className="border-b border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-800">
                                Your Referrals ({referralsCount})
                            </h3>
                        </div>
                        <div className="p-6">
                            {referrals.length === 0 ? (
                                <div className="py-12 text-center">
                                    <Users className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                                    <p className="mb-2 font-medium text-slate-700">No referrals yet</p>
                                    <p className="text-sm text-slate-500">
                                        Start sharing your referral code to earn bonus points!
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {referrals.map((referral) => (
                                        <div
                                            key={referral.id}
                                            className="flex items-center justify-between rounded-lg border border-slate-200 p-4"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
                                                    {referral.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">
                                                        {referral.name}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {referral.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-slate-700">
                                                    Joined: {formatDate(referral.joined_at)}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    Tier: {referral.tier}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
