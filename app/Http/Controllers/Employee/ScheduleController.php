<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\EmployeeSchedule;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    public function index(Request $request): Response
    {
        $employee = Auth::user()->employee;
        if (!$employee) {
            abort(403);
        }

        $startDateStr = $request->input('start_date', Carbon::now('Asia/Jakarta')->startOfWeek()->toDateString());
        $startDate = Carbon::parse($startDateStr, 'Asia/Jakarta')->startOfWeek();
        $endDate = (clone $startDate)->endOfWeek();

        $schedules = EmployeeSchedule::where('employee_id', $employee->id)
            ->whereBetween('schedule_date', [$startDate->toDateString(), $endDate->toDateString()])
            ->with('shift')
            ->get();

        $days = [];
        $tracker = clone $startDate;
        while ($tracker->lte($endDate)) {
            $sch = $schedules->first(fn ($s) => $s->schedule_date->toDateString() === $tracker->toDateString());
            $days[] = [
                'date' => $tracker->toDateString(),
                'day_name' => $tracker->translatedFormat('l'),
                'day_number' => $tracker->format('d'),
                'month_name' => $tracker->translatedFormat('M'),
                'is_today' => $tracker->isToday(),
                'schedule' => $sch,
            ];
            $tracker->addDay();
        }

        return Inertia::render('Employee/Schedules/Index', [
            'days' => $days,
            'periodLabel' => $startDate->translatedFormat('d M Y') . ' - ' . $endDate->translatedFormat('d M Y'),
            'filters' => [
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
            ],
        ]);
    }
}
