import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useForm } from '@inertiajs/react';

export default function Preferences({ subscriber, token }) {
    const { data, setData, post, processing } = useForm({
        receive_promotions: subscriber.preferences?.receive_promotions ?? true,
        receive_newsletters: subscriber.preferences?.receive_newsletters ?? true,
        receive_product_updates: subscriber.preferences?.receive_product_updates ?? true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('newsletter.preferences', token));
    };

    return (
        <PublicLayout title="Email Preferences">
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="text-center mb-8">
                            <div className="text-5xl mb-4">⚙️</div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Email Preferences
                            </h2>
                            <p className="text-gray-600">
                                Choose which emails you'd like to receive
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-900">{subscriber.name}</p>
                                    <p className="text-sm text-gray-500">{subscriber.email}</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            checked={data.receive_newsletters}
                                            onChange={(e) => setData('receive_newsletters', e.target.checked)}
                                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3">
                                        <label className="font-medium text-gray-900">
                                            📰 Newsletter
                                        </label>
                                        <p className="text-sm text-gray-500">
                                            Stay updated with our latest news, articles, and updates
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            checked={data.receive_promotions}
                                            onChange={(e) => setData('receive_promotions', e.target.checked)}
                                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3">
                                        <label className="font-medium text-gray-900">
                                            🎁 Promotions & Special Offers
                                        </label>
                                        <p className="text-sm text-gray-500">
                                            Get exclusive discounts, deals, and promotional offers
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            type="checkbox"
                                            checked={data.receive_product_updates}
                                            onChange={(e) => setData('receive_product_updates', e.target.checked)}
                                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3">
                                        <label className="font-medium text-gray-900">
                                            🛍️ New Products & Recommendations
                                        </label>
                                        <p className="text-sm text-gray-500">
                                            Be the first to know about new arrivals and personalized recommendations
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition duration-150 disabled:opacity-50"
                                >
                                    Save Preferences
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <a
                                href={route('newsletter.unsubscribe', token)}
                                className="text-sm text-gray-500 hover:text-gray-700"
                            >
                                Or unsubscribe from all emails
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
