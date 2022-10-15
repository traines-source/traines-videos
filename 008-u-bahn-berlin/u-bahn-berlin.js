const SVGNS = "http://www.w3.org/2000/svg";
const scale = 10000;


const total_concrete_tCO2pkm = (10954.7+727.6+1000+22875.8)*1.25+28215.9+1036.3;
const rest_tCO2pkm = (205.4+61.1+15.9+62.5+500+500+1000+428.3+178.5)*1.25+4000+250+535.4+200.8+73.2+1200+800+730.8+428.4+800;
const variable_rest_tCO2pkm = 8394.1+4000;
const ratio_concrete = total_concrete_tCO2pkm/(total_concrete_tCO2pkm+rest_tCO2pkm+variable_rest_tCO2pkm);
const modal_split_shift = 0.2;

const scenarios = {
    "original": {
        "concrete_kgCO2pm3concrete": 728,
        "rebar_steel_kgCO2pm3concrete": 942,
        "variable_rest_tCO2pkm": variable_rest_tCO2pkm,
        "projects": {
            "u7south": {
                "daily_passengers": 38000,
                "modal_split_saved_tCO2pPerson": 0.418/1.25*1.25,
                "additional_tCO2": 13000+17500+35000 
            },
            "u3south": {
                "daily_passengers": 7000,
                "modal_split_saved_tCO2pPerson": 0.418/1.25,
                "additional_tCO2": 0 
            },
            "u8north": {
                "daily_passengers": 12000,
                "modal_split_saved_tCO2pPerson": 0.418/1.25,
                "additional_tCO2": 13000
            },
            "u6north": {
                "daily_passengers": 8000,
                "modal_split_saved_tCO2pPerson": 0.418/1.25,
                "additional_tCO2": 26250+13000
            },
        }
    }
}




function x(lon) {
    return Math.round(256/Math.PI*(lon/180*Math.PI+Math.PI)*scale*10)/10;
}
function y(lat) {
    return Math.round(256/Math.PI*(Math.PI-Math.log(Math.tan(Math.PI/4+lat/180*Math.PI/2)))*scale*10)/10;
}

let tl = undefined;
let br = undefined;

function updateBbox(coord) {
    if (tl == undefined) {
        tl = coord.slice();
        br = coord.slice();
        return;
    }
    if (coord[0] < tl[0]) tl[0] = coord[0];
    if (coord[1] < tl[1]) tl[1] = coord[1];
    if (coord[0] > br[0]) br[0] = coord[0];
    if (coord[1] > br[1]) br[1] = coord[1];
}

function setViewBox() {
    const svg = document.getElementsByTagName('svg')[0];
    const width = x(br[0])-x(tl[0]);
    const height = y(tl[1])-y(br[1]);
    // should be hardcoded, to avoid race conditions
    svg.setAttribute('viewBox', x(tl[0]) + ' ' + y(br[1]) + ' ' + width + ' ' + height);
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
}

function makeGroup(coordinates) {
    coordinates.map(updateBbox);
    return coordinates.map(coord => x(coord[0]) + ' ' + y(coord[1])).join(' L ');
}

function makeD(geometry) {
    if (geometry.type == "LineString") {
        return 'M ' + makeGroup(geometry.coordinates);
    }
    if (geometry.type == "MultiLineString") {
        return 'M ' + geometry.coordinates.map(group => makeGroup(group)).join(' M ');
    }
}

function insideRectangle(coords, tl, br) {
    return coords[0] > tl[0] && coords[0] < br[0] && coords[1] < tl[1] && coords[1] > br[1];
}

function getLineProperties(feature) {
    if (feature.geometry.type == "Point" || feature.properties["route"] != undefined) {
        return ['undefined', '', '', 0];
    }
    if (feature.properties['railway'] != 'construction' && feature.properties['railway'] != 'proposed') {
        return ['existing', '', '0 1', 0];
    }
    return ['undefined', '', '', 0];
}

function render(railways, setD) {
    renderRailways(railways, setD);
    const event = new Event('startTransportNetworkAnimator');
    document.dispatchEvent(event);
}

