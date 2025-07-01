<script setup>
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import dummy from '@/assets/generated_data_unique_with_time.json'
import PumpStackInfusions from '@/assets/generated_data_with_pumpstacks.json'
import { ProgressIndicator, ProgressRoot } from 'radix-vue'
const infusion = ref(null)
const percentage = ref(null)
const percentageForBar = ref(null)
const allInfusions = PumpStackInfusions
const route = useRoute() // Get the current route to access the params


function findInfusionById(id) {
  for (const item of allInfusions) {
    // Regular infusion
    if (item.id === id) infusion.value = item;

    // Pumpstack
    if (Array.isArray(item.pumps)) {
      const found = item.pumps.find(pump => pump.id === id);
      if (found) infusion.value = found;
    }
  }

  return null; // Not found
}
// Fetch the infusion based on the ID
const fetchItem = (id) => {
  infusion.value = allInfusions.find((infusion) => infusion.id === id)
}
const calculatePercentage = (currentInfusion) => {
  percentage.value = parseFloat(
    ((currentInfusion.value.remainingMl / currentInfusion.value.totalMl) * 100).toFixed(1),
  )
  if (percentage.value === 0) {
    percentageForBar.value = 0.1
  } else {
    percentageForBar.value = percentage.value
  }
}
const backgroundClass = computed(() => {
  switch (true) {
    case percentage.value > 80:
      return 'bg-linear-to-l from-green-500 to-green-800 rounded-full w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]' // Green for status > 80
    case percentage.value > 40:
      return 'bg-linear-to-l from-yellow-500 to-yellow-800 rounded-full w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]' // Yellow for status > 40
    case percentage.value > 20:
      return 'bg-linear-to-l from-orange-500 to-orange-800 rounded-full w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]' // Orange for status > 20
    default:
      return 'bg-linear-to-l from-red-500 to-red-800 rounded-full w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]' // Red for status <= 20
  }
})

// Watch for changes in the route's infusionId parameter
watch(
  () => route.params.infusionId,
  (newId) => {
    findInfusionById(newId)
    calculatePercentage(infusion)
  },
)

// Initial fetch when component is mounted
onMounted(() => {
  const id = route.params.infusionId
  findInfusionById(id)
  calculatePercentage(infusion)
})
</script>

<template>
  <div class="grid 4XL:grid-cols-5 xl:grid-cols-4 grid-cols-1 static">
    <div class="xl:col-span-3 grid xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-2" v-if="infusion">
      <div class="text-center grid grid-cols-2 relative">
        <div class="bg-blue-500 text-white rounded-full m-1 p-1">ward</div>
        <div class="bg-gray-300 rounded-full m-1 p-1">{{ infusion.ward }}</div>
      </div>
      <div class="text-center grid grid-cols-2 relative">
        <div class="bg-blue-500 text-white rounded-full m-1 p-1">ml/hour:</div>
        <div class="bg-gray-300 rounded-full m-1 p-1">{{ infusion.mlPerHour }}</div>
      </div>
      <div class="text-center grid grid-cols-2 relative">
        <div class="bg-blue-500 text-white rounded-full m-1 p-1">totalMl:</div>
        <div class="bg-gray-300 rounded-full m-1 p-1">{{ infusion.totalMl }}</div>
      </div>
      <div class="text-center grid grid-cols-2 relative">
        <div class="bg-blue-500 text-white rounded-full m-1 p-1">bed:</div>
        <div class="bg-gray-300 rounded-full m-1 p-1">{{ infusion.bed }}</div>
      </div>
      <div class="text-center grid grid-cols-2 relative">
        <div class="bg-blue-500 text-white rounded-full m-1 p-1">drug:</div>
        <div class="bg-gray-300 rounded-full m-1 p-1">{{ infusion.drug }}</div>
      </div>
      <div class="text-center grid grid-cols-2 relative">
        <div class="bg-blue-500 text-white rounded-full m-1 p-1">remainingMl:</div>
        <div class="bg-gray-300 rounded-full m-1 p-1">{{ infusion.remainingMl }}</div>
      </div>
    </div>
    <div class="pl-4 m-4" v-if="percentageForBar">
      <ProgressRoot
        v-model="percentage"
        class="bg-gray-500 dark:bg-gray-300 relative overflow-hidden bg-blackA9 rounded-full w-full h-4 sm:h-[4vh] 4xl:h-[5vh]"
        style="transform: translateZ(0)"
      >
        <ProgressIndicator
          :class="backgroundClass"
          :style="`transform: translateX(-${100 - percentageForBar}%)`"
        />
        <h1
          class="absolute bottom-0 left-0 right-0 top-0 grid place-items-center text-4xl font-bold text-white md:visible invisible"
        >
          {{ percentage }}%
        </h1>
      </ProgressRoot>
    </div>
  </div>
</template>
