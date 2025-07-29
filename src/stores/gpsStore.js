import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGpsStore = defineStore('gps', () => {
  // State
  const routes = ref([])
  const filteredRoutes = ref([])
  const selectedUnits = ref([])
  const dateRange = ref({
    start: null,
    end: null
  })
  const loading = ref(false)
  const error = ref(null)
  
  // Getters
  const availableUnits = computed(() => {
    const units = new Set()
    routes.value.forEach(route => {
      units.add(route.unitId)
    })
    return Array.from(units).sort()
  })
  
  const availableDates = computed(() => {
    const dates = new Set()
    routes.value.forEach(route => {
      dates.add(route.date)
    })
    return Array.from(dates).sort()
  })
  
  const totalDistance = computed(() => {
    return filteredRoutes.value.reduce((sum, route) => sum + (route.route?.distance || 0), 0)
  })
  
  const totalTravelTime = computed(() => {
    return filteredRoutes.value.reduce((sum, route) => sum + (route.route?.duration || 0), 0)
  })
  
  const averageSpeed = computed(() => {
    const validRoutes = filteredRoutes.value.filter(route => route.statistics?.avgSpeed)
    if (validRoutes.length === 0) return 0
    return validRoutes.reduce((sum, route) => sum + route.statistics.avgSpeed, 0) / validRoutes.length
  })
  
  // Actions
  function initializeSampleData() {
    const sampleRoutes = [
      {
        id: 'TRUCK_001_2025-07-29',
        unitId: 'TRUCK_001',
        date: '2025-07-29',
        gpsPoints: [
          { lat: 40.7128, lng: -74.0060, timestamp: '2025-07-29T08:00:00Z' },
          { lat: 40.7589, lng: -73.9851, timestamp: '2025-07-29T08:30:00Z' },
          { lat: 40.7831, lng: -73.9712, timestamp: '2025-07-29T09:00:00Z' },
          { lat: 40.7614, lng: -73.9776, timestamp: '2025-07-29T09:30:00Z' }
        ],
        route: {
          distance: 12.5,
          duration: 5400,
          geometry: 'geojson_linestring_here'
        },
        statistics: {
          avgSpeed: 45.2,
          maxSpeed: 60.0,
          travelTime: '1h 30m',
          directions: ['North', 'Northeast']
        }
      },
      {
        id: 'TRUCK_002_2025-07-29',
        unitId: 'TRUCK_002',
        date: '2025-07-29',
        gpsPoints: [
          { lat: 40.6782, lng: -73.9442, timestamp: '2025-07-29T09:00:00Z' },
          { lat: 40.6892, lng: -73.9442, timestamp: '2025-07-29T09:30:00Z' },
          { lat: 40.7002, lng: -73.9342, timestamp: '2025-07-29T10:00:00Z' },
          { lat: 40.7112, lng: -73.9242, timestamp: '2025-07-29T10:30:00Z' }
        ],
        route: {
          distance: 8.7,
          duration: 3600,
          geometry: 'geojson_linestring_here'
        },
        statistics: {
          avgSpeed: 38.5,
          maxSpeed: 55.0,
          travelTime: '1h 0m',
          directions: ['North', 'Northeast']
        }
      },
      {
        id: 'TRUCK_001_2025-07-28',
        unitId: 'TRUCK_001',
        date: '2025-07-28',
        gpsPoints: [
          { lat: 40.7500, lng: -73.9900, timestamp: '2025-07-28T14:00:00Z' },
          { lat: 40.7600, lng: -73.9800, timestamp: '2025-07-28T14:30:00Z' },
          { lat: 40.7700, lng: -73.9700, timestamp: '2025-07-28T15:00:00Z' }
        ],
        route: {
          distance: 15.2,
          duration: 4200,
          geometry: 'geojson_linestring_here'
        },
        statistics: {
          avgSpeed: 42.8,
          maxSpeed: 65.0,
          travelTime: '1h 10m',
          directions: ['North', 'Northeast']
        }
      }
    ]
    
    routes.value = sampleRoutes
    applyFilters()
  }
  
  function setDateRange(start, end) {
    dateRange.value = { start, end }
    applyFilters()
  }
  
  function setSelectedUnits(units) {
    selectedUnits.value = units
    applyFilters()
  }
  
  function applyFilters() {
    let filtered = [...routes.value]
    
    // Filter by date range
    if (dateRange.value.start && dateRange.value.end) {
      filtered = filtered.filter(route => {
        const routeDate = new Date(route.date)
        const startDate = new Date(dateRange.value.start)
        const endDate = new Date(dateRange.value.end)
        return routeDate >= startDate && routeDate <= endDate
      })
    }
    
    // Filter by selected units
    if (selectedUnits.value.length > 0) {
      filtered = filtered.filter(route => selectedUnits.value.includes(route.unitId))
    }
    
    filteredRoutes.value = filtered
  }
  
  function clearFilters() {
    dateRange.value = { start: null, end: null }
    selectedUnits.value = []
    applyFilters()
  }
  
  async function fetchGpsData(unitId, date) {
    loading.value = true
    error.value = null
    
    try {
      // Simulate API call - replace with actual API integration
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // This would be replaced with actual API call
      console.log(`Fetching GPS data for unit ${unitId} on ${date}`)
      
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }
  
  return {
    // State
    routes,
    filteredRoutes,
    selectedUnits,
    dateRange,
    loading,
    error,
    
    // Getters
    availableUnits,
    availableDates,
    totalDistance,
    totalTravelTime,
    averageSpeed,
    
    // Actions
    initializeSampleData,
    setDateRange,
    setSelectedUnits,
    applyFilters,
    clearFilters,
    fetchGpsData
  }
})