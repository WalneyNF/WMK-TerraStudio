# Arquitetura modular — WMK TerraStudio

## Visão geral

WMK TerraStudio **não é um monolito**. Cada componente é executável isoladamente e comunica-se por contratos públicos internos versionados.

| Componente | Tecnologia | Endereço padrão | Estado |
| --- | --- | --- | --- |
| Desktop SIG (RustGIS) | Rust / egui | Aplicativo nativo | MCP nativo existe na base; nome WMK ainda em validação |
| Planet Watch | Python + Leaflet | http://127.0.0.1:8788 | USGS, NASA EONET e Open-Meteo implementados |
| Geo Intelligence | Node + Cesium | http://127.0.0.1:4173 | Serviço independente, MCP próprio |
| Geo Bridge legado | Python | http://127.0.0.1:8766 | Leitura GPS não autenticada na API legada: não publicar |
| GPS Tracker | Java / Traccar | http://127.0.0.1:8082 | Serviço independente, API do Traccar |
| TerraStudio MCP relay | RustGIS | 127.0.0.1:8767 | Exige aplicativo aberto e ativação manual |
| TerraStudio MCP HTTP | RustGIS | http://127.0.0.1:8768/mcp | Exige Bearer token e ativação do relay |

## Fluxos de integração

1. **Planet Watch → TerraStudio**: endpoint local \`GET /api/earthquakes\` ou \`GET /api/events\` produz GeoJSON FeatureCollection. Consumir por ferramenta de importação de dados por URL ou exportar como .geojson, conforme suporte efetivo do aplicativo. Não exige MCP para ler dados públicos.
2. **Geo Intelligence → TerraStudio**: criar adaptador JSON/GeoJSON com listas de posições autorizadas e metadados \`source\`, \`timestamp\`, \`observedAt\`, \`stale\`. Não copiar as implementações Cesium para o motor RustGIS.
3. **Geo Bridge → TerraStudio**: somente após autorização de leitura por usuário e dispositivo; transformar posições validadas em GeoJSON e expor dados sensíveis somente a clientes autenticados.
4. **IA → TerraStudio**: MCP existente (\`rustgis-cli mcp --attach\`) após habilitar **Let your Agents Control RustGIS**. Controle de alterações por confirmação, full access desabilitado e auditoria ativa.
5. **Central de monitoramento**: \`GET /api/integrations\` no Planet Watch verifica apenas diagnósticos HTTP fixos em localhost; nenhum token ou localização privada é retornado.

## Contrato GeoJSON público

A resposta deve seguir:
\`\`\`json
{"type":"FeatureCollection","features":[{"type":"Feature","geometry":{"type":"Point","coordinates":[-42.5,-22.2]},"properties":{"source":"USGS","timestamp":1794710000000,"name":"Exemplo ilustrativo"}}]}
\`\`\`

A ordem é longitude, latitude (WGS84/EPSG:4326). Fonte e tempo devem acompanhar cada feição. O consumidor **não deve** presumir atualização em tempo real.

## Segurança

- Somente loopback enquanto os sistemas forem laboratoriais.
- Nunca permitir que uma URL arbitrária vinda de requisição faça o backend consultar serviços locais (SSRF).
- O diagnóstico HTTP deve consultar uma lista fixa de \`/health\` ou endpoints de metadados.
- Não expor credenciais de Traccar, MCP, OpenSky ou outros provedores ao navegador.
- Não incluir dados GPS privados em \`/api/integrations\`.
- Quando disponível, usar o Bridge protegido com autenticação inclusive nas rotas de leitura.
- Registros de ações MCP nunca devem conter tokens de provedores; preservar trilha de auditoria.
- A interface não deve sinalizar que uma integração está operacional só porque uma porta respondeu.

## Roadmap e controle de escopo

O status oficial é mantido em **\`roadmap.json\`**. A página **\`roadmap.html\`** apresenta tarefas, dependências, estado e evidências. \`implemented\` não significa testado; \`done\` exige verificação no código publicado.

Abra com:

\`\`\`powershell
py -3 -m http.server 8790
\`\`\`

Em seguida: http://127.0.0.1:8790/roadmap.html

**Créditos WMK:** Walney Moreira Klein — walneyk@hotmail.com. **Projeto base:** RustGIS / opengeos e colaboradores, Apache-2.0.


## Primeiro adaptador funcional

O script [exportar_geojson.py](../modulos/planet-watch/exportar_geojson.py) consome GeoJSON público do Planet Watch e o grava para importação no TerraStudio. Consulte [o passo a passo](../modulos/planet-watch/INTEGRACAO-TERRASTUDIO.md). Testes automatizados cobrem o formato, mas a interação visual ainda requer validação no Windows.
