import { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function MidtransPaymentButton({ order, payment }) {
    const [loading, setLoading] = useState(false);
    const [snapReady, setSnapReady] = useState(false);

    useEffect(() => {
        // Load Midtrans Snap script
        const script = document.createElement('script');
        const isProduction = import.meta.env.VITE_MIDTRANS_PRODUCTION === 'true';
        script.src = isProduction 
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', window.midtransClientKey || '');
        script.onload = () => setSnapReady(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handlePayment = async () => {
        setLoading(true);

        try {
            // Get snap token from backend
            const response = await fetch(route('user.midtrans.create-snap-token', order.id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
            });

            const data = await response.json();

            if (data.error) {
                alert('Error: ' + data.error);
                setLoading(false);
                return;
            }

            // Set client key for snap
            if (data.client_key && !window.midtransClientKey) {
                window.midtransClientKey = data.client_key;
            }

            // Open Midtrans Snap payment popup
            if (window.snap && data.snap_token) {
                window.snap.pay(data.snap_token, {
                    onSuccess: function(result) {
                        console.log('Payment success:', result);
                        // Reload page to show updated payment status
                        router.reload();
                    },
                    onPending: function(result) {
                        console.log('Payment pending:', result);
                        // Reload page to show updated payment status
                        router.reload();
                    },
                    onError: function(result) {
                        console.log('Payment error:', result);
                        alert('Pembayaran gagal, silakan coba lagi.');
                        setLoading(false);
                    },
                    onClose: function() {
                        console.log('Payment popup closed');
                        setLoading(false);
                    }
                });
            } else {
                alert('Midtrans Snap belum siap, silakan coba lagi.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error creating payment:', error);
            alert('Terjadi kesalahan, silakan coba lagi.');
            setLoading(false);
        }
    };

    // Only show button if payment is pending and method is Midtrans
    const isMidtrans = payment?.method?.toLowerCase().includes('midtrans') || 
                       payment?.method?.toLowerCase().includes('online');
    
    if (!isMidtrans || order.payment_status !== 'pending') {
        return null;
    }

    return (
        <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5 shadow-sm">
            <h3 className="font-semibold text-indigo-900">💳 Bayar dengan Midtrans</h3>
            <p className="mt-1 text-sm text-indigo-700">
                Bayar pesanan Anda secara online dengan berbagai metode pembayaran (Transfer Bank, E-Wallet, Kartu Kredit, dll)
            </p>
            <button
                onClick={handlePayment}
                disabled={loading || !snapReady}
                className={`mt-4 w-full rounded-xl px-4 py-3 font-semibold text-white transition
                    ${loading || !snapReady 
                        ? 'bg-slate-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
                    }`}
            >
                {loading ? 'Memproses...' : !snapReady ? 'Memuat...' : '💳 Bayar Sekarang'}
            </button>
        </div>
    );
}
