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

function selectSingleEdge(elementId, selected) {
    setSelectedForElementId(elementId, selected);
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


const animator = new TNA.SvgAnimator();
animator.wait(1000, () => {
    console.log('asdfklh');
});   