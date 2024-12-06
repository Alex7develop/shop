<?php
use Bitrix\Main\Routing\RoutingConfigurator;
return function (RoutingConfigurator $routes) {
    // маршруты
    $routes->get('/', function () {
        // Получаем текущий контекст и ответ
        $response = new \Bitrix\Main\HttpResponse();

        // Устанавливаем заголовок для HTML
        $response->addHeader('Content-Type', 'text/html; charset=UTF-8');

        // Читаем содержимое HTML-файла
        $htmlContent = file_get_contents($_SERVER['DOCUMENT_ROOT'] .'/local/php_interface/front/public_html/index.html');

        // Устанавливаем содержимое ответа
        $response->setContent($htmlContent);
        return $response;
    });
    $routes->get('/about', function () {
        // Получаем текущий контекст и ответ
        $response = new \Bitrix\Main\HttpResponse();

        // Устанавливаем заголовок для HTML
        $response->addHeader('Content-Type', 'text/html; charset=UTF-8');

        // Читаем содержимое HTML-файла
        $htmlContent = file_get_contents($_SERVER['DOCUMENT_ROOT'] .'/local/php_interface/front/public_html/about-us.html');

        // Устанавливаем содержимое ответа
        $response->setContent($htmlContent);
        return $response;
    });
    $routes->get('/service', function () {
        // Получаем текущий контекст и ответ
        $response = new \Bitrix\Main\HttpResponse();

        // Устанавливаем заголовок для HTML
        $response->addHeader('Content-Type', 'text/html; charset=UTF-8');

        // Читаем содержимое HTML-файла
        $htmlContent = file_get_contents($_SERVER['DOCUMENT_ROOT'] .'/local/php_interface/front/public_html/service.html');

        // Устанавливаем содержимое ответа
        $response->setContent($htmlContent);
        return $response;
    });
    $routes->get('/price', function () {
        // Получаем текущий контекст и ответ
        $response = new \Bitrix\Main\HttpResponse();

        // Устанавливаем заголовок для HTML
        $response->addHeader('Content-Type', 'text/html; charset=UTF-8');

        // Читаем содержимое HTML-файла
        $htmlContent = file_get_contents($_SERVER['DOCUMENT_ROOT'] .'/local/php_interface/front/public_html/price.html');

        // Устанавливаем содержимое ответа
        $response->setContent($htmlContent);
        return $response;
    });

    
};