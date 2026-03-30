import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-950">
            <div className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 lg:grid-cols-2">
                <div className="hidden flex-col justify-between p-10 lg:flex">
                    <Link href="/" className="inline-flex items-center gap-3">
                        <ApplicationLogo className="h-10 w-10 fill-current text-indigo-400" />
                        <span className="text-lg font-bold text-white">GoBelanja</span>
                    </Link>
                    <div>
                        <h1 className="text-4xl font-bold leading-tight text-white">
                            Belanja modern, cepat, dan profesional.
                        </h1>
                        <p className="mt-4 text-slate-300">
                            Masuk atau daftar untuk menikmati pengalaman belanja terbaik di GoBelanja.
                        </p>
                    </div>
                    <p className="text-sm text-slate-400">
                        © {new Date().getFullYear()} GoBelanja
                    </p>
                </div>

                <div className="flex items-center justify-center px-4 py-10 sm:px-6">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-white p-7 shadow-2xl">
                        <div className="mb-6 flex items-center gap-3 lg:hidden">
                            <Link href="/">
                                <ApplicationLogo className="h-9 w-9 fill-current text-indigo-600" />
                            </Link>
                            <span className="text-lg font-bold text-slate-900">GoBelanja</span>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
