<script setup>
import { computed } from 'vue'
import { useSelectedButtonStore } from '@/stores/selectedButtonStore'
import { useInfusionsForPdfStore } from '@/stores/infusionsForPdfStore.js'
const infusionsForPdfStore = useInfusionsForPdfStore()
const selectedButtoneStore = useSelectedButtonStore()
import { useRouter } from 'vue-router'
const props = defineProps({
  department: String,
  floor: String,
  ward: String,
  bed: String,
  drug: String,
  totalMl: Number,
  remainingMl: Number,
  mlPerHour: Number,
  timeRunning: String,
  timeRemaining: String,
  id: String,
  softwareVersion: String,
  medicalLibraryVersion: String,
})

const remainingPercentage = computed(() => (props.remainingMl / (props.totalMl / 100)).toFixed(1))
const route = useRouter()
function routeIt(infusionID) {
  selectedButtoneStore.setPressedButtonId(infusionID)
  route.push({ name: 'Infusion-details', params: { infusionId: infusionID } })
}
function selectForPrint() {
  if (infusionsForPdfStore.containsId(props.id)) {
    infusionsForPdfStore.removeInfusion(props)
  } else {
    infusionsForPdfStore.addInfusion(props)
  }
}
const selected = computed(() => {
  return infusionsForPdfStore.containsId(props.id)
    ? 'w-[4vw] content-center  rounded-2xl bg-green-500 hover:bg-green-400 truncate rounded-full pl-2 text-ellipsis text-white border-2 border-gray-700'
    : 'w-[4vw] content-center text-gray-500 hover:text-gray-400 rounded-2xl bg-gray-500 hover:bg-gray-400 truncate rounded-full pl-2 text-ellipsis  border-2 border-gray-700'
})
const backgroundClass = computed(() => {
  switch (true) {
    case remainingPercentage.value > 80:
      return 'mr-2 4xl:w-[5VW] md:w-[15VW] w-[17vw] ml-1 bg-green-500 rounded-2xl pr-2 pl-2 text-center text-white' // Green for status > 80
    case remainingPercentage.value > 40:
      return 'mr-2 4xl:w-[5VW] md:w-[15VW] w-[17vw] ml-1 bg-yellow-500 rounded-2xl pr-2 pl-2 text-center text-white' // Yellow for status > 40
    case remainingPercentage.value > 20:
      return 'mr-2 4xl:w-[5VW] md:w-[15VW] w-[17vw] ml-1 bg-orange-500 rounded-2xl pr-2 pl-2 text-center text-white' // Orange for status > 20
    default:
      return 'mr-2 4xl:w-[5VW] md:w-[15VW] w-[17vw] ml-1 bg-red-500 rounded-2xl pr-2 pl-2 text-center text-white' // Red for status <= 20
  }
})

const notifier = computed(() => {
  if (props.id === selectedButtoneStore.getPressedButtonId) {
    if (props.remainingMl === 0) {
      return ' text-white m-2 flex 4xl:w-[46VW] xl:w-[45.5VW] md:w-[49.5VW] w-[86vw] cursor-pointer rounded-full bg-red-700 hover:bg-red-500 text-white outline-2 outline-offset-2 outline-red-800 outline-5 '
    } else if (props.mlPerHour === 0) {
      return ' text-white m-2 flex 4xl:w-[46VW] xl:w-[45.5VW] md:w-[49.5VW] w-[86vw] cursor-pointer rounded-full bg-yellow-700 hover:bg-yellow-500 text-white outline-2 outline-offset-2 outline-red-500 outline-3'
    } else {
      return ' text-white m-2 flex 4xl:w-[46VW] xl:w-[45.5VW] md:w-[49.5VW] w-[86vw] cursor-pointer rounded-full bg-gray-700 hover:bg-gray-500 outline-2 text-white outline-offset-2 outline-black active:text-white dark:bg-gray-300 dark:hover:bg-gray-400'
    }
  } else {
    if (props.remainingMl === 0) {
      return 'text-black m-2 flex 4xl:w-[46VW] xl:w-[45.5VW] md:w-[49.5VW] w-[86vw] cursor-pointer rounded-full bg-red-200 hover:bg-red-500 hover:text-white focus:bg-red-700 focus:text-white focus:outline-2 data-[state=on]:bg-red-700 focus:outline-offset-2 focus:outline-red-800 active:text-white outline-red-500 outline-5'
    } else if (props.mlPerHour === 0) {
      return 'text-black m-2 flex 4xl:w-[46VW] xl:w-[45.5VW] md:w-[49.5VW] w-[86vw] cursor-pointer rounded-full bg-yellow-200 hover:bg-yellow-500 hover:text-white focus:bg-yellow-700 data-[state=on]:bg-yellow-700 focus:text-white focus:outline-2 focus:outline-offset-2 focus:outline-red-500 active:text-white outline-orange-500 outline-3  '
    } else {
      return 'text-black m-2 flex 4xl:w-[46VW] xl:w-[45.5VW] md:w-[49.5VW] w-[86vw] cursor-pointer rounded-full bg-gray-400 hover:bg-gray-500 hover:text-white focus:bg-gray-700 data-[state=on]:bg-gray-700 focus:text-white focus:outline-2 focus:outline-offset-2 focus:outline-black active:text-white dark:bg-gray-300 dark:hover:bg-gray-400  '
    }
  }
})
</script>

<template>
  <div>
    <button @click.stop="routeIt(props.id)" :class="notifier">
      <div :class="backgroundClass" id="{{props.id}}">{{ remainingPercentage }}%</div>
      <div class="w-[25vw] truncate text-ellipsis">
        {{ props.timeRemaining }}
      </div>
      <div class="w-[25vw] truncate pl-2 text-ellipsis">
        {{ props.department }}
      </div>
      <div class="w-[25vw] truncate pl-2 text-ellipsis">
        {{ props.bed }}
      </div>
      <div @click.stop="selectForPrint" :class="selected">Print</div>
    </button>
  </div>
</template>

<style scoped></style>
