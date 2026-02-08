<?php

namespace App\Services;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Genera un archivo Excel de prueba para importación de contactos CRM.
 * Misma estructura que la plantilla: cabeceras + N filas de datos de prueba.
 */
class CrmContactImportSampleGenerator
{
    private const HEADERS = [
        'name',
        'surname',
        'user_email',
        'user_nif',
        'position',
        'department',
        'observations',
        'company',
        'company_nif',
        'company_city',
        'company_postal_code',
        'company_street',
        'company_phone',
        'company_email',
    ];

    /**
     * Genera un Spreadsheet con cabeceras y $count filas de datos de prueba.
     */
    public function generate(int $count = 600): Spreadsheet
    {
        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Contactos');

        $faker = class_exists(\Faker\Factory::class) ? \Faker\Factory::create('es_ES') : null;

        // Cabecera (fila 1)
        $col = 'A';
        foreach (self::HEADERS as $header) {
            $sheet->setCellValue($col . '1', $header);
            $col++;
        }

        // Datos (filas 2 a $count+1)
        $positions = ['Director', 'Responsable', 'Técnico', 'Comercial', 'Administrativo', 'Gerente', 'Coordinador'];
        $departments = ['Ventas', 'Marketing', 'IT', 'RRHH', 'Compras', 'Dirección', 'Logística'];
        $cities = ['Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza', 'Bilbao', 'Málaga'];

        for ($i = 0; $i < $count; $i++) {
            $row = $i + 2;
            if ($faker) {
                $name = $faker->firstName();
                $surname = $faker->lastName();
                $companyName = $faker->company();
                $obs = $i % 5 === 0 ? $faker->sentence(6) : '';
                $city = $faker->city();
                $postcode = $faker->postcode();
                $street = $faker->streetAddress();
                $phone = $faker->numerify('9## ### ###');
            } else {
                $name = 'Nombre' . ($i + 1);
                $surname = 'Apellido' . ($i + 1);
                $companyName = 'Empresa ' . ($i + 1) . ' SL';
                $obs = $i % 5 === 0 ? 'Observación de prueba.' : '';
                $city = $cities[$i % count($cities)];
                $postcode = (string) (28000 + ($i % 100));
                $street = 'Calle Ejemplo ' . ($i + 1);
                $phone = '912' . str_pad((string) ($i % 1000000), 6, '0', STR_PAD_LEFT);
            }
            $sheet->setCellValue('A' . $row, $name);
            $sheet->setCellValue('B' . $row, $surname);
            $sheet->setCellValue('C' . $row, 'contacto' . $i . '-' . $row . '@muestra.test');
            $sheet->setCellValue('D' . $row, $this->fakeNif($i, $row));
            $sheet->setCellValue('E' . $row, $positions[$i % count($positions)]);
            $sheet->setCellValue('F' . $row, $departments[$i % count($departments)]);
            $sheet->setCellValue('G' . $row, $obs);
            $sheet->setCellValue('H' . $row, $companyName);
            $sheet->setCellValue('I' . $row, $this->fakeCif($i));
            $sheet->setCellValue('J' . $row, $city);
            $sheet->setCellValue('K' . $row, $postcode);
            $sheet->setCellValue('L' . $row, $street);
            $sheet->setCellValue('M' . $row, $phone);
            $sheet->setCellValue('N' . $row, 'empresa' . $i . '@muestra.test');
        }

        return $spreadsheet;
    }

    /**
     * Devuelve la respuesta de descarga del archivo generado (XLSX).
     */
    public function downloadResponse(int $count = 600, string $filename = 'contactos-import-muestra-600.xlsx'): StreamedResponse
    {
        $spreadsheet = $this->generate($count);
        $writer = new Xlsx($spreadsheet);

        return new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type'        => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
            'Cache-Control'       => 'max-age=0',
        ]);
    }

    private function fakeNif(int $i, int $row): string
    {
        $num = str_pad((string) (($i * 7 + $row) % 99999999), 8, '0', STR_PAD_LEFT);
        $letras = 'TRWAGMYFPDXBNJZSQVHLCKE';
        return $num . $letras[(int) $num % 23];
    }

    private function fakeCif(int $i): string
    {
        $letra = ['A', 'B', 'C'][$i % 3];
        $num = str_pad((string) (($i * 11 + 123) % 99999999), 8, '0', STR_PAD_LEFT);
        return $letra . $num;
    }
}
