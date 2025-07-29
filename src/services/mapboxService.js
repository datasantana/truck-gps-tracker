import mapboxgl from 'mapbox-gl'

class MapboxService {
  constructor() {
    this.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGp1aWZkNTUwMGR5M2R0YzJza28xdW9oIn0.example'
    mapboxgl.accessToken = this.accessToken
  }

  /**
   * Create a new Mapbox map instance
   */
  createMap(container, options = {}) {
    const defaultOptions = {
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.0060, 40.7128], // NYC
      zoom: 10
    }

    return new mapboxgl.Map({
      container,
      ...defaultOptions,
      ...options
    })
  }

  /**
   * Get directions between multiple waypoints
   */
  async getDirections(coordinates, profile = 'driving') {
    if (coordinates.length < 2) {
      throw new Error('At least 2 coordinates are required for directions')
    }

    const coordinatesString = coordinates
      .map(coord => `${coord[0]},${coord[1]}`)
      .join(';')

    const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinatesString}?geometries=geojson&access_token=${this.accessToken}`

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.routes && data.routes.length > 0) {
        return {
          route: data.routes[0],
          distance: data.routes[0].distance / 1000, // Convert to km
          duration: data.routes[0].duration, // in seconds
          geometry: data.routes[0].geometry
        }
      } else {
        throw new Error('No routes found')
      }
    } catch (error) {
      console.error('Error fetching directions:', error)
      throw error
    }
  }

  /**
   * Get route optimization for multiple waypoints
   */
  async getOptimizedRoute(coordinates, profile = 'driving') {
    if (coordinates.length < 2) {
      throw new Error('At least 2 coordinates are required for route optimization')
    }

    const coordinatesString = coordinates
      .map(coord => `${coord[0]},${coord[1]}`)
      .join(';')

    const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/${profile}/${coordinatesString}?geometries=geojson&access_token=${this.accessToken}`

    try {
      const response = await fetch(url)
      const data = await response.json()

      if (data.trips && data.trips.length > 0) {
        return {
          trip: data.trips[0],
          distance: data.trips[0].distance / 1000, // Convert to km
          duration: data.trips[0].duration, // in seconds
          geometry: data.trips[0].geometry,
          waypoints: data.waypoints
        }
      } else {
        throw new Error('No optimized route found')
      }
    } catch (error) {
      console.error('Error fetching optimized route:', error)
      throw error
    }
  }

  /**
   * Create a GeoJSON LineString from GPS points
   */
  createRouteGeoJSON(gpsPoints, properties = {}) {
    return {
      type: 'Feature',
      properties,
      geometry: {
        type: 'LineString',
        coordinates: gpsPoints.map(point => [point.lng, point.lat])
      }
    }
  }

  /**
   * Create a GeoJSON Point from a single GPS point
   */
  createPointGeoJSON(gpsPoint, properties = {}) {
    return {
      type: 'Feature',
      properties,
      geometry: {
        type: 'Point',
        coordinates: [gpsPoint.lng, gpsPoint.lat]
      }
    }
  }

  /**
   * Calculate the bounding box for a set of coordinates
   */
  calculateBounds(coordinates) {
    if (coordinates.length === 0) return null

    let minLng = coordinates[0][0]
    let minLat = coordinates[0][1]
    let maxLng = coordinates[0][0]
    let maxLat = coordinates[0][1]

    coordinates.forEach(coord => {
      minLng = Math.min(minLng, coord[0])
      minLat = Math.min(minLat, coord[1])
      maxLng = Math.max(maxLng, coord[0])
      maxLat = Math.max(maxLat, coord[1])
    })

    return [
      [minLng, minLat], // southwest
      [maxLng, maxLat]  // northeast
    ]
  }

  /**
   * Add custom truck marker to map
   */
  addTruckMarker(map, coordinates, options = {}) {
    const { color = '#3887be', unitId = '', popup = null } = options

    const marker = new mapboxgl.Marker({ color })
      .setLngLat(coordinates)

    if (popup) {
      marker.setPopup(new mapboxgl.Popup().setHTML(popup))
    }

    marker.addTo(map)
    return marker
  }

  /**
   * Add route layer to map
   */
  addRouteLayer(map, layerId, geoJSON, style = {}) {
    const defaultStyle = {
      'line-color': '#3887be',
      'line-width': 3,
      'line-opacity': 0.8
    }

    // Add source
    if (!map.getSource(layerId)) {
      map.addSource(layerId, {
        type: 'geojson',
        data: geoJSON
      })
    }

    // Add layer
    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: 'line',
        source: layerId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          ...defaultStyle,
          ...style
        }
      })
    }
  }
}

export default new MapboxService()