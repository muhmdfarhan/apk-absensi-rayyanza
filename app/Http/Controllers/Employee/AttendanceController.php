<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\EmployeeSchedule;
use App\Services\AttendanceService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function __construct(
        protected AttendanceService $attendanceService
    ) {}

    public function index(): Response
    {
        $employee = Auth::user()->employee;
        if (!$employee) {
            abort(403, 'Profil karyawan tidak ditemukan.');
        }

        $now = Carbon::now('Asia/Jakarta');
        $today = $now->toDateString();

        $schedule = EmployeeSchedule::where('employee_id', $employee->id)
            ->where('schedule_date', $today)
            ->with('shift')
            ->first();

        $attendance = Attendance::where('employee_id', $employee->id)
            ->where('date', $today)
            ->first();

        // Check if there is an overnight open attendance from yesterday
        $yesterday = (clone $now)->subDay()->toDateString();
        $openOvernight = Attendance::where('employee_id', $employee->id)
            ->where('date', $yesterday)
            ->whereNotNull('check_in_time')
            ->whereNull('check_out_time')
            ->first();

        return Inertia::render('Employee/Attendance/Index', [
            'employee' => $employee,
            'schedule' => $schedule,
            'attendance' => $attendance,
            'openOvernight' => $openOvernight,
            'serverTime' => $now->format('H:i:s'),
            'serverDate' => $now->translatedFormat('l, d F Y'),
            'rawDate' => $today,
        ]);
    }

    public function checkIn(Request $request): RedirectResponse
    {
        $employee = Auth::user()->employee;
        if (!$employee) {
            abort(403);
        }

        $notes = $request->input('notes');
        $ip = $request->ip();

        $attendance = $this->attendanceService->checkIn($employee, $ip, $notes);

        $statusMessage = ($attendance->status === 'late')
            ? "Absen Masuk Berhasil! Anda tercatat terlambat {$attendance->late_minutes} menit."
            : "Absen Masuk Berhasil! Selamat bekerja dan tepat waktu.";

        return back()->with('success', $statusMessage);
    }

    public function checkOut(Request $request): RedirectResponse
    {
        $employee = Auth::user()->employee;
        if (!$employee) {
            abort(403);
        }

        $notes = $request->input('notes');
        $ip = $request->ip();

        $attendance = $this->attendanceService->checkOut($employee, $ip, $notes);

        $hours = floor($attendance->work_duration_minutes / 60);
        $minutes = $attendance->work_duration_minutes % 60;

        return back()->with('success', "Absen Pulang Berhasil! Total durasi kerja Anda: {$hours} jam {$minutes} menit.");
    }

    public function history(Request $request): Response
    {
        $employee = Auth::user()->employee;
        if (!$employee) {
            abort(403);
        }

        $month = (int) $request->input('month', Carbon::now('Asia/Jakarta')->month);
        $year = (int) $request->input('year', Carbon::now('Asia/Jakarta')->year);

        $query = Attendance::where('employee_id', $employee->id)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->with(['schedule.shift', 'corrections'])
            ->orderByDesc('date');

        $attendances = $query->paginate(15)->withQueryString();

        $allInMonth = Attendance::where('employee_id', $employee->id)
            ->whereYear('date', $year)
            ->whereMonth('date', $month)
            ->get();

        $stats = [
            'present' => $allInMonth->where('status', 'present')->count(),
            'late' => $allInMonth->where('status', 'late')->count(),
            'late_minutes' => $allInMonth->sum('late_minutes'),
            'leave' => $allInMonth->whereIn('status', ['on_leave', 'sick'])->count(),
            'absent' => $allInMonth->where('status', 'absent')->count(),
            'total_hours' => round($allInMonth->sum('work_duration_minutes') / 60, 1),
        ];

        $months = [];
        for ($m = 1; $m <= 12; $m++) {
            $months[] = [
                'value' => $m,
                'label' => Carbon::createFromDate($year, $m, 1)->translatedFormat('F'),
            ];
        }

        $years = range(Carbon::now('Asia/Jakarta')->year - 1, Carbon::now('Asia/Jakarta')->year);

        return Inertia::render('Employee/Attendance/History', [
            'attendances' => $attendances,
            'stats' => $stats,
            'filters' => [
                'month' => $month,
                'year' => $year,
            ],
            'months' => $months,
            'years' => $years,
        ]);
    }
}
