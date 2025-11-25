<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Carbon\Carbon;

//Models:
use App\Models\CrmContact;
use App\Models\CrmContactMessage;
use App\Models\User;

//Traits:
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;
use App\Traits\ModulesTrait;

class WpFormController extends Controller
{
    /**
     * 1. Formulario de contacto.
     * 2. Formulario de newsletter.
     * 3. Formulario Felipao.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $currentCompanyId = 1;

    /**
     * 1. Formulario de contacto.
     */
    public function contact(Request $request, string $lang = 'es')
    {
        // Por si quieres pisarlo con algo que venga en el body:
        $locale = $request->input('lang', $lang);

        $contact_type = 'otrc';

        $name    = trim((string) $request->input('name'));
        $surname = trim((string) $request->input('surname'));
        $email   = trim((string) $request->input('email'));
        $subject = (string) $request->input('subject');
        $message =  (string)$request->input('message');
        //$acceptance = $request->input('acceptance');

        if ($email === '') {
            return response()->json([
                'success' => false,
                'error'   => 'Missing email',
            ], 400);
        }

        // Si quieres rizar un poco el rizo:
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return response()->json([
                'success' => false,
                'error'   => 'Invalid email format',
            ], 400);
        }

        //Verificamos existencia por email:
        $user = User::where('email', trim($email))->first();

        if(!$user){
            $random_password = Str::random(8);

            $user = new User();
            $user->name = $name;
            $user->surname = $surname;
            $user->email = $email;
            $user->password = bcrypt($random_password);
            $user->isAdmin = false;
            $user->status = 0;
            $user->save();
        }

        //Verificamos existencia como contacto:
        $crm_contact = CrmContact::where('company_id', $this->currentCompanyId)
        ->where('user_id', $user->id)
        ->first();

        if(!$crm_contact){
            $crm_contact = new CrmContact();
            $crm_contact->company_id =  $this->currentCompanyId;
            $crm_contact->user_id = $user->id;
            $crm_contact->contact_type = $contact_type;
            $crm_contact->status = 1;
            $crm_contact->acceptance = Carbon::now();
            $crm_contact->save();   
        }

        //Guardamos el mensaje:
        $msg = new CrmContactMessage();
        $msg->crm_contact_id = $crm_contact->id;
        $msg->title = $subject;
        $msg->message = $message;
        $msg->origin = 'Formulario contacto '.$locale;
        $msg->save();

        return response()->json([
            'success' => true
        ], 200);
    }

    /**
     * 2. Formulario de newsletter.
     */
    public function newsletter(Request $request, string $lang = 'es')
    {
        // Por si quieres pisarlo con algo que venga en el body:
        $locale = $request->input('lang', $lang);

        $contact_type = 'newl';

        $name    = trim((string) $request->input('name'));
        $surname = trim((string) $request->input('surname'));
        $email   = trim((string) $request->input('email'));
        $product = (string) $request->input('product');
        $service = (string) $request->input('service');
        //$acceptance = $request->input('acceptance');

        if ($email === '') {
            return response()->json([
                'success' => false,
                'error'   => 'Missing email',
            ], 400);
        }

        // Si quieres rizar un poco el rizo:
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return response()->json([
                'success' => false,
                'error'   => 'Invalid email format',
            ], 400);
        }

        //Verificamos existencia por email:
        $user = User::where('email', trim($email))->first();

        if(!$user){
            $random_password = Str::random(8);

            $user = new User();
            $user->name = $name;
            $user->surname = $surname;
            $user->email = $email;
            $user->password = bcrypt($random_password);
            $user->isAdmin = false;
            $user->status = 0;
            $user->save();
        }

        //Verificamos existencia como contacto:
        $crm_contact = CrmContact::where('company_id', $this->currentCompanyId)
        ->where('user_id', $user->id)
        ->first();

        if(!$crm_contact){
            $crm_contact = new CrmContact();
            $crm_contact->company_id =  $this->currentCompanyId;
            $crm_contact->user_id = $user->id;
            $crm_contact->contact_type = $contact_type;
            $crm_contact->status = 1;
            $crm_contact->acceptance = Carbon::now();
            $crm_contact->save();   
        }

        $message = 'Producto: '.$product.' - Servicio: '.$service;

        //Guardamos el mensaje:
        $msg = new CrmContactMessage();
        $msg->crm_contact_id = $crm_contact->id;
        $msg->title = 'Producto + Servicio';
        $msg->message = $message;
        $msg->origin = 'Formulario newsletter '.$locale;
        $msg->save();
        
        return response()->json([
            'success' => true
        ], 200);
    }

    /**
     * 3. Formulario Felipao.
     */
    public function felipao(Request $request){
        $contact_type = 'otrc';  
        
        $email = $request->input('email');  

        //Verificamos existencia por email:
        $user = User::where('email', trim($email))->first();

        if(!$user){
            $random_password = Str::random(8);

            $user = new User();
            $user->name = 'Anónimo';
            $user->surname = '';
            $user->email = $email;
            $user->password = bcrypt($random_password);
            $user->isAdmin = false;
            $user->status = 0;
            $user->save();
        }

        //Verificamos existencia como contacto:
        $crm_contact = CrmContact::where('company_id', $this->currentCompanyId)
        ->where('user_id', $user->id)
        ->first();

        if(!$crm_contact){
            $crm_contact = new CrmContact();
            $crm_contact->company_id =  $this->currentCompanyId;
            $crm_contact->user_id = $user->id;
            $crm_contact->contact_type = $contact_type;
            $crm_contact->status = 1;
            $crm_contact->acceptance = Carbon::now();
            $crm_contact->save();   
        }

        return response()->json([
            'success' => true
        ], 200);
    }
}
