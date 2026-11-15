# WMK Virtual Journey v0.1 — primeiro passeio virtual executável

**Primeira versão demonstrativa independente**, criada para acompanhar a suíte WMK TerraStudio. Não é ainda uma experiência fotorrealista ou um simulador com física aeronáutica.

## O que está implementado

- Globo 3D CesiumJS, sem token Ion, com imagem cartográfica OpenStreetMap e terreno elipsoidal (não há terreno fotográfico/altimétrico nesta versão).
- Seleção de **Airbus A320, Boeing 737-800, Cessna 172 e Airbus H125**. Cada um possui **layout visual de painel didático próprio**, não réplica certificada do cockpit.
- Quatro regiões: Nova Friburgo, Rio de Janeiro, Alpes e Nova York.
- Câmeras: cockpit virtual, perseguição, lateral, superior e livre. Atalhos **1–5**.
- Indicadores de posição, velocidade no solo, altitude, rumo, distância; sliders para movimentação.
- Passeio demonstrativo animado com cálculo geodésico simples e trilha, pausável.
- Simulação explicitamente rotulada: **sem ADS-B/telemetria real**. Representações externas são primitivas 3D geométricas, não modelos detalhados de aeronaves.

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
