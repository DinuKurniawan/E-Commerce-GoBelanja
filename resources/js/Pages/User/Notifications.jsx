import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';

export default function UserNotifications({ notifications }) {
    const items = notifications ?? [];

    const markRead = (id) => {
        router.patch(route('user.notifications.mark-read', id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-800">Notifikasi</h2>}
        >
            <Head title="Notifikasi" />

            <div className="py-10">
                <div className="space-y-4 px-4 sm:px-6 lg:px-8">
                    {items.map((notification) => (
                        <div
                            key={notification.id}
                            className={`rounded-2xl border p-5 shadow-sm ${notification.is_read ? 'border-slate-200 bg-white' : 'border-indigo-200 bg-indigo-50'}`}
                        >
                            <p className="text-xs uppercase text-slate-500">{notification.type}</p>
                            <p className="mt-1 font-semibold text-slate-900">{notification.title}</p>
                            <p className="mt-2 text-sm text-slate-700">{notification.message}</p>
                            {!notification.is_read && (
                                <button
                                    type="button"
                                    onClick={() => markRead(notification.id)}
                                    className="mt-3 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
                                >
                                    Tandai Dibaca
                                </button>
                            )}
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
                            Belum ada notifikasi.
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
