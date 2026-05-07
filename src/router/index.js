import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import SearchResults from '../views/SearchResults.vue'
import About from '../views/About.vue'
import Settings from '../views/Settings.vue'
import Message from '../views/Message.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/search', component: SearchResults },
  { path: '/about', component: About },
  { path: '/settings', component: Settings },
  { path: '/message', component: Message },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router