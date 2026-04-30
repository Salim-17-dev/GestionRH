<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
foreach (app('router')->getRoutes() as $route) {
    if ($route->uri() === 'api/equipements' && in_array('GET', $route->methods(), true)) {
        var_export([
            'uri' => $route->uri(),
            'action' => $route->getActionName(),
            'middleware' => $route->gatherMiddleware(),
            'action_array' => $route->getAction(),
        ]);
        break;
    }
}
