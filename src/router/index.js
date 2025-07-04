import { createRouter, createWebHistory } from 'vue-router'
import InfusionDetails from '@/components/infusionDetails.vue'
import StackDetails from '@/components/StackDetails.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/infusion/:infusionId',
      name: 'Infusion-details',
      component: InfusionDetails,
    },
    {
      path: '/stacks/:stackId',
      name: 'stack-details',
      component: StackDetails,
    }
  ],
})

export default router
