import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react';

export default function Edit({ employee, positions }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, put, processing, errors } = useForm({
        employee_code: employee.employee_code,
        full_name: employee.full_name,
        email: employee.email || employee.user?.email || '',
        password: '',
        phone: employee.phone || '',
        position: employee.position,
        join_date: employee.join_date ? employee.join_date.split('T')[0] : '',
        is_active: employee.is_active,
        notes: employee.notes || '',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.employees.update', employee.id));
    };

    return (
        <AppLayout
            headerTitle={`Edit Data Karyawan: ${employee.full_name}`}
            headerSubtitle="Perbarui informasi profil, jabatan, dan kredensial login"
            actions={
                <Link
                    href={route('admin.employees.index')}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 shadow-sm transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Kembali ke Daftar</span>
                </Link>
            }
        >
            <Head title={`Edit ${employee.full_name}`} />

            <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Kode Karyawan <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.employee_code}
                                onChange={(e) => setData('employee_code', e.target.value)}
                                className="w-full text-xs border-slate-300 rounded-xl font-mono focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            {errors.employee_code && <p className="mt-1 text-xs text-rose-600">{errors.employee_code}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Nama Lengkap <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={data.full_name}
                                onChange={(e) => setData('full_name', e.target.value)}
                                className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            {errors.full_name && <p className="mt-1 text-xs text-rose-600">{errors.full_name}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Jabatan Toko <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={data.position}
                                onChange={(e) => setData('position', e.target.value)}
                                className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                                required
                            >
                                {positions.map((p) => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                            {errors.position && <p className="mt-1 text-xs text-rose-600">{errors.position}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Tanggal Mulai Bekerja <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={data.join_date}
                                onChange={(e) => setData('join_date', e.target.value)}
                                className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                                required
                            />
                            {errors.join_date && <p className="mt-1 text-xs text-rose-600">{errors.join_date}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Nomor Telepon / WhatsApp
                            </label>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) => setData('phone', e.target.value)}
                                className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                            />
                            {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Status Keaktifan Akun
                            </label>
                            <select
                                value={data.is_active ? 1 : 0}
                                onChange={(e) => setData('is_active', parseInt(e.target.value) === 1)}
                                className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value={1}>Aktif (Bisa Login & Absen)</option>
                                <option value={0}>Nonaktif (Tidak Bisa Login)</option>
                            </select>
                            {errors.is_active && <p className="mt-1 text-xs text-rose-600">{errors.is_active}</p>}
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6 mt-6">
                        <div className="pb-4 mb-4">
                            <h2 className="text-base font-bold text-slate-800">Akun & Kredensial</h2>
                            <p className="text-xs text-slate-500">Kosongkan kata sandi jika tidak ingin mengubah sandi lama</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Email Login <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Ganti Kata Sandi (Opsional)
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Kosongkan jika tidak diubah"
                                        className="w-full text-xs border-slate-300 rounded-xl pr-10 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-xs text-rose-600">{errors.password}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6 mt-6">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            Catatan Administrasi
                        </label>
                        <textarea
                            value={data.notes}
                            onChange={(e) => setData('notes', e.target.value)}
                            rows={3}
                            className="w-full text-xs border-slate-300 rounded-xl focus:ring-blue-500 focus:border-blue-500"
                        ></textarea>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                        <Link
                            href={route('admin.employees.index')}
                            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                        >
                            Batal
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition disabled:opacity-60"
                        >
                            <Save className="w-4 h-4" />
                            <span>{processing ? 'Menyimpan...' : 'Perbarui Data'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
