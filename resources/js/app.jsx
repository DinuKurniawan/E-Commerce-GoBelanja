import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Component } from 'react';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
let inertiaRoot = null;

class AppErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        console.error('App render error:', error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
                    <div className="w-full max-w-lg rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
                        <h1 className="text-xl font-bold text-slate-900">
                            Terjadi error pada halaman
                        </h1>
                        <p className="mt-2 text-sm text-slate-600">
                            Silakan refresh halaman. Jika masih terjadi, hubungi admin.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        if (!inertiaRoot) {
            inertiaRoot = createRoot(el);
        }

        // Make auth available globally for localStorage sync
        window.auth = props.initialPage.props.auth;

        inertiaRoot.render(
            <AppErrorBoundary>
                <App {...props} />
            </AppErrorBoundary>,
        );
    },
    progress: {
        color: '#4B5563',
    },
});
