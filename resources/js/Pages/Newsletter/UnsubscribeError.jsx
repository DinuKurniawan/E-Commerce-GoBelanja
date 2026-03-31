import React from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head } from '@inertiajs/react';

export default function UnsubscribeError() {
    return (
        <GuestLayout>
            <Head title="Invalid Link" />

            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Invalid Unsubscribe Link
                        </h2>
                        <p className="text-gray-600 mb-6">
                            This unsubscribe link is invalid or has expired. Please check your email for the correct link or contact support.
                        </p>

                        <a
                            href="/"
                            className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition duration-150"
                        >
                            Return to Homepage
                        </a>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
