<?php
use Bitrix\Main\Routing\RoutingConfigurator;
use Bitrix\Main\HttpResponse;

return function (RoutingConfigurator $routes) {
    // Универсальная функция для возврата содержимого HTML-файла
    $renderHtmlFile = function (string $filePath) {
        $response = new HttpResponse();
        $response->addHeader('Content-Type', 'text/html; charset=UTF-8');

        // Проверяем существование файла, чтобы избежать ошибок
        if (file_exists($_SERVER['DOCUMENT_ROOT'] . $filePath)) {
            $htmlContent = file_get_contents($_SERVER['DOCUMENT_ROOT'] . $filePath);
            $response->setContent($htmlContent);
        } else {
            $response->setStatus(404);
            $response->setContent('<h1>404 Not Found</h1>');
        }
        return $response;
    };

    // Список маршрутов и соответствующих файлов
    $routesList = [
        '/'         => '/local/php_interface/front/public_html/index.html',
        '/about-us'    => '/local/php_interface/front/public_html/about-us.html',
        '/service'  => '/local/php_interface/front/public_html/service.html',
        '/price'    => '/local/php_interface/front/public_html/price.html',
        '/basket' => '/local/php_interface/front/public_html/basket.html'
        '/account' => '/local/php_interface/front/public_html/account.html'
        '/delivery' => '/local/php_interface/front/public_html/delivery.html'
    ];

    // Генерация маршрутов
    foreach ($routesList as $route => $filePath) {
        $routes->get($route, fn() => $renderHtmlFile($filePath));
    }

    // Обработка всех несуществующих маршрутов
    $routes->any('{any}', function () {
        $response = new HttpResponse();
        $response->setStatus(404);
        $response->addHeader('Content-Type', 'text/html; charset=UTF-8');
        $response->setContent('<h1>403 Not Found</h1>');
        return $response;
    })->where('any', '.*'); // Совпадение с любым маршрутом
};
