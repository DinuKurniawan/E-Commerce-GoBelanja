import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Filter, TrendingUp, Gift, ArrowRight, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function History({ history, filterType }) {
    const [selectedType, setSelectedType] = useState(filterType || '');

    const handleFilterChange = (type) => {
        setSelectedType(type);
        router.get(
            route('user.loyalty.history'),
            { type: type || undefined },
            { preserveState: true }
        );
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getPointsColor = (type) => {
        if (type === 'earned' || type === 'bonus') return 'text-green-600';
        if (type === 'redeemed' || type === 'expired') return 'text-red-600';
        return 'text-slate-600';
    };

    const getTypeBadge = (type) => {
        const badges = {
            earned: 'bg-green-100 text-green-700',
            bonus: 'bg-blue-100 text-blue-700',
            redeemed: 'bg-red-100 text-red-700',
            expired: 'bg-gray-100 text-gray-700',
        };
        return badges[type] || 'bg-slate-100 text-slate-700';
    };

    const getSourceLabel = (source) => {
        const labels = {
            order: 'Order Purchase',
            referral: 'Referral Bonus',
            birthday: 'Birthday Bonus',
            signup: 'Signup Bonus',
            redemption: 'Points Redemption',
            expiration: 'Points Expired',
            admin_adjustment: 'Admin Adjustment',
            tier_upgrade: 'Tier Upgrade',
        };
        return labels[source] || source;
    };

    const typeOptions = [
        { value: '', label: 'All Types' },
        { value: 'earned', label: 'Earned' },
        { value: 'bonus', label: 'Bonus' },
        { value: 'redeemed', label: 'Redeemed' },
        { value: 'expired', label: 'Expired' },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-slate-800">
                        Points History
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
            <Head title="Points History" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* Filter */}
                    <div className="rounded-lg bg-white p-4 shadow">
                        <div className="flex items-center gap-4">
                            <Filter className="h-5 w-5 text-slate-600" />
                            <span className="text-sm font-medium text-slate-700">Filter by:</span>
                            <div className="flex flex-wrap gap-2">
                                {typeOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        onClick={() => handleFilterChange(option.value)}
                                        className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                                            selectedType === option.value
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* History Table */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                            Date & Time
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                            Source
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                            Description
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                            Points
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                            Expiry
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {history.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan="6"
                                                className="px-6 py-12 text-center text-slate-500"
                                            >
                                                No history found.
                                            </td>
                                        </tr>
                                    ) : (
                                        history.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="transition hover:bg-slate-50"
                                            >
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-4 w-4 text-slate-400" />
                                                        {formatDate(item.created_at)}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getTypeBadge(
                                                            item.type
                                                        )}`}
                                                    >
                                                        {item.type.charAt(0).toUpperCase() +
                                                            item.type.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-700">
                                                    {getSourceLabel(item.source)}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-700">
                                                    {item.description}
                                                    {item.order && (
                                                        <Link
                                                            href={route(
                                                                'user.orders.show',
                                                                item.order.id
                                                            )}
                                                            className="ml-2 text-indigo-600 hover:text-indigo-700"
                                                        >
                                                            View Order
                                                        </Link>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4">
                                                    <span
                                                        className={`text-lg font-bold ${getPointsColor(
                                                            item.type
                                                        )}`}
                                                    >
                                                        {item.points > 0 ? '+' : ''}
                                                        {item.points.toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                                                    {item.expires_at ? (
                                                        <span
                                                            className={
                                                                new Date(item.expires_at) <
                                                                new Date()
                                                                    ? 'text-red-600'
                                                                    : ''
                                                            }
                                                        >
                                                            {formatDate(item.expires_at)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400">N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Info Cards */}
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg bg-green-50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-green-100 p-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-green-700">Earned Points</p>
                                    <p className="text-xl font-bold text-green-900">
                                        {history
                                            .filter((h) => h.type === 'earned')
                                            .reduce((sum, h) => sum + h.points, 0)
                                            .toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-blue-50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-blue-100 p-2">
                                    <Gift className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-blue-700">Bonus Points</p>
                                    <p className="text-xl font-bold text-blue-900">
                                        {history
                                            .filter((h) => h.type === 'bonus')
                                            .reduce((sum, h) => sum + h.points, 0)
                                            .toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-red-50 p-4">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-red-100 p-2">
                                    <ArrowRight className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-red-700">Redeemed Points</p>
                                    <p className="text-xl font-bold text-red-900">
                                        {Math.abs(
                                            history
                                                .filter((h) => h.type === 'redeemed')
                                                .reduce((sum, h) => sum + h.points, 0)
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
