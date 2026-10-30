import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    Clock,
    Calendar,
    UserCheck,
    ClipboardList,
    FileText,
    TrendingUp,
    BarChart3,
    Settings,
    History,
    CheckCircle2,
    LogOut,
    Menu,
    X,
    ChevronDown,
    Store,
    User,
    AlertCircle,
    CheckCircle,
    Info,
} from 'lucide-react';

export default function AppLayout({ title, headerTitle, headerSubtitle, actions, children }) {
    const { auth, flash, store } = usePage().props;
    const user = auth?.user;
    const isAdmin = user?.role === 'admin';

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [toast, setToast] = useState(null);

    // Flash message listener
    useEffect(() => {
        if (flash?.success) {
            setToast({ type: 'success', message: flash.success });
        } else if (flash?.error) {
            setToast({ type: 'error', message: flash.error });
        } else if (flash?.warning) {
            setToast({ type: 'warning', message: flash.warning });
        } else if (flash?.info) {
            setToast({ type: 'info', message: flash.info });
        }
    }, [flash]);

    // Auto dismiss toast after 5s
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const adminNavItems = [
        { name: 'Dashboard', href: route('admin.dashboard'), icon: LayoutDashboard, current: route().current('admin.dashboard') },
        { name: 'Absensi Hari Ini', href: route('admin.attendances.today'), icon: UserCheck, current: route().current('admin.attendances.today') },
        { name: 'Rekap Absensi', href: route('admin.attendances.recap'), icon: ClipboardList, current: route().current('admin.attendances.recap') },
        { name: 'Jadwal Shift', href: route('admin.schedules.index'), icon: Calendar, current: route().current('admin.schedules.*') },
        { name: 'Data Karyawan', href: route('admin.employees.index'), icon: Users, current: route().current('admin.employees.*') },
        { name: 'Pengajuan Izin', href: route('admin.leaves.index'), icon: FileText, current: route().current('admin.leaves.*') },
        { name: 'Laporan Bulanan', href: route('admin.reports.monthly'), icon: TrendingUp, current: route().current('admin.reports.monthly*') },
        { name: 'Laporan Mingguan', href: route('admin.reports.weekly'), icon: BarChart3, current: route().current('admin.reports.weekly*') },
        { name: 'Pengaturan', href: route('admin.settings.edit'), icon: Settings, current: route().current('admin.settings.*') },
    ];

    const employeeNavItems = [
        { name: 'Beranda & Absen', href: route('employee.dashboard'), icon: LayoutDashboard, current: route().current('employee.dashboard') },
        { name: 'Jadwal Shift', href: route('employee.schedules.index'), icon: Calendar, current: route().current('employee.schedules.*') },
        { name: 'Riwayat Absensi', href: route('employee.attendance.history'), icon: History, current: route().current('employee.attendance.history') },
        { name: 'Pengajuan Izin', href: route('employee.leaves.index'), icon: FileText, current: route().current('employee.leaves.*') },
    ];

    const navItems = isAdmin ? adminNavItems : employeeNavItems;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row font-sans antialiased">
            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-5 right-5 z-50 max-w-md w-full animate-in fade-in slide-in-from-top-4 duration-300">
                    <div
                        className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md ${
                            toast.type === 'success'
                                ? 'bg-emerald-50/95 border-emerald-300 text-emerald-900'
                                : toast.type === 'error'
                                ? 'bg-rose-50/95 border-rose-300 text-rose-900'
                                : toast.type === 'warning'
                                ? 'bg-amber-50/95 border-amber-300 text-amber-900'
                                : 'bg-blue-50/95 border-blue-300 text-blue-900'
                        }`}
                    >
                        {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />}
                        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />}
                        {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />}
                        {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />}
                        <div className="flex-1 text-sm font-medium">{toast.message}</div>
                        <button
                            onClick={() => setToast(null)}
                            className="text-slate-400 hover:text-slate-700 transition"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-200 shrink-0 text-slate-700">
                {/* Brand Logo & Store Name */}
                <div className="h-16 flex items-center px-5 border-b border-slate-100 gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
                        <Store className="w-4 h-4" />
                    </div>
                    <div className="overflow-hidden">
                        <h1 className="text-sm font-bold text-slate-900 tracking-tight truncate leading-tight">
                            {store?.store_name || 'Toko Rayyanza'}
                        </h1>
                        <span className="text-[11px] text-blue-600 font-medium">
                            {isAdmin ? 'Panel Admin Toko' : 'Portal Karyawan'}
                        </span>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                    <div className="px-3 pb-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                        Menu
                    </div>
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                                    item.current
                                        ? 'bg-blue-50 text-blue-700 font-bold'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${item.current ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span className="truncate">{item.name}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* User Info & Quick Logout */}
                <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="overflow-hidden">
                                <div className="text-xs font-bold text-slate-900 truncate">{user?.name}</div>
                                <div className="text-[10px] text-slate-500 truncate">{isAdmin ? 'Pemilik Toko' : (user?.employee?.position || 'Karyawan')}</div>
                            </div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                            title="Keluar"
                        >
                            <LogOut className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Mobile Sliding Drawer */}
            {mobileMenuOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div className="relative w-64 max-w-xs bg-white text-slate-800 flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
                        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                                    <Store className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-bold text-slate-900 truncate">
                                    {store?.store_name || 'Toko Rayyanza'}
                                </span>
                            </div>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-800"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                                            item.current
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <div className="flex items-center justify-between">
                                <div className="text-xs">
                                    <div className="font-bold text-slate-800">{user?.name}</div>
                                    <div className="text-slate-500 text-[11px]">{user?.email}</div>
                                </div>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="p-1.5 text-slate-400 hover:text-rose-600"
                                >
                                    <LogOut className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto pb-16 lg:pb-0">
                {/* Top Navigation Bar */}
                <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-6 lg:px-8 shrink-0 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                            aria-label="Menu"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-xs font-semibold text-slate-700">
                                {store?.store_name || 'Toko Rayyanza'}
                            </span>
                        </div>
                    </div>

                    {/* Top Right User Profile Menu */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition text-left"
                        >
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="hidden sm:block">
                                <div className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</div>
                                <div className="text-[10px] text-slate-500 font-medium">
                                    {isAdmin ? 'Pemilik Toko' : (user?.employee?.position || 'Karyawan')}
                                </div>
                            </div>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>

                        {userDropdownOpen && (
                            <div
                                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 animate-in fade-in zoom-in-95 duration-100"
                                onClick={() => setUserDropdownOpen(false)}
                            >
                                <div className="px-4 py-2 border-b border-slate-100">
                                    <div className="text-xs font-bold text-slate-800">{user?.name}</div>
                                    <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                                </div>
                                <Link
                                    href={route('profile.edit')}
                                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
                                >
                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                    <span>Profil Saya</span>
                                </Link>
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium"
                                >
                                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                                    <span>Keluar</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                {/* Page Header (if provided) */}
                {(headerTitle || actions) && (
                    <div className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                                    {headerTitle}
                                </h1>
                                {headerSubtitle && (
                                    <p className="mt-0.5 text-xs text-slate-500">{headerSubtitle}</p>
                                )}
                            </div>
                            {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
                        </div>
                    </div>
                )}

                {/* Page Body Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation (Ultra Convenient for Employees) */}
            {!isAdmin && (
                <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around shadow-lg">
                    {employeeNavItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-semibold transition ${
                                    item.current
                                        ? 'text-blue-600 font-bold'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                <Icon className={`w-5 h-5 mb-0.5 ${item.current ? 'text-blue-600' : 'text-slate-400'}`} />
                                <span className="truncate max-w-[64px]">{item.name.split(' ')[0]}</span>
                            </Link>
                        );
                    })}
                </nav>
            )}
        </div>
    );
}