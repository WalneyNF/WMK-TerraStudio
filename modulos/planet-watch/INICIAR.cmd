@echo off
setlocal EnableExtensions
chcp 65001 >nul
title WMK TerraStudio - Iniciar Planet Watch
cd /d "%~dp0"

rem Encontrar PHP via PATH ou instalacoes XAMPP comuns.
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
  echo Instale PHP 8 ou XAMPP; ou coloque php.exe no PATH.
  echo Verifique C:\xampp\php ou D:\xampp\php.
  echo.
  pause
  exit /b 1
)

rem O Planet Watch consulta APIs com Python; PHP apenas publica a interface/proxy.
set "PY_CMD="
where py.exe >nul 2>nul && set "PY_CMD=py -3"
if not defined PY_CMD where python.exe >nul 2>nul && set "PY_CMD=python"
if not defined PY_CMD (
  echo.
  echo ERRO: Python 3 nao encontrado.
  echo O Planet Watch precisa de Python 3 para os conectores USGS/NASA/Open-Meteo.
  echo Instale Python 3 e habilite o comando py ou python.
  echo.
  pause
  exit /b 1
)

echo.
echo ==================================================
echo  WMK TerraStudio - Planet Watch
echo  Interface PHP: http://127.0.0.1:8789
echo  API Python:    http://127.0.0.1:8788
echo ==================================================
echo.
echo Iniciando API Python em uma janela separada...
start "WMK Planet Watch - API Python" /MIN cmd /k "%PY_CMD% server.py"
echo Iniciando interface PHP em outra janela...
start "WMK Planet Watch - Interface PHP" /MIN "%PHP_EXE%" -S 127.0.0.1:8789 -t "%~dp0" "%~dp0router.php"
echo Verificando os servidores...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ok=$false; for($n=0;$n -lt 15;$n++){try{$p=Invoke-WebRequest -UseBasicParsing -TimeoutSec 2 'http://127.0.0.1:8789/';$a=Invoke-RestMethod -TimeoutSec 2 'http://127.0.0.1:8788/health'; if($p.StatusCode -eq 200 -and $a.status -eq 'ok'){$ok=$true;break}}catch{};Start-Sleep -Milliseconds 600}; if($ok){exit 0}else{exit 1}"
if errorlevel 1 (
  echo.
  echo AVISO: Um servidor nao respondeu. Verifique as janelas PHP/Python.
  echo Portas necessarias: 8788 e 8789; outra aplicacao pode estar usando.
  pause
  exit /b 1
)
start "" "http://127.0.0.1:8789"
echo Aberto! Feche as janelas de servidor para encerrar os servicos.
exit /b 0
