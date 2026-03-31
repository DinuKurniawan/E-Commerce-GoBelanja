import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function TwoFactorVerify() {
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const { data, setData, post, processing, errors } = useForm({
        code: '',
    });

    const resendForm = useForm({});

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('two-factor.verify.post'));
    };

    const handleResend = () => {
        resendForm.post(route('two-factor.resend'), {
            onSuccess: () => {
                setTimeLeft(600);
            },
        });
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100">
            <Head title="Two-Factor Verification" />

            <div>
                <Link href="/">
                    <h1 className="text-3xl font-bold text-blue-600">GoBelanja</h1>
                </Link>
            </div>

            <div className="w-full sm:max-w-md mt-6 px-6 py-8 bg-white shadow-md overflow-hidden sm:rounded-lg">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Two-Factor Authentication</h2>
                    <p className="text-sm text-gray-600">
                        We've sent a 6-digit verification code to your email.
                    </p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                            Verification Code
                        </label>
                        <input
                            id="code"
                            type="text"
                            name="code"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                            placeholder="000000"
                            maxLength="6"
                            className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                            required
                        />
                        {errors.code && (
                            <p className="mt-2 text-sm text-red-600">{errors.code}</p>
                        )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">
                            Time remaining: <span className="font-semibold">{formatTime(timeLeft)}</span>
                        </span>
                        {timeLeft === 0 && (
                            <span className="text-red-600 font-semibold">Code expired</span>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing || timeLeft === 0}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {processing ? 'Verifying...' : 'Verify'}
                    </button>

                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendForm.processing}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md disabled:opacity-50"
                    >
                        {resendForm.processing ? 'Sending...' : 'Resend Code'}
                    </button>

                    <div className="text-center">
                        <Link
                            href={route('login')}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
