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

        <title inertia>{{ config('app.name', 'Radnify') }}</title>

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
