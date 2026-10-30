<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\StoreSetting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StoreSettingController extends Controller
{
    public function edit(): Response
    {
        $setting = StoreSetting::current();

        return Inertia::render('Admin/Settings/Edit', [
            'setting' => $setting,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $setting = StoreSetting::current();

        $validated = $request->validate([
            'store_name' => ['required', 'string', 'max:255'],
            'store_code' => ['nullable', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'default_tolerance_minutes' => ['required', 'integer', 'min:0', 'max:120'],
            'timezone' => ['required', 'string', 'max:50'],
        ]);

        $setting->update($validated);

        AuditLog::record('settings_updated', 'StoreSetting', $setting->id, $validated);

        return back()->with('success', 'Pengaturan toko berhasil diperbarui.');
    }
}
