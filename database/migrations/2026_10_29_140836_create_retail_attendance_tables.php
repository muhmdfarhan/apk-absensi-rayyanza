<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Employees table
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->unique()->constrained('users')->nullOnDelete();
            $table->string('employee_code')->unique()->index();
            $table->string('full_name')->index();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('position'); // Kasir, Pramuniaga, Staff Gudang, Supervisor, Kepala Toko
            $table->date('join_date');
            $table->boolean('is_active')->default(true)->index();
            $table->string('avatar')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // 2. Shifts table
        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // Shift Pagi, Shift Siang, Shift Malam
            $table->string('code')->unique();
            $table->time('start_time'); // e.g. 08:00:00
            $table->time('end_time');   // e.g. 16:00:00
            $table->unsignedInteger('break_minutes')->default(60);
            $table->unsignedInteger('late_tolerance_minutes')->default(15);
            $table->boolean('is_overnight')->default(false);
            $table->string('color', 20)->default('#1E40AF'); // Navy blue default
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 3. Employee Schedules
        Schema::create('employee_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('shift_id')->nullable()->constrained('shifts')->nullOnDelete();
            $table->date('schedule_date')->index();
            $table->boolean('is_day_off')->default(false);
            $table->string('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['employee_id', 'schedule_date']);
        });

        // 4. Attendances table
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('schedule_id')->nullable()->constrained('employee_schedules')->nullOnDelete();
            $table->date('date')->index();
            // Snapshots of scheduled shift details for historical data integrity
            $table->string('shift_name')->nullable();
            $table->time('scheduled_start_time')->nullable();
            $table->time('scheduled_end_time')->nullable();
            $table->unsignedInteger('late_tolerance_minutes')->default(0);
            $table->dateTime('check_in_time')->nullable();
            $table->dateTime('check_out_time')->nullable();
            $table->enum('status', ['present', 'late', 'absent', 'on_leave', 'sick', 'unscheduled'])->default('present')->index();
            $table->unsignedInteger('late_minutes')->default(0);
            $table->unsignedInteger('work_duration_minutes')->default(0);
            $table->text('check_in_notes')->nullable();
            $table->text('check_out_notes')->nullable();
            $table->string('check_in_ip', 45)->nullable();
            $table->string('check_out_ip', 45)->nullable();
            $table->boolean('is_corrected')->default(false);
            $table->timestamps();

            $table->unique(['employee_id', 'date']);
        });

        // 5. Leave Requests
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->enum('type', ['leave', 'sick', 'other'])->default('leave')->index();
            $table->date('start_date')->index();
            $table->date('end_date')->index();
            $table->text('reason');
            $table->string('attachment')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending')->index();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('review_notes')->nullable();
            $table->dateTime('reviewed_at')->nullable();
            $table->timestamps();
        });

        // 6. Attendance Corrections
        Schema::create('attendance_corrections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('attendance_id')->constrained('attendances')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->foreignId('corrected_by')->constrained('users')->cascadeOnDelete();
            $table->dateTime('previous_check_in')->nullable();
            $table->dateTime('previous_check_out')->nullable();
            $table->string('previous_status');
            $table->dateTime('new_check_in')->nullable();
            $table->dateTime('new_check_out')->nullable();
            $table->string('new_status');
            $table->text('reason'); // Alasan wajib diisi
            $table->timestamps();
        });

        // 7. Audit Logs
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action')->index();
            $table->string('entity_type')->nullable()->index();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('details')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });

        // 8. Store Settings
        Schema::create('store_settings', function (Blueprint $table) {
            $table->id();
            $table->string('store_name')->default('Retail Attendance Management');
            $table->string('store_code')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();
            $table->unsignedInteger('default_tolerance_minutes')->default(15);
            $table->string('timezone')->default('Asia/Jakarta');
            $table->string('logo_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('store_settings');
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('attendance_corrections');
        Schema::dropIfExists('leave_requests');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('employee_schedules');
        Schema::dropIfExists('shifts');
        Schema::dropIfExists('employees');
    }
};
