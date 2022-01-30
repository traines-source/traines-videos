SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

g.region n=85 s=30 w=-30 e=70 nsres=0.008333 ewres=0.008333

r.mask vect=europe_continent --overwrite

g.remove -f type=vector name=elev_vec,elev_vec_cleaned,elev_vec_gen0,elev_vec_gen1
echo "Coloring..."
r.colors map=elev_mosaic@PERMANENT color=elevation
echo "Outputting..."
r.out.png -t --overwrite input=elev_mosaic@PERMANENT output=${SCRIPT_DIR}/out/europe_elev.png
echo "Done."