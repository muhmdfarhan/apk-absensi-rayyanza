import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatusBadge from '@/Components/StatusBadge';
import {
    Calendar,
    Filter,
    Users,
    CheckCircle2,
    Clock,
    AlertTriangle,
    FileSpreadsheet,
    FileDown,
    ArrowRight,
    TrendingUp,
    Building2,
    Timer
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

export default function Weekly({ report, employees, filters, periodLabel }) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [employeeId, setEmployeeId] = useState(filters.employee_id || '');

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.reports.weekly'), {
            start_date: startDate,
            employee_id: employeeId || undefined,
        }, { preserveState: true });
    };

    const handleReset = () => {
        setStartDate('');
        setEmployeeId('');
        router.get(route('admin.reports.weekly'), {});
    };

    const summary = report.summary || {};
    const dailyBreakdown = report.daily_breakdown || [];
    const attendances = report.attendances || [];

    return (
        <AppLayout
            title="Laporan Mingguan"
            headerTitle="Laporan Evaluasi Mingguan"
            headerSubtitle={`Periode: ${periodLabel}`}
            actions={
                <div className="flex items-center gap-2">
                    <a
                        href={route('admin.attendances.recap', {
                            period: 'weekly',
                            start_date: report.start_date,
                            end_date: report.end_date,
                            employee_id: employeeId || undefined,
                        })}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 transition shadow-sm"
                    >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        Buka di Rekap Detail
                    </a>
                </div>
            }
        >
            <Head title="Laporan Mingguan" />

            {/* Navigation Tabs between Monthly and Weekly */}
            <div className="flex items-center gap-2 mb-5">
                <Link
                    href={route('admin.reports.monthly')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
                >
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Laporan Bulanan</span>
                </Link>
                <Link
                    href={route('admin.reports.weekly')}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm flex items-center gap-1.5"
                >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Laporan Mingguan</span>
                </Link>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm mb-6">
                <form onSubmit={handleFilter} className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Pilih Minggu (Mulai Tanggal)
                        </label>
                        <div className="relative">
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full text-sm rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500/20 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 min-w-[220px]">
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                            Filter Karyawan
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

                    <div className="flex items-center gap-2 pt-2">
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition shadow-sm"
                        >
                            <Filter className="w-4 h-4" />
                            Terapkan
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
                    <p className="text-xs font-medium text-slate-500">Total Terjadwal</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{summary.total_scheduled ?? 0}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Shift kerja aktif</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-medium text-slate-500">Tingkat Kehadiran</p>
                    <p className="text-2xl font-bold text-navy-800 mt-1">{summary.attendance_percentage ?? 0}%</p>
                    <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                        {summary.total_attended ?? 0} kehadiran
                    </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-sm">
                    <p className="text-xs font-medium text-emerald-700">Tepat Waktu</p>
                    <p className="text-2xl font-bold text-emerald-800 mt-1">{summary.on_time_count ?? 0}</p>
                    <p className="text-[11px] text-emerald-600 mt-0.5">Sesuai toleransi</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-amber-100 bg-amber-50/20 shadow-sm">
                    <p className="text-xs font-medium text-amber-700">Terlambat</p>
                    <p className="text-2xl font-bold text-amber-800 mt-1">{summary.late_count ?? 0}</p>
                    <p className="text-[11px] text-amber-600 font-semibold mt-0.5">{summary.total_late_minutes ?? 0} menit</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/20 shadow-sm">
                    <p className="text-xs font-medium text-blue-700">Izin / Sakit</p>
                    <p className="text-2xl font-bold text-blue-800 mt-1">{(summary.leave_count ?? 0) + (summary.sick_count ?? 0)}</p>
                    <p className="text-[11px] text-blue-600 mt-0.5">{summary.leave_count ?? 0} izin, {summary.sick_count ?? 0} sakit</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-rose-100 bg-rose-50/20 shadow-sm">
                    <p className="text-xs font-medium text-rose-700">Alpa / Bolos</p>
                    <p className="text-2xl font-bold text-rose-800 mt-1">{summary.absent_count ?? 0}</p>
                    <p className="text-[11px] text-rose-600 mt-0.5">Tanpa keterangan</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
                    <p className="text-xs font-medium text-slate-500">Total Jam Kerja</p>
                    <p className="text-2xl font-bold text-slate-800 mt-1">{summary.total_duration_hours ?? 0}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Jam aktual</p>
                </div>
            </div>

            {/* Daily Trend Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Grafik Kehadiran Harian Minggu Ini</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Distribusi status kehadiran per hari</p>
                    </div>
                </div>
                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="day_name" tick={{ fontSize: 12, fill: '#64748b' }} />
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

            {/* Day by Day Breakdown Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Rincian Hari per Hari</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Data agregasi mingguan</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/75 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200/70">
                            <tr>
                                <th className="px-5 py-3.5 font-bold">Hari & Tanggal</th>
                                <th className="px-5 py-3.5 font-bold text-center">Tepat Waktu</th>
                                <th className="px-5 py-3.5 font-bold text-center">Terlambat</th>
                                <th className="px-5 py-3.5 font-bold text-center">Izin / Sakit</th>
                                <th className="px-5 py-3.5 font-bold text-center">Alpa</th>
                                <th className="px-5 py-3.5 font-bold text-right">Total Jam Kerja</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {dailyBreakdown.map((day, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/60 transition">
                                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                                        <div>{day.day_name}</div>
                                        <div className="text-xs text-slate-400 font-normal">{day.formatted_date}</div>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {day.present}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                            {day.late}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                            {day.leave}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                            {day.absent}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right font-medium text-slate-800">
                                        {day.total_hours} Jam
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
