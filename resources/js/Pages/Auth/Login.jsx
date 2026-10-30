import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Store, Eye, EyeOff, Lock, Mail, ShieldAlert, ArrowRight, UserCheck, Shield } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { store } = usePage().props;
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: true,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    const fillDemoCredentials = (role) => {
        if (role === 'admin') {
            setData({
                email: 'admin@retail.com',
                password: 'password',
                remember: true,
            });
        } else {
            setData({
                email: 'siti@retail.com',
                password: 'password',
                remember: true,
            });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Masuk - Sistem Absensi Toko" />

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Brand Logo & Name */}
                <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                        <Store className="w-6 h-6" />
                    </div>
                </div>
                <h2 className="mt-4 text-center text-2xl font-bold text-slate-900 tracking-tight">
                    {store?.store_name || 'Toko Rayyanza'}
                </h2>
                <p className="mt-1 text-center text-xs text-slate-500">
                    Masuk untuk melakukan absensi karyawan Toko Rayyanza
                </p>
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 sm:px-8 shadow-sm rounded-2xl border border-slate-200/80">
                    {status && (
                        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                            {status}
                        </div>
                    )}

                    {errors.email && (
                        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                            <span>{errors.email}</span>
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Email
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    placeholder="nama@retail.com"
                                    className="block w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Kata Sandi
                            </label>
                            <div className="relative rounded-xl shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="w-4 h-4" />
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={data.password}
                                    placeholder="••••••••"
                                    className="block w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-xs text-rose-600">{errors.password}</p>
                            )}
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="rounded border-slate-300 text-blue-600 shadow-sm focus:ring-blue-500"
                                />
                                <span className="text-slate-600">Ingat sesi saya</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-sm transition disabled:opacity-60"
                        >
                            <span>{processing ? 'Memproses Masuk...' : 'Masuk Sekarang'}</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </form>

                    {/* Quick Demo Access Buttons */}
                    <div className="mt-6 pt-5 border-t border-slate-100">
                        <p className="text-[11px] font-semibold text-slate-400 text-center uppercase tracking-wider mb-2.5">
                            Coba Langsung (Klik untuk Isi Otomatis)
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('admin')}
                                className="px-3 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/70 transition flex items-center justify-center gap-1.5"
                            >
                                <Shield className="w-3.5 h-3.5" />
                                <span>Akun Admin</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => fillDemoCredentials('employee')}
                                className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/70 transition flex items-center justify-center gap-1.5"
                            >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Akun Karyawan</span>
                            </button>
                        </div>
                    </div>
                </div>

                <p className="mt-4 text-center text-[11px] text-slate-400">
                    Sistem Absensi Ritel • Praktis, Cepat, dan Akurat
                </p>
            </div>
        </div>
    );
}