SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

g.region n=80 s=30 w=-30 e=70 nsres=0.02 ewres=0.02

r.mask vect=europe_continent --overwrite

echo "Vectorizing..."
r.to.vect -v --overwrite input=elev_mosaic@PERMANENT output=elev_vec type=area
echo "Cleaning..."
v.clean --overwrite input=elev_vec@PERMANENT output=elev_vec_cleaned tool=rmarea threshold=0.05
echo "Simplifying..."
v.generalize --overwrite input=elev_vec_cleaned@PERMANENT type=area output=elev_vec_gen0 method=reduction threshold=0.001
v.generalize --overwrite input=elev_vec_gen0@PERMANENT type=area output=elev_vec_gen1 method=reduction threshold=0.08
echo "Outputting..."
v.out.ogr -s --overwrite input=elev_vec_gen1@PERMANENT output=${SCRIPT_DIR}/out/europe_elev.geojson format=GeoJSON lco=COORDINATE_PRECISION=3
echo "Done."