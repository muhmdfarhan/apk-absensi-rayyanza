<?php

namespace Tests\Feature;

use App\Models\Employee;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RoleAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
    }

    public function test_guest_is_redirected_to_login_when_accessing_admin_dashboard(): void
    {
        $response = $this->get('/admin/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_guest_is_redirected_to_login_when_accessing_employee_dashboard(): void
    {
        $response = $this->get('/employee/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_admin_can_access_admin_dashboard(): void
    {
        $admin = User::where('role', 'admin')->first();
        $response = $this->actingAs($admin)->get('/admin/dashboard');
        $response->assertStatus(200);
    }

    public function test_admin_cannot_access_employee_dashboard(): void
    {
        $admin = User::where('role', 'admin')->first();
        $response = $this->actingAs($admin)->get('/employee/dashboard');
        // Admin accessing employee routes is redirected to admin dashboard
        $response->assertRedirect(route('admin.dashboard'));
    }

    public function test_employee_can_access_employee_dashboard(): void
    {
        $employeeUser = User::where('role', 'employee')->first();
        $response = $this->actingAs($employeeUser)->get('/employee/dashboard');
        $response->assertStatus(200);
    }

    public function test_employee_cannot_access_admin_dashboard(): void
    {
        $employeeUser = User::where('role', 'employee')->first();
        $response = $this->actingAs($employeeUser)->get('/admin/dashboard');
        // Employee accessing admin routes is redirected to employee dashboard with error flash
        $response->assertRedirect(route('employee.dashboard'));
        $response->assertSessionHas('error');
    }

    public function test_employee_cannot_access_admin_employee_management(): void
    {
        $employeeUser = User::where('role', 'employee')->first();
        $response = $this->actingAs($employeeUser)->get('/admin/employees');
        $response->assertRedirect(route('employee.dashboard'));
        $response->assertSessionHas('error');
    }
}
