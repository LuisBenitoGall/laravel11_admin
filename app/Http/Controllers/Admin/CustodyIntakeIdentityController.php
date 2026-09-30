<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CustodyIntakeEnsureRequest;
use App\Http\Requests\CustodyIntakeSearchRequest;
use App\Http\Requests\CustodyIntakeStoreRequest;
use App\Models\Company;
use App\Models\User;
use App\Services\CustodyIntakeIdentityCreate;
use App\Services\CustodyIntakeIdentityResolver;
use App\Services\EnsureSessionProviderCustomer;
use App\Support\CompanyContext;
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CustodyIntakeIdentityController extends Controller
{
    use HasUserPermissionsTrait;
    use LocaleTrait;

    protected array $permissions = [];

    public function __construct()
    {
        if (session('currentCompany')) {
            $this->permissions = $this->resolvePermissions([
                'customers.create',
                'users.create',
            ]);
        }
    }

    public function index(Request $request): Response
    {
        $this->assertCanAccess();
        $this->assertCompanySession();

        return Inertia::render('Admin/Logistics/IntakeIdentity', [
            'title' => __('intake_identity_titulo'),
            'subtitle' => __('intake_identity_subtitulo'),
            'permissions' => $this->permissions,
            'availableLocales' => LocaleTrait::availableLocales(),
            'form' => [
                'type' => $request->input('type', 'company'),
                'email' => $request->input('email', ''),
                'nif' => $request->input('nif', ''),
            ],
            'result' => null,
        ]);
    }

    public function search(
        CustodyIntakeSearchRequest $request,
        CustodyIntakeIdentityResolver $resolver
    ): Response {
        $this->assertCompanySession();

        $type = $request->validated('type');
        $result = $resolver->search(
            $type,
            $request->input('email'),
            $request->input('nif')
        );

        return Inertia::render('Admin/Logistics/IntakeIdentity', [
            'title' => __('intake_identity_titulo'),
            'subtitle' => __('intake_identity_subtitulo'),
            'permissions' => $this->permissions,
            'availableLocales' => LocaleTrait::availableLocales(),
            'form' => [
                'type' => $type,
                'email' => (string) $request->input('email', ''),
                'nif' => (string) $request->input('nif', ''),
            ],
            'result' => $result,
        ]);
    }

    public function ensure(
        CustodyIntakeEnsureRequest $request,
        EnsureSessionProviderCustomer $ensure
    ) {
        $this->assertCompanySession();

        $type = $request->validated('type');
        $id = (int) $request->validated('id');

        if ($type === 'company') {
            Company::query()->findOrFail($id);
            $relation = $ensure->ensureCompany($id);
        } else {
            User::query()->findOrFail($id);
            $relation = $ensure->ensureUser($id);
        }

        return redirect()
            ->route('logistics.intake-identity')
            ->with('msg', __('intake_identity_asegurado_msg'))
            ->with('intake_relation_id', $relation->id);
    }

    public function store(
        CustodyIntakeStoreRequest $request,
        CustodyIntakeIdentityCreate $create
    ) {
        $this->assertCompanySession();

        $type = $request->validated('type');
        $input = $request->only(['name', 'email', 'nif']);

        if ($type === 'company') {
            $out = $create->createCompany($input);
            $relationId = $out['relation']->id;
        } else {
            $out = $create->createUser($input);
            $relationId = $out['relation']->id;
        }

        return redirect()
            ->route('logistics.intake-identity')
            ->with('msg', __('intake_identity_creado_msg'))
            ->with('intake_relation_id', $relationId);
    }

    private function assertCanAccess(): void
    {
        $user = auth()->user();
        abort_unless(
            $user && ($user->can('customers.create') || $user->can('users.create')),
            403
        );
    }

    private function assertCompanySession(): void
    {
        $id = (int) app(CompanyContext::class)->id();
        abort_unless($id > 0, 403, __('empresa_sesion_requerida'));
    }
}
