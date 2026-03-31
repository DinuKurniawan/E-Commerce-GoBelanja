import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { Search, Filter, Users, TrendingUp, Award, Gift } from 'lucide-react';
import { useState } from 'react';
import TierBadge from '@/Components/Loyalty/TierBadge';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Index({ users, statistics, filters }) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedTier, setSelectedTier] = useState(filters.tier || '');
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        points: '',
        reason: '',
        type: 'add',
    });

    const handleSearch = () => {
        router.get(
            route('admin.loyalty.index'),
            { search: searchTerm, tier: selectedTier },
            { preserveState: true }
        );
    };

    const handleTierFilter = (tier) => {
        setSelectedTier(tier);
        router.get(
            route('admin.loyalty.index'),
            { search: searchTerm, tier: tier || undefined },
            { preserveState: true }
        );
    };

    const openAdjustModal = (user) => {
        setSelectedUser(user);
        setShowAdjustModal(true);
        reset();
    };

    const closeAdjustModal = () => {
        setShowAdjustModal(false);
        setSelectedUser(null);
        reset();
    };

    const handleAdjustPoints = (e) => {
        e.preventDefault();
        post(route('admin.loyalty.adjust', selectedUser.id), {
            onSuccess: () => closeAdjustModal(),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-slate-800">
                    Loyalty Program Management
                </h2>
            }
        >
            <Head title="Loyalty Management" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* Statistics */}
                    <div className="grid gap-6 md:grid-cols-4">
                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">
                                        Total Users
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-slate-800">
                                        {statistics.total_users.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded-full bg-slate-100 p-3">
                                    <Users className="h-6 w-6 text-slate-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">
                                        Points Awarded
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-green-600">
                                        {statistics.total_points_awarded.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded-full bg-green-100 p-3">
                                    <TrendingUp className="h-6 w-6 text-green-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">
                                        Points Redeemed
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-red-600">
                                        {statistics.total_points_redeemed.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded-full bg-red-100 p-3">
                                    <Award className="h-6 w-6 text-red-600" />
                                </div>
                            </div>
                        </div>

                        <div className="rounded-lg bg-white p-6 shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">
                                        Total Referrals
                                    </p>
                                    <p className="mt-2 text-3xl font-bold text-purple-600">
                                        {statistics.total_referrals.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded-full bg-purple-100 p-3">
                                    <Gift className="h-6 w-6 text-purple-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tier Distribution */}
                    <div className="rounded-lg bg-white p-6 shadow">
                        <h3 className="mb-4 text-lg font-semibold text-slate-800">
                            Tier Distribution
                        </h3>
                        <div className="grid gap-4 md:grid-cols-4">
                            {Object.entries(statistics.tiers).map(([tier, count]) => (
                                <div key={tier} className="text-center">
                                    <TierBadge tier={tier} size="lg" className="mb-2" />
                                    <p className="text-2xl font-bold text-slate-800">{count}</p>
                                    <p className="text-sm text-slate-600">users</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="rounded-lg bg-white p-4 shadow">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    <button
                                        onClick={handleSearch}
                                        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                                    >
                                        <Search className="h-5 w-5" />
                                        Search
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Filter className="h-5 w-5 text-slate-600" />
                                <span className="text-sm font-medium text-slate-700">Tier:</span>
                                {['', 'Bronze', 'Silver', 'Gold', 'Platinum'].map((tier) => (
                                    <button
                                        key={tier}
                                        onClick={() => handleTierFilter(tier)}
                                        className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                                            selectedTier === tier
                                                ? 'bg-indigo-600 text-white'
                                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                        }`}
                                    >
                                        {tier || 'All'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                            Tier
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                            Available Points
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                            Lifetime Points
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                            Total Spent
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                            Referrals
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-700">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {users.data.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="transition hover:bg-slate-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-slate-900">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-sm text-slate-500">
                                                        {user.email}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <TierBadge tier={user.tier} />
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                                                {user.total_points.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">
                                                {user.lifetime_points.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">
                                                Rp {user.total_spent.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">
                                                {user.referrals_count}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => openAdjustModal(user)}
                                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                                                >
                                                    Adjust Points
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {users.links.length > 3 && (
                            <div className="border-t border-slate-200 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-700">
                                        Showing {users.from} to {users.to} of {users.total} users
                                    </p>
                                    <div className="flex gap-2">
                                        {users.links.map((link, index) => (
                                            <button
                                                key={index}
                                                onClick={() =>
                                                    link.url && router.visit(link.url)
                                                }
                                                disabled={!link.url}
                                                className={`px-3 py-1 rounded ${
                                                    link.active
                                                        ? 'bg-indigo-600 text-white'
                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                } ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Adjust Points Modal */}
            <Modal show={showAdjustModal} onClose={closeAdjustModal}>
                <form onSubmit={handleAdjustPoints} className="p-6">
                    <h2 className="text-lg font-semibold text-slate-900">
                        Adjust Points for {selectedUser?.name}
                    </h2>

                    <div className="mt-6 space-y-4">
                        <div>
                            <InputLabel htmlFor="type" value="Action" />
                            <select
                                id="type"
                                value={data.type}
                                onChange={(e) => setData('type', e.target.value)}
                                className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="add">Add Points</option>
                                <option value="deduct">Deduct Points</option>
                            </select>
                            <InputError message={errors.type} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="points" value="Points" />
                            <TextInput
                                id="points"
                                type="number"
                                value={data.points}
                                onChange={(e) => setData('points', e.target.value)}
                                className="mt-1 block w-full"
                                min="1"
                                required
                            />
                            <InputError message={errors.points} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="reason" value="Reason" />
                            <TextInput
                                id="reason"
                                type="text"
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                                className="mt-1 block w-full"
                                required
                            />
                            <InputError message={errors.reason} className="mt-2" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <SecondaryButton onClick={closeAdjustModal}>Cancel</SecondaryButton>
                        <PrimaryButton disabled={processing}>
                            {processing ? 'Processing...' : 'Adjust Points'}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </AuthenticatedLayout>
    );
}
