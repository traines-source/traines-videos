set -e

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

g.region $(r.proj input=elev_mosaic output=elev_proj location=wgs84 mapset=PERMANENT method=nearest -g)

r.proj input=elev_mosaic output=elev_proj location=wgs84 mapset=PERMANENT method=nearest --overwrite

echo "Coloring..."
r.colors map=elev_proj@PERMANENT rules=${SCRIPT_DIR}/color.txt
echo "Outputting..."
r.out.png -t --overwrite input=elev_proj@PERMANENT output=${SCRIPT_DIR}/out/europe_elev.png
echo "Done."