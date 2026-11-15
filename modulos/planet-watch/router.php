<?php
/**
 * Servidor de desenvolvimento WMK Planet Watch.
 * Somente arquivos web aprovados + proxy HTTP para API Python local.
 * Iniciar com INICIAR.cmd. Não publicar na Internet.
 */
declare(strict_types=1);

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$path = is_string($path) ? $path : '';
$publicFiles = [
    '/' => ['index.html', 'text/html; charset=utf-8'],
    '/index.html' => ['index.html', 'text/html; charset=utf-8'],
    '/app.js' => ['app.js', 'application/javascript; charset=utf-8'],
];

header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
if (isset($publicFiles[$path])) {
    [$file, $mime] = $publicFiles[$path];
    header('Content-Type: ' . $mime);
    readfile(__DIR__ . DIRECTORY_SEPARATOR . $file);
    exit;
}
$api = [
    '/health' => true,
    '/api/sources' => true,
    '/api/earthquakes' => true,
    '/api/events' => true,
    '/api/weather' => true,
    '/api/integrations' => true,
];
if (!isset($api[$path])) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo '{"error":"not_found"}';
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'GET') {
    http_response_code(405);
    header('Allow: GET');
    exit;
}
$query = $path === '/api/weather' ? (string) ($_SERVER['QUERY_STRING'] ?? '') : '';
if (strlen($query) > 300) {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo '{"error":"query_too_long"}';
    exit;
}
$endpoint = 'http://127.0.0.1:8788' . $path . ($query !== '' ? '?' . $query : '');
$options = ['http' => ['method' => 'GET', 'timeout' => 8, 'ignore_errors' => true,
                        'header' => "Connection: close\r\n"]];
$context = stream_context_create($options);
$body = @file_get_contents($endpoint, false, $context);
if ($body === false || strlen($body) > 6000000) {
    http_response_code(502);
    header('Content-Type: application/json; charset=utf-8');
    echo '{"error":"python_api_unavailable"}';
    exit;
}
$status = 200;
foreach ($http_response_header ?? [] as $line) {
    if (preg_match('~^HTTP/\d(?:\.\d)?\s+(\d{3})~i', $line, $matches)) {
        $status = (int) $matches[1];
        break;
    }
}
http_response_code($status);
header('Content-Type: application/json; charset=utf-8');
echo $body;
