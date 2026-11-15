"""WMK: exportar GeoJSON público do Planet Watch para o TerraStudio."""
import argparse
import json
from pathlib import Path
from urllib.request import urlopen
SOURCES={"earthquakes":"terremotos","events":"eventos"}
def export_geojson(source,output):
    if source not in SOURCES:raise ValueError("Fonte não autorizada")
    with urlopen("http://127.0.0.1:8788/api/"+source,timeout=12) as r:
        raw=r.read(5_000_001)
        if r.status!=200 or len(raw)>5_000_000:raise ValueError("Resposta inválida")
    data=json.loads(raw)
    if not isinstance(data,dict) or data.get("type")!="FeatureCollection" or not isinstance(data.get("features"),list):
        raise ValueError("Não é FeatureCollection")
    output=Path(output);output.parent.mkdir(parents=True,exist_ok=True)
    temp=output.with_suffix(".geojson.tmp")
    temp.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding="utf-8")
    temp.replace(output)
    return len(data["features"])
if __name__=="__main__":
    p=argparse.ArgumentParser(description="WMK TerraStudio - exportação GeoJSON")
    p.add_argument("fonte",choices=list(SOURCES))
    p.add_argument("--saida",type=Path)
    a=p.parse_args();out=a.saida or Path("dados")/(SOURCES[a.fonte]+".geojson")
    print(f"Feições: {export_geojson(a.fonte,out)} | Arquivo: {out}")
