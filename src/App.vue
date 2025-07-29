<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <v-app-bar-title>Truck GPS Tracker</v-app-bar-title>
    </v-app-bar>
    
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
html {
  overflow: hidden;
}

.v-main {
  height: 100vh;
}
</style>