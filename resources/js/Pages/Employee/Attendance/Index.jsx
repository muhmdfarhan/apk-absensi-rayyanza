import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatusBadge from '@/Components/StatusBadge';
import {
    Clock,
    Calendar,
    LogIn,
    LogOut,
    CheckCircle2,
    ShieldCheck,
    Coffee,
    Moon,
    ArrowLeft,
} from 'lucide-react';

export default function Index({
    employee,
    schedule,
    attendance,
    openOvernight,
    serverTime,
    serverDate,
    rawDate,
}) {
    // Live digital clock
    const [currentTime, setCurrentTime] = useState(serverTime);

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

    // Active attendance: overnight from yesterday or today's attendance
    const activeAttendance = openOvernight || attendance;
    const isCheckedIn = Boolean(activeAttendance?.check_in_time);
    const isCheckedOut = Boolean(activeAttendance?.check_out_time);

    // Form for Check In
    const checkInForm = useForm({
        notes: '',
    });

    // Form for Check Out
    const checkOutForm = useForm({
        notes: '',
    });

    const handleCheckIn = (e) => {
        e.preventDefault();
        checkInForm.post(route('employee.attendance.check-in'));
    };

    const handleCheckOut = (e) => {
        e.preventDefault();
        checkOutForm.post(route('employee.attendance.check-out'));
    };

    return (
        <AppLayout
            title="Kiosk Absensi"
            headerTitle="Kiosk Absensi Masuk & Pulang"
            headerSubtitle={`Waktu Server Resmi: ${serverDate}`}
            actions={
                <Link
                    href={route('employee.dashboard')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Kembali ke Beranda</span>
                </Link>
            }
        >
            <Head title="Kiosk Absensi" />

            <div className="max-w-xl mx-auto space-y-5">
                {/* Overnight Notice if checking out from yesterday */}
                {openOvernight && (
                    <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-2xl flex items-start gap-3">
                        <Moon className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="text-xs font-bold text-amber-900">Shift Malam Terdeteksi</h4>
                            <p className="text-xs text-amber-700 mt-0.5">
                                Anda telah masuk pada shift kemarin pukul{' '}
                                <strong className="font-mono">{openOvernight.check_in_time.substring(11, 16)}</strong>. Tombol di bawah akan menyelesaikan shift malam tersebut.
                            </p>
                        </div>
                    </div>
                )}

                {/* Big Live Clock Kiosk Card */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold mb-3 border border-emerald-200/60">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span>WIB (Asia/Jakarta)</span>
                    </div>

                    <div className="text-xs font-medium text-slate-400">
                        {serverDate}
                    </div>

                    <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-slate-900 my-2">
                        {currentTime}
                    </div>

                    <p className="text-xs text-slate-400">
                        Waktu resmi server toko tercatat secara real-time
                    </p>
                </div>

                {/* Schedule Information */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <div>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase">Jadwal Hari Ini</span>
                            <div className="font-bold text-sm text-slate-900 mt-0.5">
                                {schedule?.is_day_off ? 'Hari Libur (Day Off)' : (schedule?.shift?.name || 'Tidak Ada Shift Terdaftar')}
                            </div>
                        </div>
                        {schedule?.shift && !schedule.is_day_off && (
                            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60">
                                {schedule.shift.start_time?.substring(0, 5)} - {schedule.shift.end_time?.substring(0, 5)} WIB
                            </span>
                        )}
                    </div>

                    {schedule?.shift && !schedule.is_day_off && (
                        <div className="pt-3 flex items-center justify-between text-xs text-slate-500">
                            <span>Toleransi Keterlambatan: <strong className="text-slate-800">{schedule.shift.late_tolerance_minutes} Menit</strong></span>
                            <span>Istirahat: <strong className="text-slate-800">{schedule.shift.break_minutes} Menit</strong></span>
                        </div>
                    )}
                </div>

                {/* Action Section */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
                    {schedule?.is_day_off ? (
                        <div className="text-center py-6">
                            <Coffee className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                            <h3 className="text-sm font-bold text-slate-800">Hari Ini Anda Dijadwalkan Libur</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Anda tidak perlu melakukan absensi hari ini.
                            </p>
                        </div>
                    ) : !isCheckedIn ? (
                        <form onSubmit={handleCheckIn} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Catatan Masuk (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={checkInForm.data.notes}
                                    onChange={(e) => checkInForm.setData('notes', e.target.value)}
                                    placeholder="Contoh: Datang pagi pembukaan toko..."
                                    className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={checkInForm.processing}
                                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2.5 shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                            >
                                <LogIn className="w-5 h-5" />
                                <span>{checkInForm.processing ? 'Menyimpan...' : 'ABSEN MASUK SEKARANG'}</span>
                            </button>
                        </form>
                    ) : !isCheckedOut ? (
                        <form onSubmit={handleCheckOut} className="space-y-4">
                            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span className="text-xs font-bold text-emerald-900">Sudah Absen Masuk</span>
                                </div>
                                <span className="text-xs font-bold font-mono text-emerald-800">
                                    {activeAttendance.check_in_time.substring(11, 16)} WIB
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    Catatan Pulang (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={checkOutForm.data.notes}
                                    onChange={(e) => checkOutForm.setData('notes', e.target.value)}
                                    placeholder="Contoh: Tutup kasir beres..."
                                    className="w-full text-xs rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={checkOutForm.processing}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base flex items-center justify-center gap-2.5 shadow-md shadow-blue-600/20 transition disabled:opacity-50"
                            >
                                <LogOut className="w-5 h-5" />
                                <span>{checkOutForm.processing ? 'Menyimpan...' : 'ABSEN PULANG SEKARANG'}</span>
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">
                                Absensi Hari Ini Selesai!
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">
                                Terima kasih atas kerja keras Anda. Selamat beristirahat!
                            </p>
                            {activeAttendance.work_duration_minutes > 0 && (
                                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-700">
                                    Durasi Kerja: {Math.floor(activeAttendance.work_duration_minutes / 60)}j {activeAttendance.work_duration_minutes % 60}m
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}