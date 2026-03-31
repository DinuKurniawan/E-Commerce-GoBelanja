import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useState } from 'react';

export default function ActivityLogsIndex({ logs, users, actions, filters }) {
    const [filterData, setFilterData] = useState({
        user_id: filters.user_id || '',
        action: filters.action || '',
        ip_address: filters.ip_address || '',
        date_from: filters.date_from || '',
        date_to: filters.date_to || '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.activity-logs.index'), filterData, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        const emptyFilters = {
            user_id: '',
            action: '',
            ip_address: '',
            date_from: '',
            date_to: '',
        };
        setFilterData(emptyFilters);
        router.get(route('admin.activity-logs.index'), emptyFilters);
    };

    const handleExport = () => {
        router.post(route('admin.activity-logs.export'), filterData);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">Activity Logs</h2>
                    <button
                        onClick={handleExport}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Export to CSV
                    </button>
                </div>
            }
        >
            <Head title="Activity Logs" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    {/* Filters */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
                        <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
                                <select
                                    value={filterData.user_id}
                                    onChange={(e) => setFilterData({ ...filterData, user_id: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">All Users</option>
                                    {users.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
                                <select
                                    value={filterData.action}
                                    onChange={(e) => setFilterData({ ...filterData, action: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">All Actions</option>
                                    {actions.map((action) => (
                                        <option key={action} value={action}>
                                            {action}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">IP Address</label>
                                <input
                                    type="text"
                                    value={filterData.ip_address}
                                    onChange={(e) => setFilterData({ ...filterData, ip_address: e.target.value })}
                                    placeholder="Search by IP..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date From</label>
                                <input
                                    type="date"
                                    value={filterData.date_from}
                                    onChange={(e) => setFilterData({ ...filterData, date_from: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date To</label>
                                <input
                                    type="date"
                                    value={filterData.date_to}
                                    onChange={(e) => setFilterData({ ...filterData, date_to: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                />
                            </div>

                            <div className="flex items-end gap-2">
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
                                >
                                    Apply Filters
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded"
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Activity Logs Table */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Activity Logs</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Action
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Model
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            IP Address
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                            Date/Time
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {logs.data.length > 0 ? (
                                        logs.data.map((log) => (
                                            <tr key={log.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    #{log.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    {log.user ? (
                                                        <div>
                                                            <div className="text-gray-900 font-medium">{log.user.name}</div>
                                                            <div className="text-gray-500 text-xs">{log.user.email}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span
                                                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                            log.action === 'login' || log.action === 'login_with_2fa'
                                                                ? 'bg-green-100 text-green-800'
                                                                : log.action === 'logout'
                                                                ? 'bg-gray-100 text-gray-800'
                                                                : log.action === 'delete'
                                                                ? 'bg-red-100 text-red-800'
                                                                : log.action === 'create'
                                                                ? 'bg-blue-100 text-blue-800'
                                                                : log.action === 'update'
                                                                ? 'bg-yellow-100 text-yellow-800'
                                                                : 'bg-purple-100 text-purple-800'
                                                        }`}
                                                    >
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {log.model_type ? (
                                                        <div>
                                                            <div className="text-gray-900">{log.model_type.split('\\').pop()}</div>
                                                            <div className="text-gray-500 text-xs">ID: {log.model_id}</div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {log.ip_address || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(log.created_at).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                                No activity logs found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {logs.links && logs.links.length > 3 && (
                            <div className="mt-4 flex justify-center gap-2">
                                {logs.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 border rounded ${
                                            link.active
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