function renderRailways(geojson, setD) {
    geojson.features.sort((a, b) => (getLineProperties(a)[0] > getLineProperties(b)[0]) ? 1 : -1);
    for (let i=0; i<geojson.features.length; i++) {
        const feature = geojson.features[i];
        drawFeature(feature, setD);
    }
    if (setD) {
        //setViewBox();
        console.log('tl_x', x(tl[0]), 'tl_y', y(tl[1]), 'br_x', x(br[0]), 'br_y', y(br[1]), 'c_x', x((tl[0]+br[0])/2), 'c_y', y((tl[1]+br[1])/2));
    }
}

function drawFeature(feature, setD) {
    const props = getLineProperties(feature);
    if (props[0] == 'undefined') {
        return;
    }
    const clazz = props[0] + ' route-' + feature.properties['route'] + ' railway-' + feature.properties['railway'] + ' tunnel-' + feature.properties['tunnel'] + ' relations-' + (feature.properties['@relations'] != undefined ? 'child' : '');
    const path = getOrCreatePath(feature.id);
    if (!path.className.baseVal.includes(clazz)) {
        path.className.baseVal += ' ' + clazz;
    }
    if (props[0] != 'existing') {
        path.dataset.line = props[0];
        path.dataset.animOrder = props[1];
        path.dataset.from = props[2];
        path.dataset.speed = props[3];
    } else {
        path.dataset.from = props[2];
        //path.dataset.to = props[2];
    }
    if (setD) {
        path.setAttribute('d', makeD(feature.geometry));
    }
}

function getOrCreatePath(id) {
    let element = document.getElementById(id);
    if (element == undefined) {
        element = document.createElementNS(SVGNS, 'path');
        element.id = id;
        document.getElementById('geo')?.appendChild(element);
    }
    return element;
}

/*
[out:json][timeout:25];
(
  way["railway"="subway"]({{bbox}});
  way["railway"="construction"]["construction"="subway"]({{bbox}});
  way["railway"="proposed"]["proposed"="subway"]({{bbox}});
  relation["route"="subway"]({{bbox}});
  
 
);
out geom;
*/

TNA.Config.default.mapProjectionScale = 3000;
TNA.Config.default.animSpeed = 10000;

fetch("railways.geojson")
    .then(response => response.json())
    .then(railways => 
        render(railways, true)
    );
    

function fetchLocal(url) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest
        xhr.onload = function() {
            resolve(new Response(xhr.responseText, {status: 200}))
        }
        xhr.onerror = function() {
            reject(new TypeError('rrequest failed'))
        }
        xhr.open('GET', url)
        xhr.send(null)
    })
}

let intvl;
document.addEventListener('epoch', function(e) {
  if (e.detail == '70') {
    if (intvl == undefined) {
      let i = -1;
      intvl = window.setInterval(function () {
        i++;      
        document.getElementById('custom-epoch-label').textContent = ((6+Math.floor(i/60))+'').padStart(2, '0')+':'+((i%60)+'').padStart(2, '0');
      }, 1000);
    }
  } else {
    if (intvl != undefined) {
      clearInterval(intvl);
      intvl = undefined;
    }
  } 
});


function resolveTl(element, relativeToElementId='zoomable') {
    if (document.getElementById(relativeToElementId) != undefined) {
        const zoomable = document.getElementById(relativeToElementId);
        const zRect = zoomable.getBoundingClientRect();
        const zBox = zoomable.getBBox();
        const lRect = element.getBoundingClientRect();
        const zScale = zBox.width/zRect.width;
        const x = (lRect.x-zRect.x)*zScale+zBox.x;
        const y = (lRect.y-zRect.y)*zScale+zBox.y;
        return [x, y];
    }
    return 'please set relativeToElementId';    
}

function pinpointMouse(relativeTo=[0, 0]) {
    const svg = document.querySelector('svg');
    const pt = svg.createSVGPoint();
    svg.addEventListener('mousedown',function(evt){
        pt.x = evt.clientX; pt.y = evt.clientY;
        const pos = pt.matrixTransform(svg.getScreenCTM().inverse())
        console.log(pos.x-relativeTo[0], pos.y-relativeTo[1]);
    }, false);
}

function padding(element, padding) {
    const box = element.getBBox();
    return '<rect x="'+(box.x-padding)+'" y="'+(box.y-padding)+'" width="'+(box.width+padding*2)+'" height="'+(box.height+padding*2)+'" class="dummy helper" data-from="0 0 noanim" />';
}

//pinpointMouse(resolveTlBr($0))

