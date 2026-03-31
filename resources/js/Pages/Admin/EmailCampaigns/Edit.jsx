import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Edit({ campaign }) {
    const { data, setData, put, processing, errors } = useForm({
        name: campaign.name,
        subject: campaign.subject,
        content: campaign.content,
        type: campaign.type,
        recipient_filter: campaign.recipient_filter || {},
        scheduled_at: campaign.scheduled_at || '',
        status: campaign.status,
    });

    const [filterOptions, setFilterOptions] = useState(
        campaign.recipient_filter || {
            purchased_days: '',
            spent_amount: '',
            loyalty_tier: '',
            never_purchased: false,
        }
    );

    const campaignTypes = [
        { value: 'newsletter', label: 'Newsletter' },
        { value: 'promotion', label: 'Promotion' },
        { value: 'abandoned_cart', label: 'Abandoned Cart' },
        { value: 'product_recommendation', label: 'Product Recommendation' },
        { value: 're_engagement', label: 'Re-engagement' },
    ];

    const loyaltyTiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const formData = {
            ...data,
            recipient_filter: data.type === 'promotion' ? filterOptions : {},
        };

        put(route('admin.email-campaigns.update', campaign.id), { data: formData });
    };

    const insertVariable = (variable) => {
        const textarea = document.getElementById('content');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = data.content;
        const before = text.substring(0, start);
        const after = text.substring(end);
        setData('content', before + variable + after);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Edit Email Campaign" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Edit Email Campaign</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Update your email marketing campaign
                        </p>
                    </div>

                    <div className="bg-white shadow rounded-lg">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Campaign Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject Line
                                    </label>
                                    <input
                                        type="text"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Campaign Type
                                    </label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    >
                                        {campaignTypes.map((type) => (
                                            <option key={type.value} value={type.value}>
                                                {type.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {data.type === 'promotion' && (
                                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                        <h3 className="text-sm font-medium text-gray-900">
                                            Recipient Filters
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-gray-700 mb-1">
                                                    Purchased in last (days)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={filterOptions.purchased_days}
                                                    onChange={(e) => setFilterOptions({
                                                        ...filterOptions,
                                                        purchased_days: e.target.value
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-700 mb-1">
                                                    Spent more than (Rp)
                                                </label>
                                                <input
                                                    type="number"
                                                    value={filterOptions.spent_amount}
                                                    onChange={(e) => setFilterOptions({
                                                        ...filterOptions,
                                                        spent_amount: e.target.value
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-700 mb-1">
                                                    Loyalty Tier
                                                </label>
                                                <select
                                                    value={filterOptions.loyalty_tier}
                                                    onChange={(e) => setFilterOptions({
                                                        ...filterOptions,
                                                        loyalty_tier: e.target.value
                                                    })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                >
                                                    <option value="">All Tiers</option>
                                                    {loyaltyTiers.map(tier => (
                                                        <option key={tier} value={tier}>{tier}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={filterOptions.never_purchased}
                                                    onChange={(e) => setFilterOptions({
                                                        ...filterOptions,
                                                        never_purchased: e.target.checked
                                                    })}
                                                    className="h-4 w-4 text-purple-600 rounded"
                                                />
                                                <label className="ml-2 text-sm text-gray-700">
                                                    Never purchased before
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Email Content
                                        </label>
                                        <div className="text-xs text-gray-500">
                                            Insert: 
                                            {['{name}', '{email}', '{loyalty_tier}', '{points}'].map(v => (
                                                <button
                                                    key={v}
                                                    type="button"
                                                    onClick={() => insertVariable(v)}
                                                    className="ml-2 text-purple-600 hover:text-purple-800"
                                                >
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <textarea
                                        id="content"
                                        value={data.content}
                                        onChange={(e) => setData('content', e.target.value)}
                                        rows="10"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Schedule (Optional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={data.scheduled_at}
                                        onChange={(e) => {
                                            setData('scheduled_at', e.target.value);
                                            if (e.target.value) {
                                                setData('status', 'scheduled');
                                            }
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    />
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center rounded-b-lg">
                                <button
                                    type="button"
                                    onClick={() => router.get(route('admin.email-campaigns.index'))}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg disabled:opacity-50"
                                >
                                    Update Campaign
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
