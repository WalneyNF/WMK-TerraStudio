# Comunicação Planet Watch → TerraStudio

Este adaptador faz um intercâmbio real de dados públicos usando **GeoJSON**, sem alterar o motor Rust.

**Iniciar** (na raiz do repositório, em um PowerShell):

```powershell
cd modulos/planet-watch
py -3 server.py
```

**Exportar** (em outro PowerShell na mesma pasta):

```powershell
py -3 exportar_geojson.py earthquakes --saida dados/terremotos.geojson
py -3 exportar_geojson.py events --saida dados/eventos.geojson
```

Abra os arquivos gerados no RustGIS/WMK TerraStudio usando **Add Data / Adicionar dados**. Os dados são de fontes públicas. Testes automatizados validam a conversão; a importação visual no Windows ainda deve ser homologada.

O script só aceita `earthquakes` e `events`. Não acessa GPS, não aceita URLs arbitrárias e não expõe credenciais.

**Créditos:** Walney Moreira Klein — walneyk@hotmail.com. Motor GIS: RustGIS/opengeos e contribuidores (Apache-2.0).
