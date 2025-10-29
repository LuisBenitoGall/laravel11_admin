<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Helpers\helpers;

//Models:
use App\Models\AccountingAccountType;

class AccountingAccountTypesTableSeeder extends Seeder{
    /**
     * Run the database seeds.
     *
     * Clasificación obtenida del Plan General de Contabilidad: https://www.plangeneralcontable.com/?tit=listado-de-contenidos&name=GeTia&contentId=mod_list&contGroupId=ctg_25
     *
     * @return void
     */
    public function run(){
        $data = [
            1 => [
                'name' => ucfirst(trans('fiscal.financiacion_basica')),
                'group' => false,
                'level2' =>  [
                    '0' => [
                        'name' => ucfirst(trans('fiscal.capital')),
                        'group' => 'p',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.capital_social')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.fondo_social')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.capital')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.socios_desembolsos_no_exigidos')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.socios_desembolsos_no_exigidos_capital_social')),
                                        'group' => false
                                    ],
                                    '4' => [
                                        'name' => ucfirst(trans('fiscal.socios_desembolsos_no_exigidos_pendiente_inscripcion')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.socios_aportaciones_no_dinerarias_pendientes')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.socios_aportaciones_no_dinerarias_pendientes_capital_social')),
                                        'group' => false
                                    ],
                                    '4' => [
                                        'name' => ucfirst(trans('fiscal.socios_aportaciones_no_dinerarias_pendientes_capital_pendiente_inscripcion')),
                                        'group' => false
                                    ],
                                ]
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.acciones_participaciones_propias_situaciones_especiales')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.acciones_participaciones_propias_reduccion_capital')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '1' => [
                        'name' => ucfirst(trans('fiscal.reservas')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.prima_emision_asuncion')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.patrimonio_neto_emision_instrumentos_financieros_compuestos')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.patrimonio_neto_emision_instrumentos_financieros_compuestos')),
                                        'group' => false
                                    ],
                                    '1' => [
                                        'name' => ucfirst(trans('fiscal.resto_instrumentos_patrimonio_neto')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.reserva_legal')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.reservas_voluntarias')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.reservas_especiales')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.reservas_acciones_participaciones_sociedad_dominante')),
                                        'group' => false
                                    ],
                                    '1' => [
                                        'name' => ucfirst(trans('fiscal.reservas_estatutarias')),
                                        'group' => false
                                    ],
                                    '2' => [
                                        'name' => ucfirst(trans('fiscal.reserva_capital_amortizado')),
                                        'group' => false
                                    ],
                                    '3' => [
                                        'name' => ucfirst(trans('fiscal.reserva_fondo_comercio')),
                                        'group' => false
                                    ],
                                    '4' => [
                                        'name' => ucfirst(trans('fiscal.reserva_acciones_propias')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.reserva_perdidas_ganancias_actuariales')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.aportaciones_socios_propietarios')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.diferencias_ajuste_capital_euros')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '2' => [
                        'name' => ucfirst(trans('fiscal.resultado_pendientes_aplicacion')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.remanente')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.resultados_negativos_ejercicios_anteriores')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.resultados_ejercicio')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '3' => [
                        'name' => ucfirst(trans('fiscal.subvenciones_donaciones_ajustes_cambio_valor')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.subvenciones_oficiales_capital')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.donaciones_legados_capital')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.otras_subvenciones_donaciones_legados')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.ajustes_valoracion_instrumentos_financieros')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.operaciones_cobertura')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.cobertura_flujos_efectivo')),'group' => false
                                    ],
                                    '1' => [
                                        'name' => ucfirst(trans('fiscal.cobertura_inversion_neta_negocio_extranjero')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.diferencias_conversion')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.ajustes_valoracion_activos_no_corrientes')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.ingresos_fiscales_varios_ejercicios')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.ingresos_fiscales_diferencias_permanentes')),
                                        'group' => false
                                    ],
                                    '1' => [
                                        'name' => ucfirst(trans('fiscal.ingresos_fiscales_deducciones_bonificaciones')),
                                        'group' => false
                                    ],
                                ]
                            ]
                        ]
                    ],
                    '4' => [
                        'name' => ucfirst(trans('fiscal.provisiones')),
                        'group' => 'p',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.provision_retribuciones')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.provision_impuestos')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.provision_responsabilidades')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.provision_desmantelamiento')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.provision_actuaciones')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.provision_reestructuraciones')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.provisiones_transacciones')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '5' => [
                        'name' => ucfirst(trans('fiscal.deudas_largo_plazo')),
                        'group' => 'p',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.acciones_largo_plazo_pasivo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.desembolsos_no_exigidos_participaciones_pasivo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.aportaciones_participaciones_pasivo')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '6' => [
                        'name' => ucfirst(trans('fiscal.deudas_largo_plazo_vinculadas')),
                        'group' => 'p',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.deudas_largo_plazo_entidades_vinculadas')),
                                'group' => 'p',
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.proveedores_inmovilizado_largo_plazo_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.acreedores_arrendamiento_financiero_largo_plazo_vinculadas')),
                                'group' => 'p',
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.otras_deudas_largo_plazo_vinculadas')),
                                'group' => false,
                                'level4' => [
                                    '3' => [
                                        'name' => ucfirst(trans('fiscal.otras_deudas_grupo')),
                                        'group' => false
                                    ],
                                    '4' => [
                                        'name' => ucfirst(trans('fiscal.otras_deudas_asociadas')),
                                        'group' => false
                                    ],
                                    '5' => [
                                        'name' => ucfirst(trans('fiscal.otras_deudas_vinculadas')),
                                        'group' => false
                                    ]
                                ]
                            ]
                        ]
                    ],
                    '7' => [
                        'name' => ucfirst(trans('fiscal.deudas_largo_plazo_recibidos')),
                        'group' => 'p',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.deudas_entidades_credito')),
                                'group' => 'p',
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.deudas_a_largo_plazo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.deudas_transformables_subvenciones')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.proveedores_inmovilizado_largo_plazo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.acreedores_arrendamiento_financiero_largo_plazo')),
                                'group' => 'p',
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.efectos_pagar_largo_plazo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.pasivos_derivados_financieros_largo_plazo')),
                                'group' => false,
                                'level4' => [
                                    '5' => [
                                        'name' => ucfirst(trans('fiscal.pasivos_derivados_financieros_largo_plazo_cartera_negociación')),
                                        'group' => false
                                    ],
                                    '8' => [
                                        'name' => ucfirst(trans('fiscal.pasivos_derivados_financieros_largo_plazo_instrumentos_cobertura')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.obligaciones_bonos')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.obligaciones_bonos_convertibles')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.deudas_representadas_valores_negociables')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '8' => [
                        'name' => ucfirst(trans('fiscal.fianzas_depositos_largo_plazo')),
                        'group' => 'p',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.fianzas_largo_plazo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.anticipos_ventas_prestaciones_servicios_largo_plazo')),
                                'group' => 'p',
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.depositos_largo_plazo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.garantias_financieras_largo_plazo')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '9' => [
                        'name' => ucfirst(trans('fiscal.situaciones_transitorias_financiacion')),
                        'group' => 'p',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.acciones_participaciones_emitidas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.suscriptores_acciones')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.capital_pendiente_inscripcion')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.acciones_participaciones_pasivos_financieros')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.suscriptores_pasivos_financieros')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.acciones_pasivos_financieros_pendientes_inscripcion')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ]
                ],
            ],
            2 => [
                'name' => ucfirst(trans('fiscal.inmovilizado')),
                'group' => false,
                'level2' =>  [
                    '0' => [
                        'name' => ucfirst(trans('fiscal.inmovilizaciones_intangibles')),
                        'group' => 'a',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.gastos_investigacion')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.desarrollo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.concesiones_administrativas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.propiedad_industrial')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.fondo_comercio')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.derechos_traspaso')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.aplicaciones_informaticas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.anticipos_inmovilizaciones_intangibles')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '1' => [
                        'name' => ucfirst(trans('fiscal.inmovilizaciones_materiales')),
                        'group' => 'a',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.terrenos_bienes_naturales')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.construcciones')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.instalaciones_tecnicas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.maquinaria')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.utillaje')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.otras_instalaciones')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.mobiliario')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.equipos_procesos_informacion')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.elementos_transporte')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.otro_inmovilizado_material')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '2' => [
                        'name' => ucfirst(trans('fiscal.inversiones_inmobiliarias')),
                        'group' => 'a',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.inversiones_terrenos_bienes_naturales')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.inversiones_construcciones')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '3' => [
                        'name' => ucfirst(trans('fiscal.inmovilizaciones_materiales_curso')),
                        'group' => 'a',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.adaptacion_terrenos_bienes_naturales')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.construcciones_curso')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.instalaciones_tecnicas_montaje')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.maquinaria_montaje')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.equipos_procesos_informacion_montaje')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.anticipos_inmovilizaciones_materiales')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '4' => [
                        'name' => ucfirst(trans('fiscal.inversiones_financieras_largo_plazo_vinculadas')),
                        'group' => 'a',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.participaciones_largo_plazo_vinculadas')),
                                'group' => false,
                                'level4' => [
                                    '3' => [
                                        'name' => ucfirst(trans('fiscal.participacion_largo_plazo_empresas_grupo')),
                                        'group' => false
                                    ],
                                    '4' => [
                                        'name' => ucfirst(trans('fiscal.participacion_largo_plazo_empresas_asociadas')),
                                        'group' => false
                                    ],
                                    '5' => [
                                        'name' => ucfirst(trans('fiscal.participaciones_largo_plazo_otras_vinculadas')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.valores_representativos_largo_plazo_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.creditos_largo_plazo_partes_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.desembolsos_pendientes_participaciones_largo_plazo_vinculadas')),
                                'group' => 'a',
                                'level4' => false
                            ]
                        ]
                    ],
                    '5' => [
                        'name' => ucfirst(trans('fiscal.otras_inversiones_financieras_largo_plazo')),
                        'group' => 'a',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.inversiones_financieras_largo_plazo_instrumentos_patrimonio')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.valores_representativos_largo_plazo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.creditos_largo_plazo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.creditos_largo_plazo_enajenacion_inmovilizado')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.creditos_largo_plazo_personal')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.activos_derivados_financieros_largo_plazo')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.activos_financieros_largo_plazo_negociacion')),
                                        'group' => false
                                    ],
                                    '3' => [
                                        'name' => ucfirst(trans('fiscal.activos_financieros_largo_plazo_cobertura')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.activos_retribuciones_largo_definida')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.imposiciones_largo_plazo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.desembolsos_pendientes_neto_largo')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '6' => [
                        'name' => ucfirst(trans('fiscal.fianzas_depositos_largo')),
                        'group' => 'a',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.fianzas_largo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.depositos_largo')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '8' => [
                        'name' => ucfirst(trans('fiscal.amortizacion_acumulada_inmovilizado')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.amortizacion_intangible')),
                                'group' => 'a',
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.amortizacion_material')),
                                'group' => 'a',
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.amortizacion_inmobiliarias')),
                                'group' => 'a',
                                'level4' => false
                            ]
                        ]
                    ],
                    '9' => [
                        'name' => ucfirst(trans('fiscal.deterioro_no_corrientes')),
                        'group' => 'a',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.deterioro_intangible')),
                                'group' => 'a',
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.deterioro_material')),
                                'group' => 'a',
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.deterioro_inmobiliarias')),
                                'group' => 'a',
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.deterioro_largo_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.deterioro_deuda_largo_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.deterioro_creditos_largo_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.deterioro_neto_largo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.deterioro_deuda_largo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.deterioro_valor_largo')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ]
                ]
            ],
            3 => [
                'name' => ucfirst(trans('fiscal.existencias')),
                'group' => 'a',
                'level2' =>  [
                    '0' => [
                        'name' => ucfirst(trans('fiscal.comerciales')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.comerciales')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.comerciales')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '1' => [
                        'name' => ucfirst(trans('fiscal.materias_primas')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.materias_primas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.materias_primas')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '2' => [
                        'name' => ucfirst(trans('fiscal.otros_aprovisionamientos')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.elementos_conjuntos_incorporables')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.combustibles')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.repuestos')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.materiales_diversos')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.embalajes')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.envases')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.material_oficina')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '3' => [
                        'name' => ucfirst(trans('fiscal.productos_curso')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.productos_curso')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.productos_curso')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '4' => [
                        'name' => ucfirst(trans('fiscal.productos_semiterminados')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.productos_semiterminados')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.productos_semiterminados')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '5' => [
                        'name' => ucfirst(trans('fiscal.productos_terminados')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.productos_terminados')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.productos_terminados')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '6' => [
                        'name' => ucfirst(trans('fiscal.subproductos_residuos_recuperados')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.subproductos_residuos_recuperados')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.subproductos_residuos_recuperados')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '9' => [
                        'name' => ucfirst(trans('fiscal.deterioro_existencias')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.deterioro_mercaderias')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.deterioro_primas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.deterioro_aprovisionamientos')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.deterioro_productos_curso')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.deterioro_semiterminados')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.deterioro_terminados')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.deterioro_subproductos_residuos_recuperados')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ]
                ]
            ],
            4 => [
                'name' => ucfirst(trans('fiscal.acreedores_deudores')),
                'group' => false,
                'level2' =>  [
                    '0' => [
                        'name' => ucfirst(trans('fiscal.proveedores')),
                        'group' => 'p',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.proveedores')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.proveedores_comerciales_pagar')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.proveedores_empresas_grupo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.proveedores_asociadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.proveedores_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.envases_proveedores')),
                                'group' => 'p',
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.anticipos_proveedores')),
                                'group' => 'a',
                                'level4' => false
                            ]
                        ]
                    ],
                    '1' => [
                        'name' => ucfirst(trans('fiscal.acreedores_varios')),
                        'group' => 'p',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.acreedores_servicios')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.acreedores_comerciales_pagar')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.acreedores_operaciones_comun')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '3' => [
                        'name' => ucfirst(trans('fiscal.clientes')),
                        'group' => 'a',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.clientes')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.clientes_comerciales_cobrar')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.clientes_factoring')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.clientes_empresas_grupo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.clientes_asociadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.clientes_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.clientes_dudoso_cobro')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.envases_devolver_clientes')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.anticipos_clientes')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '4' => [
                        'name' => ucfirst(trans('fiscal.deudores_varios')),
                        'group' => 'a',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.deudores')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.deudores_comerciales_cobrar')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.deudores_cobro')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.deudores_comun')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '6' => [
                        'name' => ucfirst(trans('fiscal.personal')),
                        'group' => 'a',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.anticipos_remuneraciones')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.remuneraciones_pendientes')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.remuneraciones_sistemas_definida_pendientes')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '7' => [
                        'name' => ucfirst(trans('fiscal.administraciones_publicas')),
                        'group' => 'a',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.publica_deudora_conceptos')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.publica_iva')),
                                        'group' => false
                                    ],
                                    '8' => [
                                        'name' => ucfirst(trans('fiscal.publica_subvenciones_concedidas')),
                                        'group' => false
                                    ],
                                    '9' => [
                                        'name' => ucfirst(trans('fiscal.publica_devolucion_impuestos')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.organismos_social_deudores')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.publica_iva_soportado')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name'=> ucfirst(trans('fiscal.publica_retenciones_cuenta')),
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.activos_impuesto_diferido')),
                                'group' => 'a',
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.activos_temporarias_deducibles')),
                                        'group' => false
                                    ],
                                    '2' => [
                                        'name' => ucfirst(trans('fiscal.derechos_deducciones_bonificaciones_pendientes')),
                                        'group' => false
                                    ],
                                    '5' => [
                                        'name' => ucfirst(trans('fiscal.credito_perdidas_ejercicio')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.publica_fiscales')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.publica_acreedora_iva')),
                                        'group' => false
                                    ],
                                    '1' => [
                                        'name' => ucfirst(trans('fiscal.publica_practicadas')),
                                        'group' => false
                                    ],
                                    '2' => [
                                        'name' => ucfirst(trans('fiscal.publica_impuesto_sociedades')),
                                        'group' => false
                                    ],
                                    '8' => [
                                        'name' => ucfirst(trans('fiscal.publica_subvenciones_reintegrar')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.organismos_social_acreedores')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.publica_iva_repercutido')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.pasivos_temporarias_imponibles')),
                                'group' => 'p',
                                'level4' => false
                            ]
                        ]
                    ],
                    '8' => [
                        'name' => ucfirst(trans('fiscal.ajustes_periodificacion')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.gastos_anticipados')),
                                'group' => 'a',
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.ingresos_anticipados')),
                                'group' => 'p',
                                'level4' => false
                            ]
                        ]
                    ],
                    '9' => [
                        'name' => ucfirst(trans('fiscal.deterioro_creditos_corto')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.deterioro_comerciales')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.deterioro_comerciales_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.provisiones_comerciales')),
                                'group' => 'p',
                                'level4' => [
                                    '4' => [
                                        'name' => ucfirst(trans('fiscal.provision_onerosos')),
                                        'group' => false
                                    ],
                                    '9' => [
                                        'name' => ucfirst(trans('fiscal.provision_comerciales')),
                                        'group' => false
                                    ]
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            5 => [
                'name' => ucfirst(trans('fiscal.cuentas_financieras')),
                'group' => 'p',
                'level2' =>  [
                    '0' => [
                        'name' => ucfirst(trans('fiscal.emprestitos_especiales_analogas_corto')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.obligaciones_bonos_corto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.obligaciones_bonos_convertibles_corto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.acciones_corto_pasivo')),
                                'group' => 'p',
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.deudas_negociables_corto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.intereses_analogas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.dividendos_emisiones_pasivo')),
                                'group' => 'p',
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.valores_amortizados')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '1' => [
                        'name' => ucfirst(trans('fiscal.deudas_corto_vinculadas')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.deudas_corto_credito_vinculadas')),
                                'group' => false,
                                'level4' => [
                                    '3' => [
                                        'name' => ucfirst(trans('fiscal.deudas_grupo')),
                                        'group' => false
                                    ],
                                    '4' => [
                                        'name' => ucfirst(trans('fiscal.deudas_asociadas')),
                                        'group' => false
                                    ],
                                    '5' => [
                                        'name' => ucfirst(trans('fiscal.deudas_empresas_vinculadas')),
                                        'group' => 'p'
                                    ]
                                ]
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.proveedores_corto_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.acreedores_corto_vinculadas')),
                                'group' => false,
                                'level4' => [
                                    '3' => [
                                        'name' => ucfirst(trans('fiscal.acreedores_grupo')),
                                        'group' => false
                                    ],
                                    '4' => [
                                        'name' => ucfirst(trans('fiscal.acreedores_asociadas')),
                                        'group' => false
                                    ],
                                    '5' => [
                                        'name' => ucfirst(trans('fiscal.acreedores_vinculadas')),
                                        'group' => 'p'
                                    ]
                                ]
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.otras_corto_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.intereses_corto_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '2' => [
                        'name' => ucfirst(trans('fiscal.deudas_corto_recibidos')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.deudas_corto_credito')),
                                'group' => 'p',
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.prestamos_corto_credito')),
                                        'group' => false
                                    ],
                                    '1' => [
                                        'name' => ucfirst(trans('fiscal.deudas_corto_dispuesto')),
                                        'group' => false
                                    ],
                                    '7' => [
                                        'name' => ucfirst(trans('fiscal.deudas_operaciones_confirming')),
                                        'group' => false
                                    ],
                                    '8' => [
                                        'name' => ucfirst(trans('fiscal.deudas_efectos_descontados')),
                                        'group' => false
                                    ],
                                    '9' => [
                                        'name' => ucfirst(trans('fiscal.deudas_operaciones_factoring')),
                                        'group' => 'p'
                                    ]
                                ]
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.deudas_corto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.deudas_corto_transformables')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' =>  [
                                'name' => ucfirst(trans('fiscal.proveedores_inmovilizado_corto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.acreedores_financiero_corto')),
                                'group' => 'p',
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.efectos_corto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.dividendo_pagar')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.intereses_corto_credito')),
                                'group' => 'p',
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.intereses_corto_deudas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.provisiones_corto')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '3' => [
                        'name' => ucfirst(trans('fiscal.inversiones_corto_vinculadas')),
                        'group' => 'a',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.participaciones_corto_vinculadas')),
                                'group' => false,
                                'level4' => [
                                    '3' => [
                                        'name' => ucfirst(trans('fiscal.participaciones_corto_grupo')),
                                        'group' => false
                                    ],
                                    '4' => [
                                        'name' => ucfirst(trans('fiscal.participaciones_corto_asociadas')),
                                        'group' => false
                                    ],
                                    '5' => [
                                        'name' => ucfirst(trans('fiscal.participaciones_corto_otras_vinculadas')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.valores_deuda_corto_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.creditos_corto_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.intereses_corto_financieras_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.intereses_corto_creditos_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.dividendo_cobrar_inversiones_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.desembolsos_participaciones_corto_vinculadas')),
                                'group' => 'p',
                                'level4' => false
                            ]
                        ]
                    ],
                    '4' => [
                        'name' => ucfirst(trans('fiscal.otras_inversiones_corto')),
                        'group' => 'a',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.inversiones_temporales_patrimonio')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.valores_deuda_corto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.creditos_corto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.creditos_corto_enajenacion')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.creditos_corto_personal')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.dividendo_cobrar')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.intereses_corto_representativos')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.intereses_corto_creditos')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.imposiciones_corto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.desembolsos_patrimonio_corto')),
                                'group' => 'a',
                                'level4' => false
                            ]
                        ]
                    ],
                    '5' => [
                        'name' => ucfirst(trans('fiscal.otras_cuentas_no_bancarias')),
                        'group' => 'a',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.titular_explotacion')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.cuenta_socios_administradores')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.cuenta_otras_entidades')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.cuentas_fusiones')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.socios_sociedad_disuelta')),
                                        'group' => false
                                    ],
                                    '1' => [
                                        'name' => ucfirst(trans('fiscal.socios_fusion')),
                                        'group' => false
                                    ],
                                    '2' => [
                                        'name' => ucfirst(trans('fiscal.socios_escindida')),
                                        'group' => false
                                    ],
                                    '3' => [
                                        'name' => ucfirst(trans('fiscal.socios_escision')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.cuenta_temporales_bienes')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.partidas_aplicacion')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.desembolsos_participaciones_neto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.dividendo_cuenta')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.socios_desembolsos_exigidos')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.socios_exigidos_ordinarias')),
                                        'group' => 'a'
                                    ],
                                    '5' => [
                                        'name' => ucfirst(trans('fiscal.socios_exigidos_pasivos')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.derivados_corto')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.activos_corto_negociacion')),
                                        'group' => false
                                    ],
                                    '3' => [
                                        'name' => ucfirst(trans('fiscal.activos_corto_cobertura')),
                                        'group' => false
                                    ],
                                    '5' => [
                                        'name' => ucfirst(trans('fiscal.pasivos_corto_negociacion')),
                                        'group' => false
                                    ],
                                    '8' => [
                                        'name' => ucfirst(trans('fiscal.pasivos_corto_cobertura')),
                                        'group' => false
                                    ]
                                ]
                            ]
                        ]
                    ],
                    '6' => [
                        'name' => ucfirst(trans('fiscal.fianzas_recibidos_corto')),
                        'group' => 'a',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.fianzas_corto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.depositos_corto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.fianzas_constituidas_corto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.depositos_constituidos_corto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.intereses_anticipado')),
                                'group' => 'a',
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.intereses_cobrados_anticipado')),
                                'group' => 'p',
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.garantias_corto')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '7' => [
                        'name' => ucfirst(trans('fiscal.tesoreria')),
                        'group' => 'a',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.caja_euros')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.caja_extranjera')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.bancos_credito_euros')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.bancos_credito_extranjera')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.bancos_ahorro_euros')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.bancos_ahorro_extranjera')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.inversiones_corto_liquidez')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '8' => [
                        'name' => ucfirst(trans('fiscal.activos_mantenidos_venta_asociados')),
                        'group' => 'a',
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.inmovilizado')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.inversiones_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.inversiones_financieras')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.existencias_comerciales_cobrar')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.otros_activos')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.provisiones')),
                                'group' => 'p',
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.deudas_especiales')),
                                'group' => 'p',
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.deudas_vinculadas')),
                                'group' => 'p',
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.acreedores_cuentas_pagar')),
                                'group' => 'p',
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.otros_pasivos')),
                                'group' => 'p',
                                'level4' => false
                            ]
                        ]
                    ],
                    '9' => [
                        'name' => ucfirst(trans('fiscal.deterioro_inversiones_corto_venta')),
                        'group' => 'a',
                        'level3' => [
                            '3' => [
                                'name' => ucfirst(trans('fiscal.deterioro_participaciones_corto_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.deterioro_valores_corto_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.deterioro_creditos_corto_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.deterioro_valores_deuda_corto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.deterioro_valor_creditos_corto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.deterioro_activos_venta')),
                                'group' => 'a',
                                'level4' => false
                            ]
                        ]
                    ]
                ]
            ],
            6 => [
                'name' => ucfirst(trans('fiscal.compras_gastos')),
                'group' => false,
                'level2' =>  [
                    '0' => [
                        'name' => ucfirst(trans('fiscal.compras')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.compras_mercaderias')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.compras_primas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.compras_aprovisionamientos')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.descuentos_compras_pronto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.trabajos_empresas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.devoluciones_compras_similares')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.rappels_compras')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '1' => [
                        'name' => ucfirst(trans('fiscal.variacion_existencias')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.variacion_mercaderias')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.variacion_primas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.variacion_aprovisionamientos')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '2' => [
                        'name' => ucfirst(trans('fiscal.servicios_exteriores')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.gastos_ejercicio')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.arrendamientos_canones')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.reparaciones_conservacion')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.servicios_independientes')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.transportes')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.primas_seguros')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.servicios_similares')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.publicidad_publicas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.suministros')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.otros_servicios')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '3' => [
                        'name' => ucfirst(trans('fiscal.tributos')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.impuesto_beneficios')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.impuesto_corriente')),
                                        'group' => false
                                    ],
                                    '1' => [
                                        'name' => ucfirst(trans('fiscal.impuesto_diferido')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.otros_tributos')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.ajustes_beneficios')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.ajustes_indirecta')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.devolucion_impuestos')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.ajustes_positivos')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.ajustes_positivos_indirecta')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '4' => [
                        'name' => ucfirst(trans('fiscal.gastos_personal')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.sueldos_salarios')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.indemnizaciones')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.seguridad_empresa')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.retribuciones_largo_definida')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.retribuciones_prestacion')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.contribuciones_anuales')),
                                        'group' => false
                                    ],
                                    '2' => [
                                        'name' => ucfirst(trans('fiscal.otros_costes')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.retribuciones_personal_patrimonio')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.otros_sociales')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '5' => [
                        'name' => ucfirst(trans('fiscal.otros_gestion')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.perdidas_incobrables')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.resultados_comun')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.beneficio_gestor')),
                                        'group' => false
                                    ],
                                    '1' => [
                                        'name' => ucfirst(trans('fiscal.perdida_participe')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.otras_corriente')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '6' => [
                        'name' => ucfirst(trans('fiscal.gastos_financieros')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.gastos_provisiones')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.intereses_bonos')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.intereses_deudas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.perdidas_instrumentos_razonable')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.perdidas_negociacion')),
                                        'group' => false
                                    ],
                                    '1' => [
                                        'name' => ucfirst(trans('fiscal.perdidas_empresa')),
                                        'group' => false
                                    ],
                                    '2' => [
                                        'name' => ucfirst(trans('fiscal.perdidas_venta')),
                                        'group' => false
                                    ],
                                    '3' => [
                                        'name' => ucfirst(trans('fiscal.perdidas_cobertura')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.dividendos_pasivo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.intereses_factoring')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.perdidas_deuda')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.perdidas_comerciales')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.diferencias_cambio')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.otros_financieros')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '7' => [
                        'name' => ucfirst(trans('fiscal.perdidas_excepcionales')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.perdidas_intangible')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.perdidas_material')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.perdidas_inmobiliarias')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.perdidas_vinculadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.perdidas_propias')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.gastos_excepcionales')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '8' => [
                        'name' => ucfirst(trans('fiscal.dotaciones_amortizaciones')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.amortizacion_inmovilizado_intangible')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.amortizacion_inmovilizado_material')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.amortizacion_inversiones_inmobiliarias')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '9' => [
                        'name' => ucfirst(trans('fiscal.perdidas_dotaciones')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.perdidas_deterioro_intangible')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.perdidas_deterioro_material')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.perdidas_deterioro_inmobiliarias')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.perdidas_deterioro_existencias')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.perdidas_deterioro_comerciales')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.dotacion_comerciales')),
                                'group' => false,
                                'level4' => [
                                    '4' => [
                                        'name' => ucfirst(trans('fiscal.dotacion_contratos_onerosos')),
                                        'group' => false
                                    ],
                                    '9' => [
                                        'name' => ucfirst(trans('fiscal.dotacion_otras_comerciales')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.perdidas_valores_largo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.perdidas_largo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.perdidas_corto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.perdidas_creditos_corto')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ]
                ]
            ],
            7 => [
                'name' => ucfirst(trans('fiscal.ventas_ingresos')),
                'group' => false,
                'level2' =>  [
                    '0' => [
                        'name' => ucfirst(trans('fiscal.ventas_propia_servicios')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.ventas_mercaderias')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.ventas_terminados')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.ventas_semiterminados')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.ventas_residuos')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.ventas_embalajes')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.prestacion_servicios')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.descuentos_pronto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.devoluciones_similares')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.rappels_ventas')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '1' => [
                        'name' => ucfirst(trans('fiscal.variacion')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.variacion_curso')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.variacion_semiterminados')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.variacion_terminados')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.variacion_recuperados')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '3' => [
                        'name' => ucfirst(trans('fiscal.trabajos_realizados_empresa')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.trabajos_intangible')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.trabajos_material')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.trabajos_inmobiliarias')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.trabajos_curso')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '4' => [
                        'name' => ucfirst(trans('fiscal.subvenciones_legados')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.subvenciones_explotacion')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.subvenciones_ejercicio')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.otras_ejercicio')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '5' => [
                        'name' => ucfirst(trans('fiscal.otros_ingresos_gestion')),
                        'group' => false,
                        'level3' => [
                            '1' => [
                                'name' => ucfirst(trans('fiscal.resultados_operaciones_comun')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.perdida_gestor')),
                                        'group' => false
                                    ],
                                    '1' => [
                                        'name' => ucfirst(trans('fiscal.beneficio_participe')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.ingresos_arrendamientos')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.ingresos_explotacion')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.ingresos_comisiones')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.ingresos_personal')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.ingresos_diversos')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '6' => [
                        'name' => ucfirst(trans('fiscal.ingresos_financieros')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.ingresos_patrimonio')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.ingresos_deuda')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.ingresos_creditos')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.beneficios_razonable')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.beneficios_negociacion')),
                                        'group' => false
                                    ],
                                    '1' => [
                                        'name' => ucfirst(trans('fiscal.beneficios_empresa')),
                                        'group' => false
                                    ],
                                    '2' => [
                                        'name' => ucfirst(trans('fiscal.beneficios_venta')),
                                        'group' => false
                                    ],
                                    '3' => [
                                        'name' => ucfirst(trans('fiscal.beneficios_cobertura')),
                                        'group' => false
                                    ]
                                ]
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.beneficios_deuda')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.ingresos_largo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.diferencias_positivas_cambio')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.otros_ingresos_financieros')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '7' => [
                        'name' => ucfirst(trans('fiscal.beneficios_excepcionales')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                               'name' => ucfirst(trans('fiscal.beneficios_intangible')),
                               'group' => false,
                               'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.beneficios_material')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.beneficios_inmobiliarias')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.beneficios_participaciones')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.diferencia_negocios')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.beneficios_propias')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.ingresos_excepcionales')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '9' => [
                        'name' => ucfirst(trans('fiscal.excesos_deterioro')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.reversion_intangible')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.reversion_material')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.reversion_inmobiliarias')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.reversion_existencias')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.reversion_comerciales')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.exceso_provisiones')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.reversion_deuda_largo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.reversion_largo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.reversion_corto')),
                                'group' => false,
                                'level4' => false
                            ],
                            '9' => [
                                'name' => ucfirst(trans('fiscal.reversion_deterioro')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ]
                ]
            ],
            8 => [
                'name' => ucfirst(trans('fiscal.gastos_patrimonio_neto')),
                'group' => false,
                'level2' =>  [
                    '0' => [
                        'name' => ucfirst(trans('fiscal.gastos_activos_financieros')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.perdidas_disponibles_venta')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.transferencia_venta')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '1' => [
                        'name' => ucfirst(trans('fiscal.gastos_cobertura')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.perdidas_efectivo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.perdidas_extranjero')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.transferencia_efectivo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.transferencia_extranjero')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '2' => [
                        'name' => ucfirst(trans('fiscal.gastos_conversion')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.diferencias_negativas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.transferencia_positivas')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '3' => [
                        'name' => ucfirst(trans('fiscal.impuestos_beneficios')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.impuestos_beneficios')),
                                'group' => false,
                                'level4' => [
                                    '0' => [
                                        'name' => ucfirst(trans('fiscal.impuesto_corriente')),
                                        'group' => false,
                                    ],
                                    '1' => [
                                        'name' => ucfirst(trans('fiscal.impuesto_diferido')),
                                        'group' => false,
                                    ]
                                ]
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.ajustes_negativos')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.ingresos_permanentes')),
                                'group' => false,
                                'level4' => false
                            ],
                            '5' => [
                                'name' => ucfirst(trans('fiscal.ingresos_bonificaciones')),
                                'group' => false,
                                'level4' => false
                            ],
                            '6' => [
                                'name' => ucfirst(trans('fiscal.transferencia_permanentes')),
                                'group' => false,
                                'level4' => false
                            ],
                            '7' => [
                                'name' => ucfirst(trans('fiscal.transferencia_bonificaciones')),
                                'group' => false,
                                'level4' => false
                            ],
                            '8' => [
                                'name' => ucfirst(trans('fiscal.ajustes_imposicion_beneficios')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '4' => [
                        'name' => ucfirst(trans('fiscal.transferencias_legados')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.transferencia_capital')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.transferencia_donaciones')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.transferencia_legados')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '5' => [
                        'name' => ucfirst(trans('fiscal.gastos_definida')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.perdidas_actuariales')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.ajustes_largo')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '6' => [
                        'name' => ucfirst(trans('fiscal.gastos_venta')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.perdidas_activos_venta')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.transferencia_beneficios_venta')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '9' => [
                        'name' => ucfirst(trans('fiscal.gastos_previos')),
                        'group' => false,
                        'level3' => [
                            '1' => [
                               'name' => ucfirst(trans('fiscal.deterioro_grupo')),
                               'group' => false,
                               'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.deterioro_asociadas')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ]
                ]
            ],
            9 => [
                'name' => ucfirst(trans('fiscal.ingresos_patrimonio_neto')),
                'group' => false,
                'level2' =>  [
                    '0' => [
                        'name' => ucfirst(trans('fiscal.ingresos_activos_financieros')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.beneficios_financieros_venta')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.transferencia_activos_venta')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '1' => [
                        'name' => ucfirst(trans('fiscal.ingresos_cobertura')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.beneficios_efectivo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.beneficios_extranjero')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.transferencia_perdidas_efectivo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.transferencia_perdidas_extranjero')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '2' => [
                        'name' => ucfirst(trans('fiscal.ingresos_conversion')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.diferencias_positivas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.transferencia_negativas')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '4' => [
                        'name' => ucfirst(trans('fiscal.ingresos_legados')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.ingresos_de')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.ingresos_de')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '5' => [
                        'name' => ucfirst(trans('fiscal.ingresos_definida')),
                        'group' => false,
                        'level3' =>  [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.ganancias_actuariales')),
                                'group' => false,
                                'level4' => false
                            ],
                            '1' => [
                                'name' => ucfirst(trans('fiscal.ajustes_definida')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '6' => [
                        'name' => ucfirst(trans('fiscal.ingresos_venta')),
                        'group' => false,
                        'level3' => [
                            '0' => [
                                'name' => ucfirst(trans('fiscal.beneficios_activos_venta')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.transferencia_grupos_venta')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ],
                    '9' => [
                        'name' => ucfirst(trans('fiscal.ingresos_grupo_previos')),
                        'group' => false,
                        'level3' => [
                            '1' => [
                                'name' => ucfirst(trans('fiscal.recuperacion_grupo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '2' => [
                                'name' => ucfirst(trans('fiscal.recuperacion_asociadas')),
                                'group' => false,
                                'level4' => false
                            ],
                            '3' => [
                                'name' => ucfirst(trans('fiscal.transferencia_previos_grupo')),
                                'group' => false,
                                'level4' => false
                            ],
                            '4' => [
                                'name' => ucfirst(trans('fiscal.transferencia_previos_asociadas')),
                                'group' => false,
                                'level4' => false
                            ]
                        ]
                    ]
                ]
            ]
        ];

        DB::statement('SET FOREIGN_KEY_CHECKS = 0');

        // Vacía la tabla
        //DB::statement("TRUNCATE TABLE {$tableName}");
        AccountingAccountType::truncate();

        // Reactiva las restricciones
        DB::statement('SET FOREIGN_KEY_CHECKS = 1');

        foreach($data as $i1 => $r1){
            $aat1 = new AccountingAccountType();
            $aat1->autoreference = '0';
            $aat1->code = $i1;
            $aat1->name = $r1['name'];
            $aat1->mode = isset($r1['group']) && $r1['group'] != ''? $r1['group']:NULL;
            $aat1->save();

            if(isset($r1['level2'])){
                foreach($r1['level2'] as $i2 => $r2){
                    $aat2 = new AccountingAccountType();
                    $aat2->autoreference = $aat1->id;
                    $aat2->code = $i1.$i2;
                    $aat2->name = strtolower($r2['name']);
                    $aat2->mode = isset($r2['group']) && $r2['group'] != ''? $r2['group']:NULL;
                    $aat2->save();

                    if(isset($r2['level3'])){
                        foreach($r2['level3'] as $i3 => $r3){
                            $aat3 = new AccountingAccountType();
                            $aat3->autoreference = $aat2->id;
                            $aat3->code = $i1.$i2.$i3;
                            $aat3->name = strtolower($r3['name']);
                            $aat3->mode = isset($r3['group']) && $r3['group'] != ''? $r3['group']:NULL;
                            $aat3->save();

                            if($r3['level4']){
                                foreach($r3['level4'] as $i4 => $r4){
                                    $aat4 = new AccountingAccountType();
                                    $aat4->autoreference = $aat3->id;
                                    $aat4->code = $i1.$i2.$i3.$i4;
                                    $aat4->name = strtolower($r4['name']);
                                    $aat4->mode = isset($r4['group']) && $r4['group'] != ''? $r4['group']:NULL;
                                    $aat4->save();
                                }    
                            }
                        }
                    }
                }
            }
        }
    }
}
