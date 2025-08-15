const centerLat = 55.75;
const centerLon = 37.61;
const zoom = 10;

window.map_ = L.map('map_', {
    attributionControl: false,
    zoomControl: window.innerWidth >= 1000
}).setView([centerLat, centerLon], zoom);
/* https://core-renderer-tiles.maps.yandex.net/tiles?l=map&x={x}&y={y}&z={z}   */
/* https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x} */
L.tileLayer('https://tile2.maps.2gis.com/tiles?x={x}&y={y}&z={z}', {
    attribution: 'Tiles &copy; Esri — Source: USGS, Esri',
}).addTo(map_);

function adaptLayout() {
    const mapContainer = document.getElementById("map_");
    const panel = document.getElementById("blok_pannel");
    const mobile = document.getElementById("mobile_panel");

    if (window.innerWidth) {
        mapContainer.style.width = "";
        panel.style.display = "flex";
    } else {
        mapContainer.style.width = "100%";
        panel.style.display = "none";
    }

    mapContainer.style.height = window.innerHeight + "px";

    setTimeout(() => {
        map_.invalidateSize();
    }, 300);
}

window.addEventListener("load", adaptLayout);
window.addEventListener("resize", adaptLayout);