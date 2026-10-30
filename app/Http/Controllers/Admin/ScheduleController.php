<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Employee;
use App\Models\EmployeeSchedule;
use App\Models\Shift;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $startDateStr = $request->input('start_date', Carbon::now('Asia/Jakarta')->startOfWeek()->toDateString());
        $startDate = Carbon::parse($startDateStr, 'Asia/Jakarta')->startOfWeek();
        $endDate = (clone $startDate)->endOfWeek();

        $employeeId = $request->input('employee_id');

        $employeesQuery = Employee::where('is_active', true)->orderBy('full_name');
        if ($employeeId) {
            $employeesQuery->where('id', $employeeId);
        }
        $employees = $employeesQuery->get();

        $shifts = Shift::where('is_active', true)->get();

        // Get schedules in this week
        $schedules = EmployeeSchedule::whereBetween('schedule_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->with(['employee', 'shift'])
            ->get();

        // Build 7 days header
        $days = [];
        $tracker = clone $startDate;
        while ($tracker->lte($endDate)) {
            $days[] = [
                'date' => $tracker->toDateString(),
                'day_name' => $tracker->translatedFormat('l'),
                'day_number' => $tracker->format('d'),
                'month_name' => $tracker->translatedFormat('M'),
                'is_today' => $tracker->isToday(),
            ];
            $tracker->addDay();
        }

        // Build matrix [employee_id => [date => schedule]]
        $matrix = [];
        foreach ($employees as $emp) {
            $empRow = [
                'employee' => $emp,
                'days' => [],
            ];
            foreach ($days as $day) {
                $sch = $schedules->first(fn ($s) => $s->employee_id === $emp->id && $s->schedule_date->toDateString() === $day['date']);
                $empRow['days'][$day['date']] = $sch;
            }
            $matrix[] = $empRow;
        }

        return Inertia::render('Admin/Schedules/Index', [
            'matrix' => $matrix,
            'days' => $days,
            'shifts' => $shifts,
            'allEmployees' => Employee::where('is_active', true)->orderBy('full_name')->get(['id', 'employee_code', 'full_name', 'position']),
            'filters' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'employee_id' => $employeeId,
            ],
            'currentWeekLabel' => $startDate->translatedFormat('d M Y') . ' - ' . $endDate->translatedFormat('d M Y'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'exists:employees,id'],
            'schedule_date' => ['required', 'date'],
            'shift_id' => ['nullable', 'exists:shifts,id'],
            'is_day_off' => ['required', 'boolean'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        if (!$validated['is_day_off'] && empty($validated['shift_id'])) {
            return back()->withErrors(['shift_id' => 'Pilih shift kerja atau tandai sebagai hari libur.']);
        }

        $schedule = EmployeeSchedule::updateOrCreate(
            [
                'employee_id' => $validated['employee_id'],
                'schedule_date' => $validated['schedule_date'],
            ],
            [
                'shift_id' => $validated['is_day_off'] ? null : $validated['shift_id'],
                'is_day_off' => $validated['is_day_off'],
                'notes' => $validated['notes'],
                'created_by' => Auth::id(),
            ]
        );

        AuditLog::record('schedule_assigned', 'EmployeeSchedule', $schedule->id, [
            'employee_id' => $schedule->employee_id,
            'date' => $schedule->schedule_date->toDateString(),
            'shift_id' => $schedule->shift_id,
            'is_day_off' => $schedule->is_day_off,
        ]);

        return back()->with('success', 'Jadwal kerja berhasil disimpan.');
    }

    public function bulkStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_ids' => ['required', 'array', 'min:1'],
            'employee_ids.*' => ['exists:employees,id'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'shift_id' => ['nullable', 'exists:shifts,id'],
            'days_of_week' => ['required', 'array', 'min:1'], // 0=Sunday, 1=Monday, etc.
            'is_day_off' => ['required', 'boolean'],
            'notes' => ['nullable', 'string', 'max:255'],
        ]);

        $start = Carbon::parse($validated['start_date']);
        $end = Carbon::parse($validated['end_date']);
        $selectedDays = array_map('intval', $validated['days_of_week']);
        $shiftId = $validated['is_day_off'] ? null : $validated['shift_id'];

        DB::transaction(function () use ($validated, $start, $end, $selectedDays, $shiftId) {
            foreach ($validated['employee_ids'] as $empId) {
                $curr = clone $start;
                while ($curr->lte($end)) {
                    // Check if current day of week is selected (0=Sunday, 1=Monday...)
                    if (in_array($curr->dayOfWeek, $selectedDays)) {
                        EmployeeSchedule::updateOrCreate(
                            [
                                'employee_id' => $empId,
                                'schedule_date' => $curr->toDateString(),
                            ],
                            [
                                'shift_id' => $shiftId,
                                'is_day_off' => $validated['is_day_off'],
                                'notes' => $validated['notes'],
                                'created_by' => Auth::id(),
                            ]
                        );
                    }
                    $curr->addDay();
                }
            }

            AuditLog::record('bulk_schedules_created', 'EmployeeSchedule', null, [
                'employees_count' => count($validated['employee_ids']),
                'period' => $start->toDateString() . ' - ' . $end->toDateString(),
            ]);
        });

        return back()->with('success', 'Jadwal shift berhasil diterapkan untuk seluruh karyawan terpilih.');
    }

    public function destroy(EmployeeSchedule $schedule): RedirectResponse
    {
        $details = [
            'employee_id' => $schedule->employee_id,
            'date' => $schedule->schedule_date->toDateString(),
            'shift_id' => $schedule->shift_id,
        ];

        $schedule->delete();

        AuditLog::record('schedule_deleted', 'EmployeeSchedule', null, $details);

        return back()->with('success', 'Jadwal shift berhasil dihapus.');
    }
}
