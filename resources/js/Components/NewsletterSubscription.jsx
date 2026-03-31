import React, { useState } from 'react';
import axios from 'axios';

export default function NewsletterSubscription() {
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');

        try {
            const response = await axios.post(route('newsletter.subscribe'), {
                email,
                name,
            });

            setMessage(response.data.message);
            setEmail('');
            setName('');
            
            setTimeout(() => setMessage(''), 5000);
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.errors?.email) {
                setError(err.response.data.errors.email[0]);
            } else {
                setError('Failed to subscribe. Please try again.');
            }
            
            setTimeout(() => setError(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-4">
                    <h3 className="text-2xl font-bold text-white mb-2">
                        📬 Subscribe to Our Newsletter
                    </h3>
                    <p className="text-purple-100">
                        Get exclusive deals, new arrivals, and special offers delivered to your inbox!
                    </p>
                </div>

                {message && (
                    <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg text-center">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name (optional)"
                        className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white"
                    />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        required
                        className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Subscribing...' : 'Subscribe'}
                    </button>
                </form>

                <p className="text-xs text-purple-100 text-center mt-3">
                    By subscribing, you agree to receive marketing emails. You can unsubscribe at any time.
                </p>
            </div>
        </div>
    );
}
