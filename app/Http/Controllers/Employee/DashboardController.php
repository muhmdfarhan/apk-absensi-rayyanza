<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\EmployeeSchedule;
use App\Models\LeaveRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $employee = $user->employee;

        if (!$employee) {
            abort(403, 'Profil karyawan tidak ditemukan.');
        }

        $now = Carbon::now('Asia/Jakarta');
        $today = $now->toDateString();

        // Today's schedule
        $todaySchedule = EmployeeSchedule::where('employee_id', $employee->id)
            ->where('schedule_date', $today)
            ->with('shift')
            ->first();

        // Today's attendance
        $todayAttendance = Attendance::where('employee_id', $employee->id)
            ->where('date', $today)
            ->first();

        // Check if employee checked in yesterday on an overnight shift and hasn't checked out yet
        $yesterday = (clone $now)->subDay()->toDateString();
        $openOvernightAttendance = Attendance::where('employee_id', $employee->id)
            ->where('date', $yesterday)
            ->whereNotNull('check_in_time')
            ->whereNull('check_out_time')
            ->first();

        // Current month personal attendance statistics
        $startOfMonth = (clone $now)->startOfMonth()->toDateString();
        $endOfMonth = (clone $now)->endOfMonth()->toDateString();

        $monthAttendances = Attendance::where('employee_id', $employee->id)
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->get();

        $scheduledCount = EmployeeSchedule::where('employee_id', $employee->id)
            ->whereBetween('schedule_date', [$startOfMonth, $endOfMonth])
            ->where('is_day_off', false)
            ->count();

        $stats = [
            'total_scheduled' => $scheduledCount,
            'present_count' => $monthAttendances->where('status', 'present')->count(),
            'late_count' => $monthAttendances->where('status', 'late')->count(),
            'total_late_minutes' => $monthAttendances->sum('late_minutes'),
            'leave_count' => $monthAttendances->whereIn('status', ['on_leave', 'sick'])->count(),
            'absent_count' => $monthAttendances->where('status', 'absent')->count(),
            'total_work_hours' => round($monthAttendances->sum('work_duration_minutes') / 60, 1),
        ];

        // Upcoming 5 schedules
        $upcomingSchedules = EmployeeSchedule::where('employee_id', $employee->id)
            ->where('schedule_date', '>=', $today)
            ->with('shift')
            ->orderBy('schedule_date')
            ->take(5)
            ->get();

        // Recent 5 attendances
        $recentAttendances = Attendance::where('employee_id', $employee->id)
            ->orderByDesc('date')
            ->take(5)
            ->get();

        // Pending leaves count
        $pendingLeaves = LeaveRequest::where('employee_id', $employee->id)
            ->where('status', 'pending')
            ->count();

        return Inertia::render('Employee/Dashboard', [
            'employee' => $employee,
            'todaySchedule' => $todaySchedule,
            'todayAttendance' => $todayAttendance,
            'openOvernightAttendance' => $openOvernightAttendance,
            'stats' => $stats,
            'upcomingSchedules' => $upcomingSchedules,
            'recentAttendances' => $recentAttendances,
            'pendingLeaves' => $pendingLeaves,
            'serverTime' => $now->format('H:i:s'),
            'serverDate' => $now->translatedFormat('l, d F Y'),
        ]);
    }
}
