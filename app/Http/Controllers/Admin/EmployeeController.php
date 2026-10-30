<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Employee;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->input('status', 'active');
        $search = $request->input('search');

        $query = Employee::with('user');

        if ($status === 'active') {
            $query->where('is_active', true);
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        }

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('employee_code', 'like', "%{$search}%")
                  ->orWhere('position', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $employees = $query->orderBy('full_name')->paginate(10)->withQueryString();

        $stats = [
            'total' => Employee::count(),
            'active' => Employee::where('is_active', true)->count(),
            'inactive' => Employee::where('is_active', false)->count(),
        ];

        return Inertia::render('Admin/Employees/Index', [
            'employees' => $employees,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
            'stats' => $stats,
        ]);
    }

    public function create(): Response
    {
        // Suggest next employee code e.g. EMP-001
        $latest = Employee::latest('id')->first();
        $nextNumber = $latest ? ((int) filter_var($latest->employee_code, FILTER_SANITIZE_NUMBER_INT) + 1) : 1;
        $suggestedCode = 'EMP-' . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        return Inertia::render('Admin/Employees/Create', [
            'suggestedCode' => $suggestedCode,
            'positions' => ['Kasir', 'Pramuniaga', 'Staff Gudang', 'Inventory', 'Supervisor', 'Kepala Toko'],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_code' => ['required', 'string', 'max:50', 'unique:employees,employee_code'],
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
            'phone' => ['nullable', 'string', 'max:20'],
            'position' => ['required', 'string', 'max:100'],
            'join_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ], [
            'employee_code.unique' => 'Kode karyawan sudah digunakan.',
            'email.unique' => 'Email login sudah digunakan.',
            'password.min' => 'Password minimal 6 karakter.',
        ]);

        DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['full_name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => 'employee',
                'is_active' => true,
            ]);

            $employee = Employee::create([
                'user_id' => $user->id,
                'employee_code' => $validated['employee_code'],
                'full_name' => $validated['full_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'position' => $validated['position'],
                'join_date' => $validated['join_date'],
                'is_active' => true,
                'notes' => $validated['notes'],
            ]);

            AuditLog::record('employee_created', 'Employee', $employee->id, [
                'employee_code' => $employee->employee_code,
                'full_name' => $employee->full_name,
                'position' => $employee->position,
            ]);
        });

        return redirect()->route('admin.employees.index')->with('success', 'Karyawan berhasil didaftarkan beserta akun login.');
    }

    public function show(Employee $employee): Response
    {
        $employee->load('user');

        $now = Carbon::now('Asia/Jakarta');
        $thisMonthStart = (clone $now)->startOfMonth()->toDateString();
        $thisMonthEnd = (clone $now)->endOfMonth()->toDateString();

        $monthAttendances = $employee->attendances()
            ->whereBetween('date', [$thisMonthStart, $thisMonthEnd])
            ->get();

        $scheduledCount = $employee->schedules()
            ->whereBetween('schedule_date', [$thisMonthStart, $thisMonthEnd])
            ->where('is_day_off', false)
            ->count();

        $stats = [
            'total_scheduled' => $scheduledCount,
            'present' => $monthAttendances->where('status', 'present')->count(),
            'late' => $monthAttendances->where('status', 'late')->count(),
            'total_late_minutes' => $monthAttendances->sum('late_minutes'),
            'leave' => $monthAttendances->whereIn('status', ['on_leave', 'sick'])->count(),
            'absent' => $monthAttendances->where('status', 'absent')->count(),
            'total_duration_hours' => round($monthAttendances->sum('work_duration_minutes') / 60, 1),
        ];

        $recentAttendances = $employee->attendances()
            ->with(['schedule.shift', 'corrections'])
            ->orderByDesc('date')
            ->take(10)
            ->get();

        $upcomingSchedules = $employee->schedules()
            ->where('schedule_date', '>=', $now->toDateString())
            ->with('shift')
            ->orderBy('schedule_date')
            ->take(7)
            ->get();

        return Inertia::render('Admin/Employees/Show', [
            'employee' => $employee,
            'stats' => $stats,
            'recentAttendances' => $recentAttendances,
            'upcomingSchedules' => $upcomingSchedules,
        ]);
    }

    public function edit(Employee $employee): Response
    {
        $employee->load('user');

        return Inertia::render('Admin/Employees/Edit', [
            'employee' => $employee,
            'positions' => ['Kasir', 'Pramuniaga', 'Staff Gudang', 'Inventory', 'Supervisor', 'Kepala Toko'],
        ]);
    }

    public function update(Request $request, Employee $employee): RedirectResponse
    {
        $user = $employee->user;

        $validated = $request->validate([
            'employee_code' => ['required', 'string', 'max:50', Rule::unique('employees', 'employee_code')->ignore($employee->id)],
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user?->id)],
            'password' => ['nullable', 'string', 'min:6'],
            'phone' => ['nullable', 'string', 'max:20'],
            'position' => ['required', 'string', 'max:100'],
            'join_date' => ['required', 'date'],
            'is_active' => ['required', 'boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($validated, $employee, $user) {
            $employee->update([
                'employee_code' => $validated['employee_code'],
                'full_name' => $validated['full_name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'position' => $validated['position'],
                'join_date' => $validated['join_date'],
                'is_active' => $validated['is_active'],
                'notes' => $validated['notes'],
            ]);

            if ($user) {
                $userUpdates = [
                    'name' => $validated['full_name'],
                    'email' => $validated['email'],
                    'is_active' => $validated['is_active'],
                ];

                if (!empty($validated['password'])) {
                    $userUpdates['password'] = Hash::make($validated['password']);
                }

                $user->update($userUpdates);
            }

            AuditLog::record('employee_updated', 'Employee', $employee->id, [
                'employee_code' => $employee->employee_code,
                'full_name' => $employee->full_name,
                'is_active' => $employee->is_active,
            ]);
        });

        return redirect()->route('admin.employees.index')->with('success', 'Data karyawan berhasil diperbarui.');
    }

    public function toggleActive(Employee $employee): RedirectResponse
    {
        $newStatus = !$employee->is_active;

        DB::transaction(function () use ($employee, $newStatus) {
            $employee->update(['is_active' => $newStatus]);

            if ($employee->user) {
                $employee->user->update(['is_active' => $newStatus]);
            }

            AuditLog::record('employee_status_toggled', 'Employee', $employee->id, [
                'employee_name' => $employee->full_name,
                'new_status' => $newStatus ? 'active' : 'inactive',
            ]);
        });

        $message = $newStatus 
            ? "Karyawan {$employee->full_name} berhasil diaktifkan kembali." 
            : "Karyawan {$employee->full_name} berhasil dinonaktifkan. Histori absensi tetap tersimpan aman.";

        return back()->with('success', $message);
    }
}
