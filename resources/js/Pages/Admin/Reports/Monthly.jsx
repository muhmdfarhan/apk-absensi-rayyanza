import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Calendar,
    Filter,
    FileSpreadsheet,
    FileDown,
    Search,
    TrendingUp,
    Users,
    Clock,
    AlertTriangle,
    Award,
    CheckCircle2,
    XCircle,
    Building2
} from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend
} from 'recharts';

export default function Monthly({ report, employees, months, years, filters }) {
    const [year, setYear] = useState(filters.year || new Date().getFullYear());
    const [month, setMonth] = useState(filters.month || new Date().getMonth() + 1);
    const [employeeId, setEmployeeId] = useState(filters.employee_id || '');
    const [search, setSearch] = useState(filters.search || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.reports.monthly'), {
            year,
            month,
            employee_id: employeeId || undefined,
            search: search || undefined,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setYear(new Date().getFullYear());
        setMonth(new Date().getMonth() + 1);
        setEmployeeId('');
        setSearch('');
        router.get(route('admin.reports.monthly'), {});
    };

    const summary = report.summary || {};
    const employeeRecaps = report.employee_recaps || [];
    const weeklyTrends = report.weekly_trends || [];

    // Export URLs with active query params
    const exportParams = new URLSearchParams({
        year,
        month,
        ...(employeeId && { employee_id: employeeId }),
        ...(search && { search }),
    }).toString();

    const excelUrl = route().has('admin.reports.monthly.excel')
        ? `${route('admin.reports.monthly.excel')}?${exportParams}`
        : `${route('admin.reports.monthly.export.excel')}?${exportParams}`;

    const pdfUrl = route().has('admin.reports.monthly.pdf')
        ? `${route('admin.reports.monthly.pdf')}?${exportParams}`
        : `${route('admin.reports.monthly.export.pdf')}?${exportParams}`;

    return (
        <AppLayout
            title="Laporan Bulanan"
            headerTitle="Laporan Evaluasi Bulanan & Rekap Disiplin"
            headerSubtitle={`Periode: ${report.month_name} ${report.year}`}
            actions={
                <div className="flex items-center gap-2">
                    <a
                        href={excelUrl}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
                    >
                        <FileSpreadsheet className="w-4 h-4" />
                        Export Excel
                    </a>
                    <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-2 bg-rose-600 text-white rounded-lg text-sm font-semibold hover:bg-rose-700 transition shadow-sm"
                    >
                        <FileDown className="w-4 h-4" />
                        Export PDF
                    </a>
                </div>
            }
        >
            <Head title="Laporan Bulanan" />

            {/* Navigation Tabs between Monthly and Weekly */}
            <div className="flex items-center gap-2 mb-5">
                <Link
                    href={route('admin.reports.monthly')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm flex items-center gap-1.5"
                >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Laporan Bulanan</span>
                </Link>
                <Link
                    href={route('admin.reports.weekly')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
                >
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Laporan Mingguan</span>
                </Link>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm mb-6">
                <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Bulan
                        </label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                            className="w-full text-sm rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500/20 shadow-sm"
                        >
                            {months.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Tahun
                        </label>
                        <select
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            className="w-full text-sm rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500/20 shadow-sm"
                        >
                            {years.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Karyawan
                        </label>
                        <select
                            value={employeeId}
                            onChange={(e) => setEmployeeId(e.target.value)}
                            className="w-full text-sm rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500/20 shadow-sm"
                        >
                            <option value="">Semua Karyawan</option>
                            {employees.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.employee_code} - {emp.full_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Cari
                        </label>
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Nama, kode, jabatan..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 text-sm rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500/20 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition shadow-sm"
                        >
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="px-4 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-sm font-semibold transition"
                        >
                            Reset
                        </button>
                    </div>
                </form>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-medium text-slate-500">Total Shift Terjadwal</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{summary.total_scheduled_all ?? 0}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Hari kerja toko</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-medium text-slate-500">Tingkat Kehadiran</p>
                    <p className="text-2xl font-bold text-navy-800 mt-1">{summary.overall_rate ?? 0}%</p>
                    <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                        {summary.total_attended_all ?? 0} kehadiran
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
                    <p className="text-xs font-medium text-emerald-700">Tepat Waktu</p>
                    <p className="text-2xl font-bold text-emerald-800 mt-1">{summary.total_ontime_all ?? 0}</p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">Disiplin jadwal</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-sm">
                    <p className="text-xs font-medium text-amber-700">Terlambat</p>
                    <p className="text-2xl font-bold text-amber-800 mt-1">{summary.total_late_all ?? 0}</p>
                    <p className="text-[11px] text-amber-600 font-semibold mt-0.5">{summary.total_late_minutes_all ?? 0} menit</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/20 shadow-sm">
                    <p className="text-xs font-medium text-blue-700">Izin & Sakit</p>
                    <p className="text-2xl font-bold text-blue-800 mt-1">
                        {(summary.total_leave_all ?? 0) + (summary.total_sick_all ?? 0)}
                    </p>
                    <p className="text-[11px] text-blue-600 mt-0.5">{summary.total_leave_all ?? 0} izin, {summary.total_sick_all ?? 0} sakit</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-rose-100 bg-rose-50/20 shadow-sm">
                    <p className="text-xs font-medium text-rose-700">Alpa / Mangkir</p>
                    <p className="text-2xl font-bold text-rose-800 mt-1">{summary.total_absent_all ?? 0}</p>
                    <p className="text-[11px] text-rose-600 mt-0.5">Tanpa info</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-medium text-slate-500">Total Jam Kerja</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{summary.total_hours_all ?? 0}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Jam akumulasi</p>
                </div>
            </div>

            {/* Weekly Trend in Month Chart */}
            {weeklyTrends.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Tren Mingguan Sepanjang Bulan</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Performa kehadiran dibagi per minggu kalender</p>
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="week_label" tick={{ fontSize: 12, fill: '#64748b' }} />
                                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#0f172a',
                                        borderRadius: '0.75rem',
                                        border: 'none',
                                        color: '#fff',
                                        fontSize: '0.75rem',
                                    }}
                                />
                                <Legend wrapperStyle={{ fontSize: '0.75rem', paddingTop: '10px' }} />
                                <Bar dataKey="present" name="Tepat Waktu" fill="#10B981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="late" name="Terlambat" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="leave" name="Izin / Sakit" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="absent" name="Alpa" fill="#EF4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Per-Employee Disciplinary Summary Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Rekap Disiplin & Kinerja per Karyawan</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Evaluasi komprehensif kehadiran seluruh staf ({employeeRecaps.length} karyawan)
                        </p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/75 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200/70">
                            <tr>
                                <th className="px-5 py-3.5 font-bold">Karyawan</th>
                                <th className="px-5 py-3.5 font-bold">Jabatan</th>
                                <th className="px-4 py-3.5 font-bold text-center">Terjadwal</th>
                                <th className="px-4 py-3.5 font-bold text-center">Hadir</th>
                                <th className="px-4 py-3.5 font-bold text-center">Tepat Waktu</th>
                                <th className="px-4 py-3.5 font-bold text-center">Terlambat</th>
                                <th className="px-4 py-3.5 font-bold text-center">Izin</th>
                                <th className="px-4 py-3.5 font-bold text-center">Sakit</th>
                                <th className="px-4 py-3.5 font-bold text-center">Alpa</th>
                                <th className="px-4 py-3.5 font-bold text-center">Total Jam</th>
                                <th className="px-5 py-3.5 font-bold text-right">% Kehadiran</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employeeRecaps.length === 0 ? (
                                <tr>
                                    <td colSpan="11" className="px-5 py-12 text-center text-slate-400">
                                        Tidak ada data rekap untuk periode atau filter yang dipilih.
                                    </td>
                                </tr>
                            ) : (
                                employeeRecaps.map((rec) => {
                                    const rate = rec.attendance_rate;
                                    let rateColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';
                                    let barColor = 'bg-emerald-500';
                                    if (rate < 75) {
                                        rateColor = 'text-rose-700 bg-rose-50 border-rose-200';
                                        barColor = 'bg-rose-500';
                                    } else if (rate < 90) {
                                        rateColor = 'text-amber-700 bg-amber-50 border-amber-200';
                                        barColor = 'bg-amber-500';
                                    }

                                    return (
                                        <tr key={rec.employee_id} className="hover:bg-slate-50/60 transition">
                                            <td className="px-5 py-3.5">
                                                <div className="font-semibold text-slate-900">{rec.full_name}</div>
                                                <div className="text-xs text-slate-400">{rec.employee_code}</div>
                                            </td>
                                            <td className="px-5 py-3.5 text-slate-600 text-xs font-medium">
                                                {rec.position || '-'}
                                            </td>
                                            <td className="px-4 py-3.5 text-center font-medium text-slate-700">
                                                {rec.scheduled_days}
                                            </td>
                                            <td className="px-4 py-3.5 text-center font-bold text-slate-900">
                                                {rec.attended_days}
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                    {rec.on_time_days}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                {rec.late_days > 0 ? (
                                                    <div>
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                            {rec.late_days}x
                                                        </span>
                                                        <div className="text-[10px] text-amber-600 font-medium mt-0.5">
                                                            {rec.late_minutes}m
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-400">0</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-center text-xs text-slate-700">
                                                {rec.leave_days}
                                            </td>
                                            <td className="px-4 py-3.5 text-center text-xs text-slate-700">
                                                {rec.sick_days}
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                {rec.absent_days > 0 ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                                        {rec.absent_days}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">0</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3.5 text-center text-xs font-semibold text-slate-700">
                                                {rec.duration_formatted}
                                            </td>
                                            <td className="px-5 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-16 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-full ${barColor}`}
                                                            style={{ width: `${Math.min(100, rate)}%` }}
                                                        />
                                                    </div>
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${rateColor}`}>
                                                        {rate}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
