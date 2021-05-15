const scale = 240;
const stroke = [0, 10000];


function x(lon) {
    return Math.round(256/Math.PI*(lon/180*Math.PI+Math.PI)*scale, 0);
}
function y(lat) {
    return Math.round(256/Math.PI*(Math.PI-Math.log(Math.tan(Math.PI/4+lat/180*Math.PI/2)))*scale, 0);
}

function borders(geo) {
    const tl = [geo[0][0], geo[0][1]];
    const br = [geo[0][0], geo[0][1]];
    const out = [];
    let draw = 0;
    for (let i=0; i<geo.length; i++) {
        if (i == stroke[draw]) {
            draw++;
            if (draw % 2 == 1) {
                out.push([]);
            }
        }
        if (draw % 2 == 1) {
            out[out.length-1].push([x(geo[i][0]), y(geo[i][1])]);
            if (geo[i][0] < tl[0]) tl[0] = geo[i][0];
            if (geo[i][1] < tl[1]) tl[1] = geo[i][1];
            if (geo[i][0] > br[0]) br[0] = geo[i][0];
            if (geo[i][1] > br[1]) br[1] = geo[i][1];
        }
    }
    console.log('tl_x', x(tl[0]), 'tl_y', y(tl[1]), 'br_x', x(br[0]), 'br_y', y(br[1]), 'c_x', x((tl[0]+br[0])/2), 'c_y', y((tl[1]+br[1])/2));
    const path = 'M ' + out.map(group => group.map(coord => coord.join(' ')).join(' L ')).join(' M ');
    document.getElementById('border').setAttribute('d', path);
}

// Source: https://github.com/ZHB/switzerland-geojson/tree/master/country
fetch("res/borders.json")
  .then(response => response.json())
  .then(borders);

let intvl;
document.addEventListener('epoch', function(e) {
  if (e.detail == '1984' || e.detail == '2022') {
    if (intvl == undefined) {
      let i = -1;
      intvl = window.setInterval(function () {
        i++;      
        document.getElementById('custom-epoch-label').textContent = (12+Math.floor(i/60))+':'+((i%60)+'').padStart(2, '0');
      }, 1000);
    }
  } else {
    if (intvl != undefined) {
      clearInterval(intvl);
      intvl = undefined;
    }
    let year = e.detail;
    if (e.detail == '1983') year = '1982';
    if (e.detail == '2023') year = '2021';
    document.getElementById('custom-epoch-label').textContent = year;
  } 
});