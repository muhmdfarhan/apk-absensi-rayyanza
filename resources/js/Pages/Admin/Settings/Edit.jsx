import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    Store,
    Save,
    Clock,
    MapPin,
    Phone,
    Mail,
    Shield,
    Globe
} from 'lucide-react';

export default function Edit({ setting }) {
    const { data, setData, put, processing, errors } = useForm({
        store_name: setting.store_name || '',
        store_code: setting.store_code || '',
        phone: setting.phone || '',
        email: setting.email || '',
        address: setting.address || '',
        default_tolerance_minutes: setting.default_tolerance_minutes ?? 5,
        timezone: setting.timezone || 'Asia/Jakarta',
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('admin.settings.update'));
    };

    return (
        <AppLayout
            title="Pengaturan Toko"
            headerTitle="Pengaturan Profil Toko & Sistem"
            headerSubtitle="Konfigurasi identitas toko ritel, toleransi keterlambatan global, dan zona waktu operasional"
        >
            <Head title="Pengaturan Toko" />

            <div className="max-w-4xl">
                <form onSubmit={submit} className="space-y-6">
                    {/* Store Profile Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center text-navy-800">
                                <Store className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Identitas Toko Ritel</h3>
                                <p className="text-xs text-slate-500">Nama dan data kontak toko untuk header laporan dan struk</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Nama Toko <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.store_name}
                                    onChange={(e) => setData('store_name', e.target.value)}
                                    placeholder="Contoh: Toko Ritel Modern Sejahtera"
                                    className="w-full text-sm rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500/20 shadow-sm"
                                    required
                                />
                                {errors.store_name && (
                                    <p className="text-xs text-rose-500 mt-1">{errors.store_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Kode / ID Cabang Toko
                                </label>
                                <input
                                    type="text"
                                    value={data.store_code}
                                    onChange={(e) => setData('store_code', e.target.value)}
                                    placeholder="Contoh: RETAIL-CAB-01"
                                    className="w-full text-sm rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500/20 shadow-sm"
                                />
                                {errors.store_code && (
                                    <p className="text-xs text-rose-500 mt-1">{errors.store_code}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Nomor Telepon Toko
                                </label>
                                <div className="relative">
                                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="021-12345678 / 08123456789"
                                        className="w-full pl-9 text-sm rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500/20 shadow-sm"
                                    />
                                </div>
                                {errors.phone && (
                                    <p className="text-xs text-rose-500 mt-1">{errors.phone}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Email Operasional
                                </label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="toko@retailsejahtera.com"
                                        className="w-full pl-9 text-sm rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500/20 shadow-sm"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-rose-500 mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Alamat Toko Lengkap
                                </label>
                                <div className="relative">
                                    <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                                    <textarea
                                        rows={3}
                                        value={data.address}
                                        onChange={(e) => setData('address', e.target.value)}
                                        placeholder="Jl. Pemuda No. 45, Kebayoran Baru, Jakarta Selatan"
                                        className="w-full pl-9 text-sm rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500/20 shadow-sm"
                                    />
                                </div>
                                {errors.address && (
                                    <p className="text-xs text-rose-500 mt-1">{errors.address}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Attendance Policy & Timezone Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
                        <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Kebijakan Absensi & Waktu Operasional</h3>
                                <p className="text-xs text-slate-500">Standar toleransi keterlambatan dan zona waktu server</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Default Toleransi Keterlambatan (Menit) <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        max="120"
                                        value={data.default_tolerance_minutes}
                                        onChange={(e) => setData('default_tolerance_minutes', e.target.value)}
                                        className="w-full text-sm rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500/20 shadow-sm pr-16"
                                        required
                                    />
                                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                                        Menit
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Jika shift dimulai pukul 08:00 dan toleransi 5 menit, karyawan baru dianggap terlambat jika absen pukul 08:06 ke atas.
                                </p>
                                {errors.default_tolerance_minutes && (
                                    <p className="text-xs text-rose-500 mt-1">{errors.default_tolerance_minutes}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                                    Zona Waktu Sistem <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative">
                                    <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <select
                                        value={data.timezone}
                                        onChange={(e) => setData('timezone', e.target.value)}
                                        className="w-full pl-9 text-sm rounded-xl border-slate-200 focus:border-navy-500 focus:ring-navy-500/20 shadow-sm"
                                        required
                                    >
                                        <option value="Asia/Jakarta">Asia/Jakarta (WIB - UTC+7)</option>
                                        <option value="Asia/Makassar">Asia/Makassar (WITA - UTC+8)</option>
                                        <option value="Asia/Jayapura">Asia/Jayapura (WIT - UTC+9)</option>
                                    </select>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Zona waktu acuan seluruh pencatatan server timestamp.
                                </p>
                                {errors.timezone && (
                                    <p className="text-xs text-rose-500 mt-1">{errors.timezone}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-semibold hover:bg-navy-800 transition shadow-sm disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
