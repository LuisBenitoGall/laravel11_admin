<?php

namespace App\Http\Requests\Auth;

use Illuminate\Http\Request;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

//Models:
use App\Models\CompanyModule;
use App\Models\CompanySetting;
// use App\Models\Employee;
use App\Models\Module;
use App\Models\UserCompany;

//Services:
use App\Services\RecaptchaService;

class LoginRequest extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool{
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\Rule|array|string>
     */
    public function rules(): array
    {
        $recaptchaRules = config('security.strict_auth')
        ? ['required', 'string']
        : ['nullable', 'string'];

        return [
            'email'             => ['required', 'string', 'email'],
            'password'          => ['required', 'string'],
            'remember'          => ['sometimes', 'boolean'],
            'recaptcha_token'   => $recaptchaRules
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void{
        $this->ensureIsNotRateLimited();

        if (! Auth::attempt($this->only('email', 'password'), $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => trans('auth.failed'),
            ]);
        }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void{
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string{
        return Str::transliterate(Str::lower($this->string('email')).'|'.$this->ip());
    }

    /** 
     * Logout.
     */
    public function logout(Request $request) {
        Auth::logout(); // Llama al método de logout de Laravel
        $request->session()->invalidate();
        $request->session()->regenerateToken();
 
        return redirect('/'); // Redirige a la página de inicio o a donde desees
    }

    public function passedValidation(): void
    {
        if (! config('security.strict_auth')) {
            // En local / modo no estricto, saltamos reCAPTCHA
            return;
        }

        /** @var RecaptchaService $recaptcha */
        $recaptcha = app(RecaptchaService::class);

        $token = $this->input('recaptcha_token');
        $score = $recaptcha->verify($token, 'login');

        $minScore = (float) config('services.recaptcha.min_score', 0.5);

        if (is_null($score) || $score < $minScore) {
            throw ValidationException::withMessages([
                'email' => [__('No se ha podido validar la solicitud. Inténtalo de nuevo.')],
            ]);
        }
    }

}
