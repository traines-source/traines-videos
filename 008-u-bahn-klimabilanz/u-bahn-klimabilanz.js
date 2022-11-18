const SVGNS = "http://www.w3.org/2000/svg";
const scale = 9000;

var scenarios = [];

function parseCsv(csv) {
    scenarios = csv.split('\n').map(line => line.split(','));
}

const columnMapping = {
    'original': 1,
    'corrected-concrete': 2,
    'corrected-total': 3,
    'less-passengers': 4,
    'more-passengers': 5,
    'lowcarb-steel': 6,
    'lowcarb-concrete': 7,
    'hh_original': 9,
    'hh_corrected-concrete': 10,
    'hh_corrected-total': 11,
    'hh_official': 12,
    'hh_official-lowcarb': 13,
    'hh_official-lowcarb-highmodal': 14
};

const idx_concrete_kgCO2pm3concrete = 6;
const idx_rebar_steel_kgCO2pm3concrete = 7;
const idx_total_tCO2pKm = 11;
const idx_daily_passengers = 0;
const idx_amortisation_years = 5;
const idx_projects_start = 25;
const project_offset = 10;

const projects = ['u9north', 'u7south', 'u3south', 'u8north', 'u6north', 'u5', 'hh_u5'];

const kgCO2pm3concrete_presscale = 0.3;
const tCO2pKm_presscale = 0.003;
const daily_passengers_presscale = 0.003;
const amortisation_presscale = 1;


function updateBars(scenarioId) {
    calculateBars(scenarioId, columnMapping[scenarioId]);
}

function calculateBars(scenarioId, scenario) {
    console.log('SCENARIO:', scenarioId, scenario);
    
    if (scenario <= 8) {
        drawBar('concrete_kgCO2pm3concrete', scenarios[idx_concrete_kgCO2pm3concrete], scenario, kgCO2pm3concrete_presscale, false);
        drawBar('rebar_steel_kgCO2pm3concrete', scenarios[idx_rebar_steel_kgCO2pm3concrete], scenario, kgCO2pm3concrete_presscale, false);
        drawBar('total_tCO2pKm', scenarios[idx_total_tCO2pKm], scenario, tCO2pKm_presscale, false);
    } else {
        drawBar('hh_total_tCO2pKm', scenarios[idx_total_tCO2pKm], scenario, tCO2pKm_presscale, false);
    }
    for (let i=0; i < projects.length; i++) {
        const key = projects[i];
        if (scenario > 8 && key != 'hh_u5') continue;
        console.log('PROJECT:', key);
        const idx = idx_projects_start+project_offset*i;
        console.log('idx', idx);
        drawBar(key+'_daily_passengers', scenarios[idx+idx_daily_passengers], scenario, daily_passengers_presscale, key != 'hh_u5');
        drawBar(key+'_amortisation', scenarios[idx+idx_amortisation_years], scenario, amortisation_presscale, key != 'hh_u5');
    }
}

function drawBar(id, scenarios, scenario, presentation_scale, vertical) {
    const value = scenarios[scenario];
    if (scenario > 1 && scenarios[scenario-1] == value) {
        return;
    }
    const e = document.getElementById(id);
    const v1 = parseInt(e.getAttribute(vertical ? 'y1': 'x1'));
    const v2 = parseInt(e.getAttribute(vertical ? 'y2': 'x2'));
    const length = value*presentation_scale;
    const label = document.getElementById(id+'_label');
    const newV2 = vertical ? v1-length : v1+length;
    const animator = new TNA.SvgAnimator();
    animator
        .from(v2)
        .to(newV2)
        .ease(TNA.SvgAnimator.EASE_NONE)
        .animate(3000, (x, isLast) => {
            e.setAttribute(vertical ? 'y2' : 'x2', x);
            const cLength = Math.abs(x-v1);
            if (!vertical) label.setAttribute('x', v1+cLength/2);

            label.innerHTML = Math.round(isLast ? value : cLength/presentation_scale);
            label.style.visibility = 'visible';
            return true;
        });    
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
    if (feature.properties['railway'] == 'subway') {
        return ['existing', 'ne', '70 1', 0];
    }
    if (feature.properties['railway'] == 'tram') {
        return ['existing', 'w', '70 1 nozoom', 0];
    }
    return ['undefined', '', '', 0];
}

function render(ubahn, tram, setD) {
    renderRailways(ubahn, setD);
    renderRailways(tram, setD);
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
    path.dataset.line = props[0];
    path.dataset.animOrder = props[1];
    path.dataset.from = props[2];
    path.dataset.speed = 1000;

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
/*
[out:json][timeout:25];
(
  way["railway"="tram"]({{bbox}});
  way["railway"="construction"]["construction"="tram"]({{bbox}});
  way["railway"="proposed"]["proposed"="tram"]({{bbox}});
  relation["route"="tram"]({{bbox}});
  
 
);
out geom;
*/

TNA.Config.default.mapProjectionScale = 3000;
//TNA.Config.default.animSpeed = 10000;


fetch("ubahn.geojson")
.then(response => response.json())
.then(ubahn => 
    fetch("tram.geojson")
    .then(response => response.json())
    .then(tram => render(ubahn, tram, true))
);
fetch("research/u-bahn-berlin.csv")
.then(response => response.text())
.then(csv => parseCsv(csv));
    

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

