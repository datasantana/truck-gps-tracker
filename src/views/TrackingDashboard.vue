<template>
  <v-container fluid class="pa-0" style="height: calc(100vh - 64px);">
    <v-row no-gutters style="height: 100%;">
      <!-- Side Panel -->
      <v-col cols="12" md="3" class="side-panel">
        <SidePanel />
      </v-col>
      
      <!-- Map View -->
      <v-col cols="12" md="6" class="map-container">
        <MapView />
      </v-col>
      
      <!-- Statistics Panel -->
      <v-col cols="12" md="3" class="stats-panel">
        <StatisticsPanel />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { onMounted } from 'vue'
import { useGpsStore } from '@/stores/gpsStore'
import MapView from '@/components/MapView.vue'
import SidePanel from '@/components/SidePanel.vue'
import StatisticsPanel from '@/components/StatisticsPanel.vue'

export default {
  name: 'TrackingDashboard',
  components: {
    MapView,
    SidePanel,
    StatisticsPanel
  },
  setup() {
    const gpsStore = useGpsStore()
    
    onMounted(() => {
      // Initialize with sample data
      gpsStore.initializeSampleData()
    })
    
    return {}
  }
}
</script>

<style scoped>
.side-panel, .stats-panel {
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  height: 100%;
}

.map-container {
  height: 100%;
  position: relative;
}

@media (max-width: 960px) {
  .side-panel, .stats-panel {
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    height: auto;
    max-height: 300px;
  }
}
</style>