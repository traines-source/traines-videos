DIMEN=10000
RADIUS=$(expr ${DIMEN} / 2)
echo $RADIUS

convert -gravity Center \
         map_10000_scaled.png \
         -extent ${DIMEN}x${DIMEN} \
        \( -size ${DIMEN}x${DIMEN} \
           xc:Black \
           -fill White \
           -draw "circle ${RADIUS} ${RADIUS} ${RADIUS} 1" \
           -alpha Copy \
        \) -compose CopyOpacity -composite \
        -trim map_10000_circ.png