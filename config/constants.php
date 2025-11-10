<?php 

return [
    'CURRENCY_' => '€',
    'CURRENCY_NAME_' => 'EUR',
    'EMAIL_' => 'luisbgall@gmail.com',
    'ERROR_MAX_403_' => 10,
    'MENU_CHAT_' => false,
    'MENU_CUSTOM_' => true,
    'MENU_LOCALES_' => false,
    'MENU_NOTIFICATIONS_' => false,
	'METHODS_' => [
        ['index', 'Ver '], 
        ['create', 'Crear '], 
        ['show', 'Mostrar '], 
        ['search', 'Buscar '], 
        ['edit', 'Editar '], 
        ['update', 'Actualizar '],
        ['destroy', 'Eliminar ']
    ],
    'PERMISSIONS_OFF_' => ['accounts', 'modules', 'permissions', 'currencies', 'banks', 'countries', 'contents', 'units'],    //Permisos exclusivos para los Super Admin.
    'ROLE_INVITADO_' => 2,          //para usuarios NO Admin
    'ROLE_INVITADO_NAME_' => 'Invitado',
	'ROLE_SUPERADMIN_' => 1,        //id role con permisos absolutos (extraído de la tabla 'roles').
	'RECORDS_PER_PAGE_DEFAULT_' => 10,
	'SUPER_ADMIN_' => 'Super Admin',
	'UNDEFINED_DATE_' => '9999-12-31',
];
?>