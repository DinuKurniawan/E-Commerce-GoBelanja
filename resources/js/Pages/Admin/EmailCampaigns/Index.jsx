import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon, 
    PaperAirplaneIcon,
    ChartBarIcon,
    CalendarIcon 
} from '@heroicons/react/24/outline';

export default function Index({ campaigns }) {
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this campaign?')) {
            router.delete(route('admin.email-campaigns.destroy', id));
        }
    };

    const handleSend = (id) => {
        if (confirm('Are you sure you want to send this campaign now?')) {
            router.post(route('admin.email-campaigns.send', id));
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: 'bg-gray-100 text-gray-800',
            scheduled: 'bg-blue-100 text-blue-800',
            sending: 'bg-yellow-100 text-yellow-800',
            sent: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
        };
        return badges[status] || badges.draft;
    };

    const getTypeBadge = (type) => {
        const badges = {
            newsletter: 'bg-purple-100 text-purple-800',
            promotion: 'bg-pink-100 text-pink-800',
            abandoned_cart: 'bg-orange-100 text-orange-800',
            product_recommendation: 'bg-indigo-100 text-indigo-800',
            re_engagement: 'bg-cyan-100 text-cyan-800',
        };
        return badges[type] || badges.newsletter;
    };

    return (
        <AuthenticatedLayout>
            <Head title="Email Campaigns" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Email Campaigns</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Create and manage email marketing campaigns
                            </p>
                        </div>
                        <Link
                            href={route('admin.email-campaigns.create')}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition duration-150"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Create Campaign
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ChartBarIcon className="h-8 w-8 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                                    <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <PaperAirplaneIcon className="h-8 w-8 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Sent</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {campaigns.filter(c => c.status === 'sent').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <CalendarIcon className="h-8 w-8 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Scheduled</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {campaigns.filter(c => c.status === 'scheduled').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-8 w-8 text-yellow-600 text-2xl">📝</div>
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Drafts</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {campaigns.filter(c => c.status === 'draft').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Campaigns Table */}
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Campaign
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Recipients
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Performance
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {campaigns.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                                                No campaigns yet. Create your first campaign to get started!
                                            </td>
                                        </tr>
                                    ) : (
                                        campaigns.map((campaign) => (
                                            <tr key={campaign.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {campaign.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {campaign.subject}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(campaign.type)}`}>
                                                        {campaign.type.replace('_', ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(campaign.status)}`}>
                                                        {campaign.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {campaign.recipients_count.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {campaign.status === 'sent' ? (
                                                        <div className="text-sm">
                                                            <div className="text-gray-900">
                                                                📧 {campaign.opened_count} ({campaign.open_rate}%)
                                                            </div>
                                                            <div className="text-gray-500">
                                                                🖱️ {campaign.clicked_count} ({campaign.click_rate}%)
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {campaign.sent_at || campaign.scheduled_at || campaign.created_at}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-medium space-x-2">
                                                    {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                                                        <>
                                                            <Link
                                                                href={route('admin.email-campaigns.edit', campaign.id)}
                                                                className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                                                            >
                                                                <PencilIcon className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                onClick={() => handleSend(campaign.id)}
                                                                className="text-green-600 hover:text-green-900 inline-flex items-center"
                                                            >
                                                                <PaperAirplaneIcon className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(campaign.id)}
                                                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
