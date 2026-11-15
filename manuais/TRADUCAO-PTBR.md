# Plano de localização para português brasileiro — WMK TerraStudio

**Estado atual:** existe uma primeira variante técnica pt-BR baseada no catálogo português do RustGIS. A revisão integral e o teste de interface no Windows continuam pendentes.

## Onde o programa traduz os textos

- `crates/ui-egui/src/i18n/pt.tsv`: tradução portuguesa original (preservada).
- `crates/ui-egui/src/i18n/pt-br.tsv`: variante brasileira independente, inicialmente derivada da anterior.
- `crates/ui-egui/src/i18n/mod.rs`: catálogo, seleção de idioma, escape de strings e fallback.
- `crates/ui-egui/src/i18n/tests.rs`: testes de parsing, placeholders, contexto, chaves obrigatórias e seleção de localidade.
- `docs/i18n.md`: documentação do mecanismo original.

A interface possui mensagens em inglês que são as chaves. Uma linha do catálogo contém `English<TAB>Português brasileiro`; chaves com sentido ambíguo podem usar `contexto<TAB>English<TAB>Tradução`. A ausência de tradução normalmente resulta em inglês, não em erro.

## Regras da tradução

1. Nunca traduzir o texto-chave inglês, nem nomes de IDs de comandos ou parâmetros das APIs.
2. Conservar placeholders exatamente: `{n}`, `{path}`, `{error}` etc.
3. Manter escapes `\\n`, `\\t`, `\\\\` e o número correto de colunas.
4. Manter nomes de bibliotecas, arquivos e formatos: GeoJSON, RustGIS em chaves compatíveis, CSV, EPSG.
5. Usar termos cartográficos adequados: feição, camada, simbologia, raster, datum, sistema de referência de coordenadas, recorte, zona de influência (*buffer*).
6. Escrever avisos de segurança em português claro, evitando alterar seu significado.
7. Rever textos maiores com a interface aberta: largura dos botões, quebras de linha, tooltips e diálogos.
8. Preservar `pt.tsv` para evitar regressões na tradução do projeto original.

## Verificações de qualidade

```powershell
cargo test --locked -p rustgis-ui-egui i18n
```

Testar também a escolha **Português (Brasil)** em Configurações e a detecção de `pt-BR` e `pt_BR.UTF-8`. Registrar capturas do aplicativo e problemas com a chave inglesa original. Em Windows:

```powershell
$env:RUSTGIS_LANGUAGE="pt-BR"
.\\rustgis.exe
```

O mecanismo de tradução não modifica nomes de arquivos, campos de dados, IDs de comandos nem mensagens emitidas por ferramentas externas. A documentação, CLI, plugins e resultados remotos precisam ser avaliados separadamente.

## Fases de revisão recomendadas

1. Menus e navegação, incluindo caixas de diálogo e mensagens de erro.
2. Ferramentas de mapas, camadas, projeções, simbologia e cartografia.
3. Geoprocessamento, raster, geodésia, operações e banco de dados.
4. Assistente de IA, modelos, MCP, permissões e segurança.
5. Arquivos de ajuda, manuais e documentação para o público brasileiro.
6. Inspeção visual em Windows 10 e navegadores; regressões após sincronizar o fork.

**Créditos:** WMK — Walney Moreira Klein — walneyk@hotmail.com. Código original RustGIS — opengeos e contribuidores (Apache-2.0).
