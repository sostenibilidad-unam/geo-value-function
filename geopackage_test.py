import gdaltools
gdaltools.Wrapper.BASEPATH = "/Users/fidel/anaconda2/envs/geo-value-function/bin/"
in_gpkg = r"/Users/fidel/Documents/GitHub/megadapt/src/r/megadaptr/inst/rawdata/censusblocks/megadapt_wgs84_v16.gpkg"
in_shp = "/Users/fidel/geo-value-function/uploads/critical_zones.shp"
out_geojson = "/Users/fidel/geo-value-function/m_17.json"

ogr = gdaltools.ogr2ogr()
ogr.set_encoding("UTF-8")
ogr.set_input(in_gpkg, srs="EPSG:4326")
ogr.set_output(out_geojson)
ogr.execute()
