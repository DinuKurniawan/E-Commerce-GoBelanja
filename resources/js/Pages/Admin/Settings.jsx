import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function Settings({ setting }) {
    const { flash } = usePage().props;

    const [accounts, setAccounts] = useState(
        setting?.bank_accounts?.length ? setting.bank_accounts : []
    );

    const form = useForm({
        store_name: setting?.store_name ?? 'GoBelanja',
        store_logo: setting?.store_logo ?? '',
        payment_method: setting?.payment_method ?? '',
        bank_accounts: setting?.bank_accounts ?? [],
        api_key: setting?.api_key ?? '',
    });

    const addAccount = () => {
        const next = [...accounts, { bank: '', number: '', holder: '' }];
        setAccounts(next);
        form.setData('bank_accounts', next);
    };

    const updateAccount = (index, field, value) => {
        const next = accounts.map((a, i) => i === index ? { ...a, [field]: value } : a);
        setAccounts(next);
        form.setData('bank_accounts', next);
    };

    const removeAccount = (index) => {
        const next = accounts.filter((_, i) => i !== index);
        setAccounts(next);
        form.setData('bank_accounts', next);
    };

    const submit = (e) => {
        e.preventDefault();
        form.patch(route('admin.settings.update'));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-800">Pengaturan</h2>}
        >
            <Head title="Pengaturan" />

            <div className="py-10">
                <div className="px-4 sm:px-6 lg:px-8">

                    {flash?.success && (
                        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700">
                                Nama Toko *
                            </label>
                            <input
                                value={form.data.store_name}
                                onChange={(e) => form.setData('store_name', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                required
                            />
                            {form.errors.store_name && <p className="mt-1 text-xs text-rose-600">{form.errors.store_name}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700">
                                Logo URL
                            </label>
                            <input
                                value={form.data.store_logo}
                                onChange={(e) => form.setData('store_logo', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                placeholder="https://..."
                            />
                            {form.errors.store_logo && <p className="mt-1 text-xs text-rose-600">{form.errors.store_logo}</p>}
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700">
                                Metode Pembayaran *
                            </label>
                            <input
                                value={form.data.payment_method}
                                onChange={(e) => form.setData('payment_method', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                placeholder="Transfer Bank, E-Wallet, COD"
                                required
                            />
                            <p className="mt-1 text-xs text-slate-500">Pisahkan dengan koma</p>
                            {form.errors.payment_method && <p className="mt-1 text-xs text-rose-600">{form.errors.payment_method}</p>}
                        </div>

                        {/* Rekening Bank */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700">Rekening Bank</label>
                                <button
                                    type="button"
                                    onClick={addAccount}
                                    className="rounded-lg bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
                                >
                                    + Tambah Rekening
                                </button>
                            </div>

                            {accounts.length === 0 && (
                                <p className="text-xs text-slate-400">Belum ada rekening. Klik "+ Tambah Rekening".</p>
                            )}

                            <div className="space-y-3">
                                {accounts.map((acc, i) => (
                                    <div key={i} className="flex gap-2 items-start rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <div className="flex-1 grid grid-cols-3 gap-2">
                                            <div>
                                                <label className="mb-0.5 block text-xs text-slate-500">Nama Bank</label>
                                                <input
                                                    value={acc.bank}
                                                    onChange={(e) => updateAccount(i, 'bank', e.target.value)}
                                                    placeholder="BCA"
                                                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-0.5 block text-xs text-slate-500">No. Rekening</label>
                                                <input
                                                    value={acc.number}
                                                    onChange={(e) => updateAccount(i, 'number', e.target.value)}
                                                    placeholder="1234567890"
                                                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm font-mono"
                                                />
                                            </div>
                                            <div>
                                                <label className="mb-0.5 block text-xs text-slate-500">Atas Nama</label>
                                                <input
                                                    value={acc.holder}
                                                    onChange={(e) => updateAccount(i, 'holder', e.target.value)}
                                                    placeholder="John Doe"
                                                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeAccount(i)}
                                            className="mt-5 rounded-lg bg-rose-50 px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-100"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700">
                                API Key <span className="font-normal text-slate-400">(Opsional)</span>
                            </label>
                            <input
                                type="password"
                                value={form.data.api_key}
                                onChange={(e) => form.setData('api_key', e.target.value)}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                                placeholder="sk-..."
                            />
                            {form.errors.api_key && <p className="mt-1 text-xs text-rose-600">{form.errors.api_key}</p>}
                        </div>

                        <button
                            type="submit"
                            disabled={form.processing}
                            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {form.processing ? 'Menyimpan...' : 'Simpan Pengaturan'}
                        </button>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
