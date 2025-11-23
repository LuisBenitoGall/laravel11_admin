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
        Schema::table('marketing_campaigns', function (Blueprint $table) {
            $table->integer('members_count')->default(0)->after('is_quick');
            $table->integer('send_ok')->default(0)->after('members_count');
            $table->integer('send_ko')->default(0)->after('send_ok');
            $table->string('action')->nullable()->after('send_ko');
            $table->string('priority')->nullable()->after('action');
            $table->string('members_type')->nullable()->after('priority');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('marketing_campaigns', function (Blueprint $table) {
            $table->dropColumn(['members_count', 'send_ok', 'send_ko', 'action', 'priority', 'members_type']);
        });
    }
};
