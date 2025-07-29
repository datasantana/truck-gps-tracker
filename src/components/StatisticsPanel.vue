<template>
  <v-card flat class="pa-4" style="height: 100%;">
    <v-card-title class="text-h6 pb-2">
      Statistics Dashboard
    </v-card-title>
    
    <v-divider class="mb-4"></v-divider>
    
    <!-- Overall Statistics -->
    <v-card-subtitle class="px-0 pb-2">Overall Metrics</v-card-subtitle>
    
    <v-row class="mb-4">
      <v-col cols="6">
        <v-card variant="outlined" class="pa-3 text-center">
          <div class="text-h5 text-primary">{{ Math.round(gpsStore.totalDistance * 10) / 10 }}</div>
          <div class="text-caption text-grey">Total Distance (km)</div>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card variant="outlined" class="pa-3 text-center">
          <div class="text-h5 text-success">{{ formatTime(gpsStore.totalTravelTime) }}</div>
          <div class="text-caption text-grey">Travel Time</div>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row class="mb-4">
      <v-col cols="6">
        <v-card variant="outlined" class="pa-3 text-center">
          <div class="text-h5 text-info">{{ Math.round(gpsStore.averageSpeed * 10) / 10 }}</div>
          <div class="text-caption text-grey">Avg Speed (km/h)</div>
        </v-card>
      </v-col>
      <v-col cols="6">
        <v-card variant="outlined" class="pa-3 text-center">
          <div class="text-h5 text-warning">{{ gpsStore.filteredRoutes.length }}</div>
          <div class="text-caption text-grey">Active Routes</div>
        </v-card>
      </v-col>
    </v-row>
    
    <v-divider class="mb-4"></v-divider>
    
    <!-- Speed Analysis -->
    <v-card-subtitle class="px-0 pb-2">Speed Analysis</v-card-subtitle>
    <v-card variant="outlined" class="pa-3 mb-4">
      <div class="mb-2">
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-2">Max Speed</span>
          <span class="text-body-2 font-weight-bold">{{ maxSpeed }} km/h</span>
        </div>
        <v-progress-linear
          :model-value="(maxSpeed / 100) * 100"
          color="error"
          height="6"
          class="mt-1"
        ></v-progress-linear>
      </div>
      
      <div class="mb-2">
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-2">Avg Speed</span>
          <span class="text-body-2 font-weight-bold">{{ Math.round(gpsStore.averageSpeed * 10) / 10 }} km/h</span>
        </div>
        <v-progress-linear
          :model-value="(gpsStore.averageSpeed / 100) * 100"
          color="primary"
          height="6"
          class="mt-1"
        ></v-progress-linear>
      </div>
      
      <div>
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-2">Min Speed</span>
          <span class="text-body-2 font-weight-bold">{{ minSpeed }} km/h</span>
        </div>
        <v-progress-linear
          :model-value="(minSpeed / 100) * 100"
          color="success"
          height="6"
          class="mt-1"
        ></v-progress-linear>
      </div>
    </v-card>
    
    <v-divider class="mb-4"></v-divider>
    
    <!-- Route Efficiency -->
    <v-card-subtitle class="px-0 pb-2">Route Efficiency</v-card-subtitle>
    <v-list density="compact" class="mb-4">
      <v-list-item>
        <v-list-item-title>Efficiency Score</v-list-item-title>
        <v-list-item-subtitle>
          <v-chip :color="getEfficiencyColor()" size="small">{{ getEfficiencyScore() }}%</v-chip>
        </v-list-item-subtitle>
      </v-list-item>
      
      <v-list-item>
        <v-list-item-title>Fuel Estimate</v-list-item-title>
        <v-list-item-subtitle>{{ estimatedFuel }} L</v-list-item-subtitle>
      </v-list-item>
      
      <v-list-item>
        <v-list-item-title>CO₂ Estimate</v-list-item-title>
        <v-list-item-subtitle>{{ estimatedCO2 }} kg</v-list-item-subtitle>
      </v-list-item>
    </v-list>
    
    <v-divider class="mb-4"></v-divider>
    
    <!-- Direction Analysis -->
    <v-card-subtitle class="px-0 pb-2">Direction Analysis</v-card-subtitle>
    <v-card variant="outlined" class="pa-3 mb-4">
      <div v-for="direction in directionStats" :key="direction.name" class="mb-2">
        <div class="d-flex justify-space-between align-center">
          <span class="text-body-2">{{ direction.name }}</span>
          <span class="text-body-2">{{ direction.percentage }}%</span>
        </div>
        <v-progress-linear
          :model-value="direction.percentage"
          :color="direction.color"
          height="4"
          class="mt-1"
        ></v-progress-linear>
      </div>
    </v-card>
    
    <v-divider class="mb-4"></v-divider>
    
    <!-- Recent Activity -->
    <v-card-subtitle class="px-0 pb-2">Recent Activity</v-card-subtitle>
    <v-list density="compact">
      <v-list-item
        v-for="route in recentRoutes"
        :key="route.id"
        class="px-0"
      >
        <template v-slot:prepend>
          <v-avatar size="32" :color="getRouteColor(route.unitId)">
            <v-icon color="white">mdi-truck</v-icon>
          </v-avatar>
        </template>
        
        <v-list-item-title class="text-body-2">{{ route.unitId }}</v-list-item-title>
        <v-list-item-subtitle class="text-caption">
          {{ route.date }} • {{ route.route?.distance || 0 }}km • {{ route.statistics?.avgSpeed || 0 }}km/h
        </v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script>
