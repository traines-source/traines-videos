const SVGNS = "http://www.w3.org/2000/svg";


TNA.Config.default.mapProjection = 'epsg3035';
TNA.Config.default.mapProjectionScale = 0.001;
TNA.Config.default.beckStyle = false;
TNA.Config.default.gravitatorInertness = 0.1;
document.dispatchEvent(new Event('startTransportNetworkAnimator'));


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