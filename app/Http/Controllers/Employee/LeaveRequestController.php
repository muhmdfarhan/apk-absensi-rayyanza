<?php

namespace App\Http\Controllers\Employee;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\LeaveRequest;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LeaveRequestController extends Controller
{
    public function index(): Response
    {
        $employee = Auth::user()->employee;
        if (!$employee) {
            abort(403);
        }

        $leaveRequests = LeaveRequest::where('employee_id', $employee->id)
            ->with('approver')
            ->orderByDesc('created_at')
            ->paginate(10);

        return Inertia::render('Employee/Leaves/Index', [
            'leaveRequests' => $leaveRequests,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Employee/Leaves/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $employee = Auth::user()->employee;
        if (!$employee) {
            abort(403);
        }

        $validated = $request->validate([
            'type' => ['required', 'in:leave,sick,other'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
            'attachment' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:3072'], // Max 3MB
        ], [
            'type.required' => 'Pilih jenis permohonan.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'end_date.required' => 'Tanggal selesai wajib diisi.',
            'end_date.after_or_equal' => 'Tanggal selesai tidak boleh sebelum tanggal mulai.',
            'reason.required' => 'Alasan wajib diisi.',
            'reason.min' => 'Alasan minimal 5 karakter.',
            'attachment.max' => 'Ukuran file lampiran maksimal 3MB.',
            'attachment.mimes' => 'Format file harus berupa JPG, PNG, atau PDF.',
        ]);

        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('leave_attachments', 'public');
        }

        $leave = LeaveRequest::create([
            'employee_id' => $employee->id,
            'type' => $validated['type'],
            'start_date' => $validated['start_date'],
            'end_date' => $validated['end_date'],
            'reason' => $validated['reason'],
            'attachment' => $attachmentPath,
            'status' => 'pending',
        ]);

        AuditLog::record('leave_requested', 'LeaveRequest', $leave->id, [
            'employee_name' => $employee->full_name,
            'type' => $leave->type,
            'period' => $leave->start_date->toDateString() . ' - ' . $leave->end_date->toDateString(),
        ]);

        return redirect()->route('employee.leaves.index')->with('success', 'Pengajuan izin/sakit berhasil dikirim dan menunggu persetujuan admin.');
    }
}
