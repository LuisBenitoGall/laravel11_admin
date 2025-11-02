<?php   

namespace App\Support;

final class AccountingUsages {
    public static function all(): array {
        return [
            App\Models\CustomerProvider::class => [
                'ar_main'  => ['nature' => 'asset',     'requires' => 'customer',  'reconcile' => false],
                'ar_other' => ['nature' => 'asset',     'requires' => 'customer',  'reconcile' => false],
                'ap_main'  => ['nature' => 'liability', 'requires' => 'provider',  'reconcile' => false],
            ],
            App\Models\BankAccount::class => [
               'bank_gl'  => ['nature' => 'asset',     'reconcile' => true],  // 57*
            ],
            App\Models\TaxRate::class => [
                // context_key = '21','10','4','0'...
                'vat_input'  => ['nature' => 'asset'],     // 472*
                'vat_output' => ['nature' => 'liability'], // 477*
            ],
            App\Models\CostCenter::class => [
               'sales_cc'     => ['nature' => 'income'],  // 700*
               'purchases_cc' => ['nature' => 'expense'], // 600*
            ],
            App\Models\Company::class => [
               'sales_gl'     => ['nature' => 'income'],
               'purchases_gl' => ['nature' => 'expense'],
            ],
        ];
    }
}
