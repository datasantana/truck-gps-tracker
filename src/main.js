import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import routes from './router'

// Vuetify
import 'vuetify/styles'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

const vuetify = createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    }
  },
  theme: {
    defaultTheme: 'light'
  }
})

const router = createRouter({
  history: createWebHistory(),
  routes
})

const pinia = createPinia()

const app = createApp(App)
app.use(pinia)
app.use(router)
app.use(vuetify)
app.mount('#app')