import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        subject: '',
        content: '',
        type: 'newsletter',
        recipient_filter: {},
        scheduled_at: '',
        status: 'draft',
    });

    const [filterOptions, setFilterOptions] = useState({
        purchased_days: '',
        spent_amount: '',
        loyalty_tier: '',
        never_purchased: false,
    });

    const campaignTypes = [
        { value: 'newsletter', label: 'Newsletter', description: 'Send to all subscribers' },
        { value: 'promotion', label: 'Promotion', description: 'Targeted promotional campaign' },
        { value: 'abandoned_cart', label: 'Abandoned Cart', description: 'Remind users about cart items' },
        { value: 'product_recommendation', label: 'Product Recommendation', description: 'Personalized product suggestions' },
        { value: 're_engagement', label: 'Re-engagement', description: 'Win back inactive customers' },
    ];

    const loyaltyTiers = ['Bronze', 'Silver', 'Gold', 'Platinum'];

    const handleSubmit = (e, sendNow = false) => {
        e.preventDefault();
        
        const formData = {
            ...data,
            recipient_filter: data.type === 'promotion' ? filterOptions : {},
            status: sendNow ? 'sending' : data.status,
        };

        if (sendNow) {
            post(route('admin.email-campaigns.store'), {
                data: formData,
                onSuccess: (page) => {
                    if (page.props.campaign) {
                        router.post(route('admin.email-campaigns.send', page.props.campaign.id));
                    }
                },
            });
        } else {
            post(route('admin.email-campaigns.store'), { data: formData });
        }
    };

    const insertVariable = (variable) => {
        const textarea = document.getElementById('content');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = data.content;
        const before = text.substring(0, start);
        const after = text.substring(end);
        setData('content', before + variable + after);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + variable.length, start + variable.length);
        }, 0);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Create Email Campaign" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900">Create Email Campaign</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Design and schedule your email marketing campaign
                        </p>
                    </div>

                    <div className="bg-white shadow rounded-lg">
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 space-y-6">
                                {/* Campaign Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Campaign Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Summer Sale 2026"
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Subject Line */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subject Line
                                    </label>
                                    <input
                                        type="text"
                                        value={data.subject}
                                        onChange={(e) => setData('subject', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Don't miss our summer sale!"
                                        required
                                    />
                                    {errors.subject && (
                                        <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                                    )}
                                </div>

                                {/* Campaign Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Campaign Type
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {campaignTypes.map((type) => (
                                            <div
                                                key={type.value}
                                                onClick={() => setData('type', type.value)}
                                                className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all ${
                                                    data.type === type.value
                                                        ? 'border-purple-500 bg-purple-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            >
                                                <div className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="type"
                                                        value={type.value}
                                                        checked={data.type === type.value}
                                                        onChange={() => setData('type', type.value)}
                                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                                                    />
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {type.label}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {type.description}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recipient Filters (for Promotion type) */}
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
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                    placeholder="30"
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
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                                    placeholder="1000000"
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
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 rounded"
                                                />
                                                <label className="ml-2 text-sm text-gray-700">
                                                    Never purchased before
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Email Content */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Email Content
                                        </label>
                                        <div className="text-xs text-gray-500">
                                            Insert variables: 
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
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm"
                                        placeholder="Enter your email content here... You can use HTML formatting."
                                        required
                                    />
                                    {errors.content && (
                                        <p className="mt-1 text-sm text-red-600">{errors.content}</p>
                                    )}
                                </div>

                                {/* Schedule */}
                                <div className="flex items-center space-x-4">
                                    <div className="flex-1">
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
                            </div>

                            {/* Actions */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center rounded-b-lg">
                                <button
                                    type="button"
                                    onClick={() => router.get(route('admin.email-campaigns.index'))}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150"
                                >
                                    Cancel
                                </button>
                                <div className="space-x-3">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition duration-150 disabled:opacity-50"
                                    >
                                        Save as Draft
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => handleSubmit(e, true)}
                                        disabled={processing}
                                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition duration-150 disabled:opacity-50"
                                    >
                                        Send Now
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
