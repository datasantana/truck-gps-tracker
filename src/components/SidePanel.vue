<template>
  <v-card flat class="pa-4" style="height: 100%;">
    <v-card-title class="text-h6 pb-2">
      Filters & Controls
    </v-card-title>
    
    <v-divider class="mb-4"></v-divider>
    
    <!-- Date Range Filter -->
    <v-card-subtitle class="px-0 pb-2">Date Range</v-card-subtitle>
    <v-row class="mb-4">
      <v-col cols="6">
        <v-text-field
          v-model="startDate"
          label="Start Date"
          type="date"
          variant="outlined"
          density="compact"
          @update:model-value="updateDateRange"
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="endDate"
          label="End Date"
          type="date"
          variant="outlined"
          density="compact"
          @update:model-value="updateDateRange"
        ></v-text-field>
      </v-col>
    </v-row>
    
    <!-- Unit/Truck Selector -->
    <v-card-subtitle class="px-0 pb-2">Truck Units</v-card-subtitle>
    <v-select
      v-model="selectedUnits"
      :items="gpsStore.availableUnits"
      label="Select Trucks"
      multiple
      variant="outlined"
      density="compact"
      class="mb-4"
      @update:model-value="updateUnits"
    >
      <template v-slot:selection="{ item, index }">
        <v-chip v-if="index < 2" size="small">
          {{ item.title }}
        </v-chip>
        <span v-if="index === 2" class="text-grey text-caption align-self-center">
          (+{{ selectedUnits.length - 2 }} others)
        </span>
      </template>
    </v-select>
    
    <!-- Quick Actions -->
    <v-card-subtitle class="px-0 pb-2">Quick Actions</v-card-subtitle>
    <v-row class="mb-4">
      <v-col cols="6">
        <v-btn
          block
          variant="outlined"
          color="primary"
          @click="selectToday"
        >
          Today
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn
          block
          variant="outlined"
          color="primary"
          @click="selectThisWeek"
        >
          This Week
        </v-btn>
      </v-col>
    </v-row>
    
    <v-row class="mb-4">
      <v-col cols="6">
        <v-btn
          block
          variant="outlined"
          color="secondary"
          @click="selectAllUnits"
        >
          All Trucks
        </v-btn>
      </v-col>
      <v-col cols="6">
        <v-btn
          block
          variant="outlined"
          color="error"
          @click="clearAllFilters"
        >
          Clear All
        </v-btn>
      </v-col>
    </v-row>
    
    <v-divider class="mb-4"></v-divider>
    
    <!-- Active Filters Summary -->
    <v-card-subtitle class="px-0 pb-2">Active Filters</v-card-subtitle>
    <div class="mb-4">
      <v-chip
        v-if="startDate || endDate"
        class="mr-2 mb-2"
        size="small"
        closable
        @click:close="clearDateFilter"
      >
        Date: {{ formatDateRange() }}
      </v-chip>
      
      <v-chip
        v-if="selectedUnits.length > 0"
        class="mr-2 mb-2"
        size="small"
        closable
        @click:close="clearUnitFilter"
      >
        Units: {{ selectedUnits.length }} selected
      </v-chip>
      
      <div v-if="!startDate && !endDate && selectedUnits.length === 0" class="text-grey">
        No active filters
      </div>
    </div>
    
    <v-divider class="mb-4"></v-divider>
    
    <!-- Results Summary -->
    <v-card-subtitle class="px-0 pb-2">Results Summary</v-card-subtitle>
    <v-list density="compact">
      <v-list-item>
        <v-list-item-title>Routes Found</v-list-item-title>
        <v-list-item-subtitle>{{ gpsStore.filteredRoutes.length }}</v-list-item-subtitle>
      </v-list-item>
      
      <v-list-item>
        <v-list-item-title>Active Trucks</v-list-item-title>
        <v-list-item-subtitle>{{ activeTrucksCount }}</v-list-item-subtitle>
      </v-list-item>
      
      <v-list-item>
        <v-list-item-title>Date Range</v-list-item-title>
        <v-list-item-subtitle>{{ activeDateRange }}</v-list-item-subtitle>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { useGpsStore } from '@/stores/gpsStore'

export default {
  name: 'SidePanel',
  setup() {
    const gpsStore = useGpsStore()
    
    const startDate = ref('')
    const endDate = ref('')
    const selectedUnits = ref([])
    
    const activeTrucksCount = computed(() => {
      const units = new Set()
      gpsStore.filteredRoutes.forEach(route => {
        units.add(route.unitId)
      })
      return units.size
    })
    
    const activeDateRange = computed(() => {
      if (gpsStore.filteredRoutes.length === 0) return 'No data'
      
      const dates = gpsStore.filteredRoutes.map(route => new Date(route.date))
      const minDate = new Date(Math.min(...dates))
      const maxDate = new Date(Math.max(...dates))
      
      if (minDate.getTime() === maxDate.getTime()) {
        return minDate.toLocaleDateString()
      }
      
      return `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`
    })
    
    function updateDateRange() {
      gpsStore.setDateRange(startDate.value, endDate.value)
    }
    
    function updateUnits() {
      gpsStore.setSelectedUnits(selectedUnits.value)
    }
    
    function selectToday() {
      const today = new Date().toISOString().split('T')[0]
      startDate.value = today
      endDate.value = today
      updateDateRange()
    }
    
    function selectThisWeek() {
      const today = new Date()
      const firstDay = new Date(today.setDate(today.getDate() - today.getDay()))
      const lastDay = new Date(today.setDate(today.getDate() - today.getDay() + 6))
      
      startDate.value = firstDay.toISOString().split('T')[0]
      endDate.value = lastDay.toISOString().split('T')[0]
      updateDateRange()
    }
    
    function selectAllUnits() {
      selectedUnits.value = [...gpsStore.availableUnits]
      updateUnits()
    }
    
    function clearAllFilters() {
      startDate.value = ''
      endDate.value = ''
      selectedUnits.value = []
      gpsStore.clearFilters()
    }
    
    function clearDateFilter() {
      startDate.value = ''
      endDate.value = ''
      updateDateRange()
    }
    
    function clearUnitFilter() {
      selectedUnits.value = []
      updateUnits()
    }
    
    function formatDateRange() {
      if (startDate.value && endDate.value) {
        if (startDate.value === endDate.value) {
          return new Date(startDate.value).toLocaleDateString()
        }
        return `${new Date(startDate.value).toLocaleDateString()} - ${new Date(endDate.value).toLocaleDateString()}`
      } else if (startDate.value) {
        return `From ${new Date(startDate.value).toLocaleDateString()}`
      } else if (endDate.value) {
        return `Until ${new Date(endDate.value).toLocaleDateString()}`
      }
      return ''
    }
    
    // Watch for store changes to sync local state
    watch(() => gpsStore.dateRange, (newRange) => {
      startDate.value = newRange.start || ''
      endDate.value = newRange.end || ''
    }, { immediate: true })
    
    watch(() => gpsStore.selectedUnits, (newUnits) => {
      selectedUnits.value = [...newUnits]
    }, { immediate: true })
    
    return {
      gpsStore,
      startDate,
      endDate,
      selectedUnits,
      activeTrucksCount,
      activeDateRange,
      updateDateRange,
      updateUnits,
      selectToday,
      selectThisWeek,
      selectAllUnits,
      clearAllFilters,
      clearDateFilter,
      clearUnitFilter,
      formatDateRange
    }
  }
}
</script>

<style scoped>
.v-card {
  overflow-y: auto;
}
</style>