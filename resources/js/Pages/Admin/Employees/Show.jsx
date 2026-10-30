import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatusBadge from '@/Components/StatusBadge';
import StatCard from '@/Components/StatCard';
import {
    ArrowLeft,
    Edit,
    Mail,
    Phone,
    Calendar,
    Briefcase,
    Clock,
    CheckCircle2,
    AlertTriangle,
    FileText,
} from 'lucide-react';

export default function Show({ employee, stats, recentAttendances, upcomingSchedules }) {
    return (
        <AppLayout
            headerTitle={employee.full_name}
            headerSubtitle={`Detail profil karyawan, statistik performa, dan riwayat absensi (${employee.employee_code})`}
            actions={
                <div className="flex items-center gap-2">
                    <Link
                        href={route('admin.employees.index')}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Kembali</span>
                    </Link>
                    <Link
                        href={route('admin.employees.edit', employee.id)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
                    >
                        <Edit className="w-4 h-4" />
                        <span>Edit Profil</span>
                    </Link>
                </div>
            }
        >
            <Head title={`Detail ${employee.full_name}`} />

            {/* Profile Overview Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
                            {employee.full_name.charAt(0)}
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h1 className="text-xl font-bold text-slate-900">{employee.full_name}</h1>
                                <StatusBadge status={employee.is_active ? 'active' : 'inactive'} />
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Kode: <strong className="font-mono text-slate-700">{employee.employee_code}</strong> • Jabatan: <strong>{employee.position}</strong>
                            </p>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
                                <span className="flex items-center gap-1">
                                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                                    {employee.email || '-'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                                    {employee.phone || '-'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                    Mulai: {new Date(employee.join_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {employee.notes && (
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                        <strong className="text-slate-700">Catatan:</strong> {employee.notes}
                    </div>
                )}
            </div>

            {/* Monthly Attendance Performance Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                <StatCard
                    title="Jadwal Bulan Ini"
                    value={stats.total_scheduled}
                    subtitle="Shift terjadwal"
                    icon={Calendar}
                    iconColor="text-blue-600"
                    iconBg="bg-blue-50"
                />
                <StatCard
                    title="Tepat Waktu"
                    value={stats.present}
                    subtitle="Kehadiran tertib"
                    icon={CheckCircle2}
                    iconColor="text-emerald-600"
                    iconBg="bg-emerald-50"
                />
                <StatCard
                    title="Terlambat"
                    value={stats.late}
                    subtitle={`${stats.total_late_minutes} menit akumulasi`}
                    icon={AlertTriangle}
                    iconColor="text-amber-600"
                    iconBg="bg-amber-50"
                />
                <StatCard
                    title="Izin / Sakit"
                    value={stats.leave}
                    subtitle="Pengajuan disetujui"
                    icon={FileText}
                    iconColor="text-indigo-600"
                    iconBg="bg-indigo-50"
                />
                <StatCard
                    title="Tidak Hadir"
                    value={stats.absent}
                    subtitle="Tanpa keterangan"
                    icon={Clock}
                    iconColor="text-rose-600"
                    iconBg="bg-rose-50"
                />
                <StatCard
                    title="Total Jam Kerja"
                    value={`${stats.total_duration_hours} j`}
                    subtitle="Berdasarkan checkout"
                    icon={Briefcase}
                    iconColor="text-teal-600"
                    iconBg="bg-teal-50"
                />
            </div>

            {/* Two Columns: Upcoming Schedules & Recent Attendance History */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Schedules */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
                    <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span>Jadwal Shift Mendatang</span>
                    </h2>
                    {upcomingSchedules.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-4">Belum ada jadwal shift untuk 7 hari ke depan.</p>
                    ) : (
                        <div className="space-y-2.5">
                            {upcomingSchedules.map((sch) => (
                                <div key={sch.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between text-xs">
                                    <div>
                                        <div className="font-semibold text-slate-800">
                                            {new Date(sch.schedule_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                                        </div>
                                        <div className="text-[11px] text-slate-500 font-mono">
                                            {sch.shift ? `${sch.shift.start_time.substring(0, 5)} - ${sch.shift.end_time.substring(0, 5)} WIB` : 'Libur'}
                                        </div>
                                    </div>
                                    <span
                                        className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-white"
                                        style={{ backgroundColor: sch.shift?.color || '#94A3B8' }}
                                    >
                                        {sch.is_day_off ? 'Libur' : sch.shift?.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Attendances */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
                    <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span>Riwayat Absensi Terakhir</span>
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                                    <th className="py-2.5 px-3">Tanggal</th>
                                    <th className="py-2.5 px-3">Shift</th>
                                    <th className="py-2.5 px-3">Masuk</th>
                                    <th className="py-2.5 px-3">Pulang</th>
                                    <th className="py-2.5 px-3">Status</th>
                                    <th className="py-2.5 px-3 text-right">Durasi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentAttendances.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-slate-400">
                                            Belum ada catatan absensi untuk karyawan ini.
                                        </td>
                                    </tr>
                                ) : (
                                    recentAttendances.map((att) => (
                                        <tr key={att.id} className="hover:bg-slate-50/80 transition">
                                            <td className="py-3 px-3 font-semibold text-slate-900">
                                                {new Date(att.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="py-3 px-3 text-slate-600">{att.shift_name || '-'}</td>
                                            <td className="py-3 px-3 font-mono">
                                                {att.check_in_time ? new Date(att.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </td>
                                            <td className="py-3 px-3 font-mono">
                                                {att.check_out_time ? new Date(att.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                                            </td>
                                            <td className="py-3 px-3">
                                                <StatusBadge status={att.status} />
                                            </td>
                                            <td className="py-3 px-3 text-right font-medium text-slate-700">
                                                {att.work_duration_minutes > 0 
                                                    ? `${Math.floor(att.work_duration_minutes / 60)}j ${att.work_duration_minutes % 60}m` 
                                                    : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
