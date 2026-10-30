<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Shift;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ShiftController extends Controller
{
    public function index(): Response
    {
        $shifts = Shift::withCount('schedules')
            ->orderBy('start_time')
            ->get();

        return Inertia::render('Admin/Shifts/Index', [
            'shifts' => $shifts,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:shifts,code'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i'],
            'break_minutes' => ['required', 'integer', 'min:0', 'max:240'],
            'late_tolerance_minutes' => ['required', 'integer', 'min:0', 'max:120'],
            'color' => ['nullable', 'string', 'max:20'],
            'is_active' => ['boolean'],
        ]);

        // Auto-check overnight shift if end_time <= start_time
        $isOvernight = Shift::checkIsOvernight($validated['start_time'], $validated['end_time']);

        $shift = Shift::create([
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'start_time' => $validated['start_time'] . ':00',
            'end_time' => $validated['end_time'] . ':00',
            'break_minutes' => $validated['break_minutes'],
            'late_tolerance_minutes' => $validated['late_tolerance_minutes'],
            'is_overnight' => $isOvernight,
            'color' => $validated['color'] ?: '#1E40AF',
            'is_active' => $validated['is_active'] ?? true,
        ]);

        AuditLog::record('shift_created', 'Shift', $shift->id, [
            'shift_name' => $shift->name,
            'hours' => $shift->start_time . ' - ' . $shift->end_time,
            'is_overnight' => $isOvernight,
        ]);

        return redirect()->route('admin.shifts.index')->with('success', 'Shift kerja berhasil ditambahkan.');
    }

    public function update(Request $request, Shift $shift): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'unique:shifts,code,' . $shift->id],
            'start_time' => ['required'],
            'end_time' => ['required'],
            'break_minutes' => ['required', 'integer', 'min:0', 'max:240'],
            'late_tolerance_minutes' => ['required', 'integer', 'min:0', 'max:120'],
            'color' => ['nullable', 'string', 'max:20'],
            'is_active' => ['boolean'],
        ]);

        // Clean up format H:i
        $startTime = substr($validated['start_time'], 0, 5);
        $endTime = substr($validated['end_time'], 0, 5);
        $isOvernight = Shift::checkIsOvernight($startTime, $endTime);

        $shift->update([
            'name' => $validated['name'],
            'code' => strtoupper($validated['code']),
            'start_time' => $startTime . ':00',
            'end_time' => $endTime . ':00',
            'break_minutes' => $validated['break_minutes'],
            'late_tolerance_minutes' => $validated['late_tolerance_minutes'],
            'is_overnight' => $isOvernight,
            'color' => $validated['color'] ?: '#1E40AF',
            'is_active' => $validated['is_active'] ?? true,
        ]);

        AuditLog::record('shift_updated', 'Shift', $shift->id, [
            'shift_name' => $shift->name,
            'hours' => $shift->start_time . ' - ' . $shift->end_time,
            'is_overnight' => $isOvernight,
        ]);

        return redirect()->route('admin.shifts.index')->with('success', 'Shift kerja berhasil diperbarui.');
    }

    public function toggleActive(Shift $shift): RedirectResponse
    {
        $newStatus = !$shift->is_active;
        $shift->update(['is_active' => $newStatus]);

        AuditLog::record('shift_status_toggled', 'Shift', $shift->id, [
            'shift_name' => $shift->name,
            'is_active' => $newStatus,
        ]);

        $msg = $newStatus ? "Shift {$shift->name} diaktifkan." : "Shift {$shift->name} dinonaktifkan.";
        return back()->with('success', $msg);
    }
}
