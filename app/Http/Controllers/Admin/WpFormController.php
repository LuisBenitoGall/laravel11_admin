<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;
use Carbon\Carbon;

//Models:
use App\Models\CrmContact;
use App\Models\CrmContactMessage;
use App\Models\MarketingList;
use App\Models\MarketingListUser;
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

    /**
     * 4. Nuevo formulario de newsletter (campos field_*).
     * Flujo: usuario (crear si no existe) → contacto CRM → mensaje → lista marketing.
     * En error se registra en log, se notifica al admin si está configurado y se responde 500.
     */
    public function newsletterForm(Request $request, string $lang = 'es')
    {
        $locale = $request->input('lang', $lang);
        $contact_type = 'newl';

        $name    = trim((string) $request->input('field_nombre'));
        $surname = trim((string) $request->input('field_apellidos'));
        $email   = trim((string) $request->input('field_email'));
        $product = (string) $request->input('field_producto');
        $service = (string) $request->input('field_servicio');

        // Validación: respuestas 400 fuera del try (no son "error del proceso")
        if ($email === '') {
            return response()->json([
                'success' => false,
                'error'   => 'Missing email',
            ], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return response()->json([
                'success' => false,
                'error'   => 'Invalid email format',
            ], 400);
        }

        try {
            // 1) Usuario: buscamos por email, si no existe, lo creamos
            $user = User::where('email', $email)->first();

            if (!$user) {
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

            // 2) Contacto CRM: por company_id + user_id
            $crm_contact = CrmContact::where('company_id', $this->currentCompanyId)
                ->where('user_id', $user->id)
                ->first();

            if (!$crm_contact) {
                $crm_contact = new CrmContact();
                $crm_contact->company_id = $this->currentCompanyId;
                $crm_contact->user_id = $user->id;
                $crm_contact->contact_type = $contact_type;
                $crm_contact->status = 1;
                $crm_contact->acceptance = Carbon::now();
                $crm_contact->save();
            }

            // 3) Guardamos el mensaje en formato serializable (usamos JSON sobre TEXT)
            $messagePayload = [
                'producto' => $product,
                'servicio' => $service,
            ];

            $msg = new CrmContactMessage();
            $msg->crm_contact_id = $crm_contact->id;
            $msg->title = 'Newsletter form';
            $msg->message = json_encode($messagePayload, JSON_UNESCAPED_UNICODE);
            $msg->origin = 'Formulario newsletterForm '.$locale;
            $msg->save();

            // 4) Añadimos el contacto a la lista "newsletter-envio" si no estaba
            $marketingList = MarketingList::where('slug', 'newsletter-envio')->first();

            if ($marketingList) {
                $alreadyInList = MarketingListUser::where('marketing_list_id', $marketingList->id)
                    ->where('user_id', $user->id)
                    ->exists();

                if (!$alreadyInList) {
                    $mlu = new MarketingListUser();
                    $mlu->marketing_list_id = $marketingList->id;
                    $mlu->user_id = $user->id;
                    $mlu->save();
                }
            } else {
                Log::warning('Marketing list with slug "newsletter-envio" not found');
            }

            return response()->json([
                'success' => true,
            ], 200);
        } catch (\Throwable $e) {
            $context = [
                'endpoint' => 'wp.newsletter-form',
                'lang'     => $locale,
                'message'  => $e->getMessage(),
                'code'     => $e->getCode(),
                'trace'    => $e->getTraceAsString(),
            ];
            Log::error('WpFormController::newsletterForm failed', $context);

            $notifyEmail = config('wp_forms.error_notify_email');
            if (!empty($notifyEmail)) {
                try {
                    Mail::raw(
                        'Error en formulario WP newsletter-form.' . "\n" .
                        'Fecha: ' . now()->toIso8601String() . "\n" .
                        'Mensaje: ' . $e->getMessage() . "\n" .
                        'Código: ' . $e->getCode() . "\n" .
                        'Revisar el log de la aplicación para más detalle.',
                        function ($message) use ($notifyEmail) {
                            $message->to($notifyEmail)
                                ->subject('[' . config('app.name') . '] Error en formulario WP newsletter-form');
                        }
                    );
                } catch (\Throwable $mailEx) {
                    Log::warning('Could not send WP form error notification email', [
                        'reason' => $mailEx->getMessage(),
                    ]);
                }
            }

            return response()->json([
                'success' => false,
                'error'   => 'An error occurred',
            ], 500);
        }
    }

    
}
