<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\LeaveRequest;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class ReportService
{
    /**
     * Get dynamic statistics for admin dashboard
     */
    public function getAdminDashboardStats(?string $date = null): array
    {
        $targetDate = $date ?? Carbon::today('Asia/Jakarta')->toDateString();
        $targetCarbon = Carbon::parse($targetDate, 'Asia/Jakarta');

        // 1. Total karyawan aktif
        $totalActiveEmployees = Employee::where('is_active', true)->count();

        // 2. Scheduled employees for today (not day off)
        $todaySchedules = EmployeeSchedule::where('schedule_date', $targetDate)
            ->where('is_day_off', false)
            ->whereHas('employee', function ($q) {
                $q->where('is_active', true);
            })
            ->with(['employee', 'shift'])
            ->get();

        $scheduledEmployeeIds = $todaySchedules->pluck('employee_id')->toArray();
        $totalScheduledToday = count($scheduledEmployeeIds);

        // Attendances for target date
        $attendancesToday = Attendance::where('date', $targetDate)
            ->with('employee')
            ->get();

        // 3. Checked in today
        $checkedInToday = $attendancesToday->whereNotNull('check_in_time')->count();

        // 4. On time today
        $onTimeToday = $attendancesToday->where('status', 'present')->count();

        // 5. Late today
        $lateToday = $attendancesToday->where('status', 'late')->count();

        // 6. Currently working (checked in, not checked out)
        $workingNow = $attendancesToday->whereNotNull('check_in_time')->whereNull('check_out_time')->count();

        // 7. Finished working (checked out)
        $finishedWorking = $attendancesToday->whereNotNull('check_out_time')->count();

        // 8. Not yet checked in today (scheduled today, active, no check-in yet)
        $checkedInEmployeeIds = $attendancesToday->whereNotNull('check_in_time')->pluck('employee_id')->toArray();
        $notCheckedInEmployeeIds = array_diff($scheduledEmployeeIds, $checkedInEmployeeIds);
        $notCheckedInCount = count($notCheckedInEmployeeIds);

        // 9. Pending leave requests
        $pendingLeaves = LeaveRequest::where('status', 'pending')->count();

        // List of employees not checked in yet
        $notCheckedInEmployees = $todaySchedules->whereIn('employee_id', $notCheckedInEmployeeIds)->values();

        // List of late employees today
        $lateEmployees = $attendancesToday->where('status', 'late')->values();

        // Recent 8 attendances
        $recentAttendances = Attendance::where('date', $targetDate)
            ->whereNotNull('check_in_time')
            ->with('employee')
            ->orderByDesc('check_in_time')
            ->take(8)
            ->get();

        // 7-day attendance trend
        $weeklyTrend = [];
        for ($i = 6; $i >= 0; $i--) {
            $d = (clone $targetCarbon)->subDays($i)->toDateString();
            $dCarbon = Carbon::parse($d);
            
            $dayAttendances = Attendance::where('date', $d)->get();

            $weeklyTrend[] = [
                'date' => $d,
                'label' => $dCarbon->translatedFormat('D, d M'),
                'present' => $dayAttendances->where('status', 'present')->count(),
                'late' => $dayAttendances->where('status', 'late')->count(),
                'absent' => $dayAttendances->where('status', 'absent')->count(),
                'leave' => $dayAttendances->whereIn('status', ['on_leave', 'sick'])->count(),
            ];
        }

        // Today's shifts with employee distribution
        $allShifts = Shift::where('is_active', true)->get()->map(function ($shift) use ($todaySchedules) {
            $assignedCount = $todaySchedules->where('shift_id', $shift->id)->count();
            return [
                'id' => $shift->id,
                'name' => $shift->name,
                'code' => $shift->code,
                'start_time' => Carbon::parse($shift->start_time)->format('H:i'),
                'end_time' => Carbon::parse($shift->end_time)->format('H:i'),
                'color' => $shift->color,
                'assigned_count' => $assignedCount,
            ];
        });

        // Leave summary for today
        $activeLeavesToday = LeaveRequest::where('status', 'approved')
            ->where('start_date', '<=', $targetDate)
            ->where('end_date', '>=', $targetDate)
            ->with('employee')
            ->get();

        return [
            'selected_date' => $targetDate,
            'stats' => [
                'total_active_employees' => $totalActiveEmployees,
                'total_scheduled_today' => $totalScheduledToday,
                'checked_in_today' => $checkedInToday,
                'on_time_today' => $onTimeToday,
                'late_today' => $lateToday,
                'not_checked_in_today' => $notCheckedInCount,
                'working_now' => $workingNow,
                'finished_working' => $finishedWorking,
                'pending_leaves' => $pendingLeaves,
            ],
            'charts' => [
                'weekly_trend' => $weeklyTrend,
                'punctuality_ratio' => [
                    ['name' => 'Tepat Waktu', 'value' => $onTimeToday, 'color' => '#10B981'],
                    ['name' => 'Terlambat', 'value' => $lateToday, 'color' => '#F59E0B'],
                    ['name' => 'Belum Absen', 'value' => $notCheckedInCount, 'color' => '#9CA3AF'],
                ],
            ],
            'recent_attendances' => $recentAttendances,
            'late_employees' => $lateEmployees,
            'not_checked_in_employees' => $notCheckedInEmployees,
            'shifts' => $allShifts,
            'active_leaves' => $activeLeavesToday,
        ];
    }

    /**
     * Build attendance recap query based on all 11 required filters
     */
    public function getRecapQuery(array $filters = []): Builder
    {
        $query = Attendance::with(['employee', 'schedule.shift', 'corrections.corrector']);

        // 1. Period filter presets
        $period = $filters['period'] ?? null;
        $now = Carbon::now('Asia/Jakarta');

        if ($period === 'today') {
            $query->where('date', $now->toDateString());
        } elseif ($period === 'this_week') {
            $query->whereBetween('date', [$now->startOfWeek()->toDateString(), $now->endOfWeek()->toDateString()]);
        } elseif ($period === 'last_7_days') {
            $query->whereBetween('date', [(clone $now)->subDays(6)->toDateString(), $now->toDateString()]);
        } elseif ($period === 'this_month') {
            $query->whereYear('date', $now->year)->whereMonth('date', $now->month);
        } elseif ($period === 'custom_month' && !empty($filters['month']) && !empty($filters['year'])) {
            $query->whereYear('date', $filters['year'])->whereMonth('date', $filters['month']);
        } elseif ($period === 'year' && !empty($filters['year'])) {
            $query->whereYear('date', $filters['year']);
        } else {
            // Explicit start_date and end_date
            if (!empty($filters['start_date'])) {
                $query->where('date', '>=', $filters['start_date']);
            }
            if (!empty($filters['end_date'])) {
                $query->where('date', '<=', $filters['end_date']);
            }
        }

        // 2. Employee filter (id or search query for name/code)
        if (!empty($filters['employee_id'])) {
            $query->where('employee_id', $filters['employee_id']);
        }

        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $query->whereHas('employee', function ($q) use ($search) {
                $q->where('full_name', 'like', $search)
                  ->orWhere('employee_code', 'like', $search)
                  ->orWhere('position', 'like', $search);
            });
        }

        // 3. Shift filter
        if (!empty($filters['shift_id'])) {
            $query->whereHas('schedule', function ($q) use ($filters) {
                $q->where('shift_id', $filters['shift_id']);
            });
        }

        // 4. Attendance status filter
        if (!empty($filters['status']) && $filters['status'] !== 'all') {
            $query->where('status', $filters['status']);
        }

        // 5. Punctuality filter: on_time vs late
        if (!empty($filters['punctuality'])) {
            if ($filters['punctuality'] === 'on_time') {
                $query->where('status', 'present');
            } elseif ($filters['punctuality'] === 'late') {
                $query->where('status', 'late');
            }
        }

        // Sorting
        $sortField = $filters['sort_by'] ?? 'date';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        if (in_array($sortField, ['date', 'check_in_time', 'check_out_time', 'late_minutes', 'work_duration_minutes', 'status'])) {
            $query->orderBy($sortField, $sortOrder);
        } else {
            $query->orderBy('date', 'desc')->orderBy('check_in_time', 'desc');
        }

        return $query;
    }

    /**
     * Weekly report calculation
     */
    public function getWeeklyReport(string $startDate, string $endDate, array $filters = []): array
    {
        $start = Carbon::parse($startDate, 'Asia/Jakarta');
        $end = Carbon::parse($endDate, 'Asia/Jakarta');

        $filters['start_date'] = $start->toDateString();
        $filters['end_date'] = $end->toDateString();
        unset($filters['period']);

        $attendances = $this->getRecapQuery($filters)->get();

        // Scheduled count
        $scheduleQuery = EmployeeSchedule::whereBetween('schedule_date', [$filters['start_date'], $filters['end_date']])
            ->where('is_day_off', false);
        
        if (!empty($filters['employee_id'])) {
            $scheduleQuery->where('employee_id', $filters['employee_id']);
        }

        $totalScheduled = $scheduleQuery->count();
        $totalAttended = $attendances->whereIn('status', ['present', 'late', 'unscheduled'])->count();
        $onTimeCount = $attendances->where('status', 'present')->count();
        $lateCount = $attendances->where('status', 'late')->count();
        $totalLateMinutes = $attendances->sum('late_minutes');
        $leaveCount = $attendances->where('status', 'on_leave')->count();
        $sickCount = $attendances->where('status', 'sick')->count();
        $absentCount = $attendances->where('status', 'absent')->count();
        $totalDurationMinutes = $attendances->sum('work_duration_minutes');

        $attendancePercentage = $totalScheduled > 0 
            ? round(($totalAttended / $totalScheduled) * 100, 1) 
            : ($totalAttended > 0 ? 100.0 : 0.0);

        // Day by day breakdown
        $days = [];
        $curr = clone $start;
        while ($curr->lte($end)) {
            $dStr = $curr->toDateString();
            $dayAtt = $attendances->where('date', $dStr);
            $days[] = [
                'date' => $dStr,
                'day_name' => $curr->translatedFormat('l'),
                'formatted_date' => $curr->translatedFormat('d M Y'),
                'present' => $dayAtt->where('status', 'present')->count(),
                'late' => $dayAtt->where('status', 'late')->count(),
                'leave' => $dayAtt->whereIn('status', ['on_leave', 'sick'])->count(),
                'absent' => $dayAtt->where('status', 'absent')->count(),
                'total_hours' => round($dayAtt->sum('work_duration_minutes') / 60, 1),
            ];
            $curr->addDay();
        }

        return [
            'start_date' => $start->toDateString(),
            'end_date' => $end->toDateString(),
            'summary' => [
                'total_scheduled' => $totalScheduled,
                'total_attended' => $totalAttended,
                'on_time_count' => $onTimeCount,
                'late_count' => $lateCount,
                'total_late_minutes' => $totalLateMinutes,
                'leave_count' => $leaveCount,
                'sick_count' => $sickCount,
                'absent_count' => $absentCount,
                'total_duration_minutes' => $totalDurationMinutes,
                'total_duration_hours' => round($totalDurationMinutes / 60, 1),
                'attendance_percentage' => $attendancePercentage,
            ],
            'daily_breakdown' => $days,
            'attendances' => $attendances,
        ];
    }

    /**
     * Monthly report calculation with per-employee summary
     */
    public function getMonthlyReport(int $year, int $month, array $filters = []): array
    {
        $startOfMonth = Carbon::createFromDate($year, $month, 1, 'Asia/Jakarta')->startOfMonth();
        $endOfMonth = (clone $startOfMonth)->endOfMonth();

        $startDateStr = $startOfMonth->toDateString();
        $endDateStr = $endOfMonth->toDateString();

        // Get employees query
        $empQuery = Employee::query();
        if (!empty($filters['employee_id'])) {
            $empQuery->where('id', $filters['employee_id']);
        }
        if (!empty($filters['search'])) {
            $search = '%' . trim($filters['search']) . '%';
            $empQuery->where(function ($q) use ($search) {
                $q->where('full_name', 'like', $search)
                  ->orWhere('employee_code', 'like', $search)
                  ->orWhere('position', 'like', $search);
            });
        }
        $employees = $empQuery->orderBy('full_name')->get();

        // Get all schedules in this month
        $schedules = EmployeeSchedule::whereBetween('schedule_date', [$startDateStr, $endDateStr])
            ->where('is_day_off', false)
            ->get();

        // Get all attendances in this month
        $attendances = Attendance::whereBetween('date', [$startDateStr, $endDateStr])->get();

        $employeeRecaps = [];

        $totScheduledAll = 0;
        $totAttendedAll = 0;
        $totOnTimeAll = 0;
        $totLateAll = 0;
        $totLateMinutesAll = 0;
        $totLeaveAll = 0;
        $totSickAll = 0;
        $totAbsentAll = 0;
        $totDurationMinutesAll = 0;

        foreach ($employees as $emp) {
            $empSchedules = $schedules->where('employee_id', $emp->id);
            $empAttendances = $attendances->where('employee_id', $emp->id);

            $scheduledDays = $empSchedules->count();
            $attendedDays = $empAttendances->whereIn('status', ['present', 'late', 'unscheduled'])->count();
            $onTimeDays = $empAttendances->where('status', 'present')->count();
            $lateDays = $empAttendances->where('status', 'late')->count();
            $lateMinutes = (int) $empAttendances->sum('late_minutes');
            $leaveDays = $empAttendances->where('status', 'on_leave')->count();
            $sickDays = $empAttendances->where('status', 'sick')->count();
            $absentDays = $empAttendances->where('status', 'absent')->count();
            $durationMinutes = (int) $empAttendances->sum('work_duration_minutes');

            // Attendance % based on scheduled days per store policy
            $rate = $scheduledDays > 0 
                ? round(($attendedDays / $scheduledDays) * 100, 1) 
                : ($attendedDays > 0 ? 100.0 : 0.0);

            $employeeRecaps[] = [
                'employee_id' => $emp->id,
                'employee_code' => $emp->employee_code,
                'full_name' => $emp->full_name,
                'position' => $emp->position,
                'is_active' => $emp->is_active,
                'scheduled_days' => $scheduledDays,
                'attended_days' => $attendedDays,
                'on_time_days' => $onTimeDays,
                'late_days' => $lateDays,
                'late_minutes' => $lateMinutes,
                'leave_days' => $leaveDays,
                'sick_days' => $sickDays,
                'absent_days' => $absentDays,
                'duration_minutes' => $durationMinutes,
                'duration_formatted' => floor($durationMinutes / 60) . 'j ' . ($durationMinutes % 60) . 'm',
                'attendance_rate' => $rate,
            ];

            $totScheduledAll += $scheduledDays;
            $totAttendedAll += $attendedDays;
            $totOnTimeAll += $onTimeDays;
            $totLateAll += $lateDays;
            $totLateMinutesAll += $lateMinutes;
            $totLeaveAll += $leaveDays;
            $totSickAll += $sickDays;
            $totAbsentAll += $absentDays;
            $totDurationMinutesAll += $durationMinutes;
        }

        $overallRate = $totScheduledAll > 0 
            ? round(($totAttendedAll / $totScheduledAll) * 100, 1) 
            : 0.0;

        // Weekly trends across the month (4-5 weeks)
        $weeklyTrends = [];
        $weekTracker = clone $startOfMonth;
        $weekIndex = 1;
        while ($weekTracker->lte($endOfMonth)) {
            $wStart = clone $weekTracker;
            $wEnd = (clone $weekTracker)->endOfWeek();
            if ($wEnd->gt($endOfMonth)) {
                $wEnd = clone $endOfMonth;
            }

            $wAtt = $attendances->whereBetween('date', [$wStart->toDateString(), $wEnd->toDateString()]);

            $weeklyTrends[] = [
                'week' => 'Minggu ' . $weekIndex,
                'period' => $wStart->format('d M') . ' - ' . $wEnd->format('d M'),
                'present' => $wAtt->where('status', 'present')->count(),
                'late' => $wAtt->where('status', 'late')->count(),
                'leave' => $wAtt->whereIn('status', ['on_leave', 'sick'])->count(),
                'absent' => $wAtt->where('status', 'absent')->count(),
            ];

            $weekTracker = (clone $wEnd)->addDay();
            $weekIndex++;
        }

        return [
            'year' => $year,
            'month' => $month,
            'month_name' => $startOfMonth->translatedFormat('F Y'),
            'summary' => [
                'total_employees' => count($employees),
                'total_scheduled' => $totScheduledAll,
                'total_attended' => $totAttendedAll,
                'total_on_time' => $totOnTimeAll,
                'total_late' => $totLateAll,
                'total_late_minutes' => $totLateMinutesAll,
                'total_leave' => $totLeaveAll,
                'total_sick' => $totSickAll,
                'total_absent' => $totAbsentAll,
                'total_duration_hours' => round($totDurationMinutesAll / 60, 1),
                'overall_attendance_rate' => $overallRate,
            ],
            'employee_recaps' => $employeeRecaps,
            'weekly_trends' => $weeklyTrends,
        ];
    }
}
