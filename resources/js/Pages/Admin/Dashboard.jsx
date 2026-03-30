import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler,
);

const formatCurrency = (v) => `Rp${Number(v).toLocaleString('id-ID')}`;
const shortCurrency = (v) => {
    const n = Number(v);
    if (n >= 1_000_000) return `Rp${(n / 1_000_000).toFixed(1)}jt`;
    if (n >= 1_000) return `Rp${(n / 1_000).toFixed(0)}rb`;
    return `Rp${n}`;
};

/**
 * Segment colour: green if the next point is higher, red if lower, amber if equal.
 */
function segmentColor(ctx, key) {
    const p0 = ctx.p0.parsed.y;
    const p1 = ctx.p1.parsed.y;
    if (p1 > p0) return key === 'borderColor' ? '#10b981' : 'rgba(16,185,129,0.15)';
    if (p1 < p0) return key === 'borderColor' ? '#ef4444' : 'rgba(239,68,68,0.15)';
    return key === 'borderColor' ? '#6366f1' : 'rgba(99,102,241,0.15)';
}

export default function AdminDashboard({ overview, dailyChart, salesChart, topProducts }) {
    const daily     = dailyChart ?? [];
    const monthly   = salesChart ?? [];
    const topList   = topProducts ?? [];

    /* ── Line chart data ── */
    const labels   = daily.map((d) => d.label);
    const revenues = daily.map((d) => d.total);
    const orders   = daily.map((d) => d.orders);

    const lineData = {
        labels,
        datasets: [
            {
                label: 'Pendapatan (Rp)',
                data: revenues,
                yAxisID: 'y',
                tension: 0.45,
                borderWidth: 2.5,
                pointRadius: (ctx) => (revenues[ctx.dataIndex] > 0 ? 4 : 0),
                pointHoverRadius: 6,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 2,
                fill: true,
                /* Per-segment colour: green ↑ / red ↓ / indigo → */
                segment: {
                    borderColor: (ctx) => segmentColor(ctx, 'borderColor'),
                    backgroundColor: (ctx) => segmentColor(ctx, 'backgroundColor'),
                    borderDash: (ctx) =>
                        ctx.p1.parsed.y < ctx.p0.parsed.y ? [5, 3] : undefined,
                },
                pointBorderColor: (ctx) => {
                    if (!revenues[ctx.dataIndex]) return 'transparent';
                    const next = revenues[ctx.dataIndex + 1];
                    const prev = revenues[ctx.dataIndex - 1];
                    if (next !== undefined && next > revenues[ctx.dataIndex]) return '#10b981';
                    if (prev !== undefined && prev > revenues[ctx.dataIndex]) return '#ef4444';
                    return '#6366f1';
                },
            },
            {
                label: 'Jumlah Order',
                data: orders,
                yAxisID: 'y2',
                tension: 0.45,
                borderWidth: 1.5,
                borderDash: [4, 3],
                pointRadius: 0,
                pointHoverRadius: 4,
                fill: false,
                borderColor: 'rgba(148,163,184,0.7)',
                backgroundColor: 'transparent',
            },
        ],
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    boxWidth: 12,
                    padding: 16,
                    color: '#475569',
                    font: { size: 12 },
                    usePointStyle: true,
                    generateLabels: (chart) =>
                        chart.data.datasets.map((ds, i) => ({
                            text: ds.label,
                            datasetIndex: i,
                            fillStyle: i === 0 ? '#6366f1' : 'rgba(148,163,184,0.7)',
                            strokeStyle: i === 0 ? '#6366f1' : 'rgba(148,163,184,0.7)',
                            lineWidth: ds.borderWidth,
                            lineDash: ds.borderDash ?? [],
                            pointStyle: 'circle',
                            hidden: false,
                        })),
                },
            },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#f8fafc',
                bodyColor: '#cbd5e1',
                padding: 12,
                cornerRadius: 8,
                callbacks: {
                    label: (ctx) =>
                        ctx.datasetIndex === 0
                            ? ` ${formatCurrency(ctx.parsed.y)}`
                            : ` ${ctx.parsed.y} order`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 10 },
                    maxRotation: 45,
                    maxTicksLimit: 10,
                },
            },
            y: {
                position: 'left',
                grid: { color: 'rgba(226,232,240,0.6)' },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 10 },
                    callback: shortCurrency,
                },
            },
            y2: {
                position: 'right',
                grid: { drawOnChartArea: false },
                ticks: {
                    color: '#94a3b8',
                    font: { size: 10 },
                    stepSize: 1,
                },
            },
        },
    };

    /* ── Stat cards config ── */
    const stats = [
        { label: 'Total Penjualan', value: formatCurrency(overview.totalSales), icon: '💰', color: 'indigo' },
        { label: 'Total Order', value: overview.totalOrders, icon: '📦', color: 'violet' },
        { label: 'Pending', value: overview.pendingOrders, icon: '⏳', color: 'amber' },
        { label: 'Users', value: overview.totalUsers, icon: '👥', color: 'emerald' },
        { label: 'Produk', value: overview.totalProducts, icon: '🛍️', color: 'rose' },
        { label: 'Terjual', value: overview.productsSold, icon: '✅', color: 'sky' },
    ];

    const colorMap = {
        indigo: 'from-indigo-500 to-indigo-600',
        violet: 'from-violet-500 to-violet-600',
        amber:  'from-amber-400 to-amber-500',
        emerald:'from-emerald-500 to-emerald-600',
        rose:   'from-rose-500 to-rose-600',
        sky:    'from-sky-500 to-sky-600',
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-slate-800">
                    Dashboard Admin
                </h2>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="py-10">
                <div className="space-y-6 px-4 sm:px-6 lg:px-8">

                    {/* ── Stat Cards ── */}
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                        {stats.map((s) => (
                            <div
                                key={s.label}
                                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colorMap[s.color]} p-4 text-white shadow-sm`}
                            >
                                <p className="text-2xl">{s.icon}</p>
                                <p className="mt-2 text-xl font-bold leading-tight">{s.value}</p>
                                <p className="text-xs font-medium opacity-80">{s.label}</p>
                                <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-white/10" />
                            </div>
                        ))}
                    </div>

                    {/* ── Line Chart ── */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h3 className="text-base font-semibold text-slate-900">
                                    Pendapatan Harian — 30 Hari Terakhir
                                </h3>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Garis hijau = tren naik &nbsp;·&nbsp; merah = turun &nbsp;·&nbsp; indigo = stabil &nbsp;·&nbsp; putus-putus = penurunan
                                </p>
                            </div>
                            {/* Legend badges */}
                            <div className="flex gap-2 text-xs font-medium">
                                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                                    <span className="h-1.5 w-5 rounded-full bg-emerald-500 inline-block" /> Naik
                                </span>
                                <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-rose-700">
                                    <span className="h-1.5 w-5 rounded-full bg-rose-500 inline-block" /> Turun
                                </span>
                                <span className="flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700">
                                    <span className="h-1.5 w-5 rounded-full bg-indigo-500 inline-block" /> Stabil
                                </span>
                            </div>
                        </div>

                        <div className="relative mt-4 h-72">
                            {daily.every((d) => d.total === 0) ? (
                                <div className="flex h-full items-center justify-center">
                                    <div className="text-center">
                                        <p className="text-4xl">📊</p>
                                        <p className="mt-2 text-sm text-slate-500">Belum ada data penjualan.</p>
                                        <p className="text-xs text-slate-400">Data akan muncul setelah ada order masuk.</p>
                                    </div>
                                </div>
                            ) : (
                                <Line data={lineData} options={lineOptions} />
                            )}
                        </div>
                    </div>

                    {/* ── Monthly Summary + Top Products ── */}
                    <div className="grid gap-6 lg:grid-cols-2">

                        {/* Monthly bar-style summary */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-base font-semibold text-slate-900">
                                Rekap Bulanan
                            </h3>
                            <div className="space-y-2">
                                {monthly.length > 0 ? monthly.map((item) => {
                                    const maxTotal = Math.max(...monthly.map((m) => m.total), 1);
                                    const pct = Math.round((item.total / maxTotal) * 100);
                                    return (
                                        <div key={item.period}>
                                            <div className="mb-0.5 flex justify-between text-xs text-slate-600">
                                                <span className="font-medium">{item.period}</span>
                                                <span>{formatCurrency(item.total)} · {item.orders} order</span>
                                            </div>
                                            <div className="h-2 w-full rounded-full bg-slate-100">
                                                <div
                                                    className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <p className="text-sm text-slate-400">Belum ada data bulan ini.</p>
                                )}
                            </div>
                        </div>

                        {/* Top Products */}
                        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-base font-semibold text-slate-900">
                                Top 5 Produk Terlaris
                            </h3>
                            <div className="space-y-3">
                                {topList.length > 0 ? topList.map((item, i) => (
                                    <div key={item.product_id} className="flex items-center gap-3">
                                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                                            {i + 1}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-sm font-medium text-slate-800">
                                                {item.product?.emoji} {item.product?.name ?? `Produk #${item.product_id}`}
                                            </p>
                                            <p className="text-xs text-slate-500">{item.qty} terjual</p>
                                        </div>
                                        <span className="shrink-0 text-sm font-semibold text-indigo-600">
                                            {formatCurrency(item.revenue)}
                                        </span>
                                    </div>
                                )) : (
                                    <p className="text-sm text-slate-400">Belum ada penjualan.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Quick Links ── */}
                    <div className="grid gap-3 md:grid-cols-4">
                        <QuickLink href={route('admin.products.index')} label="📦 Produk" />
                        <QuickLink href={route('admin.orders.index')} label="🧾 Order" />
                        <QuickLink href={route('admin.users.index')} label="👥 Users" />
                        <QuickLink href={route('admin.reports.index')} label="📊 Laporan" />
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function QuickLink({ href, label }) {
    return (
        <Link
            href={href}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition"
        >
            {label}
        </Link>
    );
}
