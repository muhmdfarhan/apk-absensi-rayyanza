import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import StatusBadge from '@/Components/StatusBadge';
import {
    UserPlus,
    Search,
    Filter,
    Eye,
    Edit,
    Power,
    Users,
    CheckCircle2,
    XCircle,
} from 'lucide-react';

export default function Index({ employees, filters, stats }) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.employees.index'), { ...filters, search }, { preserveState: true });
    };

    const handleStatusFilter = (status) => {
        router.get(route('admin.employees.index'), { ...filters, status, page: 1 }, { preserveState: true });
    };

    const handleToggleActive = (employee) => {
        const action = employee.is_active ? 'menonaktifkan' : 'mengaktifkan';
        if (confirm(`Apakah Anda yakin ingin ${action} akun karyawan ${employee.full_name}? Histori absensi tetap tersimpan.`)) {
            router.post(route('admin.employees.toggle-active', employee.id));
        }
    };

    return (
        <AppLayout
            headerTitle="Manajemen Data Karyawan"
            headerSubtitle="Kelola data staf toko, akun login, dan status keaktifan"
            actions={
                <Link
                    href={route('admin.employees.create')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Tambah Karyawan</span>
                </Link>
            }
        >
            <Head title="Data Karyawan" />

            {/* Quick Stat Bar */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div
                    onClick={() => handleStatusFilter('all')}
                    className={`cursor-pointer bg-white p-4 rounded-xl border transition ${
                        filters.status === 'all' ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-500 uppercase">Total Karyawan</span>
                        <Users className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800 mt-2">{stats.total}</div>
                </div>

                <div
                    onClick={() => handleStatusFilter('active')}
                    className={`cursor-pointer bg-white p-4 rounded-xl border transition ${
                        filters.status === 'active' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-600 uppercase">Karyawan Aktif</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800 mt-2">{stats.active}</div>
                </div>

                <div
                    onClick={() => handleStatusFilter('inactive')}
                    className={`cursor-pointer bg-white p-4 rounded-xl border transition ${
                        filters.status === 'inactive' ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-slate-200 hover:border-slate-300'
                    }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-rose-600 uppercase">Nonaktif</span>
                        <XCircle className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800 mt-2">{stats.inactive}</div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <form onSubmit={handleSearch} className="w-full sm:w-80 relative">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari nama, kode, jabatan..."
                        className="w-full pl-9 pr-3.5 py-2 text-xs border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </form>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-xs font-semibold text-slate-500">Status:</span>
                    <button
                        type="button"
                        onClick={() => handleStatusFilter('active')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            filters.status === 'active' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Aktif
                    </button>
                    <button
                        type="button"
                        onClick={() => handleStatusFilter('inactive')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            filters.status === 'inactive' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Nonaktif
                    </button>
                    <button
                        type="button"
                        onClick={() => handleStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            filters.status === 'all' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Semua
                    </button>
                </div>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                                <th className="py-3 px-4">Karyawan</th>
                                <th className="py-3 px-4">Kode</th>
                                <th className="py-3 px-4">Jabatan</th>
                                <th className="py-3 px-4">Kontak</th>
                                <th className="py-3 px-4">Mulai Bekerja</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {employees.data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center text-slate-400">
                                        Tidak ada data karyawan yang cocok dengan kriteria pencarian.
                                    </td>
                                </tr>
                            ) : (
                                employees.data.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                                                    {emp.full_name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900">{emp.full_name}</div>
                                                    <div className="text-[11px] text-slate-500">{emp.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 font-mono font-medium text-slate-700">
                                            {emp.employee_code}
                                        </td>
                                        <td className="py-3 px-4 text-slate-800 font-medium">
                                            {emp.position}
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            {emp.phone || '-'}
                                        </td>
                                        <td className="py-3 px-4 text-slate-600">
                                            {new Date(emp.join_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="py-3 px-4">
                                            <StatusBadge status={emp.is_active ? 'active' : 'inactive'} />
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    href={route('admin.employees.show', emp.id)}
                                                    className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100 transition"
                                                    title="Lihat Detail & Riwayat"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                <Link
                                                    href={route('admin.employees.edit', emp.id)}
                                                    className="p-1.5 text-slate-500 hover:text-amber-600 rounded-md hover:bg-slate-100 transition"
                                                    title="Edit Data"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleActive(emp)}
                                                    className={`p-1.5 rounded-md hover:bg-slate-100 transition ${
                                                        emp.is_active ? 'text-slate-500 hover:text-rose-600' : 'text-slate-500 hover:text-emerald-600'
                                                    }`}
                                                    title={emp.is_active ? 'Nonaktifkan Karyawan' : 'Aktifkan Kembali'}
                                                >
                                                    <Power className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {employees.links && employees.links.length > 3 && (
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <span>Menampilkan {employees.from || 0} - {employees.to || 0} dari {employees.total} karyawan</span>
                        <div className="flex items-center gap-1">
                            {employees.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-3 py-1.5 rounded-md ${
                                        link.active
                                            ? 'bg-blue-600 text-white font-semibold'
                                            : link.url
                                            ? 'hover:bg-slate-100 text-slate-700'
                                            : 'text-slate-300 cursor-not-allowed'
                                    }`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
