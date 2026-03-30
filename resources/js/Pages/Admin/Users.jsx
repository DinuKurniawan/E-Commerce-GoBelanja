import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, usePage } from '@inertiajs/react';
import useConfirm from '@/Hooks/useConfirm';

export default function Users({ users }) {
    const { flash } = usePage().props;
    const userList = users ?? [];
    const { confirm, ConfirmDialog } = useConfirm();

    const updateRole = async (id, role, currentRole) => {
        if (role === currentRole) return;
        const ok = await confirm(`Role akun akan diubah menjadi "${role}".`, {
            title: 'Ubah Role User',
            confirmLabel: 'Ya, Ubah',
        });
        if (!ok) return;
        router.patch(route('admin.users.update-role', id), { role });
    };

    const toggleActive = async (id, isActive) => {
        const action = isActive ? 'nonaktifkan' : 'aktifkan';
        const ok = await confirm(`Akun ini akan di${action}.`, {
            title:        `${action.charAt(0).toUpperCase() + action.slice(1)} Akun`,
            confirmLabel: `Ya, ${action.charAt(0).toUpperCase() + action.slice(1)}`,
            danger:       isActive,
        });
        if (!ok) return;
        router.patch(route('admin.users.toggle-active', id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold text-slate-800">Manajemen User</h2>}
        >
            <Head title="Manajemen User" />
            {ConfirmDialog}

            <div className="py-10">
                <div className="px-4 sm:px-6 lg:px-8 space-y-4">

                    {flash?.success && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                            {flash.success}
                        </div>
                    )}

                    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Nama</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Email</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Role</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {userList.map((user) => (
                                    <tr key={user.id} className="border-t border-slate-100 hover:bg-slate-50">
                                        <td className="px-4 py-3 font-medium text-slate-900">{user.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{user.email}</td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                                {user.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => updateRole(user.id, 'admin', user.role)}
                                                    disabled={user.role === 'admin'}
                                                    className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    Set Admin
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateRole(user.id, 'user', user.role)}
                                                    disabled={user.role === 'user'}
                                                    className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                                >
                                                    Set User
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => toggleActive(user.id, user.is_active)}
                                                    className={`rounded-md px-2.5 py-1 text-xs font-semibold text-white transition ${user.is_active ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
                                                >
                                                    {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {userList.length === 0 && (
                                    <tr>
                                        <td className="px-4 py-10 text-center text-slate-500" colSpan={5}>
                                            Belum ada data user.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
