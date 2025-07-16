<script setup lang="ts">
import InfusionButtons from '@/components/InfusionButtons.vue'
import { useRouter } from 'vue-router'
import { useSelectedButtonStore } from '@/stores/selectedButtonStore'
const selectedButtoneStore = useSelectedButtonStore()
import { computed } from 'vue'
interface Pump {
  department: string
  floor: string
  ward: string
  bed: string
  drug: string
  totalMl: number
  remainingMl: number
  mlPerHour: number
  timeRunning: string
  timeRemaining: string
  id: string
  softwareVersion: string
  medicalLibraryVersion: string
}

const props = defineProps<{
  id_stack_number: string
  softwareVersion: string
  medicalLibraryVersion: string
  pumps: Pump[]
}>()

const route = useRouter()
function routeIt(stackId) {
  selectedButtoneStore.setPressedButtonId(stackId)
  route.push({ name: 'stack-details', params: { stackId: stackId } })
}

const backgroundColour = computed(() => {
  if (props.id_stack_number === selectedButtoneStore.getPressedButtonId) {
    return '4xl:w-[46VW] xl:w-[46.5VW] md:w-[50.5VW] w-[87vw] border border-gray-500 rounded-xl bg-blue-600 shadow hover:bg-blue-500 text-white cursor-pointer'
  }
  return '4xl:w-[46VW] xl:w-[46.5VW] md:w-[50.5VW] w-[87vw] border border-gray-500 rounded-xl bg-white shadow hover:bg-blue-500 hover:text-white cursor-pointer'
})
</script>

<template>
  <div :class="backgroundColour" @click="routeIt(props.id_stack_number)">
    <div class="font-semibold mb-2 text-center">Stack: {{ props.id_stack_number }}</div>
    <div class="gap-2">
      <InfusionButtons
        v-for="pump in props.pumps"
        :key="pump.id"
        :department="pump.department"
        :floor="pump.floor"
        :ward="pump.ward"
        :bed="pump.bed"
        :drug="pump.drug"
        :totalMl="pump.totalMl"
        :remainingMl="pump.remainingMl"
        :mlPerHour="pump.mlPerHour"
        :time-running="pump.timeRunning"
        :timeRemaining="pump.timeRemaining"
        :id="pump.id"
        :softwareVersion="pump.softwareVersion"
        :medicalLibraryVersion="pump.medicalLibraryVersion"
      />
    </div>
  </div>
</template>

<style scoped></style>
