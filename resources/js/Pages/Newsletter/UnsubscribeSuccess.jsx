import React from 'react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function UnsubscribeSuccess({ email }) {
    return (
        <PublicLayout title="Unsubscribed Successfully">
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            You've Been Unsubscribed
                        </h2>
                        <p className="text-gray-600 mb-6">
                            We've removed <strong>{email}</strong> from our newsletter list.
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-sm text-blue-800">
                                You won't receive any more marketing emails from us, but you may still
                                receive important transactional emails related to your orders.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <a
                                href="/"
                                className="block w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition duration-150"
                            >
                                Return to Homepage
                            </a>
                            
                            <p className="text-sm text-gray-500">
                                Changed your mind?{' '}
                                <a href="/" className="text-purple-600 hover:text-purple-800">
                                    Subscribe again
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
