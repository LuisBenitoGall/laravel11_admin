<?php

return [
    'allowed_extensions' => [
        'jpg',
        'jpeg',
        'png',
        'gif',
        'webp',
        'pdf',
        'xls',
        'xlsx',
        'docx',
    ],

    'allowed_mime_types' => [
        'jpg'  => ['image/jpeg'],
        'jpeg' => ['image/jpeg'],
        'png'  => ['image/png'],
        'gif'  => ['image/gif'],
        'webp' => ['image/webp'],
        'pdf'  => ['application/pdf'],
        'xls'  => ['application/vnd.ms-excel'],
        'xlsx' => [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
        ],
        'docx' => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ],

    'max_file_size' => 10 * 1024 * 1024, // 10 MB

    'max_batch' => 20,

    'image_variants' => [
        'thumb_sm' => ['width' => 200, 'height' => 200],
        'thumb_md' => ['width' => 480, 'height' => 480],
        'preview'  => ['width' => 1280, 'height' => 1280],
    ],

    'disk' => 'local',
];
