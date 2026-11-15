# WMK TerraStudio — Planet Watch v0.1 (laboratório)

Este é o primeiro módulo operacional separado do TerraStudio, desenvolvido em Python 3.10+ (biblioteca padrão) e JavaScript/Leaflet. Pode funcionar ao lado do RustGIS sem alterar nem quebrar seu motor.

## Um clique no Windows (PHP/XAMPP + Python)

Clique duas vezes em **`INICIAR.cmd`** na pasta deste módulo.

O arquivo detecta `php.exe` no PATH ou no XAMPP (C:/D:/E:/xampp), inicia a **API Python na porta 8788** e publica a interface com **PHP na porta 8789** através do roteador local `router.php`. Após verificar os servidores, abre automaticamente **http://127.0.0.1:8789**.

**Requisitos:** PHP 8 (ou XAMPP), Python 3 e internet. Não é necessário iniciar Apache. O PHP não substitui o Python: o arquivo `router.php` é proxy apenas das rotas públicas permitidas e não expõe o código Python como arquivo estático. Feche as duas janelas de servidores para encerrar a execução. Não expor as portas na rede externa.

**Alternativa sem PHP:** execute `py -3 server.py` e use http://127.0.0.1:8788.

## Executar no Windows

Abrir PowerShell na raiz do projeto:

    cd modulos/planet-watch
    py -3 server.py

Abrir http://127.0.0.1:8788 no navegador. A interface e os mapas exigem conexão à internet. Os tiles do OpenStreetMap dependem de CDN/servidores externos e da política de uso do provedor.

## Testar

Na mesma pasta, em outro terminal:

    py -3 -m unittest discover -s tests -v

## Endpoints

- GET /health — saúde do módulo local
- GET /api/sources — catálogo resumido
- GET /api/earthquakes — pontos USGS em GeoJSON
- GET /api/events — eventos NASA EONET do tipo ponto em GeoJSON
- GET /api/weather?lat=-22.28&lon=-42.53 — clima Open-Meteo
- GET /api/gps — 403 intencional (exige revisão da autenticação do Bridge legado)

O módulo limita cada resposta externa a 2 MB, mantém um cache em memória e usa URLs fixas. Não há armazenamento histórico, atualização contínua, autenticação de usuários nem produção comercial homologada. Não expor a porta 8788 para internet.

## O que ainda não é integrado

Aeronaves ADS-B, AIS, satélites e MCP do Geo Intelligence, ferramentas do TerraStudio RustGIS, dispositivos do Traccar e câmeras externas. Estes ficam em projetos independentes até existirem conectores seguros e testes end-to-end.

## Roteiro dos próximos módulos

1. Conector MCP para a sessão GIS em modo somente leitura, com aprovação para alterações.
2. Integração Cesium com o Geo Intelligence e catálogo de aeronaves/navios/satélites.
3. Leitura GPS do Traccar via Bridge com autenticação e autorização por dispositivo.
4. Replays, alertas, comparação histórica e fontes como INPE, webcams públicas e qualidade do ar.

## Créditos

Personalização WMK: Walney Moreira Klein — walneyk@hotmail.com.
Motor original: opengeos/RustGIS, colaboradores e Apache-2.0.
As fontes públicas USGS, NASA EONET, Open-Meteo e OpenStreetMap possuem seus próprios termos de uso.