import { computed } from 'vue'
import { useGpsStore } from '@/stores/gpsStore'

export default {
  name: 'StatisticsPanel',
  setup() {
    const gpsStore = useGpsStore()
    
    const maxSpeed = computed(() => {
      if (gpsStore.filteredRoutes.length === 0) return 0
      return Math.max(...gpsStore.filteredRoutes.map(route => route.statistics?.maxSpeed || 0))
    })
    
    const minSpeed = computed(() => {
      if (gpsStore.filteredRoutes.length === 0) return 0
      const speeds = gpsStore.filteredRoutes
        .map(route => route.statistics?.avgSpeed || 0)
        .filter(speed => speed > 0)
      return speeds.length > 0 ? Math.min(...speeds) : 0
    })
    
    const estimatedFuel = computed(() => {
      // Rough estimate: 0.3L per km for trucks
      return Math.round(gpsStore.totalDistance * 0.3 * 10) / 10
    })
    
    const estimatedCO2 = computed(() => {
      // Rough estimate: 2.7kg CO2 per liter of diesel
      return Math.round(estimatedFuel.value * 2.7 * 10) / 10
    })
    
    const directionStats = computed(() => {
      const directions = {}
      gpsStore.filteredRoutes.forEach(route => {
        if (route.statistics?.directions) {
          route.statistics.directions.forEach(dir => {
            directions[dir] = (directions[dir] || 0) + 1
          })
        }
      })
      
      const total = Object.values(directions).reduce((sum, count) => sum + count, 0)
      const colors = ['primary', 'success', 'warning', 'error', 'info', 'secondary']
      let colorIndex = 0
      
      return Object.entries(directions)
        .map(([name, count]) => ({
          name,
          percentage: total > 0 ? Math.round((count / total) * 100) : 0,
          color: colors[colorIndex++ % colors.length]
        }))
        .sort((a, b) => b.percentage - a.percentage)
    })
    
    const recentRoutes = computed(() => {
      return [...gpsStore.filteredRoutes]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    })
    
    function formatTime(seconds) {
      if (!seconds) return '0m'
      
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`
      }
      return `${minutes}m`
    }
    
    function getEfficiencyScore() {
      if (gpsStore.filteredRoutes.length === 0) return 0
      
      // Simple efficiency calculation based on average speed vs optimal speed (50 km/h)
      const optimalSpeed = 50
      const avgSpeed = gpsStore.averageSpeed
      
      if (avgSpeed <= 0) return 0
      
      let score = 100
      if (avgSpeed > optimalSpeed) {
        score = Math.max(0, 100 - ((avgSpeed - optimalSpeed) / optimalSpeed) * 50)
      } else {
        score = Math.max(0, (avgSpeed / optimalSpeed) * 100)
      }
      
      return Math.round(score)
    }
    
    function getEfficiencyColor() {
      const score = getEfficiencyScore()
      if (score >= 80) return 'success'
      if (score >= 60) return 'warning'
      return 'error'
    }
    
    function getRouteColor(unitId) {
      const colors = ['primary', 'success', 'warning', 'error', 'info', 'secondary']
      const hash = unitId.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0)
        return a & a
      }, 0)
      return colors[Math.abs(hash) % colors.length]
    }
    
    return {
      gpsStore,
      maxSpeed,
      minSpeed,
      estimatedFuel,
      estimatedCO2,
      directionStats,
      recentRoutes,
      formatTime,
      getEfficiencyScore,
      getEfficiencyColor,
      getRouteColor
    }
  }
}
</script>

<style scoped>
.v-card {
  overflow-y: auto;
}
</style>