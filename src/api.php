<?php

require($_SERVER["DOCUMENT_ROOT"] . "/bitrix/modules/main/include/prolog_before.php");
require_once($_SERVER['DOCUMENT_ROOT'] . '/vendor/autoload.php');

use Bitrix\Main\Routing\RoutingConfigurator;
use Bitrix\Main\HttpResponse as Response;
use lib\AccessoriesAction;
use lib\MerchAction;
use lib\Basket;
use lib\CoffeeAction;
use lib\SdekRestEnter;
use lib\MainAuthAction;
use lib\Order;
use lib\Master;

$allowedOrigins = ['http://localhost:8800', 'https://wmf24.ru'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('Access-Control-Allow-Origin: '.$origin);
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('HTTP/1.1 204 No Content');
    exit;
}
header("Access-Control-Allow-Origin: ".$origin); // Разрешает запросы с любых доменов
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");

CModule::IncludeModule("catalog");
CModule::IncludeModule("iblock");
CModule::IncludeModule("sale");


return function (RoutingConfigurator $routes) {
    $routes->prefix('api')->group(function (RoutingConfigurator $routes) {
        $routes->get('sdek_points', [SdekRestEnter::class, "getPointsAction"]);

        $routes->prefix('auth')->group(function (RoutingConfigurator $routes) {
            $routes->post('login', [MainAuthAction::class, "loginAction"]);
            $routes->post('registration', [MainAuthAction::class, "registrationAction"]);
            $routes->post('approvecoderegister', [MainAuthAction::class, "approvecoderegisterAction"]);
            $routes->post('logout', [MainAuthAction::class, "logoutAction"]);
            $routes->post('recovery', [MainAuthAction::class, "recoveryAction"]);
            $routes->get('info', [MainAuthAction::class, "infoAction"]);
            $routes->post('approverecoverpass', [MainAuthAction::class, "approverecoverpassAction"]);

            $routes->post('createuseraddress', [MainAuthAction::class, "createuseraddressAction"]);
            $routes->post('addressdroper', [MainAuthAction::class, "addressdroperAction"]);
            $routes->post('updateaddress', [MainAuthAction::class, "addressupdateAction"]);
            $routes->post('deleteprofile', [MainAuthAction::class, "deleteprofileAction"]);
            $routes->post('updateprofile', [MainAuthAction::class, "updateprofileAction"]);


        });
        $routes->prefix('mainpage')->group(function (RoutingConfigurator $routes) {
            $routes->get('merch', [MerchAction::class, "merchAction"]);
            $routes->get('accessories', [AccessoriesAction::class, "accessoriesAction"]);
            $routes->get('coffee', [CoffeeAction::class, "coffeeAction"]);

        });
        $routes->prefix('basket')->group(function (RoutingConfigurator $routes) {
        $routes->post('add', [Basket::class, "basketaddAction"]);
        $routes->get('get', [Basket::class, "basketgetAction"]);
        $routes->post('remove', [Basket::class, "basketremoveAction"]);
        });

        $routes->prefix('order')->group(function (RoutingConfigurator $routes) {
            $routes->post('create', [Order::class, "createAction"]);
            $routes->get('list', [Order::class, "listAction"]);

        });

        $routes->prefix('paymaster')->group(function (RoutingConfigurator $routes) {
            $routes->any('sale_ps_result', [Master::class, "sale_ps_resultAction"]);
            $routes->any('sale_ps_success', [Master::class, "sale_ps_successAction"]);
            $routes->any('sale_ps_fail', [Master::class, "sale_ps_failAction"]);

        });
        $routes->any('{any}', function () {
            // Получение текущего контекста и ответа
            $response = new Response();
            // Установить статус 404
            $response->setStatus(404);

            // Установка заголовков для JSON
            $response->addHeader('Content-Type', 'application/json; charset=UTF-8');

            // Формирование JSON-ответа
            $data = [
                'status' => 404,
                'message' => 'Resource not found'
            ];

            // Установка содержимого ответа
            $response->setContent(json_encode($data));
            return $response;
        })->where('any', '.*'); // Ловим все несуществующие маршруты
    });

};