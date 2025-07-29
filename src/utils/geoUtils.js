/**
 * Geographic utility functions for GPS calculations
 */

/**
 * Calculate distance between two GPS points using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371 // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1)
  const dLng = toRadians(lng2 - lng1)
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Calculate bearing between two GPS points
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lng2 - Longitude of second point
 * @returns {number} Bearing in degrees (0-360)
 */
export function calculateBearing(lat1, lng1, lat2, lng2) {
  const dLng = toRadians(lng2 - lng1)
  const lat1Rad = toRadians(lat1)
  const lat2Rad = toRadians(lat2)
  
  const y = Math.sin(dLng) * Math.cos(lat2Rad)
  const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng)
  
  const bearing = toDegrees(Math.atan2(y, x))
  return (bearing + 360) % 360
}

/**
 * Calculate average speed from GPS points
 * @param {Array} gpsPoints - Array of GPS points with lat, lng, timestamp
 * @returns {number} Average speed in km/h
 */
export function calculateAverageSpeed(gpsPoints) {
  if (gpsPoints.length < 2) return 0
  
  let totalDistance = 0
  const startTime = new Date(gpsPoints[0].timestamp)
  const endTime = new Date(gpsPoints[gpsPoints.length - 1].timestamp)
  const totalTime = (endTime - startTime) / 1000 / 3600 // hours
  
  for (let i = 1; i < gpsPoints.length; i++) {
    const dist = calculateDistance(
      gpsPoints[i - 1].lat, gpsPoints[i - 1].lng,
      gpsPoints[i].lat, gpsPoints[i].lng
    )
    totalDistance += dist
  }
  
  return totalTime > 0 ? totalDistance / totalTime : 0
}

/**
 * Calculate center point of GPS coordinates
 * @param {Array} coordinates - Array of [lng, lat] coordinates
 * @returns {Array} Center point as [lng, lat]
 */
export function calculateCenter(coordinates) {
  if (coordinates.length === 0) return [0, 0]
  
  let totalLat = 0
  let totalLng = 0
  
  coordinates.forEach(coord => {
    totalLng += coord[0]
    totalLat += coord[1]
  })
  
  return [
    totalLng / coordinates.length,
    totalLat / coordinates.length
  ]
}

/**
 * Calculate bounding box for GPS coordinates
 * @param {Array} coordinates - Array of [lng, lat] coordinates
 * @returns {Object} Bounding box with sw and ne corners
 */
export function calculateBounds(coordinates) {
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
  
  return {
    sw: [minLng, minLat],
    ne: [maxLng, maxLat]
  }
}

/**
 * Check if a point is within a bounding box
 * @param {Array} point - [lng, lat] coordinate
 * @param {Object} bounds - Bounding box with sw and ne properties
 * @returns {boolean} True if point is within bounds
 */
export function isPointInBounds(point, bounds) {
  const [lng, lat] = point
  const { sw, ne } = bounds
  
  return lng >= sw[0] && lng <= ne[0] && lat >= sw[1] && lat <= ne[1]
}

/**
 * Simplify GPS track using Douglas-Peucker algorithm
 * @param {Array} points - Array of GPS points
 * @param {number} tolerance - Simplification tolerance in kilometers
 * @returns {Array} Simplified points array
 */
export function simplifyTrack(points, tolerance = 0.1) {
  if (points.length <= 2) return points
  
  function perpendicularDistance(point, lineStart, lineEnd) {
    const A = point.lat - lineStart.lat
    const B = point.lng - lineStart.lng
    const C = lineEnd.lat - lineStart.lat
    const D = lineEnd.lng - lineStart.lng
    
    const dot = A * C + B * D
    const lenSq = C * C + D * D
    
    if (lenSq === 0) return calculateDistance(point.lat, point.lng, lineStart.lat, lineStart.lng)
    
    let param = dot / lenSq
    
    let xx, yy
    if (param < 0) {
      xx = lineStart.lat
      yy = lineStart.lng
    } else if (param > 1) {
      xx = lineEnd.lat
      yy = lineEnd.lng
    } else {
      xx = lineStart.lat + param * C
      yy = lineStart.lng + param * D
    }
    
    return calculateDistance(point.lat, point.lng, xx, yy)
  }
  
  function douglasPeucker(points, tolerance) {
    if (points.length <= 2) return points
    
    let maxDistance = 0
    let maxIndex = 0
    const end = points.length - 1
    
    for (let i = 1; i < end; i++) {
      const distance = perpendicularDistance(points[i], points[0], points[end])
      if (distance > maxDistance) {
        maxDistance = distance
        maxIndex = i
      }
    }
    
    if (maxDistance > tolerance) {
      const left = douglasPeucker(points.slice(0, maxIndex + 1), tolerance)
      const right = douglasPeucker(points.slice(maxIndex), tolerance)
      
      return left.slice(0, -1).concat(right)
    } else {
      return [points[0], points[end]]
    }
  }
  
  return douglasPeucker(points, tolerance)
}

/**
 * Convert degrees to radians
 * @param {number} degrees
 * @returns {number} Radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180)
}

/**
 * Convert radians to degrees
 * @param {number} radians
 * @returns {number} Degrees
 */
function toDegrees(radians) {
  return radians * (180 / Math.PI)
}

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} Formatted distance string
 */
export function formatDistance(distance) {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`
  } else if (distance < 10) {
    return `${Math.round(distance * 10) / 10}km`
  } else {
    return `${Math.round(distance)}km`
  }
}

/**
 * Format coordinates for display
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {string} Formatted coordinates string
 */
export function formatCoordinates(lat, lng) {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`
}

/**
 * Generate random GPS point within bounds (for testing)
 * @param {Object} bounds - Bounding box with sw and ne properties
 * @returns {Object} Random GPS point
 */
export function generateRandomPoint(bounds) {
  const { sw, ne } = bounds
  
  return {
    lat: sw[1] + Math.random() * (ne[1] - sw[1]),
    lng: sw[0] + Math.random() * (ne[0] - sw[0])
  }
}