# PROJECT

Real Fábrica de Tapices (RFT)

## Requisitos
- Laravel 11 + React JS
- PHP >= 8.1
- Composer
- MySQL
- Node.js y npm

# README #



## DISEÑO XD:
https://xd.adobe.com/view/b64cfd62-5461-46ee-a01e-56917fe713c7-e31f/

## CONSTANTS:
En el archivo config/constants.php se definen constantes personalizadas.

## LIBRARIES:
- SweetAlert2. Se implementa como hook:
	- npm install sweetalert2

- Jenssegers:
	- url: https://github.com/jenssegers/agent
	- composer require jenssegers/agent

- Date Picker:
	- npm install react-datepicker
	- traducciones: npm install date-fns --> npm install date-fns/locale

- Color Picker:
	- npm install react-color

- React Select:
	- npm install react-select
	
- Spatie:
	- composer require spatie/laravel-permission
    - php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
    - php artisan migrate

- PDF + Excel + descarga de archivos:
	- npm install jspdf jspdf-autotable xlsx exceljs file-saver

- Textarea WYSIWYG:
	- React Draft Wysiwyg: npm install react-draft-wysiwyg draft-js
	- npm install draftjs-to-html
	- integrar css en .vite: import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

- HTML to Draft JS para Textarea WYSIWYG:
	- npm install html-to-draftjs draftjs-to-html draft-js react-draft-wysiwyg



## CACHE REDIS:
- Comandos:
	- Ver contenido de la caché del menú: 						redis-cli get secondary_menu_user_($user_id)_company_($company_id)
	- Eliminar manualmente caché: 								redis-cli del secondary_menu_user_($user_id)_company_($company_id)
	- Ver claves de sistema para menu usuarios/empresas: 		redis-cli keys secondary_menu_user_*
	- Listar claves REDIS: 										redis-cli keys *


## COMMANDS:
- Compilación: npm run dev
- Limpieza de caché: composer run dev:reset


## CRONS:
- Ejecutar en local con consola abierta: php artisan schedule:work
- Listar: php artisan schedule:list
- Lanzar: php artisan schedule:run



## IA CHAT GPT. Indicaciones para la réplica de elementos en el proyecto.

- Para tablas:
	    Nombre del modelo (por ejemplo: users, productos, categorías)

	    Campos que deben mostrarse en la tabla

	        key: clave de acceso

	        label: nombre a mostrar (con traducción si la tienes)

	        sort: true o false

	        filter: 'text', 'select', 'date', etc.

	        placeholder: si es necesario

	        options: si el filtro es select

		Y si alguna columna necesita algo especial (íconos, badges, enlaces, etc.), lo añadimos sin problema.

## IA CODEX.
	- Snippet cabecera prompts: estilo Laravel 11 + PHP 8.2 + Pint/Larastan level X






This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* Summary of set up
* Configuration
* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact