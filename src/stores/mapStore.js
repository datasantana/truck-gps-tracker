import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMapStore = defineStore('map', () => {
  // State
  const map = ref(null)
  const mapLoaded = ref(false)
  const center = ref([-74.0060, 40.7128]) // NYC coordinates [lng, lat]
  const zoom = ref(10)
  const markers = ref([])
  const routeLayers = ref([])
  
  // Actions
  function setMap(mapInstance) {
    map.value = mapInstance
  }
  
  function setMapLoaded(loaded) {
    mapLoaded.value = loaded
  }
  
  function setCenter(coordinates) {
    center.value = coordinates
    if (map.value) {
      map.value.setCenter(coordinates)
    }
  }
  
  function setZoom(zoomLevel) {
    zoom.value = zoomLevel
    if (map.value) {
      map.value.setZoom(zoomLevel)
    }
  }
  
  function addMarker(marker) {
    markers.value.push(marker)
  }
  
  function removeMarker(markerId) {
    const index = markers.value.findIndex(m => m.id === markerId)
    if (index > -1) {
      markers.value[index].remove()
      markers.value.splice(index, 1)
    }
  }
  
  function clearMarkers() {
    markers.value.forEach(marker => marker.remove())
    markers.value = []
  }
  
  function addRouteLayer(layerId, sourceData, color = '#3887be') {
    if (!map.value || !mapLoaded.value) return
    
    // Add source
    if (!map.value.getSource(layerId)) {
      map.value.addSource(layerId, {
        type: 'geojson',
        data: sourceData
      })
    }
    
    // Add layer
    if (!map.value.getLayer(layerId)) {
      map.value.addLayer({
        id: layerId,
        type: 'line',
        source: layerId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': color,
          'line-width': 3
        }
      })
    }
    
    routeLayers.value.push(layerId)
  }
  
  function removeRouteLayer(layerId) {
    if (!map.value) return
    
    if (map.value.getLayer(layerId)) {
      map.value.removeLayer(layerId)
    }
    if (map.value.getSource(layerId)) {
      map.value.removeSource(layerId)
    }
    
    const index = routeLayers.value.indexOf(layerId)
    if (index > -1) {
      routeLayers.value.splice(index, 1)
    }
  }
  
  function clearRouteLayers() {
    routeLayers.value.forEach(layerId => {
      removeRouteLayer(layerId)
    })
    routeLayers.value = []
  }
  
  function fitBounds(coordinates) {
    if (!map.value || !coordinates || coordinates.length === 0) return
    
    const bounds = coordinates.reduce((bounds, coord) => {
      return bounds.extend(coord)
    }, new mapboxgl.LngLatBounds())
    
    map.value.fitBounds(bounds, {
      padding: 50
    })
  }
  
  return {
    // State
    map,
    mapLoaded,
    center,
    zoom,
    markers,
    routeLayers,
    
    // Actions
    setMap,
    setMapLoaded,
    setCenter,
    setZoom,
    addMarker,
    removeMarker,
    clearMarkers,
    addRouteLayer,
    removeRouteLayer,
    clearRouteLayers,
    fitBounds
  }
})