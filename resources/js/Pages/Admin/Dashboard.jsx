import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatusBadge from '@/Components/StatusBadge';
import {
    Users,
    UserCheck,
    CheckCircle2,
    AlertTriangle,
    Clock,
    Calendar,
    FileText,
    ArrowRight,
    TrendingUp,
    Store,
    Clock3,
} from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from 'recharts';

export default function Dashboard({ dashboardData, selectedDate }) {
    const { stats, charts, recent_attendances, late_employees, not_checked_in_employees, shifts, active_leaves } = dashboardData;

    const handleDateChange = (e) => {
        router.get(route('admin.dashboard'), { date: e.target.value }, { preserveState: true });
    };

    const attendanceRate = stats.total_scheduled_today > 0
        ? Math.round((stats.checked_in_today / stats.total_scheduled_today) * 100)
        : 100;

    return (
        <AppLayout
            headerTitle="Ringkasan Operasional Toko"
            headerSubtitle={`Data kehadiran karyawan per ${dashboardData.selected_date}`}
            actions={
                <div className="flex items-center gap-2">
                    <label htmlFor="dashboard-date" className="text-xs font-semibold text-slate-500">
                        Tanggal:
                    </label>
                    <input
                        id="dashboard-date"
                        type="date"
                        value={selectedDate}
                        onChange={handleDateChange}
                        className="text-xs border-slate-300 rounded-xl px-3 py-1.5 focus:ring-blue-500 focus:border-blue-500 shadow-sm bg-white"
                    />
                </div>
            }
        >
            <Head title="Admin Dashboard" />

            <div className="space-y-6">
                {/* 1. 4 ESSENTIAL KPI CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Kehadiran Hari Ini */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-500">Hadir Hari Ini</span>
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                <UserCheck className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-slate-900">
                            {stats.checked_in_today}{' '}
                            <span className="text-xs font-normal text-slate-400">
                                / {stats.total_scheduled_today} jadwal
                            </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
                            <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${attendanceRate}%` }}
                            ></div>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1.5 flex justify-between">
                            <span>Tingkat Hadir</span>
                            <span className="font-semibold text-slate-700">{attendanceRate}%</span>
                        </div>
                    </div>

                    {/* Tepat Waktu */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-emerald-700">Tepat Waktu</span>
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-emerald-800">
                            {stats.on_time_today}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-3">
                            Karyawan masuk tepat shift
                        </p>
                    </div>

                    {/* Terlambat */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-amber-700">Terlambat</span>
                            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                <AlertTriangle className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-amber-800">
                            {stats.late_today}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-3">
                            Melewati batas toleransi
                        </p>
                    </div>

                    {/* Perlu Perhatian / Izin */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-600">Izin & Perhatian</span>
                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                                <FileText className="w-4 h-4" />
                            </div>
                        </div>
                        <div className="text-2xl font-black text-rose-700">
                            {stats.pending_leaves}{' '}
                            <span className="text-xs font-normal text-slate-400">menunggu</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-3">
                            {stats.not_checked_in_today} karyawan belum absen
                        </p>
                    </div>
                </div>

                {/* 2. QUICK ACTION SHORTCUTS (Akses Cepat) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                    <Link
                        href={route('admin.attendances.today')}
                        className="px-3.5 py-2 rounded-xl bg-blue-600 text-white font-semibold flex items-center gap-1.5 shadow-sm hover:bg-blue-700 transition shrink-0"
                    >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Absensi Hari Ini</span>
                    </Link>
                    <Link
                        href={route('admin.attendances.recap')}
                        className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 shadow-sm hover:bg-slate-50 transition shrink-0"
                    >
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Rekap Absensi</span>
                    </Link>
                    <Link
                        href={route('admin.employees.index')}
                        className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 shadow-sm hover:bg-slate-50 transition shrink-0"
                    >
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>Data Karyawan ({stats.total_active_employees})</span>
                    </Link>
                    <Link
                        href={route('admin.leaves.index')}
                        className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 shadow-sm hover:bg-slate-50 transition shrink-0"
                    >
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>Pengajuan Izin {stats.pending_leaves > 0 && `(${stats.pending_leaves})`}</span>
                    </Link>
                    <Link
                        href={route('admin.reports.monthly')}
                        className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold flex items-center gap-1.5 shadow-sm hover:bg-slate-50 transition shrink-0"
                    >
                        <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
                        <span>Laporan Toko</span>
                    </Link>
                </div>

                {/* 3. TWO COLUMN MAIN CONTENT */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Aktivitas Absensi Terbaru & Grafik Tren (Kolom Kiri 2/3) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Tabel Absensi Terbaru */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Aktivitas Absensi Terbaru</h3>
                                    <p className="text-xs text-slate-400">Pencatatan masuk dan pulang teranyar</p>
                                </div>
                                <Link
                                    href={route('admin.attendances.today')}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                    <span>Lihat Lengkap</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-xs">
                                    <thead>
                                        <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                                            <th className="py-2.5 px-3">Karyawan</th>
                                            <th className="py-2.5 px-3">Shift</th>
                                            <th className="py-2.5 px-3">Masuk</th>
                                            <th className="py-2.5 px-3">Pulang</th>
                                            <th className="py-2.5 px-3 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {recent_attendances.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center text-slate-400">
                                                    Belum ada aktivitas absensi tercatat hari ini.
                                                </td>
                                            </tr>
                                        ) : (
                                            recent_attendances.slice(0, 6).map((att) => (
                                                <tr key={att.id} className="hover:bg-slate-50/70 transition">
                                                    <td className="py-3 px-3">
                                                        <div className="font-semibold text-slate-900">{att.employee?.full_name}</div>
                                                        <div className="text-[10px] text-slate-400">{att.employee?.position || 'Staf'}</div>
                                                    </td>
                                                    <td className="py-3 px-3 text-slate-600">{att.shift_name || '-'}</td>
                                                    <td className="py-3 px-3 font-mono font-medium text-slate-800">
                                                        {att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                    </td>
                                                    <td className="py-3 px-3 font-mono font-medium text-slate-800">
                                                        {att.check_out_time ? new Date(att.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                    </td>
                                                    <td className="py-3 px-3 text-right">
                                                        <StatusBadge status={att.status} />
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Tren Kehadiran Mingguan Ringkas */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
                            <div className="mb-4">
                                <h3 className="text-sm font-bold text-slate-900">Tren Kehadiran (7 Hari Terakhir)</h3>
                                <p className="text-xs text-slate-400">Ringkasan kedisiplinan dan kehadiran staf</p>
                            </div>
                            <div className="h-56 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.weekly_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '11px', border: 'none' }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                                        <Bar dataKey="present" name="Tepat Waktu" fill="#10B981" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="late" name="Terlambat" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="leave" name="Izin / Sakit" fill="#6366F1" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="absent" name="Tidak Hadir" fill="#EF4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Kolom Kanan (Perlu Perhatian & Izin) */}
                    <div className="space-y-6">
                        {/* Karyawan Terlambat */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Terlambat Hari Ini ({late_employees.length})</span>
                                </h3>
                            </div>
                            {late_employees.length === 0 ? (
                                <p className="text-xs text-slate-400 py-3 italic text-center">
                                    ✨ Hebat! Tidak ada staf yang terlambat hari ini.
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {late_employees.map((att) => (
                                        <div key={att.id} className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs">
                                            <div>
                                                <div className="font-semibold text-slate-900">{att.employee?.full_name}</div>
                                                <div className="text-[10px] text-slate-500">{att.shift_name}</div>
                                            </div>
                                            <span className="font-bold text-amber-700">+{att.late_minutes} mnt</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Belum Absen Masuk */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                                    <Clock3 className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Belum Masuk ({not_checked_in_employees.length})</span>
                                </h3>
                            </div>
                            {not_checked_in_employees.length === 0 ? (
                                <p className="text-xs text-slate-400 py-3 italic text-center">
                                    Semua karyawan terjadwal sudah absen.
                                </p>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {not_checked_in_employees.map((sch) => (
                                        <div key={sch.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                                            <div>
                                                <div className="font-semibold text-slate-900">{sch.employee?.full_name}</div>
                                                <div className="text-[10px] text-slate-400">{sch.shift?.name} ({sch.shift?.start_time.substring(0, 5)} WIB)</div>
                                            </div>
                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                                Menunggu
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Pengajuan Izin Menunggu */}
                        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5 text-blue-500" />
                                    <span>Izin Aktif Hari Ini ({active_leaves.length})</span>
                                </h3>
                                <Link href={route('admin.leaves.index')} className="text-xs text-blue-600 font-semibold hover:underline">
                                    Verifikasi
                                </Link>
                            </div>
                            {active_leaves.length === 0 ? (
                                <p className="text-xs text-slate-400 py-3 italic text-center">
                                    Tidak ada yang izin atau sakit hari ini.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {active_leaves.map((leave) => (
                                        <div key={leave.id} className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between text-xs">
                                            <div>
                                                <div className="font-semibold text-slate-900">{leave.employee?.full_name}</div>
                                                <p className="text-[10px] text-slate-500 truncate max-w-[180px]">{leave.reason}</p>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 capitalize">
                                                {leave.type}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}