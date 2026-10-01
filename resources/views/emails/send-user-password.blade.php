<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ __('contrasena_envio') }}</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f5f7;padding:24px 12px;">
    <tr>
        <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
                <tr>
                    <td style="padding:20px 24px;background:#111827;color:#ffffff;font-size:18px;font-weight:bold;">
                        {{ $companyName }}
                    </td>
                </tr>
                <tr>
                    <td style="padding:24px;">
                        <p style="margin:0 0 12px;font-size:16px;">
                            {{ __('usuario_password_email_saludo', ['name' => $usuario]) }}
                        </p>
                        <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#374151;">
                            {{ __('usuario_password_email_intro') }}
                        </p>

                        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;">
                            <tr>
                                <td style="padding:14px 16px;font-size:14px;line-height:1.6;">
                                    <div><strong>{{ __('usuario_password_email_label_email') }}:</strong> {{ $email }}</div>
                                    <div><strong>{{ __('usuario_password_email_label_password') }}:</strong> {{ $password }}</div>
                                </td>
                            </tr>
                        </table>

                        <p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:#374151;">
                            {{ __('usuario_password_email_acceso') }}
                        </p>

                        <p style="margin:0 0 24px;">
                            <a href="{{ $loginUrl }}"
                               style="display:inline-block;padding:10px 18px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:bold;">
                                {{ __('usuario_password_email_boton') }}
                            </a>
                        </p>

                        <p style="margin:0 0 8px;font-size:12px;color:#6b7280;word-break:break-all;">
                            {{ __('usuario_password_email_enlace') }}:<br>
                            <a href="{{ $loginUrl }}" style="color:#2563eb;">{{ $loginUrl }}</a>
                        </p>

                        <p style="margin:16px 0 0;font-size:12px;color:#6b7280;line-height:1.5;">
                            {{ __('usuario_password_email_aviso') }}
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
