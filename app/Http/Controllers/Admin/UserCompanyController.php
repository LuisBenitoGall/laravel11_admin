<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

//Models:
use App\Models\CrmAccount;
use App\Models\CrmContact;
use App\Models\UserCompany;

class UserCompanyController extends Controller{

	/**
	 * 1. Desvincular a usuario de empresa.
	 *
	 * Elimina el pivot user_companies y desvincula el crm_account de los crm_contacts
	 * que apuntaban a cuentas CRM cuyo linked_company_id coincide con la empresa desvinculada.
	 * NO elimina el crm_contact: el contacto sigue visible en el listado CRM sin cuenta asignada.
	 */
	public function destroy(Request $request, UserCompany $uc){
        $userId    = $uc->user_id;
        $companyId = $uc->company_id;

		try {
            $uc->delete();

            // Desvinculación de cuenta CRM: poner crm_account_id a NULL en los contactos
            // relacionados con esta empresa, pero SIN eliminar el crm_contact.
            $accountIds = CrmAccount::where('linked_company_id', $companyId)->pluck('id');
            if ($accountIds->isNotEmpty()) {
                CrmContact::where('user_id', $userId)
                    ->whereIn('crm_account_id', $accountIds)
                    ->update(['crm_account_id' => null]);
            }

            if ($request->header('X-Inertia')) {
                return redirect()->route('users.edit', $userId)
                    ->with('msg', __('empresa_desvinculada_ok'));
            }
            return response()->json(['message' => 'OK']);
        } catch (\Exception $e) {
            if ($request->header('X-Inertia')) {
                return redirect()->back()->with('alert', __('error_eliminar'));
            }
            return response()->json(['message' => 'Error deleting'], 500);
        }
	}

}
