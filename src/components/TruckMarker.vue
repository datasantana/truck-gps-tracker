<template>
  <div class="truck-marker" :style="markerStyle">
    <v-icon :color="iconColor" size="small">mdi-truck</v-icon>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'TruckMarker',
  props: {
    unitId: {
      type: String,
      required: true
    },
    color: {
      type: String,
      default: '#3887be'
    },
    size: {
      type: String,
      default: 'medium'
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const markerStyle = computed(() => {
      const sizeMap = {
        small: '24px',
        medium: '32px',
        large: '40px'
      }
      
      const size = sizeMap[props.size] || sizeMap.medium
      
      return {
        width: size,
        height: size,
        backgroundColor: props.color,
        border: props.active ? '3px solid #ffffff' : '2px solid #ffffff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        transform: props.active ? 'scale(1.2)' : 'scale(1)',
        transition: 'transform 0.2s ease-in-out'
      }
    })
    
    const iconColor = computed(() => {
      // Return white for better contrast
      return 'white'
    })
    
    return {
      markerStyle,
      iconColor
    }
  }
}
</script>

<style scoped>
.truck-marker {
  position: relative;
}

.truck-marker:hover {
  transform: scale(1.1) !important;
}
</style>