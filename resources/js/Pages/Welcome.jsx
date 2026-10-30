import { Head, Link } from '@inertiajs/react';
import { Store, ArrowRight, ShieldCheck, Clock, Users, CalendarCheck } from 'lucide-react';

export default function Welcome({ auth }) {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
            <Head title="Sistem Absensi Karyawan" />

            {/* Top Navigation */}
            <header className="max-w-5xl mx-auto w-full px-6 py-6 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                        <Store className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-base tracking-tight text-slate-900">
                        Toko Rayyanza
                    </span>
                </div>

                <nav>
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
                        >
                            <span>Buka Dashboard</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <Link
                            href={route('login')}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm transition"
                        >
                            <span>Masuk ke Akun</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <main className="max-w-3xl mx-auto px-6 py-12 text-center flex-1 flex flex-col justify-center items-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 mb-5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Sistem Absensi Ritel & Toko
                </span>

                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                    Absensi Karyawan Lebih Simpel, Cepat & Praktis
                </h1>

                <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
                    Pencatatan absensi masuk dan pulang karyawan dalam 1-klik, pengelolaan jadwal shift kerja, dan rekap otomatis tanpa ribet.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm">
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
                        >
                            <span>Masuk ke Dashboard</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <Link
                            href={route('login')}
                            className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
                        >
                            <span>Masuk untuk Absensi</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>

                {/* 3 Simple Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 w-full text-left">
                    <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                        <Clock className="w-5 h-5 text-blue-600 mb-2" />
                        <h2 className="text-xs font-bold text-slate-900">Absensi 1-Klik</h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">Absen masuk & pulang langsung dari beranda HP atau laptop.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                        <CalendarCheck className="w-5 h-5 text-emerald-600 mb-2" />
                        <h2 className="text-xs font-bold text-slate-900">Jadwal Shift Rapi</h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">Karyawan dapat melihat jadwal shift harian dan mingguan dengan jelas.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm">
                        <Users className="w-5 h-5 text-indigo-600 mb-2" />
                        <h2 className="text-xs font-bold text-slate-900">Rekap Otomatis</h2>
                        <p className="text-[11px] text-slate-500 mt-0.5">Pemilik toko memantau keterlambatan dan jam kerja secara real-time.</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/60">
                Sistem Absensi Karyawan Toko Rayyanza
            </footer>
        </div>
    );
}