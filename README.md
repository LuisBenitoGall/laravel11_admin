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

- Normalización y validación de número de teléfono:
	- composer require giggsey/libphonenumber-for-php
	
- Socialite:
  - composer require laravel/socialite
  

## CACHE REDIS:
- Instalación: composer require predis/predis
- Comandos:
	- Ver contenido de la caché del menú: 						redis-cli get secondary_menu_user_($user_id)_company_($company_id)
	- Eliminar manualmente caché: 								redis-cli del secondary_menu_user_($user_id)_company_($company_id)
	- Ver claves de sistema para menu usuarios/empresas: 		redis-cli keys secondary_menu_user_*
	- Listar claves REDIS: 										redis-cli keys *


## COMMANDS:
- Compilación: npm run dev
- Limpieza de caché: composer run dev:reset

Comandos para producción y asegurar que se actualiza public/build
- npm run build
- git add public/build
- git commit -m "Build actualizado"
- git push


## CRONS:
- Ejecutar en local con consola abierta: php artisan schedule:work
- Listar: php artisan schedule:list
- Lanzar: php artisan schedule:run


## COMANDOS IMPORTACIÓN DESDE DYNAMICS 365:
- php artisan crm:import-accounts --dry-run
- php artisan crm:import-accounts

- php artisan crm:import-contacts --dry-run
- php artisan crm:import-contacts

- php artisan crm:import-potential-customers --dry-run
- php artisan crm:import-potential-customers

- php artisan crm:import-marketing-lists --dry-run
- php artisan crm:import-marketing-lists

- php artisan crm:import-campaigns --dry-run
- php artisan crm:import-campaigns

- php artisan crm:import-campaigns-express --dry-run
- php artisan crm:import-campaigns-express

- php artisan crm:import-contacts-extra --dry-run
- php artisan crm:import-contacts-extra

- php artisan crm:import-contacts-year-service

## COMANDOS PROMOCIÓN DYNAMICS 365 --> BD:
- php artisan crm:promote-accounts      !!Asegurarse que se ha hecho la importación de currencies.
- php artisan crm:promote-contacts
- php artisan crm:promote-potential-customers
- php artisan crm:promote-marketing-lists
- php artisan crm:promote-campaigns
- php artisan crm:promote-campaigns-express

  Esta importación debe ejecutarse en este orden, tras promote_marketing_lists:
- php artisan crm:import-marketing-list-members --dry-run
- php artisan crm:import-marketing-list-members

- php artisan crm:promote-marketing-list-members

- php artisan crm:promote-contacts-extra --company=1
- php artisan crm:promote-contacts-extra --company=1 --dry-run

- php artisan crm:promote-contacts-year-service


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


## GIT:
	- Limpiar archivos para mergear en producción:
		git reset --hard
		git clean -fd


## GOOGLE CLOUD:
  - project: myERP
  - ID del proyecto: myerp-483618
  - Nº de proyecto: 465641513188
  - API: Google Calendar


## QUERIES:
- listado de contactos por cuentas:
SELECT 
    u.name,
    u.surname,
    u.email AS main_email,
    u.nif,
    cc.position,
    cc.department,
    ca.name AS account,
    GROUP_CONCAT(ue.email SEPARATOR ', ') AS secondary_emails
FROM crm_contacts AS cc
JOIN users u
    ON cc.user_id = u.id
LEFT JOIN user_emails ue
    ON u.id = ue.user_id
LEFT JOIN crm_accounts ca
    ON cc.crm_account_id = ca.id
GROUP BY 
    u.id, u.name, u.surname, u.email,
    cc.position, cc.department,
    ca.name
ORDER BY u.name ASC;





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