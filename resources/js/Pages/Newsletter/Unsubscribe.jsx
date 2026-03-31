import React, { useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';
import { useForm } from '@inertiajs/react';

export default function Unsubscribe({ email, token }) {
    const [reason, setReason] = useState('');
    const { post, processing } = useForm();

    const handleUnsubscribe = (e) => {
        e.preventDefault();
        post(route('newsletter.unsubscribe', token), {
            data: { reason },
        });
    };

    return (
        <PublicLayout title="Unsubscribe from Newsletter">
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">😢</div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                We're Sorry to See You Go
                            </h2>
                            <p className="text-gray-600">
                                Are you sure you want to unsubscribe from our newsletter?
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-sm text-gray-700">
                                <strong>Email:</strong> {email}
                            </p>
                        </div>

                        <form onSubmit={handleUnsubscribe} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Why are you unsubscribing? (Optional)
                                </label>
                                <select
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Select a reason...</option>
                                    <option value="too_many_emails">Too many emails</option>
                                    <option value="not_relevant">Content not relevant</option>
                                    <option value="never_signed_up">I never signed up</option>
                                    <option value="privacy_concerns">Privacy concerns</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => window.location.href = '/'}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-150"
                                >
                                    Keep Subscription
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition duration-150 disabled:opacity-50"
                                >
                                    Unsubscribe
                                </button>
                            </div>
                        </form>

                        <div className="mt-6 text-center">
                            <a
                                href={route('newsletter.preferences', token)}
                                className="text-sm text-purple-600 hover:text-purple-800"
                            >
                                Or manage your email preferences instead
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
