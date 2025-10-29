<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

//Models:
use App\Models\Module;

class ModulesTableSeeder extends Seeder{
    /**
     * Run the database seeds.
     *
     * @return void
     * Levels: 1 = administrador; 2 = básicos; 3 = optativos.
     */
    public function run(){
        $data = [
            ['name' => 'dashboard',
            'slug' => 'dashboard',
            'label' => 'dashboard',
            'color' => '#e37f7f',
            'icon' => 'bars',
            'level' => '2',
            'translations' => serialize(['es' => 'Dashboard']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'settings',
            'slug' => 'settings',
            'label' => 'configuracion',
            'color' => '#A13B3B',
            'icon' => 'cog',
            'level' => '1',
            'translations' => serialize(['es' => 'Configuración']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'account',
            'slug' => 'account',
            'label' => 'cuenta',
            'color' => '#f5961f',
            'icon' => 'user-circle',
            'level' => '2',
            'translations' => serialize(['es' => 'Cuenta']),
            'status' => 1,
            'active' => true
            ],
            ['name' => 'users',
            'slug' => 'users',
            'label' => 'usuarios',
            'color' => '#2AAAB2',
            'icon' => 'users',
            'level' => '2',
            'translations' => serialize(['es' => 'Usuarios']),
            'status' => 1,
            'active' => true
            ],
            ['name' => 'companies',
            'slug' => 'companies',
            'label' => 'empresas',
            'color' => '#1fd3e1',
            'icon' => 'building',
            'level' => '2',
            'translations' => serialize(['es' => 'Empresas']),
            'status' => 1,
            'active' => true
            ],
            ['name' => 'rrhh',
            'slug' => 'rrhh',
            'label' => 'rrhh',
            'color' => '#8DDE95',
            'icon' => 'user-shield',
            'level' => '3',
            'translations' => serialize(['es' => 'RRHH']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'crm',
            'slug' => 'crm',
            'label' => 'crm',
            'color' => '#5DAE65',
            'icon' => 'address-book',
            'level' => '3',
            'translations' => serialize(['es' => 'CRM']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'products',
            'slug' => 'products',
            'label' => 'catalogo',
            'color' => '#99EBEA',
            'icon' => 'gift',
            'level' => '3',
            'translations' => serialize(['es' => 'Catálogo']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'stocks',
            'slug' => 'stocks',
            'label' => 'stocks',
            'color' => '#F7568F',
            'icon' => 'database',
            'level' => '3',
            'translations' => serialize(['es' => 'Stocks']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'production',
            'slug' => 'production',
            'label' => 'produccion',
            'color' => '#DED58D',
            'icon' => 'industry',
            'level' => '3',
            'translations' => serialize(['es' => 'Producción']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'budgets',
            'slug' => 'budgets',
            'label' => 'presupuestos',
            'color' => '#F4BE84',
            'icon' => 'file-alt',
            'level' => '3',
            'translations' => serialize(['es' => 'Presupuestos']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'orders',
            'slug' => 'orders',
            'label' => 'pedidos',
            'color' => '#F8EB7F',
            'icon' => 'shopping-cart',
            'level' => '3',
            'translations' => serialize(['es' => 'Pedidos']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'cash',
            'slug' => 'cash',
            'label' => 'caja',
            'color' => '#124271',
            'icon' => 'cash-register',
            'level' => '3',
            'translations' => serialize(['es' => 'Caja']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'sat',
            'slug' => 'sat',
            'label' => 'SAT',
            'color' => '#66CC66',
            'icon' => 'wrench',
            'level' => '3',
            'translations' => serialize(['es' => 'SAT']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'projects',
            'slug' => 'projects',
            'label' => 'proyectos',
            'color' => '#DD91F9',
            'icon' => 'rocket',
            'level' => '3',
            'translations' => serialize(['es' => 'Proyectos']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'logistics',
            'slug' => 'logistics',
            'label' => 'logistica',
            'color' => '#83A8EC',
            'icon' => 'truck',
            'level' => '3',
            'translations' => serialize(['es' => 'Logística']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'accounting',
            'slug' => 'accounting',
            'label' => 'contabilidad',
            'color' => '#98571D',
            'icon' => 'money-bill-alt',
            'level' => '3',
            'translations' => serialize(['es' => 'Contabilidad']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'quality',
            'slug' => 'quality',
            'label' => 'calidad',
            'color' => '#60A433',
            'icon' => 'check',
            'level' => '3',
            'translations' => serialize(['es' => 'Calidad']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'schedule',
            'slug' => 'schedule',
            'label' => 'agenda',
            'color' => '#DE8D8D',
            'icon' => 'calendar-check',
            'level' => '3',
            'translations' => serialize(['es' => 'Agenda']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'calendar',
            'slug' => 'calendar',
            'label' => 'calendario',
            'color' => '#6633CC',
            'icon' => 'calendar-alt',
            'level' => '3',
            'translations' => serialize(['es' => 'Calendario']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'timetables',
            'slug' => 'timetables',
            'label' => 'horarios',
            'color' => '#CCCC33',
            'icon' => 'clock',
            'level' => '3',
            'translations' => serialize(['es' => 'Horarios']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'teams',
            'slug' => 'teams',
            'label' => 'equipos',
            'color' => '#DD6633',
            'icon' => 'user-friends',
            'level' => '3',
            'translations' => serialize(['es' => 'Equipos']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'quizzes',
            'slug' => 'quizzes',
            'label' => 'concursos',
            'color' => '#3366DD',
            'icon' => 'puzzle-piece',
            'level' => '3',
            'translations' => serialize(['es' => 'Concursos']),
            'status' => 0,
            'active' => true
            ],
            ['name' => 'procedures',
            'slug' => 'procedures',
            'label' => 'procedimientos',
            'color' => '#e0e610',
            'icon' => 'sitemap',
            'level' => '3',
            'translations' => serialize(['es' => 'Procedimientos']),
            'status' => 0,
            'active' => true
            ]           
        ];

        foreach($data as $value){
            if($value['active']){
                $module = new Module();
                $module->name = $value['name'];
                $module->slug = $value['slug'];
                $module->label = $value['label'];
                $module->color = $value['color'];
                $module->icon = $value['icon'];
                $module->level = $value['level'];
                $module->status = $value['status'];
                $module->save();
            }
        }       
    }
}
