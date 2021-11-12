currentSelected = undefined;
function selectEdge(edgeId) {
    setSelectedForDependents(currentSelected, false);
    setSelectedForDependents(edgeId, true);
    currentSelected = edgeId;
}

function setSelectedForDependents(edgeId, selected) {
    if (edgeId == undefined) {
        return;
    }
    setSelectedForElementId(edgeId, selected);
    setSelectedForClass('shortest-path-'+edgeId, selected);
}

function setSelectedForClass(className, selected) {
    const dependents = document.getElementsByClassName(className);
    for(let i=0;i<dependents.length;i++) {
        setSelectedForElement(dependents[i], selected);
    }
}

function selectSingleEdge(elementId, selected, providerClass) {
    setSelectedForElementId(elementId, selected);
    if (providerClass && selected) {
        document.getElementById(elementId).className.baseVal += ' provider-shortest-path'
    } else if (providerClass && !selected) {
        document.getElementById(elementId).className.baseVal = document.getElementById(elementId).className.baseVal.replace(' provider-shortest-path', '');
    }
    setSelectedForElementId(elementId + '-label', selected);
    setSelectedForElementId(elementId + '-arrival', selected);
    setSelectedForElementId(elementId + '-departure', selected);
}

function setSelectedForElementId(elementId, selected) {
    setSelectedForElement(document.getElementById(elementId), selected);
}

function setSelectedForElement(element, selected) {
    if (selected) {
        element.className.baseVal += " selected";
    } else {
        element.className.baseVal = element.className.baseVal.replace(" selected", "");
    }
}


const edges = document.getElementsByClassName('edge-toucharea');
for(let i=0;i<edges.length;i++) {
    edges[i].onclick = function (evt) {
        const id = this.id.replace('-toucharea', '');
        console.log('selected ', id);
        selectEdge(id);
    }
}

function simulateDelay() {
    const line = document.getElementById('simple-1|49871|0|81|20122021_8098160_1640011020');
    const dep = document.getElementById('simple-1|49871|0|81|20122021_8098160_1640011020-departure');
    const arr = document.getElementById('simple-1|49871|0|81|20122021_8098160_1640011020-arrival');
    const toucharea = document.getElementById('simple-1|49871|0|81|20122021_8098160_1640011020-toucharea');
    const pxPerMin = 4;
    const animator = new TNA.SvgAnimator();
    animator.from(0).to(5).animate(2000, (x, isLast) => {
        const y1 = 305+x*pxPerMin;
        const y2 = 597+x*pxPerMin;
        line.setAttribute('d', 'M 750,'+y1+' L1450,'+y2);
        toucharea.setAttribute('d', 'M 750,'+y1+' L1450,'+y2);
        dep.setAttribute('y', y1);
        dep.innerHTML = '15:'+Math.round(37+x);
        dep.className.baseVal += ' red';
        arr.setAttribute('y', y2);
        arr.innerHTML = '16:'+Math.round(41+x);
        arr.className.baseVal += ' red';
        return true;
    });
}

var i = 0;
function lazyLoadSvg(id) {
    fetch('res/'+id+'.svg')
        .then(response => response.text())
        .then(response => {
            document.getElementById(id).innerHTML = response;
            i++;
            if (i == 3) {
                const event = new Event('startTransportNetworkAnimator');
                document.dispatchEvent(event);
            }
        });
}

lazyLoadSvg('WPAU-WNT-simple');
lazyLoadSvg('WPAU-WNT');
lazyLoadSvg('RM-FHM');