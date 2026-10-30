<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\AuditLog;
use App\Models\EmployeeSchedule;
use App\Models\LeaveRequest;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LeaveRequestController extends Controller
{
    public function index(Request $request): Response
    {
        $status = $request->input('status', 'all');
        $search = $request->input('search');

        $query = LeaveRequest::with(['employee', 'approver']);

        if ($status !== 'all') {
            $query->where('status', $status);
        }

        if ($search) {
            $query->whereHas('employee', function ($q) use ($search) {
                $q->where('full_name', 'like', "%{$search}%")
                  ->orWhere('employee_code', 'like', "%{$search}%");
            });
        }

        $leaveRequests = $query->orderByDesc('created_at')->paginate(15)->withQueryString();

        $stats = [
            'pending' => LeaveRequest::where('status', 'pending')->count(),
            'approved' => LeaveRequest::where('status', 'approved')->count(),
            'rejected' => LeaveRequest::where('status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/Leaves/Index', [
            'leaveRequests' => $leaveRequests,
            'filters' => [
                'status' => $status,
                'search' => $search,
            ],
            'stats' => $stats,
        ]);
    }

    public function updateStatus(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'review_notes' => ['nullable', 'string', 'max:500'],
        ]);

        DB::transaction(function () use ($leaveRequest, $validated) {
            $leaveRequest->update([
                'status' => $validated['status'],
                'approved_by' => Auth::id(),
                'review_notes' => $validated['review_notes'],
                'reviewed_at' => Carbon::now('Asia/Jakarta'),
            ]);

            // If approved, update or create attendance records for the leave date range
            if ($validated['status'] === 'approved') {
                $statusType = ($leaveRequest->type === 'sick') ? 'sick' : 'on_leave';
                $curr = Carbon::parse($leaveRequest->start_date);
                $end = Carbon::parse($leaveRequest->end_date);

                while ($curr->lte($end)) {
                    $dateStr = $curr->toDateString();
                    
                    // Find scheduled shift if any
                    $schedule = EmployeeSchedule::where('employee_id', $leaveRequest->employee_id)
                        ->where('schedule_date', $dateStr)
                        ->first();

                    Attendance::updateOrCreate(
                        [
                            'employee_id' => $leaveRequest->employee_id,
                            'date' => $dateStr,
                        ],
                        [
                            'schedule_id' => $schedule?->id,
                            'shift_name' => $schedule?->shift?->name ?? 'Izin Sah',
                            'status' => $statusType,
                            'check_in_notes' => 'Pengajuan Disetujui: ' . $leaveRequest->reason,
                            'late_minutes' => 0,
                            'work_duration_minutes' => 0,
                        ]
                    );

                    $curr->addDay();
                }
            }

            AuditLog::record('leave_status_updated', 'LeaveRequest', $leaveRequest->id, [
                'employee_name' => $leaveRequest->employee?->full_name,
                'status' => $validated['status'],
                'notes' => $validated['review_notes'],
            ]);
        });

        $message = ($validated['status'] === 'approved')
            ? 'Pengajuan izin/sakit berhasil disetujui.'
            : 'Pengajuan izin/sakit telah ditolak.';

        return back()->with('success', $message);
    }
}
