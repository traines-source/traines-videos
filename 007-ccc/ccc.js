location.hash = '#2100-0_coalplants-0_industry-0_roadtraffic-0_15degrees-0_population-0_wildfires-0_sealevel-0_wbgt-0';
const mapManager = new CCC.MapManager(new CCC.Vector(600, 300), 3000);

let elapsed = 0;

function defer(delay) {
    const p = new Promise(resolve => setTimeout(resolve, delay));
    elapsed = delay;
    return p;
}

async function perm(delay, permutation) {
    await defer(delay);
    mapManager.setPermutation(permutation);
}

async function scene() {
    await defer(7000);
    mapManager.fetchMapFile('/videos/007-ccc/greenland/out/grown_greenland.csv');
    await perm( 5000, '2100-0_coalplants-0_industry-0_roadtraffic-0_15degrees-0_population-0_wildfires-0_sealevel-0_wbgt-0');

    await perm( 7000, '2100-0_coalplants-0_industry-0_roadtraffic-0_15degrees-0_population-1_wildfires-0_sealevel-0_wbgt-0');
    await perm(25000, '2100-1_coalplants-0_industry-0_roadtraffic-0_15degrees-0_population-1_wildfires-0_sealevel-0_wbgt-0');

    await perm(25000, '2100-1_coalplants-0_industry-0_roadtraffic-0_15degrees-0_population-1_wildfires-1_sealevel-0_wbgt-0');
    await perm(20000, '2100-1_coalplants-0_industry-0_roadtraffic-0_15degrees-0_population-0_wildfires-1_sealevel-0_wbgt-0');
    await perm(13000, '2100-1_coalplants-1_industry-0_roadtraffic-0_15degrees-0_population-0_wildfires-1_sealevel-0_wbgt-0');
    await perm(10000, '2100-1_coalplants-1_industry-1_roadtraffic-0_15degrees-0_population-0_wildfires-1_sealevel-0_wbgt-0');
    await perm( 5000, '2100-1_coalplants-1_industry-1_roadtraffic-1_15degrees-0_population-0_wildfires-1_sealevel-0_wbgt-0');
    await perm(19000, '2100-0_coalplants-1_industry-1_roadtraffic-1_15degrees-0_population-0_wildfires-1_sealevel-0_wbgt-0');
    
    await perm( 7000, '2100-0_coalplants-0_industry-0_roadtraffic-0_15degrees-0_population-0_wildfires-0_sealevel-0_wbgt-0');
    
    await perm( 7000, '2100-1_coalplants-0_industry-0_roadtraffic-0_15degrees-0_population-0_wildfires-0_sealevel-1_wbgt-0');
    await perm(19000, '2100-1_coalplants-1_industry-0_roadtraffic-0_15degrees-0_population-0_wildfires-0_sealevel-1_wbgt-0');
    await perm( 5000, '2100-1_coalplants-1_industry-1_roadtraffic-0_15degrees-0_population-0_wildfires-0_sealevel-1_wbgt-0');
    await perm( 5000, '2100-1_coalplants-1_industry-1_roadtraffic-1_15degrees-0_population-0_wildfires-0_sealevel-1_wbgt-0');
    await perm( 5000, '2100-1_coalplants-1_industry-1_roadtraffic-1_15degrees-1_population-0_wildfires-0_sealevel-1_wbgt-0');
    await perm(12000, '2100-0_coalplants-1_industry-1_roadtraffic-1_15degrees-1_population-0_wildfires-0_sealevel-1_wbgt-0');
    
    await perm(10000, '2100-1_coalplants-0_industry-0_roadtraffic-0_15degrees-0_population-1_wildfires-0_sealevel-1_wbgt-0');

    await perm(24000, '2100-0_coalplants-0_industry-0_roadtraffic-0_15degrees-0_population-0_wildfires-0_sealevel-0_wbgt-0');
    
    await perm( 7000, '2100-0_coalplants-0_industry-0_roadtraffic-0_15degrees-0_population-0_wildfires-0_sealevel-0_wbgt-1'); //3:58
    await perm(16000, '2100-1_coalplants-1_industry-1_roadtraffic-1_15degrees-1_population-0_wildfires-0_sealevel-0_wbgt-1');
    await perm( 6000, '2100-1_coalplants-1_industry-1_roadtraffic-1_15degrees-0_population-0_wildfires-0_sealevel-0_wbgt-1');
    await perm( 6000, '2100-1_coalplants-1_industry-1_roadtraffic-0_15degrees-0_population-0_wildfires-0_sealevel-0_wbgt-1');
    await perm( 6000, '2100-1_coalplants-1_industry-0_roadtraffic-0_15degrees-0_population-0_wildfires-0_sealevel-0_wbgt-1');
    await perm( 6000, '2100-1_coalplants-0_industry-0_roadtraffic-0_15degrees-0_population-0_wildfires-0_sealevel-0_wbgt-1');
    await perm(21000, '2100-1_coalplants-1_industry-0_roadtraffic-0_15degrees-0_population-0_wildfires-0_sealevel-0_wbgt-1');
    await perm( 4000, '2100-1_coalplants-1_industry-1_roadtraffic-0_15degrees-0_population-0_wildfires-0_sealevel-0_wbgt-1');
    await perm( 4000, '2100-1_coalplants-1_industry-1_roadtraffic-1_15degrees-0_population-0_wildfires-0_sealevel-0_wbgt-1');
    await perm( 6000, '2100-1_coalplants-1_industry-1_roadtraffic-1_15degrees-1_population-0_wildfires-0_sealevel-0_wbgt-1');
    await perm(12000, '2100-1_coalplants-1_industry-1_roadtraffic-1_15degrees-0_population-1_wildfires-0_sealevel-0_wbgt-1');
    
    await perm(10000, '2100-0_coalplants-0_industry-0_roadtraffic-0_15degrees-0_population-0_wildfires-0_sealevel-0_wbgt-0');

    await perm( 7000, '2100-1_coalplants-0_industry-0_roadtraffic-0_15degrees-0_population-1_wildfires-1_sealevel-0_wbgt-0');
    await perm(10000, '2100-1_coalplants-0_industry-0_roadtraffic-0_15degrees-0_population-1_wildfires-0_sealevel-1_wbgt-0');
    await perm(10000, '2100-1_coalplants-0_industry-0_roadtraffic-0_15degrees-0_population-1_wildfires-0_sealevel-0_wbgt-1');
    await defer(5000);
    document.getElementById('link').style.opacity = '1.0';
}

mapManager.loadMappings();

scene();
