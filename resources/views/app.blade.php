<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" 
    data-layout="vertical" 
    data-layout-style="default" 
    data-layout-position="fixed" 
    data-topbar="light" 
    data-sidebar="dark" 
    data-sidebar-size="" 
    data-layout-width="fluid" 
    data-layout-mode="light" 
    data-preloader="disable"
>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        {{-- Favicon básico (fallback) --}}
        <link rel="shortcut icon" href="{{ asset('img/logo/favicon.ico') }}" type="image/x-icon">

        {{-- PNGs más comunes --}}
        <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('img/logo/favicon-32x32.png') }}">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ asset('img/logo/favicon-16x16.png') }}">

        {{-- Apple touch (iOS) --}}
        <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('img/logo/apple-touch-icon.png') }}">

        {{-- Android/Chrome (opcional pero recomendable) --}}
        <link rel="icon" type="image/png" sizes="192x192" href="{{ asset('img/logo/android-chrome-192x192.png') }}">
        <link rel="icon" type="image/png" sizes="512x512" href="{{ asset('img/logo/android-chrome-512x512.png') }}">

        {{-- Safari Pinned Tab (si tienes el SVG monocromo) --}}
        <link rel="mask-icon" href="{{ asset('img/logo/safari-pinned-tab.svg') }}" color="#0d6efd">

        {{-- Windows tiles (opcional) --}}
        <meta name="msapplication-TileColor" content="#0d6efd">

        {{-- Color del tema del navegador (opcional) --}}
        <meta name="theme-color" content="#0d6efd">

        <title inertia>{{ config('app.name', 'CRM RFT') }}</title>

        {{-- Fonts --}}
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        {{-- Scripts --}}
        @routes
        @viteReactRefresh
        {{--  --}}
        @vite([
            "resources/sass/themes.scss",
            "resources/sass/app.scss",
            "resources/js/app.jsx", 
            "resources/js/copyContent.js",
            "resources/js/Pages/{$page['component']}.jsx"
        ])
        @inertiaHead

        {{-- Styles --}}
        <link href="" rel="stylesheet">
    </head>
    
    @if(request()->is('admin/*'))
        <body class="font-sans antialiased">
    @else
        <body data-bs-spy="scroll" data-bs-target="#navbar-example">
    @endif
        @inertia

    </body>
</html>
