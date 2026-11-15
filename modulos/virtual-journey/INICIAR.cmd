@echo off
setlocal EnableExtensions
chcp 65001 >nul
title WMK TerraStudio - Iniciar Virtual Journey
cd /d "%~dp0"
set "PHP_EXE="
where php.exe >nul 2>nul && set "PHP_EXE=php.exe"
if not defined PHP_EXE (
  for %%P in ("C:\xampp\php\php.exe" "D:\xampp\php\php.exe" "E:\xampp\php\php.exe" "C:\php\php.exe" "D:\php\php.exe") do (
    if not defined PHP_EXE if exist "%%~P" set "PHP_EXE=%%~P"
  )
)
if not defined PHP_EXE (
  echo.
  echo ERRO: PHP nao encontrado.
  echo Instale PHP 8 ou XAMPP; ou adicione php.exe ao PATH.
  echo.
  pause
  exit /b 1
)
echo.
echo ==================================================
echo  WMK TerraStudio - Virtual Journey
echo  Endereco: http://127.0.0.1:8791
echo ==================================================
echo.
echo Iniciando servidor PHP...
start "WMK Virtual Journey - PHP" /MIN "%PHP_EXE%" -S 127.0.0.1:8791 -t "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ok=$false; for($n=0;$n -lt 15;$n++){try{$r=Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 'http://127.0.0.1:8791/';if($r.StatusCode -eq 200){$ok=$true;break}}catch{};Start-Sleep -Milliseconds 600};if($ok){exit 0}else{exit 1}"
if errorlevel 1 (
  echo.
  echo AVISO: O PHP nao respondeu. Verifique a porta 8791 e a janela do servidor.
  pause
  exit /b 1
)
start "" "http://127.0.0.1:8791"
echo Pronto! Para parar, feche a janela do servidor PHP.
exit /b 0
