<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login');
        }

        $user = Auth::user();

        // Check if user is active
        if (!$user->is_active) {
            Auth::logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'Akun Anda tidak aktif. Silakan hubungi Administrator.',
            ]);
        }

        // Check if user has one of the allowed roles
        if (!in_array($user->role, $roles)) {
            // If user is admin trying to access employee-only route, redirect to admin dashboard
            if ($user->isAdmin()) {
                return redirect()->route('admin.dashboard');
            }

            // If user is employee trying to access admin-only route, redirect to employee dashboard
            if ($user->isEmployee()) {
                return redirect()->route('employee.dashboard')->with('error', 'Anda tidak memiliki hak akses ke halaman tersebut.');
            }

            abort(403, 'Akses ditolak.');
        }

        return $next($request);
    }
}
