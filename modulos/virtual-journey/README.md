# WMK Virtual Journey v0.1 — primeiro passeio virtual executável

**Primeira versão demonstrativa independente**, criada para acompanhar a suíte WMK TerraStudio. Não é ainda uma experiência fotorrealista ou um simulador com física aeronáutica.

## Erro 429 e teste independente

O conector aplica um intervalo global entre chamadas externas para preservar a cota do ADS-B.lol. Se pesquisar várias regiões consecutivamente, o programa informa o tempo de espera em português, em vez de exibir somente um erro 429 sem explicação. Esse limite é **local**, definido pelo WMK. O provedor também pode responder HTTP 429 independentemente; quando isso acontecer, o programa explica que a limitação vem do provedor.

Para **testar mesmo sem API**, clique em **"Testar com 4 aeronaves simuladas"**. Os quatro exemplos fictícios A320, B738, C172 e H125 aparecem na lista e podem ser selecionados no cockpit. Eles são explicitamente rotulados como DEMONSTRAÇÃO, sem fingir que são voos reais.

O cache do PHP fica na pasta temporária do sistema, separado do repositório, e pode continuar ativo após fechar o servidor. Reiniciar o PHP não elimina necessariamente o intervalo de proteção.

## Consultar aeronaves reais (ADSB.lol)

Inicie com **`INICIAR.cmd`** (requer PHP/XAMPP). Escolha uma região, clique em **Buscar aeronaves** e selecione um voo da lista. O servidor consulta a [API ADS-B.lol](https://www.adsb.lol/docs/open-data/api) num raio de 100 milhas náuticas. Dados disponíveis: identificação, matrícula, tipo ICAO (quando informado), latitude, longitude, altitude, velocidade sobre o solo e rumo.

**Limites:** a API gratuita tem 500 chamadas/dia/IP, sujeitas a alterações. O módulo aplica cache de 180 s, intervalo mínimo de 180 s entre consultas externas e limite local de 430 chamadas/dia. As buscas são **manuais**, sem polling frequente. Não há garantia de cobertura de todas as regiões.

Após selecionar um avião, o movimento 3D é **projetado** por no máximo 20 segundos a partir dos dados recebidos. NÃO equivale a vídeo real, nem fornece instrumentos internos, rotas completas ou destinos. Cockpits são ilustrativos. Quando o modelo não é reconhecido, usamos painel genérico explicitamente identificado.

O painel ganhou modo compacto para ampliar o campo de visão. Se não aparecer terreno/imagem, verifique tiles OSM, conexão, WebGL e drivers de vídeo.

## O que está implementado

- Globo 3D CesiumJS, sem token Ion, com imagem cartográfica OpenStreetMap e terreno elipsoidal (não há terreno fotográfico/altimétrico nesta versão).
- Seleção de **Airbus A320, Boeing 737-800, Cessna 172 e Airbus H125**. Cada um possui **layout visual de painel didático próprio**, não réplica certificada do cockpit.
- Quatro regiões: Nova Friburgo, Rio de Janeiro, Alpes e Nova York.
- Câmeras: cockpit virtual, perseguição, lateral, superior e livre. Atalhos **1–5**.
- Indicadores de posição, velocidade no solo, altitude, rumo, distância; sliders para movimentação.
- Passeio demonstrativo animado com cálculo geodésico simples e trilha, pausável.
- Simulação explicitamente rotulada: **sem ADS-B/telemetria real**. Representações externas são primitivas 3D geométricas, não modelos detalhados de aeronaves.

## Um clique no Windows com PHP ou XAMPP

Clique duas vezes em **`INICIAR.cmd`** na pasta deste módulo. O script procura o PHP no PATH e nas instalações comuns do XAMPP, inicia **PHP na porta 8791**, verifica a resposta e abre **http://127.0.0.1:8791** automaticamente.

**Requisitos:** PHP 8/XAMPP e internet para CesiumJS e mapas. Não é necessário Apache nem Python neste módulo. Feche a janela do PHP para parar. O arquivo `INICIAR.cmd` não altera configurações globais do XAMPP.

## Como executar no Windows

Na raiz do repositório:

~~~powershell
cd modulos/virtual-journey
py -3 -m http.server 8791 --bind 127.0.0.1
~~~

Abra **http://127.0.0.1:8791**. A aplicação usa uma CDN CesiumJS e tiles do OpenStreetMap; precisa de internet, WebGL habilitado e navegador moderno. Em PC com GPU antiga, desempenho pode ser limitado.

**Testes sem internet:** com Node.js instalado, execute \`npm test\` na pasta do módulo. O teste valida a matemática e a estrutura de aeronaves; testes visuais no Windows ainda não foram feitos.

## Sobre "cockpits reais" e rastreamento

Um cockpit fiel de A320/737/H125 precisa de **modelos 3D licenciados**, texturas, posições de instrumentos e programação de sistemas. Nesta versão, os mostradores são apenas **didáticos e estilizados por modelo**, não reproduções reais detalhadas. A fonte de movimento é **simulação local**.

As APIs ADS-B e OpenSky **não fornecem** posição de switches, motores, atitude real completa, IAS, flaps ou estado do cockpit. Para dados rastreados serão usados valores observados de posição/velocidade/rumo e qualquer outro dado que a fonte autorize, com rotulagem clara dos estimados.

## Próximos passos documentados no roadmap

1. Integrar a camada de voos do **WMK Geo Intelligence** (OpenSky/ADS-B.lol) com seleção de aeronave.
2. Mapear ICAO/aircraft-type para a biblioteca de cockpits, sem identificar modelos quando o dado não os fornece.
3. Implementar cabines **3D fidedignas e licenciadas** por aeronave e instrumentos adequados; sem fingir que a API fornece parâmetros de sistemas.
4. Terrain detalhado, paisagem, aeronaves 3D completas, áudio e novas câmeras.
5. Navios, trens e veículos terrestres a partir de fontes públicas ou simulações.
6. Testar FPS, compatibilidade Windows 10 e acessibilidade.

**WMK:** Walney Moreira Klein — walneyk@hotmail.com. CesiumJS © Cesium contributors; tiles © OpenStreetMap contributors. Projeto base RustGIS/opengeos, Apache-2.0.
