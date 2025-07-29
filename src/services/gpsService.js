import { calculateDistance, calculateBearing, calculateAverageSpeed } from '@/utils/geoUtils'
import { formatDate, parseDate, getDateRange } from '@/utils/dateUtils'

class GpsService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '/api'
  }

  /**
   * Fetch GPS data for a specific unit and date range
   */
  async fetchGpsData(unitId, startDate, endDate) {
    try {
      const url = `${this.baseUrl}/gps-data/${unitId}?start=${startDate}&end=${endDate}`
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return this.processGpsData(data, unitId)
    } catch (error) {
      console.error('Error fetching GPS data:', error)
      // Return mock data for development
      return this.generateMockGpsData(unitId, startDate, endDate)
    }
  }

  /**
   * Process raw GPS data into standardized format
   */
  processGpsData(rawData, unitId) {
    if (!Array.isArray(rawData)) {
      throw new Error('Invalid GPS data format')
    }

    return rawData.map(point => ({
      lat: parseFloat(point.latitude || point.lat),
      lng: parseFloat(point.longitude || point.lng || point.lon),
      timestamp: point.timestamp || point.time,
      unitId: unitId,
      speed: parseFloat(point.speed || 0),
      heading: parseFloat(point.heading || point.bearing || 0),
      altitude: parseFloat(point.altitude || 0)
    })).filter(point => 
      !isNaN(point.lat) && 
      !isNaN(point.lng) && 
      Math.abs(point.lat) <= 90 && 
      Math.abs(point.lng) <= 180
    )
  }

  /**
   * Generate mock GPS data for development/testing
   */
  generateMockGpsData(unitId, startDate, endDate) {
    const startLat = 40.7128 + (Math.random() - 0.5) * 0.1
    const startLng = -74.0060 + (Math.random() - 0.5) * 0.1
    const points = []
    
    const start = new Date(startDate)
    const end = new Date(endDate)
    const duration = end - start
    const pointCount = Math.min(50, Math.max(10, Math.floor(duration / (30 * 60 * 1000)))) // Every 30 minutes
    
    for (let i = 0; i < pointCount; i++) {
      const progress = i / (pointCount - 1)
      const timestamp = new Date(start.getTime() + progress * duration).toISOString()
      
      // Simulate movement
      const lat = startLat + (Math.random() - 0.5) * 0.05 + progress * 0.02
      const lng = startLng + (Math.random() - 0.5) * 0.05 + progress * 0.02
      
      points.push({
        lat,
        lng,
        timestamp,
        unitId,
        speed: 30 + Math.random() * 40, // 30-70 km/h
        heading: Math.random() * 360,
        altitude: 50 + Math.random() * 100
      })
    }
    
    return points
  }

  /**
   * Create route from GPS points
   */
  createRoute(gpsPoints, unitId, date) {
    if (!gpsPoints || gpsPoints.length < 2) {
      return null
    }

    // Sort points by timestamp
    const sortedPoints = [...gpsPoints].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    )

    // Calculate route statistics
    const statistics = this.calculateRouteStatistics(sortedPoints)
    const route = this.calculateRouteMetrics(sortedPoints)

    return {
      id: `${unitId}_${date}`,
      unitId,
      date,
      gpsPoints: sortedPoints,
      route,
      statistics
    }
  }

  /**
   * Calculate route metrics (distance, duration)
   */
  calculateRouteMetrics(gpsPoints) {
    if (gpsPoints.length < 2) {
      return { distance: 0, duration: 0 }
    }

    let totalDistance = 0
    for (let i = 1; i < gpsPoints.length; i++) {
      const dist = calculateDistance(
        gpsPoints[i - 1].lat, gpsPoints[i - 1].lng,
        gpsPoints[i].lat, gpsPoints[i].lng
      )
      totalDistance += dist
    }

    const startTime = new Date(gpsPoints[0].timestamp)
    const endTime = new Date(gpsPoints[gpsPoints.length - 1].timestamp)
    const duration = (endTime - startTime) / 1000 // seconds

    return {
      distance: totalDistance,
      duration: duration,
      geometry: this.createGeometryString(gpsPoints)
    }
  }

  /**
   * Calculate route statistics
   */
  calculateRouteStatistics(gpsPoints) {
    if (gpsPoints.length < 2) {
      return {
        avgSpeed: 0,
        maxSpeed: 0,
        travelTime: '0m',
        directions: []
      }
    }

    // Speed calculations
    const speeds = gpsPoints
      .map(point => point.speed || 0)
      .filter(speed => speed > 0)
    
    const avgSpeed = speeds.length > 0 
      ? speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length 
      : calculateAverageSpeed(gpsPoints)
    
    const maxSpeed = speeds.length > 0 ? Math.max(...speeds) : 0

    // Travel time
    const startTime = new Date(gpsPoints[0].timestamp)
    const endTime = new Date(gpsPoints[gpsPoints.length - 1].timestamp)
    const duration = (endTime - startTime) / 1000 // seconds
    const travelTime = this.formatTravelTime(duration)

    // Direction analysis
    const directions = this.analyzeDirections(gpsPoints)

    return {
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      maxSpeed: Math.round(maxSpeed * 10) / 10,
      travelTime,
      directions
    }
  }

  /**
   * Analyze movement directions
   */
  analyzeDirections(gpsPoints) {
    if (gpsPoints.length < 2) return []

    const bearings = []
    for (let i = 1; i < gpsPoints.length; i++) {
      const bearing = calculateBearing(
        gpsPoints[i - 1].lat, gpsPoints[i - 1].lng,
        gpsPoints[i].lat, gpsPoints[i].lng
      )
      bearings.push(bearing)
    }

    // Convert bearings to cardinal directions
    const directions = bearings.map(bearing => this.bearingToCardinal(bearing))
    
    // Get unique directions in order
    const uniqueDirections = [...new Set(directions)]
    
    return uniqueDirections.slice(0, 3) // Return up to 3 main directions
  }

  /**
   * Convert bearing to cardinal direction
   */
  bearingToCardinal(bearing) {
    const directions = [
      'North', 'Northeast', 'East', 'Southeast',
      'South', 'Southwest', 'West', 'Northwest'
    ]
    
    const index = Math.round(bearing / 45) % 8
    return directions[index]
  }

  /**
   * Format travel time from seconds
   */
  formatTravelTime(seconds) {
    if (seconds < 60) return '< 1m'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  /**
   * Create geometry string for route
   */
  createGeometryString(gpsPoints) {
    // Simplified - in production this would be proper encoded polyline
    return gpsPoints.map(point => `${point.lng},${point.lat}`).join(';')
  }

  /**
   * Fetch available units
   */
  async fetchAvailableUnits() {
    try {
      const response = await fetch(`${this.baseUrl}/units`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching units:', error)
      // Return mock units for development
      return ['TRUCK_001', 'TRUCK_002', 'TRUCK_003', 'TRUCK_004']
    }
  }

  /**
   * Validate GPS point
   */
  validateGpsPoint(point) {
    return (
      point &&
      typeof point.lat === 'number' &&
      typeof point.lng === 'number' &&
      Math.abs(point.lat) <= 90 &&
      Math.abs(point.lng) <= 180 &&
      point.timestamp
    )
  }

  /**
   * Filter GPS points by quality
   */
  filterGpsPoints(points, options = {}) {
    const {
      minAccuracy = null,
      maxSpeed = 200, // km/h
      minMovement = 0.001 // degrees (~100m)
    } = options

    return points.filter((point, index) => {
      // Basic validation
      if (!this.validateGpsPoint(point)) return false

      // Speed filter
      if (point.speed && point.speed > maxSpeed) return false

      // Accuracy filter
      if (minAccuracy && point.accuracy && point.accuracy > minAccuracy) return false

      // Movement filter (skip stationary points)
      if (index > 0 && minMovement > 0) {
        const prevPoint = points[index - 1]
        const distance = calculateDistance(
          prevPoint.lat, prevPoint.lng,
          point.lat, point.lng
        )
        if (distance < minMovement) return false
      }

      return true
    })
  }
}

export default new GpsService()