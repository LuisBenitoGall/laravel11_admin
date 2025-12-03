<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

//Models:
use App\Models\CompanyEmail;

class CompanyEmailController extends Controller
{
    /**
     * 1. Emails por empresa.
     * 2. Guardar email.
     * 3. Actualizar email.
     * 4. Eliminar email.
     * 5. Marcar email principal.
     */
    
    /**
     * 1. Emails por empresa.
     */
    public function getByCompany(Request $request, int $companyId)
    {
        $items = CompanyEmail::where('company_id', $companyId)
            ->orderByDesc('featured')   // principal primero
            ->orderBy('id')
            ->get(['id', 'company_id', 'email', 'featured', 'observations']);

        return response()->json($items);
    }

    /**
     * 2. Guardar email.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'company_id'    => ['required', 'integer', 'exists:companies,id'],
            'email'         => ['required', 'string', 'email', 'max:255'],
            'featured'      => ['nullable', 'boolean'],
            'observations'  => ['nullable', 'string'],
        ]);

        $data['featured'] = !empty($data['featured']);

        DB::transaction(function () use ($data) {
            $email = CompanyEmail::create($data);

            if ($email->featured) {
                CompanyEmail::where('company_id', $email->company_id)
                    ->where('id', '!=', $email->id)
                    ->update(['featured' => false]);
            }
        });

        return back();
    }

    /**
     * 3. Actualizar email.
     */
    public function update(Request $request, CompanyEmail $companyEmail)
    {
        $data = $request->validate([
            'company_id'    => ['required', 'integer', 'exists:companies,id'],
            'email'         => ['required', 'string', 'email', 'max:255'],
            'featured'      => ['nullable', 'boolean'],
            'observations'  => ['nullable', 'string'],
        ]);

        $data['featured'] = !empty($data['featured']);

        DB::transaction(function () use ($companyEmail, $data) {
            $companyEmail->update($data);

            if ($companyEmail->featured) {
                CompanyEmail::where('company_id', $companyEmail->company_id)
                    ->where('id', '!=', $companyEmail->id)
                    ->update(['featured' => false]);
            }
        });

        return back();
    }

    /**
     * 4. Eliminar email.
     */
    public function destroy(CompanyEmail $companyEmail)
    {
        $companyEmail->delete();

        return back();
    }

    /**
     * 5. Marcar email principal.
     */
    public function featured(Request $request)
    {
        $data = $request->validate([
            'email_id'   => ['required', 'integer', 'exists:company_emails,id'],
            'company_id' => ['required', 'integer', 'exists:companies,id'],
        ]);

        $email = CompanyEmail::where('id', $data['email_id'])
            ->where('company_id', $data['company_id'])
            ->firstOrFail();

        DB::transaction(function () use ($email) {
            CompanyEmail::where('company_id', $email->company_id)
                ->update(['featured' => false]);

            $email->update(['featured' => true]);
        });

        return back();
    }
}
