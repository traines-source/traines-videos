const SVGNS = "http://www.w3.org/2000/svg";

function fuzzy(frequency) {
    if (frequency < 0.3) return 'some';
    if (frequency < 0.6) return 'e2h';
    if (frequency < 1.3) return 'e1h';
    if (frequency < 2.8) return 'e30m';
    return 'e15m';
}

fetch('research/analysis-dtakt-railml.json').then(resp => resp.json()).then(json => {
    stations = json['stations'];
    console.log(json['stations']['AELB']);
    const container = document.getElementById('regionalverkehr');
    console.log(Object.keys(stations).length);
    const bb = new TNA.BoundingBox(TNA.Vector.NULL, TNA.Vector.NULL);
    for(let key of Object.keys(stations)) {
        const el = document.createElementNS(SVGNS, 'rect');
        el.dataset.lonLat = stations[key]['lon'] + ' ' + stations[key]['lat'];
        bb.add(new TNA.Vector(stations[key]['lon'], stations[key]['lat']));
        el.dataset.station = 'rv_'+key;
        //el.dataset.from = "2050 1";
        const m = Math.max(stations[key]['dtakt'], stations[key]['gtfs']);
        const diff = stations[key]['gtfs'] == 0 ? 0 : m-stations[key]['gtfs'];
        el.className.baseVal = 'station dtakt-'+fuzzy(m)+' diff-'+fuzzy(diff) + ' ' + stations[key]['dtakt'] + ' ' + stations[key]['gtfs'];
        container.appendChild(el);
    }
    console.log(bb);

    TNA.Config.default.gravitatorUseInclinationInertness = false;
    TNA.Config.default.gravitatorInertness = 0.25;
    TNA.Config.default.mapProjectionScale = 100;
    TNA.Config.default.trainWagonLength = 10;
    TNA.Config.default.trainTimetableSpeed = 180;

    window.setTimeout(function() {    
      var event = new Event('startTransportNetworkAnimator');
      document.dispatchEvent(event);
    }, 1);

})

let intvl;
document.addEventListener('epoch', function(e) {
  if (e.detail == '2040') {
    if (intvl == undefined) {
      let i = -1;
      intvl = window.setInterval(function () {
        i++;      
        document.getElementById('custom-epoch-label').textContent = ((12+Math.floor(i/60))+'').padStart(2, '0')+':'+((i%60)+'').padStart(2, '0');
      }, 1000/3);
    }
  } else {
    if (intvl != undefined) {
      clearInterval(intvl);
      intvl = undefined;
    }
  } 
});