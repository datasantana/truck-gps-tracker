<template>
  <div id="map" class="map-container"></div>
  <v-overlay :model-value="loading" class="align-center justify-center">
    <v-progress-circular indeterminate size="64" color="primary"></v-progress-circular>
  </v-overlay>
</template>

<script>
import { onMounted, onUnmounted, watch, ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import { useMapStore } from '@/stores/mapStore'
import { useGpsStore } from '@/stores/gpsStore'
import TruckMarker from './TruckMarker.vue'

export default {
  name: 'MapView',
  components: {
    TruckMarker
  },
  setup() {
    const mapStore = useMapStore()
    const gpsStore = useGpsStore()
    const loading = ref(true)
    
    // Mapbox access token - in production, this should come from environment variables
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGp1aWZkNTUwMGR5M2R0YzJza28xdW9oIn0.example'
    
    let map = null
    
    const initializeMap = () => {
      map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: mapStore.center,
        zoom: mapStore.zoom
      })
      
      map.on('load', () => {
        mapStore.setMap(map)
        mapStore.setMapLoaded(true)
        loading.value = false
        
        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl())
        
        // Update routes when map is ready
        updateRoutes()
      })
      
      map.on('move', () => {
        mapStore.setCenter([map.getCenter().lng, map.getCenter().lat])
        mapStore.setZoom(map.getZoom())
      })
    }
    
    const updateRoutes = () => {
      if (!mapStore.mapLoaded) return
      
      // Clear existing route layers
      mapStore.clearRouteLayers()
      mapStore.clearMarkers()
      
      // Colors for different trucks
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD']
      let colorIndex = 0
      
      gpsStore.filteredRoutes.forEach(route => {
        const color = colors[colorIndex % colors.length]
        colorIndex++
        
        // Create GeoJSON for route
        const routeGeoJSON = {
          type: 'Feature',
          properties: {
            unitId: route.unitId,
            date: route.date
          },
          geometry: {
            type: 'LineString',
            coordinates: route.gpsPoints.map(point => [point.lng, point.lat])
          }
        }
        
        // Add route layer
        mapStore.addRouteLayer(route.id, routeGeoJSON, color)
        
        // Add start marker
        if (route.gpsPoints.length > 0) {
          const startPoint = route.gpsPoints[0]
          const startMarker = new mapboxgl.Marker({ color: color })
            .setLngLat([startPoint.lng, startPoint.lat])
            .setPopup(
              new mapboxgl.Popup().setHTML(
                `<div>
                  <h4>${route.unitId}</h4>
                  <p>Date: ${route.date}</p>
                  <p>Start: ${new Date(startPoint.timestamp).toLocaleTimeString()}</p>
                  <p>Distance: ${route.route?.distance || 0} km</p>
                </div>`
              )
            )
            .addTo(map)
          
          mapStore.addMarker({
            id: `${route.id}_start`,
            marker: startMarker
          })
        }
        
        // Add end marker
        if (route.gpsPoints.length > 1) {
          const endPoint = route.gpsPoints[route.gpsPoints.length - 1]
          const endMarker = new mapboxgl.Marker({ color: color })
            .setLngLat([endPoint.lng, endPoint.lat])
            .setPopup(
              new mapboxgl.Popup().setHTML(
                `<div>
                  <h4>${route.unitId}</h4>
                  <p>Date: ${route.date}</p>
                  <p>End: ${new Date(endPoint.timestamp).toLocaleTimeString()}</p>
                  <p>Avg Speed: ${route.statistics?.avgSpeed || 0} km/h</p>
                </div>`
              )
            )
            .addTo(map)
          
          mapStore.addMarker({
            id: `${route.id}_end`,
            marker: endMarker
          })
        }
      })
      
      // Fit map to show all routes
      if (gpsStore.filteredRoutes.length > 0) {
        const allPoints = []
        gpsStore.filteredRoutes.forEach(route => {
          route.gpsPoints.forEach(point => {
            allPoints.push([point.lng, point.lat])
          })
        })
        
        if (allPoints.length > 0) {
          mapStore.fitBounds(allPoints)
        }
      }
    }
    
    // Watch for changes in filtered routes
    watch(() => gpsStore.filteredRoutes, updateRoutes, { deep: true })
    
    onMounted(() => {
      initializeMap()
    })
    
    onUnmounted(() => {
      if (map) {
        map.remove()
      }
    })
    
    return {
      loading
    }
  }
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

#map {
  width: 100%;
  height: 100%;
}
</style>