<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration{
    public function up(): void{
        Schema::create('company_accounts', function (Blueprint $table) {
            $table->id();

            // Empresa titular
            $table->foreignId('company_id')
                  ->constrained('companies')
                  ->cascadeOnDelete();

            // Empresa tutora (opcional)
            $table->foreignId('guardian')
                  ->nullable()
                  ->constrained('companies')
                  ->nullOnDelete();

            // Tipo de cuenta (maestro)
            $table->foreignId('account_id')
                  ->constrained('accounts')
                  ->restrictOnDelete();

            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();

            $table->decimal('price', 9, 2)->default(0);
            $table->date('payment_date')->nullable();

            // 0=inactivo, 1=activo, 2=caducado
            $table->unsignedTinyInteger('status')->default(1);

            $table->softDeletes();
            $table->timestamps();

            // Índices para consultas frecuentes
            $table->index('company_id',     'company_accounts_company_id_index');
            $table->index('guardian',       'company_accounts_guardian_index');
            $table->index('account_id',     'company_accounts_account_id_index');
            $table->index('status',         'company_accounts_status_index');
            $table->index('payment_date',   'company_accounts_payment_date_index');
            $table->index(['company_id','status'], 'company_accounts_company_status_index');
            $table->index(['company_id','end_date'], 'company_accounts_company_end_index');
            $table->index(['start_date','end_date'], 'company_accounts_range_index');
            $table->index('deleted_at',     'company_accounts_deleted_at_index');
        });

        // CHECK opcional (si tu motor lo soporta)
        try {
            DB::statement("ALTER TABLE company_accounts ADD CONSTRAINT chk_company_accounts_status CHECK (status IN (0,1,2))");
        } catch (\Throwable $e) {}
    }

    public function down(): void{
        try { DB::statement("ALTER TABLE company_accounts DROP CONSTRAINT chk_company_accounts_status"); } catch (\Throwable $e) {}
        Schema::dropIfExists('company_accounts');
    }
};
