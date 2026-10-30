import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatusBadge from '@/Components/StatusBadge';
import {
    Clock,
    Calendar,
    LogIn,
    LogOut,
    CheckCircle2,
    AlertCircle,
    ArrowRight,
    Coffee,
    FileText,
    History,
    Sparkles,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

export default function Dashboard({
    employee,
    todaySchedule,
    todayAttendance,
    openOvernightAttendance,
    stats,
    upcomingSchedules,
    recentAttendances,
    pendingLeaves,
    serverTime,
    serverDate,
}) {
    // Live ticking digital clock starting from serverTime
    const [currentTime, setCurrentTime] = useState(serverTime);
    const [showNotes, setShowNotes] = useState(false);

    useEffect(() => {
        const [h, m, s] = (serverTime || '00:00:00').split(':').map(Number);
        let secondsPassed = 0;

        const interval = setInterval(() => {
            secondsPassed++;
            const totalSec = (h * 3600 + m * 60 + s + secondsPassed) % 86400;
            const curH = String(Math.floor(totalSec / 3600)).padStart(2, '0');
            const curM = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
            const curS = String(totalSec % 60).padStart(2, '0');
            setCurrentTime(`${curH}:${curM}:${curS}`);
        }, 1000);

        return () => clearInterval(interval);
    }, [serverTime]);

    // Active attendance to display
    const activeAttendance = openOvernightAttendance || todayAttendance;
    const isCheckedIn = Boolean(activeAttendance?.check_in_time);
    const isCheckedOut = Boolean(activeAttendance?.check_out_time);

    // Check In form
    const checkInForm = useForm({
        notes: '',
    });

    // Check Out form
    const checkOutForm = useForm({
        notes: '',
    });

    const handleCheckIn = (e) => {
        e.preventDefault();
        checkInForm.post(route('employee.attendance.check-in'), {
            preserveScroll: true,
            onSuccess: () => {
                checkInForm.reset();
                setShowNotes(false);
            },
        });
    };

    const handleCheckOut = (e) => {
        e.preventDefault();
        checkOutForm.post(route('employee.attendance.check-out'), {
            preserveScroll: true,
            onSuccess: () => {
                checkOutForm.reset();
                setShowNotes(false);
            },
        });
    };

    return (
        <AppLayout
            title="Dashboard Saya"
            headerTitle={`Halo, ${employee.full_name.split(' ')[0]}! 👋`}
            headerSubtitle={`${employee.position || 'Staf'} • NIK: ${employee.employee_code}`}
        >
            <Head title="Dashboard Karyawan" />

            <div className="max-w-4xl mx-auto space-y-5">
                {/* 1. KARTU UTAMA ABSENSI (Fokus Utama Karyawan) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-7 relative overflow-hidden">
                    {/* Header info & live clock */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-100">
                        <div>
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Absensi Hari Ini • {serverDate}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                                {todaySchedule?.is_day_off ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                                        Hari Libur (Day Off)
                                    </span>
                                ) : todaySchedule?.shift ? (
                                    <span
                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border"
                                        style={{
                                            backgroundColor: `${todaySchedule.shift.color || '#2563eb'}15`,
                                            borderColor: `${todaySchedule.shift.color || '#2563eb'}40`,
                                            color: todaySchedule.shift.color || '#1e40af',
                                        }}
                                    >
                                        {todaySchedule.shift.name} ({todaySchedule.shift.start_time?.substring(0, 5)} - {todaySchedule.shift.end_time?.substring(0, 5)} WIB)
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                        Belum Ada Jadwal Khusus
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Live Digital Clock Badge */}
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 px-4 py-2 rounded-xl shrink-0 self-start sm:self-auto">
                            <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
                            <span className="text-xl font-bold font-mono text-slate-800 tracking-tight">
                                {currentTime}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400">WIB</span>
                        </div>
                    </div>

                    {/* Action Area based on status */}
                    <div className="pt-6">
                        {todaySchedule?.is_day_off ? (
                            /* Kondisi: Hari Libur */
                            <div className="text-center py-6">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mx-auto mb-2">
                                    <Coffee className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-slate-800">Hari Ini Anda Dijadwalkan Libur</h3>
                                <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                                    Selamat menikmati waktu istirahat! Anda tidak memiliki kewajiban absensi untuk hari ini.
                                </p>
                            </div>
                        ) : !isCheckedIn ? (
                            /* Kondisi 1: BELUM ABSEN MASUK -> Tombol Besar Absen Masuk */
                            <form onSubmit={handleCheckIn} className="space-y-4">
                                <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                            <LogIn className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-emerald-950">Siap Memulai Shift Kerja?</h4>
                                            <p className="text-xs text-emerald-700">
                                                Tekan tombol di bawah untuk mencatat kehadiran masuk Anda.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowNotes(!showNotes)}
                                        className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 self-start sm:self-center"
                                    >
                                        <span>{showNotes ? 'Tutup Catatan' : '+ Catatan (opsional)'}</span>
                                        {showNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>
                                </div>

                                {showNotes && (
                                    <div>
                                        <input
                                            type="text"
                                            value={checkInForm.data.notes}
                                            onChange={(e) => checkInForm.setData('notes', e.target.value)}
                                            placeholder="Catatan masuk (misal: buka toko, briefing pagi...)"
                                            className="w-full text-xs rounded-xl border-slate-300 focus:border-emerald-500 focus:ring-emerald-500/20"
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={checkInForm.processing}
                                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2.5 shadow-md shadow-emerald-600/20 transition disabled:opacity-60"
                                >
                                    <LogIn className="w-5 h-5" />
                                    <span>{checkInForm.processing ? 'Menyimpan Absensi...' : 'ABSEN MASUK SEKARANG'}</span>
                                </button>
                            </form>
                        ) : !isCheckedOut ? (
                            /* Kondisi 2: SUDAH MASUK, BELUM PULANG -> Tombol Besar Absen Pulang */
                            <form onSubmit={handleCheckOut} className="space-y-4">
                                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-bold text-slate-900">Anda Sedang Bekerja</h4>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                                                    Aktif
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                Masuk pukul <strong className="text-slate-800 font-mono">{activeAttendance.check_in_time.substring(11, 16)} WIB</strong>
                                                {activeAttendance.late_minutes > 0 ? (
                                                    <span className="text-amber-600 font-medium ml-1">
                                                        (Terlambat {activeAttendance.late_minutes} mnt)
                                                    </span>
                                                ) : (
                                                    <span className="text-emerald-600 font-medium ml-1">
                                                        (Tepat Waktu)
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setShowNotes(!showNotes)}
                                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 self-start sm:self-center"
                                    >
                                        <span>{showNotes ? 'Tutup Catatan' : '+ Catatan Pulang (opsional)'}</span>
                                        {showNotes ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>
                                </div>

                                {showNotes && (
                                    <div>
                                        <input
                                            type="text"
                                            value={checkOutForm.data.notes}
                                            onChange={(e) => checkOutForm.setData('notes', e.target.value)}
                                            placeholder="Catatan pulang (misal: serah terima kasir beres...)"
                                            className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={checkOutForm.processing}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2.5 shadow-md shadow-blue-600/20 transition disabled:opacity-60"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>{checkOutForm.processing ? 'Menyimpan Absensi...' : 'ABSEN PULANG SEKARANG'}</span>
                                </button>
                            </form>
                        ) : (
                            /* Kondisi 3: SUDAH LENGKAP KEDUANYA -> Pesan Sukses Sederhana */
                            <div className="text-center py-4 bg-emerald-50/50 rounded-xl border border-emerald-100 p-5">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <h3 className="text-base font-bold text-slate-900">
                                    Absensi Hari Ini Telah Lengkap!
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Terima kasih atas dedikasi kerja Anda hari ini. Selamat beristirahat!
                                </p>

                                <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Jam Masuk</span>
                                        <strong className="text-slate-800 font-mono text-sm">
                                            {activeAttendance.check_in_time.substring(11, 16)} WIB
                                        </strong>
                                    </div>
                                    <div className="w-px h-8 bg-slate-200"></div>
                                    <div>
                                        <span className="text-slate-400 block text-[11px]">Jam Pulang</span>
                                        <strong className="text-slate-800 font-mono text-sm">
                                            {activeAttendance.check_out_time.substring(11, 16)} WIB
                                        </strong>
                                    </div>
                                    {activeAttendance.work_duration_minutes > 0 && (
                                        <>
                                            <div className="w-px h-8 bg-slate-200"></div>
                                            <div>
                                                <span className="text-slate-400 block text-[11px]">Total Kerja</span>
                                                <strong className="text-blue-700 font-bold text-sm">
                                                    {Math.floor(activeAttendance.work_duration_minutes / 60)}j {activeAttendance.work_duration_minutes % 60}m
                                                </strong>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. RINGKASAN KEHADIRAN BULAN INI (Dibuat Bersih & Mudah Dipahami) */}
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Performa Saya Bulan Ini
                        </h3>
                        <Link
                            href={route('employee.attendance.history')}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <span>Lihat Riwayat Lengkap</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-xs text-slate-500 font-medium">Shift Terjadwal</span>
                            <div className="text-xl font-bold text-slate-900 mt-1">
                                {stats.total_scheduled ?? 0} <span className="text-xs font-normal text-slate-400">Hari</span>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                            <span className="text-xs text-emerald-700 font-medium">Tepat Waktu</span>
                            <div className="text-xl font-bold text-emerald-800 mt-1">
                                {stats.present_count ?? 0} <span className="text-xs font-normal text-emerald-600">Hari</span>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-100">
                            <span className="text-xs text-amber-700 font-medium">Terlambat</span>
                            <div className="text-xl font-bold text-amber-800 mt-1">
                                {stats.late_count ?? 0} <span className="text-xs font-normal text-amber-600">Hari</span>
                            </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100">
                            <span className="text-xs text-blue-700 font-medium">Izin / Sakit</span>
                            <div className="text-xl font-bold text-blue-800 mt-1">
                                {stats.leave_count ?? 0} <span className="text-xs font-normal text-blue-600">Hari</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. JADWAL MENDATANG & RIWAYAT TERAKHIR (Bersih & Sederhana) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Jadwal Shift Mendatang */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <h4 className="text-sm font-bold text-slate-900">Jadwal Shift Berikutnya</h4>
                            </div>
                            <Link
                                href={route('employee.schedules.index')}
                                className="text-xs font-semibold text-blue-600 hover:underline"
                            >
                                Semua Jadwal
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {upcomingSchedules.length === 0 ? (
                                <p className="text-xs text-slate-400 py-4 text-center">
                                    Belum ada jadwal shift mendatang.
                                </p>
                            ) : (
                                upcomingSchedules.slice(0, 4).map((sch) => (
                                    <div key={sch.id} className="py-2.5 flex items-center justify-between text-xs">
                                        <div>
                                            <div className="font-semibold text-slate-800">
                                                {new Date(sch.schedule_date).toLocaleDateString('id-ID', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short',
                                                })}
                                            </div>
                                            <div className="text-[11px] text-slate-400 font-mono">
                                                {sch.is_day_off ? 'Hari Libur' : (sch.shift ? `${sch.shift.start_time?.substring(0, 5)} - ${sch.shift.end_time?.substring(0, 5)}` : '-')}
                                            </div>
                                        </div>
                                        <div>
                                            {sch.is_day_off ? (
                                                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                                                    Libur
                                                </span>
                                            ) : sch.shift ? (
                                                <span
                                                    className="px-2 py-0.5 rounded-full text-[11px] font-bold border"
                                                    style={{
                                                        backgroundColor: `${sch.shift.color || '#2563eb'}10`,
                                                        borderColor: `${sch.shift.color || '#2563eb'}30`,
                                                        color: sch.shift.color || '#1e40af',
                                                    }}
                                                >
                                                    {sch.shift.name}
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Riwayat Absensi Terakhir */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <History className="w-4 h-4 text-blue-600" />
                                <h4 className="text-sm font-bold text-slate-900">Riwayat Terakhir</h4>
                            </div>
                            <Link
                                href={route('employee.attendance.history')}
                                className="text-xs font-semibold text-blue-600 hover:underline"
                            >
                                Semua Riwayat
                            </Link>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {recentAttendances.length === 0 ? (
                                <p className="text-xs text-slate-400 py-4 text-center">
                                    Belum ada catatan kehadiran.
                                </p>
                            ) : (
                                recentAttendances.slice(0, 4).map((att) => (
                                    <div key={att.id} className="py-2.5 flex items-center justify-between text-xs">
                                        <div>
                                            <div className="font-semibold text-slate-800">
                                                {new Date(att.date).toLocaleDateString('id-ID', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short',
                                                })}
                                            </div>
                                            <div className="text-[11px] text-slate-400 font-mono">
                                                {att.check_in_time ? att.check_in_time.substring(11, 16) : '-'} s/d {att.check_out_time ? att.check_out_time.substring(11, 16) : '-'}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <StatusBadge status={att.status} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Link to Leave Request */}
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                            <div className="text-xs font-bold text-blue-950">Perlu mengajukan izin atau sakit?</div>
                            <div className="text-[11px] text-blue-700">Kirim surat permohonan izin langsung ke manajer toko.</div>
                        </div>
                    </div>
                    <Link
                        href={route('employee.leaves.create')}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition shrink-0"
                    >
                        Ajukan Izin
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}