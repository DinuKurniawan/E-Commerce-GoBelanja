import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import useTranslation from '@/Hooks/useTranslation';
import LanguageSwitcher from '@/Components/LanguageSwitcher';

export default function TranslationDemo({ auth }) {
    const { t, locale, formatCurrency, formatDate, isLocale } = useTranslation();

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {t('general.language')} Demo
                    </h2>
                </div>
            }
        >
            <Head title="Translation Demo" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 px-4 sm:px-6 lg:px-8">
                    {/* Language Switcher Example */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            Language Switcher Component
                        </h3>
                        <LanguageSwitcher />
                        <p className="mt-4 text-sm text-slate-600">
                            Current Locale: <span className="font-semibold">{locale}</span>
                        </p>
                    </div>

                    {/* General Translations */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            {t('general.navigation')} - General Translations
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="rounded-lg bg-slate-50 p-3">
                                <p className="text-xs text-slate-600">Home:</p>
                                <p className="font-semibold">{t('general.home')}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3">
                                <p className="text-xs text-slate-600">Products:</p>
                                <p className="font-semibold">{t('general.products')}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3">
                                <p className="text-xs text-slate-600">Cart:</p>
                                <p className="font-semibold">{t('general.cart')}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3">
                                <p className="text-xs text-slate-600">Checkout:</p>
                                <p className="font-semibold">{t('general.checkout')}</p>
                            </div>
                        </div>
                    </div>

                    {/* Product Translations */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            Product Translations
                        </h3>
                        <div className="space-y-3">
                            <button className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700">
                                {t('products.add_to_cart')}
                            </button>
                            <button className="w-full rounded-lg bg-slate-900 px-4 py-2 text-white font-semibold hover:bg-slate-800">
                                {t('products.buy_now')}
                            </button>
                            <button className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-700 font-semibold hover:bg-slate-50">
                                {t('products.add_to_wishlist')}
                            </button>
                        </div>
                    </div>

                    {/* Cart & Checkout Translations */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            {t('cart.checkout')} Translations
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600">{t('cart.subtotal')}:</span>
                                <span className="font-semibold">{formatCurrency(150000)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">{t('cart.shipping_fee')}:</span>
                                <span className="font-semibold">{formatCurrency(15000)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">{t('cart.discount')}:</span>
                                <span className="font-semibold text-rose-600">-{formatCurrency(10000)}</span>
                            </div>
                            <div className="flex justify-between border-t border-slate-200 pt-2">
                                <span className="font-bold">{t('cart.total')}:</span>
                                <span className="font-bold text-lg">{formatCurrency(155000)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Order Status Translations */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            Order Status Translations
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'].map(status => (
                                <div key={status} className="rounded-lg border border-slate-200 p-3">
                                    <p className="text-xs text-slate-600 capitalize">{status}:</p>
                                    <p className="font-semibold">{t(`orders.status.${status}`)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Date Formatting */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            Date & Currency Formatting
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-slate-600">Today's Date:</p>
                                <p className="font-semibold">{formatDate(new Date())}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Sample Price:</p>
                                <p className="font-semibold">{formatCurrency(1250000)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Parameters Example */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            Translation with Parameters
                        </h3>
                        <div className="space-y-2">
                            <p>{t('general.days_ago', { count: 5 })}</p>
                            <p>{t('general.hours_ago', { count: 3 })}</p>
                            <p>{t('general.minutes_ago', { count: 15 })}</p>
                            <p>{t('products.stock_available', { count: 25 })}</p>
                            <p>{t('products.only_left', { count: 3 })}</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            Success & Error Messages
                        </h3>
                        <div className="space-y-3">
                            <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                                <p className="text-sm text-green-900">✓ {t('products.added_to_cart')}</p>
                            </div>
                            <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
                                <p className="text-sm text-blue-900">ℹ {t('orders.order_placed_success')}</p>
                            </div>
                            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                                <p className="text-sm text-yellow-900">⚠ {t('products.low_stock')}</p>
                            </div>
                            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3">
                                <p className="text-sm text-rose-900">✗ {t('products.out_of_stock')}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
