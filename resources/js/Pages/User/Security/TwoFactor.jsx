import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

export default function TwoFactor({ two_factor_enabled }) {
    const [verificationCode, setVerificationCode] = useState('');
    const [showVerify, setShowVerify] = useState(false);

    const enableForm = useForm({});
    const disableForm = useForm({
        password: '',
    });
    const sendCodeForm = useForm({});
    const verifyForm = useForm({
        code: '',
    });

    const handleEnable = (e) => {
        e.preventDefault();
        enableForm.post(route('user.security.2fa.enable'), {
            onSuccess: () => {
                setShowVerify(true);
                sendCodeForm.post(route('user.security.2fa.send-code'));
            },
        });
    };

    const handleDisable = (e) => {
        e.preventDefault();
        disableForm.post(route('user.security.2fa.disable'), {
            onSuccess: () => {
                disableForm.reset();
            },
        });
    };

    const handleSendCode = () => {
        sendCodeForm.post(route('user.security.2fa.send-code'));
    };

    const handleVerify = (e) => {
        e.preventDefault();
        verifyForm.post(route('user.security.2fa.verify'), {
            onSuccess: () => {
                setShowVerify(false);
                verifyForm.reset();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    Two-Factor Authentication
                </h2>
            }
        >
            <Head title="Two-Factor Authentication" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Two-Factor Authentication (2FA)
                            </h3>
                            <p className="text-sm text-gray-600">
                                Add an extra layer of security to your account by enabling two-factor authentication.
                                You'll receive a verification code via email each time you log in.
                            </p>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <p className="font-medium">Status</p>
                                    <p className="text-sm text-gray-600">
                                        {two_factor_enabled ? (
                                            <span className="text-green-600 font-semibold">Enabled</span>
                                        ) : (
                                            <span className="text-red-600 font-semibold">Disabled</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {!two_factor_enabled ? (
                            <form onSubmit={handleEnable}>
                                <button
                                    type="submit"
                                    disabled={enableForm.processing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
                                >
                                    {enableForm.processing ? 'Enabling...' : 'Enable 2FA'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleDisable} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password to Disable
                                    </label>
                                    <input
                                        type="password"
                                        value={disableForm.data.password}
                                        onChange={(e) => disableForm.setData('password', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                    {disableForm.errors.password && (
                                        <p className="text-red-600 text-sm mt-1">{disableForm.errors.password}</p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={disableForm.processing}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
                                >
                                    {disableForm.processing ? 'Disabling...' : 'Disable 2FA'}
                                </button>
                            </form>
                        )}

                        {showVerify && (
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <h4 className="font-medium text-blue-900 mb-2">Verify Your Email</h4>
                                <p className="text-sm text-blue-700 mb-4">
                                    A verification code has been sent to your email. Please enter it below to complete setup.
                                </p>
                                <form onSubmit={handleVerify} className="space-y-4">
                                    <div>
                                        <input
                                            type="text"
                                            value={verifyForm.data.code}
                                            onChange={(e) => verifyForm.setData('code', e.target.value)}
                                            placeholder="Enter 6-digit code"
                                            maxLength="6"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                            required
                                        />
                                        {verifyForm.errors.code && (
                                            <p className="text-red-600 text-sm mt-1">{verifyForm.errors.code}</p>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={verifyForm.processing}
                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
                                        >
                                            {verifyForm.processing ? 'Verifying...' : 'Verify'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSendCode}
                                            disabled={sendCodeForm.processing}
                                            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
                                        >
                                            {sendCodeForm.processing ? 'Sending...' : 'Resend Code'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
