<?php

namespace App\Exceptions;

use Illuminate\Auth\Access\AuthorizationException;
use Inertia\Inertia;
use Throwable;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CustomAuthorizationException extends AuthorizationException{
    public function __construct(string $message = "No tienes permiso para realizar esta acción", int $statusCode = 403, ?Throwable $previous = null) {
        parent::__construct($statusCode, $message, $previous);
    }

    public function render($request): \Symfony\Component\HttpFoundation\Response {
        if ($request->header('X-Inertia')) {
            session()->flash('alert', $this->getMessage());
            return Inertia::location(route('error.403'));
        }

        return redirect()->route('error.403')->with('alert', $this->getMessage());
    }
}

